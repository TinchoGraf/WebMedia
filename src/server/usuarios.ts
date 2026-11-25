import { eq } from "drizzle-orm";
import { z } from "zod";
import { sesiones, usuarios } from "../db/schema";
import type { DB } from "../db/conexion";
import { registrar } from "../lib/actividad";
import { ErrorVisible } from "../lib/errores";
import { exigir, type UsuarioSesion } from "../lib/permisos";
import { crearUsuarioConPassword } from "./usuarios-base";

const esquemaNuevo = z.object({
  nombre: z.string().trim().min(2, "Escribí el nombre").max(80),
  email: z.string().trim().toLowerCase().email("Email inválido").max(120),
  password: z.string().min(12, "Mínimo 12 caracteres").max(128),
  rol: z.enum(["dueno", "editor", "demo"]),
});

export async function crearUsuario(db: DB, u: UsuarioSesion | null, datos: unknown) {
  exigir(u, "usuarios:gestionar");
  const r = esquemaNuevo.safeParse(datos);
  if (!r.success) {
    const campos: Record<string, string> = {};
    for (const i of r.error.issues) campos[i.path.join(".")] ??= i.message;
    throw new ErrorVisible("Revisá los campos marcados.", campos);
  }
  const id = await crearUsuarioConPassword(db, r.data);
  await registrar(db, u, "crear", "usuario", id, { email: r.data.email, rol: r.data.rol });
  return id;
}

export async function cambiarActivo(db: DB, u: UsuarioSesion | null, id: string, activo: boolean) {
  exigir(u, "usuarios:gestionar");
  if (id === u.id) throw new ErrorVisible("No podés desactivar tu propio usuario.");
  await db.update(usuarios).set({ activo }).where(eq(usuarios.id, id));
  // Al desactivar, se cierran sus sesiones abiertas
  if (!activo) await db.delete(sesiones).where(eq(sesiones.userId, id));
  await registrar(db, u, activo ? "activar" : "desactivar", "usuario", id);
}

export async function cambiarRol(db: DB, u: UsuarioSesion | null, id: string, rol: string) {
  exigir(u, "usuarios:gestionar");
  if (!["dueno", "editor", "demo"].includes(rol)) throw new ErrorVisible("Rol inválido.");
  if (id === u.id) throw new ErrorVisible("No podés cambiar tu propio rol.");
  await db.update(usuarios).set({ rol: rol as "editor" }).where(eq(usuarios.id, id));
  await registrar(db, u, `rol:${rol}`, "usuario", id);
}
