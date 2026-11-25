import { expect, test } from "@playwright/test";

test.use({ storageState: "tests/e2e/.auth/admin.json" });

test("generates a pitch from a promoter and builds the Gmail link", async ({ page }) => {
  await page.goto("/panel/pitch");
  await page.getByLabel("¿A quién le escribes?").selectOption({ label: "Festival [ejemplo] · En negociación" });
  await expect(page.getByRole("button", { name: "Festival / feria" })).toHaveAttribute("aria-pressed", "true");
  const body = page.getByLabel("Cuerpo del correo");
  await expect(body).toHaveValue(/Estimado\/a Casa de la Cultura:/);
  await expect(body).toHaveValue(/Me gustaría proponer mi show para la programación de Festival \[ejemplo\]/);
  await expect(body).toHaveValue(/\+57 317 470 3402/);

  // Manual edits are kept and go into the Gmail link.
  await page.getByLabel("Asunto").fill("Asunto editado a mano");
  const gmail = new URL((await page.getByRole("link", { name: /Abrir en Gmail/ }).getAttribute("href"))!);
  expect(gmail.hostname).toBe("mail.google.com");
  expect(gmail.searchParams.get("su")).toBe("Asunto editado a mano");
  expect(gmail.searchParams.get("authuser")).toBe("contacto.nayra.lancheros@gmail.com");

  // Switching the recipient kind regenerates the draft.
  await page.getByRole("button", { name: "Hotel / restaurante" }).click();
  await expect(page.getByLabel("Asunto")).toHaveValue("Música en vivo para su espacio — Nayra Lancheros");
});

test("free-text recipient without a name greets generically", async ({ page }) => {
  await page.goto("/panel/pitch");
  await page.getByLabel("¿A quién le escribes?").selectOption("otro");
  await expect(page.getByLabel("Cuerpo del correo")).toHaveValue(/^Buen día:/);
  await page.getByLabel("Nombre de la persona o entidad").fill("Alcaldía de Pelaya");
  await expect(page.getByLabel("Cuerpo del correo")).toHaveValue(/^Estimado\/a Alcaldía de Pelaya:/);
  await expect(page.getByRole("button", { name: /marcar «Contactado»/ })).toBeDisabled();
});

test("the EPK PDF downloads for the admin", async ({ page }) => {
  await page.goto("/panel/epk");
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("link", { name: "Descargar PDF" }).click()]);
  expect(download.suggestedFilename()).toBe("EPK-Nayra-Lancheros.pdf");
  const bytes = Buffer.concat(await (await download.createReadStream()).toArray());
  expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
  expect(bytes.length).toBeGreaterThan(50_000);
});

test.describe("without a session", () => {
  test.use({ storageState: { cookies: [], origins: [] } });
  test("the PDF is not reachable", async ({ request }) => {
    const response = await request.get("/panel/epk/pdf", { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    expect(response.headers().location).toContain("/panel/login");
  });
});

test("«Adaptar con IA» shows a suggestion that is only applied on request", async ({ page }) => {
  await page.goto("/panel/pitch");
  await page.getByLabel("¿A quién le escribes?").selectOption({ label: "Festival [ejemplo] · En negociación" });
  const body = page.getByLabel("Cuerpo del correo");
  const before = await body.inputValue();
  await page.getByRole("button", { name: "Adaptar párrafo con IA" }).click();
  // Without OPENAI_API_KEY the emulator answers with a labelled test suggestion.
  const suggestion = page.getByRole("status").filter({ hasText: "Sugerencia" });
  await expect(suggestion).toContainText("Festival [ejemplo]");
  await expect(body).toHaveValue(before);
  await suggestion.getByRole("button", { name: "Usar este párrafo" }).click();
  await expect(body).toHaveValue(/Me encantaría ser parte de Festival \[ejemplo\] en Tamalameque/);
  await expect(body).toHaveValue(/^Estimado\/a Casa de la Cultura:/);
});
