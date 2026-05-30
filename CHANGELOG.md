# CHANGELOG

Formato: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) +
[Semantic Versioning](https://semver.org/lang/es/).

Fix #GAP-12 (análisis proyecto): antes no había historial estructurado
de qué cambió entre deploys. Para el reviewer de auditoría externa o
para reconstruir un incidente, era prácticamente imposible.

## [Unreleased]

### Added — Infraestructura
- CI/CD con GitHub Actions (`.github/workflows/ci.yml`)
- Dependabot semanal con CVE alerts (`.github/dependabot.yml`)
- Pre-commit hooks con lefthook (`lefthook.yml`)
- Schema zod de env vars (`src/lib/env.ts`)
- Wrappers de observability + analytics + logger (stubs activables)
- ADR registry (`docs/adr/`)

### Added — Features de negocio
- Flujo de renovación de licencia (`/mis-certificaciones/:id/renovar`)
- Flujo de apelación con countdown 5 días (`/mis-certificaciones/:id/apelar`)
- Plan de mejora visible al postulante
- Banner "Modo demo" en BlockchainModal
- Rol Comprador B2B con wallet de hashes (`/comprador/wallet`)
- Página pública de denuncias (`/denuncias`)
- Stub de roles operativos coordinador + admin
- Dashboard público de transparencia (sección Impacto en Home)
- Banner de cookies + página de privacidad operativa
- Gestión de equipo de tutores (`/coordinador/equipo`)

### Changed
- Signup flow muestra state machine completa (confirmación email mock pero visible)
- CommandPalette ahora busca contenido de certificaciones + autores
- Settings tiene tab "Notificaciones" con preferencias canal × evento
- HelpBubble linkea a "Centro de ayuda" (copy fix vs "Chat con soporte")

## Releases anteriores

Ver `git log --oneline` — el ciclo de auditorías UX (v1+v2+v3+v4) está
cubierto por 12 commits con prefijo `V[1-4]-T[1-12]`.
