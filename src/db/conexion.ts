/**
 * Conexión a la base:
 *  - DATABASE_URL definida → Postgres real (Neon en producción, o uno local).
 *  - Sin DATABASE_URL → PGlite: un Postgres completo embebido en .data/pglite. Sirve para probar sin instalar nada.
 */
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { Pool } from "pg";
import * as schema from "./schema";

function crear() {
  const url = process.env.DATABASE_URL;
  if (url) {
    const pool = new Pool({ connectionString: url, max: 5, ssl: /sslmode=require|neon\.tech/.test(url) ? { rejectUnauthorized: true } : undefined });
    return drizzlePg(pool, { schema });
  }
  // PGlite: un solo proceso. Ideal para desarrollo y demos locales; no para producción.
  return drizzlePglite(process.env.PGLITE_DIR ?? ".data/pglite", { schema }) as unknown as ReturnType<typeof drizzlePg<typeof schema>>;
}

const global_ = globalThis as unknown as { __db?: ReturnType<typeof crear> };
export const db = global_.__db ?? (global_.__db = crear());
export type DB = typeof db;
export { schema };
