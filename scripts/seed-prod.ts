/**
 * One-time import of the initial content into the REAL Firebase project.
 *
 *   gcloud auth application-default login      # once, your Google account
 *   npm run seed:prod -- --project nayra-lancheros
 *
 * Safety: it only ADDS. A document or collection that already has data is skipped, so it
 * never overwrites what the manager edited in the panel. It refuses to run against the
 * emulators, asks you to type the project id, and never loads the dev-only [ejemplo] data.
 */
import { createInterface } from "node:readline/promises";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";

const args = process.argv.slice(2);
const project = args[args.indexOf("--project") + 1];
if (!args.includes("--project") || !project || project.startsWith("demo-")) {
  console.error("Usage: npm run seed:prod -- --project <real-project-id>");
  process.exit(1);
}
for (const name of ["FIRESTORE_EMULATOR_HOST", "FIREBASE_STORAGE_EMULATOR_HOST", "FIREBASE_AUTH_EMULATOR_HOST"]) {
  if (process.env[name]) {
    console.error(`Refusing: ${name} is set, this would talk to the emulator. Run it in a clean shell.`);
    process.exit(1);
  }
}
process.env.GCLOUD_PROJECT = project;

async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const typed = (await rl.question(`This writes the initial content to "${project}" (only where empty). Type the project id to continue: `)).trim();
  rl.close();
  if (typed !== project) {
    console.error("Cancelled.");
    process.exit(1);
  }

  // Imported after the env is set, so the Admin SDK targets the real project.
  const { bucket, db, storageBucketName } = await import("@/infrastructure/firebase/admin");
  const schemas = await import("@/infrastructure/schemas/content");
  const { pitchSchema } = await import("@/infrastructure/schemas/panel");
  const seed = await import("@/infrastructure/seed/content");
  const { pitchSeed } = await import("@/infrastructure/seed/pitch");
  const firestore = db();
  console.log(`Project ${project} · bucket ${storageBucketName()}`);

  async function docIfMissing(path: string, data: object) {
    const ref = firestore.doc(path);
    if ((await ref.get()).exists) return console.log(`${path}: exists, skipped`);
    await ref.set(data);
    console.log(`${path}: created`);
  }

  async function collectionIfEmpty<T extends { id: string }>(name: string, schema: z.ZodType<T>, rows: unknown[]) {
    if (!(await firestore.collection(name).limit(1).get()).empty) return console.log(`${name}: has data, skipped`);
    const batch = firestore.batch();
    for (const { id, ...data } of z.array(schema).parse(rows)) batch.set(firestore.collection(name).doc(id), data);
    await batch.commit();
    console.log(`${name}: ${rows.length} created`);
  }

  await docIfMissing("profile/main", schemas.profileSchema.parse(seed.profileSeed));
  await docIfMissing("epk/main", schemas.epkSchema.parse(seed.epkSeed));
  await docIfMissing("pitch/main", pitchSchema.parse(pitchSeed));
  await collectionIfEmpty("achievements", schemas.achievementSchema, seed.achievementsSeed);
  await collectionIfEmpty("shows", schemas.showSchema, seed.showsSeed);
  await collectionIfEmpty("songs", schemas.publicSongSchema, seed.songsSeed);
  await collectionIfEmpty("formats", schemas.formatSchema, seed.formatsSeed);
  await collectionIfEmpty("videos", schemas.videoSchema, seed.videosSeed);

  // Gallery: upload each photo, then its document. Existing gallery → skip everything.
  if (!(await firestore.collection("gallery").limit(1).get()).empty) {
    console.log("gallery: has data, skipped");
  } else {
    const storage = bucket();
    const { makeVariants } = await import("@/infrastructure/images/variants");
    const batch = firestore.batch();
    const cache = { cacheControl: "public, max-age=31536000, immutable" };
    for (const { id, alt, order } of seed.gallerySeed) {
      const storagePath = `public/gallery/${id}.jpg`;
      const original = await readFile(join(process.cwd(), "public/images/gallery", `${id}.jpg`));
      await storage.file(storagePath).save(original, { contentType: "image/jpeg", resumable: false, metadata: cache });
      const variants = await makeVariants(original);
      for (const v of variants) {
        await storage.file(`${schemas.variantFolder(storagePath)}/${v.width}.webp`).save(v.data, { contentType: "image/webp", resumable: false, metadata: cache });
      }
      batch.set(
        firestore.collection("gallery").doc(id),
        schemas.galleryDocSchema.omit({ id: true }).parse({ alt, order, storagePath, widths: variants.map((v) => v.width) }),
      );
    }
    await batch.commit();
    console.log(`gallery: ${seed.gallerySeed.length} photos uploaded`);
  }
  console.log("Done. Promoters and found events start empty in production.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
