/** One-off: WebP copies of the fixed site photos (public/images/*.jpg) for the image loader. */
import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const NAMES = ["nayra-stage", "nayra-singing"];
const WIDTHS = [480, 960, 1600];

async function main() {
for (const name of NAMES) {
  const original = await readFile(`public/images/${name}.jpg`);
  for (const width of WIDTHS) {
    const data = await sharp(original).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();
    await writeFile(`public/images/${name}-${width}.webp`, data);
    console.log(`${name}-${width}.webp ${Math.round(data.length / 1024)} KB`);
  }
}
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
