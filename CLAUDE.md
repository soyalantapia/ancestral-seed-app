# Ancestral Seed — Frontend Prototype

> Prototipo navegable para demo a stakeholders + handoff limpio al equipo de backend.
> El frontend queda terminado y los ingenieros solo reemplazan la capa de servicios.

## Stack obligatorio

- React + TypeScript + Vite
- Tailwind CSS v4 + shadcn/ui (extender, no reinventar)
- React Router v6 (navegación real, una pantalla = una ruta)
- Zustand (estado global: sesión, carrito, UI persistente)
- MSW (Mock Service Worker, delays 300–800ms, toggle por `VITE_USE_MSW`)
- Framer Motion (transiciones de página, microinteracciones)
- Lucide React (íconos)
- sonner (toasts)
- react-hook-form + zod (formularios con validación inline)

## Reglas no negociables

1. **Nada hardcodeado en componentes.** Toda data viene de `services/api.ts`. Mocks en `services/mocks/`.
2. **Toda llamada de datos pasa por `services/api.ts`.** Componentes consumen hooks o el módulo `api`. Nunca `fetch` directo, nunca importar de `mocks/` desde un componente.
3. **Tipos primero.** Antes de un componente que consuma datos, el tipo va en `src/types/`. Esos tipos son el contrato de API para backend.
4. **shadcn/ui antes que custom.** Si la lib ya tiene Button/Dialog/Input, se extiende.
5. **Prohibido `position: absolute`** salvo overlays/tooltips. Auto Layout de Figma → flex/grid.
6. **Mobile-first y responsive 375px → 1440px.**
7. **Estados completos en cada vista**: loading (skeleton), error (con retry), empty (con icono), success.
8. **Skeletons, no spinners genéricos.**
9. **Toasts con sonner** para feedback de acciones.
10. **Animaciones suaves con framer-motion** entre rutas y en estados.
11. **Hover y focus visibles** en todo lo interactivo.
12. **Validación inline** con react-hook-form + zod.
13. **Estado persistente durante la sesión** vía Zustand (auth con `persist`).
14. **Modo demo / reset**: `useUiStore().resetDemoState()` limpia localStorage y vuelve a `/`.

## Estructura

```
src/
├── components/
│   ├── ui/              # shadcn/ui primitives
│   └── features/        # componentes de negocio
├── pages/               # 1 pantalla = 1 archivo
├── services/
│   ├── api.ts           # contrato público
│   └── mocks/
│       ├── data.ts      # data mock
│       ├── handlers.ts  # MSW handlers
│       └── browser.ts   # MSW worker setup
├── store/               # zustand stores (auth.ts, ui.ts, ...)
├── hooks/               # use*.ts
├── types/               # tipos compartidos por dominio
├── lib/                 # utils (cn, formatDate, sleep)
├── routes.tsx           # rutas
└── main.tsx             # bootstrap (MSW + Router + Toaster)
```

## Cómo apagar MSW (para conectar al backend real)

`.env`:
```
VITE_USE_MSW=false
```

Cuando MSW está apagado, `fetch('/api/...')` golpea el backend real. El equipo de backend solo necesita cumplir el contrato definido en `services/api.ts` y los tipos de `src/types/`.

## Workflow de cada pantalla nueva

1. Tipo en `src/types/`
2. Mock data en `src/services/mocks/data.ts`
3. Handler MSW en `src/services/mocks/handlers.ts`
4. Función en `src/services/api.ts`
5. Page en `src/pages/`
6. Ruta en `src/routes.tsx`
7. Componentes de negocio en `src/components/features/`
8. Estados loading / error / empty / success
9. Verificar mobile (375) y desktop (1440)

## Tono al hablar con Claude

Español rioplatense, directo. Sin "claro, entiendo, procederé a..." Si hay tradeoffs técnicos, una línea y propuesta. Si el Figma es ambiguo, preguntar antes de inventar.
