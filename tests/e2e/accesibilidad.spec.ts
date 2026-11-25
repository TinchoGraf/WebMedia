import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const revisar = async (page: Page) => {
  const r = await new AxeBuilder({ page } as unknown as ConstructorParameters<typeof AxeBuilder>[0]).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  return r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(" | ")}`);
};

for (const ruta of ["/", "/autos", "/contacto", "/privacidad", "/panel/login"]) {
  test(`axe sin violaciones en ${ruta}`, async ({ page }) => {
    await page.goto(ruta);
    expect(await revisar(page)).toEqual([]);
  });
}

test("axe en la ficha", async ({ page }) => {
  await page.goto("/autos");
  await page.locator("article :is(h2, h3) a").first().click();
  await page.waitForLoadState("networkidle");
  expect(await revisar(page)).toEqual([]);
});

test.describe("panel", () => {
  test.use({ storageState: ".data/e2e-sesion-dueno.json" });
  for (const ruta of ["/panel", "/panel/publicaciones", "/panel/publicaciones/nueva", "/panel/consultas", "/panel/usuarios", "/panel/actividad"]) {
    test(`axe sin violaciones en ${ruta}`, async ({ page }) => {
      await page.goto(ruta);
      expect(await revisar(page)).toEqual([]);
    });
  }
  test("axe en la edición de una publicación", async ({ page }) => {
    await page.goto("/panel/publicaciones");
    await page.locator("ul a[href^='/panel/publicaciones/']").first().click();
    await page.waitForLoadState("networkidle");
    expect(await revisar(page)).toEqual([]);
  });
});
