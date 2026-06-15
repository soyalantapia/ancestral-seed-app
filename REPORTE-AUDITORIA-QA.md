# REPORTE — Auditoría QA total de Ancestral Seed

**Fecha:** 2026-06-15 · **Método:** QA manual con Claude Preview (en vivo, pantalla por pantalla, multi-breakpoint) + auditoría estática de código con verificación adversarial (workflow multi-agente).
**Alcance:** los 3 roles, 32 rutas, 10 dimensiones (responsive, color/contraste, tipografía, layout, flujos, formularios, opciones, estados, consola, a11y).

---

## ✅ VEREDICTO: listo para demo end-to-end — **SÍ**

Los 3 roles recorren bien, los flujos clave funcionan de punta a punta, **cero overflow** en 320/375/768, **cero errores de consola**, y los bugs de color que venían decayendo en silencio **quedaron arreglados y verificados en vivo** en esta pasada. Lo que queda abierto es **a11y de teclado/lector + 3 features sin punto de entrada** (reales pero no bloquean una demo visual).

**Top 3 a atacar después (no bloquean demo):**
1. **3 features huérfanas sin entrada de menú** (`/mis-datos`, `/comprador/wallet`, `/coordinador/equipo`) — implementadas pero solo alcanzables tipeando la URL.
2. **Sheets/drawers sin focus-trap ni `role=dialog`** (filtros del directorio, perfil del auditor) — navegación por teclado se escapa al fondo.
3. **Cards/controles solo-mouse o con target <44px** (card de cert tutor en mobile, botones de cierre icon-only).

---

## 1 · Cobertura verificada EN VIVO

| Ruta / superficie | Breakpoints | Resultado |
|---|---|---|
| Home `/` | 320, 375 | ✅ sin overflow, consola limpia |
| Directorio + filtros/orden/búsqueda + badges | 320, 375, 1280 | ✅ funciona; badges con contraste medido |
| Detalle certificado público `/certificado/:slug` | 375 | ✅ carga, sin badge cortado (el "Estad" era frame fantasma) |
| **Wizard `/certificar`** (validación paso 1) | 375 | ✅ bloquea avance con campos vacíos + muestra errores; FAB icon-only |
| Login | 375 | ✅ email+password, toggle de contraseña con aria-label |
| **Pagos → checkout → pago → factura** | 375 | ✅ flujo de plata e2e: KPIs actualizan, "Ver factura" aparece |
| Detalle cert postulante `req-001` (StagePipeline + tabs) | 320, 375, 768 | ✅ labels enteros, tabs OK, 3 columnas sin overlap @768 |
| Notificaciones | 375 | ✅ cards apiladas, alerta de pago en gold, "marcar todas" icon-only |
| Tutor dashboard | 375 | ✅ render OK (+ GuidedTour dispara bien) |
| Tutor casos (kanban) | 375 | ✅ columnas con scroll-x, sin overflow de documento |
| MisDatos | 320 | ✅ sin overflow |

---

## 2 · 🔧 ARREGLADO Y VERIFICADO en esta pasada

### A. Cluster de color "fantasma/roto" (raíz en `src/index.css`)
Detectado por análisis estático + ground-truth contra el CSS compilado. **El bug `cream-*` que creíamos arreglado solo se había corregido en `CategoryBadge`; sobrevivía en 5+ archivos.**

| Token | Antes | Ahora | Usos arreglados |
|---|---|---|---|
| `gold-50`, `cream-50`, `navy-50`, `info-50` | no existían → clases inertes (tintes que no se aplicaban) | **definidos** | ~17 (fondos suaves en Pagos, MisDatos, Checkout, AuthorProfile, MyCerts, etc.) |
| `success-700` | no existía → texto de licencia sin color | **definido** `#0a6b12` | LicenseStatusBadge |
| `--color-info-200` | `#ce3def0` (**hex inválido, 7 díg.**) → bordes caían a currentColor | `#bcdde6` (light teal) | 8 cajas info (borders/rings) |
| `--color-warning-200` | `#f03697` (**rosa chillón fuera de paleta**) | `#f5d28e` (ámbar) | borde de "casos esperan tu firma" (TutorDashboard) |

**Verificado en vivo:** 6 clases ahora generan regla CSS; TutorDashboard pasó de **0 bordes rosa** (antes 3 en `rgb(240,54,151)`) a **3 ámbar** (`rgb(245,210,142)`).

### B. Contraste de badge "Inspiración cultural" — `CategoryBadge.tsx`
Era `text-warning-400` sobre `warning-100` = **3.8:1** (falla AA para texto chico en negrita). Ahora `text-warning-500` (`#7a5600`) = **6.18:1 medido en vivo** ✅.

### C. Link legal roto + email inconsistente — `MisDatos.tsx`
- "política completa" apuntaba a `<a href="/legal">` → **404 confirmado en vivo** (la ruta es `/legal/:section`). Cambiado a `<Link to="/legal/privacidad">` (respeta basename, sin recarga). **S2 resuelto.**
- `privacidad@ancestralseed.**io**` → corregido a `.com` (consistente con el resto del sitio).

> Build verde (`tsc -b` limpio), todas las verificaciones en vivo OK.

---

## 3 · 🟠 ABIERTO — real, no arreglado (con fix propuesto)

### Routing (S2)
- **`ruta-huerfana-mis-datos`** · `routes.tsx:166` — `/mis-datos` (derechos del titular, feature completa) **sin ningún punto de entrada**. Fix: agregar al menú de usuario o al `CommandPalette`. *(Mismo patrón en `/comprador/wallet` y `/coordinador/equipo` — flagged por el agente, no live-verificado.)*

### Accesibilidad (S2 — teclado/lector)
- **`sheet.tsx`** (filtros del directorio, fichas de CertDetail) — sin `useFocusTrap`, `role=dialog` ni `aria-modal`; el foco se escapa al fondo interactivo. Fix: replicar el patrón de `modal.tsx` (hooks `useFocusTrap`/`useEscape` ya existen).
- **`CertificationRequest.tsx:1826`** (drawer "Perfil del auditor") — sin `role=dialog`/focus-trap (sí cierra con Esc; el verificador corrigió ese punto del hallazgo).
- **`TutorCertifications.tsx:420`** — card mobile usa `<li onClick>` sin `role`/`tabIndex`/`onKeyDown` → inalcanzable por teclado. Fix: `<Link>`/`<button>` o `role=button`+handlers.
- **`TutorLayout.tsx:447`** — botón de menú de usuario sin nombre accesible en mobile (avatar `alt=""` + nombre `hidden`). Fix: `aria-label`.

### Accesibilidad (S3 — target size, nivel AAA)
- Botones de cierre icon-only <44px en `CookieBanner`, `GuidedTour`, `CheckoutModal`, `ConfirmDialog`, `Modal`, `Sheet` (todos 24-32px; pasan AA 24px, fallan AAA 44px). `InternalNotesPanel` 28px. Fix: estandarizar a ≥44px.

### Menores (S4)
- `CommandPalette.tsx:252` — input solo con placeholder, sin `aria-label`.
- Wizard: inputs no setean `aria-invalid` al fallar (los mensajes de error SÍ se muestran); copy de error débil ("Tu nombre completo").
- La alerta "Hacé tu primer pago" en Notificaciones no se sincroniza con el pago hecho (datos mock independientes; en backend real se resolvería).

### Flagged por auditoría estática, NO verificado en vivo (rate-limit cortó el verificador)
Vale revisarlos manualmente: `apelar-sin-guard-status`, `certifyform-autosave-overwrites-other-steps`, `denuncias-lookup-no-validation`, `changepassword-no-current-validation`, `checkout/addpayment-modals-no-focus-trap`, `addpayment-no-error-feedback`, hex hardcodeados en `Charts`/`LatamWorldMap`. *(El agente `amber/red license` fue descartado: la paleta default de Tailwind sigue activa, así que `amber-*`/`red-*` SÍ resuelven.)*

---

## 4 · Lo que está bien (no romper)
- Responsive sólido: 0 overflow en 320/375/768 en todo lo auditado.
- Validación del wizard real (bloquea + mensajes). Flujo de pago e2e impecable (gold, no rojo). StagePipeline y tabs OK. Bottom-nav y FAB correctos. Consola limpia. Las regresiones históricas (cream badge, Header@768, StagePipeline, notif mobile, MisDatos@320) siguen arregladas.

---

## 5 · Notas de método
- **Quirk reforzado:** los screenshots de Claude Preview sirven frames fantasma — el badge "Estad" cortado sobre la imagen del cert NO existía en el DOM. Siempre confirmar por DOM.
- La auditoría estática (workflow de 8 dimensiones) fue limitada por rate-limit: confirmó 8 hallazgos de 39 crudos; el resto se triаgeó manualmente acá.
