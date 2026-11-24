import type { Format } from "@/domain/entities";

export type FormatsSummary = {
  count: number;
  durationRange: string;
  durations: string;
  members: string;
  names: string;
};

export function formatDuration(format: Pick<Format, "durationMin" | "durationMax">): string {
  return format.durationMin === format.durationMax
    ? `${format.durationMin} min`
    : `${format.durationMin}–${format.durationMax} min`;
}

function joinWithOr(values: readonly number[]): string {
  if (values.length <= 1) return values.join("");
  return `${values.slice(0, -1).join(", ")} o ${values[values.length - 1]}`;
}

export function summarizeFormats(formats: readonly Format[]): FormatsSummary {
  if (formats.length === 0) {
    return { count: 0, durationRange: "", durations: "", members: "", names: "" };
  }
  const durations = [
    ...new Set(formats.flatMap((f) => [f.durationMin, f.durationMax])),
  ].sort((a, b) => a - b);
  const members = formats.map((f) => f.membersCount);
  const minMembers = Math.min(...members);
  const maxMembers = Math.max(...members);

  return {
    count: formats.length,
    durationRange: `${durations[0]}–${durations[durations.length - 1]}`,
    durations: `${joinWithOr(durations)} min`,
    members:
      minMembers === maxMembers
        ? `${minMembers} según formato`
        : `${minMembers} a ${maxMembers} según formato`,
    names: [...formats]
      .sort((a, b) => a.order - b.order)
      .map((f) => f.shortName)
      .join(" · "),
  };
}
