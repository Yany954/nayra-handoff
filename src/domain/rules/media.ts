const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

/** Extracts the video id from youtu.be, watch, embed and shorts URLs. */
export function parseYouTubeId(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const host = parsed.hostname.replace(/^(www\.|m\.)/, "");
  let candidate: string | null = null;

  if (host === "youtu.be") {
    candidate = parsed.pathname.slice(1);
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const [, first, second] = parsed.pathname.split("/");
    candidate =
      first === "watch"
        ? parsed.searchParams.get("v")
        : ["embed", "shorts", "live"].includes(first)
          ? second
          : null;
  }
  return candidate && YOUTUBE_ID.test(candidate) ? candidate : null;
}

/** Digits only, ready for wa.me links. */
export function toWhatsAppNumber(phone: string): string {
  return phone.replace(/\D/g, "");
}

export type VideoPlatform = "YouTube" | "Instagram" | "TikTok" | "Facebook";

/** Where a video lives, from its URL; null for anything else. */
export function videoPlatform(url: string): VideoPlatform | null {
  let host: string;
  try {
    host = new URL(url).hostname.replace(/^www\.|^m\./, "");
  } catch {
    return null;
  }
  if (host === "youtu.be" || host.endsWith("youtube.com")) return "YouTube";
  if (host.endsWith("instagram.com")) return "Instagram";
  if (host.endsWith("tiktok.com")) return "TikTok";
  if (host.endsWith("facebook.com") || host === "fb.watch") return "Facebook";
  return null;
}
