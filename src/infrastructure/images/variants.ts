import sharp from "sharp";

/** Widths generated for every gallery photo; the image loader picks one per screen. */
export const VARIANT_WIDTHS = [480, 960, 1600] as const;

/**
 * One WebP copy per width, ALWAYS all of them: the image loader may ask for any width, so a small
 * original still gets every file (never upscaled, so the bigger ones are just the original size).
 * Auto-rotated from EXIF, and sharp drops metadata (no GPS).
 */
export async function makeVariants(original: Uint8Array): Promise<{ width: number; data: Buffer }[]> {
  const source = sharp(original).rotate();
  return Promise.all(
    VARIANT_WIDTHS.map(async (w) => ({
      width: w,
      data: await source.clone().resize({ width: w, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer(),
    })),
  );
}
