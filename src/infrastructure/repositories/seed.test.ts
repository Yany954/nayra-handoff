import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  getEpkPage,
  getGalleryPage,
  getHomePage,
  getRepertoirePage,
} from "@/application/public-site";
import { createSeedRepositories } from "@/infrastructure/repositories/seed";
import { publicSongSchema } from "@/infrastructure/schemas/content";

describe("seed repositories", () => {
  const repos = createSeedRepositories();

  it("builds the home page", async () => {
    const home = await getHomePage(repos, "2026-11-23");
    expect(home.featuredAchievements).toHaveLength(4);
    expect(home.otherAchievements).toHaveLength(4);
    expect(home.upcomingShows.map((s) => s.date)).toEqual(["2026-12-07", "2026-12-20"]);
    expect(home.upcomingShows.every((s) => s.status === "confirmado")).toBe(true);
    expect(home.latestShow?.id).toBe("festival-curumani");
    expect(home.featuredVideo?.id).toBe("si-no-te-tengo");
    expect(home.secondaryVideos).toHaveLength(2);
    expect(home.galleryPreview).toHaveLength(8);
    expect(home.galleryTotal).toBe(23);
    expect(home.profile.bookingEmail).toBe("contacto.nayra.lancheros@gmail.com");
  });

  it("lists every gallery photo with unique ids and alt text", async () => {
    const { photos } = await getGalleryPage(repos);
    expect(new Set(photos.map((p) => p.id)).size).toBe(photos.length);
    expect(photos.every((p) => p.alt.length > 10)).toBe(true);
  });

  it("points every gallery photo at a file that exists", async () => {
    const { photos } = await getGalleryPage(repos);
    const missing = photos.filter((p) => !existsSync(join(process.cwd(), "public", p.src)));
    expect(missing.map((p) => p.src)).toEqual([]);
  });

  it("derives the repertoire totals", async () => {
    const page = await getRepertoirePage(repos);
    expect(page.total).toBe(23);
    expect(page.mainShowCount).toBe(8);
  });

  it("derives the EPK facts from the formats", async () => {
    const { formatsSummary } = await getEpkPage(repos);
    expect(formatsSummary.count).toBe(4);
    expect(formatsSummary.durationRange).toBe("30–90");
  });

  it("never exposes a musical key", async () => {
    const songs = await repos.listSongs();
    expect(songs.every((s) => !("key" in s))).toBe(true);

    const parsed = publicSongSchema.parse({ ...songs[0], key: "Am" });
    expect(parsed).not.toHaveProperty("key");
  });
});
