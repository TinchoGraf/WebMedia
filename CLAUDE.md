# WebMedia · Demo Nivel 2 (Autoadministrable) — "Piedra Autos" / "Piedra Propiedades"

Catálogo público + panel para que el dueño cargue publicaciones con fotos. Plan: `Plan2-Autoadministrable/PLAN.md`.

## Stack
- Next.js 16 (App Router, Server Actions), TypeScript estricto, Tailwind v4 (tokens en `src/styles/global.css`).
- PostgreSQL con Drizzle ORM. Sin `DATABASE_URL` usa **PGlite** (Postgres embebido en `.data/pglite`) → no hace falta instalar nada para probar.
- Better Auth (email + contraseña, sin registro público, roles dueno/editor/demo).
- Fotos: `sharp` → WebP; guardado en disco (`.data/media`) o Vercel Blob si hay `BLOB_READ_WRITE_TOKEN`.
- Embla (galería), dnd-kit (ordenar fotos), Zod (validación), Resend opcional (avisos por email).

## Cómo está organizado
- `client.config.ts` → perfiles (autos / propiedades) con nombre, contacto, textos. `PERFIL` en `.env.local` elige cuál.
- `src/rubros/` → **qué se publica**. De cada rubro salen el formulario del panel, la validación, los filtros y la ficha. Un rubro nuevo = un archivo nuevo + agregarlo en `src/rubros/index.ts`.
- `src/server/*.ts` → lógica (recibe `db` y `usuario`, verifica permisos). Sin Next adentro: se testea directo.
- `src/app/acciones/*.ts` → Server Actions finitas: leen la sesión y llaman a `src/server`.
- `src/lib/` → utilidades puras (precios, búsqueda, imágenes, storage, permisos).
- `scripts/` → migraciones, seed, ilustraciones de ejemplo, imagen OG.

## Comandos (PowerShell)
- `npm run db:seed` → migra + crea usuarios + carga ejemplos (muestra las contraseñas generadas UNA vez)
- `npm run db:reset` → borra el catálogo y lo vuelve a cargar (no borra usuarios)
- `npm run dev` → http://localhost:3000 (con PGlite: cerrá el dev antes de correr el seed)
- `npm test` → unitarios + integración (PGlite temporal, o `TEST_DATABASE_URL` para Postgres)
- `npm run test:e2e` → Playwright + axe (primera vez: `npx playwright install chromium`)
- `npx tsc --noEmit` → tipos · `npm audit --omit=dev`
- `npm run db:generate` → nueva migración después de tocar `src/db/schema.ts`

## Reglas de seguridad (no negociables)
- **Cada Server Action y cada página del panel verifica sesión y rol** (`exigir()` en `src/server`, `usuarioActual()` en páginas). `proxy.ts` solo redirige: no es una barrera.
- Todo dato de entrada pasa por Zod en el servidor. Nunca construir SQL concatenando strings: usar Drizzle o `sql\`\`` con parámetros.
- Fotos: solo por `procesarImagen()` (tipo por bytes, re-codificación, sin EXIF/GPS). Nunca guardar el nombre de archivo del usuario.
- Lo público nunca devuelve `direccion` ni datos internos (`src/server/lecturas.ts`).
- CSP con nonce (en `src/proxy.ts`): nada de `<script>` inline salvo JSON-LD escapado.
- Secretos solo en `.env.local` / Vercel. `NEXT_PUBLIC_` jamás para secretos.
- Antes de cada commit: `npm test`, `npm run test:e2e`, `npm audit`, subagente `security-auditor`.

## Reglas de diseño
- Paleta "Cantera" y tipografías Instrument Serif (títulos, precios) + Geist (texto, datos). Solo tokens, nada de hex sueltos nuevos.
- El ocre (`ocre`) es para el precio destacado y la acción principal. Números con `tabular`.
- Prohibido: degradés violeta, glassmorphism, la skill `aceternity-ui`, emojis como íconos, MAYÚSCULAS en etiquetas.
- Animación solo como respuesta a una acción (skill `animate`), respetando `prefers-reduced-motion`.
- Textos en castellano rioplatense, botones que dicen lo que hacen ("Guardar cambios", "Publicar").

## Subagentes
Están en `_instalar-agentes/` (moverlos a `.claude/agents/`, ver LEEME): ui-builder, assets-generator, data-architect, backend-builder, test-engineer, security-auditor.
