# De demo a cliente real

## 1. Adaptar
1. Copiar el repo (GitHub → "Use this template") a `C:\dev\clientes\<nombre>`.
2. `client.config.ts`: dejá un solo perfil con los datos reales del cliente y `esDemo: false`.
3. Si el rubro es otro (motos, maquinaria, alquiler temporario): copiá `src/rubros/vehiculo.ts`, ajustá campos y registralo en `src/rubros/index.ts`.
4. Colores en `src/styles/global.css` (tokens) según el logo. Logo en `src/components/publico/Marca.tsx` y `public/favicon.svg`.
5. `node scripts/generar-og.mjs "Nombre" "Bajada"` para la imagen que aparece al compartir el link.
6. Borrar o vaciar `src/server/demo-datos.ts` si el cliente arranca sin ejemplos.

## 2. Base de datos (Neon, gratis para empezar)
1. Crear proyecto en Neon, región **São Paulo** (aws-sa-east-1).
2. Copiar la connection string del usuario dueño → `DATABASE_URL_MIGRACIONES` (solo para migrar).
3. Correr `drizzle/roles-produccion.sql` en el SQL Editor de Neon (con una contraseña generada): crea `app_web` sin permiso para borrar tablas.
4. Connection string **pooled** (host con `-pooler`) con el usuario `app_web` → `DATABASE_URL`.
5. Desde tu compu: `npm run db:migrate` (con las dos variables en `.env.local`). Después crear el usuario dueño: `npx tsx scripts/seed.ts --solo-dueno` con `SEED_DUENO_EMAIL`/`SEED_DUENO_PASSWORD` del cliente (no carga ejemplos ni usuarios de demo).

## 3. Fotos (Vercel Blob)
En el proyecto de Vercel → Storage → crear un Blob store y conectarlo: Vercel agrega `BLOB_READ_WRITE_TOKEN` solo.

## 4. Deploy en Vercel
Variables de entorno (Production): `PERFIL`, `DATABASE_URL`, `BETTER_AUTH_SECRET` (nuevo, distinto al de desarrollo), `BETTER_AUTH_URL` (https://dominio-del-cliente), `CRON_SECRET` (solo si es demo), `RESEND_API_KEY` + `EMAIL_AVISOS` (opcional).
- El cron de `vercel.json` reinicia el modo demo cada noche: **sacalo** en un cliente real.
- Plan con uso comercial (Vercel Pro u otro): el costo va en el mantenimiento mensual.

## 5. Dominio y Google
1. Dominio .com.ar en NIC.ar a nombre del cliente → DNS a Vercel → SSL automático.
2. Search Console: enviar `https://dominio/sitemap.xml`. Cargar la URL en el Perfil de Empresa de Google.

## 6. Entrega
- Crear los usuarios del cliente desde Panel → Usuarios (contraseña por canal seguro, no por mail).
- Mostrarle cómo cargar una publicación desde el celular (sacar fotos en el momento).
- Verificar cabeceras en securityheaders.com (objetivo A) y correr `npm test` + `npm run test:e2e` antes del primer deploy.
