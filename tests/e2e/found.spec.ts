import { expect, test } from "@playwright/test";

test.use({ storageState: "tests/e2e/.auth/admin.json" });
// These tests change data, so they run one after another (the seed has 4 found events).
test.describe.configure({ mode: "serial" });

test("found events show the scan status and sort by relevance", async ({ page }) => {
  await page.goto("/panel/promotores?vista=encontrados");
  await expect(page.getByText(/Búsqueda automática cada 3 días · última: ayer · próxima: en 2 días/)).toBeVisible();
  const scores = await page.getByText(/^Relevancia \d+%$/).allTextContents();
  const numbers = scores.map((s) => Number(s.replace(/\D/g, "")));
  expect(numbers.length).toBeGreaterThanOrEqual(2);
  expect(numbers).toEqual([...numbers].sort((a, b) => b - a));
  // The fixture's "ignore previous instructions" result never became an event.
  await expect(page.getByText(/IGNORA LAS INSTRUCCIONES/)).toHaveCount(0);
});

test("approving creates an auto prospect; discarding moves it to reviewed", async ({ page }) => {
  await page.goto("/panel/promotores?vista=encontrados");
  const card = page.locator("li", { hasText: "Fiestas patronales de Pelaya [ejemplo]" });
  await card.getByRole("button", { name: "Agregar como Prospecto" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Agregado a Prospectos" })).toBeVisible();

  const elBanco = page.locator("li", { hasText: "Feria ganadera de El Banco [ejemplo]" });
  await elBanco.getByRole("button", { name: /Descartar/ }).click();
  await expect(page.getByRole("status").filter({ hasText: "Descartado" })).toBeVisible();

  await page.getByText(/^Revisados \(\d+\)$/).click();
  await expect(page.locator("details li", { hasText: "Fiestas patronales de Pelaya" })).toContainText("Agregado a Prospectos");

  await page.goto("/panel/promotores?etapa=prospecto");
  const row = page.locator("tr", { hasText: "Fiestas patronales de Pelaya [ejemplo]" });
  await expect(row).toContainText("Auto");
  await expect(row).toContainText("Fiestas patronales");
});
