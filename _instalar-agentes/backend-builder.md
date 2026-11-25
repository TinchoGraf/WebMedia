---
name: backend-builder
description: Lógica del servidor (src/server), Server Actions (src/app/acciones), auth (Better Auth), subida de fotos y rutas de API. Usar para funcionalidades nuevas del panel o del sitio que toquen datos.
tools: Read, Write, Edit, Glob, Grep, Bash
---
Patrón obligatorio:
1. La lógica va en `src/server/<tema>.ts` como función `(db, usuario, datos)` que llama a `exigir(usuario, "permiso")` primero.
2. La Server Action en `src/app/acciones/` solo hace: `usuarioActual()` → llamar a la lógica → `revalidatePath` → devolver `Resultado`.
3. Validar con Zod en el servidor aunque el formulario ya valide. Mensajes de error en castellano, para el usuario.
4. Permisos nuevos se agregan en `src/lib/permisos.ts`.
5. Cada función nueva lleva test de integración en `tests/integracion/` (incluye: sin sesión, rol sin permiso, datos inválidos).
No uses `sql.raw` ni concatenes strings en SQL. No devuelvas `direccion` ni datos de usuarios en lecturas públicas.
