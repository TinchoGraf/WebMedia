"use server";
/**
 * Server Actions del panel. Cada una: 1) lee la sesión 2) llama a la lógica (que verifica permisos con exigir())
 * 3) revalida las páginas afectadas. Una Server Action es un endpoint público: nunca confiar en que "solo se llama desde el panel".
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { perfilActivo } from "@config";
import { db } from "@/db";
import { ErrorVisible, type Resultado } from "@/lib/errores";
import { formAObjeto } from "@/lib/formdata";
import { MAX_BYTES } from "@/lib/imagenes";
import { usuarioActual } from "@/server/auth";
import { cambiarEstadoConsulta, eliminarConsulta } from "@/server/consultas";
import { actualizarAlt, agregarFoto, elegirPortada, eliminarFoto, reordenarFotos } from "@/server/fotos";
import { actualizarPublicacion, cambiarEstado, crearPublicacion, duplicarPublicacion, eliminarPublicacion } from "@/server/publicaciones";
import { cambiarActivo, cambiarRol, crearUsuario } from "@/server/usuarios";
import { rubro } from "@/rubros";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const id = (v: unknown) => {
  if (typeof v !== "string" || !UUID.test(v)) throw new ErrorVisible("Identificador inválido.");
  return v;
};

async function envolver<T>(fn: () => Promise<T>, mensaje?: string): Promise<Resultado<T>> {
  try {
    const datos = await fn();
    return { ok: true, datos, mensaje };
  } catch (e) {
    if (e instanceof ErrorVisible) return { ok: false, error: e.message, campos: e.campos };
    if (e && typeof e === "object" && "digest" in e && String((e as { digest: string }).digest).startsWith("NEXT_REDIRECT")) throw e;
    console.error(e);
    return { ok: false, error: "Algo salió mal. Probá de nuevo." };
  }
}

const revalidarSitio = () => {
  const r = rubro(perfilActivo().rubro);
  revalidatePath("/");
  revalidatePath(`/${r.ruta}`, "layout");
  revalidatePath("/panel", "layout");
};

/* ───── Publicaciones ───── */

export async function crear(_p: Resultado | null, form: FormData): Promise<Resultado> {
  let nuevaId: string | undefined;
  const r = await envolver(async () => {
    const u = await usuarioActual();
    const p = await crearPublicacion(db, u, perfilActivo().rubro, formAObjeto(form));
    nuevaId = p.id;
  });
  if (r.ok && nuevaId) {
    revalidarSitio();
    redirect(`/panel/publicaciones/${nuevaId}?nueva=1`);
  }
  return r;
}

export async function guardar(pubId: string, _p: Resultado | null, form: FormData): Promise<Resultado> {
  const r = await envolver(async () => {
    await actualizarPublicacion(db, await usuarioActual(), id(pubId), formAObjeto(form));
  }, "Cambios guardados.");
  if (r.ok) revalidarSitio();
  return r;
}

export async function estado(pubId: string, nuevo: string): Promise<Resultado> {
  const r = await envolver(async () => cambiarEstado(db, await usuarioActual(), id(pubId), nuevo), "Estado actualizado.");
  if (r.ok) revalidarSitio();
  return r;
}

export async function duplicar(pubId: string): Promise<Resultado> {
  let nueva: string | undefined;
  const r = await envolver(async () => { nueva = (await duplicarPublicacion(db, await usuarioActual(), id(pubId))).id; });
  if (r.ok && nueva) { revalidarSitio(); redirect(`/panel/publicaciones/${nueva}`); }
  return r;
}

export async function eliminar(pubId: string): Promise<Resultado> {
  const r = await envolver(async () => eliminarPublicacion(db, await usuarioActual(), id(pubId)));
  if (r.ok) { revalidarSitio(); redirect("/panel/publicaciones?borrada=1"); }
  return r;
}

/* ───── Fotos ───── */

export async function subirFoto(pubId: string, form: FormData): Promise<Resultado<{ id: string }>> {
  const r = await envolver(async () => {
    const archivo = form.get("archivo");
    if (!(archivo instanceof File)) throw new ErrorVisible("No llegó ningún archivo.");
    if (archivo.size > MAX_BYTES) throw new ErrorVisible("La foto pesa más de 10 MB.");
    const f = await agregarFoto(db, await usuarioActual(), id(pubId), Buffer.from(await archivo.arrayBuffer()));
    return { id: f.id };
  });
  if (r.ok) revalidarSitio();
  return r;
}

export async function ordenarFotos(pubId: string, ids: string[]): Promise<Resultado> {
  const r = await envolver(async () => {
    if (!Array.isArray(ids) || ids.length > 100) throw new ErrorVisible("Lista inválida.");
    await reordenarFotos(db, await usuarioActual(), id(pubId), ids.map(id));
  });
  if (r.ok) revalidarSitio();
  return r;
}

export async function portada(pubId: string, fotoId: string): Promise<Resultado> {
  const r = await envolver(async () => elegirPortada(db, await usuarioActual(), id(pubId), id(fotoId)), "Portada actualizada.");
  if (r.ok) revalidarSitio();
  return r;
}

export async function textoAlternativo(fotoId: string, alt: string): Promise<Resultado> {
  return envolver(async () => actualizarAlt(db, await usuarioActual(), id(fotoId), String(alt)), "Descripción guardada.");
}

export async function borrarFoto(fotoId: string): Promise<Resultado> {
  const r = await envolver(async () => eliminarFoto(db, await usuarioActual(), id(fotoId)));
  if (r.ok) revalidarSitio();
  return r;
}

/* ───── Consultas ───── */

export async function estadoConsulta(consultaId: string, nuevo: string): Promise<Resultado> {
  const r = await envolver(async () => cambiarEstadoConsulta(db, await usuarioActual(), id(consultaId), nuevo));
  if (r.ok) revalidatePath("/panel", "layout");
  return r;
}

export async function borrarConsulta(consultaId: string): Promise<Resultado> {
  const r = await envolver(async () => eliminarConsulta(db, await usuarioActual(), id(consultaId)));
  if (r.ok) revalidatePath("/panel", "layout");
  return r;
}

/* ───── Usuarios ───── */

export async function nuevoUsuario(_p: Resultado | null, form: FormData): Promise<Resultado> {
  const r = await envolver(async () => { await crearUsuario(db, await usuarioActual(), formAObjeto(form)); }, "Usuario creado. Pasale la contraseña por un canal seguro.");
  if (r.ok) revalidatePath("/panel/usuarios");
  return r;
}

export async function activarUsuario(usuarioId: string, activo: boolean): Promise<Resultado> {
  const r = await envolver(async () => cambiarActivo(db, await usuarioActual(), String(usuarioId).slice(0, 64), !!activo));
  if (r.ok) revalidatePath("/panel/usuarios");
  return r;
}

export async function rolUsuario(usuarioId: string, rol: string): Promise<Resultado> {
  const r = await envolver(async () => cambiarRol(db, await usuarioActual(), String(usuarioId).slice(0, 64), String(rol)));
  if (r.ok) revalidatePath("/panel/usuarios");
  return r;
}
