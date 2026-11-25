import { asc, count, eq, max } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { general } from "../../client.config";
import { fotos, publicaciones } from "../db/schema";
import type { DB } from "../db/conexion";
import { registrar } from "../lib/actividad";
import { ErrorPermiso, ErrorVisible } from "../lib/errores";
import { procesarImagen } from "../lib/imagenes";
import { consumir } from "../lib/limites";
import { exigir, type UsuarioSesion } from "../lib/permisos";
import { borrar, guardar } from "../lib/storage";

async function existePublicacion(db: DB, id: string) {
  const [p] = await db.select({ id: publicaciones.id, titulo: publicaciones.titulo }).from(publicaciones).where(eq(publicaciones.id, id));
  if (!p) throw new ErrorVisible("La publicación no existe.");
  return p;
}

export async function agregarFoto(db: DB, u: UsuarioSesion | null, publicacionId: string, archivo: Buffer, alt = "") {
  exigir(u, "fotos:subir");
  const p = await existePublicacion(db, publicacionId);

  const [{ n }] = await db.select({ n: count() }).from(fotos).where(eq(fotos.publicacionId, publicacionId));
  if (n >= general.maxFotosPorPublicacion) throw new ErrorVisible(`Cada publicación puede tener hasta ${general.maxFotosPorPublicacion} fotos.`);

  if (u.rol === "demo" && !(await consumir(db, `demo-fotos:${u.id}`, general.limitesDemo.fotosPorDia, 24 * 3600_000))) {
    throw new ErrorVisible("La cuenta de demostración llegó al límite de fotos por hoy.");
  }

  const img = await procesarImagen(archivo);
  // Nombre aleatorio: nunca se usa el nombre de archivo que mandó el navegador
  const base = `publicaciones/${publicacionId}/${randomUUID()}`;
  const refGrande = await guardar(`${base}.webp`, img.grande);
  const refMini = await guardar(`${base}-m.webp`, img.miniatura);

  try {
    const foto = await db.transaction(async (tx) => {
      const [{ ultimo }] = await tx.select({ ultimo: max(fotos.orden) }).from(fotos).where(eq(fotos.publicacionId, publicacionId));
      const [f] = await tx.insert(fotos).values({
        publicacionId, clave: refGrande, claveMiniatura: refMini, ancho: img.ancho, alto: img.alto, blur: img.blur,
        alt: (alt || p.titulo).slice(0, 150), orden: (ultimo ?? -1) + 1, subidaPor: u.id,
      }).returning();
      return f;
    });
    await registrar(db, u, "subir-foto", "publicacion", publicacionId);
    return foto;
  } catch (e) {
    await borrar([refGrande, refMini]).catch(() => {});
    throw e;
  }
}

/** Reordena con la lista completa de ids en el orden nuevo. La primera es la portada. */
export async function reordenarFotos(db: DB, u: UsuarioSesion | null, publicacionId: string, ids: string[]) {
  exigir(u, "publicaciones:editar");
  const actuales = await db.select({ id: fotos.id }).from(fotos).where(eq(fotos.publicacionId, publicacionId));
  const set = new Set(actuales.map((f) => f.id));
  if (ids.length !== set.size || new Set(ids).size !== ids.length || !ids.every((id) => set.has(id))) {
    throw new ErrorVisible("La lista de fotos cambió mientras la ordenabas. Recargá la página.");
  }
  await db.transaction(async (tx) => {
    // Paso 1 a negativos para no chocar con el índice único (publicacion, orden)
    for (const [i, id] of ids.entries()) await tx.update(fotos).set({ orden: -1 - i }).where(eq(fotos.id, id));
    for (const [i, id] of ids.entries()) await tx.update(fotos).set({ orden: i }).where(eq(fotos.id, id));
  });
}

export async function elegirPortada(db: DB, u: UsuarioSesion | null, publicacionId: string, fotoId: string) {
  const ids = (await db.select({ id: fotos.id }).from(fotos).where(eq(fotos.publicacionId, publicacionId)).orderBy(asc(fotos.orden))).map((f) => f.id);
  if (!ids.includes(fotoId)) throw new ErrorVisible("La foto no existe.");
  await reordenarFotos(db, u, publicacionId, [fotoId, ...ids.filter((id) => id !== fotoId)]);
}

export async function actualizarAlt(db: DB, u: UsuarioSesion | null, fotoId: string, alt: string) {
  exigir(u, "publicaciones:editar");
  const limpio = alt.replace(/\s+/g, " ").trim().slice(0, 150);
  await db.update(fotos).set({ alt: limpio }).where(eq(fotos.id, fotoId));
}

export async function eliminarFoto(db: DB, u: UsuarioSesion | null, fotoId: string) {
  exigir(u, "fotos:borrar");
  if (u.rol === "demo") {
    // En la demo las fotos de ejemplo no se pueden borrar (el reinicio nocturno no las regenera)
    const [propia] = await db.select({ subidaPor: fotos.subidaPor }).from(fotos).where(eq(fotos.id, fotoId));
    if (propia && propia.subidaPor !== u.id) throw new ErrorPermiso("En la demo solo podés borrar fotos que subiste vos.");
  }
  const [f] = await db.delete(fotos).where(eq(fotos.id, fotoId)).returning();
  if (!f) throw new ErrorVisible("La foto no existe.");
  await borrar([f.clave, f.claveMiniatura]).catch(() => {});
  // Compacta el orden para que no queden huecos
  const resto = await db.select({ id: fotos.id }).from(fotos).where(eq(fotos.publicacionId, f.publicacionId)).orderBy(asc(fotos.orden));
  if (resto.length) await reordenarFotos(db, u, f.publicacionId, resto.map((r) => r.id));
  await registrar(db, u, "borrar-foto", "publicacion", f.publicacionId);
}
