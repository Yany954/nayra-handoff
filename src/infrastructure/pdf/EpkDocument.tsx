import "server-only";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Document, Font, Image, Link, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import type { EpkDocumentData } from "@/application/public-site";
import { formatDuration } from "@/domain/rules/formats";

const ASSETS = join(process.cwd(), "src/assets");
const font = (file: string) => join(ASSETS, "fonts", file);

Font.register({
  family: "Inter",
  fonts: [
    { src: font("inter-latin-400-normal.woff"), fontWeight: 400 },
    { src: font("inter-latin-600-normal.woff"), fontWeight: 600 },
  ],
});
Font.register({
  family: "Bricolage",
  fonts: [
    { src: font("bricolage-grotesque-latin-500-normal.woff"), fontWeight: 500 },
    { src: font("bricolage-grotesque-latin-700-normal.woff"), fontWeight: 700 },
  ],
});
// Spanish text: never hyphenate words in the middle.
Font.registerHyphenationCallback((word) => [word]);

const C = {
  ink: "#0F0C0E",
  cream: "#F4EEE4",
  light: "#F6EFE6",
  soft: "#E6DDD2",
  mutedDark: "#C9BFB4",
  dark: "#1A1416",
  body: "#3A302C",
  mutedLight: "#6B5F57",
  accent: "#F0B24A",
  line: "#E4DACB",
};

const s = StyleSheet.create({
  page: { fontFamily: "Inter", fontSize: 10.5, color: C.dark, backgroundColor: C.cream, padding: 40, lineHeight: 1.5 },
  cover: { backgroundColor: C.ink, color: C.light, padding: 0 },
  coverPhoto: { position: "absolute", top: 0, left: 0, right: 0, height: 540, objectFit: "cover" },
  // Bands overlap by 1pt so viewers never show hairline seams between them.
  coverBand: { position: "absolute", left: 0, right: 0, height: 7, backgroundColor: C.ink },
  coverBody: { position: "absolute", left: 40, right: 40, bottom: 40, gap: 12 },
  eyebrow: { fontSize: 9, letterSpacing: 1.4, textTransform: "uppercase", color: C.accent, fontWeight: 600 },
  name: { fontFamily: "Bricolage", fontWeight: 700, fontSize: 44, lineHeight: 1, color: C.light },
  title: { fontFamily: "Bricolage", fontWeight: 700, fontSize: 64, lineHeight: 1, color: C.light },
  intro: { fontSize: 12, lineHeight: 1.55, color: C.soft },
  stats: { flexDirection: "row", gap: 10, marginTop: 6 },
  stat: { borderWidth: 1, borderColor: "#3A3438", borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14 },
  statValue: { fontFamily: "Bricolage", fontWeight: 700, fontSize: 20, lineHeight: 1.2, color: C.light },
  statLabel: { fontSize: 8.5, lineHeight: 1.3, color: C.mutedDark },
  h2: { fontFamily: "Bricolage", fontWeight: 700, fontSize: 24, lineHeight: 1.15, marginBottom: 12, color: C.dark },
  h3: { fontFamily: "Bricolage", fontWeight: 700, fontSize: 14, marginBottom: 6, color: C.dark },
  lead: { fontFamily: "Bricolage", fontWeight: 500, fontSize: 15, lineHeight: 1.35, marginBottom: 18 },
  section: { marginBottom: 18 },
  bullet: { flexDirection: "row", gap: 6, marginBottom: 4 },
  dot: { width: 8, color: C.mutedLight },
  card: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: C.line, borderRadius: 12, padding: 14 },
  factRow: { flexDirection: "row", justifyContent: "space-between", gap: 12, paddingVertical: 6, borderTopWidth: 1, borderColor: C.line },
  factLabel: { width: 70, color: C.mutedLight },
  factValue: { flex: 1, fontWeight: 600, textAlign: "right" },
  columns: { flexDirection: "row", gap: 16 },
  col: { flex: 1 },
  formatRow: { paddingVertical: 6, borderTopWidth: 1, borderColor: C.line },
  link: { color: C.dark, textDecoration: "underline" },
  photos: { flexDirection: "row", gap: 12, marginTop: 4 },
  photo: { flex: 1, height: 300, borderRadius: 12, objectFit: "cover" },
  footer: { position: "absolute", bottom: 22, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", fontSize: 8, color: C.mutedLight },
});

const NETWORK_NAMES: Record<string, string> = { instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube", facebook: "Facebook" };

function Bullets({ items }: { items: string[] }) {
  return (
    <View>
      {items.map((item) => (
        <View key={item} style={s.bullet}>
          <Text style={s.dot}>•</Text>
          <Text style={{ flex: 1 }}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function Footer({ name }: { name: string }) {
  return (
    <View style={s.footer} fixed>
      <Text>{name} · EPK</Text>
      <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}

export function EpkDocument({ data, heroPhoto, photos }: { data: EpkDocumentData; heroPhoto: Buffer; photos: Buffer[] }) {
  const { profile, epk, achievements, formats, formatsSummary, videos } = data;
  const contact = [
    profile.bookingEmail && { label: "Correo", value: profile.bookingEmail, href: `mailto:${profile.bookingEmail}` },
    profile.whatsapp && { label: "WhatsApp", value: profile.whatsapp, href: `https://wa.me/${profile.whatsapp.replace(/\D/g, "")}` },
    ...profile.socials.map((s) => ({ label: NETWORK_NAMES[s.network], value: s.handle, href: s.url })),
  ].filter((c): c is { label: string; value: string; href: string } => Boolean(c));
  const facts = [
    ["Ciudad base", profile.base],
    ["Géneros", profile.genresSummary],
    ["Formatos", formatsSummary.names],
    ["Duración", formatsSummary.durations],
    ["Integrantes", formatsSummary.members],
    ["Cobertura", `${epk.coverageStat} ${epk.coverageStatLabel}`],
    ["Tarifa", epk.rate],
  ];

  return (
    <Document title={`EPK — ${profile.name}`} author={profile.name} subject="Kit de prensa" language="es" creator="Panel de Nayra Lancheros">
      {/* 1. Cover */}
      <Page size="A4" style={[s.page, s.cover]}>
        {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt; the PDF is not tagged (see AUDIT.md §7). */}
        <Image src={heroPhoto} style={s.coverPhoto} />
        {Array.from({ length: 30 }, (_, i) => (
          <View key={i} style={[s.coverBand, { top: 360 + i * 6, opacity: ((i + 1) / 30) ** 1.4 }]} />
        ))}
        <View style={s.coverBody}>
          <Text style={s.eyebrow}>{epk.eyebrow}</Text>
          <Text style={s.name}>{profile.name}</Text>
          <Text style={s.title}>EPK</Text>
          <Text style={s.intro}>{epk.intro}</Text>
          <View style={s.stats}>
            {[
              [String(formatsSummary.count), "formatos"],
              [formatsSummary.durationRange, "minutos"],
              [epk.coverageStat, epk.coverageStatLabel],
            ].map(([value, label]) => (
              <View key={label} style={s.stat}>
                <Text style={s.statValue}>{value}</Text>
                <Text style={s.statLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </View>
      </Page>

      {/* 2. Bio, achievements, quick facts, formats */}
      <Page size="A4" style={s.page}>
        <Text style={s.eyebrow}>Bio</Text>
        <Text style={s.lead}>{profile.bioShort}</Text>
        <View style={s.columns}>
          <View style={[s.col, s.section]}>
            <Text style={s.h3}>Logros</Text>
            <Bullets items={achievements.map((a) => a.epkLine)} />
          </View>
          <View style={[s.col, s.card]}>
            <Text style={s.h3}>Datos rápidos</Text>
            {facts.map(([label, value]) => (
              <View key={label} style={s.factRow}>
                <Text style={s.factLabel}>{label}</Text>
                <Text style={s.factValue}>{value}</Text>
              </View>
            ))}
          </View>
        </View>
        <Footer name={profile.name} />
      </Page>

      {/* 3. Formats and riders */}
      <Page size="A4" style={s.page}>
        <View style={s.section}>
          <Text style={s.h2}>Formatos</Text>
          {formats.map((f) => (
            <View key={f.id} style={s.formatRow} wrap={false}>
              <Text style={{ fontWeight: 600 }}>
                {f.name} · {formatDuration(f)} · {f.membersLabel}
              </Text>
              <Text style={{ color: C.mutedLight }}>{f.idealFor}</Text>
            </View>
          ))}
        </View>
        <Text style={[s.h2, { marginTop: 8 }]}>Rider</Text>
        <View style={[s.columns, s.section]}>
          <View style={s.col}>
            <Text style={s.h3}>Técnico</Text>
            <Bullets items={epk.technicalRider} />
          </View>
          <View style={s.col}>
            <Text style={s.h3}>Hospitalidad y logística</Text>
            <Bullets items={epk.hospitalityRider} />
          </View>
        </View>
        <Footer name={profile.name} />
      </Page>

      {/* 4. Videos, booking contact and press photos */}
      <Page size="A4" style={s.page}>
        <Text style={s.h2}>Contacto y material</Text>
        <View style={[s.columns, s.section]}>
          <View style={s.col}>
            <Text style={s.h3}>Videos en vivo</Text>
            {videos.map((v) => (
              <Text key={v.id} style={{ marginBottom: 4 }}>
                <Link src={v.url} style={s.link}>
                  {v.title}
                </Link>
                <Text style={{ color: C.mutedLight }}> · {v.context}</Text>
              </Text>
            ))}
          </View>
          <View style={[s.col, s.card]}>
            <Text style={s.h3}>Booking</Text>
            {contact.map((c) => (
              <View key={c.label} style={s.factRow}>
                <Text style={s.factLabel}>{c.label}</Text>
                <Link src={c.href} style={[s.factValue, s.link]}>
                  {c.value}
                </Link>
              </View>
            ))}
          </View>
        </View>
        {photos.length > 0 && (
          <View style={s.photos}>
            {photos.map((photo, i) => (
              // eslint-disable-next-line jsx-a11y/alt-text -- see AUDIT.md §7 (PDF/UA).
              <Image key={i} src={photo} style={s.photo} />
            ))}
          </View>
        )}
        <Footer name={profile.name} />
      </Page>
    </Document>
  );
}

/** Renders the EPK to PDF bytes. Photos are fetched here so a slow image never breaks the layout. */
export async function renderEpkPdf(data: EpkDocumentData): Promise<Buffer> {
  const heroPhoto = readFileSync(join(process.cwd(), "public/images/nayra-singing.jpg"));
  const photos = (
    await Promise.all(
      data.photos.map(async (p) => {
        try {
          const response = await fetch(p.src, { signal: AbortSignal.timeout(8000) });
          return response.ok ? Buffer.from(await response.arrayBuffer()) : null;
        } catch {
          return null;
        }
      }),
    )
  ).filter((b) => b !== null);
  return renderToBuffer(<EpkDocument data={data} heroPhoto={heroPhoto} photos={photos} />);
}
