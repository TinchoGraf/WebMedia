/** Configuración de Better Auth: email + contraseña, sin registro público (los usuarios los crea el dueño). */
import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { cache } from "react";
import { db, schema } from "@/db";
import type { UsuarioSesion } from "@/lib/permisos";

const secreto = process.env.BETTER_AUTH_SECRET;
if (!secreto && process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build") {
  throw new Error("Falta BETTER_AUTH_SECRET");
}

export const auth = betterAuth({
  appName: "Panel",
  secret: secreto ?? "solo-para-desarrollo-local-cambiar-en-produccion-0000",
  baseURL: process.env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user: schema.usuarios, session: schema.sesiones, account: schema.cuentas, verification: schema.verificaciones, rateLimit: schema.limitesAuth },
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
  },
  user: {
    additionalFields: {
      rol: { type: "string", input: false, defaultValue: "editor" },
      activo: { type: "boolean", input: false, defaultValue: true },
    },
  },
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 60,
    customRules: { "/sign-in/email": { window: 15 * 60, max: 5 } },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    ipAddress: { ipAddressHeaders: ["x-forwarded-for", "x-real-ip"] },
  },
  databaseHooks: {
    session: {
      create: {
        // Un usuario desactivado no puede iniciar sesión aunque sepa la contraseña
        before: async (s) => {
          const [u] = await db.select({ activo: schema.usuarios.activo }).from(schema.usuarios).where(eq(schema.usuarios.id, s.userId));
          if (!u?.activo) return false;
        },
      },
    },
  },
  plugins: [nextCookies()],
});

/** Usuario de la sesión actual (o null). Cacheado por request. */
export const usuarioActual = cache(async (): Promise<UsuarioSesion | null> => {
  const s = await auth.api.getSession({ headers: await headers() });
  if (!s) return null;
  const u = s.user as typeof s.user & { rol?: string; activo?: boolean };
  return { id: u.id, name: u.name, email: u.email, rol: (u.rol ?? "editor") as UsuarioSesion["rol"], activo: u.activo !== false };
});
