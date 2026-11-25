import type { GalleryPhoto, Promoter, Show } from "@/domain/entities";
import type { AdminRepositories, NewGalleryPhoto, PromoterInput, ShowInput } from "@/domain/repositories";
import { changeStage, summarizePanel, type PanelSummary } from "@/domain/rules/promoters";
import { latestPastShow, publicUpcomingShows } from "@/domain/rules/shows";

export async function getPanelHome(repos: AdminRepositories, today: string): Promise<PanelSummary> {
  const [promoters, requests, events] = await Promise.all([
    repos.listPromoters(),
    repos.listBookingRequests(),
    repos.listDiscoveredEvents(),
  ]);
  return summarizePanel({ promoters, requests, events }, today);
}

export type ShowRow = Show & {
  /** How the public site uses this show today. */
  publicRole: "ultimo" | "proximo" | "oculto_por_confirmar" | "pasado";
};

/** Upcoming first (soonest on top), then past (newest first), then undated. */
export async function getShowsAdmin(repos: AdminRepositories, today: string) {
  const shows = await repos.listShows();
  const latestId = latestPastShow(shows, today)?.id;
  const publicUpcoming = new Set(publicUpcomingShows(shows, today).map((s) => s.id));

  const rank = (s: Show) => (s.date === null ? 2 : s.date >= today ? 0 : 1);
  const sorted = [...shows].sort((a, b) => {
    const byRank = rank(a) - rank(b);
    if (byRank !== 0 || a.date === null || b.date === null) return byRank;
    return rank(a) === 0 ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
  });

  const rows: ShowRow[] = sorted.map((show) => ({
    ...show,
    publicRole:
      show.id === latestId
        ? "ultimo"
        : publicUpcoming.has(show.id)
          ? "proximo"
          : show.date !== null && show.date >= today
            ? "oculto_por_confirmar"
            : "pasado",
  }));
  return { rows };
}

export function saveShow(repos: AdminRepositories, id: string | null, input: ShowInput) {
  return id ? repos.updateShow(id, input) : repos.createShow(input);
}

export function addGalleryPhoto(repos: AdminRepositories, photo: NewGalleryPhoto) {
  return repos.addGalleryPhoto(photo);
}

/** Swaps a photo with its neighbour; a no-op at either end. */
export async function moveGalleryPhoto(repos: AdminRepositories, id: string, direction: -1 | 1) {
  const ids = (await repos.listGallery()).map((p: GalleryPhoto) => p.id);
  const index = ids.indexOf(id);
  const target = index + direction;
  if (index === -1 || target < 0 || target >= ids.length) return;
  [ids[index], ids[target]] = [ids[target], ids[index]];
  await repos.reorderGallery(ids);
}

// ---- Promoters ----

/** Applies the stage rules (SPEC §4) on top of what the manager typed. */
export function mergePromoter(existing: Promoter, input: PromoterInput, today: string): Promoter {
  const merged: Promoter = { ...existing, ...input, stage: existing.stage };
  if (input.stage === existing.stage) return merged;
  const staged = changeStage(merged, input.stage, today);
  // A follow-up date the manager typed herself wins over the automatic +7 days.
  const typedFollowUp = input.nextFollowUpAt !== existing.nextFollowUpAt;
  return typedFollowUp && staged.nextFollowUpAt !== null ? { ...staged, nextFollowUpAt: input.nextFollowUpAt } : staged;
}

export async function savePromoter(
  repos: AdminRepositories,
  id: string | null,
  input: PromoterInput,
  today: string,
  now: Date,
): Promise<void> {
  if (id) {
    const existing = await repos.getPromoter(id);
    if (!existing) throw new Error("Promoter not found");
    await repos.updatePromoter(mergePromoter(existing, input, today));
    return;
  }
  const draft: Promoter = {
    ...input,
    id: "",
    stage: "prospecto",
    source: "manual",
    createdAt: now.toISOString(),
    lastContactAt: null,
  };
  const { id: _unused, ...created } = mergePromoter(draft, input, today);
  await repos.createPromoter(created);
}

/** A closed deal becomes a public show (confirmed) with one click. */
export async function publishShowFromPromoter(
  repos: AdminRepositories,
  id: string,
): Promise<"ok" | "not_closed" | "already_published"> {
  const promoter = await repos.getPromoter(id);
  if (!promoter || promoter.stage !== "cerrado") return "not_closed";
  // A second click must not create a duplicate date on the public site.
  const shows = await repos.listShows();
  if (shows.some((s) => s.venue === promoter.name && s.date === promoter.eventDate)) return "already_published";
  await repos.createShow({
    venue: promoter.name,
    city: promoter.city || "Por definir",
    date: promoter.eventDate,
    status: "confirmado",
  });
  return "ok";
}

/** Follow-ups first (oldest due on top), then the rest by name. */
export function sortPromoters(promoters: readonly Promoter[]): Promoter[] {
  return [...promoters].sort((a, b) => {
    if (a.nextFollowUpAt && b.nextFollowUpAt) return a.nextFollowUpAt.localeCompare(b.nextFollowUpAt);
    if (a.nextFollowUpAt) return -1;
    if (b.nextFollowUpAt) return 1;
    return a.name.localeCompare(b.name, "es");
  });
}

/** Next free position for a new item in an ordered list. */
export function nextOrder(items: readonly { order: number }[]): number {
  return items.reduce((max, item) => Math.max(max, item.order), 0) + 1;
}

/** After the manager sends a pitch: «Contactado» and a follow-up in 7 days (SPEC §4). */
export async function markPitchSent(repos: AdminRepositories, id: string, today: string): Promise<Promoter | null> {
  const promoter = await repos.getPromoter(id);
  if (!promoter) return null;
  const contacted = changeStage(promoter, "contactado", today);
  await repos.updatePromoter(contacted);
  return contacted;
}
