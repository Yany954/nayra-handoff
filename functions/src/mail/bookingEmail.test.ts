import { describe, expect, it } from "vitest";
import { buildBookingEmail } from "./bookingEmail";

const request = {
  name: "Laura Gómez", phone: "300 123 4567", email: "laura@example.com", eventType: "Boda / 15 años / cumpleaños",
  eventDate: "2027-03-20", municipality: "Pailitas", message: "Boda para 120 personas.",
};

describe("booking notification email", () => {
  it("summarizes the request with a WhatsApp link and reply-to", () => {
    const mail = buildBookingEmail(request, "https://example.app/panel");
    expect(mail.subject).toBe("Nueva solicitud: Boda / 15 años / cumpleaños en Pailitas (20 de marzo de 2027)");
    expect(mail.text).toContain("WhatsApp: https://wa.me/573001234567");
    expect(mail.text).toContain("https://example.app/panel");
    expect(mail.replyTo).toBe("laura@example.com");
  });

  it("never lets user text break headers or set a bad reply-to", () => {
    const mail = buildBookingEmail({ ...request, municipality: "Pailitas\r\nBcc: victim@example.com", email: "no es correo" }, "x");
    expect(mail.subject).not.toMatch(/[\r\n]/);
    expect(mail.replyTo).toBeUndefined();
    expect(mail.text).toContain("No dejó correo");
  });
});
