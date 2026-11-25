import { actividad } from "../db/schema";
import type { DB } from "../db/conexion";
import type { UsuarioSesion } from "./permisos";

export async function registrar(db: DB, u: UsuarioSesion | null, accion: string, entidad: string, entidadId?: string, detalle?: Record<string, unknown>) {
  await db.insert(actividad).values({ usuarioId: u?.id, usuarioNombre: u?.name, accion, entidad, entidadId, detalle });
}
