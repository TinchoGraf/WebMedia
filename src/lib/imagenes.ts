/**
 * Procesa una foto subida. Es la parte más sensible de la subida, por eso:
 *  - el tipo se detecta por los BYTES del archivo (no por la extensión ni el Content-Type que manda el navegador)
 *  - solo JPEG, PNG, WebP y AVIF (SVG prohibido: puede llevar scripts)
 *  - se re-codifica todo con sharp → WebP: se pierden metadatos EXIF, incluido el GPS (en fotos de casas, la ubicación exacta)
 *    y cualquier contenido escondido dentro del archivo
 */
import sharp from "sharp";
import { fileTypeFromBuffer } from "file-type";
import { ErrorVisible } from "./errores";

export const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export const MAX_BYTES = 10 * 1024 * 1024;
export const ANCHO_GRANDE = 1600;
export const ANCHO_MINIATURA = 640;
const MAX_PIXELES = 60_000_000; // corta "bombas" de descompresión (imágenes enormes que pesan poco)

export type ImagenProcesada = {
  grande: Buffer;
  miniatura: Buffer;
  ancho: number;
  alto: number;
  blur: string;
};

export async function procesarImagen(entrada: Buffer): Promise<ImagenProcesada> {
  if (entrada.byteLength === 0) throw new ErrorVisible("El archivo está vacío.");
  if (entrada.byteLength > MAX_BYTES) throw new ErrorVisible("La foto pesa más de 10 MB.");

  const tipo = await fileTypeFromBuffer(entrada);
  if (!tipo || !(TIPOS_PERMITIDOS as readonly string[]).includes(tipo.mime)) {
    throw new ErrorVisible("Ese archivo no es una foto válida. Usá JPG, PNG, WebP o AVIF.");
  }

  const base = sharp(entrada, { limitInputPixels: MAX_PIXELES, failOn: "error" }).rotate(); // .rotate() aplica la orientación EXIF y la descarta
  const meta = await base.metadata().catch(() => {
    throw new ErrorVisible("No se pudo leer la foto. Probá con otra.");
  });
  if (!meta.width || !meta.height) throw new ErrorVisible("No se pudo leer la foto. Probá con otra.");
  if (meta.width < 400 || meta.height < 300) throw new ErrorVisible("La foto es muy chica: tiene que medir al menos 400 × 300 px.");

  const grande = await base.clone().resize({ width: ANCHO_GRANDE, height: ANCHO_GRANDE, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80, effort: 4 }).toBuffer({ resolveWithObject: true });
  const miniatura = await base.clone().resize({ width: ANCHO_MINIATURA, withoutEnlargement: true }).webp({ quality: 72 }).toBuffer();
  const blurBuf = await base.clone().resize(16, 12, { fit: "cover" }).webp({ quality: 40 }).toBuffer();

  return {
    grande: grande.data,
    miniatura,
    ancho: grande.info.width,
    alto: grande.info.height,
    blur: `data:image/webp;base64,${blurBuf.toString("base64")}`,
  };
}
