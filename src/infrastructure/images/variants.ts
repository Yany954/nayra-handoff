import sharp from "sharp";

/** Widths generated for every gallery photo; the image loader picks one per screen. */
export const VARIANT_WIDTHS = [480, 960, 1600] as const;

/** WebP copies at each width (never upscaled), auto-rotated from EXIF and without metadata (no GPS). */
export async function makeVariants(original: Uint8Array): Promise<{ width: number; data: Buffer }[]> {
  const source = sharp(original).rotate();
  const { width = 0 } = await source.metadata();
  const widths = VARIANT_WIDTHS.filter((w) => w <= Math.max(width, VARIANT_WIDTHS[0]));
  return Promise.all(
    widths.map(async (w) => ({
      width: w,
      data: await source.clone().resize({ width: w, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer(),
    })),
  );
}
