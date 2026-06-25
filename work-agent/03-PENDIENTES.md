# 03 · Pendientes / Backlog

Ordenado por impacto. Lo que está hecho está en [`00-ESTADO-ACTUAL.md`](./00-ESTADO-ACTUAL.md).

---

## 🔴 Grande / estructural

### 1. Backend real
Es lo único realmente grande que falta. Hoy todo es MSW. Para conectar:
- Implementar los endpoints de `src/services/api.ts` (ver contrato en [`01-ARQUITECTURA.md`](./01-ARQUITECTURA.md) §7) respetando `src/types/index.ts`.
- Apagar mocks con `VITE_USE_MSW=false` (o `npm run build:no-msw`).
- Persistencia real para: alta/seguimiento de solicitudes, evidencias (upload), pagos (pasarela), firma/emisión de certificados, verificación por hash, auth real (hoy el login acepta cualquier cosa).
- Cosas que hoy son sólo-frontend y necesitan backend cuando exista:
  - **PDF en "Mis destacados"** (`MyProfile.tsx`): hoy sólo guarda el **nombre** del archivo en el estado (no sube ni persiste el PDF). Cablear upload real.
  - **Diagnóstico del tutor**: hoy es la constante mock `tutorDiagnosis` en `CertificationRequest.tsx`. Debe venir del backend (lo carga el tutor, lo lee el postulante).
  - Notificaciones/alertas: hoy son mock estáticas (ej. la alerta de "primer pago" no se sincroniza con el pago hecho en la demo).

---

## 🟠 A11y — cola pendiente (la auditoría hizo lo de mayor valor; queda esto)

- **`aria-invalid`** en los inputs del wizard cuando fallan (los mensajes de error SÍ se muestran, falta el atributo).
- **Drawer "Perfil del tutor"** en `CertificationRequest.tsx` (~línea 1830, un `<aside>` custom, NO el componente `Sheet`): sí cierra con Esc, pero le falta `role="dialog"` + focus-trap. (El `Sheet` genérico de los filtros del directorio YA quedó arreglado.)
- **Targets <44px** (nivel AAA) en botones de cierre icon-only de `CookieBanner`, `GuidedTour`, `CheckoutModal`, `ConfirmDialog`, `modal.tsx`, `InternalNotesPanel`. (El `sheet.tsx` y el visor de diagnóstico ya están a 44px.)

---

## 🟡 Consistencia de datos / contenido

- **Revisar el certificado de Camila** (`c-filigrana` en `data.ts`): se alinearon bio, comunidad, descripción, `location`, `mapQuery` y `contextParagraphs` a Nariño, pero conviene revisar `techniqueParagraphs` y cualquier `galleryUrls`/copy que todavía mencione "Sierra Nevada de Santa Marta" o "Caribe".
- **`auditorName`**: el nombre del **campo** de datos sigue siendo `auditorName` (no es visible en UI, que dice "Tutor"). Renombrarlo a `tutorName` sería más limpio pero toca muchos lugares — opcional.
- Email de contacto: hay direcciones mock con dominios mezclados (`@ancestralseed.org`, `@ancestralseed.io`, `@ancestralseed.com`). Unificar a `.com` cuando se defina el real.

---

## 🟡 Hallazgos de la auditoría estática NO verificados en vivo
La auditoría estática (workflow multi-agente) se cortó por rate-limit y dejó estos **flagged pero sin confirmar** — vale revisarlos manualmente:
- `apelar-sin-guard-status` (¿se puede apelar una solicitud que no está denegada?).
- `certifyform-autosave-overwrites-other-steps` (posible pisado de pasos en el autosave del wizard).
- `denuncias-lookup-no-validation` / `changepassword-no-current-validation` (validaciones flojas).
- `checkout`/`addpayment` modales sin focus-trap.
- Hex hardcodeados en `Charts.tsx` / `LatamWorldMap.tsx` (deberían usar tokens).

---

## 🟢 Menor / nice-to-have

- **Mapa LATAM**: falta **Guayana Francesa** (el dataset `countries-110m.json` no la trae como país separado). Si se quiere, cambiar a un topojson de 50m (pesa más). El re-encuadre actual (`center:[-79,-9]`, `scale:350`) ya muestra México→Argentina sin recortes.
- **Comprador / Coordinador**: `/comprador/wallet` y `/coordinador/equipo` son pantallas demo-gated, poco desarrolladas. Si entran al scope, completarlas (y agregarles guards `RequireComprador`/`RequireCoordinador`, hoy sólo están bajo `RequireAuth`).
- Revisar `npm run lint` (no se corrió en la última sesión; el build con `tsc` sí pasa).
- Tests: la suite (`src/test/`) es chica (smoke, api, focus-trap, html-fallback). Ampliar cobertura de los flujos nuevos (pestañas del detalle, diagnóstico read-only) si se quiere CI más sólido.
