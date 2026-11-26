/**
 * Fills the Firebase emulators with the site content from src/infrastructure/seed.
 * Usage: `npm run emulators` in one terminal, then `npm run seed`.
 *
 * Each collection is replaced, so running it twice gives the same result.
 * It refuses to run without the emulator variables, so it can never wipe production.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { makeVariants } from "@/infrastructure/images/variants";
import { z } from "zod";
import { bucket, db } from "@/infrastructure/firebase/admin";
import { addDays } from "@/domain/rules/promoters";
import { toBogotaDateKey } from "@/domain/rules/shows";
import { pitchSchema, promoterSchema } from "@/infrastructure/schemas/panel";
// The real scan pipeline with its offline fixtures (same code the Cloud Function runs in the emulator).
import { FixtureExtractor, FixtureSearch } from "../functions/src/scan/providers";
import { EMPTY_STATE, runScan, type ScanState } from "../functions/src/scan/runScan";
import { pitchSeed } from "@/infrastructure/seed/pitch";
import {
  achievementSchema,
  epkSchema,
  formatSchema,
  galleryDocSchema,
  variantFolder,
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
  const storage = bucket();
  await storage.deleteFiles({ prefix: "public/gallery/" });
  const docs = await Promise.all(
    gallerySeed.map(async ({ id, alt, order }) => {
      const storagePath = `public/gallery/${id}.jpg`;
      const original = await readFile(join(process.cwd(), "public/images/gallery", `${id}.jpg`));
      await storage.file(storagePath).save(original, { contentType: "image/jpeg", resumable: false });
      const variants = await makeVariants(original);
      await Promise.all(
        variants.map((v) => storage.file(`${variantFolder(storagePath)}/${v.width}.webp`).save(v.data, { contentType: "image/webp", resumable: false })),
      );
      return galleryDocSchema.parse({ id, alt, order, storagePath, widths: variants.map((v) => v.width) });
    }),
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

/** Found events come from runScan + fixtures, dated "yesterday" like the mockup banner. */
async function seedFoundEvents() {
  for (const name of ["discoveredEvents", "scanRequests", "scans"]) await firestore.recursiveDelete(firestore.collection(name));
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const state = await runScan(
    {
      search: new FixtureSearch(),
      extractor: new FixtureExtractor(),
      store: {
        getState: async () => EMPTY_STATE,
        saveState: async (s: ScanState) => {
          await firestore.doc("scans/state").set(s);
        },
        existingHashes: async () => new Set<string>(),
        saveEvents: async (events) => {
          const batch = firestore.batch();
          for (const e of events) batch.set(firestore.collection("discoveredEvents").doc(e.hash), e);
          await batch.commit();
        },
      },
    },
    yesterday,
    "schedule",
  );
  console.log(`discoveredEvents: ${state.added}`);
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
  await seedFoundEvents();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
