import type { Show } from "@/domain/entities";

const MONTHS = [
  "ENE",
  "FEB",
  "MAR",
  "ABR",
  "MAY",
  "JUN",
  "JUL",
  "AGO",
  "SEP",
  "OCT",
  "NOV",
  "DIC",
];

/** Calendar day in Colombia, so a show stays "upcoming" through its local date. */
export function toBogotaDateKey(instant: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

export function upcomingShows(shows: readonly Show[], today: string): Show[] {
  return shows
    .filter((s): s is Show & { date: string } => s.date !== null && s.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** What the public sees: only upcoming dates the manager has confirmed. */
export function publicUpcomingShows(shows: readonly Show[], today: string): Show[] {
  return upcomingShows(shows, today).filter((s) => s.status === "confirmado");
}

/** Most recent dated past show; undated shows are treated as past, last resort. */
export function latestPastShow(
  shows: readonly Show[],
  today: string,
): Show | null {
  const past = shows
    .filter((s): s is Show & { date: string } => s.date !== null && s.date < today)
    .sort((a, b) => b.date.localeCompare(a.date));
  return past[0] ?? shows.find((s) => s.date === null) ?? null;
}

export function formatShowDate(isoDate: string): { month: string; day: string } {
  const [, month, day] = isoDate.split("-");
  return { month: MONTHS[Number(month) - 1] ?? "", day };
}
