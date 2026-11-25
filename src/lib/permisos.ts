import { ErrorPermiso, ErrorSesion } from "./errores";

export type Rol = "dueno" | "editor" | "demo";
export type UsuarioSesion = { id: string; name: string; email: string; rol: Rol; activo: boolean };

/** Qué puede hacer cada rol. Toda acción del servidor pasa por acá: es la barrera real (proxy.ts solo redirige). */
const PERMISOS = {
  "publicaciones:ver": ["dueno", "editor", "demo"],
  "publicaciones:editar": ["dueno", "editor", "demo"],
  "publicaciones:borrar": ["dueno", "editor"],
  "fotos:subir": ["dueno", "editor", "demo"],
  "fotos:borrar": ["dueno", "editor", "demo"],
  "consultas:ver": ["dueno", "editor", "demo"],
  "consultas:editar": ["dueno", "editor", "demo"],
  "consultas:borrar": ["dueno"],
  "usuarios:gestionar": ["dueno"],
  "actividad:ver": ["dueno"],
} as const satisfies Record<string, readonly Rol[]>;

export type Permiso = keyof typeof PERMISOS;

export function puede(usuario: UsuarioSesion | null | undefined, permiso: Permiso): boolean {
  return !!usuario && usuario.activo && (PERMISOS[permiso] as readonly Rol[]).includes(usuario.rol);
}

export function exigir(usuario: UsuarioSesion | null | undefined, permiso: Permiso): asserts usuario is UsuarioSesion {
  if (!usuario) throw new ErrorSesion();
  if (!usuario.activo) throw new ErrorPermiso("Tu usuario está desactivado.");
  if (!puede(usuario, permiso)) throw new ErrorPermiso();
}
