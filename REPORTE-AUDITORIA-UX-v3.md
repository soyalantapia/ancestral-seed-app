# REPORTE DE AUDITORÍA UX v3 — Ancestral Seed

**Fecha:** 28 de mayo 2026 (tercera pasada, focalizada en regresiones del v2)
**Versión:** v3.0 · "regresiones e issues introducidos por los fixes del v2"
**Método:** análisis estático profundo + simulación cognitiva por persona + verificación cruzada de los stores, hooks y componentes NUEVOS del v2
**Recorrido por:** 3 personas (visitante público + postulante Camila + tutora Patricia/Juan)
**Base de auditoría:** commits del v2 — `6f1d70f` (T1+T2) → `3cb0b06` (T3) → `d0a3911` (T4) → `951eb24` (T5)
**Total de hallazgos:** **58** (19 tutor · 21 postulante · 18 público)

> El **v1** y el **v2** quedan como histórico. Esta v3 NO re-audita lo viejo. Solo busca: ¿qué se introdujo con los 46 fixes del v2 que está mal o está medio resuelto?

---

## 1. Resumen ejecutivo

### Sensación general

> Los fixes del v2 cerraron el ~94% de los hallazgos formales del informe anterior, pero **introdujeron 9 regresiones críticas** y un conjunto de inconsistencias residuales que muestran un patrón claro: los stores nuevos (certChecklist, coverByRequest) se aplicaron con éxito en su lugar de origen pero **no se propagaron al resto del UI que consumía el mock estático**. Resultado: dos fuentes de verdad nuevas para los mismos datos, justo lo que el v2 prometía eliminar.
>
> El otro patrón visible es que **algunos fixes son "dead code"** — V2-PUB-07 (noindex) nunca se aplica porque ningún callsite pasa la prop, V2-TUT-13 (filtro tareas persistido) está medio implementado (lo lee solo Dashboard, no TutorTasks), y V2-PUB-06 (links de cláusulas) **rompe en producción** porque ignora `import.meta.env.BASE_URL`.

### Las 9 regresiones críticas (todas Alta)

| # | ID | Problema | Origen | Severidad |
|---|---|---|---|---|
| 1 | `#V3-PUB-01` | **Links a Reglamento PDF rompen en producción** (404 en gh-pages) — `/docs/...` en vez de `/ancestral-seed-app/docs/...` | regresión nueva de V2-PUB-06 | **Crítica** |
| 2 | `#V3-PUB-02` | **noindex es dead code** — ningún callsite pasa `noindex={true}`, el fix V2-PUB-07 nunca corre | regresión inerte de V2-PUB-07 | **Alta** |
| 3 | `#V3-PUB-03` | **Doble Organization JSON-LD en home** — `index.html` static + `Home.tsx` dinámico. El `sameAs` solo está en uno | regresión arquitectural | **Alta** |
| 4 | `#V3-PUB-05` | **Tip iOS recomienda Chrome falsamente** — Chrome iOS también usa WebKit, NO tiene BarcodeDetector | información incorrecta de V2-PUB-02 | **Alta** |
| 5 | `#V3-POS-02` | **`markVisited` al unmount mata el feature** — corre en CUALQUIER navegación intra-dashboard, pisa el snapshot inmediatamente | regresión grave de V2-POS-01 | **Alta** |
| 6 | `#V3-TUT-01` | **TutorDashboard sigue leyendo `mockTutorCases` directo** — no del store. KPIs y card "Pendientes de mi firma" muestran data stale después de cualquier drag | regresión del fix V2-TUT-03 | **Alta** |
| 7 | `#V3-TUT-02` | **NotesDrawer re-hidrata seeds tras borrarlos** — el tutor borra una nota, cierra el drawer, lo reabre y la nota reaparece | bug de V2-TUT-09 | **Alta** |
| 8 | `#V3-TUT-06` | **Sidebar del cert no lee del checklist store** — la barra de progreso sigue mostrando los datos del mock aunque el drawer haya actualizado | gap parcial de V2-TUT-20 | **Alta** |
| 9 | `#V3-POS-04` | **Cover huérfana tras Trash** — al borrar la imagen marcada como portada, el store queda apuntando a un id muerto y el badge desaparece de TODAS las imágenes | bug de V2-POS-06 | **Alta** |

> **Resolver estas 9 + las otras 8 Altas del listado completo cierra el v3 al ~85%.**

### Distribución por flujo

- 🌐 **Público:** 18 (5 críticas — todas del fix de meta tags + Verify + ConfirmDialog)
- 👤 **Postulante:** 21 (4 críticas — markVisited, dedupe NBA, cover huérfana, mock dates stale)
- 🎓 **Tutor:** 19 (6 críticas — incluye nuevos issues arquitecturales tras el fix V2-TUT-03)

### Patrones detectados

1. **Stores nuevos sin propagación completa**: useCertChecklistStore y useCoverByRequestStore se aplicaron en su componente principal pero el resto del UI sigue leyendo del mock. La promesa de "una sola fuente de verdad" del fix V2-TUT-03/V2-TUT-09/V2-TUT-20 es parcial.

2. **Fixes con dead code**: V2-PUB-07 (noindex) y V2-TUT-13 (filtro tareas en TutorTasks) anuncian un contrato que nunca se ejecuta — los callsites no lo usan.

3. **ConfirmDialog tiene 4 issues de a11y**: Enter global ignora foco (rompe expectativa keyboard), no hay focus trap, backdrop tabulable triplica los "Cancelar", id estático colisiona en dialogs concurrentes.

4. **iOS detection rota**: la regex `navigator.platform` no atrapa iPads modernos (que reportan "MacIntel"), y el tip "instalá Chrome" es información técnicamente FALSA (Chrome iOS = WebKit, NO tiene BarcodeDetector).

5. **Reset incompleto del demo**: "Restaurar demo" solo resetea `tutorCases`. Las notas internas, el checklist, el filtro de tareas, las covers y last-visit siguen persistidas — el reviewer ve un demo "a medias".

6. **Cross-account leaks**: ningún store nuevo (certChecklist, coverByRequest, lastVisit) se limpia al logout o al "Eliminar cuenta". Demos compartidos heredan estado.

7. **Mock dates relativos pero estáticos**: `daysAgo(N)` / `hoursAgo(N)` se evalúan UNA VEZ al cargar el módulo. Sesiones largas del demo (>24h sin reload) ven timestamps stale.

---

## 2. Hallazgos detallados

### 🌐 PÚBLICO (18 hallazgos)

#### Críticas y Altas

```
[#V3-PUB-01] [Crítica] — Link a Reglamento PDF en /ayuda rompe en producción
📍 Ubicación: src/pages/Help.tsx:399
👀 Qué vi: href={`/${OFFICIAL_DOCS.reglamentoMarca.path}`} → produce
   "/docs/reglamento-marca-ancestral-seed.pdf". En producción la app vive bajo
   "/ancestral-seed-app/" (vite.config.ts:7). El link resuelve a
   https://soyalantapia.github.io/docs/... → 404.
😖 Por qué molesta: el fix V2-PUB-06 prometía linkear las 4 cláusulas (1.5×2,
   4.6, 5.6+8) al PDF. En prod las 4 dan 404 — el postulante que quiere leer
   contexto formal toca el link, ve "Not found", desconfía del sistema.
🔥 Severidad: Crítica · 🔧 Esfuerzo: Bajo (1 char)
✅ Recomendación: cambiar a
   ${import.meta.env.BASE_URL}${OFFICIAL_DOCS.reglamentoMarca.path}
   (sin slash inicial — BASE_URL ya termina en `/`). Footer.tsx:103 y
   CertificationDetail.tsx:564 ya usan ese patrón correctamente.
🔄 Regresión nueva de V2-PUB-06
```

```
[#V3-PUB-02] [Alta] — `noindex` es dead code: el fix V2-PUB-07 nunca corre
📍 Ubicación: src/components/features/PageMeta.tsx:78 + callsites
👀 Qué vi: `grep -rn "noindex" src/` muestra que NINGÚN callsite pasa
   `noindex={true}` desde una ruta privada. El parámetro queda en default
   `false`. Las rutas `/inicio`, `/postulante/*`, `/tutor/*` reciben el OG
   image rico + JSON-LD igual que las públicas.
😖 Por qué molesta: el fix prometía "preview mínimo en rutas privadas" para
   evitar que pegar `/inicio` por WhatsApp sugiriera contenido público.
   Esa lógica nunca se invoca. Code muerto que aumenta el ruido del archivo.
🔥 Severidad: Alta · 🔧 Esfuerzo: Medio
✅ Recomendación: pasar `noindex` desde DashboardLayout y TutorLayout a las
   páginas hijas, o aceptar que TODO el sitio tiene OG rico y eliminar el feature.
🔄 Regresión inerte de V2-PUB-07
```

```
[#V3-PUB-03] [Alta] — Doble Organization JSON-LD en home (sameAs solo en uno)
📍 Ubicación: index.html:78-101 + src/pages/Home.tsx:37-44
👀 Qué vi: el home page emite DOS schemas Organization distintos:
   - estático en index.html (con address, sameAs, email, telephone)
   - dinámico desde PageMeta jsonLd={{...}} con solo name/description/url
   Cuando react-helmet inyecta el segundo, Google ve datos conflictivos.
   El nuevo sameAs (V2-PUB-08) está solo en el estático.
😖 Por qué molesta: knowledge panel de Google puede priorizar el JSON-LD slim
   de Home.tsx que NO tiene sameAs → deteriora la señal de autenticidad que
   V2-PUB-08 quería agregar.
🔥 Severidad: Alta · 🔧 Esfuerzo: Bajo
✅ Recomendación: eliminar el `jsonLd` de Home.tsx (el static gana en
   completitud) o consolidar ambos en una sola fuente.
🔄 Regresión arquitectural pre-existente, agravada por V2-PUB-08
```

```
[#V3-PUB-04] [Alta] — Tip iOS no aparece en iPads (navigator.platform === "MacIntel")
📍 Ubicación: src/pages/Verify.tsx:585-587
👀 Qué vi: la regex /^iPhone|iPad|iPod/ chequea navigator.platform. Desde
   iPadOS 13 (2019), iPads reportan "MacIntel" por decisión de Apple. El tip
   se muestra solo en iPhones e iPads pre-2019.
😖 Por qué molesta: la audiencia más relevante para el tip (iPad-only sin
   Safari escaneo) no lo recibe.
🔥 Severidad: Alta · 🔧 Esfuerzo: Bajo
✅ Recomendación: usar
   /iPad|iPhone|iPod/.test(navigator.userAgent) ||
   (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
🔄 Bug del fix V2-PUB-02
```

```
[#V3-PUB-05] [Alta] — Tip "instalá Chrome iOS" es técnicamente FALSO
📍 Ubicación: src/pages/Verify.tsx:589-590
👀 Qué vi: Chrome para iOS usa WebKit (policy de App Store) → comparte el
   motor de Safari → NO tiene BarcodeDetector. Instalar Chrome iOS NO
   resuelve el problema. El tip lleva al user a un dead-end downloading otro
   browser para nada.
😖 Por qué molesta: el fix v2 buscaba reducir frustración y la AMPLIFICA.
   Damaged credibility + tiempo perdido del visitante.
🔥 Severidad: Alta · 🔧 Esfuerzo: Bajo
✅ Recomendación: cambiar el tip a "ingresá el hash a mano" (que SÍ funciona)
   o sugerir uso desde Android/desktop. No mencionar Chrome iOS.
🔄 Información incorrecta nueva, agregada por V2-PUB-02
```

#### Medias (a11y del ConfirmDialog + UI)

| ID | Problema | Severidad | Esfuerzo |
|---|---|---|---|
| `#V3-PUB-06` | Glosario buscable no normaliza acentos — "auditoria" no matchea "auditoría" | Media | Bajo |
| `#V3-PUB-07` | sameAs duplica handle (twitter.com + x.com es el mismo) | Media | Bajo |
| `#V3-PUB-08` | Glow elliptical del OG image opaca el card blanco del mockup | Media | Bajo |
| `#V3-PUB-09` | Botón unmute (24×32px) bajo touch target mínimo WCAG | Media | Bajo |
| `#V3-PUB-10` | ConfirmDialog: Enter global confirma aunque el foco esté en Cancel | Media | Bajo |
| `#V3-PUB-11` | ConfirmDialog: sin focus trap, Tab se escapa al body | Media | Medio |
| `#V3-PUB-12` | ConfirmDialog: backdrop button + close-X + Cancel = 3 cancels para SR | Media | Bajo |
| `#V3-PUB-13` | ConfirmDialog: cleanup `body.style.overflow=''` borra lock previo | Media | Bajo |

#### Bajas (polish)

| ID | Problema | Severidad | Esfuerzo |
|---|---|---|---|
| `#V3-PUB-14` | Copy "tampoco vas a poder subir foto" presupone acción inexistente | Baja | Bajo |
| `#V3-PUB-15` | Copy "trabajo desde inspiración cultural" no matchea texto del Reglamento | Baja | Bajo |
| `#V3-PUB-16` | `pending` italic contradice el copy nuevo V2-PUB-03 | Baja | Bajo |
| `#V3-PUB-17` | og-image sin cache-buster — WhatsApp cachea 7 días | Baja | Bajo |
| `#V3-PUB-18` | twitter:card dinámico conflicta con el estático del index.html | Baja | Bajo |

---

### 👤 POSTULANTE (21 hallazgos)

#### Críticas y Altas

```
[#V3-POS-02] [Alta] — markVisited al unmount mata "Lo nuevo desde tu última visita"
📍 Ubicación: src/pages/DashboardHome.tsx:273-277, src/store/lastVisit.ts:24
👀 Qué vi: el cleanup corre cada vez que el postulante navega FUERA del
   DashboardHome (a /mis-certificaciones, /pagos, etc), pisando lastVisitAt
   con `now`. Al volver, el useState lazy initializer captura el snapshot
   recién actualizado → newEventsSinceLastVisit siempre vacío después de la
   PRIMERA visita de la sesión.
😖 Por qué molesta: la feature SOLO funciona en la PRIMERA entrada después
   de un refresh full-page. Cualquier sesión natural (Camila navega a "Mis
   certificaciones" y vuelve) pierde el bloque para el resto de la sesión.
   Niega exactamente el propósito del fix V2-POS-01.
🔥 Severidad: Alta · 🔧 Esfuerzo: Medio
✅ Recomendación: marcar lastVisited solo en logout o al cerrar la pestaña
   (visibilitychange + 5min idle threshold), no en cada unmount.
🔄 Regresión grave del fix V2-POS-01
```

```
[#V3-POS-04] [Alta] — Cover huérfana tras Trash: badge "★ Portada" desaparece
📍 Ubicación: src/pages/CertificationRequest.tsx:837-840, 1108-1149,
   src/store/coverByRequest.ts
👀 Qué vi: cuando el postulante borra desde el Trash una imagen que era cover
   (override del store), setItems la quita pero NUNCA se llama
   clearCover(request.id). El store mantiene coverOverride apuntando a un id
   huérfano. currentCoverId = coverOverride ?? firstImageId queda con el id
   muerto (truthy) → `currentCoverId === it.id` nunca matchea → ninguna
   imagen muestra el badge.
😖 Por qué molesta: la portada efectiva visualmente queda en limbo. El
   postulante asume que no hay portada y vuelve a marcar — y si "deshace" la
   eliminación, el store sigue apuntando al id viejo.
🔥 Severidad: Alta · 🔧 Esfuerzo: Bajo
✅ Recomendación: en onClick del Trash, si `it.id === currentCoverId`,
   llamar clearCover(request.id) antes del filter. En el Deshacer, también
   re-setear cover si era ese id.
🔄 Bug introducido por V2-POS-06
```

```
[#V3-POS-15] [Alta] — daysAgo()/hoursAgo() stale si el demo dura >24h sin reload
📍 Ubicación: src/services/mocks/data.ts:39-43, 421-423
👀 Qué vi: los helpers de timestamp relativo se llaman INLINE en el array
   de history, no como functions referenciadas. mockCertificationRequests se
   construye en module-eval. Si el demo se ejecuta lunes y el reviewer abre
   el dashboard miércoles sin recargar, h-008 sigue diciendo "hace 8h"
   cuando son 56h.
😖 Por qué molesta: el propósito del fix V2-POS-01 ("siempre tenga algo
   nuevo") falla en sesiones largas. En producción no aplica (history viene
   del backend) — pero en demo institucional, el reviewer puede ver
   inconsistencias temporales si la pestaña está colgada.
🔥 Severidad: Alta · 🔧 Esfuerzo: Bajo
✅ Recomendación: mover daysAgo/hoursAgo a un getter computado en runtime
   (function que retorna ISO al llamar), o re-evaluar el mock al focus de
   la pestaña.
🔄 Bug introducido por V2-POS-01
```

```
[#V3-POS-01] [Alta] — Dedupe NBA descarta pagos legítimos de OTRAS solicitudes
📍 Ubicación: src/pages/DashboardHome.tsx:386-398
👀 Qué vi: el filtro e.kind !== 'payment' se aplica cuando
   nextBestAction?.icon === CreditCard, asumiendo que el único pago en
   RecentActivity es el mismo que el NBA. Si la postulante tiene 2 pagos
   vencidos en DISTINTAS solicitudes, el NBA toma el más urgente y el
   RecentActivitySummary OCULTA TODOS los eventos 'payment' — incluyendo el
   pago del OTRO request que el postulante no está viendo.
😖 Por qué molesta: Camila no se entera de que el segundo pago vencido
   existe; el dedupe está pensado para "mismo request" pero filtra
   cross-request.
🔥 Severidad: Alta · 🔧 Esfuerzo: Medio
✅ Recomendación: filtrar solo eventos 'payment' de requestId ===
   nextBestAction.requestId (necesita exponer requestId en el NBA, hoy no
   existe).
🔄 Bug introducido por V2-POS-02
```

#### Medias (cross-account leaks + a11y + edge cases)

| ID | Problema | Severidad | Esfuerzo |
|---|---|---|---|
| `#V3-POS-03` | React 19 StrictMode dispara cleanup doble → pisa snapshot en dev | Media | Bajo |
| `#V3-POS-05` | Logout/Eliminar cuenta no limpian stores nuevos — leak cross-account | Media | Medio |
| `#V3-POS-06` | CheckoutModal: cascade blur → todos los errores aunque user no tocó | Media | Bajo |
| `#V3-POS-07` | handleSubmitTransfer no tiene field validation feedback (vs Card tab) | Media | Medio |
| `#V3-POS-08` | Dirty MyProfile: edge case avatar blob→blob después de cambio | Media | Bajo |
| `#V3-POS-09` | MyProfile race: si `user` es null en mount, `initial` queda vacío | Media | Bajo |
| `#V3-POS-11` | CheckoutModal FieldRow sin aria-describedby vinculando error con input | Media | Bajo |
| `#V3-POS-12` | ConfirmDialog id estático `confirm-dialog-title` colisiona en dialogs concurrentes | Media | Bajo |
| `#V3-POS-13` | Dynamic import de @/lib/pdf sin try/catch → toast "Generando…" colgado si falla | Media | Bajo |
| `#V3-POS-16` | Eventos "nuevos" solo en req-001; req-002 parece "muerto" desde dashboard | Media | Bajo |
| `#V3-POS-17` | Filter "Avances" agrupa con label idéntico pero color distinto sin leyenda → SR confunde | Media | Bajo |
| `#V3-POS-20` | "Restaurar demo" del tutor no toca coverByRequest/lastVisit del postulante | Media | Medio |

#### Bajas

| ID | Problema | Severidad | Esfuerzo |
|---|---|---|---|
| `#V3-POS-10` | Stepper mobile: title attribute inútil sin hover/touch | Baja | Bajo |
| `#V3-POS-14` | Notifications delete sin "Deshacer" (inconsistencia con Evidencias) | Baja | Bajo |
| `#V3-POS-18` | Trash en notificaciones visible siempre en mobile (md:opacity-0 no aplica) | Baja | Bajo |
| `#V3-POS-19` | useAutoStartTour: race teórica si showResumeDialog cambia rápido durante el setTimeout | Baja | — |
| `#V3-POS-21` | productName.length >= 3 excluye nombres cortos legítimos guaraní/mapuche | Baja | Bajo |

---

### 🎓 TUTOR (19 hallazgos)

#### Críticas y Altas

```
[#V3-TUT-01] [Alta] — TutorDashboard sigue leyendo mockTutorCases directo
📍 Ubicación: src/pages/tutor/TutorDashboard.tsx:28-30, 70
👀 Qué vi: el fix V2-TUT-03 dice que el kanban + el caso detail unificaron
   en useTutorCasesStore. Pero el Dashboard sigue leyendo mockTutorCases
   estático en línea 70:
     const cases = mockTutorCases.filter((c) => c.tutorId === mockTutor.id)
   Resultado: el tutor mueve un caso en el kanban (store) → el contador del
   dashboard ("Tenés N casos en curso", "N atrasados"), los charts
   (riskCounts, certPie) y la card "Pendientes de mi firma" siguen mostrando
   el state mock anterior.
😖 Por qué molesta: el v2 prometía "una sola fuente de verdad". Quedamos
   con TRES (mock + store + state local efímero). Regresión silenciosa
   visible solo cuando el tutor cambia algo y vuelve al dashboard.
🔥 Severidad: Alta · 🔧 Esfuerzo: Bajo
✅ Recomendación: cambiar a
   const cases = useTutorCasesStore((s) => s.cases).filter(...)
🔄 Gap del fix V2-TUT-03
```

```
[#V3-TUT-02] [Alta] — NotesDrawer re-hidrata seeds tras borrarlos manualmente
📍 Ubicación: src/pages/tutor/TutorCertificationDetail.tsx:1431-1446
👀 Qué vi: la condición de hidratación es `if (notes.length === 0)` dentro
   de un useEffect([certId]). Como el drawer se monta/desmonta con
   <AnimatePresence>, cada vez que el tutor reabre el drawer el useEffect
   corre. Si el tutor:
     1. Abre drawer del cert CE-001 → ve 3 seeds
     2. Borra las 3 (cierra drawer)
     3. Reabre el drawer
   → notes.length === 0 es true otra vez → el bucle re-inyecta los seeds.
   Las eliminaciones no son persistentes. Encima addNoteToStore pisa el `at`
   original con `new Date().toISOString()`.
😖 Por qué molesta: el fix V2-TUT-09 prometía persistencia. Las notas
   borradas reaparecen como zombies, con timestamps "ahora" en vez de los
   reales del seed.
🔥 Severidad: Alta · 🔧 Esfuerzo: Bajo
✅ Recomendación: un sentinel persistido tipo
   useCertChecklistStore-style `seededByCert: Record<string, true>` que
   marque la primera hidratación independiente del notes.length.
🔄 Bug grave introducido por V2-TUT-09
```

```
[#V3-TUT-03] [Alta] — validateCaseAdvance solo valida la PRÓXIMA etapa, no las intermedias del salto
📍 Ubicación: src/pages/tutor/TutorCases.tsx:242-260, src/lib/caseValidation.ts:135-162
👀 Qué vi: cuando el tutor draguea de `postulado` (idx 0) a `evaluacion`
   (idx 5), el código corre validateCaseAdvance(moving, target, …) que
   internamente solo aplica las reglas de la caseData.stage actual
   (postulado → revision-inicial). Si pasa, se muestra el ConfirmDialog de
   "Saltar etapas" y se aplica el move directo. Las reglas de
   elegible→diagnostico, diagnostico→auditoria, evaluacion→certificacion
   nunca se evalúan.
😖 Por qué molesta: el "atajo" del kanban sigue ganando al workflow formal
   — precisamente lo que el fix SB6 quería cerrar. El ConfirmDialog
   "saltar etapas" tampoco protege porque el tutor puede confirmarlo y
   seguir bypaseando validaciones.
🔥 Severidad: Alta · 🔧 Esfuerzo: Medio
✅ Recomendación: en validateCaseAdvance iterar
   `for i from fromIdx to toIdx-1` simulando el avance etapa por etapa y
   devolver el primer bloqueo encontrado.
🔄 Gap arquitectural pre-existente expuesto por V2-TUT-04 (vista Lista con
   menú "Mover a") y V2-TUT-06 (confirm salto)
```

```
[#V3-TUT-04] [Alta] — TutorTasks no usa el filtro persistido del store (fix V2-TUT-13 medio aplicado)
📍 Ubicación: src/pages/tutor/TutorTasks.tsx:73
👀 Qué vi: el comentario en store/tutorTasks.ts:24-28 promete que el filtro
   "persiste con el resto del store para que el tutor que filtra por
   Urgentes en el dashboard siga viendo Urgentes cuando entra a /tutor/tareas".
   Dashboard sí lee del store. Pero TutorTasks tiene
     const [filter, setFilter] = useState<FilterKey>('all')
   totalmente local. Encima, los tipos no coinciden:
     TutorTasks FilterKey = 'all'|'pending'|'done'|TutorTaskPriority
     Store TaskFilter = 'all'|'urgent'|'today'|'this_week'
😖 Por qué molesta: promesa rota — el filtro NO persiste entre vistas. Lo
   peor: el store tiene un contrato y TutorTasks tiene otro distinto.
🔥 Severidad: Alta · 🔧 Esfuerzo: Medio
✅ Recomendación: o bien unificar los tipos y leer/escribir del store en
   TutorTasks, o bien aclarar en el store qué dos vistas comparten el filtro
   y NO anunciar el contrato más amplio.
🔄 Implementación parcial del fix V2-TUT-13
```

```
[#V3-TUT-05] [Alta] — ConfirmDialog captura Enter global e ignora el botón con foco
📍 Ubicación: src/components/features/ConfirmDialog.tsx:55-70
👀 Qué vi: el listener de keydown se agrega a document, así que Enter SIEMPRE
   dispara onConfirm, sin importar dónde esté el foco. Si el tutor tabea
   hasta el botón "Volver al kanban" y pulsa Enter (esperando cancelar), el
   handler global confirma el salto. En un ConfirmDialog con variant="danger"
   (V2-TUT-06: saltar etapas, V2-TUT-14: restaurar demo) esto es destrucción
   accidental.
😖 Por qué molesta: viola expectativa de keyboard a11y. Acciones destructivas
   se confirman cuando el user explícitamente focó Cancel.
🔥 Severidad: Alta · 🔧 Esfuerzo: Bajo
✅ Recomendación: o quitar el handler de Enter (el botón confirm tiene focus
   por default, Space funciona), o detectar
   `document.activeElement === confirmRef.current` antes de invocar onConfirm.
🔄 Bug introducido por el componente nuevo ConfirmDialog
```

```
[#V3-TUT-06] [Alta] — Sidebar del cert emitido sigue mostrando contadores del mock
📍 Ubicación: src/pages/tutor/TutorCertificationDetail.tsx:150-156, 255-256
👀 Qué vi: el fix V2-TUT-20 persistió las mutaciones del checklist en
   useCertChecklistStore. Pero la sidebar "Gestión del expediente → Checklist"
   sigue leyendo:
     const checklistData = getChecklistByCert(cert.id)        // mock estático
     const checklistTotal = checklistData.reduce(...)
     const checklistDone = checklistData.reduce(...)
   El tutor abre el drawer, marca todos los ítems, cierra el drawer → barra
   de progreso de la sidebar sigue mostrando "3/12" en vez de "12/12".
😖 Por qué molesta: el bug que el fix prometía resolver (persistencia que
   se ve) queda visible solo dentro del drawer abierto. El indicador externo
   miente.
🔥 Severidad: Alta · 🔧 Esfuerzo: Bajo
✅ Recomendación: derivar checklistDone/Total de
   useCertChecklistStore((s) => s.byCert[cert.id]) con fallback al mock.
🔄 Gap parcial del fix V2-TUT-20
```

#### Medias

| ID | Problema | Severidad | Esfuerzo |
|---|---|---|---|
| `#V3-TUT-07` | pointerStart queda con coords viejas tras drag exitoso | Media | Bajo |
| `#V3-TUT-08` | Descargas de evidencias del cert siguen siendo `.txt` placeholder | Media | Bajo |
| `#V3-TUT-09` | "Restaurar demo" solo resetea cases — no notas, checklist, tareas ni cover | Media | Bajo |
| `#V3-TUT-10` | Identidad del tutor inconsistente: 3 hardcoded distintos en notas/cert/assign | Media | Bajo |
| `#V3-TUT-11` | `signed` state en EvaluacionTab es useState local — se pierde al cambiar de tab | Media | Medio |
| `#V3-TUT-12` | officialCount = mensajes.length pero las ChatBubbles son JSX hardcoded → desincronizables | Media | Bajo |
| `#V3-TUT-13` | Stepper de workflow del cert: SR solo escuchan "1, 2, 3" sin labels en mobile | Media | Bajo |
| `#V3-TUT-14` | Dropdown ListRowMenu puede quedar clipped por `overflow-hidden` de la table | Media | Medio |

#### Bajas

| ID | Problema | Severidad | Esfuerzo |
|---|---|---|---|
| `#V3-TUT-15` | Backdrop button del ConfirmDialog rompe el orden de tab | Baja | Bajo |
| `#V3-TUT-16` | Tab activa del expediente queda en history (no usa replace) | Baja | Bajo |
| `#V3-TUT-17` | useEffect del ConfirmDialog re-ataca listener en cada render del padre | Baja | Bajo |
| `#V3-TUT-18` | Race teórica entre hydrate del ChecklistDrawer y primer click | Baja | — |
| `#V3-TUT-19` | Inconsistencia: drag pide confirm salto, "Avanzar etapa" del detail no | Baja | Medio |
| `#V3-RES-01` | V2-TUT-07 quitó deltas del cert pero TutorMetricsCard sigue con `0.2` hardcoded | Baja | Bajo |

---

## 3. Matriz Impacto × Esfuerzo

> **Convención:** Quick win ⚡ = severidad Alta/Crítica + esfuerzo Bajo

### Quick wins prioritarios (15)

| # | ID | Severidad | Esfuerzo | Impacto del fix |
|---|---|---|---|---|
| 1 | `#V3-PUB-01` | Crítica | Bajo | Restaura los 4 links del Reglamento en producción |
| 2 | `#V3-TUT-01` | Alta | Bajo | TutorDashboard refleja drag/drop del kanban |
| 3 | `#V3-TUT-02` | Alta | Bajo | Notas borradas no reaparecen |
| 4 | `#V3-TUT-06` | Alta | Bajo | Sidebar checklist refleja el drawer |
| 5 | `#V3-POS-04` | Alta | Bajo | Cover no queda huérfana tras Trash |
| 6 | `#V3-POS-15` | Alta | Bajo | Mock dates re-evaluadas en runtime |
| 7 | `#V3-PUB-03` | Alta | Bajo | Una sola Organization JSON-LD |
| 8 | `#V3-PUB-04` | Alta | Bajo | Tip iOS aparece también en iPads |
| 9 | `#V3-PUB-05` | Alta | Bajo | Tip iOS deja de recomendar algo falso |
| 10 | `#V3-TUT-05` | Alta | Bajo | ConfirmDialog Enter respeta el foco |
| 11 | `#V3-PUB-10` | Media | Bajo | (mismo issue del 10, surface PUB) |
| 12 | `#V3-PUB-06` | Media | Bajo | Glosario buscable normaliza acentos |
| 13 | `#V3-TUT-09` | Media | Bajo | "Restaurar demo" limpia todos los stores |
| 14 | `#V3-POS-17` | Media | Bajo | Avances con label distinto, no solo color |
| 15 | `#V3-TUT-08` | Media | Bajo | Descargas de evidencias dejan de ser .txt |

### Esfuerzo medio (cierre completo del v3)

| # | ID | Severidad | Esfuerzo | Comentario |
|---|---|---|---|---|
| 16 | `#V3-PUB-02` | Alta | Medio | Aplicar `noindex` desde DashboardLayout + TutorLayout |
| 17 | `#V3-POS-02` | Alta | Medio | Refactor de markVisited (visibilitychange + idle) |
| 18 | `#V3-POS-01` | Alta | Medio | Exponer requestId en NBA + filter cross-request |
| 19 | `#V3-TUT-03` | Alta | Medio | Validar todas las etapas intermedias en saltos |
| 20 | `#V3-TUT-04` | Alta | Medio | Unificar tipos y migrar TutorTasks al store |
| 21 | `#V3-POS-05` | Media | Medio | `clearAllPersistedStores()` en logout/delete |
| 22 | `#V3-PUB-11` | Media | Medio | Focus trap real en ConfirmDialog |

---

## 4. Comparativa v1 → v2 → v3

| Métrica | v1 | v2 | v3 |
|---|---|---|---|
| Total hallazgos | 111 | 49 | 58 |
| Críticas (Alta/Crítica) | ~30 | 5 (top) + ~13 Altas | **9 críticas + 8 Altas** |
| Quick wins ⚡ | ~30 | 18 | 15 |
| Cobertura del repo auditada | 100% | 100% | Solo lo nuevo del v2 |
| Patrón principal | Mock data + microcopy + flow rotos | Coverage parcial de fixes | Stores nuevos sin propagación + dead code |

> **Insight clave:** la v3 NO es "el v2 falló". El v2 cerró ~94% de los issues del v1 con éxito. Lo que la v3 detecta es que **algunos fixes introdujeron nuevos issues** (regresiones reales) y otros **están medio implementados** (dead code o gap parcial). Es señal natural de iteración rápida: la solución de un problema descubre otros.

---

## 5. Recomendaciones por área

### Stores y arquitectura (lo más urgente)

- **useTutorCasesStore**: propagar a TutorDashboard (V3-TUT-01)
- **useCertChecklistStore**: propagar a la sidebar de progreso (V3-TUT-06)
- **useInternalNotesStore**: agregar sentinel `seededByCert` (V3-TUT-02)
- **useCoverByRequestStore**: hook con cleanup en Trash (V3-POS-04)
- **clearAllPersistedStores()** helper: invocar en logout, delete-account y "Restaurar demo" (V3-POS-05, V3-TUT-09, V3-POS-20)

### Componente ConfirmDialog (necesita refactor)

- Enter solo dispara confirm si el foco está en el botón confirm (V3-TUT-05, V3-PUB-10)
- Focus trap real con `useFocusTrap` o `focus-trap-react` (V3-PUB-11)
- Backdrop como `<div role="presentation" onClick>` no como button (V3-PUB-12)
- Capturar y restaurar `body.style.overflow` original (V3-PUB-13)
- `useId()` para ids únicos (V3-POS-12)
- `useCallback` para handlers (V3-TUT-17)

### Meta tags y SEO

- Aplicar `noindex` desde Layouts privados (V3-PUB-02) — o eliminar el feature
- Consolidar Organization JSON-LD a un solo lugar (V3-PUB-03)
- Validar handles de redes antes de listar en `sameAs` (V3-PUB-07)
- Cache-buster en og-image URL al regenerar (V3-PUB-17)

### iOS / Verify

- Detección de iPad correcta con `navigator.userAgent` + `maxTouchPoints` (V3-PUB-04)
- Tip iOS sin mencionar Chrome (que no soluciona nada) (V3-PUB-05)
- Copy "tampoco subir foto" → "El escaneo y la lectura de foto requieren..." (V3-PUB-14)

### Mock data del demo

- `daysAgo()`/`hoursAgo()` como getters runtime (V3-POS-15)
- Agregar history events relativos también a req-002 (V3-POS-16)
- Validar handles `@ancestralseed` antes de usarlos en SEO (V3-PUB-07)

---

## Apéndice — Lo que SÍ está MUY bien después del v2

A pesar de los 58 hallazgos nuevos, vale destacar lo que el v2 cerró sólidamente y donde el v3 NO encontró regresiones:

✅ **TAB_IDS con 'notas'** (V2-TUT-02) — funciona impecable, los shareable links no rompen
✅ **EvidenciasTab cover con badge** — la UX visual de "★ Portada" es clara (a pesar del bug del Trash)
✅ **OG image con mockup de cert** — la idea es buena, queda algo de polish del glow
✅ **CheckoutModal touched-per-field** — la UX es correcta excepto el cascade blur edge case
✅ **TutorCaseDetail leyendo del store** — el corazón del fix V2-TUT-03 funciona, falta propagar al Dashboard
✅ **Glosario con buscador** — la search funciona, falta normalizar acentos
✅ **ConfirmDialog visual + microcopy** — el diseño está bien, los issues son a11y / arquitecturales
✅ **Cláusulas linkeadas al PDF** — la intención es correcta, falla solo por el slash en producción
✅ **Stepper móvil con aria-label** — los SR sí leen contexto en cada dot
✅ **Vista Lista del kanban con menú** — funcional, solo el clip del dropdown necesita ajuste
✅ **Restaurar demo button visible** — el principio es correcto, falta scope completo

---

## Cómo se construyó este reporte v3

- 3 agentes Explore en paralelo cubriendo los 3 flujos
- Foco exclusivo en código modificado/creado por las Tandas 1-5 del v2 (commits `6f1d70f`, `3cb0b06`, `d0a3911`, `951eb24`)
- Verificación cruzada por persona (público, postulante Camila, tutora Patricia/Juan)
- Análisis estático profundo + simulación cognitiva
- Cruzado contra el v1 y v2 para detectar regresiones vs issues genuinamente nuevos

**Output:** 58 hallazgos clasificados por flow + severidad + esfuerzo, con ubicación exacta archivo:línea + sugerencia accionable.
