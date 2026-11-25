/** Aplica las migraciones de /drizzle. Uso: npm run db:migrate  (usa DATABASE_URL_MIGRACIONES o DATABASE_URL; sin ninguna, PGlite local) */
import { migrate as migratePg } from "drizzle-orm/node-postgres/migrator";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { Pool } from "pg";
import { mkdirSync } from "node:fs";

export async function migrar() {
  const url = process.env.DATABASE_URL_MIGRACIONES || process.env.DATABASE_URL;
  if (url) {
    const pool = new Pool({ connectionString: url, max: 1 });
    await migratePg(drizzlePg(pool), { migrationsFolder: "drizzle" });
    await pool.end();
  } else {
    const dir = process.env.PGLITE_DIR ?? ".data/pglite";
    mkdirSync(dir, { recursive: true });
    const db = drizzlePglite(dir);
    await migratePglite(db, { migrationsFolder: "drizzle" });
    await db.$client.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("migrar.ts")) {
  migrar().then(() => console.log("Migraciones aplicadas.")).catch((e) => { console.error(e); process.exit(1); });
}
