import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { consultas, publicaciones } from "../db/schema";
import type { DB } from "../db/conexion";
import { registrar } from "../lib/actividad";
import { ErrorVisible } from "../lib/errores";
import { consumir } from "../lib/limites";
import { exigir, type UsuarioSesion } from "../lib/permisos";

const sinControl = (s: string) => s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "");

export const esquemaConsulta = z.object({
  publicacionId: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
  tipo: z.enum(["consulta", "tasacion", "contacto"]).default("consulta"),
  nombre: z.string().transform(sinControl).pipe(z.string().trim().min(2, "Escribí tu nombre").max(80, "Máximo 80 caracteres")),
  telefono: z.string().trim().regex(/^[+\d][\d\s()-]{5,24}$/, "Escribí un teléfono válido, con característica"),
  email: z.string().trim().max(120).email("Ese email no parece válido").optional().or(z.literal("").transform(() => undefined)),
  mensaje: z.string().transform(sinControl).pipe(z.string().trim().min(5, "Contanos un poco más").max(2000, "Máximo 2000 caracteres")),
  /** Campo trampa: invisible para personas; si viene lleno, es un bot */
  sitio: z.string().optional(),
});

export const hashIp = (ip: string | null) =>
  ip ? createHash("sha256").update(`${process.env.BETTER_AUTH_SECRET ?? "dev"}:${ip}`).digest("hex").slice(0, 32) : null;

/** Consulta desde el sitio público (sin sesión). Devuelve { guardada } para poder testear el honeypot. */
export async function crearConsulta(db: DB, datos: unknown, ip: string | null, rubro = "vehiculo") {
  const res = esquemaConsulta.safeParse(datos);
  if (!res.success) {
    const campos: Record<string, string> = {};
    for (const i of res.error.issues) campos[i.path.join(".")] ??= i.message;
    throw new ErrorVisible("Revisá los campos marcados.", campos);
  }
  const v = res.data;
  if (v.sitio) return { guardada: false }; // al bot le respondemos "ok" igual

  const ipHash = hashIp(ip);
  if (ipHash && !(await consumir(db, `consulta:${ipHash}`, 5, 10 * 60_000))) {
    throw new ErrorVisible("Mandaste varias consultas seguidas. Esperá unos minutos o escribinos por WhatsApp.");
  }
  if (!(await consumir(db, "consulta:global", 300, 24 * 3600_000))) {
    throw new ErrorVisible("No pudimos recibir la consulta ahora. Escribinos por WhatsApp.");
  }

  let publicacionId = v.publicacionId;
  if (publicacionId) {
    const [p] = await db.select({ id: publicaciones.id }).from(publicaciones).where(eq(publicaciones.id, publicacionId));
    if (!p) publicacionId = undefined;
  }
  const [c] = await db.insert(consultas).values({
    publicacionId, rubro, tipo: v.tipo, nombre: v.nombre, telefono: v.telefono, email: v.email, mensaje: v.mensaje, ipHash,
  }).returning({ id: consultas.id });
  return { guardada: true, id: c.id };
}

export async function cambiarEstadoConsulta(db: DB, u: UsuarioSesion | null, id: string, estado: string) {
  exigir(u, "consultas:editar");
  if (!["nueva", "respondida", "cerrada"].includes(estado)) throw new ErrorVisible("Estado inválido.");
  await db.update(consultas).set({ estado: estado as "nueva" }).where(eq(consultas.id, id));
  await registrar(db, u, `consulta:${estado}`, "consulta", id);
}

export async function eliminarConsulta(db: DB, u: UsuarioSesion | null, id: string) {
  exigir(u, "consultas:borrar");
  await db.delete(consultas).where(eq(consultas.id, id));
  await registrar(db, u, "borrar", "consulta", id);
}
