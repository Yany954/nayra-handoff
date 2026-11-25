/**
 * Fills the Firebase emulators with the site content from src/infrastructure/seed.
 * Usage: `npm run emulators` in one terminal, then `npm run seed`.
 *
 * Each collection is replaced, so running it twice gives the same result.
 * It refuses to run without the emulator variables, so it can never wipe production.
 */
import { join } from "node:path";
import { z } from "zod";
import { bucket, db } from "@/infrastructure/firebase/admin";
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
import {
  achievementsSeed,
  epkSeed,
  formatsSeed,
  gallerySeed,
  profileSeed,
  showsSeed,
  songsSeed,
  videosSeed,
} from "@/infrastructure/seed/content";

if (!process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_STORAGE_EMULATOR_HOST) {
  console.error("Refusing to seed: FIRESTORE_EMULATOR_HOST and FIREBASE_STORAGE_EMULATOR_HOST must be set.");
  process.exit(1);
}

const firestore = db();

async function replaceCollection<T extends { id: string }>(name: string, schema: z.ZodType<T>, rows: unknown[]) {
  const docs = z.array(schema).parse(rows);
  await firestore.recursiveDelete(firestore.collection(name));
  const batch = firestore.batch();
  for (const { id, ...data } of docs) batch.set(firestore.collection(name).doc(id), data);
  await batch.commit();
  console.log(`${name}: ${docs.length}`);
}

async function seedGallery() {
  const docs = gallerySeed.map(({ id, alt, order }) =>
    galleryDocSchema.parse({ id, alt, order, storagePath: `public/gallery/${id}.jpg` }),
  );
  const storage = bucket();
  await storage.deleteFiles({ prefix: "public/gallery/" });
  await Promise.all(
    docs.map(({ id, storagePath }) =>
      storage.upload(join(process.cwd(), "public/images/gallery", `${id}.jpg`), {
        destination: storagePath,
        contentType: "image/jpeg",
      }),
    ),
  );
  await replaceCollection("gallery", galleryDocSchema, docs);
}

async function main() {
  await firestore.doc("profile/main").set(profileSchema.parse(profileSeed));
  await firestore.doc("epk/main").set(epkSchema.parse(epkSeed));
  console.log("profile/main, epk/main");
  await replaceCollection("achievements", achievementSchema, achievementsSeed);
  await replaceCollection("shows", showSchema, showsSeed);
  // Musical keys are not in the seed yet; the panel (phase 4) writes them to songs/{id}/private/meta.
  await replaceCollection("songs", publicSongSchema, songsSeed);
  await replaceCollection("formats", formatSchema, formatsSeed);
  await replaceCollection("videos", videoSchema, videosSeed);
  await seedGallery();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
