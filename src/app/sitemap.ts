import type { MetadataRoute } from "next";
import { SITE_URL } from "./site-url";

/** Public pages only; the panel is private and disallowed in robots.ts. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/galeria`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/privacidad`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
