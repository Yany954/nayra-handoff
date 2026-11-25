import type { PromoterStage } from "@/domain/entities";

/** Stage colors from design/mockups/Panel.dc.html. */
export const STAGE_STYLES: Record<PromoterStage, { dot: string; bg: string; fg: string }> = {
  prospecto: { dot: "#7A6CD1", bg: "#ECE9FA", fg: "#3F338F" },
  contactado: { dot: "#2E8C84", bg: "#E1F2F0", fg: "#1D5B55" },
  en_negociacion: { dot: "#C98A1A", bg: "#FBEFD8", fg: "#7A5108" },
  cerrado: { dot: "#2F7A45", bg: "#E3F0E6", fg: "#1F5130" },
  descartado: { dot: "#8E847B", bg: "#EFEAE3", fg: "#5A504A" },
};

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** "2026-11-25" → "25 nov". */
export function shortDate(dateKey: string): string {
  const [, month, day] = dateKey.split("-");
  return `${Number(day)} ${MONTHS[Number(month) - 1] ?? ""}`;
}

/** Whole days between two YYYY-MM-DD keys. */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000);
}
