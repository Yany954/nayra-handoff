import { z } from "zod";
import { fieldErrorsOf } from "@/infrastructure/schemas/panel";
import { BOOKING_EVENT_TYPES, type BookingInput } from "@/domain/rules/booking";

const NO_CONTACT_MESSAGE = "Déjanos un teléfono o un correo para responderte.";

const optional = (schema: z.ZodString) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? null : v), schema.nullable());

/** Public form: everything is validated again on the server, whatever the browser did. */
export function bookingFormSchema(today: string) {
  return z
    .object({
      name: z.string().trim().min(2, "Escribe tu nombre.").max(120, "Máximo 120 caracteres."),
      phone: optional(z.string().trim().regex(/^\+?[\d\s()-]{7,20}$/, "Escribe un teléfono válido, por ejemplo 300 123 4567.")),
      email: optional(z.string().trim().max(254).email("Escribe un correo válido, por ejemplo nombre@correo.com.")),
      eventType: z.enum(BOOKING_EVENT_TYPES.map((t) => t.value) as [string, ...string[]], { error: "Elige el tipo de evento." }),
      eventDate: z.iso.date({ error: "Elige la fecha del evento." }).refine((d) => d >= today, "Elige una fecha de hoy en adelante."),
      municipality: z.string().trim().min(2, "Escribe el municipio.").max(120, "Máximo 120 caracteres."),
      message: z.string().trim().min(10, "Cuéntanos un poco del evento (al menos 10 caracteres).").max(2000, "Máximo 2000 caracteres."),
      consent: z.literal("on", { error: "Necesitamos tu autorización para responderte." }),
    })
    .refine((v) => v.phone || v.email, { message: NO_CONTACT_MESSAGE, path: ["phone"] })
    .transform(({ consent: _consent, ...rest }): BookingInput => rest);
}

const NO_CONTACT = NO_CONTACT_MESSAGE;

/**
 * Validates the whole form in one pass. Zod skips object-level refinements while any field
 * fails, so the "phone or email" rule is checked here too: every problem shows at once.
 */
export function validateBooking(raw: Record<string, unknown>, today: string):
  | { ok: true; data: BookingInput }
  | { ok: false; fieldErrors: Record<string, string> } {
  const parsed = bookingFormSchema(today).safeParse(raw);
  if (parsed.success) return { ok: true, data: parsed.data };
  const fieldErrors = fieldErrorsOf(parsed.error);
  const blank = (v: unknown) => typeof v !== "string" || v.trim() === "";
  if (blank(raw.phone) && blank(raw.email) && !fieldErrors.phone) fieldErrors.phone = NO_CONTACT;
  return { ok: false, fieldErrors };
}
