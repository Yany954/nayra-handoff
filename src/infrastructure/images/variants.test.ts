import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { VARIANT_WIDTHS, makeVariants } from "@/infrastructure/images/variants";

describe("makeVariants", () => {
  it("always returns every width the loader may request, never upscaling", async () => {
    const small = await sharp({ create: { width: 600, height: 800, channels: 3, background: "#996633" } }).jpeg().toBuffer();
    const variants = await makeVariants(small);
    expect(variants.map((v) => v.width)).toEqual([...VARIANT_WIDTHS]);
    for (const v of variants) {
      const meta = await sharp(v.data).metadata();
      expect(meta.format).toBe("webp");
      expect(meta.width).toBeLessThanOrEqual(600);
    }
  });
});
