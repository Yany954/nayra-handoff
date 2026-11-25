import { GALLERY_MAX_BYTES, GALLERY_TYPES } from "@/infrastructure/schemas/panel";

type GalleryType = (typeof GALLERY_TYPES)[number];

/** Identifies the image by its first bytes; the browser-declared type is not trusted. */
export function sniffImageType(bytes: Uint8Array): GalleryType | null {
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes[0] === 0x89 && ascii(1, 4) === "PNG") return "image/png";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  return null;
}

export type ImageCheck = { ok: true; type: GalleryType } | { ok: false; message: string };

export function checkGalleryImage(bytes: Uint8Array): ImageCheck {
  if (bytes.byteLength === 0) return { ok: false, message: "Elige una foto." };
  if (bytes.byteLength > GALLERY_MAX_BYTES) return { ok: false, message: "La foto pesa más de 10 MB." };
  const type = sniffImageType(bytes);
  if (!type) return { ok: false, message: "Solo fotos JPG, PNG o WebP." };
  return { ok: true, type };
}
