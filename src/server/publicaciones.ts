/** Lógica de publicaciones. Recibe la base y el usuario: así se testea sin Next y sin HTTP. */
import { and, count, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";
import { fotos, publicaciones } from "../db/schema";
import type { DB } from "../db/conexion";
import { registrar } from "../lib/actividad";
import { ErrorVisible } from "../lib/errores";
import { exigir, type UsuarioSesion } from "../lib/permisos";
import { aCentavos } from "../lib/precios";
import { slugPublicacion } from "../lib/slug";
import { borrar } from "../lib/storage";
import { esquemaAtributos, rubro as obtenerRubro, type DefinicionRubro } from "../rubros";

const limiteDemo = { publicacionesPorDia: 5 };

export function esquemaPublicacion(r: DefinicionRubro) {
  const enLista = (lista: { valor: string }[], msg: string) => z.enum(lista.map((o) => o.valor) as [string, ...string[]], { message: msg });
  const precio = z.preprocess(
    (v) => (typeof v === "string" || typeof v === "number" ? aCentavos(v) : v),
    z.number().int().min(0).max(1e14).nullable(),
  );
  return z.object({
    titulo: z.string().trim().max(120, "El título puede tener hasta 120 caracteres").optional().default(""),
    descripcion: z.string().trim().max(5000, "La descripción puede tener hasta 5000 caracteres").optional().default(""),
    operacion: r.operaciones.length > 1 ? enLista(r.operaciones, "Elegí venta o alquiler") : z.string().optional().transform(() => r.operaciones[0].valor),
    tipo: enLista(r.tipos, "Elegí un tipo"),
    precio: precio.optional().default(null),
    moneda: z.enum(["ARS", "USD"]),
    expensas: precio.optional().default(null),
    zona: r.usaZona ? z.enum((r.zonas ?? []) as [string, ...string[]], { message: "Elegí una zona" }) : z.string().optional().transform(() => null),
    direccion: z.string().trim().max(200).optional().transform((v) => v || null),
    destacada: z.preprocess((v) => v === true || v === "on" || v === "true", z.boolean()).optional().default(false),
    atributos: esquemaAtributos(r),
  });
}

export type DatosPublicacion = z.input<ReturnType<typeof esquemaPublicacion>>;

function validar(r: DefinicionRubro, datos: unknown) {
  const res = esquemaPublicacion(r).safeParse(datos);
  if (!res.success) {
    const campos: Record<string, string> = {};
    for (const i of res.error.issues) campos[i.path.join(".")] ??= i.message;
    throw new ErrorVisible("Revisá los campos marcados.", campos);
  }
  const v = res.data;
  const titulo = v.titulo || r.tituloSugerido(v.tipo, v.atributos, v.operacion ?? null);
  if (titulo.length < 3) throw new ErrorVisible("Revisá los campos marcados.", { titulo: "Escribí un título" });
  return { ...v, titulo };
}

export async function crearPublicacion(db: DB, u: UsuarioSesion | null, rubroId: string, datos: unknown) {
  exigir(u, "publicaciones:editar");
  const r = obtenerRubro(rubroId);
  const v = validar(r, datos);

  if (u.rol === "demo") {
    const [{ n }] = await db.select({ n: count() }).from(publicaciones)
      .where(and(eq(publicaciones.creadoPor, u.id), gte(publicaciones.creadoEn, sql`now() - interval '1 day'`)));
    if (n >= limiteDemo.publicacionesPorDia) throw new ErrorVisible("La cuenta de demostración llegó al límite de publicaciones por hoy.");
  }

  const creada = await db.transaction(async (tx) => {
    const [p] = await tx.insert(publicaciones).values({
      rubro: r.id, slug: `tmp-${crypto.randomUUID()}`, titulo: v.titulo, descripcion: v.descripcion, operacion: v.operacion ?? null,
      tipo: v.tipo, precio: v.precio, moneda: v.moneda, expensas: v.expensas, zona: v.zona ?? null, direccion: v.direccion ?? null,
      destacada: u.rol === "demo" ? false : v.destacada, atributos: v.atributos, creadoPor: u.id,
    }).returning({ id: publicaciones.id, numero: publicaciones.numero });
    const slug = slugPublicacion(v.titulo, p.numero);
    await tx.update(publicaciones).set({ slug }).where(eq(publicaciones.id, p.id));
    return { ...p, slug };
  });
  await registrar(db, u, "crear", "publicacion", creada.id, { titulo: v.titulo });
  return creada;
}

export async function actualizarPublicacion(db: DB, u: UsuarioSesion | null, id: string, datos: unknown) {
  exigir(u, "publicaciones:editar");
  const [actual] = await db.select().from(publicaciones).where(eq(publicaciones.id, id));
  if (!actual) throw new ErrorVisible("La publicación no existe.");
  const v = validar(obtenerRubro(actual.rubro), datos);
  // El link no cambia una vez publicada (para no romper lo que ya se compartió por WhatsApp)
  const slug = actual.publicadoEn ? actual.slug : slugPublicacion(v.titulo, actual.numero);
  await db.update(publicaciones).set({
    titulo: v.titulo, descripcion: v.descripcion, operacion: v.operacion ?? null, tipo: v.tipo, precio: v.precio, moneda: v.moneda,
    expensas: v.expensas, zona: v.zona ?? null, direccion: v.direccion ?? null,
    destacada: u.rol === "demo" ? actual.destacada : v.destacada, atributos: v.atributos, slug,
  }).where(eq(publicaciones.id, id));
  await registrar(db, u, "editar", "publicacion", id, { titulo: v.titulo });
  return { id, slug };
}

export const ESTADOS = ["borrador", "publicada", "reservada", "cerrada"] as const;
export type Estado = (typeof ESTADOS)[number];

export async function cambiarEstado(db: DB, u: UsuarioSesion | null, id: string, estado: string) {
  exigir(u, "publicaciones:editar");
  if (!(ESTADOS as readonly string[]).includes(estado)) throw new ErrorVisible("Estado inválido.");
  const [p] = await db.select({ id: publicaciones.id, publicadoEn: publicaciones.publicadoEn }).from(publicaciones).where(eq(publicaciones.id, id));
  if (!p) throw new ErrorVisible("La publicación no existe.");
  if (estado === "publicada") {
    const [{ n }] = await db.select({ n: count() }).from(fotos).where(eq(fotos.publicacionId, id));
    if (n === 0) throw new ErrorVisible("Subí al menos una foto antes de publicar.");
  }
  await db.update(publicaciones).set({
    estado: estado as Estado,
    publicadoEn: estado === "publicada" && !p.publicadoEn ? new Date() : p.publicadoEn,
  }).where(eq(publicaciones.id, id));
  await registrar(db, u, `estado:${estado}`, "publicacion", id);
}

export async function eliminarPublicacion(db: DB, u: UsuarioSesion | null, id: string) {
  exigir(u, "publicaciones:borrar");
  const fs = await db.select({ clave: fotos.clave, mini: fotos.claveMiniatura }).from(fotos).where(eq(fotos.publicacionId, id));
  const [p] = await db.delete(publicaciones).where(eq(publicaciones.id, id)).returning({ titulo: publicaciones.titulo });
  if (!p) throw new ErrorVisible("La publicación no existe.");
  await borrar(fs.flatMap((f) => [f.clave, f.mini])).catch(() => {});
  await registrar(db, u, "borrar", "publicacion", id, { titulo: p.titulo });
}

export async function duplicarPublicacion(db: DB, u: UsuarioSesion | null, id: string) {
  exigir(u, "publicaciones:editar");
  const [p] = await db.select().from(publicaciones).where(eq(publicaciones.id, id));
  if (!p) throw new ErrorVisible("La publicación no existe.");
  return crearPublicacion(db, u, p.rubro, {
    titulo: `${p.titulo} (copia)`.slice(0, 120), descripcion: p.descripcion, operacion: p.operacion ?? undefined, tipo: p.tipo,
    precio: p.precio === null ? null : p.precio / 100, moneda: p.moneda, expensas: p.expensas === null ? null : p.expensas / 100,
    zona: p.zona ?? undefined, direccion: p.direccion ?? undefined, destacada: false, atributos: p.atributos,
  });
}
