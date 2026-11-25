import type { GalleryPhoto, Show } from "@/domain/entities";
import type { AdminRepositories, NewGalleryPhoto, ShowInput } from "@/domain/repositories";
import { summarizePanel, type PanelSummary } from "@/domain/rules/promoters";
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
