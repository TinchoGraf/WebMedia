/** Contador con ventana de tiempo guardado en Postgres (sirve en serverless, donde la memoria no se comparte). */
import { sql } from "drizzle-orm";
import { limites } from "../db/schema";
import type { DB } from "../db/conexion";

/** Suma 1 al contador `clave`. Devuelve false si ya se pasó de `max` dentro de la ventana. Atómico (un solo UPSERT). */
export async function consumir(db: DB, clave: string, max: number, ventanaMs: number, cuanto = 1): Promise<boolean> {
  const hasta = new Date(Date.now() + ventanaMs);
  const filas = await db.execute<{ cantidad: number }>(sql`
    INSERT INTO ${limites} (clave, cantidad, ventana_hasta) VALUES (${clave}, ${cuanto}, ${hasta})
    ON CONFLICT (clave) DO UPDATE SET
      cantidad = CASE WHEN ${limites.ventanaHasta} < now() THEN ${cuanto} ELSE ${limites.cantidad} + ${cuanto} END,
      ventana_hasta = CASE WHEN ${limites.ventanaHasta} < now() THEN ${hasta} ELSE ${limites.ventanaHasta} END
    RETURNING cantidad`);
  const rows = (filas as unknown as { rows?: { cantidad: number }[] }).rows ?? (filas as unknown as { cantidad: number }[]);
  return Number(rows[0]?.cantidad ?? 0) <= max;
}
