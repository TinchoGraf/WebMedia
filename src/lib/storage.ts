/**
 * Dónde se guardan las fotos:
 *  - Con BLOB_READ_WRITE_TOKEN → Vercel Blob (producción)
 *  - Sin token → disco local en .data/media, servido por /media/[...clave] (desarrollo y demos locales)
 */
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";

const DIR_LOCAL = resolve(/*turbopackIgnore: true*/ process.env.MEDIA_DIR ?? join(process.cwd(), ".data", "media"));
/** Las claves las arma el servidor, pero igual se validan: nada de "..", ni rutas absolutas */
export const CLAVE_VALIDA = /^(?=.{1,200}$)[a-z0-9-]+(\/[a-z0-9-]+)*\.webp$/;

const usaBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;

function rutaLocal(clave: string) {
  if (!CLAVE_VALIDA.test(clave)) throw new Error(`Clave de archivo inválida: ${clave}`);
  const ruta = resolve(/*turbopackIgnore: true*/ DIR_LOCAL, clave);
  if (!ruta.startsWith(DIR_LOCAL + sep)) throw new Error("Ruta fuera del directorio de medios");
  return ruta;
}

/**
 * Guarda y devuelve la REFERENCIA que se guarda en la base:
 *  - Blob: la URL completa (https://….public.blob.vercel-storage.com/…)
 *  - Local: la clave relativa (publicaciones/…/x.webp)
 */
export async function guardar(clave: string, datos: Buffer): Promise<string> {
  if (usaBlob()) {
    if (!CLAVE_VALIDA.test(clave)) throw new Error(`Clave de archivo inválida: ${clave}`);
    const { put } = await import("@vercel/blob");
    const r = await put(clave, datos, { access: "public", contentType: "image/webp", addRandomSuffix: false, cacheControlMaxAge: 31536000 });
    return r.url;
  }
  const ruta = rutaLocal(clave);
  await mkdir(dirname(ruta), { recursive: true });
  await writeFile(ruta, datos);
  return clave;
}

const esUrl = (ref: string) => /^https:\/\//.test(ref);

export async function borrar(refs: string[]) {
  const blob = refs.filter(esUrl);
  const locales = refs.filter((r) => !esUrl(r));
  if (blob.length) {
    const { del } = await import("@vercel/blob");
    await del(blob);
  }
  await Promise.all(locales.map((c) => rm(rutaLocal(c), { force: true })));
}

export async function leerLocal(clave: string): Promise<Buffer | null> {
  try {
    return await readFile(rutaLocal(clave));
  } catch {
    return null;
  }
}

/** URL para mostrar en el navegador a partir de la referencia guardada. */
export const urlPublica = (ref: string) => (esUrl(ref) ? ref : `/media/${ref}`);
