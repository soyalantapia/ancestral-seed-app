# PROMPT — Auditoría y fix de responsive total · Ancestral Seed

> Pegá este prompt en una sesión de Claude Code (o ejecutalo vos mismo paso a paso).
> Objetivo: que **toda** la plataforma sea **perfectamente responsive de 320 px a 1920 px**,
> al detalle, sin overflow lateral, con targets táctiles correctos y texto legible —
> y que **al final haga una revisión manual de cada pantalla** para confirmar que funciona.

---

## 0. Rol y misión

Sos un **ingeniero front-end senior** haciendo una **pasada completa de responsive** (auditar → arreglar → verificar) sobre Ancestral Seed.

**Definición de "totalmente responsive" (la vara):**
- **Cero scroll horizontal** en cualquier ancho ≥ 320 px.
- **Nada cortado / tapado / inalcanzable** en ningún viewport.
- **Targets táctiles ≥ 44×44 px** y separados.
- **Texto legible** (cuerpos ≥ 14 px en mobile, jerarquía clara).
- **Desktop grande** centrado y contenido, no estirado.
- El diseño **mobile no rompe desktop** ni viceversa (todo con prefijos de breakpoint).

**Usuario real:** artesanos y comunidades de LATAM, **muchos en Android de gama baja**, pantallas chicas, a veces una sola mano, conexiones lentas. La experiencia tiene que ser **digna y sólida en el teléfono más humilde**.

---

## 1. Contexto técnico

- **Stack:** React 19 · Vite 8 · TS strict · **Tailwind v4** · Zustand (persist) · MSW · react-router-dom 7.
- **Dev:** `npm run dev` → `http://localhost:5175` (levantar desde `~/dev/ancestral-seed`, NO el symlink de Desktop/iCloud).
- **Breakpoints (Tailwind v4 default):** `sm 640` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1536`.
- **3 layouts:**
  - `Layout` → sitio público.
  - `DashboardLayout` → postulante (sidebar fijo que **colapsa a "Menú" hamburguesa < lg**).
  - `TutorLayout` → tutor/auditor (su propio sidebar/panel).
- **Design system:** tokens `navy` / `gold` / `cream` + primitivas en `components/ui/`. Respetarlo, no inventar estilos sueltos.

---

## 2. Matriz de viewports a testear (el "detalle")

| Ancho | Dispositivo objetivo | Por qué importa |
|------:|----------------------|-----------------|
| **320** | iPhone SE 1ª gen / Android viejo | **El piso.** Acá aparece TODO el overflow. Si pasa 320, pasa todo. |
| **360** | Android más común (Samsung A/M) | El mundo real de los usuarios. |
| **375** | iPhone moderno | Smoke test estándar. |
| **414 / 430** | Phablets (Pro Max) | Texto e imágenes grandes. |
| **768** | Tablet portrait | El **"valle incómodo"**: ni mobile ni desktop. |
| **1024** | Tablet landscape / laptop chica | Donde **aparece el sidebar** (lg). Transición crítica. |
| **1280** | Desktop | Layout completo. |
| **1440 / 1920** | Desktop grande | `max-width` y centrado: que NO se estire infinito. |

**Casos especiales además de los anchos:** teléfono en **landscape** (≈ 812×375), **zoom 200 %** (reflow/accesibilidad), **teclado abierto** (que no tape el input activo).

---

## 3. Inventario COMPLETO de pantallas (las 34 rutas)

Hay que recorrerlas **todas**. Agrupadas por layout:

### Público — `Layout`
1. `/` — Home (hero, mapa LATAM, grids, secciones largas)
2. `/directorio` — Directory (grid de cards + filtros)
3. `/nosotros` — Nosotros
4. `/certificado/:slug` — CertificationDetail (ej. una cert pública)
5. `/autor/:slug` y `/perfil/:slug` — AuthorProfile
6. `/verificar` — Verify (verificación por código/QR)
7. `/login` — Login (split layout `w-[1100px]`/`w-[1320px]`)
8. `/registro` — Signup
9. `/recuperar` — RecoverPassword
10. `/certificar` — **CertifyForm: wizard de 7 pasos** ⚠️ (el más sensible)
11. `/legal/:section` — Legal (texto largo)
12. `/denuncias` — Denuncias (form público)

### Postulante — `RequireAuth` + `DashboardLayout`
13. `/mis-certificaciones` — MyCertifications (lista única, ya rediseñada)
14. `/mis-certificaciones/:id` — CertificationRequest (detalle con tabs/seguimiento)
15. `/mi-perfil` — MyProfile (secciones + card de completar)
16. `/notificaciones` — Notifications (alertas + log)
17. `/calendario` — Calendario (agenda)
18. `/pagos` — Pagos (facturas + métodos de pago + modales)
19. `/ayuda` — Help
20. `/mis-datos` — MisDatos
21. `/mis-certificaciones/:id/renovar` — Renovar
22. `/mis-certificaciones/:id/apelar` — Apelar
23. `/mis-certificaciones/:id/plan-mejora` — PlanMejora
24. `/comprador/wallet` — BuyerWallet ⚠️ (tabla)
25. `/coordinador/equipo` — CoordinadorEquipo ⚠️ (tabla)

### Tutor — `RequireTutor` + `TutorLayout`
26. `/tutor/dashboard` — TutorDashboard (charts/kpis)
27. `/tutor/casos` — TutorCases ⚠️ (tabla + overflow-x)
28. `/tutor/casos/:id` — TutorCaseDetail
29. `/tutor/agenda` — TutorAgenda
30. `/tutor/tareas` — TutorTasks
31. `/tutor/certificaciones` — TutorCertifications ⚠️ (tabla)
32. `/tutor/certificaciones/:id` — TutorCertificationDetail

### Otros
33. `/legal/:section`, redirects (`/inicio`,`/documentos`,`/configuracion`,`/dashboard`) — verificar que redirigen OK.
34. `*` — NotFound

> **Overlays globales a testear en mobile sobre varias pantallas:** `CommandPalette`, `GuidedTour` (tour), `CheckoutModal`, `AddPaymentModal`, `ChangePasswordModal`, `ConfirmDialog`, `CookieBanner`, `InstallPrompt`, `HelpBubble`/FAB de ayuda.

---

## 4. Checklist de responsive por categoría (al detalle)

Para cada pantalla, revisar estas categorías. A la derecha, el patrón de fix Tailwind.

### A. Overflow horizontal (BUG #1) 🔴
- A 320 px **no puede haber scroll lateral**. Culpables típicos:
  - Hijo flex que no encoge → **`min-w-0`** en el hijo (y `min-w-0` en `<main>`).
  - Ancho fijo en px (`w-[460px]`, `w-[360px]`, `w-[140px]`…) → **`w-full max-w-[460px]`** o `max-w-full`.
  - `whitespace-nowrap` en texto largo → permitir wrap o `truncate` con `min-w-0`.
  - Imagen/mapa sin tope → **`max-w-full h-auto`**. (Ojo `LatamWorldMap` = `w-[460px]`.)
  - Grid con columnas fijas → `grid-cols-1 sm:grid-cols-2 …`.
  - Tabla ancha → contenedor `overflow-x-auto`.

### B. Layout & navegación
- Sidebars (`DashboardLayout`, `TutorLayout`) **colapsan a hamburguesa < lg**; verificar que el menú abre/cierra y no tapa contenido.
- Header compacta (logo + acciones) sin romper a 320.
- **FAB de ayuda** y cualquier elemento `fixed`/`sticky` **no tapan CTAs ni la barra inferior**.
- **Safe-area (notch):** barras/FAB con `pb-[env(safe-area-inset-bottom)]`.

### C. Tipografía & lectura
- Escala fluida: `text-sm sm:text-base`, títulos `text-xl sm:text-2xl md:text-[28px]`.
- Cuerpos **≥ 14 px** en mobile. Line-length cómoda (`max-w-prose`/`max-w-2xl`).
- `truncate` solo donde no se pierda info crítica (dar alternativa: tooltip/segunda línea).

### D. Targets táctiles & gestos
- Botones/links táctiles **≥ 44×44 px** (`min-h-11 min-w-11` en icon-buttons).
- Separación entre tappables (`gap`).
- Nada **solo-hover**: que haya estado `:active`/foco; menús que abren con tap.

### E. Tablas & datos densos ⚠️
Las **4 tablas** (`CoordinadorEquipo`, `TutorCases`, `TutorCertifications`, `BuyerWallet`):
- Patrón recomendado: **cards apiladas en mobile / tabla en `md:`+** (renderizar dos vistas), **o** contenedor `overflow-x-auto` con sangría `-mx-4 px-4` y sombra-hint de scroll.
- Nunca una tabla que **rompe el viewport** a 320.

### F. Formularios & wizard de 7 pasos (`/certificar`) ⚠️
- Inputs **full-width** en mobile, labels arriba, `gap` cómodo.
- **El stepper de 7 pasos NO entra en fila a 320** → numérico compacto ("Paso 3 de 7" + barra) o scroll horizontal del stepper.
- Botones **Atrás / Siguiente** alcanzables (sticky abajo si el form es largo), separados, ≥ 44 px.
- Al enfocar un input, que **no quede tapado por el teclado** (`scroll-into-view`).

### G. Modales & overlays
`AddPaymentModal`, `ChangePasswordModal`, `CheckoutModal`, `ConfirmDialog`, `CommandPalette`:
- En mobile: **full-screen o bottom-sheet**, con **scroll interno** (`max-h-[90dvh] overflow-y-auto`), nunca exceden viewport.
- Botón de cierre alcanzable, backdrop, foco atrapado, **Esc** cierra.
- Probar con contenido largo (que scrollee, no que empuje).

### H. Imágenes, mapas & media
- `LatamWorldMap` (`w-[460px]`) y media con ancho fijo → escalar/`max-w-full`/scroll contenido.
- `aspect-[x/y]` para evitar **layout shift**; `object-cover`; `loading="lazy"`.

### I. Grids & cards
- Colapsan N→1 columna en mobile (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`).
- Gaps proporcionales (`gap-4 sm:gap-6`). Cards full-width en mobile.

### J. Contenedores & max-width
- Los `w-[1320px]/[1240px]/[1100px]` deben ir como **`mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8`** — que **no** generen overflow y que en desktop grande centren (no estiren).

### K. Tour guiado (`GuidedTour`)
- Spotlight + tooltip **bien posicionados en todos los anchos** (ya hubo fixes mobile); el tooltip **no se sale** del viewport; fallback a modal centrado si el target es enorme.

### L. Estados especiales
- **Landscape** de teléfono. **Zoom 200 %** (reflow). **Teclado abierto.** Contenido largo (scroll). Empty states y **skeletons** (`PageFallback`) también responsive.

---

## 5. Metodología de testeo (cómo, con las tools reales)

1. **Levantar** el dev server (`ancestral-seed`, `localhost:5175`). Autenticar como **postulante** (Mariana) y como **tutor** según la pantalla.
2. Para **cada pantalla × cada ancho clave** (mínimo **320, 375, 768, 1024, 1280**):
   1. `preview_resize` al ancho.
   2. `preview_screenshot` → inspección visual.
   3. `preview_eval` → **detección programática de overflow** (snippet abajo).
   4. Chequear targets táctiles < 44 px (snippet abajo).
3. **Loguear** cada hallazgo: `pantalla · viewport · categoría · severidad · elemento culpable`.

**Snippet — detectar overflow lateral + culpable** (`preview_eval`):
```js
(() => {
  const vw = window.innerWidth;
  const hasOverflow = document.documentElement.scrollWidth > vw + 1;
  let worst = null, max = 0;
  document.querySelectorAll('body *').forEach(el => {
    const r = el.getBoundingClientRect();
    const over = r.right - vw;
    if (over > 1 && over > max && r.width > 0) {
      max = over;
      worst = { tag: el.tagName, cls: (el.className||'').toString().slice(0,80), over: Math.round(over) };
    }
  });
  return { vw, hasOverflow, scrollWidth: document.documentElement.scrollWidth, culpable: worst };
})()
```

**Snippet — targets táctiles chicos** (`preview_eval`):
```js
(() => {
  const small = [];
  document.querySelectorAll('a,button,[role="button"],input,select').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width>0 && (r.width<44 || r.height<44)) small.push({ t: el.textContent.trim().slice(0,24)||el.tagName, w: Math.round(r.width), h: Math.round(r.height) });
  });
  return { count: small.length, items: small.slice(0,20) };
})()
```

> **Nota de infra:** si tras editar Vite cachea un error fantasma (`?t=` viejo), **reiniciar** el dev server (`preview_stop` + `preview_start`). Los screenshots pueden traer **frames viejos** del browser reusado: confirmar siempre con `preview_eval` sobre el DOM, no solo con la imagen.

---

## 6. Patrones de fix (Tailwind v4, los del proyecto)

| Problema | Fix |
|----------|-----|
| Hijo flex desborda/no trunca | `min-w-0` en el hijo (y en `<main>`) |
| Columna → fila en desktop | `flex flex-col sm:flex-row` |
| Ancho fijo px | `w-full max-w-[460px]` / `max-w-full` |
| Grid fijo | `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6` |
| Contenedor centrado | `mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8` |
| Tabla densa | wrapper `overflow-x-auto -mx-4 px-4` **o** doble vista cards/tabla |
| Icon-button táctil | `inline-flex h-11 w-11 items-center justify-center` |
| Modal mobile | `fixed inset-x-0 bottom-0 max-h-[90dvh] overflow-y-auto rounded-t-3xl sm:inset-0 sm:m-auto sm:max-w-lg sm:rounded-3xl` |
| Barra/FAB con notch | `pb-[env(safe-area-inset-bottom)]` |
| Imagen | `w-full h-auto` / `aspect-[4/3] object-cover` |
| Texto fluido | `text-sm sm:text-base` |

---

## 7. Reglas de oro

1. **Mobile-first + prefijos de breakpoint.** Nunca arreglar mobile rompiendo desktop (ni al revés). Nada de media queries globales sueltas.
2. **No esconder info clave** detrás de `truncate` sin alternativa.
3. **Scroll horizontal solo** dentro de contenedores de tabla claramente delimitados — nunca en `<body>`.
4. **Respetar el design system** (tokens + primitivas `ui/`).
5. Tras cada tanda de fixes: **`npx tsc --noEmit` verde** + **consola del navegador sin errores**.
6. Cambios **chicos y verificados**, no refactors masivos.

---

## 8. ▶ FASE FINAL — Revisión manual de TODO (obligatoria)

Después de arreglar, **recorrer manualmente las 34 rutas** y dejar constancia. Esto es lo que confirma que "realmente funciona".

**8.1 — Sign-off por pantalla.** Para **cada ruta**, en **320 / 375 / 768 / 1024 / 1280**: screenshot + snippet de overflow + snippet de táctiles + lectura. Llenar:

| Ruta | 320 | 375 | 768 | 1024 | 1280 | Notas |
|------|:---:|:---:|:---:|:----:|:----:|-------|
| `/` | | | | | | |
| `/directorio` | | | | | | |
| … (las 34) | | | | | | |

Leyenda: ✅ ok · ⚠️ menor · ❌ roto. **Ninguna celda ❌** para declarar éxito.

**8.2 — Flujos end-to-end en mobile (375):**
- Postulante: `login → mis-certificaciones → detalle → continuar wizard (7 pasos) → pagos → ver factura → descargar PDF`.
- Tutor: `login tutor → /tutor/dashboard → casos → caso detalle → certificaciones → detalle`.
- Comprador: `directorio → certificado → verificar`.
- En cada paso: sin overflow, CTAs alcanzables, modales OK.

**8.3 — Casos especiales:** landscape en 3 pantallas clave · zoom 200 % en `/login` + una pantalla densa (`/pagos` o una tabla del tutor) · teclado abierto en el wizard.

**8.4 — Reporte final** (escribir en `RESPONSIVE-REPORT.md`):
- Tabla de sign-off 8.1 completa.
- Lista de bugs **encontrados → arreglados** (con antes/después).
- Bugs **que queden** (con severidad y por qué).
- **Veredicto:** "¿Totalmente responsive? SÍ / NO" + resumen.

---

## 9. Severidad

| Nivel | Qué |
|------|-----|
| **S1 — Crítico** | Overflow lateral · contenido cortado · CTA inalcanzable · pantalla rota en algún viewport |
| **S2 — Alto** | Target táctil chico · texto ilegible · modal que no scrollea · FAB tapando acción |
| **S3 — Medio** | Spacing/jerarquía subóptima en un breakpoint |
| **S4 — Bajo** | Pulido fino |

**Prioridad:** arreglar **todos los S1 y S2** antes de declarar la plataforma "totalmente responsive". S3/S4 se listan y se arreglan según tiempo.

---

## 10. Entregable

- ✅ **Código:** fixes aplicados · `tsc` verde · `npm run build` OK · consola limpia.
- ✅ **Doc:** `RESPONSIVE-REPORT.md` con la tabla de sign-off y el veredicto.
- ✅ **Demo:** `localhost:5175` actualizado (y `npm run deploy` si se pide).
