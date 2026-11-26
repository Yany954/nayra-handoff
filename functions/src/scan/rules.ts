import { createHash } from "node:crypto";
import { CARIBBEAN, CESAR, CESAR_MUNICIPALITIES, GUAJIRA_MUNICIPALITIES, SECOND, normalize } from "./places";
import type { EventType, ExtractedEvent } from "./schema";

// ---- Queries ----

const TYPES = ["festival", "feria", "fiestas patronales", "concurso de voces", "convocatoria artistas"];
const GENRES = ["vallenato", "tambora", "ranchera"];
const REGIONS = ["La Guajira", "El Banco Magdalena", "sur de Bolívar"];

/** Every query the scan can run, in a fixed order so rotation is deterministic. */
export function allQueries(year: number): string[] {
  // Cesar and La Guajira town by town; the rest of the second circle as regions.
  const places = [...new Set([...CESAR_MUNICIPALITIES, ...GUAJIRA_MUNICIPALITIES, ...REGIONS])];
  const out: string[] = [];
  for (const place of places) {
    for (const type of TYPES) out.push(`${type} ${place} ${year}`);
  }
  for (const genre of GENRES) out.push(`festival de ${genre} Cesar ${year}`, `concurso de ${genre} convocatoria ${year}`);
  return out;
}

/** A window of `count` queries starting at `offset`, wrapping around; returns the next offset. */
export function rotateQueries(queries: readonly string[], offset: number, count: number) {
  if (queries.length === 0) return { batch: [], nextOffset: 0 };
  const start = ((offset % queries.length) + queries.length) % queries.length;
  const batch = Array.from({ length: Math.min(count, queries.length) }, (_, i) => queries[(start + i) % queries.length]);
  return { batch, nextOffset: (start + batch.length) % queries.length };
}

// ---- Date window ----

const DAY = 86_400_000;
const dateKey = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/** SPEC §5: from today+14 days to today+6 months; undated only if there is an open call. */
export function inWindow(event: Pick<ExtractedEvent, "startDate" | "openCall" | "deadline">, today: string): boolean {
  const base = Date.parse(`${today}T12:00:00Z`);
  if (event.deadline && event.deadline < today) return false;
  if (!event.startDate) return event.openCall;
  return event.startDate >= dateKey(base + 14 * DAY) && event.startDate <= dateKey(base + 183 * DAY);
}

// ---- Relevance (deterministic, explainable) ----

const TYPE_SCORE: Record<EventType, number> = {
  festival: 1, concurso: 0.9, feria: 0.8, fiestas_patronales: 0.8, alcaldia_casa_cultura: 0.7, corporativo: 0.5, hotel: 0.5, otro: 0.3,
};
const GENRE_WORDS = /vallenat|tambora|ranchera|cantadora|guacherna|folcl|acordeon/;

export function proximity(municipality: string, department: string): number {
  const m = normalize(municipality);
  const d = normalize(department);
  if (CESAR.has(m) || d === "cesar") return 1;
  if (SECOND.has(m) || d === "la guajira") return 0.7;
  if (CARIBBEAN.has(d)) return 0.4;
  return 0.1;
}

export function relevance(event: Pick<ExtractedEvent, "municipality" | "department" | "type" | "genres" | "name" | "summary" | "openCall">): number {
  const genreText = normalize([...event.genres, event.name, event.summary].join(" "));
  const score =
    0.5 * proximity(event.municipality, event.department) +
    0.25 * (GENRE_WORDS.test(genreText) ? 1 : 0.4) +
    0.25 * TYPE_SCORE[event.type] +
    (event.openCall ? 0.1 : 0);
  return Math.round(Math.min(1, score) * 100) / 100;
}

// ---- Dedupe ----

/** Same festival, same year → same hash, whatever the source or the edition number in the title. */
export function eventHash(event: Pick<ExtractedEvent, "name" | "startDate" | "deadline">, fallbackYear: number): string {
  const name = normalize(event.name)
    .replace(/\b(19|20)\d{2}\b/g, "")
    .replace(/\b\d+\s*(a|o|er|ra|va|ta)?\b/g, "")
    .replace(/\b(edicion|version)\b/g, "")
    // Roman edition numbers (I–XXXIX): "XV Festival…" and "Festival…" are the same event.
    .replace(/\b(x{1,3}(ix|iv|v?i{0,3})|ix|iv|v?i{1,3}|v)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const year = (event.startDate ?? event.deadline)?.slice(0, 4) ?? String(fallbackYear);
  return createHash("sha256").update(`${name}|${year}`).digest("hex").slice(0, 32);
}
