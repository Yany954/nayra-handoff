import type {
  Achievement,
  BookingRequest,
  DiscoveredEvent,
  Promoter,
  EpkPublic,
  Format,
  GalleryPhoto,
  PitchTemplates,
  ScanStatus,
  Profile,
  PublicSong,
  Show,
  Video,
} from "@/domain/entities";

export interface ContentRepositories {
  getProfile(): Promise<Profile>;
  listAchievements(): Promise<Achievement[]>;
  listShows(): Promise<Show[]>;
  listSongs(): Promise<PublicSong[]>;
  listFormats(): Promise<Format[]>;
  listVideos(): Promise<Video[]>;
  listGallery(): Promise<GalleryPhoto[]>;
  getEpk(): Promise<EpkPublic>;
}

export type AchievementInput = Omit<Achievement, "id">;
export type FormatInput = Omit<Format, "id">;
export type VideoInput = Omit<Video, "id">;
/** The key is optional: the manager only shares it when someone asks. */
export type AdminSong = PublicSong & { key: string | null };
export type SongInput = Omit<AdminSong, "id">;
/** What the manager edits; source, createdAt and contact dates are managed by the app. */
export type PromoterInput = Omit<Promoter, "id" | "source" | "createdAt" | "lastContactAt">;
/** Profile fields the EPK shows and the panel can edit. */
export type EpkProfileFields = Pick<Profile, "bioShort" | "base" | "genresSummary">;

/** Everything a show form can set; the id is assigned on creation. */
export type ShowInput = Omit<Show, "id">;

export type NewGalleryPhoto = {
  bytes: Uint8Array;
  contentType: "image/jpeg" | "image/png" | "image/webp";
  alt: string;
};

/** Manager-only reads and writes. Implementations must only be reached after an admin check. */
export interface AdminRepositories {
  listPromoters(): Promise<Promoter[]>;
  listBookingRequests(): Promise<BookingRequest[]>;
  /** All found events (pending and reviewed), most relevant first. */
  listDiscoveredEvents(): Promise<DiscoveredEvent[]>;
  getDiscoveredEvent(id: string): Promise<DiscoveredEvent | null>;
  /** Creates the promoter and marks the event approved in one transaction. */
  approveDiscoveredEvent(id: string, promoter: Omit<Promoter, "id">): Promise<"ok" | "not_pending">;
  discardDiscoveredEvent(id: string): Promise<void>;
  getScanStatus(): Promise<ScanStatus>;
  /** Manual scan requests since `sinceIso` (for the daily limit). */
  countScanRequestsSince(sinceIso: string): Promise<number>;
  requestScan(requestedBy: string): Promise<void>;
  /** Counts one AI call in the current hour and returns the new total (rate limit). */
  countAiCallThisHour(now: Date): Promise<number>;

  listShows(): Promise<Show[]>;
  createShow(input: ShowInput): Promise<string>;
  updateShow(id: string, input: ShowInput): Promise<void>;
  deleteShow(id: string): Promise<void>;

  listGallery(): Promise<GalleryPhoto[]>;
  addGalleryPhoto(photo: NewGalleryPhoto): Promise<string>;
  updateGalleryAlt(id: string, alt: string): Promise<void>;
  deleteGalleryPhoto(id: string): Promise<void>;
  /** Persists a new order; ids not listed keep their relative order at the end. */
  reorderGallery(ids: string[]): Promise<void>;

  getPromoter(id: string): Promise<Promoter | null>;
  createPromoter(promoter: Omit<Promoter, "id">): Promise<string>;
  updatePromoter(promoter: Promoter): Promise<void>;
  deletePromoter(id: string): Promise<void>;

  listAchievements(): Promise<Achievement[]>;
  saveAchievement(id: string | null, input: AchievementInput): Promise<void>;
  deleteAchievement(id: string): Promise<void>;

  listVideos(): Promise<Video[]>;
  saveVideo(id: string | null, input: VideoInput): Promise<void>;
  deleteVideo(id: string): Promise<void>;

  listFormats(): Promise<Format[]>;
  saveFormat(id: string | null, input: FormatInput): Promise<void>;
  deleteFormat(id: string): Promise<void>;

  listSongs(): Promise<AdminSong[]>;
  saveSong(id: string | null, input: SongInput): Promise<void>;
  deleteSong(id: string): Promise<void>;

  getPitch(): Promise<PitchTemplates>;
  savePitch(templates: PitchTemplates): Promise<void>;

  getEpk(): Promise<EpkPublic>;
  getProfile(): Promise<Profile>;
  saveEpk(epk: EpkPublic, profile: EpkProfileFields): Promise<void>;
}
