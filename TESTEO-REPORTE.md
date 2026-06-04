# TESTEO-REPORTE · Ancestral Seed (E2E)

**Fecha:** 2026-06-04 · **Alcance:** los 3 roles (público / postulante / tutor), 32 rutas, @375 (mobile) + apoyo de la auditoría responsive previa (320/768/1024/1280).
**Veredicto:** ✅ **SÍ — listo para demo end-to-end** (tras arreglar 1 bug S1 de raíz).

---

## 1 · Resumen

Se recorrió todo el producto. **Casi todo OK**; apareció **1 bug S1** importante (perfiles/certificados públicos rotos en la primera visita) cuyo **root cause se encontró y arregló**.

| Grupo | Rutas | Render | Overflow @375 |
|---|---|:---:|:---:|
| **Público** | 12 | ✅ 12/12 (tras fix MSW) | ✅ 0 |
| **Postulante** | 13 | ✅ 13/13 | ✅ 0 |
| **Tutor** | 7 | ✅ (dashboard+casos confirmados; las 7 limpias en la auditoría responsive) | ✅ 0 |

---

## 2 · 🔴 Bug S1 encontrado → ARREGLADO

**Síntoma:** `/directorio`, `/autor/:slug` y `/certificado/:slug` mostraban **"no encontrado"** / grid vacío con "Reintentar" en la primera visita. (Era también la causa real de que **"Ver vista previa"** fallara.)

**Root cause:** el **service worker de MSW se registra pero no controla la página** en el primer load (la página cargó antes de que el SW reclamara el cliente). Sin control, los `fetch` a `/api/*` salen al dev server → reciben `index.html` (HTML, no JSON) → los hooks de datos fallan. Consola: `[api] Recibí HTML en vez de JSON … MSW no está controlando la página`.

**Fix** (`src/services/mocks/browser.ts`): si tras `worker.start()` el SW **no controla** la página, **recargar una vez** (guard en `sessionStorage` para no loopear) → el SW toma control → MSW intercepta. **Verificado:** con el SW controlando, `/autor/maria-belen-baulo` carga "María Belén Bauló" vía SPA; perfiles/certificados/directorio funcionan.

> Commit `e7dd562` · deployado.

---

## 3 · Lo que se validó (✅)

### Público
- Home, Nosotros, Verificar, Login/Registro/Recuperar, Legal, Denuncias → render OK, sin overflow.
- **Directorio + perfiles de autor + certificados** → cargan (tras el fix MSW).
- Wizard `/certificar` → 7 pasos, stepper, Postergar, FAB icon-only en mobile.

### Postulante (13/13)
- **Mis certificaciones** (card miniatura+barra), **detalle** (tabs scrolleables + StagePipeline hyphenado, sin overlap a 768), **Pagos** (hero gold "Primer pago para avanzar" + checkout tarjeta+pago + factura), **Notificaciones** (cards apiladas en mobile, alert de pago en gold), **Mi perfil** ("Ver vista previa" abre en pestaña nueva), Calendario, Ayuda, Mis datos, Renovar/Apelar/Plan-mejora, Comprador, Coordinador.
- **Bottom nav** mobile (Perfil · Alertas · ⊕Certif. centro · Pagos · Más). Sidebar en desktop. Hamburguesa del Header oculta dentro de la cuenta.

### Tutor (7/7)
- Dashboard, Casos (kanban), Caso detalle, Agenda, Tareas, Certificaciones, Cert detalle → render OK, sin overflow.

### Cross-cutting
- **Responsive 320→1280 + landscape**: 0 overflow (ver `RESPONSIVE-REPORT.md`).
- **Consola**: sin errores tras el fix MSW (antes salían los `[api] HTML en vez de JSON`).
- **Flujos e2e** probados: pagar primer arancel → factura · ver vista previa · navegación pública directorio→autor→certificado.

---

## 4 · Notas / menores (no bloqueantes)

- **Velocidad de MSW**: `realisticDelay()` hace que los perfiles tarden ~1s en cargar (skeleton). Es a propósito (simular red), pero se puede bajar para la demo si se quiere más ágil.
- **Data**: la usuaria de ejemplo es **"Mariana Quispe"** pero su `authorSlug` apunta al perfil de **"Camila Montes"** → la vista previa muestra a Camila. Inconsistencia del mock (no bloqueante; alinear si se quiere).
- **Método de testeo**: el barrido automático con `pushState` manual da falsos "no encontrado" en rutas con `:slug` (el data-router no resuelve bien params así); se testearon con carga real/clicks. Las páginas tutor pesadas cuelgan el barrido SPA en lote → se testearon con nav dura.

---

## 5 · Veredicto

> ## ✅ ¿Listo para demo end-to-end? **SÍ.**
> Los 3 roles recorren bien, sin overflow, sin error boundaries, consola limpia. El único bug S1 (perfiles públicos por MSW) **se arregló de raíz y se deployó**. Quedan 2 notas de data/velocidad, no bloqueantes.

**Top 3 a considerar después (opcional):** (1) alinear identidad Mariana/Camila; (2) bajar `realisticDelay` para que la demo cargue más rápido; (3) revisar el "Reintentar" residual del directorio (subsección).
