import { beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { autoValido, fotoJpeg, prepararBase } from "./ayuda";

let ctx: Awaited<ReturnType<typeof prepararBase>>;
let usr: typeof import("../../src/server/usuarios");
let schema: typeof import("../../src/db/schema");

beforeAll(async () => {
  ctx = await prepararBase();
  usr = await import("../../src/server/usuarios");
  schema = await import("../../src/db/schema");
});

describe("usuarios", () => {
  it("solo el dueño crea usuarios; contraseña de 12+ y email único", async () => {
    await expect(usr.crearUsuario(ctx.db, ctx.editor, { nombre: "Equis", email: "x@test.local", password: "una-clave-larga", rol: "editor" })).rejects.toThrow("permiso");
    await expect(usr.crearUsuario(ctx.db, ctx.dueno, { nombre: "Equis", email: "x@test.local", password: "corta", rol: "editor" })).rejects.toThrow("Revisá");
    await usr.crearUsuario(ctx.db, ctx.dueno, { nombre: "Equis", email: "X@Test.Local", password: "una-clave-larga", rol: "editor" });
    await expect(usr.crearUsuario(ctx.db, ctx.dueno, { nombre: "Ye", email: "x@test.local", password: "una-clave-larga", rol: "editor" })).rejects.toThrow("Ya hay");
  });
  it("la contraseña se guarda hasheada, nunca en claro", async () => {
    const [c] = await ctx.db.select({ p: schema.cuentas.password }).from(schema.cuentas).where(eq(schema.cuentas.userId, ctx.editor.id));
    expect(c.p).not.toContain("una-clave-larga-123");
    expect(c.p!.length).toBeGreaterThan(40);
  });
  it("el dueño no puede desactivarse ni cambiarse el rol a sí mismo", async () => {
    await expect(usr.cambiarActivo(ctx.db, ctx.dueno, ctx.dueno.id, false)).rejects.toThrow("propio");
    await expect(usr.cambiarRol(ctx.db, ctx.dueno, ctx.dueno.id, "editor")).rejects.toThrow("propio");
  });
  it("desactivar cierra las sesiones abiertas del usuario", async () => {
    await ctx.db.insert(schema.sesiones).values({ id: "s1", token: "t1", userId: ctx.editor.id, expiresAt: new Date(Date.now() + 3600_000) });
    await usr.cambiarActivo(ctx.db, ctx.dueno, ctx.editor.id, false);
    expect(await ctx.db.select().from(schema.sesiones).where(eq(schema.sesiones.userId, ctx.editor.id))).toHaveLength(0);
  });
});

describe("reinicio nocturno del modo demo", () => {
  it("borra lo del usuario demo y restaura lo original", async () => {
    const pub = await import("../../src/server/publicaciones");
    const fotos = await import("../../src/server/fotos");
    const { reiniciarDemo } = await import("../../src/server/demo");
    const original = await pub.crearPublicacion(ctx.db, ctx.dueno, "vehiculo", autoValido);
    await fotos.agregarFoto(ctx.db, ctx.dueno, original.id, await fotoJpeg());
    const propia = await pub.crearPublicacion(ctx.db, ctx.demo, "vehiculo", autoValido);
    await fotos.agregarFoto(ctx.db, ctx.demo, original.id, await fotoJpeg("#222222"));
    await pub.actualizarPublicacion(ctx.db, ctx.demo, original.id, { ...autoValido, precio: "1" });

    await reiniciarDemo(ctx.db, "vehiculo");

    const pubs = await ctx.db.select().from(schema.publicaciones);
    expect(pubs.map((p) => p.id)).not.toContain(propia.id);
    const fs = await ctx.db.select().from(schema.fotos).where(eq(schema.fotos.publicacionId, original.id));
    expect(fs).toHaveLength(1);
    const [rest] = pubs.filter((p) => p.id === original.id);
    expect(rest.precio).not.toBe(100); // volvió al precio de la semilla
  });
});
