export const SOCIAL_NETWORKS = ["instagram", "tiktok", "youtube", "facebook"] as const;
export type SocialNetwork = (typeof SOCIAL_NETWORKS)[number];

export type SocialLink = {
  network: SocialNetwork;
  handle: string;
  url: string;
};

export type Profile = {
  name: string;
  heroBadge: string;
  heroBadgeShort: string;
  tagline: string;
  taglineShort: string;
  heroGenres: string[];
  historyHeading: string;
  bioShort: string;
  bioLong: string[];
  origin: string;
  base: string;
  coverage: string;
  genresSummary: string;
  socials: SocialLink[];
  /** Null until the manager confirms one; the UI hides missing channels. */
  bookingEmail: string | null;
  whatsapp: string | null;
};

export type GalleryPhoto = {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  order: number;
};

export const ACHIEVEMENT_KINDS = [
  "ganadora",
  "finalista",
  "participante",
  "tarima",
  "reconocimiento",
] as const;
export type AchievementKind = (typeof ACHIEVEMENT_KINDS)[number];

export type Achievement = {
  id: string;
  title: string;
  subtitle: string;
  kind: AchievementKind;
  label: string;
  epkLine: string;
  featured: boolean;
  order: number;
};

export const SHOW_STATUSES = ["confirmado", "por_confirmar"] as const;
export type ShowStatus = (typeof SHOW_STATUSES)[number];

export type Show = {
  id: string;
  venue: string;
  city: string;
  /** ISO calendar date (YYYY-MM-DD), or null when the date is unknown. */
  date: string | null;
  status: ShowStatus;
  description?: string;
  videoUrl?: string;
};

export const SONG_GENRES = [
  "Vallenato",
  "Rancheras",
  "Baladas",
  "Celebraciones",
  "Tambora",
] as const;
export type SongGenre = (typeof SONG_GENRES)[number];

/** Public view of a song. The musical key is deliberately not part of it. */
export type PublicSong = {
  id: string;
  title: string;
  artist: string;
  genre: SongGenre;
  inMainShow: boolean;
  order: number;
};

export type Format = {
  id: string;
  name: string;
  shortName: string;
  durationMin: number;
  durationMax: number;
  membersLabel: string;
  membersCount: number;
  idealFor: string;
  order: number;
};

export type Video = {
  id: string;
  title: string;
  context: string;
  url: string;
  featured: boolean;
  order: number;
};

export type EpkPublic = {
  eyebrow: string;
  intro: string;
  coverageStat: string;
  coverageStatLabel: string;
  rate: string;
  technicalRider: string[];
  hospitalityRider: string[];
};

// ---- Manager panel (private data, never rendered on the public site) ----

export type AdminUser = {
  uid: string;
  email: string;
  name: string;
};

export const PROMOTER_STAGES = [
  "prospecto",
  "contactado",
  "en_negociacion",
  "cerrado",
  "descartado",
] as const;
export type PromoterStage = (typeof PROMOTER_STAGES)[number];

export const PROMOTER_SOURCES = ["auto", "manual", "web_form"] as const;
export type PromoterSource = (typeof PROMOTER_SOURCES)[number];

export type Promoter = {
  id: string;
  type: string;
  name: string;
  city: string;
  contact: string;
  socialOrWeb: string;
  stage: PromoterStage;
  /** Calendar days (YYYY-MM-DD, Bogotá) so they compare as strings. */
  lastContactAt: string | null;
  nextFollowUpAt: string | null;
  eventDate: string | null;
  notes: string;
  source: PromoterSource;
  createdAt: string;
};

export type BookingRequest = {
  id: string;
  name: string;
  eventType: string;
  eventDate: string;
  municipality: string;
  status: "nuevo" | "revisado";
};

export type DiscoveredEvent = {
  id: string;
  name: string;
  municipality: string;
  department: string;
  dates: string;
  startDate: string | null;
  /** festival, concurso, feria, fiestas_patronales, alcaldia_casa_cultura, corporativo, hotel, otro */
  type: string;
  contact: string | null;
  url: string;
  sourceName: string;
  openCall: boolean;
  deadline: string | null;
  note: string;
  relevance: number;
  status: "pending" | "approved" | "discarded";
  foundAt: string;
};

/** Written by functions/src/scan; shown as the banner of «Encontrados automáticamente». */
export type ScanStatus = {
  lastRunAt: string | null;
  added: number;
  queries: number;
  errors: string[];
};

// ---- Pitch (manager only) ----

export const RECIPIENT_KINDS = ["festival", "corporativo", "hotel", "privado"] as const;
export type RecipientKind = (typeof RECIPIENT_KINDS)[number];

/** Editable templates. `body` and `signature` are shared; each recipient kind adds its subject and paragraph. */
export type PitchTemplates = {
  body: string;
  signature: string;
  kinds: Record<RecipientKind, { subject: string; paragraph: string }>;
};
