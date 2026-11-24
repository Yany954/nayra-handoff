import { z } from "zod";
import type { ContentRepositories } from "@/domain/repositories";
import {
  achievementSchema,
  epkSchema,
  formatSchema,
  profileSchema,
  publicSongSchema,
  showSchema,
  videoSchema,
} from "@/infrastructure/schemas/content";
import {
  achievementsSeed,
  epkSeed,
  formatsSeed,
  profileSeed,
  showsSeed,
  songsSeed,
  videosSeed,
} from "@/infrastructure/seed/content";

export function createSeedRepositories(): ContentRepositories {
  return {
    getProfile: async () => profileSchema.parse(profileSeed),
    listAchievements: async () => z.array(achievementSchema).parse(achievementsSeed),
    listShows: async () => z.array(showSchema).parse(showsSeed),
    listSongs: async () => z.array(publicSongSchema).parse(songsSeed),
    listFormats: async () => z.array(formatSchema).parse(formatsSeed),
    listVideos: async () => z.array(videoSchema).parse(videosSeed),
    getEpk: async () => epkSchema.parse(epkSeed),
  };
}
