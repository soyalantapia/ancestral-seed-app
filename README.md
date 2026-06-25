# Ancestral Seed — Frontend Prototype

Prototipo navegable (PWA) del producto **Ancestral Seed**: una plataforma para **certificar digitalmente** saberes, productos y servicios ancestrales de Latinoamérica, con verificación pública por QR/hash ("blockchain") y un proceso de **auditoría cultural** guiado por un **tutor**.

Construido fiel al Design System de Figma (equipo **Xnod**). **Es un frontend completo con datos mockeados (MSW); todavía no hay backend real.**

> **📂 ¿Venís a continuar el proyecto / arrancás un chat nuevo?** Leé primero **[`work-agent/`](./work-agent/)** — ahí está el estado actual, la arquitectura, el runbook de deploy, lo pendiente y los gotchas del entorno. El handoff completo está en [`work-agent/README.md`](./work-agent/README.md).

---

## Quickstart

```bash
npm install
npm run dev        # http://localhost:5175  (MSW intercepta /api/* automáticamente)
```

- **Node 22** recomendado.
- El proyecto vive en `~/dev/ancestral-seed` con un **symlink** en `~/Desktop/Programacion/` (Desktop = iCloud, que rompe esbuild/rollup — **editá siempre en `~/dev`**).

### Cuenta demo

El login es **mock**: cualquier email + cualquier contraseña entra. La sesión es siempre **Camila Montes** (`camila@ancestralseed.org`), que tiene **doble rol** `['postulante', 'tutor']`, así que con una sola cuenta ves los dos paneles.

- Para entrar como **tutor**: logueate y andá a `/tutor/dashboard` (o cambiá de panel desde el menú de usuario).
- Para volver: link "Volver al panel de solicitante".

---

## Qué es (producto en 30 segundos)

Tres actores sobre un mismo flujo de certificación:

1. **Postulante** (artesano/autor): completa un formulario de 7 pasos, sube evidencias, paga el arancel, coordina la **auditoría cultural** y recibe su **certificado** verificable.
2. **Tutor** (revisor cultural — antes "auditor"): evalúa casos en un kanban, completa el **diagnóstico**, coordina reuniones, firma y emite certificados.
3. **Público / Comprador**: explora el **directorio**, ve la **ficha pública** de cada certificado, y **verifica** autenticidad por hash o código.

Las marcas/categorías oficiales del Reglamento: **Auténtico**, **Tradicional**, **Inspiración cultural** (+ tipo `producto` / `servicio`).

---

## Stack

| Capa | Lib |
|---|---|
| Framework | React 19 + TypeScript (strict) |
| Build | Vite 8 |
| Estilos | Tailwind CSS v4 (theme inline en `src/index.css`) |
| UI primitives | shadcn/ui (extendidos) |
| Routing | React Router v7 |
| Estado | Zustand (con `persist`) — ~15 stores |
| Mocks | MSW (Mock Service Worker) |
| PWA | vite-plugin-pwa (Workbox, con fix de convivencia con MSW) |
| Animaciones | Framer Motion |
| Mapa | react-simple-maps + world-atlas (topojson) |
| PDF | jsPDF |
| Formularios | react-hook-form + zod |
| Iconos | Lucide React · Toasts: sonner |
| Tests | Vitest + Testing Library (jsdom) |

---

## Estructura (resumen)

```
src/
├── components/
│   ├── ui/            # primitivas (button, card, input, badge, modal, sheet, combobox, accordion…)
│   └── features/      # negocio + layouts (Header, Footer, *Layout, CommandPalette, GuidedTour,
│                      #   CertificationCard, StagePipeline, LatamWorldMap, CategoryBadge…)
├── pages/             # 1 pantalla = 1 archivo
│   ├── tutor/         # panel tutor (dashboard, casos/kanban, agenda, tareas, certificaciones)
│   ├── comprador/     # BuyerWallet (B2B)
│   └── coordinador/   # CoordinadorEquipo
├── store/             # Zustand (auth, ui, onboarding, certifyForm, tutorCases, notifications…)
├── hooks/             # useFocusTrap, useEscape, useThemeEffect, useCertifications…
├── services/
│   ├── api.ts         # ⚠️ CONTRATO de API — lo que el backend tiene que implementar
│   └── mocks/         # data.ts (datos), handlers.ts (MSW), browser.ts (worker)
├── lib/               # utils, alerts, copy, tours, pdf, caseValidation, env…
├── data/latam.ts      # países/regiones LATAM (forms + mapa)
├── types/index.ts     # contrato de tipos compartido
├── index.css          # design tokens (@theme) + patterns
└── routes.tsx         # rutas (guards: RequireAuth / RequireTutor)
```

Detalle completo (todas las rutas, stores, tipos, tokens) en **[`work-agent/01-ARQUITECTURA.md`](./work-agent/01-ARQUITECTURA.md)**.

---

## Rutas (mapa rápido)

**Público:** `/` `· /directorio · /certificado/:slug · /autor/:slug (o /perfil/:slug) · /verificar · /nosotros · /login · /registro · /recuperar · /certificar · /denuncias · /legal/:section`

**Postulante** (`RequireAuth` + `DashboardLayout`): `/mis-certificaciones · /mis-certificaciones/:id (+ /renovar /apelar /plan-mejora) · /mi-perfil · /notificaciones · /calendario · /pagos · /ayuda · /mis-datos`

**Tutor** (`RequireTutor` + `TutorLayout`): `/tutor/dashboard · /tutor/casos (+ /:id) · /tutor/agenda · /tutor/tareas · /tutor/certificaciones (+ /:id)`

**Roles especiales:** `/comprador/wallet · /coordinador/equipo`

> ⚠️ `/legal` sin sección da 404 — usar `/legal/terminos | /legal/privacidad | /legal/cookies`.

### IDs útiles para demos
- Solicitud de demo: **`req-001`** ("Filigrana ancestral", en prediagnóstico).
- Autores: `camila-montes`, `maria-belen-baulo`, `flor-imbacuan-pantoja`, `ecodestinos`.
- Certificados (slug): `tecnica-ancestral-filigrana`, `tejido-textil-tradicional`, `libro-sabores-cosmicos`, `ecodestinos-turismo-ancestral`.
- Hash de verificación válido: `0xA3F9C2D81E47B5106F3C2A99D8E1F4B7C0D5A2E69B8F1C4D3E2A1B0F9C8E7D6`.

---

## Deploy

Se publica en **dos** destinos. Runbook completo (con el detalle del FTP) en **[`work-agent/02-DEPLOY.md`](./work-agent/02-DEPLOY.md)**.

| Destino | Comando | Base | URL |
|---|---|---|---|
| **GitHub Pages** (demo) | `npm run deploy` | `/ancestral-seed-app/` | https://soyalantapia.github.io/ancestral-seed-app/ |
| **ancestralseed.com** (prod) | `npm run build:domain` + subir `dist/` por FTP | `/` | https://ancestralseed.com |

- GH Pages: `gh-pages -d dist` (rama `gh-pages`).
- Dominio: hosting Ferozo/Apache (convive con un WordPress); el SPA-fallback lo da [`deploy/htaccess-ancestralseed`](./deploy/htaccess-ancestralseed). El upload es por FTP con un script auxiliar (efímero, **sin credenciales en el repo** — ver runbook).

---

## Conectar al backend real

MSW está activo por default. Para apagarlo: `VITE_USE_MSW=false` (o `npm run build:no-msw`). Con MSW apagado, todo `fetch('/api/...')` va al backend real. El backend solo necesita implementar los endpoints de **[`src/services/api.ts`](./src/services/api.ts)** respetando los tipos de **[`src/types/index.ts`](./src/types/index.ts)**. Contrato detallado en [`work-agent/01-ARQUITECTURA.md`](./work-agent/01-ARQUITECTURA.md).

---

## Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Dev server (puerto 5175) |
| `npm run build` | `tsc -b && vite build` (corre `prebuild`: og + sitemap + verify-assets) |
| `npm run build:domain` | Build con `base=/` + `VITE_SITE_URL=ancestralseed.com` |
| `npm run build:no-msw` | Build sin mocks (backend real) |
| `npm run deploy` | Publica a GitHub Pages |
| `npm run test` / `test:watch` | Vitest |
| `npm run lint` | ESLint |

---

## Reglas del proyecto

Ver **[`CLAUDE.md`](./CLAUDE.md)** — reglas no negociables (capa de servicios, tipos primero, estados completos loading/error/empty/success, skeletons no spinners, mobile-first 375→1440, español rioplatense directo). TypeScript es **strict + noUnusedLocals** → el build falla con imports/variables sin usar.
