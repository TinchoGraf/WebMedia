import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  const errores: string[] = [];
  page.on("console", (m) => m.type() === "error" && !m.text().includes("google.com") && errores.push(m.text()));
  page.on("pageerror", (e) => errores.push(e.message));
  (page as unknown as { errores: string[] }).errores = errores;
});
const errores = (p: unknown) => (p as { errores: string[] }).errores;

test("inicio carga con CSP con nonce y sin errores", async ({ page }) => {
  const r = await page.goto("/");
  expect(r?.headers()["content-security-policy"]).toMatch(/script-src 'self' 'nonce-[A-Za-z0-9+/=]+' 'strict-dynamic'/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Recién publicad/ })).toBeVisible();
  await page.waitForLoadState("networkidle");
  expect(errores(page)).toEqual([]);
});

test("el buscador de la home lleva al listado filtrado", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Tipo", { exact: true }).selectOption("camioneta");
  await page.getByRole("button", { name: "Buscar" }).click();
  await expect(page).toHaveURL(/\/autos\?tipo=camioneta/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Camioneta en Olavarría");
});

test("filtros del listado: se aplican al cambiar y se pueden quitar", async ({ page, isMobile }) => {
  await page.goto("/autos");
  if (isMobile) await page.getByText("Filtros", { exact: false }).first().click();
  const form = page.locator(isMobile ? "#filtros-movil" : "#filtros");
  await form.getByLabel("Marca").selectOption("Toyota");
  await expect(page).toHaveURL(/marca=Toyota/);
  const titulos = await page.locator("article :is(h2, h3)").allTextContents();
  expect(titulos.length).toBeGreaterThan(0);
  expect(titulos.every((t) => t.startsWith("Toyota"))).toBe(true);
  await page.getByRole("link", { name: "Quitar filtro Toyota" }).click();
  await expect(page).not.toHaveURL(/marca=/);
});

test("sin resultados muestra cómo seguir", async ({ page }) => {
  await page.goto("/autos?q=zzzzz");
  await expect(page.getByText("Nada por acá con esos filtros.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver todo" })).toBeVisible();
});

test("galería: flechas, teclado, miniaturas y pantalla completa", async ({ page, isMobile }) => {
  await page.goto("/autos");
  await page.getByRole("link", { name: "Toyota Hilux" }).first().click();
  const contador = page.locator("section[aria-roledescription=carrusel] p[aria-live]");
  await expect(contador).toHaveText("1 / 4");
  await page.getByRole("button", { name: "Foto siguiente" }).first().click();
  await expect(contador).toHaveText("2 / 4");
  if (!isMobile) {
    await page.getByLabel("Usá las flechas del teclado para pasar de foto").focus();
    await page.keyboard.press("ArrowRight");
    await expect(contador).toHaveText("3 / 4");
  }
  await page.getByRole("button", { name: "Ver foto 1" }).click();
  await expect(contador).toHaveText("1 / 4");
  await page.getByRole("button", { name: "Ver grande" }).click();
  const dialogo = page.getByRole("dialog");
  await expect(dialogo).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialogo).toBeHidden();
});

test("la ficha arma el WhatsApp con el código y el título", async ({ page }) => {
  await page.goto("/autos");
  await page.getByRole("link", { name: "Toyota Hilux" }).first().click();
  const href = await page.getByRole("link", { name: "Consultar por WhatsApp" }).getAttribute("href");
  const texto = new URL(href!).searchParams.get("text")!;
  expect(texto).toMatch(/Toyota Hilux \(PA-\d{4}\)/);
  expect(texto).toContain("/autos/");
});

test("formulario de consulta: errores claros y envío correcto", async ({ page }) => {
  await page.goto("/contacto");
  await page.getByRole("button", { name: "Enviar consulta" }).click();
  await expect(page.getByText("Escribí tu nombre")).toBeVisible();
  await page.getByLabel("Nombre").fill("Prueba E2E");
  await page.getByLabel("Teléfono").fill("2284 15-123456");
  await page.getByLabel("Mensaje").fill("Quiero saber si financian.");
  await page.getByRole("button", { name: "Enviar consulta" }).click();
  await expect(page.getByText("¡Gracias! Recibimos tu consulta")).toBeVisible();
});

test("404 propios: slug inexistente y rubro de otro perfil", async ({ page }) => {
  expect((await page.goto("/autos/no-existe-99"))?.status()).toBe(404);
  await expect(page.getByText("ya no está en el playón")).toBeVisible();
  expect((await page.goto("/propiedades"))?.status()).toBe(404);
});

test("no expone la dirección exacta ni el panel en el sitemap", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  expect(xml).toContain("/autos/");
  expect(xml).not.toContain("/panel");
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /panel");
});
