# Ancestral Seed — Frontend Prototype

Prototipo navegable del producto **Ancestral Seed**, una plataforma para certificar digitalmente saberes y productos ancestrales. Construido fiel al diseño de Figma del equipo Xnod.

---

## Quickstart

```bash
npm install
npm run dev
```

App en [http://localhost:5175](http://localhost:5175). MSW intercepta automáticamente las llamadas a `/api/*`.

---

## Stack

| Capa | Lib |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Estilos | Tailwind CSS v4 |
| UI primitives | shadcn/ui (extendidos) |
| Routing | React Router v6 |
| Estado | Zustand (con persist) |
| Mocks | MSW (Mock Service Worker) |
| Animaciones | Framer Motion |
| Iconos | Lucide React |
| Toasts | sonner |
| Formularios | react-hook-form + zod |

---

## Estructura

```
src/
├── components/
│   ├── ui/              # primitives (Button, Card, Input, Badge, Skeleton, Label)
│   └── features/        # negocio (Header, Footer, Layout, Logo, Pattern, CertificationCard)
├── pages/               # 1 pantalla = 1 archivo
│   ├── Home.tsx
│   ├── Directory.tsx
│   ├── CertificationDetail.tsx
│   ├── AuthorProfile.tsx
│   ├── Verify.tsx
│   ├── Login.tsx
│   └── NotFound.tsx
├── services/
│   ├── api.ts           # contrato público de la API ⚠️ esto es lo que el equipo de backend tiene que implementar
│   └── mocks/
│       ├── data.ts      # mock data realista
│       ├── handlers.ts  # MSW handlers (con delays 300–800ms)
│       └── browser.ts   # bootstrap del worker
├── store/               # zustand (auth, ui)
├── hooks/               # useCertifications, useAuthor, useCategories, etc.
├── types/               # contrato de tipos compartido
├── lib/utils.ts         # cn(), formatDate(), sleep()
├── routes.tsx           # rutas (todas usan <Layout/>)
└── main.tsx             # bootstrap MSW + Router + Toaster
```

---

## Rutas implementadas

| Ruta | Pantalla |
|---|---|
| `/` | Home / Landing |
| `/directorio` | Directorio con búsqueda + filtros (categoría, estado, sort) |
| `/certificado/:slug` | Ficha pública del certificado |
| `/autor/:slug` o `/perfil/:slug` | Perfil de autor (3 tabs: Certificaciones / Información / Destacados) |
| `/verificar` | Verificar certificado por hash o código |
| `/login` | Iniciar sesión |
| `*` | 404 |

---

## Flujo demo end-to-end

1. **Home** → click en "Ver certificaciones"
2. **Directorio** → filtrá por categoría, ordená, click en cualquier card
3. **Ficha pública** → ver detalle, copiar hash (toast), ir al autor
4. **Perfil de autor** → cambiar tab, ver Certificaciones / Info / Destacados
5. **Verificar** → escribir un hash (probá `0xA3F9C2D81E47B5106F3C2A99D8E1F4B7C0D5A2E69B8F1C4D3E2A1B0F9C8E7D6` → válido) o slug (`quinoa-real-tilcara-2025`)
6. **Login** → cualquier email + password ≥6 → entrás como María Paz

---

## Cómo conectar al backend real

Por defecto MSW está activo. Para apagarlo:

```bash
# .env
VITE_USE_MSW=false
```

Cuando MSW está apagado, todas las llamadas `fetch('/api/...')` van al backend real. El equipo de backend solo necesita implementar los endpoints definidos en [`src/services/api.ts`](./src/services/api.ts), respetando los tipos de [`src/types/index.ts`](./src/types/index.ts).

### Contrato de API

El módulo `api` en `services/api.ts` expone:

```ts
api.getCertifications(filters?)        // GET /api/certifications?q=&category=&status=&sortBy=
api.getCertificationBySlug(slug)       // GET /api/certifications/:slug
api.getFeaturedCertifications()        // GET /api/certifications/featured
api.verifyCertificate(hashOrCode)      // POST /api/certifications/verify { hashOrCode }
api.getAuthors()                       // GET /api/authors
api.getAuthorBySlug(slug)              // GET /api/authors/:slug
api.getAuthorCertifications(slug)      // GET /api/authors/:slug/certifications
api.getCategories()                    // GET /api/categories
api.login({ email, password })         // POST /api/auth/login
api.logout()                           // POST /api/auth/logout
api.reportIncident({...})              // POST /api/incidents
```

Las shapes de respuesta están en `src/types/index.ts` (Author, Certification, DirectoryFilters, PaginatedResult, User).

### Tip para producción

En `vite.config.ts` agregar un proxy para que `/api` golpee el backend en dev:

```ts
server: {
  proxy: {
    '/api': 'http://localhost:3000', // o donde corra el backend
  },
}
```

---

## Design tokens

Los tokens están definidos en `src/index.css` (Tailwind v4 inline theme). Extraídos del Design System del Figma:

- **Primary**: `gold-500 #C7A800`, `navy-500 #001C38`
- **Escalas**: `gold-100…900`, `navy-100…800`, `neutral-0…700`
- **Status**: `success`, `warning`, `error`, `info` (4 niveles cada una)
- **Radius**: `--radius: 0.75rem` (botones full-rounded, cards 24px)
- **Tipografía**: Montserrat 300–800 (cargada desde Google Fonts)
- **Patterns**: `.bg-pattern-gold`, `.bg-pattern-navy`, `.bg-pattern-aztec` (geometric inspired)

---

## Polish incluido

- ✅ Skeleton loaders en cada vista (no spinners genéricos)
- ✅ Toasts con sonner (success / error)
- ✅ Empty states con icono y CTA
- ✅ Validación inline con react-hook-form + zod
- ✅ Hover y focus states en todo lo interactivo
- ✅ Animaciones con framer-motion (whileHover en cards, whileInView en secciones)
- ✅ Mobile-first y responsive (375 → 1440)
- ✅ Estado persistente vía Zustand `persist` middleware
- ✅ Modo demo / reset: `useUiStore.getState().resetDemoState()` desde la consola limpia localStorage y vuelve a `/`

---

## Scripts

- `npm run dev` — dev server (puerto 5175 por config)
- `npm run build` — build de producción
- `npm run preview` — preview del build
- `npm run lint` — ESLint

---

## Reglas de contribución

Ver [`CLAUDE.md`](./CLAUDE.md) para las reglas no negociables del proyecto (capa de servicios, tipos primero, estados completos, mobile-first, etc.).
