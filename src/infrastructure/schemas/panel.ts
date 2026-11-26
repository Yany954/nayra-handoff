import { z } from "zod";
import { parseYouTubeId, videoPlatform } from "@/domain/rules/media";
import {
  ACHIEVEMENT_KINDS,
  PROMOTER_SOURCES,
  PROMOTER_STAGES,
  RECIPIENT_KINDS,
  SHOW_STATUSES,
  SONG_GENRES,
  type PitchTemplates,
  type RecipientKind,
  type BookingRequest,
  type DiscoveredEvent,
  type ScanStatus,
  type Promoter,
} from "@/domain/entities";
import type {
  AchievementInput,
  FormatInput,
  PromoterInput,
  ShowInput,
  SongInput,
  VideoInput,
} from "@/domain/repositories";

const text = z.string().min(1);
const isoDate = z.iso.date();

export const promoterSchema = z.object({
  id: text,
  type: text,
  name: text,
  city: z.string(),
  contact: z.string(),
  socialOrWeb: z.string(),
  stage: z.enum(PROMOTER_STAGES),
  lastContactAt: isoDate.nullable(),
  nextFollowUpAt: isoDate.nullable(),
  eventDate: isoDate.nullable(),
  notes: z.string(),
  source: z.enum(PROMOTER_SOURCES),
  createdAt: z.string(),
}) satisfies z.ZodType<Promoter>;

/** Only the fields the panel shows; a request without status has not been reviewed yet. */
export const bookingRequestSchema = z.object({
  id: text,
  name: text,
  eventType: text,
  eventDate: z.string(),
  municipality: z.string(),
  status: z.enum(["nuevo", "revisado"]).default("nuevo"),
}) satisfies z.ZodType<BookingRequest, unknown>;

export const discoveredEventSchema = z.object({
  id: text,
  name: text,
  municipality: z.string(),
  department: z.string().default(""),
  dates: z.string(),
  startDate: isoDate.nullable().default(null),
  type: z.string().default("otro"),
  contact: z.string().nullable().default(null),
  // Shown as a link: only https, anything else is dropped to an empty string.
  url: z.string().default("").transform((v) => (z.url({ protocol: /^https$/ }).safeParse(v).success ? v : "")),
  sourceName: z.string().default(""),
  openCall: z.boolean().default(false),
  deadline: isoDate.nullable().default(null),
  note: z.string().default(""),
  relevance: z.number().min(0).max(1),
  status: z.enum(["pending", "approved", "discarded"]),
  foundAt: z.string().default(""),
}) satisfies z.ZodType<DiscoveredEvent, unknown>;

export const scanStatusSchema = z.object({
  lastRunAt: z.string().nullable().default(null),
  added: z.number().default(0),
  queries: z.number().default(0),
  errors: z.array(z.string()).default([]),
}) satisfies z.ZodType<ScanStatus, unknown>;

// ---- Form input (FormData values are strings; empty means "not set") ----

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres.`)
    .transform((v) => (v === "" ? undefined : v));

export const showFormSchema = z.object({
  venue: z.string().trim().min(1, "Escribe el lugar o evento.").max(120),
  city: z.string().trim().min(1, "Escribe la ciudad.").max(80),
  date: z
    .string()
    .trim()
    .refine((v) => v === "" || isoDate.safeParse(v).success, "Fecha inválida.")
    .transform((v) => (v === "" ? null : v)),
  status: z.enum(SHOW_STATUSES, { error: "Elige un estado." }),
  description: optionalText(300),
  videoUrl: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || z.url({ protocol: /^https$/ }).safeParse(v).success,
      "El enlace debe empezar por https://",
    )
    .transform((v) => (v === "" ? undefined : v)),
}) satisfies z.ZodType<ShowInput, unknown>;

export const galleryAltSchema = z
  .string()
  .trim()
  .min(10, "Describe la foto en al menos 10 caracteres (lo leen los lectores de pantalla).")
  .max(200, "Máximo 200 caracteres.");

export const GALLERY_MAX_BYTES = 10 * 1024 * 1024;
export const GALLERY_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

// ---- 4b forms ----

const required = (label: string, max = 120) =>
  z.string().trim().min(1, `Escribe ${label}.`).max(max, `Máximo ${max} caracteres.`);
const plain = (max: number) => z.string().trim().max(max, `Máximo ${max} caracteres.`);
/** Unchecked checkboxes are absent from FormData. */
const checkbox = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());
const position = z.coerce.number({ error: "Escribe un número." }).int("Usa un número entero.").min(0).max(999);
const optionalDate = z
  .string()
  .trim()
  .refine((v) => v === "" || isoDate.safeParse(v).success, "Fecha inválida.")
  .transform((v) => (v === "" ? null : v));
/** One item per line, blank lines ignored. */
const lines = (label: string) =>
  z
    .string()
    .transform((v) => v.split("\n").map((line) => line.trim()).filter(Boolean))
    .pipe(z.array(z.string().max(200, "Cada línea: máximo 200 caracteres.")).min(1, `Agrega al menos un punto en ${label}.`));

export const achievementFormSchema = z.object({
  title: required("el logro", 80),
  subtitle: required("el detalle", 160),
  kind: z.enum(ACHIEVEMENT_KINDS, { error: "Elige un tipo." }),
  label: required("la etiqueta", 40),
  epkLine: required("la línea del EPK", 200),
  featured: checkbox,
  order: position,
}) satisfies z.ZodType<AchievementInput, unknown>;

export const formatFormSchema = z
  .object({
    name: required("el nombre", 80),
    shortName: required("el nombre corto", 40),
    durationMin: z.coerce.number().int().min(5, "Mínimo 5 minutos.").max(600),
    durationMax: z.coerce.number().int().min(5, "Mínimo 5 minutos.").max(600),
    membersLabel: required("quiénes van", 80),
    membersCount: z.coerce.number().int().min(1, "Al menos 1.").max(50),
    idealFor: required("para qué eventos sirve", 160),
    order: position,
  })
  .refine((f) => f.durationMax >= f.durationMin, {
    message: "Debe ser mayor o igual a la duración mínima.",
    path: ["durationMax"],
  }) satisfies z.ZodType<FormatInput, unknown>;

export const videoFormSchema = z
  .object({
    title: required("el título", 120),
    context: required("dónde está", 80),
    url: z
      .string()
      .trim()
      .refine((v) => z.url({ protocol: /^https$/ }).safeParse(v).success, "Pega el enlace completo, empieza por https://")
      .refine((v) => videoPlatform(v) !== null, "Usa un enlace de YouTube, Instagram, TikTok o Facebook."),
    featured: checkbox,
    order: position,
  })
  // Only YouTube can play inside the site; Instagram/TikTok/Facebook open in their own app or tab.
  .refine((v) => !v.featured || parseYouTubeId(v.url) !== null, {
    message: "El video principal tiene que ser de YouTube: es el único que se reproduce dentro del sitio.",
    path: ["featured"],
  }) satisfies z.ZodType<VideoInput, unknown>;

export const songFormSchema = z.object({
  title: required("el título", 120),
  artist: required("el artista", 120),
  genre: z.enum(SONG_GENRES, { error: "Elige un género." }),
  inMainShow: checkbox,
  order: position,
  key: plain(20).transform((v) => (v === "" ? null : v)),
}) satisfies z.ZodType<SongInput, unknown>;

export const promoterFormSchema = z.object({
  type: required("el tipo", 40),
  name: required("el nombre", 160),
  city: plain(80),
  contact: plain(160),
  socialOrWeb: plain(200),
  stage: z.enum(PROMOTER_STAGES, { error: "Elige una etapa." }),
  nextFollowUpAt: optionalDate,
  eventDate: optionalDate,
  notes: plain(2000),
}) satisfies z.ZodType<PromoterInput, unknown>;

export const epkFormSchema = z.object({
  eyebrow: required("el encabezado", 80),
  intro: required("la introducción", 400),
  rate: required("la tarifa", 120),
  coverageStat: required("la cifra de cobertura", 20),
  coverageStatLabel: required("qué significa la cifra", 40),
  technicalRider: lines("el rider técnico"),
  hospitalityRider: lines("el rider de hospitalidad"),
  bioShort: required("la bio corta", 500),
  base: required("la ciudad base", 80),
  genresSummary: required("los géneros", 120),
});

/** First message per field, keyed by field name, for inline errors. */
export function fieldErrorsOf(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}

// ---- Pitch ----

const kindTemplate = z.object({
  subject: z.string().trim().min(1, "Escribe el asunto.").max(160, "Máximo 160 caracteres."),
  paragraph: z.string().trim().min(1, "Escribe el párrafo.").max(1500, "Máximo 1500 caracteres."),
});

export const pitchSchema = z.object({
  body: z.string().trim().min(1, "Escribe el cuerpo del correo.").max(6000, "Máximo 6000 caracteres."),
  signature: z.string().trim().min(1, "Escribe la firma.").max(1000, "Máximo 1000 caracteres."),
  kinds: z.object(Object.fromEntries(RECIPIENT_KINDS.map((k) => [k, kindTemplate])) as Record<RecipientKind, typeof kindTemplate>),
}) satisfies z.ZodType<PitchTemplates, unknown>;

/** The templates form is flat (`festival_subject`, …); this rebuilds the nested shape. */
export const pitchFormFields = ["body", "signature", ...RECIPIENT_KINDS.flatMap((k) => [`${k}_subject`, `${k}_paragraph`])] as const;

export function pitchFromForm(values: Record<string, unknown>) {
  return pitchSchema.safeParse({
    body: values.body,
    signature: values.signature,
    kinds: Object.fromEntries(
      RECIPIENT_KINDS.map((k) => [k, { subject: values[`${k}_subject`], paragraph: values[`${k}_paragraph`] }]),
    ),
  });
}
