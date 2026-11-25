/** Alta de usuarios sin pasar por el endpoint público de registro (que está deshabilitado). Lo usan el panel y el seed. */
import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { cuentas, usuarios } from "../db/schema";
import type { DB } from "../db/conexion";
import { ErrorVisible } from "../lib/errores";
import type { Rol } from "../lib/permisos";

export async function crearUsuarioConPassword(db: DB, d: { nombre: string; email: string; password: string; rol: Rol }) {
  const email = d.email.trim().toLowerCase();
  if (d.password.length < 12) throw new ErrorVisible("La contraseña tiene que tener al menos 12 caracteres.", { password: "Mínimo 12 caracteres" });
  const [existe] = await db.select({ id: usuarios.id }).from(usuarios).where(eq(usuarios.email, email));
  if (existe) throw new ErrorVisible("Ya hay un usuario con ese email.", { email: "Ya está en uso" });

  const id = randomUUID();
  const hash = await hashPassword(d.password);
  await db.transaction(async (tx) => {
    await tx.insert(usuarios).values({ id, name: d.nombre.trim(), email, rol: d.rol, emailVerified: true });
    await tx.insert(cuentas).values({ id: randomUUID(), accountId: id, providerId: "credential", userId: id, password: hash });
  });
  return id;
}
