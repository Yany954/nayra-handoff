import type { ContentRepositories } from "@/domain/repositories";
import { summarizeFormats } from "@/domain/rules/formats";
import { latestPastShow, publicUpcomingShows } from "@/domain/rules/shows";
import { countMainShowSongs } from "@/domain/rules/songs";

export const HOME_GALLERY_SIZE = 8;
/** The home shows one featured video plus a few more; the EPK PDF lists them all. */
export const HOME_SECONDARY_VIDEOS = 4;

const byOrder = <T extends { order: number }>(items: readonly T[]): T[] =>
  [...items].sort((a, b) => a.order - b.order);

export async function getSiteChrome(repos: ContentRepositories) {
  const profile = await repos.getProfile();
  return { name: profile.name };
}

export async function getHomePage(repos: ContentRepositories, today: string) {
  const [profile, achievements, shows, formats, videos, gallery] = await Promise.all([
    repos.getProfile(),
    repos.listAchievements(),
    repos.listShows(),
    repos.listFormats(),
    repos.listVideos(),
    repos.listGallery(),
  ]);
  const ordered = byOrder(achievements);

  return {
    profile,
    featuredAchievements: ordered.filter((a) => a.featured),
    otherAchievements: ordered.filter((a) => !a.featured),
    upcomingShows: publicUpcomingShows(shows, today).slice(0, 3),
    latestShow: latestPastShow(shows, today),
    formats: byOrder(formats),
    featuredVideo: byOrder(videos).find((v) => v.featured) ?? null,
    secondaryVideos: byOrder(videos).filter((v) => !v.featured).slice(0, HOME_SECONDARY_VIDEOS),
    galleryPreview: byOrder(gallery).slice(0, HOME_GALLERY_SIZE),
    galleryTotal: gallery.length,
  };
}

export async function getGalleryPage(repos: ContentRepositories) {
  return { photos: byOrder(await repos.listGallery()) };
}

export async function getRepertoirePage(repos: ContentRepositories) {
  const songs = byOrder(await repos.listSongs());
  return {
    songs,
    total: songs.length,
    mainShowCount: countMainShowSongs(songs),
  };
}

export async function getEpkPage(repos: ContentRepositories) {
  const [profile, achievements, formats, epk] = await Promise.all([
    repos.getProfile(),
    repos.listAchievements(),
    repos.listFormats(),
    repos.getEpk(),
  ]);
  return {
    profile,
    epk,
    achievements: byOrder(achievements),
    formatsSummary: summarizeFormats(formats),
  };
}

export type HomePageData = Awaited<ReturnType<typeof getHomePage>>;
export type RepertoirePageData = Awaited<ReturnType<typeof getRepertoirePage>>;
export type EpkPageData = Awaited<ReturnType<typeof getEpkPage>>;
export type GalleryPageData = Awaited<ReturnType<typeof getGalleryPage>>;
export type SiteChrome = Awaited<ReturnType<typeof getSiteChrome>>;

/** Everything the downloadable EPK (PDF) shows: the web EPK plus formats, videos and press photos. */
export async function getEpkDocument(repos: ContentRepositories) {
  const [page, formats, videos, gallery] = await Promise.all([
    getEpkPage(repos),
    repos.listFormats(),
    repos.listVideos(),
    repos.listGallery(),
  ]);
  return {
    ...page,
    formats: byOrder(formats),
    videos: byOrder(videos),
    photos: byOrder(gallery).slice(0, 2),
  };
}
export type EpkDocumentData = Awaited<ReturnType<typeof getEpkDocument>>;
