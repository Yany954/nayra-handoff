import { describe, expect, it } from "vitest";
import { submitBooking } from "@/application/booking";
import type { BookingRepositories } from "@/domain/repositories";
import type { BookingInput } from "@/domain/rules/booking";

const input: BookingInput = {
  name: "Laura", phone: "3001234567", email: null, eventType: "Festival / feria", eventDate: "2027-01-10",
  municipality: "Curumaní", message: "Festival de fin de año.",
};

describe("submitBooking", () => {
  it("creates the request and its prospect, and stops the 6th in an hour", async () => {
    let hits = 0;
    const created: unknown[] = [];
    const repos: BookingRepositories = {
      hitRateLimit: async () => ++hits,
      createBookingRequest: async (request, promoter) => {
        created.push({ request, promoter });
        return "r1";
      },
    };
    const now = new Date("2026-11-26T15:00:00Z");
    for (let i = 0; i < 5; i++) expect(await submitBooking(repos, input, "k", now)).toBe("ok");
    expect(await submitBooking(repos, input, "k", now)).toBe("rate_limited");
    expect(created).toHaveLength(5);
    expect(created[0]).toMatchObject({ request: { status: "nuevo" }, promoter: { source: "web_form", stage: "prospecto" } });
  });
});
