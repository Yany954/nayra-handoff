/**
 * next/image loader. App Hosting does not resize images, so the site serves pre-generated WebP
 * copies (480 / 960 / 1600 px) and this picks the smallest one that is at least as wide as asked.
 * - Gallery photos from Storage carry a "__W__" placeholder in their URL (see publicStorageUrl).
 * - Fixed photos under /images/ have siblings named "<name>-<width>.webp" (scripts/make-static-variants).
 */
const WIDTHS = [480, 960, 1600];
/** Fixed photos that have WebP siblings in public/images. */
const STATIC_WITH_VARIANTS = new Set(["nayra-stage", "nayra-singing"]);

function pick(width: number): number {
  return WIDTHS.find((w) => w >= width) ?? WIDTHS[WIDTHS.length - 1];
}

export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }): string {
  if (src.includes("__W__")) return src.replace("__W__", String(pick(width)));
  const local = src.match(/^\/images\/([\w-]+)\.jpg$/);
  if (local && STATIC_WITH_VARIANTS.has(local[1])) return `/images/${local[1]}-${pick(width)}.webp`;
  // No variants: the original, with the width as a harmless hint so next/image builds a srcset.
  return `${src}${src.includes("?") ? "&" : "?"}w=${width}`;
}
