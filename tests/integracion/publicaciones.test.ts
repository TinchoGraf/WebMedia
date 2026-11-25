import { beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { autoValido, fotoJpeg, prepararBase } from "./ayuda";

let ctx: Awaited<ReturnType<typeof prepararBase>>;
let pub: typeof import("../../src/server/publicaciones");
let fotos: typeof import("../../src/server/fotos");
let schema: typeof import("../../src/db/schema");

beforeAll(async () => {
  ctx = await prepararBase();
  pub = await import("../../src/server/publicaciones");
  fotos = await import("../../src/server/fotos");
  schema = await import("../../src/db/schema");
});

describe("publicaciones", () => {
  it("crea con título sugerido, slug único y precio en centavos", async () => {
    const a = await pub.crearPublicacion(ctx.db, ctx.editor, "vehiculo", autoValido);
    const b = await pub.crearPublicacion(ctx.db, ctx.editor, "vehiculo", autoValido);
    expect(a.slug).toMatch(/^volkswagen-gol-trend-\d+$/);
    expect(a.slug).not.toBe(b.slug);
    const [fila] = await ctx.db.select().from(schema.publicaciones).where(eq(schema.publicaciones.id, a.id));
    expect(fila).toMatchObject({ precio: 980_000_000, estado: "borrador", titulo: "Volkswagen Gol Trend" });
    expect(fila.atributos).toMatchObject({ anio: 2015, km: 98000 });
  });

  it("sin sesión no se puede crear", async () => {
    await expect(pub.crearPublicacion(ctx.db, null, "vehiculo", autoValido)).rejects.toThrow("sesión");
  });

  it("devuelve los errores por campo", async () => {
    try {
      await pub.crearPublicacion(ctx.db, ctx.editor, "vehiculo", { ...autoValido, atributos: { ...autoValido.atributos, anio: "3000" } });
      expect.unreachable();
    } catch (e) {
      expect((e as { campos: Record<string, string> }).campos["atributos.anio"]).toContain("máximo");
    }
  });

  it("no se puede publicar sin fotos; con una foto sí", async () => {
    const p = await pub.crearPublicacion(ctx.db, ctx.editor, "vehiculo", autoValido);
    await expect(pub.cambiarEstado(ctx.db, ctx.editor, p.id, "publicada")).rejects.toThrow("al menos una foto");
    await fotos.agregarFoto(ctx.db, ctx.editor, p.id, await fotoJpeg());
    await pub.cambiarEstado(ctx.db, ctx.editor, p.id, "publicada");
    const [fila] = await ctx.db.select().from(schema.publicaciones).where(eq(schema.publicaciones.id, p.id));
    expect(fila.estado).toBe("publicada");
    expect(fila.publicadoEn).toBeInstanceOf(Date);
  });

  it("el link no cambia después de publicada aunque cambie el título", async () => {
    const p = await pub.crearPublicacion(ctx.db, ctx.editor, "vehiculo", autoValido);
    await fotos.agregarFoto(ctx.db, ctx.editor, p.id, await fotoJpeg());
    await pub.cambiarEstado(ctx.db, ctx.editor, p.id, "publicada");
    const r = await pub.actualizarPublicacion(ctx.db, ctx.editor, p.id, { ...autoValido, titulo: "Otro título" });
    expect(r.slug).toBe(p.slug);
  });

  it("el rol demo no puede borrar ni destacar, y tiene límite diario", async () => {
    const p = await pub.crearPublicacion(ctx.db, ctx.demo, "vehiculo", { ...autoValido, destacada: "true" });
    const [fila] = await ctx.db.select().from(schema.publicaciones).where(eq(schema.publicaciones.id, p.id));
    expect(fila.destacada).toBe(false);
    await expect(pub.eliminarPublicacion(ctx.db, ctx.demo, p.id)).rejects.toThrow("permiso");
    for (let i = 0; i < 4; i++) await pub.crearPublicacion(ctx.db, ctx.demo, "vehiculo", autoValido);
    await expect(pub.crearPublicacion(ctx.db, ctx.demo, "vehiculo", autoValido)).rejects.toThrow("límite");
  });

  it("borrar una publicación borra sus fotos (base y archivos)", async () => {
    const p = await pub.crearPublicacion(ctx.db, ctx.dueno, "vehiculo", autoValido);
    const f = await fotos.agregarFoto(ctx.db, ctx.dueno, p.id, await fotoJpeg());
    await pub.eliminarPublicacion(ctx.db, ctx.dueno, p.id);
    expect(await ctx.db.select().from(schema.fotos).where(eq(schema.fotos.id, f.id))).toHaveLength(0);
    const { leerLocal } = await import("../../src/lib/storage");
    expect(await leerLocal(f.clave)).toBeNull();
  });
});

describe("fotos", () => {
  it("ordena, elige portada y compacta al borrar", async () => {
    const p = await pub.crearPublicacion(ctx.db, ctx.editor, "vehiculo", autoValido);
    const [a, b, c] = [
      await fotos.agregarFoto(ctx.db, ctx.editor, p.id, await fotoJpeg("#111111")),
      await fotos.agregarFoto(ctx.db, ctx.editor, p.id, await fotoJpeg("#555555")),
      await fotos.agregarFoto(ctx.db, ctx.editor, p.id, await fotoJpeg("#999999")),
    ];
    await fotos.elegirPortada(ctx.db, ctx.editor, p.id, c.id);
    const orden = async () => (await ctx.db.select().from(schema.fotos).where(eq(schema.fotos.publicacionId, p.id)).orderBy(schema.fotos.orden)).map((f) => [f.id, f.orden]);
    expect(await orden()).toEqual([[c.id, 0], [a.id, 1], [b.id, 2]]);
    await fotos.eliminarFoto(ctx.db, ctx.editor, a.id);
    expect(await orden()).toEqual([[c.id, 0], [b.id, 1]]);
  });

  it("rechaza un reordenamiento con ids de otra publicación", async () => {
    const p = await pub.crearPublicacion(ctx.db, ctx.editor, "vehiculo", autoValido);
    const f = await fotos.agregarFoto(ctx.db, ctx.editor, p.id, await fotoJpeg());
    await expect(fotos.reordenarFotos(ctx.db, ctx.editor, p.id, [f.id, crypto.randomUUID()])).rejects.toThrow("Recargá");
  });

  it("demo no puede borrar fotos que no subió", async () => {
    const p = await pub.crearPublicacion(ctx.db, ctx.dueno, "vehiculo", autoValido);
    const f = await fotos.agregarFoto(ctx.db, ctx.dueno, p.id, await fotoJpeg());
    await expect(fotos.eliminarFoto(ctx.db, ctx.demo, f.id)).rejects.toThrow("solo podés borrar fotos que subiste");
  });
});
