# PROMPT — Auditoría QA total de Ancestral Seed (manual, con Claude Preview)

> Pegá este prompt en una sesión de Claude Code parada en `~/dev/ancestral-seed`.
> Objetivo: una **auditoría exhaustiva, pantalla por pantalla y flujo por flujo**,
> de **todo** el producto — responsive, color/contraste, tipografía, layout,
> formularios, validaciones, opciones/controles, estados (loading/vacío/error),
> consola y accesibilidad. No alcanza con "carga OK": hay que **mirar cada cosa
> al detalle** y dejar un reporte con bugs priorizados + veredicto.

---

## 0 · Rol y vara

Sos un **QA + diseñador senior** haciendo el último pase antes de mostrarle el
producto a un cliente/inversor. Sos **escéptico**: asumí que hay bugs hasta
probar lo contrario. Para **cada pantalla y cada interacción** comparás lo que
ves contra la vara y marcás **✅ pasa / ⚠️ menor / ❌ falla**, registrando cada
⚠️/❌ en el log de bugs (sección 8) con pasos para reproducir.

**La vara (no negociable):**
- **Cero overflow horizontal** a 320px (`document.documentElement.scrollWidth <= window.innerWidth`).
- **Cero errores de consola** (nivel error) en cada ruta.
- **Nada cortado, tapado, superpuesto ni ilegible** en ningún breakpoint.
- **Todo control tiene color visible y contraste suficiente** (ningún badge/botón "fantasma").
- **Todo CTA hace algo** y lleva a donde dice.
- **Targets táctiles ≥ 44px** en controles standalone.
- **Tono digno** (usuarios = artesanos y comunidades originarias de LATAM, muchos en Android de gama baja).

---

## 1 · Setup

- **Stack:** React 19 · Vite 8 · TS strict · Tailwind v4 · Zustand (persist) · **MSW** (API mock, sin backend) · react-router 7 (data router).
- **Levantar el dev server:** usá la tool `preview_start` con el server **`ancestral-seed`** (definido en `.claude/launch.json`, puerto **5175**). Si el puerto está tomado por otro proyecto, matá el proceso y reintentá.
- **OJO base path:** en **dev** la base es `/` (NO `/ancestral-seed-app/`). Las URLs correctas son `http://localhost:5175/`, `/directorio`, `/autor/camila-montes`, etc. El prefijo `/ancestral-seed-app/` es **solo** del build de GH Pages.
- **Producción a contrastar (opcional):** https://ancestralseed.com (dominio propio) y https://soyalantapia.github.io/ancestral-seed-app/ (demo).
- **Usuaria demo:** **Camila Montes** (`mockUser`, email `camila@ancestralseed.org`), **multi-rol**: entra como **postulante** y también puede ir a `/tutor/*` sin re-login. Su `authorSlug` es `camila-montes` (su perfil público es el de Camila — debe coincidir).
- **Auth:** se persiste en `localStorage['ancestral-seed-auth']`. Para forzar rol tutor o volver a postulante, editá `state.user.role` ahí con `preview_eval`. **Al terminar, devolvé el rol a `postulante`.**

### Breakpoints obligatorios por pantalla clave
**320 · 375 · 414 · 768 · 1024 · 1280** + **landscape de teléfono** (p. ej. 844×390). Usá `preview_resize`.

### Chequeo global que corrés en CADA ruta (vía `preview_eval`)
```js
({
  overflow: document.documentElement.scrollWidth > window.innerWidth,   // debe ser false a 320
  w: innerWidth,
  h1: document.querySelector('h1,[role=heading]')?.textContent?.slice(0,60),
  path: location.pathname,
  sw: !!navigator.serviceWorker?.controller,                            // MSW debe controlar
})
```
Y `preview_console_logs` (nivel error) → debe venir **vacío**.

---

## 2 · ⚠️ Quirks de Claude Preview (leé esto ANTES de empezar — te ahorra horas)

1. **No navegues con `history.pushState` manual a rutas con `:slug`** (`/autor/x`, `/certificado/x`, `/mis-certificaciones/:id`): el data-router NO resuelve bien el param así y te da un falso "no encontrado". Navegá con **`location.href = '...'`** (carga dura) o clickeando un link real del SPA.
2. **El SW de MSW tiene que estar controlando la página.** Si `navigator.serviceWorker.controller` es `null`, los `/api/*` devuelven el `index.html` → "no encontrado". El código ya recarga una vez solo; si igual falla, recargá a mano.
3. **Los screenshots pueden traer frames viejos/fantasma.** Confirmá SIEMPRE el estado por DOM (`preview_eval`, `document.elementFromPoint`, `h1`), no solo por la captura.
4. **Las páginas pesadas (tutor, mapa LATAM) pueden tardar > 5s.** Esperá y reconfirmá por DOM antes de cantar un bug de "no carga".
5. **El puerto 5175 lo roban otros proyectos** (misanpedro, llave, app-upm, Deenex). Si la preview muestra otra cosa, verificá `document.title` y reiniciá el server.
6. **Si tras un edit aparece un error fantasma de HMR** (`?t=` viejo, "X is not defined" que el grep no encuentra), **reiniciá el dev server**.
7. El viewport a veces se resetea a 1280×721 tras un eval fallido — re-aplicá `preview_resize` antes de capturar.

---

## 3 · Inventario completo de rutas (cubrir TODAS)

### Público (sin login) — 12
`/` (Home) · `/directorio` · `/autor/:slug` (ej. `camila-montes`, `maria-belen-baulo`, `ecodestinos`) · `/certificado/:slug` (ej. `tecnica-ancestral-filigrana`, `ecodestinos-turismo-ancestral`) · `/verificar` · `/nosotros` · `/certificar` (wizard 7 pasos) · `/login` · `/registro` · `/recuperar` · `/legal/:section` (ej. `terminos`) · `/denuncias`

### Postulante (logueado) — 13
`/mis-certificaciones` · `/mis-certificaciones/:id` (ej. `req-001`) · `/mis-certificaciones/:id/renovar` · `/mis-certificaciones/:id/apelar` · `/mis-certificaciones/:id/plan-mejora` · `/mi-perfil` · `/notificaciones` · `/calendario` · `/pagos` · `/ayuda` · `/mis-datos` · `/comprador/wallet` · `/coordinador/equipo`

### Tutor (`/tutor/*`) — 7
`/tutor/dashboard` · `/tutor/casos` · `/tutor/casos/:id` · `/tutor/agenda` · `/tutor/tareas` · `/tutor/certificaciones` · `/tutor/certificaciones/:id`

---

## 4 · Las 10 dimensiones a auditar (aplicá TODAS a cada pantalla)

1. **Responsive / layout** — sin overflow; nada cortado/tapado; stacks correctos en mobile; sidebar ≥768 y bottom-nav en mobile; modales y sheets scrollean; tablas con scroll propio (no rompen el documento); landscape y zoom 200%.
2. **Color / contraste** — ningún elemento "fantasma" (texto, badge o botón del mismo color que el fondo → **bug histórico: la badge `cream-*` era invisible porque el token no existía**). Verificá que cada `CategoryBadge` (Auténtico/Tradicional/Inspiración) y el badge **Servicio** se vean con color real y contraste AA. Paleta oficial: `gold-500 #C7A800`, `navy-500 #001C38`, `warning` (ámbar), `info` (teal), `success`, `error`. Marca naranja NO aplica acá (eso es otro proyecto).
3. **Tipografía** — Montserrat carga; jerarquía clara; sin viudas/cortes raros (`hyphens`, `break-words`); nada en 5 líneas partidas; tamaños legibles en mobile.
4. **Espaciado / jerarquía** — paddings/márgenes consistentes; alineación; un solo CTA primario por vista; densidad razonable.
5. **Flujos (end-to-end)** — recorré los flujos de la sección 6 completos, no solo abrir la pantalla.
6. **Formularios** — labels arriba, full-width en mobile; required marcados; **validación real** (campos vacíos, email inválido, formatos); mensajes de error visibles y claros; estados focus/disabled/error; el submit hace lo que dice; el wizard persiste y retoma borrador.
7. **Opciones / controles** — TODOS los filtros, selects, toggles, tabs, chips, ordenamientos, switches y acordeones: abrir, cambiar valor, confirmar que el resultado cambia; tabs scrollean en mobile sin barra fea; el toggle de tema (claro/oscuro) si existe.
8. **Estados** — loading (skeletons, no pantalla en blanco), vacío (empty states con copy útil, no "undefined"), error (mensajes con reintento), y "no encontrado" 404.
9. **Consola / red** — sin errores; sin 404 de assets; sin warnings que rompan; imágenes que cargan (sin alt roto).
10. **Accesibilidad** — targets ≥44px; foco visible; navegación por teclado en modales (focus trap, Esc cierra); `alt` en imágenes; `aria-label` en botones de solo-ícono; "Saltar al contenido".

---

## 5 · Regresiones históricas — re-chequear que sigan arregladas

- [ ] Badge **Inspiración cultural** visible (no más `cream-*` fantasma); badge **Servicio** (teal + maletín) en Ecodestinos.
- [ ] **Header @768**: el nav y la hamburguesa no coexisten ni desbordan (revelado a `lg:`, no `md:`).
- [ ] **StagePipeline**: labels no cortados ("Prediagnóstico" entero, hyphenado), scroll-x sin barra gris.
- [ ] **Detalle certificación @768**: las 3 columnas de cabecera no se superponen; tabs scrollean.
- [ ] **Notificaciones mobile**: cards apiladas (ícono+texto arriba, botón full-width abajo); alert de pago en gold "PARA HACER".
- [ ] **Pagos**: hero "Primer pago para avanzar" en **gold (no rojo)**; pendiente no pintado de rojo salvo vencido real.
- [ ] **Mi perfil → "Ver vista previa"**: abre el perfil público en pestaña nueva y carga (Camila Montes).
- [ ] **Bottom nav mobile**: Perfil · Alertas · ⊕Certif. (círculo central que sobresale) · Pagos · Más; hamburguesa del Header oculta dentro de la cuenta.
- [ ] **MisDatos @320**: sin overflow.
- [ ] **Copys recientes**: "una postulación a completar" (no "a medias"); Ayuda → "90 días … (dependiendo de la disposición del postulante)" y "gratuito para postularse…".

---

## 6 · Flujos end-to-end (probar enteros, en 375 y en 1280)

1. **Público → certificado:** `/directorio` → filtrar por **Tipo/Región/Estado** → ordenar → buscar → abrir un **autor** → abrir un **certificado** → `/verificar` (ingresar un código y ver validez).
2. **Alta (wizard 7 pasos) `/certificar`:** completar paso 1, intentar avanzar con campos vacíos (debe frenar), completar y recorrer los 7; probar **"Postergar"** (deja borrador retomable) y el **FAB "Necesito ayuda"** (círculo icon-only en mobile, no tapa inputs); enviar y ver confirmación.
3. **Postulante:** `login` → `/mis-certificaciones` (card miniatura + barra 6 etapas) → detalle `req-001` (tabs Seguimiento/Evaluación/Evidencias/Pagos + StagePipeline) → `/pagos` → **"Pagar primer arancel"** → checkout (tarjeta/transferencia, validar campos) → pagar → **"Ver factura"** (preview + PDF) → `/mi-perfil` → **"Ver vista previa"**.
4. **Tutor:** (poné rol tutor) `/tutor/dashboard` → `/tutor/casos` (kanban con scroll-x + toggle Lista) → abrir un caso → `/tutor/certificaciones` → detalle.
5. **Menú de usuario:** avatar → **Cambiar contraseña** (modal, validación) → Cerrar sesión (confirm).
6. **Transversal:** Cookie banner (elegir "Solo operativas"), GuidedTour/Onboarding si dispara (no se sale del viewport), tema claro/oscuro si existe.

---

## 7 · Severidad

| | |
|---|---|
| **S1 — Crítico** | flujo roto · pantalla rota · CTA muerto · overflow/contenido cortado · elemento invisible por color · error de consola que rompe |
| **S2 — Alto** | overlap, target < 44px, modal que no scrollea/atrapa foco, validación ausente, copy confuso en paso clave, contraste insuficiente |
| **S3 — Medio** | spacing/jerarquía subóptima en un breakpoint, empty state pobre |
| **S4 — Bajo** | pulido fino, microcopy |

---

## 8 · Log de bugs (registrar cada hallazgo)
```
[ID] Pantalla · Ruta · Ancho · Rol
Severidad: S1/S2/S3/S4 · Dimensión: (responsive/color/forma/…)
Pasos: 1) … 2) … 3) …
Esperado: …
Obtenido: …
Evidencia: (screenshot / valor de preview_eval)
Fix propuesto: (archivo:línea + cambio concreto)
```

---

## 9 · Entregable

1. **Tabla de cobertura:** rutas × breakpoints (✅/⚠️/❌), marcando lo realmente verificado en vivo.
2. **Log de bugs** ordenado por severidad, con repro + fix propuesto (archivo:línea).
3. **Lo que está bien** (para no romperlo).
4. **Veredicto:** "¿Listo para mostrar a cliente/inversor end-to-end? **SÍ / NO**" + los **3 bugs más importantes** a arreglar primero.
5. Guardá todo en **`REPORTE-AUDITORIA-QA.md`** en la raíz del repo.

> **Si tenés permiso de escribir código:** arreglá los **S1/S2** que encuentres
> (cambios chicos y verificados: `tsc -b` verde + consola limpia + re-test del
> flujo en vivo), dejá los **S3/S4** listados, y al cerrar **devolvé el rol del
> usuario demo a `postulante`**. Verificá cada fix en la preview antes de cantarlo
> como resuelto, y no toques `main` con `git push` (el deploy es `npm run deploy`
> para GH Pages y `npm run build:domain` + FTP para ancestralseed.com).
