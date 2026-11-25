import { describe, expect, it } from "vitest";
import type { Format, PitchTemplates, Profile, Promoter } from "@/domain/entities";
import {
  buildPitch,
  gmailComposeUrl,
  mailtoUrl,
  recipientFromPromoter,
  recipientKindFor,
  renderTemplate,
  spellDate,
} from "@/domain/rules/pitch";

const templates: PitchTemplates = {
  body: "{saludo}\n\n{parrafo_evento}\n\n{firma}",
  signature: "Nayra Lancheros\nWhatsApp: {whatsapp}\nTikTok: {tiktok}",
  kinds: {
    festival: { subject: "Propuesta para {evento}", paragraph: "Propongo mi show para {evento} en {ciudad} el {fecha}. Formatos: {formatos}." },
    corporativo: { subject: "Show corporativo", paragraph: "Corporativo" },
    hotel: { subject: "Música en vivo", paragraph: "Hotel" },
    privado: { subject: "Para su celebración", paragraph: "Privado {desconocida}" },
  },
};
const profile = {
  whatsapp: "+57 317 470 3402",
  bookingEmail: "contacto@example.com",
  socials: [{ network: "instagram", handle: "@nayra", url: "https://instagram.com/nayra" }],
} as unknown as Profile;
const formats = [{ name: "Voz y guitarra", durationMin: 30, durationMax: 45 }] as Format[];
const promoter = {
  name: "Festival de la Tambora", city: "Tamalameque", contact: "Casa de la Cultura", eventDate: "2027-02-14", type: "Festival",
} as Promoter;

describe("pitch rules", () => {
  it("fills variables and keeps unknown or empty ones visible", () => {
    expect(renderTemplate("Hola {nombre}, {nada} {vacio}", { nombre: "Ana", vacio: "" })).toBe("Hola Ana, {nada} {vacio}");
  });

  it("spells dates in Spanish", () => {
    expect(spellDate("2027-02-14")).toBe("14 de febrero de 2027");
  });

  it("maps promoter types to recipient kinds", () => {
    expect(recipientKindFor("Hotel")).toBe("hotel");
    expect(recipientKindFor("Colegio")).toBe("corporativo");
    expect(recipientKindFor("Evento privado")).toBe("privado");
    expect(recipientKindFor("Fiestas patronales")).toBe("festival");
  });

  it("builds a festival pitch from the promoter, profile and formats", () => {
    const pitch = buildPitch(templates, "festival", { profile, formats, recipient: recipientFromPromoter(promoter) });
    expect(pitch.subject).toBe("Propuesta para Festival de la Tambora");
    expect(pitch.body).toContain("Estimado/a Casa de la Cultura:");
    expect(pitch.body).toContain("en Tamalameque el 14 de febrero de 2027. Formatos: Voz y guitarra (30–45 min).");
    expect(pitch.body).toContain("WhatsApp: +57 317 470 3402");
    // No TikTok in the profile: the variable stays visible instead of leaving a blank.
    expect(pitch.body).toContain("TikTok: {tiktok}");
  });

  it("greets generically without a name and falls back to «su evento»", () => {
    const pitch = buildPitch(templates, "festival", {
      profile, formats, recipient: { name: "", email: "", event: "", city: "", date: null },
    });
    expect(pitch.body.startsWith("Buen día:")).toBe(true);
    expect(pitch.subject).toBe("Propuesta para su evento");
  });

  it("uses an email contact as the address", () => {
    const r = recipientFromPromoter({ ...promoter, contact: " eventos@hotel.co " });
    expect(r).toMatchObject({ email: "eventos@hotel.co", name: "Festival de la Tambora" });
  });

  it("encodes Gmail and mailto links", () => {
    const pitch = { subject: "Show & más", body: "Línea 1\nLínea 2" };
    const gmail = new URL(gmailComposeUrl(pitch, "a@b.co", "contacto@example.com"));
    expect(gmail.searchParams.get("su")).toBe("Show & más");
    expect(gmail.searchParams.get("body")).toBe("Línea 1\nLínea 2");
    expect(gmail.searchParams.get("authuser")).toBe("contacto@example.com");
    expect(mailtoUrl(pitch, "a@b.co")).toBe("mailto:a@b.co?subject=Show%20%26%20m%C3%A1s&body=L%C3%ADnea%201%0AL%C3%ADnea%202");
    expect(mailtoUrl(pitch, "no es correo")).toMatch(/^mailto:\?subject=/);
  });
});
