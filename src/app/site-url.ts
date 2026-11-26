/** Public base URL (metadata, sitemap, JSON-LD). Set in apphosting.yaml; localhost in development. */
export const SITE_URL = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
