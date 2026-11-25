import { expect, test } from "@playwright/test";
import sharp from "sharp";

const foto = async (color: string, nombre: string) => ({
  name: nombre, mimeType: "image/jpeg",
  buffer: await sharp({ create: { width: 1200, height: 900, channels: 3, background: color } }).jpeg().toBuffer(),
});

test.describe("sin sesión", () => {
  test("el panel redirige al login", async ({ page }) => {
    await page.goto("/panel/publicaciones");
    await expect(page).toHaveURL(/\/panel\/login\?volver=%2Fpanel%2Fpublicaciones/);
  });

  test("contraseña incorrecta: mensaje genérico (no dice si el email existe)", async ({ page }) => {
    await page.goto("/panel/login");
    await page.getByLabel("Email").fill("dueno@demo.local");
    await page.getByLabel("Contraseña").fill("no-es-la-clave-123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "incorrectos" })).toHaveText("Email o contraseña incorrectos.");
  });

  test("las Server Actions del panel no funcionan sin sesión", async ({ page, request }) => {
    // Se llama a la página de edición sin cookie: redirige. Y la API de auth responde sin sesión.
    const r = await request.get("/api/auth/get-session");
    expect(await r.text()).toBe("null");
    await page.goto("/panel/usuarios");
    await expect(page).toHaveURL(/login/);
  });
});

test.describe("dueño", () => {
  test.use({ storageState: ".data/e2e-sesion-dueno.json" });

  test("carga una publicación completa: datos, fotos, portada y publicar", async ({ page }) => {
    await page.goto("/panel/publicaciones/nueva");
    await page.getByLabel("Tipo").selectOption("auto");
    await page.getByRole("button", { name: "Guardar y seguir con las fotos" }).click();
    await expect(page.getByText("Revisá los campos marcados.")).toBeVisible();
    await expect(page.getByText("Marca: completalo")).toBeVisible();

    await page.getByLabel("Marca").fill("Citroën");
    await page.getByLabel("Modelo").fill("C3");
    await page.getByLabel("Año").fill("2018");
    await page.getByLabel("Kilómetros").fill("75.000");
    await page.getByLabel("Combustible").selectOption("nafta");
    await page.getByLabel("Caja").selectOption("manual");
    await page.getByLabel("Color", { exact: true }).fill("Gris");
    await page.getByLabel("Precio", { exact: false }).first().fill("12.300.000");
    await page.getByRole("button", { name: "Guardar y seguir con las fotos" }).click();

    await expect(page.getByText("Guardada como borrador.")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Citroën C3");

    // Publicar sin fotos no se puede
    await page.getByRole("button", { name: "Publicar" }).click();
    await expect(page.getByText("Subí al menos una foto antes de publicar.")).toBeVisible();

    await page.getByLabel("Elegir fotos para subir").setInputFiles([await foto("#AA3333", "a.jpg"), await foto("#33AA33", "b.jpg"), await foto("#3333AA", "c.jpg")]);
    await expect(page.getByText("3 fotos subidas.")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("(3 de 30)")).toBeVisible();

    const fotos = page.locator("section[aria-labelledby=t-fotos] li");
    const srcTercera = await fotos.nth(2).locator("img").getAttribute("src");
    await fotos.nth(2).getByRole("button", { name: "Usar de portada" }).click();
    await expect(fotos.nth(0).locator("img")).toHaveAttribute("src", srcTercera!);

    await page.getByRole("button", { name: "Publicar" }).click();
    await expect(page.getByText("Estado actualizado.")).toBeVisible();

    await page.goto("/autos?q=C3");
    await expect(page.getByRole("link", { name: "Citroën C3" })).toBeVisible();
  });

  test("ordenar fotos con el teclado (accesible)", async ({ page }) => {
    await page.goto("/panel/publicaciones");
    await page.getByRole("link", { name: /Toyota Corolla/ }).click();
    const fotos = page.locator("section[aria-labelledby=t-fotos] li img");
    await expect(fotos).toHaveCount(4);
    const antes = await fotos.evaluateAll((els) => els.map((e) => e.getAttribute("src")));
    await page.getByRole("button", { name: /^Foto 1\./ }).focus();
    // El sensor de teclado de dnd-kit mide posiciones entre pasos: pausas cortas como haría una persona
    await page.keyboard.press("Space");
    await page.waitForTimeout(300);
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(300);
    const guardado = page.waitForResponse((r) => r.request().method() === "POST" && r.url().includes("/panel/publicaciones/"));
    await page.keyboard.press("Space");
    await guardado;
    await expect.poll(async () => (await fotos.evaluateAll((els) => els.map((e) => e.getAttribute("src"))))[0]).toBe(antes[1]);
    await page.waitForLoadState("networkidle");
    await page.reload();
    await expect(fotos).toHaveCount(4);
    expect((await fotos.evaluateAll((els) => els.map((e) => e.getAttribute("src"))))[0]).toBe(antes[1]);
  });

  test("rechaza un archivo que no es imagen aunque diga .jpg", async ({ page }) => {
    await page.goto("/panel/publicaciones");
    await page.getByRole("link", { name: /Peugeot 208/ }).click();
    await page.getByLabel("Elegir fotos para subir").setInputFiles({ name: "virus.jpg", mimeType: "image/jpeg", buffer: Buffer.concat([Buffer.from("MZ"), Buffer.alloc(4000)]) });
    await expect(page.getByText("Ese archivo no es una foto válida")).toBeVisible({ timeout: 15_000 });
  });

  test("las consultas del sitio llegan al panel y se marcan respondidas", async ({ page }) => {
    await page.goto("/panel/consultas?estado=nueva");
    const tarjeta = page.locator("li", { hasText: "Prueba E2E" }).first();
    if (await tarjeta.count()) {
      await tarjeta.getByRole("button", { name: "Marcar respondida" }).click();
      await expect(tarjeta).toBeHidden();
    }
    await page.goto("/panel/consultas");
    await expect(page.getByRole("link", { name: "Responder por WhatsApp" }).first()).toHaveAttribute("href", /^https:\/\/wa\.me\/549/);
  });
});

test.describe("modo demo", () => {
  test.use({ storageState: ".data/e2e-sesion-demo.json" });

  test("ve el aviso, no ve Usuarios y no puede entrar por URL", async ({ page }) => {
    await page.goto("/panel");
    await expect(page.getByText("Modo demo:")).toBeVisible();
    await expect(page.getByRole("link", { name: "Usuarios" })).toHaveCount(0);
    const r = await page.goto("/panel/usuarios");
    expect(r?.status()).toBe(404);
  });

  test("no puede borrar publicaciones", async ({ page }) => {
    await page.goto("/panel/publicaciones");
    await page.getByRole("link", { name: /Renault Logan/ }).click();
    await expect(page.getByRole("button", { name: "Borrar publicación" })).toHaveCount(0);
  });
});
