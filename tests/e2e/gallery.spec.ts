import { expect, test } from "@playwright/test";

test.use({ storageState: "tests/e2e/.auth/admin.json" });

const objects = async (prefix: string) =>
  ((await (await fetch(`http://127.0.0.1:9199/v0/b/demo-nayra.appspot.com/o?prefix=${encodeURIComponent(prefix)}`)).json()).items ?? []).map(
    (i: { name: string }) => i.name,
  ) as string[];

test("uploading a photo stores light WebP copies and deleting removes them all", async ({ page }) => {
  await page.goto("/panel/galeria");
  await page.locator("#photo").setInputFiles("public/images/nayra-stage.jpg");
  await page.locator("#alt").fill("Foto de prueba e2e de las versiones livianas");
  await page.getByRole("button", { name: "Subir foto" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Foto agregada" })).toBeVisible({ timeout: 20_000 });

  const first = page.locator("ul > li").first();
  const src = await first.locator("img").getAttribute("src");
  expect(src).toMatch(/%2F(480|960|1600)\.webp/);
  const id = decodeURIComponent(src!.split("/o/")[1].split("?")[0]).split("/")[2];
  expect(await objects(`public/gallery/${id}/`)).toEqual(expect.arrayContaining([`public/gallery/${id}/480.webp`]));

  await first.getByRole("button", { name: "Borrar" }).click();
  await first.getByRole("button", { name: "Sí, borrar" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Foto borrada" })).toBeVisible();
  expect(await objects(`public/gallery/${id}`)).toEqual([]);
});

test("the principal video must be YouTube, and marking one unmarks the previous", async ({ page }) => {
  await page.goto("/panel/videos");
  await page.getByRole("button", { name: "+ Agregar video" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.locator("#title").fill("Reel de prueba");
  await dialog.locator("#url").fill("https://www.instagram.com/reel/abc/");
  await dialog.locator("#context").fill("Instagram");
  await dialog.locator("#featured").check();
  await dialog.getByRole("button", { name: "Guardar" }).click();
  await expect(dialog.locator("#featured-error")).toContainText("tiene que ser de YouTube");
  await expect(dialog.locator("#title")).toHaveValue("Reel de prueba");

  await dialog.locator("#url").fill("https://www.youtube.com/watch?v=B1muLVwUFz8");
  await dialog.getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Video agregado" })).toBeVisible();
  const principals = page.locator("li").filter({ has: page.getByText("Principal", { exact: true }) });
  await expect(principals).toHaveCount(1);
  await expect(principals).toContainText("Reel de prueba");

  // Clean up the test video (the seed's previous principal stays unmarked until the next seed).
  await principals.getByRole("button", { name: /Borrar/ }).click();
  await principals.getByRole("button", { name: "Sí, borrar" }).click();
});
