# work-agent/ — Handoff completo de Ancestral Seed

> **Si sos un agente/dev arrancando un chat nuevo: empezá por acá.** Esta carpeta tiene TODO lo necesario para continuar el proyecto sin contexto previo.

**Proyecto:** Ancestral Seed — prototipo PWA de certificación cultural (frontend completo, datos mock con MSW, **sin backend real todavía**).
**Repo:** `github.com/soyalantapia/ancestral-seed-app` (público, rama `main`).
**Local:** `~/dev/ancestral-seed` (+ symlink en `~/Desktop/Programacion/`). Dev en `http://localhost:5175`.
**En vivo:** demo GH Pages https://soyalantapia.github.io/ancestral-seed-app/ · prod https://ancestralseed.com
**Última actualización de estos docs:** sesión de QA + 16 mejoras UX + alineación de Camila a Nariño (commits `8c6e28f` → `b503c2d`).

---

## Mapa de esta carpeta

| Archivo | Para qué |
|---|---|
| [`00-ESTADO-ACTUAL.md`](./00-ESTADO-ACTUAL.md) | **Dónde estamos hoy**: qué se hizo en la última sesión, commits, estado de deploy, qué quedó verificado en vivo. |
| [`01-ARQUITECTURA.md`](./01-ARQUITECTURA.md) | **Cómo está hecho**: rutas completas, roles/auth, layouts, stores, hooks, modelo de datos, contrato de API, design system/tokens. |
| [`02-DEPLOY.md`](./02-DEPLOY.md) | **Cómo se publica**: runbook GH Pages + dominio (FTP), htaccess, env vars. Las credenciales FTP NO están en el repo (ver doc). |
| [`03-PENDIENTES.md`](./03-PENDIENTES.md) | **Qué falta**: backlog priorizado (backend, a11y tail, consistencia de datos, features). |
| [`04-GOTCHAS.md`](./04-GOTCHAS.md) | **Trampas del entorno**: iCloud/symlink, flakiness del preview, MSW/Service Worker, cuentas demo, decisiones tomadas. |

---

## TL;DR para retomar en 60 segundos

- **Es un frontend de demo, no hay backend.** Todo `/api/*` lo intercepta MSW (`src/services/mocks/`). El contrato que el backend tendría que implementar está en `src/services/api.ts` + tipos en `src/types/index.ts`.
- **3 roles** sobre un flujo de certificación: **postulante**, **tutor** (antes "auditor"), y público/comprador. La cuenta demo (`camila@ancestralseed.org`, login mock con cualquier clave) tiene doble rol postulante+tutor.
- **Se deploya a 2 lados**: GH Pages (`npm run deploy`) y ancestralseed.com (`npm run build:domain` + FTP). Ambos están en vivo y al día.
- **TypeScript strict + noUnusedLocals**: si borrás código, limpiá los imports o el build falla. Verificá siempre con `npm run build`.
- **La última sesión** cerró una auditoría QA + 16 cambios de UX pedidos por Alan (ver `00-ESTADO-ACTUAL.md`). Todo está commiteado y deployado.
- **Lo más grande que falta**: backend real, y un puñado de pulidos de a11y/consistencia (ver `03-PENDIENTES.md`).

## Comandos que vas a usar siempre

```bash
cd ~/dev/ancestral-seed
npm run dev                 # dev :5175 (NO editar desde ~/Desktop — iCloud rompe el build)
npm run build               # tsc -b && vite build  → verificá que pase antes de commitear
npm run deploy              # → GitHub Pages
npm run build:domain        # build para ancestralseed.com (después subir dist/ por FTP, ver 02-DEPLOY.md)
```
