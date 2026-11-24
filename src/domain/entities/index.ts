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
