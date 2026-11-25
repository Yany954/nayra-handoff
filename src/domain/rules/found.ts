import type { DiscoveredEvent, Promoter } from "@/domain/entities";

/** Event types from the scan → the promoter types the panel uses. */
export const FOUND_TYPE_LABELS: Record<string, string> = {
  festival: "Festival",
  concurso: "Concurso",
  feria: "Feria",
  fiestas_patronales: "Fiestas patronales",
  alcaldia_casa_cultura: "Alcaldía / Casa de cultura",
  corporativo: "Corporativo",
  hotel: "Hotel",
  otro: "Otro",
};

/** What «Agregar como Prospecto» creates: source auto, stage prospecto, with where it came from. */
export function promoterFromFound(event: DiscoveredEvent, now: Date): Omit<Promoter, "id"> {
  const notes = [
    event.note,
    event.openCall ? `Convocatoria abierta${event.deadline ? ` hasta ${event.deadline}` : ""}.` : "",
    `Fechas: ${event.dates}.`,
    event.sourceName || event.url ? `Fuente: ${[event.sourceName, event.url].filter(Boolean).join(" — ")}` : "",
  ].filter(Boolean);
  return {
    type: FOUND_TYPE_LABELS[event.type] ?? "Otro",
    name: event.name,
    city: [event.municipality, event.department].filter(Boolean).join(", "),
    contact: event.contact ?? "",
    socialOrWeb: event.url,
    stage: "prospecto",
    lastContactAt: null,
    nextFollowUpAt: null,
    eventDate: event.startDate,
    notes: notes.join("\n"),
    source: "auto",
    createdAt: now.toISOString(),
  };
}

export const SCAN_EVERY_HOURS = 72;
export const MANUAL_SCAN_COOLDOWN_MINUTES = 30;
export const MANUAL_SCANS_PER_DAY = 4;

/** «Buscar ahora» limits: protects the free search credits and the OpenAI budget. */
export function canRequestScan(
  lastRunAt: string | null,
  requestsToday: number,
  now: Date,
): { ok: true } | { ok: false; reason: string } {
  if (requestsToday >= MANUAL_SCANS_PER_DAY) {
    return { ok: false, reason: `Ya buscaste ${MANUAL_SCANS_PER_DAY} veces en las últimas 24 horas. Vuelve a intentarlo más tarde.` };
  }
  if (lastRunAt) {
    const minutes = Math.ceil(MANUAL_SCAN_COOLDOWN_MINUTES - (now.getTime() - Date.parse(lastRunAt)) / 60_000);
    if (minutes > 0) return { ok: false, reason: `La última búsqueda fue hace poco. Puedes buscar de nuevo en ${minutes} min.` };
  }
  return { ok: true };
}
