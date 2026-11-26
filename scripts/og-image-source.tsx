/**
 * Source of src/app/opengraph-image.jpg (the link preview). Next renders this as a PNG of ~500 KB,
 * too heavy for WhatsApp previews (~300 KB limit), so the committed image is a 53 KB JPEG made from it:
 * temporarily copy this file to src/app/opengraph-image.tsx, open /opengraph-image, then
 *   node -e 'require("sharp")("og.png").jpeg({quality:82,mozjpeg:true}).toFile("src/app/opengraph-image.jpg")'
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/** Link preview for WhatsApp, Facebook, X… Generated once at build from local assets. */
export const alt = "Nayra Lancheros — cantante de vallenato, rancheras, baladas y tambora";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const asset = (...parts: string[]) => join(process.cwd(), "src/assets", ...parts);

export default async function OpenGraphImage() {
  const [photo, display, text] = await Promise.all([
    readFile(join(process.cwd(), "public/images/nayra-stage.jpg"), "base64"),
    readFile(asset("fonts", "bricolage-grotesque-latin-700-normal.woff")),
    readFile(asset("fonts", "inter-latin-600-normal.woff")),
  ]);
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#0F0C0E", color: "#F6EFE6" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 22, padding: "0 56px", width: 640 }}>
          <div style={{ display: "flex", fontFamily: "Inter", fontSize: 22, color: "#F0B24A", letterSpacing: 3, textTransform: "uppercase" }}>
            Booking · Cesar y Caribe
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontFamily: "Bricolage", fontSize: 104, lineHeight: 0.92, letterSpacing: -4 }}>
            <span>Nayra</span>
            <span>Lancheros</span>
          </div>
          <div style={{ display: "flex", fontFamily: "Inter", fontSize: 28, color: "#C9BFB4" }}>Vallenato · Rancheras · Baladas · Tambora</div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain <img> */}
        <img src={`data:image/jpeg;base64,${photo}`} alt="" width={560} height={630} style={{ objectFit: "cover", objectPosition: "center 20%" }} />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Bricolage", data: display, weight: 700, style: "normal" },
        { name: "Inter", data: text, weight: 600, style: "normal" },
      ],
    },
  );
}
