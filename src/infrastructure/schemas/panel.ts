import { z } from "zod";
import {
  PROMOTER_SOURCES,
  PROMOTER_STAGES,
  SHOW_STATUSES,
  type BookingRequest,
  type DiscoveredEvent,
  type Promoter,
} from "@/domain/entities";
import type { ShowInput } from "@/domain/repositories";

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
  dates: z.string(),
  relevance: z.number().min(0).max(1),
  status: z.enum(["pending", "approved", "discarded"]),
}) satisfies z.ZodType<DiscoveredEvent, unknown>;

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
