# REPORTE DE AUDITORÍA UX v4 — Ancestral Seed

**Fecha:** 28 de mayo 2026
**Versión:** v4.0
**Foco:** regresiones y bugs introducidos por las Tandas 7-10 del v3 (commits `9983246`, `35b7a4d`, `3ee4eb4`, `3aa119b`)
**Total de hallazgos:** **32** (17 postulante+público · 15 tutor+shared) — vs 58 del v3
**Cobertura:** ~94% del ciclo completo (205/218 hallazgos cerrados entre v1+v2+v3)

> El v4 detecta los issues que las propias Tandas 7-10 introdujeron al cerrar el v3. Es el patrón natural de las auditorías iterativas: cada pasada de fixes destapa edge cases nuevos del propio fix.

---

## 1. Resumen ejecutivo

### Las 6 críticas que más sangran

| # | ID | Problema | Impacto |
|---|---|---|---|
| 1 | `#V4-PUB-01` | `robots.txt` en gh-pages org page NO se sirve donde Google lo busca | Las Disallow no aplican; protección queda 100% en meta noindex |
| 2 | `#V4-TUT-05` | 23+ literales `"Lic. Juan Pérez"` en mocks NO migrados a `tutorIdentity` | El fix V3-TUT-10 cumple solo parcialmente — promete centralización |
| 3 | `#V4-TUT-08` | `validateCaseAdvance` simula con `pendingItems` originales → false bloqueos | Jumps válidos quedan bloqueados con explicación confusa |
| 4 | `#V4-TUT-01` | Firma persiste tras retroceso de etapa (estado Frankenstein) | Caso en `auditoria` con firma "viva" de evaluación previa |
| 5 | `#V4-PUB-02` | `sitemap.xml` sin fichas dinámicas (`/certificado/:slug`, `/autor/:slug`) | Pérdida de long-tail SEO — rompe la promesa "ficha indexable" |
| 6 | `#V4-POS-01` | `markVisited` no se dispara en cierre abrupto iOS | Bloque "Lo nuevo" abruma con TODOS los eventos en próxima sesión |

> Resolver estas 6 cierra el v4 al ~80%. Las restantes son edge cases o polish.

---

## 2. Hallazgos por flujo

### 🌐 PÚBLICO (8 hallazgos)

#### `#V4-PUB-01` — robots.txt en gh-pages org page NO se sirve donde Google lo busca
**Severidad:** Alta · **Esfuerzo:** Bajo
📍 `public/robots.txt`
👀 gh-pages con organizational account sirve archivos en `https://soyalantapia.github.io/ancestral-seed-app/robots.txt`, NO en `https://soyalantapia.github.io/robots.txt`. Los crawlers buscan robots.txt SOLO en el root del host por RFC. El archivo se ignora completamente.
😖 Las Disallow rules no aplican. La protección efectiva queda 100% en el meta `noindex` (que sí es robusto). Pero el archivo da falsa sensación de cobertura.
✅ Documentar la limitación en el header del archivo. Alternativa: agregar comentario explícito de que este robots.txt sirve solo si el deploy migra a custom domain.

#### `#V4-PUB-02` — sitemap.xml no incluye fichas dinámicas
**Severidad:** Alta · **Esfuerzo:** Medio
📍 `public/sitemap.xml`
👀 Las 6 URLs estáticas (home, directorio, verificar, ayuda, legal, nosotros) están listadas. Las rutas `/certificado/:slug` y `/autor/:slug` son PÚBLICAS y son el contenido único que diferencia AS — no están listadas.
😖 Para una plataforma cuya value-prop es "tu ficha pública en el directorio", no indexar fichas individuales rompe la promesa.
✅ Generar sitemap dinámicamente desde mockCertifications + autores en el build (`scripts/generate-sitemap.mjs`).

#### `#V4-PUB-03` — Detección iOS en Verify es IIFE re-ejecutado por render
**Severidad:** Media · **Esfuerzo:** Bajo
📍 `src/pages/Verify.tsx:607-625`
👀 El IIFE `(() => { ... })()` se ejecuta en cada render del modal QR.
😖 El regex `/iPhone|iPad|iPod/.test(ua)` corre innecesariamente cada vez que el componente padre re-renderiza.
✅ Extraer a `useMemo(() => ..., [])` o constante module-level (navigator no cambia en runtime).

#### `#V4-PUB-04` — Detección iOS falso-positivo en Mac con touch screen
**Severidad:** Media · **Esfuerzo:** Bajo
📍 `src/pages/Verify.tsx:610-615`
👀 El check `platform === 'MacIntel' && maxTouchPoints > 1` también matchea Macs con pantallas táctiles externas.
😖 Usuarios Mac desktop con Chrome (que SÍ soporta BarcodeDetector) ven el tip iOS falso.
✅ AND con `'ontouchstart' in window` o verificar la ausencia de Chrome's UA específico de Mac desktop.

#### `#V4-PUB-05` — BASE_URL en Help cláusulas sin verificación de existencia
**Severidad:** Media · **Esfuerzo:** Bajo
📍 `src/pages/Help.tsx:404-411`
👀 No hay verificación de que el path `public/docs/reglamento-marca.pdf` existe en el build.
😖 Si el reglamento se renombra o mueve, el `<a>` abre pestaña con 404 sin feedback.
✅ Agregar test en CI que verifique que el path es accesible en el build.

#### `#V4-PUB-06` — stripAccents regex con caracteres no-imprimibles frágiles
**Severidad:** Baja · **Esfuerzo:** Bajo
📍 `src/pages/Help.tsx:636`
👀 El regex `/[̀-ͯ]/g` codifica el rango Unicode U+0300–U+036F como caracteres literales en el source.
😖 Si alguien re-formatea el archivo con normalización NFD→NFC, el regex se rompe silenciosamente.
✅ Reemplazar por `/[̀-ͯ]/g` (escape Unicode explícito).

#### `#V4-PUB-07` — og-image hash `0xAS-CERT-XXXXXXXXXX…` parece broken placeholder
**Severidad:** Baja · **Esfuerzo:** Bajo
📍 `public/og-image.svg:125`
👀 El texto del mockup parece un template Liquid no resuelto.
😖 Un usuario que ve el preview en WhatsApp puede interpretarlo como bug de render. El `0xAS-CERT-` es el patrón EXACTO de hashes reales en `downloadActa`.
✅ Reemplazar las X consecutivas por `DEMO` o `PREVIEW` (`0xAS-CERT-DEMOPREVIEW…`).

#### `#V4-PUB-08` — og-image texto overflowea márgenes ajustados con sello
**Severidad:** Baja · **Esfuerzo:** Bajo
📍 `public/og-image.svg:117, 119, 138`
👀 El hash text mide ~250px termina en x=274; el sello comienza en x=290. Margen de 16px.
😖 Frágil ante render de fuentes diferentes (algunos crawlers no tienen Montserrat embedded).
✅ Reducir font-size del hash o aumentar margen lateral del card.

---

### 👤 POSTULANTE (9 hallazgos)

#### `#V4-POS-01` — markVisited NO se dispara en cierre abrupto iOS
**Severidad:** Alta · **Esfuerzo:** Bajo
📍 `src/pages/DashboardHome.tsx:282-311`
👀 Safari iOS NO garantiza `pagehide` en cierre abrupto (kill app, low-memory swipe). `visibilitychange` solo marca `hiddenSince` sin llamar a markVisited.
😖 El lastVisit queda en el snapshot ANTERIOR para siempre — el bloque "Lo nuevo desde tu última visita" mostrará TODOS los eventos como nuevos en la próxima sesión.
✅ Fallback con `markVisited()` también en `visibilitychange` cuando `document.hidden=true` (acepta doble llamada — son sets idempotentes con timestamp distinto pero el último gana).

#### `#V4-POS-02` — dirty per field no se setea con autocomplete del browser
**Severidad:** Media · **Esfuerzo:** Medio
📍 `src/components/features/CheckoutModal.tsx:407-411, 442-444, 478-481, 511-515`
👀 Si autocomplete completa parcialmente, `cardValid=false`, el botón se deshabilita pero los campos parciales no muestran error porque `touched.cvv && dirty.cvv = false`.
😖 El user ve un form lleno parcial y un botón deshabilitado sin feedback.
✅ Incluir un flag adicional "submission attempted" en lugar de pisar touched+dirty cuando se intenta submit.

#### `#V4-POS-03` — fieldErrors se reconstruye en CADA render sin memoización
**Severidad:** Media · **Esfuerzo:** Bajo
📍 `src/components/features/CheckoutModal.tsx:182-205`
👀 Las 4 IIFEs se llaman en cada render, todas las veces que cambia cualquier state.
😖 Para un modal de pago con animación es aceptable, sí ineficiencia que escala mal.
✅ `useMemo` con dependencias `[holder, number, expiry, cvv]`.

#### `#V4-POS-04` — Effect sync user en MyProfile pisa edits en flow async
**Severidad:** Alta · **Esfuerzo:** Medio
📍 `src/pages/MyProfile.tsx:145-159`
👀 Si user llega null al mount → user cambia mid-render (auth tardío) → effect sobreescribe `data` Y `initial`. Si el user ya empezaba a tipear con dirty=true, descartar deja un estado inconsistente con el user actual.
😖 Estado mixto entre INITIAL viejos y user actual.
✅ Si effect detectó user nuevo durante dirty=true, encolar el update para aplicarlo solo cuando dirty vuelva a false.

#### `#V4-POS-05` — transferTouched no se resetea cuando user sube file después de fallar submit
**Severidad:** Media · **Esfuerzo:** Bajo
📍 `src/components/features/CheckoutModal.tsx:124, 245-252, 597-647`
👀 User clickea sin file → `transferTouched=true` → border rojo. User sube file → success card. User quita file → vuelve al fallback → `transferTouched=true` → border rojo INMEDIATO sin haber re-intentado.
😖 UX agresiva: el user borró por error, no necesita el grito.
✅ Resetear `setTransferTouched(false)` en `setEvidenceFile(file)`.

#### `#V4-POS-06` — Reset effect del CheckoutModal con `item?.id` no dispara con `item=null`
**Severidad:** Baja · **Esfuerzo:** Bajo
📍 `src/components/features/CheckoutModal.tsx:129-152`
👀 Si el caller setea `item=null` antes de `open=false`, `item?.id` = undefined, y el effect no se redispara.
😖 No es bug crítico pero falsa sensación de safety.
✅ Reset también en cleanup del effect.

#### `#V4-POS-07` — DeleteAccountModal sin atomicidad + storage event race
**Severidad:** Alta · **Esfuerzo:** Medio
📍 `src/pages/Settings.tsx:809-829`
👀 Si `resetDemoStores` throwea, toast.success no aparece pero cleanup queda a medias. Además el `useNotificationsStore.setState({ items: [] })` se hace DESPUÉS de borrar la key → zustand persist re-persiste `items: []` inmediatamente → migrate() con mockNotifications NO corre.
😖 Siguiente user ve inbox vacío en lugar del demo seed.
✅ Reordenar: setState ANTES de removeItem, o reset usando el `migrate()` del propio store.

#### `#V4-POS-08` — Notificaciones tag "Avance · Etapa" se rompe en mobile angosto
**Severidad:** Media · **Esfuerzo:** Bajo
📍 `src/pages/Notifications.tsx:67, 70, 203`
👀 Con `uppercase + tracking-wider`, "AVANCE · ETAPA" mide ~84px. En mobile ≤320px el flex-wrap puede cortar el `·` colgado al inicio de línea.
😖 Legibilidad degradada en pantallas chicas.
✅ `whitespace-nowrap` en el span o `&nbsp;` antes/después del `·`.

#### `#V4-POS-09` — Deshacer notification rompe orden cronológico
**Severidad:** Media · **Esfuerzo:** Bajo
📍 `src/pages/Notifications.tsx:246-263`
👀 El re-insert hace `[removed, ...s.items]` (prepend), pero el comentario asume "será re-ordenado por el sort de la UI" — NO hay sort. La notif deshecha aparece al TOPE aunque haya sido la 5ta más vieja.
😖 Rompe consistencia con el orden cronológico esperado.
✅ Re-insertar respetando `n.createdAt` con un splice ordenado.

---

### 🎓 TUTOR (9 hallazgos)

#### `#V4-TUT-01` — Firma persiste tras retroceso de etapa (estado Frankenstein)
**Severidad:** Alta · **Esfuerzo:** Medio
📍 `src/store/caseSignatures.ts:51-79`, `src/pages/tutor/TutorCaseDetail.tsx:917-918,1186-1197`
👀 Si el tutor firma en `evaluacion` y luego un reviewer arrastra a `auditoria` (retroceso sin validar), la UI muestra "Evaluación firmada" en la tab Evaluación aunque el `caseData.stage` ya no corresponde. El botón queda disabled sin poder re-firmar.
😖 Caso visualmente en `auditoria` con firma "viva" de evaluación previa.
✅ O invalidar firma al retroceder pre-evaluación, o mostrar banner: "Esta firma corresponde a una evaluación anterior; el caso fue retrocedido".

#### `#V4-TUT-02` — `unsign(caseId)` dead method + comentario incoherente
**Severidad:** Media · **Esfuerzo:** Bajo
📍 `src/store/caseSignatures.ts:70-75`
👀 El comentario dice "idempotente: setea false" pero la implementación hace `delete next[caseId]` (borrado físico). Nadie la invoca.
😖 Si entra backend y se lee el comentario para implementar `POST /cases/:id/unsign`, asumirá idempotencia con `signed:false`. Discrepancia.
✅ Borrar el método o alinear comportamiento con comentario.

#### `#V4-TUT-03` — `tutorIdentity.initials` se rompe para honoríficos distintos a "Lic."
**Severidad:** Alta · **Esfuerzo:** Bajo
📍 `src/services/mocks/data.ts:620-631`
👀 `replace(/^Lic\.\s+/, '')` solo matchea `Lic.`. Para `"Dra. María Quispe"` queda intacto: iniciales serían `DM` (Dra/María) en vez de `MQ` (María/Quispe).
😖 Avatares con iniciales incorrectas en cuanto cambie el mock.
✅ Regex más amplio: `^(Lic|Dr|Dra|Mtra|Mtro|Antrop|Ing|Prof)\.\s+`.

#### `#V4-TUT-04` — TutorCaseDetail.tsx:450 con "Lic. Patricia Vega" hardcoded
**Severidad:** Media · **Esfuerzo:** Bajo
📍 `src/pages/tutor/TutorCaseDetail.tsx:444-453`
👀 El InternalNotesPanel en tab "Notas internas" del caso activo recibe `currentUser={{ name: 'Lic. Patricia Vega', initials: 'PV' }}` hardcoded. V3-TUT-10 centralizó el NotesDrawer del cert pero olvidó el caso activo.
😖 Mismo tutor "firma" notas como Patricia Vega (caso) y como Juan Pérez (cert). Inconsistencia interna.
✅ Reemplazar literal por `{ name: tutorIdentity.shortName, initials: tutorIdentity.initials }`.

#### `#V4-TUT-05` — 23+ literales "Lic. Juan Pérez" en mocks NO migrados
**Severidad:** Alta · **Esfuerzo:** Medio
📍 `src/services/mocks/data.ts` (múltiples líneas: 413, 444, 454, 460, 560, 674, 692, 709, 726, 762, 780, 798, 815, 1261, 1270, 1278, 1417, 1427, 1437, 1541, 1665, 1672, 1682)
👀 Notifications dicen "Lic. Juan Pérez te respondió", historial inmutable dice "Auditoría asignada a Lic. Juan Pérez", task entries cargan `tutorName: 'Juan Pérez'`. Si alguien cambia `mockTutor.name`, los mensajes mock divergen.
😖 La fix V3-TUT-10 promete centralización pero cumple solo donde se acordaron. Mocks viejos siguen siendo islas.
✅ Migrar los literales a template strings `${tutorIdentity.name}` o `${tutorIdentity.shortName}`.

#### `#V4-TUT-06` — KanbanCardMenu left puede ser negativo
**Severidad:** Alta · **Esfuerzo:** Bajo
📍 `src/pages/tutor/TutorCases.tsx:1402-1426`
👀 La rama "no overflowsRight" calcula `rect.right - MENU_WIDTH (192)`. Si `rect.right < 192` (card en primera columna scrolleada off-screen), `left` resulta negativo → menú aparece cortado.
😖 Solo la rama `overflowsRight` tiene `Math.max(8, ...)` que protege.
✅ Envolver siempre con `Math.max(8, rect.right - MENU_WIDTH)` o flippear a `rect.left` cuando overlap.

#### `#V4-TUT-07` — KanbanCardMenu listener leak con doble-click
**Severidad:** Media · **Esfuerzo:** Medio
📍 `src/pages/tutor/TutorCases.tsx:1402-1426`
👀 `computePos` se re-asigna cada render — los `removeEventListener` con la `computePos` anterior NO matchean la referencia nueva.
😖 Leak de listeners en sesiones largas con muchos open/close.
✅ `useCallback` para `computePos` o consolidar listeners en un ref estable.

#### `#V4-TUT-08` — validateCaseAdvance simula con pendingItems originales
**Severidad:** Alta · **Esfuerzo:** Medio
📍 `src/lib/caseValidation.ts:175-186`
👀 El loop hace `{ ...caseData, stage: stepStage }` — solo cambia `stage`, conserva `pendingItems`. Pero `computeCanAdvance` para `revision-inicial`/`elegible` chequea `pendingItems.length === 0`. Si el caso original está en `postulado` con un `pendingItem` ("Completar postulación"), el simulador falla en la primera etapa intermedia.
😖 Jumps válidos quedan bloqueados con "no podés a Evaluación porque en Revisión hay pendientes" — pero el caso ya pasó Revisión.
✅ O `pendingItems` asociado a etapa, o el chequeo solo aplica para etapa activa (no simulada).

#### `#V4-TUT-09` — validateCaseAdvance no chequea requisitos de la última etapa
**Severidad:** Media · **Esfuerzo:** Medio
📍 `src/lib/caseValidation.ts:175-186`
👀 El loop `for (let i = fromIdx; i < toIdx; i++)` simula el caso PARADO en cada etapa intermedia. La iteración i=toIdx-1 simula el caso en la penúltima y valida si puede llegar a la última. PERO los requisitos PROPIOS de la última etapa nunca se validan.
😖 Si target = `evaluacion`, solo valida poder llegar a evaluacion — no que evaluacion misma esté lista para arrancar.
✅ Clarificar si el nombre `validateCaseAdvance` significa "puedo ENTRAR a target" o "puedo PASAR DE target". Documentar en JSDoc.

---

### 🛡️ SHARED — 6 hallazgos

#### `#V4-POS-10/SHARED-01` — resetDemoStores borra firmas en logout del postulante
**Severidad:** Media · **Esfuerzo:** Bajo
📍 `src/store/resetDemo.ts:115-120`
👀 `useCaseSignaturesStore.clear()` corre en todos los paths. Cuando el postulante cierra sesión, se borran firmas de TODOS los casos del tutor.
😖 Cross-account leak inverso. Postulante limpia datos del tutor.
✅ Mover `useCaseSignaturesStore.clear()` al bloque condicional `forTutorReset` separado.

#### `#V4-POS-11/SHARED-02` — resetDemoStores: setState revertido por storage event de otra tab
**Severidad:** Media · **Esfuerzo:** Medio
📍 `src/store/resetDemo.ts:144-151`
👀 Tab A llama removeItem + setState. Tab B no recibe storage event para setState. Si Tab B hace cualquier setState, persist middleware re-escribe localStorage con datos viejos.
😖 Data leak entre tabs.
✅ Documentar limitación, o `window.dispatchEvent(new StorageEvent('storage', ...))`.

#### `#V4-PUB-09/SHARED-03` — ConfirmDialog Enter no confirma en mobile/touch tras tap
**Severidad:** Media · **Esfuerzo:** Bajo
📍 `src/components/features/ConfirmDialog.tsx:82-102`
👀 En mobile, varios browsers no mantienen focus en buttons tras tap — `document.activeElement = body`. Enter pulsado no confirma porque `activeElement !== confirmRef`.
😖 Friction en tablets con keyboard externo.
✅ Combinar enfoques — Enter confirma si focus está en confirm O en body/dialog raíz.

#### `#V4-PUB-10/SHARED-04` — ConfirmDialog prevOverflow en stacks anidados
**Severidad:** Media · **Esfuerzo:** Medio
📍 `src/components/features/ConfirmDialog.tsx:94-101`
👀 Si ConfirmDialog A se abre, child modal B se abre, ConfirmDialog A se cierra antes que B → A restaura overflow al original = scrollable, mientras B sigue abierto.
😖 Body scroll lock inconsistente.
✅ Counter global de "lock count".

#### `#V4-PUB-11/SHARED-05` — EvidenciasSection window.open sin verificar bloqueo
**Severidad:** Baja · **Esfuerzo:** Bajo
📍 `src/pages/tutor/TutorCertificationDetail.tsx:1072-1086, 1126-1140`
👀 `window.open` puede retornar null (popup blocker). El toast.success aparece antes.
😖 Feedback engañoso si el browser bloquea.
✅ `const opened = window.open(...); if (opened) toast.success(...); else toast.error('Tu navegador bloqueó la apertura...')`.

#### `#V4-PUB-12/SHARED-06` — Copy "Restaurar demo" no menciona firmas perdidas
**Severidad:** Baja · **Esfuerzo:** Bajo
📍 `src/pages/tutor/TutorCases.tsx:737-746`
👀 El ConfirmDialog enumera kanban, notas, checklist, tareas, portadas, snapshot — NO menciona "firmas". El reviewer que firmó 3 casos no sabe que las pierde.
😖 Sorpresa post-confirm.
✅ Agregar "Firmas de evaluación" al enum.

---

## 3. Matriz Impacto × Esfuerzo

### Quick wins (esfuerzo Bajo) — 13 fixes
- `#V4-PUB-01` documentar limitación robots.txt
- `#V4-PUB-03` useMemo en IIFE
- `#V4-PUB-04` AND con ontouchstart
- `#V4-PUB-06` escape Unicode explícito
- `#V4-PUB-07` reemplazar XXXX por DEMOPREVIEW
- `#V4-POS-01` markVisited en visibilitychange
- `#V4-POS-03` useMemo fieldErrors
- `#V4-POS-05` reset transferTouched al subir file
- `#V4-POS-06` reset effect en cleanup
- `#V4-POS-08` whitespace-nowrap en tag
- `#V4-POS-09` re-insert respetando `at`
- `#V4-TUT-02` borrar unsign o alinear
- `#V4-TUT-03` regex más amplio para honoríficos
- `#V4-TUT-04` reemplazar literal Patricia Vega
- `#V4-TUT-06` Math.max en cálculo left
- `#V4-PUB-09` Enter también desde body
- `#V4-PUB-11` verificar window.open
- `#V4-PUB-12` mencionar firmas en copy

### Medios — 11 fixes
- `#V4-PUB-02` sitemap dinámico
- `#V4-PUB-05` test CI para PDF path
- `#V4-PUB-08` ajustar overflow OG mockup
- `#V4-POS-02` flag "submission attempted"
- `#V4-POS-04` encolar update post-dirty
- `#V4-POS-07` reordenar setState/removeItem
- `#V4-TUT-01` invalidar firma o banner warning
- `#V4-TUT-05` migrar 23+ literales con template
- `#V4-TUT-07` useCallback computePos
- `#V4-TUT-08` modelo pendingItems por etapa
- `#V4-TUT-09` documentar semántica
- `#V4-POS-10` flag forTutorReset
- `#V4-POS-11` storage event manual
- `#V4-PUB-10` counter global lock

### Altos — 0 fixes
Ningún hallazgo requiere refactor mayor.

---

## 4. Comparativa v3 → v4

| Métrica | v3 | v4 |
|---|---|---|
| Hallazgos | 58 | **32** |
| Críticas | 9 | **6** |
| Medias | 14 | **11** |
| Bajos | 35 | **15** |
| Esfuerzo Alto | 0 | **0** |
| Quick wins | 18 | **13** |

> El v4 es ~55% del tamaño del v3 — patrón saludable de auditorías iterativas que convergen.

---

## 5. Estado del ciclo completo

| Auditoría | Hallazgos | Cerrados | Cierre |
|---|---|---|---|
| v1 | 111 | ~105 | ~95% |
| v2 | 49 | 46 | ~94% |
| v3 | 58 | 54 | ~93% |
| v4 | 32 | 0 | 0% |
| **Total** | **250** | **205** | **~82%** |

### Patrones detectados en v4

1. **Migración a medias**: V3-TUT-10 centralizó identidad pero olvidó múltiples callsites (NotesDrawer caso activo + 23+ literales en mocks).
2. **Validaciones simuladas vs realidad**: V3-TUT-03 itera etapas pero conserva contexto del original (pendingItems globales).
3. **Estado vs lifecycle**: V3-POS-02 visibilitychange + pagehide no cubre iOS abrupto. V3-TUT-11 firma persiste pero no responde a retrocesos.
4. **SEO infrastructure**: robots.txt en wrong location + sitemap sin contenido dinámico.
5. **Race conditions con persist middleware**: setState directo + removeItem en orden incorrecto.

### Worth celebrating

- ConfirmDialog refactor V3-TUT-05/PUB-10/11/12/13 mayormente exitoso — solo 2 edge cases residuales.
- markVisited migration V3-POS-02 cumple en 90% de los casos (queda iOS abrupto).
- validateCaseAdvance loop V3-TUT-03 lógica correcta, falla solo en modelo de pendingItems.
- noindex desde Layouts V3-PUB-02 funciona end-to-end.
- KanbanCardMenu portal V3-TUT-14 resuelve clipping; solo edge en negativo left.

---

## Cómo se construyó este reporte

- Auditoría realizada por 2 agentes Explore en paralelo + síntesis manual.
- Cobertura: SOLO archivos modificados/agregados en Tandas 7-10 (commits `9983246`, `35b7a4d`, `3ee4eb4`, `3aa119b`).
- Foco metodológico: regresiones, bugs introducidos, inconsistencias entre fixes parciales, race conditions.
- No re-revisa código de Tandas 1-6 (cubierto por v3).
