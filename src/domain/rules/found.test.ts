import { describe, expect, it } from "vitest";
import type { DiscoveredEvent } from "@/domain/entities";
import { canRequestScan, promoterFromFound } from "@/domain/rules/found";

const event: DiscoveredEvent = {
  id: "h1", name: "Festival de la Tambora", municipality: "Gamarra", department: "Cesar", dates: "Ene 2027",
  startDate: "2027-01-20", type: "festival", contact: "Casa de la Cultura", url: "https://example.org/x",
  sourceName: "Prensa regional", openCall: true, deadline: "2027-01-10", note: "Muestra de cantadoras.",
  relevance: 0.92, status: "pending", foundAt: "",
};

describe("found events", () => {
  it("turns an approved event into an auto prospect with its source in the notes", () => {
    const promoter = promoterFromFound(event, new Date("2026-11-25T15:00:00Z"));
    expect(promoter).toMatchObject({
      type: "Festival", name: "Festival de la Tambora", city: "Gamarra, Cesar", contact: "Casa de la Cultura",
      socialOrWeb: "https://example.org/x", stage: "prospecto", source: "auto", eventDate: "2027-01-20",
    });
    expect(promoter.notes).toContain("Convocatoria abierta hasta 2027-01-10.");
    expect(promoter.notes).toContain("Fuente: Prensa regional — https://example.org/x");
  });

  it("limits «Buscar ahora» to once every 30 minutes and 4 times a day", () => {
    const now = new Date("2026-11-25T15:00:00Z");
    expect(canRequestScan(null, 0, now)).toEqual({ ok: true });
    expect(canRequestScan("2026-11-25T14:50:00Z", 0, now)).toMatchObject({ ok: false, reason: expect.stringContaining("20 min") });
    expect(canRequestScan("2026-11-25T14:00:00Z", 0, now)).toEqual({ ok: true });
    expect(canRequestScan("2026-11-25T10:00:00Z", 4, now)).toMatchObject({ ok: false });
  });
});
