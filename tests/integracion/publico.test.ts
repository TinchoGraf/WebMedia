import { beforeAll, describe, expect, it } from "vitest";
import { autoValido, fotoJpeg, prepararBase } from "./ayuda";

let ctx: Awaited<ReturnType<typeof prepararBase>>;
let lect: typeof import("../../src/server/lecturas");
let cons: typeof import("../../src/server/consultas");
let busq: typeof import("../../src/lib/busqueda");
const { rubro } = await import("../../src/rubros");
const r = rubro("vehiculo");

beforeAll(async () => {
  ctx = await prepararBase();
  lect = await import("../../src/server/lecturas");
  cons = await import("../../src/server/consultas");
  busq = await import("../../src/lib/busqueda");
  const pub = await import("../../src/server/publicaciones");
  const fotos = await import("../../src/server/fotos");
  const cargar = async (attrs: Record<string, unknown>, extra: Record<string, unknown> = {}, publicar = true) => {
    const p = await pub.crearPublicacion(ctx.db, ctx.dueno, "vehiculo", { ...autoValido, ...extra, atributos: { ...autoValido.atributos, ...attrs } });
    await fotos.agregarFoto(ctx.db, ctx.dueno, p.id, await fotoJpeg());
    if (publicar) await pub.cambiarEstado(ctx.db, ctx.dueno, p.id, "publicada");
    return p;
  };
  await cargar({ marca: "Toyota", modelo: "Hilux", anio: "2019", km: "140000", combustible: "diesel", financiacion: "true" }, { tipo: "camioneta", precio: "42000000" });
  await cargar({ marca: "Fiat", modelo: "Cronos", anio: "2022", km: "29000" }, { precio: "19800000" });
  await cargar({ marca: "Fiat", modelo: "Fiorino", anio: "2020", km: "70000" }, { tipo: "utilitario", precio: "13500000" }, false); // borrador
});

const buscar = (q: Record<string, string>) => lect.listarPublicas(ctx.db, r, busq.parsearFiltros(q, r));

describe("listado público", () => {
  it("no muestra borradores", async () => {
    const res = await buscar({});
    expect(res.total).toBe(2);
    expect(res.items.map((i) => i.titulo)).not.toContain("Fiat Fiorino");
  });
  it("filtra por atributos del JSON (marca, rango de año, booleanos)", async () => {
    expect((await buscar({ marca: "Fiat" })).items.map((i) => i.titulo)).toEqual(["Fiat Cronos"]);
    expect((await buscar({ anio_min: "2020" })).total).toBe(1);
    expect((await buscar({ financiacion: "1" })).items[0].titulo).toBe("Toyota Hilux");
    expect((await buscar({ km_max: "50000", tipo: "camioneta" })).total).toBe(0);
  });
  it("filtra por precio y ordena", async () => {
    expect((await buscar({ precio_max: "20.000.000" })).total).toBe(1);
    expect((await buscar({ orden: "precio-desc" })).items[0].titulo).toBe("Toyota Hilux");
    expect((await buscar({ orden: "km-asc" })).items[0].titulo).toBe("Fiat Cronos");
  });
  it("la búsqueda de texto trata comodines e inyecciones como texto literal", async () => {
    expect((await buscar({ q: "%" })).total).toBe(0);
    expect((await buscar({ q: "' OR 1=1 --" })).total).toBe(0);
    expect((await buscar({ q: "hilux" })).total).toBe(1);
  });
  it("la portada viene con URL pública y no se exponen datos internos", async () => {
    const it0 = (await buscar({})).items[0] as Record<string, unknown>;
    expect((it0.portada as { url: string }).url).toMatch(/^\/media\/publicaciones\//);
    expect(it0).not.toHaveProperty("direccion");
    expect(it0).not.toHaveProperty("creadoPor");
  });
});

describe("consultas públicas", () => {
  const valida = { nombre: "Ana", telefono: "2284 15-111111", mensaje: "¿Sigue disponible?" };
  it("guarda una consulta válida", async () => {
    expect(await cons.crearConsulta(ctx.db, valida, "10.0.0.1", "vehiculo")).toMatchObject({ guardada: true });
  });
  it("el campo trampa hace que no se guarde (bot)", async () => {
    expect(await cons.crearConsulta(ctx.db, { ...valida, sitio: "http://spam" }, "10.0.0.2")).toEqual({ guardada: false });
  });
  it("valida teléfono y largo del mensaje", async () => {
    await expect(cons.crearConsulta(ctx.db, { ...valida, telefono: "llamame" }, "10.0.0.3")).rejects.toThrow("Revisá");
    await expect(cons.crearConsulta(ctx.db, { ...valida, mensaje: "x".repeat(2001) }, "10.0.0.3")).rejects.toThrow("Revisá");
  });
  it("limita a 5 consultas cada 10 minutos por IP", async () => {
    for (let i = 0; i < 5; i++) await cons.crearConsulta(ctx.db, valida, "10.0.0.9");
    await expect(cons.crearConsulta(ctx.db, valida, "10.0.0.9")).rejects.toThrow("varias consultas");
    // otra IP sigue pudiendo
    await expect(cons.crearConsulta(ctx.db, valida, "10.0.0.10")).resolves.toMatchObject({ guardada: true });
  });
  it("no guarda la IP en claro", async () => {
    const { consultas } = await import("../../src/db/schema");
    const filas = await ctx.db.select({ ip: consultas.ipHash }).from(consultas);
    expect(filas.every((f) => !f.ip || /^[0-9a-f]{32}$/.test(f.ip))).toBe(true);
  });
});
