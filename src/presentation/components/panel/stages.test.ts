import { describe, expect, it } from "vitest";
import { daysBetween, longDate, shortDate } from "@/presentation/components/panel/stages";

describe("panel date labels", () => {
  it("formats calendar keys in Spanish without timezone drift", () => {
    expect(shortDate("2026-12-07")).toBe("7 dic");
    expect(longDate("2027-01-01")).toBe("1 ene 2027");
    expect(daysBetween("2026-11-23", "2026-11-25")).toBe(2);
  });
});
