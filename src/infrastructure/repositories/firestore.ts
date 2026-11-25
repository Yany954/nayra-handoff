import type { Firestore, QuerySnapshot } from "firebase-admin/firestore";
import { z } from "zod";
import type { ContentRepositories } from "@/domain/repositories";
import { publicStorageUrl } from "@/infrastructure/firebase/admin";
import {
  achievementSchema,
  epkSchema,
  formatSchema,
  galleryDocSchema,
  profileSchema,
  publicSongSchema,
  showSchema,
  videoSchema,
} from "@/infrastructure/schemas/content";

/** Document ids are not stored as fields, so they are merged in before validation. */
function parseCollection<T>(schema: z.ZodType<T>, snapshot: QuerySnapshot): T[] {
  return snapshot.docs.map((doc) => {
    const result = schema.safeParse({ ...doc.data(), id: doc.id });
    if (!result.success) {
      throw new Error(`Invalid document ${doc.ref.path}: ${z.prettifyError(result.error)}`);
    }
    return result.data;
  });
}

async function readDoc<T>(db: Firestore, path: string, schema: z.ZodType<T>): Promise<T> {
  const snapshot = await db.doc(path).get();
  if (!snapshot.exists) throw new Error(`Missing document ${path}. Run \`npm run seed\`.`);
  const result = schema.safeParse(snapshot.data());
  if (!result.success) throw new Error(`Invalid document ${path}: ${z.prettifyError(result.error)}`);
  return result.data;
}

export function createFirestoreRepositories(db: Firestore): ContentRepositories {
  const ordered = (name: string) => db.collection(name).orderBy("order").get();

  return {
    getProfile: () => readDoc(db, "profile/main", profileSchema),
    getEpk: () => readDoc(db, "epk/main", epkSchema),
    listAchievements: async () => parseCollection(achievementSchema, await ordered("achievements")),
    listShows: async () => parseCollection(showSchema, await db.collection("shows").get()),
    // Only the public song documents; keys live in songs/{id}/private and are never read here.
    listSongs: async () => parseCollection(publicSongSchema, await ordered("songs")),
    listFormats: async () => parseCollection(formatSchema, await ordered("formats")),
    listVideos: async () => parseCollection(videoSchema, await ordered("videos")),
    listGallery: async () =>
      parseCollection(galleryDocSchema, await ordered("gallery")).map(({ storagePath, ...photo }) => ({
        ...photo,
        src: publicStorageUrl(storagePath),
      })),
  };
}
