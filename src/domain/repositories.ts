import type {
  Achievement,
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
