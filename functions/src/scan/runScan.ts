import { allQueries, eventHash, inWindow, relevance, rotateQueries } from "./rules";
import type { EventExtractor, SearchProvider, SearchResult } from "./providers";
import type { DiscoveredEventDoc, ExtractedEvent } from "./schema";

/** Spend guards per run (SPEC §5), on top of the OpenAI account limit. */
export const LIMITS = {
  // 211 queries (Cesar + all of La Guajira + regions) / 20 per run ≈ a full pass every ~month.
  queries: 20,
  resultsPerQuery: 5,
  resultsPerExtraction: 10,
  maxInputTokens: 60_000,
  maxNewEvents: 25,
} as const;

export type ScanState = {
  lastRunAt: string | null;
  nextQueryOffset: number;
  lastTrigger: "schedule" | "manual" | null;
  queries: number;
  results: number;
  extracted: number;
  added: number;
  dropped: number;
  inputTokens: number;
  outputTokens: number;
  errors: string[];
};

export const EMPTY_STATE: ScanState = {
  lastRunAt: null, nextQueryOffset: 0, lastTrigger: null, queries: 0, results: 0,
  extracted: 0, added: 0, dropped: 0, inputTokens: 0, outputTokens: 0, errors: [],
};

export interface ScanStore {
  getState(): Promise<ScanState>;
  saveState(state: ScanState): Promise<void>;
  /** Hashes that already exist (pending, approved or discarded): never shown twice. */
  existingHashes(hashes: string[]): Promise<Set<string>>;
  saveEvents(events: DiscoveredEventDoc[]): Promise<void>;
}

export type ScanDeps = { search: SearchProvider; extractor: EventExtractor; store: ScanStore };

export function bogotaDate(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

const chunks = <T>(items: T[], size: number) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, i * size + size));

export async function runScan(deps: ScanDeps, now: Date, trigger: ScanState["lastTrigger"]): Promise<ScanState> {
  const today = bogotaDate(now);
  const previous = await deps.store.getState();
  const errors: string[] = [];

  // Look a season ahead: in November the useful year is next year's.
  const targetYear = new Date(Date.parse(`${today}T12:00:00Z`) + 90 * 86_400_000).getUTCFullYear();
  const { batch, nextOffset } = rotateQueries(allQueries(targetYear), previous.nextQueryOffset, LIMITS.queries);

  const byUrl = new Map<string, SearchResult>();
  for (const query of batch) {
    try {
      for (const result of await deps.search.search(query, LIMITS.resultsPerQuery)) byUrl.set(result.url, result);
    } catch (error) {
      errors.push(`Búsqueda «${query}»: ${(error as Error).message}`.slice(0, 200));
    }
  }

  let inputTokens = 0;
  let outputTokens = 0;
  let dropped = 0;
  const extracted: ExtractedEvent[] = [];
  for (const group of chunks([...byUrl.values()], LIMITS.resultsPerExtraction)) {
    if (inputTokens >= LIMITS.maxInputTokens) {
      errors.push("Se alcanzó el tope de tokens de esta ejecución; el resto queda para la próxima.");
      break;
    }
    try {
      const out = await deps.extractor.extract(group, today);
      extracted.push(...out.events);
      dropped += out.dropped;
      inputTokens += out.inputTokens;
      outputTokens += out.outputTokens;
    } catch (error) {
      errors.push(`Extracción: ${(error as Error).message}`.slice(0, 200));
    }
  }

  // Window, hash and in-run dedupe, then skip anything seen in earlier runs.
  const fallbackYear = Number(today.slice(0, 4));
  const candidates = new Map<string, ExtractedEvent>();
  for (const event of extracted) {
    if (!inWindow(event, today)) continue;
    const hash = eventHash(event, fallbackYear);
    if (!candidates.has(hash)) candidates.set(hash, event);
  }
  const known = await deps.store.existingHashes([...candidates.keys()]);
  const fresh: DiscoveredEventDoc[] = [...candidates.entries()]
    .filter(([hash]) => !known.has(hash))
    .map(([hash, { datesText, summary, ...event }]) => ({
      ...event,
      dates: datesText || "Fecha por confirmar",
      note: summary,
      relevance: relevance({ ...event, summary }),
      status: "pending" as const,
      hash,
      foundAt: now.toISOString(),
    }))
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, LIMITS.maxNewEvents);
  await deps.store.saveEvents(fresh);

  const state: ScanState = {
    lastRunAt: now.toISOString(),
    nextQueryOffset: nextOffset,
    lastTrigger: trigger,
    queries: batch.length,
    results: byUrl.size,
    extracted: extracted.length,
    added: fresh.length,
    dropped,
    inputTokens,
    outputTokens,
    errors: errors.slice(0, 10),
  };
  await deps.store.saveState(state);
  return state;
}
