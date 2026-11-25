/**
 * Base de datos para tests de integración:
 *  - TEST_DATABASE_URL definida → ese Postgres (se BORRA su contenido)
 *  - si no → PGlite en una carpeta temporal (no hace falta instalar nada)
 */
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { sql } from "drizzle-orm";
import sharp from "sharp";

if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
  delete process.env.DATABASE_URL_MIGRACIONES;
} else {
  delete process.env.DATABASE_URL;
  delete process.env.DATABASE_URL_MIGRACIONES;
  process.env.PGLITE_DIR = mkdtempSync(join(tmpdir(), "webmedia-pglite-"));
}
process.env.MEDIA_DIR = mkdtempSync(join(tmpdir(), "webmedia-media-"));
delete process.env.BLOB_READ_WRITE_TOKEN;

export async function prepararBase() {
  const { migrar } = await import("../../scripts/migrar");
  await migrar();
  const { db } = await import("../../src/db/conexion");
  await db.execute(sql`TRUNCATE actividad, consultas, fotos, publicaciones, limites, sesiones, cuentas, usuarios RESTART IDENTITY CASCADE`);
  const { crearUsuarioConPassword } = await import("../../src/server/usuarios-base");
  const crear = async (rol: "dueno" | "editor" | "demo") => {
    const id = await crearUsuarioConPassword(db, { nombre: rol, email: `${rol}@test.local`, password: "una-clave-larga-123", rol });
    return { id, name: rol, email: `${rol}@test.local`, rol, activo: true } as const;
  };
  return { db, dueno: await crear("dueno"), editor: await crear("editor"), demo: await crear("demo") };
}

export const fotoJpeg = (color = "#8E9AA3") =>
  sharp({ create: { width: 1200, height: 900, channels: 3, background: color } }).jpeg().toBuffer();

export const autoValido = {
  tipo: "auto", precio: "9.800.000", moneda: "ARS", descripcion: "Muy cuidado",
  atributos: { marca: "Volkswagen", modelo: "Gol Trend", anio: "2015", km: "98000", combustible: "nafta", transmision: "manual", color: "Gris" },
};
