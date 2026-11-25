/** Consultas de lectura para las páginas. Lo público nunca devuelve dirección exacta ni datos internos. */
import { and, asc, count, desc, eq, inArray, ne, sql } from "drizzle-orm";
import { actividad, consultas, fotos, publicaciones, usuarios } from "../db/schema";
import type { DB } from "../db/conexion";
import { donde, ordenSql, POR_PAGINA, type Filtros } from "../lib/busqueda";
import { urlPublica } from "../lib/storage";
import type { DefinicionRubro } from "../rubros";

const columnasPublicas = {
  id: publicaciones.id,
  numero: publicaciones.numero,
  slug: publicaciones.slug,
  titulo: publicaciones.titulo,
  operacion: publicaciones.operacion,
  tipo: publicaciones.tipo,
  precio: publicaciones.precio,
  moneda: publicaciones.moneda,
  estado: publicaciones.estado,
  destacada: publicaciones.destacada,
  atributos: publicaciones.atributos,
  zona: publicaciones.zona,
};

export type FotoVista = { id: string; url: string; miniatura: string; ancho: number; alto: number; blur: string; alt: string };

const aVista = (f: typeof fotos.$inferSelect): FotoVista => ({
  id: f.id, url: urlPublica(f.clave), miniatura: urlPublica(f.claveMiniatura), ancho: f.ancho, alto: f.alto, blur: f.blur, alt: f.alt,
});

async function portadas(db: DB, ids: string[]) {
  if (!ids.length) return new Map<string, FotoVista>();
  // La foto con menor orden de cada publicación
  const filas = await db.selectDistinctOn([fotos.publicacionId]).from(fotos)
    .where(inArray(fotos.publicacionId, ids)).orderBy(fotos.publicacionId, asc(fotos.orden));
  return new Map(filas.map((f) => [f.publicacionId, aVista(f)]));
}

async function cantidadFotos(db: DB, ids: string[]) {
  if (!ids.length) return new Map<string, number>();
  const filas = await db.select({ id: fotos.publicacionId, n: count() }).from(fotos).where(inArray(fotos.publicacionId, ids)).groupBy(fotos.publicacionId);
  return new Map(filas.map((f) => [f.id, f.n]));
}

export async function listarPublicas(db: DB, r: DefinicionRubro, f: Filtros) {
  const where = donde(f, r);
  const [{ total }] = await db.select({ total: count() }).from(publicaciones).where(where);
  const filas = await db.select(columnasPublicas).from(publicaciones).where(where)
    .orderBy(...ordenSql(f.orden)).limit(POR_PAGINA).offset((f.pagina - 1) * POR_PAGINA);
  const ids = filas.map((p) => p.id);
  const [port, nf] = await Promise.all([portadas(db, ids), cantidadFotos(db, ids)]);
  return { total, paginas: Math.max(1, Math.ceil(total / POR_PAGINA)), items: filas.map((p) => ({ ...p, portada: port.get(p.id) ?? null, fotos: nf.get(p.id) ?? 0 })) };
}

export type ItemListado = Awaited<ReturnType<typeof listarPublicas>>["items"][number];

export async function destacadas(db: DB, r: DefinicionRubro, limite = 6) {
  const filas = await db.select(columnasPublicas).from(publicaciones)
    .where(and(eq(publicaciones.rubro, r.id), eq(publicaciones.estado, "publicada")))
    .orderBy(desc(publicaciones.destacada), desc(publicaciones.publicadoEn)).limit(limite);
  const ids = filas.map((p) => p.id);
  const [port, nf] = await Promise.all([portadas(db, ids), cantidadFotos(db, ids)]);
  return filas.map((p) => ({ ...p, portada: port.get(p.id) ?? null, fotos: nf.get(p.id) ?? 0 }));
}

export async function publicaPorSlug(db: DB, r: DefinicionRubro, slug: string) {
  const [p] = await db.select({ ...columnasPublicas, descripcion: publicaciones.descripcion, expensas: publicaciones.expensas, publicadoEn: publicaciones.publicadoEn })
    .from(publicaciones)
    .where(and(eq(publicaciones.slug, slug), eq(publicaciones.rubro, r.id), inArray(publicaciones.estado, ["publicada", "reservada"])));
  if (!p) return null;
  const fs = await db.select().from(fotos).where(eq(fotos.publicacionId, p.id)).orderBy(asc(fotos.orden));
  return { ...p, fotos: fs.map(aVista) };
}

export async function similares(db: DB, r: DefinicionRubro, p: { id: string; tipo: string }, limite = 3) {
  const filas = await db.select(columnasPublicas).from(publicaciones)
    .where(and(eq(publicaciones.rubro, r.id), eq(publicaciones.estado, "publicada"), eq(publicaciones.tipo, p.tipo), ne(publicaciones.id, p.id)))
    .orderBy(desc(publicaciones.publicadoEn)).limit(limite);
  const ids = filas.map((x) => x.id);
  const [port, nf] = await Promise.all([portadas(db, ids), cantidadFotos(db, ids)]);
  return filas.map((x) => ({ ...x, portada: port.get(x.id) ?? null, fotos: nf.get(x.id) ?? 0 }));
}

/** Valores existentes de un atributo texto (ej. marcas), para armar el filtro */
export async function valoresAtributo(db: DB, r: DefinicionRubro, clave: string) {
  const filas = await db.selectDistinct({ v: sql<string>`${publicaciones.atributos}->>${clave}` }).from(publicaciones)
    .where(and(eq(publicaciones.rubro, r.id), inArray(publicaciones.estado, ["publicada", "reservada"])));
  return filas.map((f) => f.v).filter(Boolean).sort((a, b) => a.localeCompare(b, "es"));
}

export async function sitemap(db: DB, r: DefinicionRubro) {
  return db.select({ slug: publicaciones.slug, actualizadoEn: publicaciones.actualizadoEn }).from(publicaciones)
    .where(and(eq(publicaciones.rubro, r.id), inArray(publicaciones.estado, ["publicada", "reservada"])));
}

/* ───────── Panel ───────── */

export async function listarPanel(db: DB, r: DefinicionRubro, estado?: string, q?: string) {
  const conds = [eq(publicaciones.rubro, r.id)];
  if (estado && ["borrador", "publicada", "reservada", "cerrada"].includes(estado)) conds.push(eq(publicaciones.estado, estado as "borrador"));
  if (q) conds.push(sql`${publicaciones.titulo} ILIKE ${`%${q.replace(/[\\%_]/g, (m) => `\\${m}`).slice(0, 60)}%`}`);
  const filas = await db.select({ ...columnasPublicas, actualizadoEn: publicaciones.actualizadoEn }).from(publicaciones)
    .where(and(...conds)).orderBy(desc(publicaciones.actualizadoEn)).limit(200);
  const ids = filas.map((p) => p.id);
  const [port, nf] = await Promise.all([portadas(db, ids), cantidadFotos(db, ids)]);
  return filas.map((p) => ({ ...p, portada: port.get(p.id) ?? null, fotos: nf.get(p.id) ?? 0 }));
}

export async function paraEditar(db: DB, id: string) {
  const [p] = await db.select().from(publicaciones).where(eq(publicaciones.id, id));
  if (!p) return null;
  const fs = await db.select().from(fotos).where(eq(fotos.publicacionId, id)).orderBy(asc(fotos.orden));
  return { ...p, fotos: fs.map(aVista) };
}

export async function resumenPanel(db: DB, r: DefinicionRubro) {
  const porEstado = await db.select({ estado: publicaciones.estado, n: count() }).from(publicaciones).where(eq(publicaciones.rubro, r.id)).groupBy(publicaciones.estado);
  const [{ nuevas }] = await db.select({ nuevas: count() }).from(consultas).where(and(eq(consultas.rubro, r.id), eq(consultas.estado, "nueva")));
  const ultimas = await listarConsultas(db, r, "nueva", 5);
  return { porEstado: Object.fromEntries(porEstado.map((e) => [e.estado, e.n])) as Record<string, number>, nuevas, ultimas };
}

export async function listarConsultas(db: DB, r: DefinicionRubro, estado?: string, limite = 100) {
  const conds = [eq(consultas.rubro, r.id)];
  if (estado && ["nueva", "respondida", "cerrada"].includes(estado)) conds.push(eq(consultas.estado, estado as "nueva"));
  return db.select({
    id: consultas.id, tipo: consultas.tipo, nombre: consultas.nombre, telefono: consultas.telefono, email: consultas.email,
    mensaje: consultas.mensaje, estado: consultas.estado, creadoEn: consultas.creadoEn,
    publicacion: { id: publicaciones.id, titulo: publicaciones.titulo, numero: publicaciones.numero },
  }).from(consultas).leftJoin(publicaciones, eq(consultas.publicacionId, publicaciones.id))
    .where(and(...conds)).orderBy(desc(consultas.creadoEn)).limit(limite);
}

export async function listarUsuarios(db: DB) {
  return db.select({ id: usuarios.id, nombre: usuarios.name, email: usuarios.email, rol: usuarios.rol, activo: usuarios.activo, creadoEn: usuarios.createdAt })
    .from(usuarios).orderBy(asc(usuarios.createdAt));
}

export async function listarActividad(db: DB, limite = 100) {
  return db.select().from(actividad).orderBy(desc(actividad.creadoEn)).limit(limite);
}

export async function conteoPorTipo(db: DB, r: DefinicionRubro) {
  const filas = await db.select({ tipo: publicaciones.tipo, n: count() }).from(publicaciones)
    .where(and(eq(publicaciones.rubro, r.id), inArray(publicaciones.estado, ["publicada", "reservada"]))).groupBy(publicaciones.tipo);
  return Object.fromEntries(filas.map((f) => [f.tipo, f.n])) as Record<string, number>;
}
