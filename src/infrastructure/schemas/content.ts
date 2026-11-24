import { z } from "zod";
import {
  ACHIEVEMENT_KINDS,
  SHOW_STATUSES,
  SOCIAL_NETWORKS,
  SONG_GENRES,
  type Achievement,
  type EpkPublic,
  type Format,
  type GalleryPhoto,
  type Profile,
  type PublicSong,
  type Show,
  type Video,
} from "@/domain/entities";

const text = z.string().min(1);
const isoDate = z.iso.date();
const httpsUrl = z.url({ protocol: /^https$/ });
const socialLink = z.object({
  network: z.enum(SOCIAL_NETWORKS),
  handle: text,
  url: httpsUrl,
});

export const profileSchema = z.object({
  name: text,
  heroBadge: text,
  heroBadgeShort: text,
  tagline: text,
  taglineShort: text,
  heroGenres: z.array(text),
  historyHeading: text,
  bioShort: text,
  bioLong: z.array(text).min(1),
  origin: text,
  base: text,
  coverage: text,
  genresSummary: text,
  socials: z.array(socialLink),
  bookingEmail: z.email().nullable(),
  whatsapp: z.string().regex(/^\+\d[\d ]{6,20}$/).nullable(),
}) satisfies z.ZodType<Profile>;

export const galleryPhotoSchema = z.object({
  id: text,
  src: text,
  alt: text,
  caption: text.optional(),
  order: z.number().int(),
}) satisfies z.ZodType<GalleryPhoto>;

export const achievementSchema = z.object({
  id: text,
  title: text,
  subtitle: text,
  kind: z.enum(ACHIEVEMENT_KINDS),
  label: text,
  epkLine: text,
  featured: z.boolean(),
  order: z.number().int(),
}) satisfies z.ZodType<Achievement>;

export const showSchema = z.object({
  id: text,
  venue: text,
  city: text,
  date: isoDate.nullable(),
  status: z.enum(SHOW_STATUSES),
  description: text.optional(),
  videoUrl: httpsUrl.optional(),
}) satisfies z.ZodType<Show>;

/** Unknown fields are stripped, so a stray `key` can never reach the public site. */
export const publicSongSchema = z.object({
  id: text,
  title: text,
  artist: text,
  genre: z.enum(SONG_GENRES),
  inMainShow: z.boolean(),
  order: z.number().int(),
}) satisfies z.ZodType<PublicSong>;

export const formatSchema = z
  .object({
    id: text,
    name: text,
    shortName: text,
    durationMin: z.number().int().positive(),
    durationMax: z.number().int().positive(),
    membersLabel: text,
    membersCount: z.number().int().positive(),
    idealFor: text,
    order: z.number().int(),
  })
  .refine((f) => f.durationMax >= f.durationMin, {
    message: "durationMax must be >= durationMin",
  }) satisfies z.ZodType<Format>;

export const videoSchema = z.object({
  id: text,
  title: text,
  context: text,
  url: httpsUrl,
  featured: z.boolean(),
  order: z.number().int(),
}) satisfies z.ZodType<Video>;

export const epkSchema = z.object({
  eyebrow: text,
  intro: text,
  coverageStat: text,
  coverageStatLabel: text,
  rate: text,
  technicalRider: z.array(text),
  hospitalityRider: z.array(text),
}) satisfies z.ZodType<EpkPublic>;
