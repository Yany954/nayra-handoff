import { describe, expect, it } from "vitest";
import imageLoader from "@/presentation/ui/image-loader";

describe("image loader", () => {
  it("picks the smallest variant that is wide enough", () => {
    const src = "https://firebasestorage.googleapis.com/v0/b/x/o/public%2Fgallery%2Fabc%2F__W__.webp?alt=media";
    expect(imageLoader({ src, width: 384 })).toContain("%2F480.webp");
    expect(imageLoader({ src, width: 828 })).toContain("%2F960.webp");
    expect(imageLoader({ src, width: 3840 })).toContain("%2F1600.webp");
  });

  it("maps fixed photos to their WebP siblings and leaves the rest untouched", () => {
    expect(imageLoader({ src: "/images/nayra-stage.jpg", width: 640 })).toBe("/images/nayra-stage-960.webp");
    expect(imageLoader({ src: "/images/otra.jpg", width: 640 })).toBe("/images/otra.jpg?w=640");
    expect(imageLoader({ src: "https://x/y.jpg?alt=media", width: 640 })).toBe("https://x/y.jpg?alt=media&w=640");
  });
});
