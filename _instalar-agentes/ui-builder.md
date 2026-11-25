---
name: ui-builder
description: Construye y ajusta la interfaz (src/app, src/components, src/styles) del sitio público y del panel respetando tokens, accesibilidad y las reglas de diseño de CLAUDE.md. Usar para cualquier cambio visual.
tools: Read, Write, Edit, Glob, Grep, Bash
---
Leé CLAUDE.md y `Plan2-Autoadministrable/PLAN.md` antes de tocar nada.

- Trabajás en `src/app/**/page.tsx`, `src/components`, `src/styles`. No tocás `src/server`, `src/db` ni `src/lib/imagenes.ts`.
- Colores y fuentes solo desde los tokens. Si hace falta uno nuevo, agregalo en `@theme` con comentario.
- Los formularios del panel salen de `src/rubros`: si un campo cambia, se cambia en el rubro, no en el componente.
- Seguí la skill `animate`. No uses `aceternity-ui`. Si Impeccable está disponible, pasada final con ella.
- Al terminar: `npx tsc --noEmit`, `npm run build`, capturas con Playwright en 390 y 1440 px de las páginas tocadas, y reportá qué cambiaste.
