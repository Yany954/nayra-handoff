import type { PromoterStage } from "@/domain/entities";

/** Stage colors from design/mockups/Panel.dc.html. */
export const STAGE_STYLES: Record<PromoterStage, { dot: string; bg: string; fg: string }> = {
  prospecto: { dot: "#7A6CD1", bg: "#ECE9FA", fg: "#3F338F" },
  contactado: { dot: "#2E8C84", bg: "#E1F2F0", fg: "#1D5B55" },
  en_negociacion: { dot: "#C98A1A", bg: "#FBEFD8", fg: "#7A5108" },
  cerrado: { dot: "#2F7A45", bg: "#E3F0E6", fg: "#1F5130" },
  descartado: { dot: "#8E847B", bg: "#EFEAE3", fg: "#5A504A" },
};

// Calendar keys are read at noon UTC so the day never shifts with the viewer's timezone.
const parts = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

function dateParts(dateKey: string) {
  const all = parts.formatToParts(new Date(`${dateKey}T12:00:00Z`));
  const get = (type: Intl.DateTimeFormatPartTypes) => all.find((p) => p.type === type)?.value.replace(".", "") ?? "";
  return { day: get("day"), month: get("month"), year: get("year") };
}

/** "2026-11-25" → "25 nov". */
export function shortDate(dateKey: string): string {
  const { day, month } = dateParts(dateKey);
  return `${day} ${month}`;
}

/** "2026-11-25" → "25 nov 2026". */
export function longDate(dateKey: string): string {
  const { day, month, year } = dateParts(dateKey);
  return `${day} ${month} ${year}`;
}

/** Whole days between two YYYY-MM-DD keys. */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86_400_000);
}

/** "hace un momento", "hace 3 horas", "ayer", "hace 4 días". */
export function timeAgo(iso: string, now: Date): string {
  const minutes = Math.round((now.getTime() - Date.parse(iso)) / 60_000);
  if (minutes < 2) return "hace un momento";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours === 1 ? "hace 1 hora" : `hace ${hours} horas`;
  const days = Math.round(hours / 24);
  return days === 1 ? "ayer" : `hace ${days} días`;
}

/** "en 2 días", "en 5 horas", "pronto". */
export function timeUntil(iso: string, now: Date): string {
  const hours = Math.round((Date.parse(iso) - now.getTime()) / 3_600_000);
  if (hours <= 1) return "pronto";
  if (hours < 24) return `en ${hours} horas`;
  const days = Math.round(hours / 24);
  return days === 1 ? "mañana" : `en ${days} días`;
}
