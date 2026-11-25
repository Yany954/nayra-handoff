import type { Format, PitchTemplates, Profile, Promoter, RecipientKind } from "@/domain/entities";
import { formatDuration } from "@/domain/rules/formats";

export const RECIPIENT_LABELS: Record<RecipientKind, string> = {
  festival: "Festival / feria",
  corporativo: "Evento corporativo",
  hotel: "Hotel / restaurante",
  privado: "Boda / 15 años",
};

/** Variables the manager can use in templates, with what they become. */
export const PITCH_VARIABLES: Record<string, string> = {
  saludo: "«Estimado/a {nombre}:» o «Buen día:» si no hay nombre",
  nombre: "Persona o entidad a la que escribes",
  evento: "Nombre del evento o lugar («su evento» si no hay)",
  ciudad: "Ciudad del evento",
  fecha: "Fecha del evento, ej. «14 de febrero de 2027»",
  formatos: "Formatos con duración, ej. «Voz y guitarra (30–45 min)»",
  parrafo_evento: "El párrafo del tipo de destinatario",
  firma: "La firma",
  whatsapp: "WhatsApp de booking",
  correo: "Correo de booking",
  instagram: "Enlace de Instagram",
  tiktok: "Enlace de TikTok",
  facebook: "Enlace de Facebook",
  youtube: "Enlace de YouTube",
};

/** Replaces {variable}; unknown or empty variables stay visible so they get noticed before sending. */
export function renderTemplate(template: string, vars: Record<string, string | undefined>): string {
  return template.replace(/\{([a-z_]+)\}/g, (match, key: string) => {
    const value = vars[key];
    return value === undefined || value === "" ? match : value;
  });
}

export function recipientKindFor(promoterType: string | undefined): RecipientKind {
  const type = (promoterType ?? "").toLowerCase();
  if (type.includes("hotel") || type.includes("restaurante")) return "hotel";
  if (type.includes("corporativo") || type.includes("colegio") || type.includes("empresa")) return "corporativo";
  if (type.includes("privado") || type.includes("boda")) return "privado";
  return "festival";
}

const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

/** "2027-02-14" → "14 de febrero de 2027" (calendar key, no timezone involved). */
export function spellDate(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return `${day} de ${MONTHS[month - 1]} de ${year}`;
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export type PitchRecipient = {
  name: string;
  email: string;
  event: string;
  city: string;
  date: string | null;
};

export function recipientFromPromoter(promoter: Promoter): PitchRecipient {
  const email = isEmail(promoter.contact) ? promoter.contact.trim() : "";
  return {
    // A contact that is a person ("Casa de la Cultura") is a better greeting than the event name.
    name: email || !promoter.contact ? promoter.name : promoter.contact,
    email,
    event: promoter.name,
    city: promoter.city,
    date: promoter.eventDate,
  };
}

export type Pitch = { subject: string; body: string };

export function buildPitch(
  templates: PitchTemplates,
  kind: RecipientKind,
  data: { profile: Profile; formats: Format[]; recipient: PitchRecipient },
): Pitch {
  const { profile, formats, recipient } = data;
  const social = (network: string) => profile.socials.find((s) => s.network === network)?.url;
  const name = recipient.name.trim();
  const vars: Record<string, string | undefined> = {
    nombre: name,
    saludo: name ? `Estimado/a ${name}:` : "Buen día:",
    evento: recipient.event.trim() || "su evento",
    ciudad: recipient.city.trim(),
    fecha: recipient.date ? spellDate(recipient.date) : undefined,
    formatos: formats.map((f) => `${f.name} (${formatDuration(f)})`).join(", "),
    whatsapp: profile.whatsapp ?? undefined,
    correo: profile.bookingEmail ?? undefined,
    instagram: social("instagram"),
    tiktok: social("tiktok"),
    facebook: social("facebook"),
    youtube: social("youtube"),
  };
  const { subject, paragraph } = templates.kinds[kind];
  const withParts = {
    ...vars,
    parrafo_evento: renderTemplate(paragraph, vars),
    firma: renderTemplate(templates.signature, vars),
  };
  return { subject: renderTemplate(subject, vars), body: renderTemplate(templates.body, withParts) };
}

/** Gmail web compose, opened in the booking account (authuser) so the pitch comes from it. */
export function gmailComposeUrl(pitch: Pitch, to: string, from: string | null): string {
  const params = new URLSearchParams({ view: "cm", fs: "1", to, su: pitch.subject, body: pitch.body });
  if (from) params.set("authuser", from);
  return `https://mail.google.com/mail/?${params.toString()}`;
}

/** mailto: needs %20, not "+", for spaces (RFC 6068). Only a valid address goes before the "?". */
export function mailtoUrl(pitch: Pitch, to: string): string {
  const address = isEmail(to) ? to.trim() : "";
  return `mailto:${address}?subject=${encodeURIComponent(pitch.subject)}&body=${encodeURIComponent(pitch.body)}`;
}
