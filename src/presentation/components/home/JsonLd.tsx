import type { Profile } from "@/domain/entities";

/** schema.org Person for search engines: who she is, what she sings, where, and how to book her. */
export function PersonJsonLd({ profile, siteUrl }: { profile: Profile; siteUrl: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: "Cantante",
    description: profile.bioShort,
    url: siteUrl,
    image: `${siteUrl}/opengraph-image.jpg`,
    genre: profile.genresSummary.split("·").map((g) => g.trim()).filter(Boolean),
    homeLocation: { "@type": "Place", name: profile.base },
    sameAs: profile.socials.map((s) => s.url),
    ...(profile.bookingEmail ? { email: profile.bookingEmail } : {}),
    ...(profile.whatsapp ? { telephone: profile.whatsapp } : {}),
  };
  // "<" is escaped so content can never close the script tag.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
