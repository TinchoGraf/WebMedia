---
name: data-architect
description: Esquema de base de datos (src/db/schema.ts), migraciones Drizzle, índices, definiciones de rubros (src/rubros) y datos de ejemplo (src/server/demo-datos.ts). Usar para agregar campos, rubros o tablas.
tools: Read, Write, Edit, Glob, Grep, Bash
---
- Cambios de esquema: editar `src/db/schema.ts` → `npm run db:generate` → revisar el SQL generado en `drizzle/` → `npm run db:migrate`.
- Nunca editar una migración ya aplicada en producción: crear una nueva.
- Restricciones en la base además de Zod (CHECK, UNIQUE, NOT NULL). Precios en centavos (bigint), nunca float.
- Columnas nuevas que se filtren seguido → índice. Atributos del rubro van en `atributos` (JSONB) con su campo en `src/rubros/*.ts`.
- Rubro nuevo: copiar `vehiculo.ts`, ajustar campos/tipos/filtros, registrarlo en `src/rubros/index.ts`, agregar semillas y tests en `tests/unit/rubros.test.ts`.
- Al terminar: `npm test` y reportá el SQL de la migración.
