import { describe, expect, it } from "vitest";
import { bookingRequestFrom, looksLikeBot, promoterFromBooking, type BookingInput } from "@/domain/rules/booking";

const input: BookingInput = {
  name: "Laura Gómez", phone: "300 123 4567", email: "laura@example.com", eventType: "Boda / 15 años / cumpleaños",
  eventDate: "2027-03-20", municipality: "Pailitas", message: "Boda para 120 personas, queremos vallenato.",
};
const now = new Date("2026-11-26T15:00:00Z");

describe("booking rules", () => {
  it("turns a web request into a prospect with its source and the message in the notes", () => {
    const promoter = promoterFromBooking(input, now);
    expect(promoter).toMatchObject({
      type: "Evento privado", city: "Pailitas", contact: "300 123 4567 · laura@example.com",
      stage: "prospecto", source: "web_form", eventDate: "2027-03-20",
    });
    expect(promoter.notes).toContain("Boda para 120 personas");
    expect(bookingRequestFrom(input, now)).toMatchObject({ status: "nuevo", createdAt: "2026-11-26T15:00:00.000Z" });
  });

  it("flags bots: honeypot filled or posted in under 3 seconds", () => {
    expect(looksLikeBot("", 8000)).toBe(false);
    expect(looksLikeBot("http://spam.example", 8000)).toBe(true);
    expect(looksLikeBot("", 900)).toBe(true);
    expect(looksLikeBot("", Number.NaN)).toBe(true);
  });
});
