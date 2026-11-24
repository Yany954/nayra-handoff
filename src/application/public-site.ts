import type { ContentRepositories } from "@/domain/repositories";
import { summarizeFormats } from "@/domain/rules/formats";
import { latestPastShow, upcomingShows } from "@/domain/rules/shows";
import { countMainShowSongs } from "@/domain/rules/songs";

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
    upcomingShows: upcomingShows(shows, today).slice(0, 3),
    latestShow: latestPastShow(shows, today),
    formats: byOrder(formats),
    featuredVideo: byOrder(videos).find((v) => v.featured) ?? null,
    secondaryVideos: byOrder(videos).filter((v) => !v.featured),
    gallery: byOrder(gallery),
  };
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
export type SiteChrome = Awaited<ReturnType<typeof getSiteChrome>>;
