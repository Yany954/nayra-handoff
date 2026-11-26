/**
 * Adds the light WebP copies to gallery photos that do not have them yet (only ADDS files and
 * the `widths` field; originals are untouched). Works on the emulator or on a real project:
 *
 *   npm run images:backfill -- --project nayra-lancheros     (gcloud auth application-default login)
 */
const args = process.argv.slice(2);
const project = args.includes("--project") ? args[args.indexOf("--project") + 1] : undefined;
if (project) process.env.GCLOUD_PROJECT = project;

async function main() {
  const { bucket, db, storageBucketName } = await import("@/infrastructure/firebase/admin");
  const { makeVariants } = await import("@/infrastructure/images/variants");
  const { variantFolder } = await import("@/infrastructure/schemas/content");
  const storage = bucket();
  const photos = await db().collection("gallery").get();
  console.log(`${photos.size} photos in ${process.env.GCLOUD_PROJECT} · bucket ${storageBucketName()}`);
  let done = 0;
  for (const doc of photos.docs) {
    const widths = (doc.get("widths") as number[] | undefined) ?? [];
    // Every width the loader may ask for must exist (480 / 960 / 1600).
    if ([480, 960, 1600].every((w) => widths.includes(w))) continue;
    const storagePath = doc.get("storagePath") as string;
    const [original] = await storage.file(storagePath).download();
    const variants = await makeVariants(original);
    for (const v of variants) {
      await storage.file(`${variantFolder(storagePath)}/${v.width}.webp`).save(v.data, {
        contentType: "image/webp",
        resumable: false,
        metadata: { cacheControl: "public, max-age=31536000, immutable" },
      });
    }
    await doc.ref.update({ widths: variants.map((v) => v.width) });
    done++;
    console.log(`${doc.id}: ${variants.map((v) => `${v.width}px ${Math.round(v.data.length / 1024)}KB`).join(", ")}`);
  }
  console.log(`Done: ${done} photos converted.`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
