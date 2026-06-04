# PROMPT — Testeo integral de Ancestral Seed (de punta a punta, desde el inicio)

> Pegá este prompt en una sesión de Claude Code (o ejecutalo vos mismo a mano).
> Objetivo: recorrer **todo** el producto como un usuario real, **desde la primera
> visita** hasta el final de cada rol, validando que cada flujo funcione, se vea
> bien y no tenga errores. Cierra con un **reporte de bugs + veredicto**.

---

## 0 · Rol y misión

Sos un **QA senior** haciendo una pasada **end-to-end** de Ancestral Seed (prototipo
de certificación cultural/ancestral). Probás **los 3 roles** (público, postulante,
tutor), **pantalla por pantalla y flujo por flujo**, en **mobile y desktop**.

Para **cada caso**: hacé la acción → compará con el **resultado esperado** → marcá
**✅ pasa / ⚠️ menor / ❌ falla**. Si encontrás un ❌ o ⚠️, registralo en el log de
bugs (sección 7) con pasos para reproducir.

**Vara:** nada roto, nada cortado/tapado, sin overflow horizontal, sin errores de
consola, copy claro, CTAs que funcionan, y el tono **digno** (usuarios = artesanos
y comunidades de LATAM, muchos en Android de gama baja).

---

## 1 · Setup

- **Stack:** React 19 · Vite 8 · TS · Tailwind v4 · Zustand · **MSW** (mock API, sin backend real) · react-router 7.
- **Levantar:** `npm run dev` → `http://localhost:5175` (desde `~/dev/ancestral-seed`). O usar el deploy: `https://soyalantapia.github.io/ancestral-seed-app/`.
- **Datos:** todo es mock (MSW). El postulante de ejemplo es **Mariana Quispe**. El tutor es **Lic. Juan Pérez**.
- **Anchos a probar (cada pantalla clave):** **320 · 375 · 768 · 1024 · 1280** + landscape de teléfono.
- **Tools (si lo corre un agente):** `preview_start`/`preview_resize`/`preview_screenshot`/`preview_eval`/`preview_console_logs`.
- **Chequeo global por pantalla:**
  - Overflow: `document.documentElement.scrollWidth > window.innerWidth` debe ser **false** a 320.
  - **Consola sin errores** (`preview_console_logs` level error → vacío, salvo el warning preexistente de MSW `waitUntilReady`).
  - Targets táctiles **≥ 44 px** en controles standalone.

> **Tip de infra:** si tras un cambio Vite cachea un error fantasma (`?t=` viejo) o el puerto 5175 lo toma otro proyecto, **reiniciar el dev server**. Confirmá siempre por DOM (`preview_eval`), no solo por screenshot (pueden traer frames viejos).

---

## 2 · FASE 1 — Primera visita (público, sin login)

| # | Pantalla / acción | Resultado esperado |
|---|---|---|
| 1.1 | **Home `/`** | Hero "Autenticidad Ancestral Certificada Digitalmente", mapa LATAM, secciones, CTAs "Certificar Producto" + "Explorar el directorio". Nav superior con hamburguesa **solo** en público. Footer completo. |
| 1.2 | **Nav responsive** | A <1024 el nav central se oculta y aparece la **hamburguesa** (abre el menú). A ≥1024, nav en fila + CTAs. **Sin overflow a 768** (era un bug, debe estar OK). |
| 1.3 | **Directorio `/directorio`** | Grid de autores/certificados. Filtros (país/categoría/técnica) + orden + búsqueda. En mobile, botones "Filtros"/"Ordenar" (sheets). Abrir un autor. |
| 1.4 | **Perfil de autor `/autor/:slug`** (ej. `camila-montes`) | Carga el perfil (hero, "PERFIL VERIFICADO", tabs Sobre/Certificaciones/…). **No** debe quedar en "Autor no encontrado". |
| 1.5 | **Certificado público `/certificado/:slug`** | Detalle del certificado + sello + verificación blockchain (mock). |
| 1.6 | **Verificar `/verificar`** | Ingresar un código/QR → muestra validez. |
| 1.7 | **Nosotros / Legal `/legal/terminos` / Denuncias** | Renderizan, texto legible, sin overflow. |
| 1.8 | **Login / Registro / Recuperar** | Forms con validación. En `/login`, el **ojo de mostrar contraseña** debe ser tappable (≥44px). |

---

## 3 · FASE 2 — Alta de certificación (wizard 7 pasos)

| # | Acción | Esperado |
|---|---|---|
| 2.1 | **`/certificar`** | Título "Formulario de Certificación Ancestral" + botón **"Postergar"** arriba (en mobile NO se pisa con el título). Stepper **"PASO 1 DE 7"** + barra de 7 segmentos. |
| 2.2 | Completar paso 1 (Identidad) | Inputs full-width, labels arriba; validación de requeridos. |
| 2.3 | Avanzar por los 7 pasos | El stepper avanza; "Sigue: …" indica el próximo. Botones Atrás/Siguiente alcanzables. |
| 2.4 | **FAB "Necesito ayuda"** | En mobile es un **círculo icon-only** (no tapa inputs); en desktop, pill completo. |
| 2.5 | **Postergar** | Abre modal de confirmación; al postergar, queda un borrador retomable. |
| 2.6 | Enviar | Confirmación de envío. |

---

## 4 · FASE 3 — Dashboard del postulante (logueado)

> Entrá como postulante. **Mobile:** debe aparecer la **bottom nav** (Perfil · Alertas · **⊕ Certif. centro** · Pagos · Más). **Desktop (≥768):** sidebar. La hamburguesa del Header **no** aparece dentro de la cuenta.

### 4.1 · Mis certificaciones (home) `/mis-certificaciones`
- Card full-width: **miniatura de la pieza + barra de 6 etapas** ("Etapa 1 de 6 · Prediagnóstico") + "Para avanzar: …" + **Continuar**.
- Botón **Nueva** → `/certificar`. Pocas certs = sin tabs ni filtros (lista única).

### 4.2 · Detalle `/mis-certificaciones/:id` (req-001)
- Card de cabecera (#001, estado, "2 pendientes", barra 8%, Creación/Última actividad/Auditor). **A 768 NO se superponen las 3 columnas** (era bug).
- **Tabs** Seguimiento / Evaluación / Evidencias / Pagos → **scrollean horizontal** en mobile (todas alcanzables), sin barra gris visible.
- **StagePipeline** (5 etapas): scrollea en mobile/tablet, **labels NO cortados** ("Pre-diag-nóstico" hyphenado), llena en desktop.
- "Añadir evidencias" funciona. Botones Renovar/Apelar/Plan de mejora **gated por estado**.

### 4.3 · Pagos `/pagos` ⭐ (flujo nuevo)
- **Hero "Primer pago para avanzar"** en **gold (NO rojo)** + "agregá tu tarjeta y hacé el primer pago · $45.000" + CTA **"Pagar primer arancel"**.
- CTA → abre **checkout** (Tarjeta/Transferencia, Nombre/Número/Venc/CVV, "Pagar $45.000").
- **Pagar** → el pago pasa a **Pagado**; aparece **"Ver factura"** (preview + descargar PDF).
- KPIs (Total pagado / Pendiente). Chips de filtro (Todos/Pendientes/Pagados/Vencidos) tappables (≥44px). Métodos de pago guardados (agregar/eliminar tarjeta).
- La lista **no** pinta el pendiente en rojo (rojo solo si vencido de verdad).

### 4.4 · Notificaciones `/notificaciones`
- "Necesitan tu acción": cards de alerta. **En mobile apilan** (ícono+texto arriba, **botón full-width abajo**), título NO partido en 5 líneas.
- El alert de pago aparece en **gold "PARA HACER"** (no urgente). Los de reunión/diagnóstico en rojo "ACCIÓN URGENTE".
- Botón **"Marcar todas como leídas"**: en mobile/tablet icon-only (no se pisa con el título); en lg, con texto.
- Log "Novedades": filtros Todas/No leídas, búsqueda, marcar leída, eliminar (con Deshacer).

### 4.5 · Mi perfil `/mi-perfil`
- Editor: foto de **portada** + **avatar** (tap abre file picker), bio en 1ª persona, datos de comunidad.
- Card "Completar perfil" **accionable** (lleva campo por campo lo que falta).
- **"Ver vista previa"** ⭐ → abre el **perfil público en una pestaña nueva** (no te saca del editor; debe cargar, no "Autor no encontrado").

### 4.6 · Resto
- **Calendario**: mes con eventos (reuniones/pagos/deadlines), flechas ‹ › tappables, celdas de día.
- **Ayuda**: centro de ayuda / FAQ.
- **Mis datos**: derechos del titular (sin overflow a 320 — era bug).
- **Comprador `/comprador/wallet`** y **Coordinador `/coordinador/equipo`**: tablas → sin overflow de documento (scroll propio).
- **Menú de usuario** (avatar): **Cambiar contraseña** (modal), Cerrar sesión (confirm).

---

## 5 · FASE 4 — Rol Tutor (`/tutor/*`)

> Requiere rol tutor (Lic. Juan Pérez).

| # | Pantalla | Esperado |
|---|---|---|
| 5.1 | `/tutor/dashboard` | "Buenos días, Mariana/…" + KPIs (casos en curso, atrasados, tareas) + charts. |
| 5.2 | `/tutor/casos` | **Kanban** (columnas con scroll-x) + toggle "Lista" (tabla). Filtros. Abrir un caso. |
| 5.3 | `/tutor/casos/:id` | Detalle del caso (scoring IA, evidencias, notas internas, firma). |
| 5.4 | `/tutor/agenda` | Agenda de reuniones. |
| 5.5 | `/tutor/tareas` | Lista de tareas pendientes. |
| 5.6 | `/tutor/certificaciones` (+`/:id`) | Tabla de certificaciones emitidas + detalle. |

---

## 6 · FASE 5 — Cross-cutting (en TODAS las pantallas)

- **Responsive 320/375/768/1024/1280 + landscape:** sin overflow de documento; bottom nav en mobile, sidebar ≥768; nada cortado/superpuesto.
- **Consola sin errores** en cada ruta.
- **Táctil:** controles standalone ≥44px.
- **Flujos e2e (en 375):**
  1. Postulante: `login → mis-certificaciones → detalle → continuar wizard → pagos → pagar primer arancel → ver factura → mi-perfil → ver vista previa`.
  2. Tutor: `login tutor → dashboard → casos → caso detalle → certificaciones → detalle`.
  3. Comprador/público: `directorio → autor → certificado → verificar`.
- **Tutorial / Tour:** desde la bottom nav "Más" o el sidebar, "Tutorial" dispara el recorrido guiado (spotlight + tooltip) — que no se salga del viewport ni quede trabado.
- **Estados vacíos / loading:** skeletons y empty states razonables (no "Autor no encontrado" mientras carga).

---

## 7 · Log de bugs (registrar cada hallazgo)

```
[ID]  Pantalla · Ancho · Rol
Severidad: S1 / S2 / S3 / S4
Pasos: 1) … 2) … 3) …
Esperado: …
Obtenido: …
Screenshot/nota: …
```

**Severidad:**
| | |
|---|---|
| **S1 — Crítico** | flujo roto · pantalla rota · CTA que no funciona · overflow/contenido cortado · error de consola que rompe |
| **S2 — Alto** | overlap, target chico, modal que no scrollea, copy confuso en un paso clave |
| **S3 — Medio** | spacing/jerarquía subóptima en un breakpoint |
| **S4 — Bajo** | pulido fino |

---

## 8 · Reporte final

1. **Tabla de cobertura:** rutas/flujos probados × anchos (✅/⚠️/❌).
2. **Bugs** encontrados, ordenados por severidad (con repro).
3. **Lo que funciona bien** (para no romperlo después).
4. **Veredicto:** "¿El proyecto está listo para demo end-to-end? SÍ / NO" + los 3 bugs más importantes a arreglar primero.

> Si lo corre un agente con permiso de escribir código: además de reportar, **arreglar los S1/S2** que encuentre (cambios chicos y verificados: `tsc` verde + consola limpia + re-test del flujo), y dejar los S3/S4 listados.
