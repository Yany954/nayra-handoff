import type {
  Achievement,
  BookingRequest,
  DiscoveredEvent,
  Promoter,
  EpkPublic,
  Format,
  GalleryPhoto,
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
  listDiscoveredEvents(): Promise<DiscoveredEvent[]>;

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
}
