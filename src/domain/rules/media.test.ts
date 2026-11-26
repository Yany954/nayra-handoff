import { describe, expect, it } from "vitest";
import { parseYouTubeId, toWhatsAppNumber } from "@/domain/rules/media";

describe("parseYouTubeId", () => {
  it.each([
    "https://youtu.be/A9vZxH2VM-g?si=tracking",
    "https://www.youtube.com/watch?v=A9vZxH2VM-g&t=10",
    "https://m.youtube.com/watch?v=A9vZxH2VM-g",
    "https://www.youtube.com/embed/A9vZxH2VM-g",
    "https://www.youtube.com/shorts/A9vZxH2VM-g",
  ])("reads %s", (url) => {
    expect(parseYouTubeId(url)).toBe("A9vZxH2VM-g");
  });

  it.each([
    "https://www.youtube.com/@NAYRA-Lan",
    "https://www.tiktok.com/@nayra..lan",
    "https://evil.example/watch?v=A9vZxH2VM-g",
    "not a url",
  ])("rejects %s", (url) => {
    expect(parseYouTubeId(url)).toBeNull();
  });
});

describe("toWhatsAppNumber", () => {
  it("keeps only digits", () => {
    expect(toWhatsAppNumber("+57 317 470 3402")).toBe("573174703402");
  });
});

import { videoPlatform } from "@/domain/rules/media";

describe("videoPlatform", () => {
  it("recognizes where a video lives", () => {
    expect(videoPlatform("https://www.youtube.com/watch?v=B1muLVwUFz8")).toBe("YouTube");
    expect(videoPlatform("https://youtu.be/A9vZxH2VM-g")).toBe("YouTube");
    expect(videoPlatform("https://www.instagram.com/reel/abc/")).toBe("Instagram");
    expect(videoPlatform("https://www.tiktok.com/@nayra..lan/video/1")).toBe("TikTok");
    expect(videoPlatform("https://fb.watch/xyz")).toBe("Facebook");
    expect(videoPlatform("https://example.com/v")).toBeNull();
    expect(videoPlatform("no es url")).toBeNull();
  });
});
