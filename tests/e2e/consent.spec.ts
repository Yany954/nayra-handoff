import { expect, test } from "@playwright/test";

/** Runs only when the app has a GA id (NEXT_PUBLIC_GA_ID); without it there is no banner at all. */
const GOOGLE = /googletagmanager\.com|google-analytics\.com/;

test.describe("cookie consent", () => {
  test.skip(!process.env.NEXT_PUBLIC_GA_ID, "NEXT_PUBLIC_GA_ID not set");

  test("rejecting loads nothing from Google; accepting loads gtag and tracks contact clicks", async ({ page }) => {
    const googleRequests: string[] = [];
    page.on("request", (r) => {
      if (GOOGLE.test(r.url())) googleRequests.push(r.url());
    });
    await page.goto("/");
    const banner = page.getByRole("region", { name: "Aviso de cookies" });
    await expect(banner).toBeVisible();
    await banner.getByRole("button", { name: "Rechazar" }).click();
    await expect(banner).toBeHidden();
    await page.reload();
    await page.waitForLoadState("networkidle");
    expect(googleRequests).toEqual([]);

    // Change of mind from the footer.
    await page.getByRole("button", { name: "Preferencias de cookies" }).click();
    await page.getByRole("region", { name: "Aviso de cookies" }).getByRole("button", { name: "Aceptar" }).click();
    await expect.poll(() => googleRequests.some((u) => u.includes("gtag/js"))).toBe(true);
    const events = await page.evaluate(() => (window.dataLayer ?? []).map((args) => Array.from(args as ArrayLike<unknown>)));
    expect(events.some((e) => e[0] === "event" && e[1] === "page_view")).toBe(true);

    await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Contrátala" }).click();
    const after = await page.evaluate(() => (window.dataLayer ?? []).map((args) => Array.from(args as ArrayLike<unknown>)));
    expect(after.some((e) => e[0] === "event" && e[1] === "contact_cta")).toBe(true);
  });
});
