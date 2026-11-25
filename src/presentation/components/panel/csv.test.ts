import { describe, expect, it } from "vitest";
import { toCsv } from "@/presentation/components/panel/csv";

describe("CSV export", () => {
  it("quotes separators and neutralizes formulas", () => {
    const csv = toCsv(["Nombre", "Notas"], [["Hotel; Spa", "=HYPERLINK(\"x\")"], ["Boda", null]]);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv).toContain('"Hotel; Spa"');
    expect(csv).toContain(`"'=HYPERLINK(""x"")"`);
    expect(csv.endsWith("Boda;")).toBe(true);
  });
});
