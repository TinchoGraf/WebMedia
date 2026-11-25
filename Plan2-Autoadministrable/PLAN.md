# Nivel 2 · Autoadministrable — "Piedra Propiedades" / "Piedra Autos" (demo)

> Carpeta del proyecto: `C:\dev\WebMedia` · Plan general: `C:\dev\PLAN-GENERAL-WEBS-DEMO.md`

## 1. Objetivo

Una web con **buscador público + panel privado** donde el dueño del negocio sube, edita y da de baja publicaciones con fotos, sin depender de vos.

La clave comercial: **un solo código sirve para varios rubros.** La demo arranca como inmobiliaria y con un cambio de configuración pasa a agencia de autos. Agregar otro rubro (maquinaria agrícola, alquiler de quintas, motos) es sumar un archivo, no reescribir la app.

Toma lo aprendido en la web de la inmobiliaria de tu viejo, pero la demo es genérica y con datos inventados (no usa la marca ni datos reales de su inmobiliaria).

## 2. Funcionalidades

**Parte pública**
- Home con destacadas, buscador rápido (operación, tipo, barrio/zona, precio) y accesos por categoría.
- Listado con filtros en la URL (`?operacion=venta&ambientes=3`) → se pueden compartir por WhatsApp y Google los indexa.
- Ficha de publicación: galería con pase de imagen (deslizar, flechas, teclado, pantalla completa), datos clave, descripción, mapa con **ubicación aproximada**, publicaciones similares.
- Botón "Consultar por WhatsApp" con el código de la publicación en el mensaje + formulario de consulta que queda guardado en el panel.
- Favoritos guardados en el navegador (sin cuenta).
- Páginas: Nosotros, Contacto, Tasaciones (formulario), Privacidad.

**Panel admin (`/panel`)**
- Login con email y contraseña; roles **dueño** (todo) y **editor** (publicaciones y consultas).
- Publicaciones: crear, editar, duplicar, cambiar estado (borrador → publicada → reservada → vendida/alquilada), destacar.
- Fotos: subir varias a la vez arrastrando, reordenar arrastrando, elegir portada, texto alternativo, borrar.
- Consultas recibidas: bandeja con estado (nueva, respondida, cerrada) y botón para responder por WhatsApp.
- Usuarios (solo dueño) y registro de actividad (quién cambió qué).
- **Modo demo**: un usuario `demo` que el cliente puede probar en la reunión; la base se reinicia cada noche con los datos de ejemplo.

## 3. Tecnología

| Capa | Elección | Por qué |
|---|---|---|
| Framework | Next.js 16.2.x (App Router, TypeScript estricto) | Server Components para el listado (rápido y bueno para SEO) y Server Actions para el panel |
| Estilos | Tailwind v4 + tokens OKLCH + Radix UI estilizado a mano | Radix da accesibilidad (diálogos, menús, selects) sin imponer look |
| DB | Neon PostgreSQL (São Paulo) | Lo conocés de GameConnect; plan gratis alcanza para la demo |
| ORM | Drizzle + drizzle-kit | Tipos de punta a punta, SQL legible, migraciones versionadas |
| Auth | Better Auth | Sesiones en cookie httpOnly, rate limit incluido, roles, fácil de auditar |
| Imágenes | `sharp` en el servidor + Vercel Blob (alternativa: Cloudflare R2) | Re-codificar cada foto elimina metadatos (GPS) y normaliza tamaños |
| Galería | Embla Carousel | Liviano, accesible, soporta deslizar |
| Mapa | Leaflet + OpenStreetMap | Sin API key ni costos |
| Reordenar fotos | dnd-kit | Accesible por teclado |
| Validación | Zod (mismos esquemas en formulario y servidor) | |
| Email | Resend | Aviso al dueño cuando entra una consulta |
| Cron | Vercel Cron | Reinicio nocturno del modo demo |

## 4. Estructura de datos

### Idea central: "rubros" configurables
Las columnas comunes (título, precio, estado, fotos, ubicación) son columnas normales. Lo que cambia por rubro (ambientes y m² para casas; marca, año y km para autos) va en una columna **`atributos` JSONB**, validada por un esquema Zod que define cada rubro.

```ts
// src/rubros/inmueble.ts
export const inmueble = defineRubro({
  id: "inmueble",
  nombre: { singular: "Propiedad", plural: "Propiedades" },
  operaciones: ["venta", "alquiler", "alquiler_temporario"],
  tipos: ["casa", "departamento", "ph", "lote", "local", "campo", "galpon"],
  atributos: z.object({
    ambientes: z.number().int().min(1).max(20),
    dormitorios: z.number().int().min(0).max(15),
    banos: z.number().int().min(0).max(10),
    m2Cubiertos: z.number().positive().max(100000),
    m2Totales: z.number().positive().max(10000000),
    cochera: z.boolean(),
    aptoCredito: z.boolean(),
    antiguedad: z.number().int().min(0).max(200).optional(),
  }),
  filtros: ["operacion", "tipo", "zona", "precio", "ambientes", "dormitorios", "cochera", "aptoCredito"],
  datosFicha: ["ambientes", "dormitorios", "banos", "m2Cubiertos", "m2Totales"],
});

// src/rubros/vehiculo.ts
export const vehiculo = defineRubro({
  id: "vehiculo",
  nombre: { singular: "Vehículo", plural: "Vehículos" },
  operaciones: ["venta"],
  tipos: ["auto", "camioneta", "utilitario", "moto"],
  atributos: z.object({
    marca: z.string().max(40), modelo: z.string().max(60), version: z.string().max(80).optional(),
    anio: z.number().int().min(1950).max(2027),
    km: z.number().int().min(0).max(2000000),
    combustible: z.enum(["nafta", "diesel", "gnc", "hibrido", "electrico"]),
    transmision: z.enum(["manual", "automatica"]),
    color: z.string().max(30),
    aceptaPermuta: z.boolean(), financiacion: z.boolean(),
  }),
  filtros: ["tipo", "marca", "anio", "km", "precio", "combustible", "transmision"],
  datosFicha: ["anio", "km", "combustible", "transmision"],
});
```

El formulario del panel, los filtros públicos y la ficha **se generan a partir de esta definición**. `client.config.ts` dice qué rubros están activos.

### Tablas (Drizzle / PostgreSQL)

```
publicaciones
  id              uuid PK
  codigo          text UNIQUE            -- "PP-0042", visible al público
  rubro           text NOT NULL          -- "inmueble" | "vehiculo"
  slug            text UNIQUE
  titulo          text NOT NULL (≤120)
  descripcion     text (≤5000)
  operacion       text                   -- venta / alquiler / ...
  tipo            text NOT NULL
  precio          bigint                 -- en centavos; null = "consultar"
  moneda          text CHECK IN ('ARS','USD')
  expensas        bigint NULL
  estado          text CHECK IN ('borrador','publicada','reservada','cerrada')
  destacada       boolean DEFAULT false
  atributos       jsonb NOT NULL         -- validado por el Zod del rubro
  zona            text                   -- barrio o localidad (Centro, Pueblo Nuevo, Sierras Bayas, Loma Negra…)
  direccion       text NULL              -- solo visible en el panel
  lat, lng        numeric(9,6) NULL
  mostrar_ubicacion_exacta boolean DEFAULT false
  creado_por      FK usuarios
  creado_en, actualizado_en, publicado_en timestamptz
  INDEX (rubro, estado, precio)  ·  INDEX GIN (atributos)  ·  INDEX (zona)

publicacion_fotos
  id, publicacion_id FK ON DELETE CASCADE
  url, ancho, alto, blur_data_url, alt (≤150), orden int, es_portada boolean
  UNIQUE (publicacion_id, orden)

consultas
  id, publicacion_id FK NULL, nombre, telefono, email NULL, mensaje (≤2000)
  tipo ('consulta','tasacion','contacto'), estado ('nueva','respondida','cerrada')
  creado_en, ip_hash                      -- hash, no la IP en claro

usuarios / sesiones / cuentas             -- los crea Better Auth
  + usuarios.rol ('dueno','editor','demo')

actividad
  id, usuario_id, accion, entidad, entidad_id, cambios jsonb, creado_en
```

Precios en **centavos enteros** (nunca `float`). La dirección exacta no sale al público salvo que el dueño lo active: en el mapa se muestra un círculo en la zona.

## 5. Archivos del proyecto

```
WebMedia/
├─ .claude/agents/ (ui-builder, assets-generator, data-architect, backend-builder, test-engineer, security-auditor)
├─ CLAUDE.md · client.config.ts · drizzle.config.ts · next.config.ts · vercel.json
├─ public/ (fonts/, placeholders/)
├─ scripts/ (seed.ts, reset-demo.ts, optimizar-fotos.ts)
├─ drizzle/ (migraciones SQL generadas)
├─ src/
│  ├─ proxy.ts                         ← nonce de CSP + redirige /panel si no hay sesión (primera barrera, no la única)
│  ├─ styles/tokens.css
│  ├─ rubros/ (index.ts, inmueble.ts, vehiculo.ts, define-rubro.ts)
│  ├─ db/ (schema.ts, index.ts)
│  ├─ server/
│  │  ├─ auth.ts                       ← Better Auth
│  │  ├─ permisos.ts                   ← requireRol('editor') usado en CADA acción
│  │  ├─ publicaciones.actions.ts
│  │  ├─ fotos.actions.ts              ← validar → sharp → Blob
│  │  ├─ consultas.actions.ts
│  │  ├─ busqueda.ts                   ← arma la consulta SQL desde los filtros (Drizzle, sin SQL a mano)
│  │  └─ rate-limit.ts
│  ├─ app/
│  │  ├─ (publico)/ page.tsx, [rubro]/page.tsx, [rubro]/[slug]/page.tsx, contacto, tasaciones, privacidad
│  │  ├─ panel/ login, page.tsx (resumen), publicaciones/, publicaciones/[id]/, consultas/, usuarios/, actividad/
│  │  ├─ api/cron/reset-demo/route.ts   ← protegido con CRON_SECRET
│  │  ├─ sitemap.ts · robots.ts · opengraph-image.tsx
│  └─ components/ (publico/, panel/, galeria/, filtros/, ui/)
├─ tests/ (unit/, e2e/)
└─ README-NUEVO-CLIENTE.md
```

## 6. Seguridad (específico de este nivel)

**Autenticación**
- Contraseñas hasheadas por Better Auth (scrypt); mínimo 12 caracteres y chequeo contra contraseñas filtradas.
- Cookies `httpOnly`, `Secure`, `SameSite=Lax`; sesión de 7 días con renovación.
- Rate limit en login (5 intentos / 15 min por IP + email) y en formularios públicos.
- No hay registro público: los usuarios los crea el dueño desde el panel.

**Autorización (lo más importante)**
- `proxy.ts` solo redirige; **cada Server Action verifica sesión y rol por su cuenta** (`requireRol`). Una Server Action es un endpoint público aunque no tenga URL visible.
- El rol `demo` puede crear y editar pero no borrar usuarios ni subir más de 20 fotos por día.
- Tests que llaman a cada acción sin sesión y con rol insuficiente, y esperan error.

**Subida de imágenes**
- Solo JPEG, PNG, WebP, AVIF; el tipo se verifica por **bytes mágicos** (`file-type`), no por la extensión. SVG prohibido (puede llevar scripts).
- Máximo 10 MB por foto y 30 fotos por publicación; el navegador achica antes de subir.
- Se re-codifica todo con `sharp` a WebP 1600px + miniatura: elimina EXIF (incluido **GPS**, clave en fotos de casas) y cualquier contenido escondido.
- Nombres de archivo aleatorios (UUID); nunca se usa el nombre que mandó el usuario.

**Datos y entradas**
- Todas las entradas pasan por Zod en el servidor; Drizzle usa consultas parametrizadas (sin concatenar SQL).
- Los filtros de la URL se validan contra la lista blanca del rubro antes de llegar a la DB.
- Descripciones en texto plano con saltos de línea (sin HTML) → sin XSS.
- Formularios públicos con campo trampa (honeypot) + rate limit; opcional Cloudflare Turnstile.
- Usuario de DB de la app sin permisos de `DROP` ni `ALTER`; las migraciones corren con otro usuario.
- IP de quien consulta guardada como hash, no en claro.

**Operación**
- `CRON_SECRET` para el endpoint de reinicio.
- Backups: Neon tiene restauración a un punto en el tiempo; documentar cómo restaurar.
- Registro de actividad para saber quién borró qué.

## 7. Dirección visual (para confirmar)

**Paleta A · Cantera** (recomendada: Olavarría, piedra, cemento; seria pero cálida, deja que las fotos sean protagonistas)
```css
--color-fondo:      oklch(0.965 0.006 70);  /* piedra clara */
--color-superficie: oklch(0.99 0.003 70);
--color-tinta:      oklch(0.23 0.01 60);    /* carbón */
--color-secundario: oklch(0.55 0.015 60);   /* gris cemento */
--color-acento:     oklch(0.60 0.12 50);    /* ocre/óxido: precios, CTA, "nuevo" */
--color-borde:      oklch(0.87 0.008 70);
```
**Paleta B · Pizarra y latón**: tinta `oklch(0.28 0.04 250)`, acento `oklch(0.70 0.09 85)`, fondo `oklch(0.975 0.004 250)`.

**Tipografía**: *Instrument Serif* para títulos y precios (aire de revista de arquitectura) + *Geist* para datos y texto. Números tabulares en precios y medidas.

**Detalle de marca**: textura sutil de piedra/hormigón en el hero y en las fichas vacías; tarjetas con esquinas rectas y una línea fina de acento.

**Galería**: foto grande + tira de miniaturas, contador "3/12", pantalla completa con fondo carbón, transición de vista (View Transitions) de la tarjeta del listado a la ficha.

**El panel** se diseña también (no un admin gris): misma paleta en versión densa, tablas con estados en color, vista previa de la ficha mientras editás.

**Fotos de ejemplo**: Unsplash (casas y departamentos estilo pampeano: ladrillo, galerías, patios; autos de uso real, no superdeportivos), 6–10 fotos por publicación para probar bien la galería.

## 8. Datos de ejemplo (seed)

- 14 propiedades: casas en Centro y Pueblo Nuevo, departamentos de 1–3 ambientes, un PH, lotes en Sierras Bayas, un campo cerca de Loma Negra, un local en Av. Colón. Precios en USD para venta y ARS para alquiler.
- 10 vehículos: utilitarios, camionetas (Hilux, Amarok, Ranger), autos chicos (Gol, Onix, 208), una moto. Años 2012–2024.
- 6 consultas de ejemplo en distintos estados.
- Usuarios: `dueno@demo`, `editor@demo`, `demo@demo` (contraseñas solo en `.env.local`).

## 9. Tests

| Tipo | Qué prueba |
|---|---|
| Unitario (Vitest) | Esquemas de cada rubro aceptan lo válido y rechazan lo inválido; `busqueda.ts` arma bien los filtros y descarta los que no están en la lista blanca; formato de precios ARS/USD |
| Integración | Server Actions contra una rama de Neon de test: sin sesión → 401; editor intentando borrar usuario → 403; demo superando límite de fotos → error |
| Subida | Rechaza `.exe` renombrado a `.jpg`, SVG, archivo de 15 MB; la foto procesada no tiene EXIF |
| E2E (Playwright) | Login → crear publicación → subir 6 fotos → reordenar → elegir portada → publicar → aparece en el listado y en el filtro correcto → la galería pasa con flechas, deslizar y teclado |
| E2E | Consulta desde la ficha llega a la bandeja del panel |
| Accesibilidad | axe en home, listado, ficha, login y formulario del panel |
| Rendimiento | Lighthouse ≥ 90 en listado y ficha en celular |

## 10. Sesiones (45 min c/u)

1. Proyecto Next 16 + Tailwind v4 + tokens + `CLAUDE.md` + subagentes + cabeceras + deploy vacío.
2. Esquema Drizzle, migraciones, conexión a Neon, sistema de rubros (`defineRubro`) con tests.
3. Seed con datos y fotos de ejemplo optimizadas.
4. Home y listado público con filtros en la URL.
5. Ficha con galería (Embla), mapa aproximado, similares.
6. Better Auth: login, roles, `requireRol`, rate limit + tests de autorización.
7. Panel: tabla de publicaciones, crear/editar con formulario generado por rubro.
8. Subida de fotos: validación, `sharp`, Blob, reordenar, portada + tests de subida.
9. Consultas: formulario público, bandeja, email con Resend, WhatsApp.
10. Usuarios, actividad, modo demo y cron de reinicio.
11. Cambiar a "Piedra Autos" por config y verificar que todo funcione; SEO (sitemap, JSON-LD `RealEstateListing` / `Car`).
12. Pulido visual, accesibilidad, Lighthouse, `security-auditor` completo, deploy final, `README-NUEVO-CLIENTE.md`.

---

## Estado (25/10/2026): MVP construido

La demo principal es una **agencia de autos usados** ("Piedra Autos"), para comparar con la web inmobiliaria real. Cambiando `PERFIL=propiedades` se convierte en "Piedra Propiedades", con el mismo código.

**Hecho**: home con buscador, listado con filtros en la URL, ficha con galería (deslizar, flechas, teclado, miniaturas, pantalla completa), consultas con límite anti abuso y campo trampa, panel con login y roles (dueño, vendedor, demo), alta y edición de publicaciones con formulario generado por rubro, subida de fotos con arrastre y reordenamiento (también con teclado), portada, estados, duplicar, consultas, usuarios, registro de actividad, modo demo con reinicio nocturno, sitemap, JSON-LD y CSP con nonce.

**Verificación**: 79 tests unitarios y de integración (corren igual en Postgres y en PGlite), 42 E2E con Playwright (escritorio y móvil, incluido axe en todas las páginas), `tsc` sin errores, `npm audit` sin vulnerabilidades, Semgrep sin hallazgos reales. Lighthouse móvil: 95–97 de rendimiento, 100 de accesibilidad, buenas prácticas y SEO.

**Cambios respecto del plan:**
- Sin `DATABASE_URL` usa PGlite (Postgres embebido): se prueba sin instalar nada. Neon queda para producción.
- Mapa: Google Maps que carga con clic, mostrando la zona y no la dirección (en vez de Leaflet).
- Fotos de ejemplo ilustradas por código (desde el entorno de Claude no se pueden bajar fotos).
- El rol demo no puede borrar fotos de ejemplo: así el reinicio nocturno no necesita regenerarlas.
- Subagentes en `_instalar-agentes/` (Claude no puede escribir en `.claude`).
