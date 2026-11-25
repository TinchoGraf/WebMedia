import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { procesarImagen } from "../../src/lib/imagenes";
import { ErrorVisible } from "../../src/lib/errores";

const jpeg = (w = 1200, h = 900, opciones: Parameters<ReturnType<typeof sharp>["withMetadata"]>[0] = {}) =>
  sharp({ create: { width: w, height: h, channels: 3, background: "#8E9AA3" } }).withMetadata(opciones).jpeg().toBuffer();

describe("procesarImagen", () => {
  it("convierte a WebP, genera miniatura y blur", async () => {
    const r = await procesarImagen(await jpeg(3000, 2000));
    expect((await sharp(r.grande).metadata()).format).toBe("webp");
    expect(r.ancho).toBe(1600);
    expect((await sharp(r.miniatura).metadata()).width).toBe(640);
    expect(r.blur).toMatch(/^data:image\/webp;base64,/);
  });
  it("borra los metadatos EXIF (incluido el GPS)", async () => {
    const conGps = await jpeg(1200, 900, { exif: { IFD0: { Copyright: "Dueño" }, IFD3: { GPSLatitudeRef: "S", GPSLatitude: "36/1 53/1 0/1" } } });
    expect((await sharp(conGps).metadata()).exif).toBeDefined();
    const r = await procesarImagen(conGps);
    expect((await sharp(r.grande).metadata()).exif).toBeUndefined();
  });
  it("rechaza un SVG (puede llevar scripts)", async () => {
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><script>alert(1)</script></svg>');
    await expect(procesarImagen(svg)).rejects.toThrow(ErrorVisible);
  });
  it("rechaza un ejecutable renombrado a .jpg (se mira el contenido, no el nombre)", async () => {
    const exe = Buffer.concat([Buffer.from("MZ"), Buffer.alloc(2000)]);
    await expect(procesarImagen(exe)).rejects.toThrow("no es una foto válida");
  });
  it("rechaza fotos demasiado chicas", async () => {
    await expect(procesarImagen(await jpeg(200, 150))).rejects.toThrow("muy chica");
  });
  it("rechaza archivos de más de 10 MB", async () => {
    await expect(procesarImagen(Buffer.alloc(11 * 1024 * 1024))).rejects.toThrow("10 MB");
  });
});
