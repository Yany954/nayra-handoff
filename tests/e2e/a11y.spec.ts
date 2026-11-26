import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/** WCAG 2.2 A + AA (includes ISO/IEC 40500 = WCAG 2.0). */
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const VIEWPORTS = [
  { name: "320", width: 320, height: 720 }, // WCAG 1.4.10 reflow
  { name: "390", width: 390, height: 844 },
  { name: "1440", width: 1440, height: 900 },
];

const PUBLIC_PAGES = ["/", "/repertorio", "/galeria", "/privacidad", "/panel/login"];
const PANEL_PAGES = [
  "/panel",
  "/panel/promotores",
  "/panel/promotores?vista=encontrados",
  "/panel/logros",
  "/panel/repertorio",
  "/panel/shows",
  "/panel/formatos",
  "/panel/galeria",
  "/panel/videos",
  "/panel/epk",
  "/panel/epk/editar",
  "/panel/pitch",
  "/panel/pitch?vista=plantillas",
];

async function audit(page: Page, path: string) {
  await page.goto(path, { waitUntil: "networkidle" });
  // Lazy images and streamed content: scroll once through the page before scanning.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 30));
    }
    window.scrollTo(0, 0);
  });
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  const summary = results.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    help: v.help,
    targets: v.nodes.slice(0, 5).map((n) => n.target.join(" ")),
  }));
  expect(summary, `${path} has WCAG A/AA violations`).toEqual([]);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflow, `${path} scrolls horizontally`).toBe(false);
}

for (const viewport of VIEWPORTS) {
  test.describe(`public @${viewport.name}`, () => {
    test.use({ viewport });
    for (const path of PUBLIC_PAGES) test(path, async ({ page }) => audit(page, path));
  });

  test.describe(`panel @${viewport.name}`, () => {
    test.use({ viewport, storageState: "tests/e2e/.auth/admin.json" });
    for (const path of PANEL_PAGES) test(path, async ({ page }) => audit(page, path));
  });
}
