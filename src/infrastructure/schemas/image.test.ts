import { describe, expect, it } from "vitest";
import { checkGalleryImage } from "@/infrastructure/schemas/image";

const bytes = (...values: number[]) => new Uint8Array(values);
const text = (s: string) => [...s].map((c) => c.charCodeAt(0));

describe("gallery image check", () => {
  it("recognizes JPEG, PNG and WebP by their bytes", () => {
    expect(checkGalleryImage(bytes(0xff, 0xd8, 0xff, 0xe0))).toEqual({ ok: true, type: "image/jpeg" });
    expect(checkGalleryImage(bytes(0x89, ...text("PNG"), 0x0d))).toEqual({ ok: true, type: "image/png" });
    expect(checkGalleryImage(bytes(...text("RIFF"), 0, 0, 0, 0, ...text("WEBP")))).toEqual({ ok: true, type: "image/webp" });
  });

  it("rejects empty files, other formats and anything over 10 MB", () => {
    expect(checkGalleryImage(bytes()).ok).toBe(false);
    expect(checkGalleryImage(bytes(...text("%PDF-1.7"))).ok).toBe(false);
    expect(checkGalleryImage(bytes(...text("<svg")))).toMatchObject({ ok: false, message: "Solo fotos JPG, PNG o WebP." });
    const huge = new Uint8Array(10 * 1024 * 1024 + 1);
    huge.set([0xff, 0xd8, 0xff]);
    expect(checkGalleryImage(huge)).toMatchObject({ ok: false, message: "La foto pesa más de 10 MB." });
  });
});
