/** Inicia sesión UNA vez por rol y guarda las cookies (el login tiene límite de 5 intentos cada 15 minutos). */
import { expect, test as setup } from "@playwright/test";
import { CLAVES } from "../../playwright.config";

for (const rol of ["dueno", "demo"] as const) {
  setup(`sesión ${rol}`, async ({ page }) => {
    await page.goto("/panel/login");
    await page.getByLabel("Email").fill(`${rol}@demo.local`);
    await page.getByLabel("Contraseña").fill(CLAVES[rol]);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/panel$/);
    await page.context().storageState({ path: `.data/e2e-sesion-${rol}.json` });
  });
}
