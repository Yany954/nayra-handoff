import { expect, test } from "@playwright/test";

const FS = "http://127.0.0.1:8080/v1/projects/demo-nayra/databases/(default)/documents";
const list = async (collection: string) =>
  ((await (await fetch(`${FS}/${collection}?pageSize=300`, { headers: { Authorization: "Bearer owner" } })).json()).documents ?? []) as {
    fields: Record<string, { stringValue?: string }>;
  }[];

test.describe.configure({ mode: "serial" });

test("errors stay next to each field, keep the typed values and focus the first one", async ({ page }) => {
  await page.goto("/#contacto");
  const form = page.getByRole("form", { name: "Formulario de contratación" });
  await form.getByLabel("Nombre").fill("Laura Prueba");
  await form.getByLabel("Mensaje").fill("corto");
  await page.waitForTimeout(3200);
  await form.getByRole("button", { name: "Enviar solicitud" }).click();
  await expect(form.getByRole("alert")).toContainText("Revisa los campos marcados");
  await expect(form.getByLabel("Teléfono / WhatsApp")).toBeFocused();
  await expect(form.getByText("Déjanos un teléfono o un correo")).toBeVisible();
  await expect(form.getByText("Necesitamos tu autorización")).toBeVisible();
  await expect(form.getByLabel("Nombre")).toHaveValue("Laura Prueba");
});

test("a valid request is saved with its prospect, and the confirmation takes focus", async ({ page }) => {
  const before = (await list("bookingRequests")).length;
  await page.goto("/#contacto");
  const form = page.getByRole("form", { name: "Formulario de contratación" });
  await form.getByLabel("Nombre").fill("Laura E2E");
  await form.getByLabel("Teléfono / WhatsApp").fill("300 123 4567");
  await form.getByLabel("Tipo de evento").selectOption("Boda / 15 años / cumpleaños");
  await form.getByLabel("Fecha").fill("2027-03-20");
  await form.getByLabel("Municipio").fill("Pailitas");
  await form.getByLabel("Mensaje").fill("Boda para 120 personas, queremos vallenato en vivo.");
  await form.getByRole("checkbox").check();
  await page.waitForTimeout(3200);
  await form.getByRole("button", { name: "Enviar solicitud" }).click();
  await expect(page.getByRole("heading", { name: "Solicitud enviada" })).toBeFocused();

  const requests = await list("bookingRequests");
  expect(requests.length).toBe(before + 1);
  const promoters = await list("promoters");
  expect(promoters.some((p) => p.fields.source?.stringValue === "web_form" && p.fields.city?.stringValue === "Pailitas")).toBe(true);
});

test("bots that fill the honeypot get a success screen but nothing is saved", async ({ page }) => {
  const before = (await list("bookingRequests")).length;
  await page.goto("/#contacto");
  const form = page.getByRole("form", { name: "Formulario de contratación" });
  await form.locator("input[name=website]").fill("http://spam.example", { force: true });
  await form.getByLabel("Nombre").fill("Bot");
  await form.getByRole("button", { name: "Enviar solicitud" }).click();
  await expect(page.getByRole("heading", { name: "Solicitud enviada" })).toBeVisible();
  expect((await list("bookingRequests")).length).toBe(before);
});

test("the privacy page is reachable from the form", async ({ page }) => {
  await page.goto("/#contacto");
  await page.getByRole("link", { name: "política de privacidad" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Privacidad" })).toBeVisible();
});
