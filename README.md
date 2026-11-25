# Piedra Autos / Piedra Propiedades · demo Nivel 2

Catálogo con panel autoadministrable: el dueño carga publicaciones con fotos desde el celular o la compu, y el sitio las muestra con buscador, filtros y galería. Un mismo código sirve para **agencias de autos** e **inmobiliarias** (y cualquier rubro que se agregue en `src/rubros/`).

Datos 100 % ficticios. Las fotos de ejemplo son ilustraciones generadas por código (`scripts/imagenes/`).

## Probarlo en tu compu (PowerShell, sin instalar base de datos)

```powershell
cd C:\dev\WebMedia
npm install
Copy-Item .env.example .env.local      # completá BETTER_AUTH_SECRET (abajo cómo generarlo)
npm run db:seed                        # crea la base local, usuarios y 13 autos con fotos
npm run dev                            # http://localhost:3000  ·  panel: http://localhost:3000/panel
```

Generar el secreto: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

El seed muestra en la terminal las contraseñas de `dueno@demo.local`, `editor@demo.local` y `demo@demo.local` (o usa las que pongas en `SEED_*_PASSWORD`). Guardalas: no se vuelven a mostrar.

**Ver la versión inmobiliaria:** poné `PERFIL=propiedades` en `.env.local`, corré `npm run db:seed` de nuevo y reiniciá `npm run dev`.

> Con la base local (PGlite) cerrá `npm run dev` antes de correr `db:seed` o `db:reset`: es una base de un solo proceso.

## Tests

```powershell
npx playwright install chromium   # solo la primera vez
npm test                          # 79 tests: unitarios + integración (base temporal)
npm run test:e2e                  # 42 tests en navegador: sitio, panel, móvil y accesibilidad
```

## Qué hay dónde

| Ruta | Para qué |
|---|---|
| `client.config.ts` | Nombre, contacto, textos y perfil (autos / propiedades) |
| `src/rubros/` | Qué se publica: campos, filtros, validación, títulos. **Acá se agrega un rubro nuevo** |
| `src/db/schema.ts` · `drizzle/` | Tablas y migraciones |
| `src/server/` | Lógica con permisos (publicaciones, fotos, consultas, usuarios, demo) |
| `src/app/(publico)` · `src/app/panel` | Páginas del sitio y del panel |
| `src/proxy.ts` | CSP con nonce y redirección al login |
| `scripts/` | Migrar, seed, ilustraciones, imagen para compartir |

Para publicarla o adaptarla a un cliente: `README-NUEVO-CLIENTE.md`.
