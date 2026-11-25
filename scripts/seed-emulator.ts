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
import { addDays } from "@/domain/rules/promoters";
import { toBogotaDateKey } from "@/domain/rules/shows";
import { pitchSchema, promoterSchema } from "@/infrastructure/schemas/panel";
import { pitchSeed } from "@/infrastructure/seed/pitch";
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

/** Development-only examples so the panel home is not empty; clearly marked as fake. */
function examplePromoters() {
  const today = toBogotaDateKey(new Date());
  const base = { socialOrWeb: "", eventDate: null, notes: "", createdAt: new Date().toISOString() };
  return [
    { ...base, id: "ejemplo-hotel", type: "Hotel", name: "Hotel [ejemplo]", city: "Valledupar", contact: "eventos@hotel-ejemplo.co",
      stage: "contactado", lastContactAt: addDays(today, -9), nextFollowUpAt: addDays(today, -2), source: "manual" },
    { ...base, id: "ejemplo-festival", type: "Festival", name: "Festival [ejemplo]", city: "Tamalameque", contact: "Casa de la Cultura",
      stage: "en_negociacion", lastContactAt: addDays(today, -7), nextFollowUpAt: today, source: "auto" },
    { ...base, id: "ejemplo-boda", type: "Evento privado", name: "Boda [ejemplo]", city: "Pailitas", contact: "WhatsApp",
      stage: "prospecto", lastContactAt: null, nextFollowUpAt: null, source: "web_form" },
  ];
}

async function main() {
  await firestore.doc("profile/main").set(profileSchema.parse(profileSeed));
  await firestore.doc("epk/main").set(epkSchema.parse(epkSeed));
  await firestore.doc("pitch/main").set(pitchSchema.parse(pitchSeed));
  console.log("profile/main, epk/main, pitch/main");
  await replaceCollection("achievements", achievementSchema, achievementsSeed);
  await replaceCollection("shows", showSchema, showsSeed);
  // Musical keys are not in the seed yet; the panel (phase 4) writes them to songs/{id}/private/meta.
  await replaceCollection("songs", publicSongSchema, songsSeed);
  await replaceCollection("formats", formatSchema, formatsSeed);
  await replaceCollection("videos", videoSchema, videosSeed);
  await seedGallery();
  await replaceCollection("promoters", promoterSchema, examplePromoters());
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
