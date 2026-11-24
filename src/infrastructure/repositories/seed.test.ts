import { describe, expect, it } from "vitest";
import {
  getEpkPage,
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
    expect(home.otherAchievements).toHaveLength(1);
    expect(home.upcomingShows.map((s) => s.date)).toEqual([
      "2026-12-07",
      "2026-12-20",
      "2027-01-11",
    ]);
    expect(home.latestShow?.id).toBe("festival-curumani");
    expect(home.featuredVideo?.id).toBe("el-me-mintio");
    expect(home.secondaryVideos).toHaveLength(2);
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
