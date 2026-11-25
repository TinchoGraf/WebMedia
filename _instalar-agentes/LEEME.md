# Instalar los subagentes

Por seguridad, Claude no puede escribir dentro de carpetas `.claude` de tu compu. Movelos vos con un comando (PowerShell, parado en C:\dev\WebMedia):

```powershell
New-Item -ItemType Directory -Force .claude\agents | Out-Null
Move-Item _instalar-agentes\*.md .claude\agents\ -Exclude LEEME.md
Remove-Item -Recurse _instalar-agentes
```

Después, en Claude Code, `/agents` tiene que mostrar: ui-builder, assets-generator, data-architect, backend-builder, test-engineer y security-auditor.
