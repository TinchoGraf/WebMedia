/**
 * Carga de datos de ejemplo y reinicio nocturno del modo demo.
 * Usa la MISMA lógica que el panel (crearPublicacion, agregarFoto…): si el seed funciona, el panel valida igual.
 */
import { and, asc, eq, inArray, isNotNull, sql } from "drizzle-orm";
import sharp from "sharp";
import { autoSVG } from "../../scripts/imagenes/autos.mjs";
import * as ilus from "../../scripts/imagenes/propiedades.mjs";
import { actividad, consultas, fotos, limites, publicaciones, usuarios } from "../db/schema";
import type { DB } from "../db/conexion";
import type { UsuarioSesion } from "../lib/permisos";
import { aCentavos } from "../lib/precios";
import { borrar } from "../lib/storage";
import { rubro } from "../rubros";
import { AUTOS, CONSULTAS, PROPIEDADES, type SemillaAuto, type SemillaPropiedad } from "./demo-datos";
import { agregarFoto, reordenarFotos } from "./fotos";
import { cambiarEstado, crearPublicacion } from "./publicaciones";

const aJpeg = (svg: string) => sharp(Buffer.from(svg)).jpeg({ quality: 86 }).toBuffer();

function escenasAuto(a: SemillaAuto, i: number) {
  const vistas = a.estado === "borrador" ? ["lateral", "frente"] : ["lateral", "frente", "trasera", "interior"];
  return vistas.map((v) => ({ alt: `${a.atributos.marca} ${a.atributos.modelo}, vista ${v}`, svg: () => autoSVG(a.carroceria, a.color, v, `s${i}${v}`) }));
}

function escenasPropiedad(p: SemillaPropiedad) {
  const { pared, acento } = p.paleta;
  const mapa = {
    casa: () => ilus.fachadaCasa(pared, acento), depto: () => ilus.fachadaDepto(pared, acento), living: () => ilus.living(undefined, acento === "#A4553A" ? "#7C8B76" : "#8C7E6A"),
    cocina: () => ilus.cocina(), dormitorio: () => ilus.dormitorio(), patio: () => ilus.patioParrilla(), lote: () => ilus.lote(pared), campo: () => ilus.campo(), local: () => ilus.local(pared, acento),
  } as const;
  const nombres = { casa: "frente", depto: "frente del edificio", living: "living", cocina: "cocina", dormitorio: "dormitorio", patio: "patio con parrilla", lote: "terreno", campo: "campo", local: "vidriera" };
  return p.escenas.map((e) => ({ alt: nombres[e], svg: mapa[e] }));
}

type Semilla = { datos: Record<string, unknown>; estado: string; destacada: boolean; escenas: { alt: string; svg: () => string }[] };

function semillas(rubroId: string): Semilla[] {
  if (rubroId === "vehiculo") {
    return AUTOS.map((a, i) => ({
      datos: { tipo: a.tipo, precio: a.precio, moneda: "ARS", descripcion: a.descripcion, destacada: !!a.destacada, atributos: a.atributos },
      estado: a.estado ?? "publicada", destacada: !!a.destacada, escenas: escenasAuto(a, i),
    }));
  }
  const r = rubro("inmueble");
  return PROPIEDADES.map((p) => ({
    datos: {
      titulo: p.titulo, operacion: p.operacion, tipo: p.tipo, zona: p.zona, precio: p.precio, moneda: r.moneda(p.operacion),
      expensas: p.expensas ?? null, descripcion: p.descripcion, destacada: !!p.destacada, atributos: p.atributos,
    },
    estado: p.estado ?? "publicada", destacada: !!p.destacada, escenas: escenasPropiedad(p),
  }));
}

/** Crea las publicaciones de ejemplo del rubro (con fotos ilustradas) si todavía no hay ninguna. */
export async function sembrarCatalogo(db: DB, autor: UsuarioSesion, rubroId: string, log = console.log) {
  const [hay] = await db.select({ id: publicaciones.id }).from(publicaciones).where(eq(publicaciones.rubro, rubroId)).limit(1);
  if (hay) return log(`Ya hay publicaciones de ${rubroId}: no se cargan ejemplos.`);

  const creadas: { id: string }[] = [];
  for (const s of semillas(rubroId)) {
    const p = await crearPublicacion(db, autor, rubroId, s.datos);
    for (const e of s.escenas) await agregarFoto(db, autor, p.id, await aJpeg(e.svg()), e.alt);
    if (s.estado !== "borrador") await cambiarEstado(db, autor, p.id, s.estado);
    creadas.push(p);
    log(`  ✓ ${p.slug} (${s.escenas.length} fotos)`);
  }

  // Consultas de ejemplo
  const lista = await db.select({ id: publicaciones.id }).from(publicaciones).where(eq(publicaciones.rubro, rubroId)).orderBy(asc(publicaciones.numero));
  for (const c of CONSULTAS) {
    await db.insert(consultas).values({
      publicacionId: c.indice === null ? null : lista[c.indice]?.id, rubro: rubroId, tipo: c.tipo ?? "consulta", nombre: c.nombre, telefono: c.telefono,
      email: c.email, mensaje: rubroId === "vehiculo" ? c.mensaje : "Hola, ¿sigue disponible? ¿Se puede visitar esta semana?", estado: c.estado,
    });
  }
  return creadas;
}

/**
 * Reinicio del modo demo (cron nocturno). No regenera imágenes:
 *  - borra lo que creó el usuario demo (publicaciones y fotos que subió)
 *  - vuelve las publicaciones de ejemplo a sus datos originales y el orden original de fotos
 *  - repone las consultas de ejemplo y limpia contadores
 */
export async function reiniciarDemo(db: DB, rubroId: string) {
  const demos = (await db.select({ id: usuarios.id }).from(usuarios).where(eq(usuarios.rol, "demo"))).map((u) => u.id);
  const [dueno] = await db.select().from(usuarios).where(eq(usuarios.rol, "dueno")).orderBy(asc(usuarios.createdAt)).limit(1);
  if (!dueno) throw new Error("No hay usuario dueño");
  const autor: UsuarioSesion = { id: dueno.id, name: dueno.name, email: dueno.email, rol: "dueno", activo: true };

  if (demos.length) {
    const fotosDemo = await db.select({ c: fotos.clave, m: fotos.claveMiniatura }).from(fotos).where(inArray(fotos.subidaPor, demos));
    const pubsDemo = await db.select({ id: publicaciones.id }).from(publicaciones).where(inArray(publicaciones.creadoPor, demos));
    const fotosPubsDemo = pubsDemo.length
      ? await db.select({ c: fotos.clave, m: fotos.claveMiniatura }).from(fotos).where(inArray(fotos.publicacionId, pubsDemo.map((p) => p.id)))
      : [];
    await db.delete(fotos).where(inArray(fotos.subidaPor, demos));
    if (pubsDemo.length) await db.delete(publicaciones).where(inArray(publicaciones.id, pubsDemo.map((p) => p.id)));
    await borrar([...fotosDemo, ...fotosPubsDemo].flatMap((f) => [f.c, f.m])).catch(() => {});
  }

  // Datos originales: las semillas están en el mismo orden que el número de publicación
  const originales = await db.select({ id: publicaciones.id }).from(publicaciones)
    .where(and(eq(publicaciones.rubro, rubroId), eq(publicaciones.creadoPor, dueno.id))).orderBy(asc(publicaciones.numero));
  const ss = semillas(rubroId);
  for (const [i, p] of originales.entries()) {
    const s = ss[i];
    if (!s) break;
    const d = s.datos as Record<string, unknown>;
    await db.update(publicaciones).set({
      precio: aCentavos(d.precio as number | null), descripcion: String(d.descripcion), atributos: d.atributos as Record<string, unknown>,
      estado: s.estado as "publicada", destacada: s.destacada, publicadoEn: s.estado === "borrador" ? null : sql`coalesce(${publicaciones.publicadoEn}, now())`,
    }).where(eq(publicaciones.id, p.id));
    const fs = await db.select({ id: fotos.id }).from(fotos).where(eq(fotos.publicacionId, p.id)).orderBy(asc(fotos.creadoEn));
    if (fs.length) await reordenarFotos(db, autor, p.id, fs.map((f) => f.id));
  }

  await db.delete(consultas).where(eq(consultas.rubro, rubroId));
  const lista = originales;
  for (const c of CONSULTAS) {
    await db.insert(consultas).values({
      publicacionId: c.indice === null ? null : lista[c.indice]?.id, rubro: rubroId, tipo: c.tipo ?? "consulta", nombre: c.nombre, telefono: c.telefono,
      email: c.email, mensaje: rubroId === "vehiculo" ? c.mensaje : "Hola, ¿sigue disponible? ¿Se puede visitar esta semana?", estado: c.estado,
    });
  }
  await db.delete(limites);
  await db.delete(actividad).where(and(isNotNull(actividad.usuarioId), demos.length ? inArray(actividad.usuarioId, demos) : sql`false`));
}
