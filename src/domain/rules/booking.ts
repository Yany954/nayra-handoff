import type { BookingRequest, Promoter } from "@/domain/entities";

/** What the public form offers → the promoter type the panel uses. */
export const BOOKING_EVENT_TYPES = [
  { value: "Festival / feria", promoterType: "Festival" },
  { value: "Evento corporativo", promoterType: "Corporativo" },
  { value: "Hotel / restaurante", promoterType: "Hotel" },
  { value: "Boda / 15 años / cumpleaños", promoterType: "Evento privado" },
  { value: "Alcaldía / casa de cultura", promoterType: "Alcaldía / Casa de cultura" },
  { value: "Otro", promoterType: "Otro" },
] as const;

export type BookingInput = {
  name: string;
  phone: string | null;
  email: string | null;
  eventType: string;
  eventDate: string;
  municipality: string;
  message: string;
};

/** Seconds a person needs at least to fill the form; bots post instantly. */
export const MIN_FILL_MS = 3000;
export const MAX_REQUESTS_PER_HOUR = 5;

/** Honeypot filled or posted too fast → treat as a bot (and answer as if it worked). */
export function looksLikeBot(honeypot: string, elapsedMs: number): boolean {
  return honeypot.trim() !== "" || !Number.isFinite(elapsedMs) || elapsedMs < MIN_FILL_MS;
}

/** SPEC §6: every web request also enters the CRM as a prospect, with its source. */
export function promoterFromBooking(input: BookingInput, now: Date): Omit<Promoter, "id"> {
  const type = BOOKING_EVENT_TYPES.find((t) => t.value === input.eventType)?.promoterType ?? "Otro";
  const contact = [input.phone, input.email].filter(Boolean).join(" · ");
  return {
    type,
    name: `${input.eventType} — ${input.name}`,
    city: input.municipality,
    contact,
    socialOrWeb: "",
    stage: "prospecto",
    lastContactAt: null,
    nextFollowUpAt: null,
    eventDate: input.eventDate,
    notes: `Solicitud desde el sitio web.\nContacto: ${input.name}${contact ? ` (${contact})` : ""}\n\n${input.message}`,
    source: "web_form",
    createdAt: now.toISOString(),
  };
}

export type NewBookingRequest = Omit<BookingRequest, "id"> & {
  phone: string | null;
  email: string | null;
  message: string;
  createdAt: string;
};

export function bookingRequestFrom(input: BookingInput, now: Date): NewBookingRequest {
  return { ...input, status: "nuevo", createdAt: now.toISOString() };
}
