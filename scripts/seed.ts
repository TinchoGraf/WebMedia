/**
 * Prepara la base para la demo: migraciones + usuarios + publicaciones de ejemplo con fotos.
 *   npm run db:seed            → crea lo que falte (no pisa nada)
 *   npm run db:reset           → borra el catálogo y lo vuelve a cargar (NO borra usuarios)
 *   npx tsx scripts/seed.ts --solo-dueno → cliente real: migra y crea solo el usuario dueño
 * El rubro sale de PERFIL (autos | propiedades). Para cargar los dos: PERFIL=propiedades npm run db:seed
 */
import { randomBytes } from "node:crypto";
import { rm } from "node:fs/promises";
import { eq, sql } from "drizzle-orm";
import { perfilActivo } from "../client.config";
import { actividad, consultas, fotos, limites, limitesAuth, publicaciones, usuarios } from "../src/db/schema";
import { sembrarCatalogo } from "../src/server/demo";
import { crearUsuarioConPassword } from "../src/server/usuarios-base";
import type { UsuarioSesion } from "../src/lib/permisos";
import { migrar } from "./migrar";

const clave = () => randomBytes(12).toString("base64url");

// La conexión se abre DESPUÉS de migrar: con PGlite, una instancia abierta antes no ve las tablas nuevas.
let db: typeof import("../src/db/conexion").db;

async function asegurarUsuario(nombre: string, email: string, rol: "dueno" | "editor" | "demo", passwordEnv?: string) {
  const [u] = await db.select().from(usuarios).where(eq(usuarios.email, email));
  if (u) return { id: u.id, name: u.name, email: u.email, rol: u.rol, activo: u.activo } as UsuarioSesion;
  const password = passwordEnv || clave();
  const id = await crearUsuarioConPassword(db, { nombre, email, password, rol });
  // Solo se muestra una vez, en tu terminal. Guardala en tu gestor de contraseñas.
  console.log(`  usuario ${rol.padEnd(6)} ${email}  contraseña: ${passwordEnv ? "(la de .env.local)" : password}`);
  return { id, name: nombre, email, rol, activo: true } as UsuarioSesion;
}

async function main() {
  const perfil = perfilActivo();
  await migrar();
  db = (await import("../src/db/conexion")).db;
  console.log(`Perfil: ${perfil.nombre} (rubro ${perfil.rubro})`);

  if (process.argv.includes("--reset")) {
    console.log("Borrando catálogo, consultas y fotos…");
    await db.delete(consultas);
    await db.delete(fotos);
    await db.delete(publicaciones);
    await db.delete(actividad);
    await db.delete(limites);
    await db.delete(limitesAuth);
    // Los códigos vuelven a empezar en 0001
    await db.execute(sql`SELECT setval(pg_get_serial_sequence('publicaciones', 'numero'), 1, false)`);
    if (!process.env.BLOB_READ_WRITE_TOKEN) await rm(process.env.MEDIA_DIR ?? ".data/media", { recursive: true, force: true });
  }

  console.log("Usuarios:");
  const dueno = await asegurarUsuario("Dueño", process.env.SEED_DUENO_EMAIL || "dueno@demo.local", "dueno", process.env.SEED_DUENO_PASSWORD);
  // Cliente real: solo el usuario dueño, sin ejemplos ni usuarios de demo
  if (process.argv.includes("--solo-dueno")) return console.log("Listo (solo dueño).");
  await asegurarUsuario("Vendedor", "editor@demo.local", "editor", process.env.SEED_EDITOR_PASSWORD);
  await asegurarUsuario("Demo", "demo@demo.local", "demo", process.env.SEED_DEMO_PASSWORD);

  console.log("Publicaciones de ejemplo:");
  await sembrarCatalogo(db, dueno, perfil.rubro);
  console.log("Listo.");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
