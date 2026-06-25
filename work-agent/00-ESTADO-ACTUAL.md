# 00 · Estado actual

## Resumen ejecutivo

Ancestral Seed es un **prototipo frontend completo y navegable** (PWA) con **datos mock (MSW)**. **No hay backend.** Está **en vivo en dos destinos** (GitHub Pages + ancestralseed.com), ambos al día.

La última sesión de trabajo hizo: (1) una **auditoría QA total** con fixes, (2) **16 cambios de UX/contenido** pedidos por Alan uno por uno, y (3) la **alineación de la artesana Camila Montes a Nariño**. Todo está **commiteado, buildeado (tsc verde) y deployado**.

**Veredicto:** listo para demo end-to-end en los 3 roles. Lo que queda es backend real + pulidos menores (ver [`03-PENDIENTES.md`](./03-PENDIENTES.md)).

---

## Commits de la última sesión (rama `main`)

| Commit | Qué |
|---|---|
| `8c6e28f` | **fix(qa)**: cluster de color (tokens fantasma/rotos en `index.css`) + contraste del badge "Inspiración" + link legal roto (`/legal` → 404) |
| `e65897e` | **feat(ux) tanda 1**: validación de errores del wizard, tutorial→panel, "auditor"→"Tutor", datos de Camila, sacar "Estado" placeholder |
| `94a6984` | **ux(landing)**: justificar párrafos del Home + re-encuadrar mapa LATAM |
| `ce039c5` | **feat**: reestructura de pestañas del detalle + adjuntar PDF en "Mis destacados" + a11y |
| `b503c2d` | **data**: alinear Camila Montes a Nariño (bio, comunidad, certificado) |

> Commits anteriores relevantes: `1cdf4e9` (build parametrizado para dominio), `7dbd6bb` (OG image), `e30a87d` (badges de categoría con color + "Servicio" para Ecodestinos).

---

## Qué se hizo, en detalle

### A. Auditoría QA + fixes (`8c6e28f`)
Auditoría manual (Claude Preview, pantalla por pantalla, 320/375/768/1280) + auditoría estática de código. Hallazgos arreglados y **verificados en vivo**:

1. **Cluster de color en `src/index.css`** — había tokens **fantasma** (clases que no renderizaban) y **rotos**. Corregido:
   - Definidos: `gold-50`, `cream-50`, `navy-50`, `info-50`, `success-700`, `warning-500`.
   - `--color-info-200`: `#ce3def0` (hex inválido de 7 dígitos) → `#bcdde6`.
   - `--color-warning-200`: `#f03697` (rosa chillón fuera de paleta, salía en el borde de las cards "esperan tu firma" del tutor) → `#f5d28e` (ámbar).
2. **Contraste** del badge "Inspiración cultural" (`CategoryBadge.tsx`): 3.8:1 → **6.18:1** (pasa AA) usando `text-warning-500`.
3. **Link legal roto**: en `MisDatos.tsx` el link "política completa" iba a `/legal` (404, porque la ruta es `/legal/:section`) → `/legal/privacidad` vía `<Link>`. Además email `.io` → `.com`.

> Reporte de auditoría: [`../REPORTE-AUDITORIA-QA.md`](../REPORTE-AUDITORIA-QA.md).

### B. 16 cambios de UX/contenido (tandas 1–3)

| # | Pedido | Resultado | Archivos |
|---|---|---|---|
| N1 | Justificar párrafos centrados (landing) | `text-justify` en subtítulo del hero + descripciones de sección | `pages/Home.tsx` |
| N2 | Sacar la palabra "Estado" de las fotos | Cards en modo placeholder ya no muestran el badge "Estado" | `components/features/CertificationCard.tsx` |
| N3 | Agregar países faltantes al mapa LATAM | Re-encuadre de la proyección (`center:[-79,-9]`, `scale:350`, `height:820`) para que entren México/Centroamérica/Caribe (antes recortados) | `components/features/LatamWorldMap.tsx` |
| N4 | Etiquetas con color relevante | Ya estaba (badges de categoría con color real) | `CategoryBadge.tsx` |
| N5 | Ecodestinos = "Servicio" | Ya estaba (`entityType: 'servicio'`) | `services/mocks/data.ts` |
| N6 | "postulación a medias" → "a completar" | Ya estaba | `pages/CertifyForm.tsx` |
| N7 | Revisar errores del form ("Email inválido") | "Email inválido" en vacío → "Ingresá tu email"; distingue vacío vs mal formado (email/teléfono/documento/nombre) | `pages/CertifyForm.tsx` |
| N8 | Fin del tutorial → dashboard, no `/certificar` | El paso final del tour del postulante (`ctaTo`) ahora va a `/mis-certificaciones` | `lib/tours.ts` |
| N9 | "auditor" → "Tutor" en toda la plataforma | Sweep en toda la UI (se mantuvo "auditoría" el proceso). El campo de datos `auditorName` se dejó igual (no es visible) | `types/index.ts`, `data.ts`, `lib/alerts.ts`, `pages/{Home,CertificationRequest,Legal,Apelar,PlanMejora,CertifyForm}.tsx` |
| N10 | El diagnóstico lo carga el **tutor**, el postulante solo lo ve | Diagnóstico **read-only**: la pestaña Evaluación muestra "Completado por tu tutor" + botón "Ver diagnóstico del tutor"; el diálogo es un **visor** con los datos del tutor (mock `tutorDiagnosis`) | `pages/CertificationRequest.tsx` |
| N11 | La auditoría pendiente debe estar en las pestañas | Nueva pestaña **Auditoría** con las auditorías pendientes/programadas (se extrajeron de Evaluación) | `pages/CertificationRequest.tsx` |
| N12 | Sacar "Pagos" de las pestañas | Pestaña Pagos eliminada del detalle (queda centralizado en `/pagos`). Se borró el componente muerto `PagosTab` + imports huérfanos | `pages/CertificationRequest.tsx` |
| N13 | "Artesana · San Juan de Pasto - Nariño" | Título de Camila actualizado | `services/mocks/data.ts` |
| N14 | Ubicación: solo "Colombia" | `location: 'Colombia'` + email `.com` | `services/mocks/data.ts` |
| N15 | "Ponerle portada" | **Descartado por Alan** ("sacalo") — el perfil ya toma portada del 1er certificado | — |
| N16 | Colgar un PDF en "Mis destacados" | Input "Colgar un PDF" en el modal de editar destacado + chip 📄 en la card | `pages/MyProfile.tsx` |

Pestañas del detalle de certificación, **antes** → `Seguimiento · Evaluación · Evidencias · Pagos`; **ahora** → `Seguimiento · Evaluación · Auditoría · Evidencias`.

### C. Findings de la auditoría arreglados (a11y + rutas huérfanas) (`ce039c5`)
- **Sheet** (`components/ui/sheet.tsx`): agregado `useFocusTrap` + `role="dialog"` + `aria-modal` + `aria-label`; botón cerrar a 44px. (Afecta los filtros del directorio y otras fichas.) **Verificado: el foco entra al diálogo.**
- **Card de cert del tutor en mobile** (`TutorCertifications.tsx`): era `<li onClick>` inaccesible por teclado → `role="button"` + `tabIndex` + `onKeyDown` + ring de foco.
- **aria-label** en el menú de usuario del tutor (`TutorLayout.tsx`) y en el input del `CommandPalette.tsx`.
- **Rutas huérfanas** (no tenían entrada de menú): `/mis-datos`, `/comprador/wallet`, `/coordinador/equipo` → agregadas como comandos en el `CommandPalette` (grupo Cuenta).

### D. Camila Montes alineada a Nariño (`b503c2d`)
Para que toda su data sea coherente con "Artesana · San Juan de Pasto - Nariño":
- **Bio + comunidad**: "Sierra Nevada de Santa Marta / pueblos Kogi·Arhuaco·Wiwa" → "Andes de Nariño, San Juan de Pasto / pueblos **Pastos · Quillasingas**".
- **Su certificado de Filigrana** (`c-filigrana`): categoría `Caribe colombiano` → `Nariño`, + `location`, `mapQuery` (San Juan de Pasto), descripción y `contextParagraphs`.
- Se **dejaron intactos** los otros productos legítimamente caribeños/Kogi (Tejido Kogi, etc.) — no son de Camila.

---

## Estado de deploy (al cierre de la sesión)

- **GitHub Pages**: `npm run deploy` → publicado (rama `gh-pages`). En vivo.
- **ancestralseed.com**: `npm run build:domain` + FTP (149 archivos + `.htaccess`). En vivo. Verificado que el CDN propagó el CSS nuevo (tokens de color corregidos).
- Working tree **limpio**, `tsc -b` **verde**, todo en `main`.

---

## Verificado en vivo (no solo en código)
- Flujo de pago e2e (KPIs actualizan, aparece "Ver factura").
- Wizard: bloquea con campos vacíos y muestra los mensajes nuevos.
- Pestañas nuevas del detalle (Auditoría presente, Pagos ausente) + diagnóstico read-only con datos del tutor (0 inputs).
- Sheet de filtros accesible (role=dialog, foco adentro).
- Mapa LATAM renderizando 24 países (México→Argentina) tras el re-encuadre.
- Datos de Camila (Nariño) en su perfil público.
