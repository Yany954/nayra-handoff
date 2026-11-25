import {
  PROMOTER_STAGES,
  type BookingRequest,
  type DiscoveredEvent,
  type Promoter,
  type PromoterStage,
} from "@/domain/entities";

export const STAGE_LABELS: Record<PromoterStage, string> = {
  prospecto: "Prospecto",
  contactado: "Contactado",
  en_negociacion: "En negociación",
  cerrado: "Cerrado",
  descartado: "Descartado",
};

/** Days between a contact and its follow-up (SPEC §4). */
export const FOLLOW_UP_DAYS = 7;

const ACTIVE_STAGES: ReadonlySet<PromoterStage> = new Set(["contactado", "en_negociacion"]);

/** Adds days to a YYYY-MM-DD key without timezone drift. */
export function addDays(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function countByStage(promoters: readonly Promoter[]): { stage: PromoterStage; count: number }[] {
  return PROMOTER_STAGES.map((stage) => ({
    stage,
    count: promoters.filter((p) => p.stage === stage).length,
  }));
}

export type DuePromoter = Promoter & { nextFollowUpAt: string };

/** Follow-ups due today or overdue, oldest first; closed or discarded promoters never nag. */
export function dueFollowUps(promoters: readonly Promoter[], today: string): DuePromoter[] {
  return promoters
    .filter(
      (p): p is DuePromoter =>
        ACTIVE_STAGES.has(p.stage) && p.nextFollowUpAt !== null && p.nextFollowUpAt <= today,
    )
    .sort((a, b) => a.nextFollowUpAt.localeCompare(b.nextFollowUpAt));
}

/** Moving to "contactado" records the contact and schedules the follow-up. */
export function changeStage(promoter: Promoter, stage: PromoterStage, today: string): Promoter {
  if (stage === "contactado") {
    return { ...promoter, stage, lastContactAt: today, nextFollowUpAt: addDays(today, FOLLOW_UP_DAYS) };
  }
  if (stage === "cerrado" || stage === "descartado") {
    return { ...promoter, stage, nextFollowUpAt: null };
  }
  return { ...promoter, stage };
}

export type PanelSummary = {
  stageCounts: { stage: PromoterStage; label: string; count: number }[];
  dueFollowUps: DuePromoter[];
  newRequests: BookingRequest[];
  pendingEvents: DiscoveredEvent[];
};

export function summarizePanel(
  data: { promoters: Promoter[]; requests: BookingRequest[]; events: DiscoveredEvent[] },
  today: string,
): PanelSummary {
  return {
    stageCounts: countByStage(data.promoters).map((c) => ({ ...c, label: STAGE_LABELS[c.stage] })),
    dueFollowUps: dueFollowUps(data.promoters, today),
    newRequests: data.requests.filter((r) => r.status === "nuevo"),
    pendingEvents: data.events
      .filter((e) => e.status === "pending")
      .sort((a, b) => b.relevance - a.relevance),
  };
}
