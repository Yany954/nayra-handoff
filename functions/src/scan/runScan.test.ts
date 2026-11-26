import { describe, expect, it } from "vitest";
import { FixtureExtractor, FixtureSearch, type EventExtractor, type SearchProvider } from "./providers";
import { EMPTY_STATE, runScan, type ScanState, type ScanStore } from "./runScan";
import type { DiscoveredEventDoc } from "./schema";

function memoryStore(): ScanStore & { events: Map<string, DiscoveredEventDoc>; state: ScanState } {
  const store = {
    events: new Map<string, DiscoveredEventDoc>(),
    state: EMPTY_STATE,
    getState: async () => store.state,
    saveState: async (s: ScanState) => {
      store.state = s;
    },
    existingHashes: async (hashes: string[]) => new Set(hashes.filter((h) => store.events.has(h))),
    saveEvents: async (events: DiscoveredEventDoc[]) => {
      for (const e of events) store.events.set(e.hash, e);
    },
  };
  return store;
}

const now = new Date("2026-11-25T15:00:00Z");

describe("runScan", () => {
  it("adds the fixture events once, sorted by relevance, and never twice", async () => {
    const store = memoryStore();
    const deps = { search: new FixtureSearch(), extractor: new FixtureExtractor(), store };
    const first = await runScan(deps, now, "manual");
    expect(first.added).toBe(4);
    expect(first.dropped).toBe(1); // the "ignore previous instructions" result never becomes an event
    const relevances = [...store.events.values()].map((e) => e.relevance);
    expect(relevances).toEqual([...relevances].sort((a, b) => b - a));
    expect([...store.events.values()].every((e) => e.status === "pending" && e.url.startsWith("https://"))).toBe(true);

    const second = await runScan(deps, new Date("2026-11-28T15:00:00Z"), "schedule");
    expect(second.added).toBe(0);
    expect(store.events.size).toBe(4);
    expect(second.nextQueryOffset).toBe(40); // rotation moves on: 20 queries per run
  });

  it("drops events outside the Caribbean region even if the model returns them", async () => {
    const store = memoryStore();
    const farAway: EventExtractor = {
      extract: async (results) => ({
        events: results.slice(0, 1).map((r) => ({
          name: "Concurso de Canto Voces Nuevas", municipality: "Yumbo", department: "Valle del Cauca",
          startDate: null, endDate: null, datesText: "", type: "concurso" as const, genres: [], contact: null,
          url: r.url, sourceName: "IMCY", openCall: true, deadline: null, summary: "",
        })),
        dropped: 0, inputTokens: 0, outputTokens: 0,
      }),
    };
    const state = await runScan({ search: new FixtureSearch(), extractor: farAway, store }, now, "manual");
    expect(state.added).toBe(0);
    expect(state.dropped).toBe(1);
  });

  it("records provider errors without stopping the run", async () => {
    const store = memoryStore();
    const failing: SearchProvider = { search: async () => { throw new Error("429 Too Many Requests"); } };
    const state = await runScan({ search: failing, extractor: new FixtureExtractor(), store }, now, "schedule");
    expect(state.added).toBe(0);
    expect(state.errors.length).toBeGreaterThan(0);
    expect(state.errors[0]).toContain("429");
    expect(store.state.lastRunAt).toBe(now.toISOString());
  });

  it("stops extracting once the token budget is spent", async () => {
    const store = memoryStore();
    let calls = 0;
    const many: SearchProvider = {
      search: async (query) => Array.from({ length: 5 }, (_, i) => ({ title: query, url: `https://example.org/${encodeURIComponent(query)}/${i}`, content: "" })),
    };
    const greedy: EventExtractor = {
      extract: async () => {
        calls++;
        return { events: [], dropped: 0, inputTokens: 70_000, outputTokens: 100 };
      },
    };
    const state = await runScan({ search: many, extractor: greedy, store }, now, "manual");
    expect(calls).toBe(1);
    expect(state.errors.some((e) => e.includes("tope de tokens"))).toBe(true);
  });
});
