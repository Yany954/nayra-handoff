import { expect, test } from "@playwright/test";

/** Manual WCAG checks that axe cannot see, automated so they do not regress. */

test("skip link is the first stop and moves focus to the content (2.4.1)", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Saltar al contenido" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page.locator("main#contenido")).toBeFocused();
});

test("reduced motion turns off smooth scrolling (2.3.3)", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe("auto");
});

test("text spacing overrides do not break the layout (1.4.12)", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["/", "/galeria", "/panel/login"]) {
    await page.goto(path);
    await page.addStyleTag({
      content: "* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }",
    });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    expect(overflow, `${path} overflows with text spacing`).toBe(false);
  }
});

test.describe("panel", () => {
  test.use({ storageState: "tests/e2e/.auth/admin.json" });

  test("dialogs trap focus, close with Escape and return focus (2.1.2, 2.4.3)", async ({ page }) => {
    await page.goto("/panel/logros");
    const opener = page.getByRole("button", { name: "+ Agregar logro" });
    await opener.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Agregar logro" });
    await expect(dialog).toBeVisible();
    // Tab cycles inside the dialog; the only way out is the browser's own UI (body as activeElement).
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press("Tab");
      const where = await page.evaluate(() =>
        document.activeElement === document.body ? "browser" : document.activeElement?.closest("dialog[open]") ? "dialog" : "page",
      );
      expect(where).not.toBe("page");
    }
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test("focus ring has enough contrast on light surfaces (1.4.11)", async ({ page }) => {
    await page.goto("/panel/logros");
    const button = page.getByRole("button", { name: "+ Agregar logro" });
    await button.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    const outline = await button.evaluate((el) => getComputedStyle(el).outlineColor);
    expect(outline).toBe("rgb(26, 20, 22)");
  });

  test("the sticky mobile bar never covers the focused field (2.4.11)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 600 });
    await page.goto("/panel/epk/editar");
    const bar = await page.locator("header[data-theme=dark]").boundingBox();
    // Walk backwards through the long form so the browser has to scroll up to each field.
    await page.locator("main button[type=submit]").focus();
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Shift+Tab");
      // Let the browser finish scrolling the field into view before measuring (flaky under load otherwise).
      await page.waitForTimeout(150);
      const box = await page.evaluate(() => {
        const el = document.activeElement;
        // Controls that live in the bar itself are exempt.
        if (!el || !el.closest("main")) return null;
        return { top: el.getBoundingClientRect().top };
      });
      if (box && bar) expect(box.top).toBeGreaterThanOrEqual(bar.height - 1);
    }
  });

  test("errors are announced and focus moves to the first invalid field (3.3.1)", async ({ page }) => {
    await page.goto("/panel/formatos");
    await page.getByRole("button", { name: "+ Agregar formato" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.locator("#name").fill("");
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expect(dialog.locator("#name")).toBeFocused();
    await expect(dialog.locator("#name")).toHaveAttribute("aria-invalid", "true");
    await expect(dialog.locator("#name")).toHaveAttribute("aria-describedby", "name-error");
    await expect(dialog.getByRole("alert")).toContainText("Revisa los campos marcados");
  });
});

test.describe("panel forms", () => {
  test.use({ storageState: "tests/e2e/.auth/admin.json" });

  test("a validation error keeps what the manager typed (ISO 9241-110 error robustness)", async ({ page }) => {
    await page.goto("/panel/videos");
    await page.getByRole("button", { name: "+ Agregar video" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.locator("#title").fill("Título que no se debe perder");
    await dialog.locator("#context").fill("Instagram");
    await dialog.locator("#url").fill("sin-https");
    await dialog.getByRole("button", { name: "Guardar" }).click();
    await expect(dialog.locator("#url")).toHaveAttribute("aria-invalid", "true");
    await expect(dialog.locator("#title")).toHaveValue("Título que no se debe perder");
    await expect(dialog.locator("#context")).toHaveValue("Instagram");
    await expect(dialog.locator("#url")).toHaveValue("sin-https");
  });
});
