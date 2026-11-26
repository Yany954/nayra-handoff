import { describe, expect, it } from "vitest";
import { bookingFormSchema, validateBooking } from "@/infrastructure/schemas/booking";
import { fieldErrorsOf } from "@/infrastructure/schemas/panel";

const valid = {
  name: "Laura", phone: "300 123 4567", email: "", eventType: "Festival / feria", eventDate: "2027-01-10",
  municipality: "Curumaní", message: "Festival de fin de año en el parque.", consent: "on",
};
const schema = bookingFormSchema("2026-11-26");

describe("booking form schema", () => {
  it("accepts a valid request and normalizes empty optional fields to null", () => {
    expect(schema.parse(valid)).toMatchObject({ phone: "300 123 4567", email: null });
  });

  it("explains each problem next to its field", () => {
    const result = schema.safeParse({ ...valid, phone: "", eventDate: "2026-11-01", consent: undefined });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = fieldErrorsOf(result.error);
      expect(errors.eventDate).toBe("Elige una fecha de hoy en adelante.");
      expect(errors.consent).toBe("Necesitamos tu autorización para responderte.");
    }
    const noContact = schema.safeParse({ ...valid, phone: "", email: "" });
    expect(noContact.success).toBe(false);
    if (!noContact.success) expect(fieldErrorsOf(noContact.error).phone).toContain("teléfono o un correo");
  });

  it("reports the missing contact together with every other error", () => {
    const result = validateBooking({ name: "Laura", message: "corto", phone: "", email: "" }, "2026-11-26");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.fieldErrors)).toEqual(expect.arrayContaining(["phone", "eventDate", "municipality", "message", "consent"]));
      expect(result.fieldErrors.phone).toContain("teléfono o un correo");
    }
  });

  it("rejects unknown event types and bad emails", () => {
    expect(schema.safeParse({ ...valid, eventType: "<script>" }).success).toBe(false);
    expect(schema.safeParse({ ...valid, email: "no-es-correo" }).success).toBe(false);
  });
});
