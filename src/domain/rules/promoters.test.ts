import { describe, expect, it } from "vitest";
import type { DiscoveredEvent, Promoter } from "@/domain/entities";
import { addDays, changeStage, dueFollowUps, summarizePanel } from "@/domain/rules/promoters";

const base: Promoter = {
  id: "p1",
  type: "Festival",
  name: "Festival",
  city: "Pailitas",
  contact: "",
  socialOrWeb: "",
  stage: "prospecto",
  lastContactAt: null,
  nextFollowUpAt: null,
  eventDate: null,
  notes: "",
  source: "manual",
  createdAt: "2026-11-01T00:00:00.000Z",
};

const found = (over: Partial<DiscoveredEvent>): DiscoveredEvent => ({
  id: "e", name: "Evento", municipality: "X", department: "Cesar", dates: "", startDate: null, type: "festival",
  contact: null, url: "", sourceName: "", openCall: false, deadline: null, note: "", relevance: 0.5,
  status: "pending", foundAt: "", ...over,
});

describe("promoter rules", () => {
  it("adds days across month and year boundaries", () => {
    expect(addDays("2026-11-28", 7)).toBe("2026-12-05");
    expect(addDays("2026-12-29", 7)).toBe("2027-01-05");
  });

  it("schedules a follow-up a week after contacting", () => {
    const next = changeStage(base, "contactado", "2026-11-25");
    expect(next).toMatchObject({ stage: "contactado", lastContactAt: "2026-11-25", nextFollowUpAt: "2026-12-02" });
  });

  it("clears the follow-up when closing or discarding", () => {
    const contacted = changeStage(base, "contactado", "2026-11-25");
    expect(changeStage(contacted, "cerrado", "2026-11-26").nextFollowUpAt).toBeNull();
    expect(changeStage(contacted, "descartado", "2026-11-26").nextFollowUpAt).toBeNull();
  });

  it("lists due follow-ups only for active stages, oldest first", () => {
    const promoters: Promoter[] = [
      { ...base, id: "late", stage: "contactado", nextFollowUpAt: "2026-11-20" },
      { ...base, id: "today", stage: "en_negociacion", nextFollowUpAt: "2026-11-25" },
      { ...base, id: "future", stage: "contactado", nextFollowUpAt: "2026-11-30" },
      { ...base, id: "closed", stage: "cerrado", nextFollowUpAt: "2026-11-01" },
    ];
    expect(dueFollowUps(promoters, "2026-11-25").map((p) => p.id)).toEqual(["late", "today"]);
  });

  it("summarizes the panel home", () => {
    const summary = summarizePanel(
      {
        promoters: [base, { ...base, id: "p2", stage: "cerrado" }],
        requests: [
          { id: "r1", name: "A", eventType: "Boda", eventDate: "2027-01-01", municipality: "X", status: "nuevo" },
          { id: "r2", name: "B", eventType: "Boda", eventDate: "2027-01-01", municipality: "X", status: "revisado" },
        ],
        events: [
          found({ id: "e1", relevance: 0.4 }),
          found({ id: "e2", relevance: 0.9 }),
          found({ id: "e3", relevance: 1, status: "approved" }),
        ],
      },
      "2026-11-25",
    );
    expect(summary.stageCounts.find((s) => s.stage === "cerrado")).toMatchObject({ count: 1, label: "Cerrado" });
    expect(summary.newRequests.map((r) => r.id)).toEqual(["r1"]);
    expect(summary.pendingEvents.map((e) => e.id)).toEqual(["e2", "e1"]);
  });
});
