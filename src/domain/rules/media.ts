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
