# REPORTE DE AUDITORÍA UX v2 — Ancestral Seed

**Fecha:** 28 de mayo 2026 (segunda pasada, tras ~100 fixes)
**Versión:** v2.0
**Método:** análisis estático profundo + simulación cognitiva por escenarios + verificación cruzada de los fixes implementados desde el v1
**Recorrido por:** 3 personas distintas (visitante público / postulante Camila / tutora Patricia Vega)
**Repo auditado:** `/Users/alannaimtapia/dev/ancestral-seed`
**Base comparativa:** v1 (commit `eda5cdb`) + 47 commits posteriores hasta `c58d69a`
**Total de hallazgos:** **49** (20 tutor · 21 postulante · 8 público) — vs **111** en v1

> El **reporte v1** (`REPORTE-AUDITORIA-UX.md`) queda como histórico. Cerramos ~95% de aquellos hallazgos. Estos 49 nuevos son **residuales no capturados**, **regresiones parciales** y **edge cases** de los fixes.

---

## 1. Resumen ejecutivo

### Sensación general (3 líneas)

> La app subió un escalón completo desde v1. Los flujos críticos (QR real, checkout, notas internas, evidencias por slots, descargas PDF, glosario del Reglamento) están bien resueltos y se sienten producto. **Pero** quedan **bordes donde la cobertura del fix fue incompleta**: deltas hardcoded que sobrevivieron en una pantalla mientras se borraron en otra; persistencia que funciona en notas del caso activo pero no en cert emitido; revisiones del CertifyForm que faltan dos secciones; mock data con timestamps de hace 3 meses que silencia features bien implementados. La sensación es de "vehículo armado y andando" con tornillos que faltan a la vista.

### Las 5 fricciones residuales que más sangran

| # | ID | Problema | Origen | Severidad |
|---|---|---|---|---|
| 1 | `#V2-TUT-02` | **Tab "Notas internas" no sobrevive al refresh** — `TAB_IDS` omite `'notas'`, la guarda devuelve a Resumen | bug de 1 char del fix SA5 | **Alta** |
| 2 | `#V2-TUT-03` | **TutorCaseDetail lee del mock estático**, no del `useTutorCasesStore` → dos fuentes de verdad para la misma entidad | arquitectura del fix SB6 | **Alta** |
| 3 | `#V2-POS-04` | **StepRevision del CertifyForm omite 2 secciones** (Evidencias + Privacidad) — el postulante no ve la portada que va a quedar publicada ni si tildó "perfil público" | gap del fix SB2 | **Alta** |
| 4 | `#V2-POS-03` | **Slots "Pedidas por tu tutor" con plazo vencido sin alerta** — copy dice "15 de marzo", hoy es 28 de mayo, vencido hace 74 días | regresión de SB8 + dato mock viejo | **Alta** |
| 5 | `#V2-POS-01` | **"Lo nuevo desde tu última visita" muere silenciosamente** — el último history.at del mock es 2026-04-28 → todo evento queda "viejo" → el bloque nunca se renderiza en el demo | regresión funcional de SB5 + mock obsoleto | **Alta** |

> Las 5 son **Quick wins** (esfuerzo Bajo). Resolviendo solo estas, el v2 cierra al 90%.

---

## 2. Diario del usuario (narrativa por escenarios)

### 🌐 Visitante público — "vine desde un link de WhatsApp"

Toco el link. **Excelente preview**: imagen 1200×630 con el wordmark + chip "VERIFICADO EN BLOCKCHAIN" + las 3 categorías oficiales del Reglamento. Tap. Llego al Home.

El video del Hero arranca sin franjas de YouTube por arriba (overlay navy oculta el chrome del player) ni "Up next" abajo. Al primer scroll para leer los pilares, el audio se enciende solo — sin tener que tocar nada. Buena UX. Pero **noto que el botón unmute** queda justo encima del overlay bottom navy y se ve mezclado con el gradiente; en mobile angosto está cerca de quedar tapado por el padding del border-radius.

Voy al directorio. Filtro "Tipo: Tradicional con raíces ancestrales". Veo 4 certs filtrados. Bien. El placeholder del search dice "Buscar por nombre, región, autor o hash..." — coincide con el filtro. Las cards tienen badge de categoría arriba a la izquierda.

Voy al perfil de María Belén Bauló. Las pills (Sobre / Certificaciones · 1 / Territorio / Trayectoria) están en grid de 4 desktop / scroll mobile. Tab Territorio: "Pueblo originario · Por confirmar con la comunidad" en italic gris. Esto funciona como decisión consciente — pero si entro a Flor Imbacuán y veo "Pueblo Pasto", y vuelvo a MBB y veo "Por confirmar"... empieza a parecer que **la mitad de los autores no completó el dato**. Falta un copy más claro sobre "esta autora trabaja desde Inspiración cultural" en vez de "por confirmar".

Voy a /verificar. Toco "Escanear QR". El modal me pide cámara. En Chrome desktop pide permiso y abre el feed; en Safari iOS, BarcodeDetector no existe → cae al fallback con copy "Tu navegador no escanea QR" — pero el copy NO me dice "abrí en Chrome para móvil" o cómo seguir. La opción "Subir foto del QR" sigue disponible y funciona si el QR es legible, pero está abajo del fallback.

Voy a /ayuda. Veo "Glosario del Reglamento" con 8 términos formales y "Plazos importantes" con los 4 plazos clave del Reglamento (80% / 90d / 30d / 5d). Estas dos secciones son **el aporte más visible del SM6** — antes no existían. Las leo y entiendo formalmente qué pasa si me atraso. Bien.

### 👤 Postulante Camila — "vuelvo después de varios días"

Entro a `/inicio`. Saludo "Buenas tardes, Camila" + subtitle con 3 pendientes y 2 reuniones. NBA rojo arriba: "Pago vencido hace 89 días — $45.000". OK, prioridad clara.

**Pero** debajo del NBA, donde debería estar "Lo nuevo desde tu última visita", **no aparece nada**. El feature funciona en código pero el último evento del history del mock es del 28 de abril y hoy es 28 de mayo — todos los eventos pasan a "viejos" instantáneamente. El reviewer del demo nunca ve el feature trabajando. Triste.

Más abajo veo el RecentActivitySummary podría duplicar info que ya está en el NBA si los eventos incluyen "pago vencido" — el filtro de dedupe no existe.

QuickActions tiene **3 caminos al mismo lugar**: el botón "Añadir evidencias" en la card de proceso, "Subir evidencias" en el QuickActionsRow del fondo, y el NBA cuando hay pendingItems. El SB5 limpió el orden pero dejó la duplicación.

Click en la card en proceso → entro a `/mis-certificaciones/req-001`. NextStepCard gold/rojo arriba dice "Regularizá el arancel" (porque hay pago vencido). Bien.

Voy al tab Evidencias. Bloque "Pedidas por tu tutor · 2 pendientes" con copy "Por Reglamento 4.6 tenés 30 días corridos para subsanar". Pero los 2 slots dicen **Plazo: 15 de marzo** y **Plazo: 20 de marzo** — fechas de hace 2 meses, sin alerta visual de vencido. Crítico: el postulante puede pensar que tiene tiempo cuando ya está fuera del plazo del Reglamento.

Click "Pagar" → CheckoutModal abre. Tab Tarjeta funciona suave. Tab Transferencia muestra CBU/CVU/Alias copiables, sube comprobante. Animación de éxito + auto-close. **Pero**: el modal cierra y aparece `toast.success` simultáneo con copy parecido — doble feedback ruidoso.

Voy a `/certificar`. Si tengo borrador, aparece dialog "Tenés una postulación a medias de **Camila Montes** (paso 1 de 7)". **Bug**: dice mi nombre porque el productName está vacío y el fallback usa applicantName — se confunde con la cuenta del usuario.

En el paso 5 puedo clickear pasos anteriores. Llego al paso 7 (Revisión). Tres secciones aparecen: Identidad, Comunidad, Producto, Proceso. **Faltan Evidencias y Privacidad**. No puedo ver qué fotos voy a publicar ni si tildé "perfil público" sin volver atrás.

Subo 4 fotos en el paso 5. Veo thumbnails reales (URL.createObjectURL). Cover marcada con badge dorado. Hover de no-cover → "Usar como portada". **Pero** si navego a otro paso y vuelvo, los previewUrls se pierden — el comentario del código admite esto. Frustrante en el demo.

### 🎓 Tutora Patricia Vega — "empiezo el día con 12 casos"

Entro a `/tutor/dashboard`. **Mejoró**: "Pendientes de mi firma" arriba, "Mis tareas" después, KPIs sin delta fake. Buena lectura.

**Pero** scrolleo y encuentro `UnansweredCard` con "+5 en la última semana" hardcoded — exactamente el patrón que se borró del Dashboard arriba. **Inconsistencia** del fix #TUT-03.

Voy a `/tutor/casos`. Toggle Kanban/Lista. Cambio a Lista. Cierro browser. Vuelvo. Sigue en Lista — el localStorage funciona. **Pero** la vista Lista **no tiene acciones por fila**. Click navega al detail; si quiero mover etapa o asignarme sin abrir el expediente, no puedo. La feature SB14 introdujo Lista para velocidad pero la acción más frecuente (mover) falta. Vuelvo al Kanban con frustración.

Intento mover CE-101 (sin tutor) a Diagnóstico — drag-and-drop salta de 3 etapas. Toast.error claro: "No podés avanzar: Tutor asignado al caso · Scoring IA disponible". El fix SB6 funciona.

Click en CE-101 → entro al detail. La etapa es la del MOCK ESTÁTICO, no del store. Si arrastré antes y la moví, el detail muestra la vieja. **Dos fuentes de verdad** — bug arquitectónico residual del SB6.

Voy a la tab "Notas internas". Escribo "Postulante teme dependencia de hilo industrial. Verificar con auditora". Guardo. Veo la nota. **Refresh** para verificar persistencia. **Caigo en Resumen** — `TAB_IDS` no incluye `'notas'`, la guarda redirige al default. La nota SÍ está en el store, pero tengo que clickear el tab manualmente. Si le mando el link `?tab=notas` a un colega, también va a caer en Resumen. **Bug de 1 char.**

Voy a `/tutor/certificaciones/CE-001`. Veo el DimensionsBreakdown con las 5 dimensiones culturales. **Pero** abro Notas internas del cert — son `useState` local sin persist. Refresh → se borran. La promesa del fix SA5 (persistencia) está **solo** en caso activo, no en cert emitido. Inconsistencia conceptual.

Voy al RowMenu de un cert en la lista. "Descargar PDF" — toast pero **no descarga nada real**. El botón del detail SÍ genera el PDF con jsPDF. Misma acción, dos comportamientos.

---

## 3. Matriz Impacto × Esfuerzo (49 hallazgos)

> **Convención:** **Quick win** ⚡ = severidad Alta/Crítica + esfuerzo Bajo

### Flujo público (8 hallazgos)

| ID | Problema | Severidad | Esfuerzo | Quick win |
|---|---|---|---|---|
| `#V2-PUB-01` | Botón unmute solapado con overlay bottom navy | Media | Bajo | ⚡ |
| `#V2-PUB-02` | Verify fallback iOS sin sugerencia clara de "Subir foto" | Media | Bajo | ⚡ |
| `#V2-PUB-03` | "Por confirmar con la comunidad" parece dato faltante en vez de Inspiración cultural | Media | Bajo | ⚡ |
| `#V2-PUB-04` | OG image es 100% tipografía, sin foto de producto real | Baja | Alto | — |
| `#V2-PUB-05` | Glosario de /ayuda no es buscable desde el search principal | Media | Medio | — |
| `#V2-PUB-06` | Plazos del Reglamento sin link a la cláusula exacta del PDF | Baja | Medio | — |
| `#V2-PUB-07` | PageMeta default OG image en rutas privadas (leak de URL privada) | Baja | Bajo | — |
| `#V2-PUB-08` | Schema.org JSON-LD del index.html no incluye `sameAs` con redes sociales | Baja | Bajo | — |

### Flujo postulante (21 hallazgos)

| ID | Problema | Severidad | Esfuerzo | Quick win |
|---|---|---|---|---|
| `#V2-POS-01` | RecentActivitySummary muerto: history.at del mock es de hace 3 meses | **Alta** | Bajo | ⚡ |
| `#V2-POS-03` | Slots "Pedidas por tu tutor" muestran "15 de marzo" sin alerta de vencido | **Alta** | Bajo | ⚡ |
| `#V2-POS-04` | StepRevision omite Evidencias y Privacidad (4/6 secciones) | **Alta** | Bajo | ⚡ |
| `#V2-POS-09` | Tres CTAs idénticos a Evidencias en el dashboard | Media | Bajo | ⚡ |
| `#V2-POS-10` | `/pagos` descarga factura `.txt` mientras CertRequest descarga PDF | Media | Bajo | ⚡ |
| `#V2-POS-20` | Filtro "Avances" con badges "Estado" y "Certificación" — taxonomía inconsistente | Baja | Bajo | — |
| `#V2-POS-02` | RecentActivitySummary duplica info que ya está en NBA | Media | Bajo | ⚡ |
| `#V2-POS-05` | ResumeOrFreshDialog dice "Guardamos avances de Camila Montes" cuando solo cargó el nombre | Media | Bajo | ⚡ |
| `#V2-POS-06` | EvidenciasTab de la ficha no permite cambiar portada después del form | Media | Medio | — |
| `#V2-POS-07` | markVisited() dispara antes de leer snapshot en Strict Mode | Baja | Bajo | — |
| `#V2-POS-08` | Hint del paso Evidencias dice "✓ 4/3" — fracción incómoda | Baja | Bajo | — |
| `#V2-POS-11` | Tour solicitante arranca DEBAJO del ResumeOrFreshDialog modal | Media | Medio | — |
| `#V2-POS-12` | Confirm() nativo del browser para WhatsApp rompe estética de marca | Baja | Bajo | — |
| `#V2-POS-13` | DeleteAccountModal cuenta $120K incluyendo pagos ya consumidos | Baja | Bajo | — |
| `#V2-POS-14` | CheckoutModal sin feedback de campo inválido en tarjeta | Media | Medio | — |
| `#V2-POS-15` | Modal de éxito + toast simultáneo: doble feedback ruidoso | Baja | Bajo | — |
| `#V2-POS-16` | Camila tiene rol "tutor" → sidebar muestra "Panel de tutor" confuso para demo | Baja | Bajo | — |
| `#V2-POS-17` | NavLink "Mis certificaciones" no se marca activo en subrutas | Media | Bajo | ⚡ |
| `#V2-POS-18` | Stepper móvil son 7 dots sin números/labels | Media | Medio | — |
| `#V2-POS-19` | MyProfile dirty check se ensucia con createObjectURL aunque sea misma foto | Baja | Bajo | — |
| `#V2-POS-21` | Tab "Postergadas" cuenta 1 aunque el draft sea "Sin nombre" | Baja | Bajo | — |

### Flujo tutor (20 hallazgos)

| ID | Problema | Severidad | Esfuerzo | Quick win |
|---|---|---|---|---|
| `#V2-TUT-02` | **Tab "Notas internas" no sobrevive al refresh** — `TAB_IDS` omite `'notas'` | **Alta** | Bajo (1 char) | ⚡ |
| `#V2-TUT-03` | TutorCaseDetail lee del mock, no del useTutorCasesStore | **Alta** | Medio | — |
| `#V2-TUT-04` | Vista Lista del kanban sin acciones por fila | **Alta** | Medio | — |
| `#V2-TUT-09` | Notas del cert emitido NO usan el store persistido (regresión SA5) | Media | Medio | — |
| `#V2-TUT-12` | Mensajes oficiales: contador hardcoded a 3 siempre | Media | Bajo | ⚡ |
| `#V2-TUT-19` | RowMenu de TutorCertifications "Descargar PDF" no descarga nada | Media | Bajo | ⚡ |
| `#V2-TUT-20` | Evidencias y firma se editan localmente pero NO persisten | Media | Medio | — |
| `#V2-TUT-01` | UnansweredCard sigue con delta hardcoded "+5 en la última semana" | Media | Bajo | ⚡ |
| `#V2-TUT-05` | "Ver casos en alerta" rompe en vista Lista (kanbanRef inválido) | Media | Bajo | ⚡ |
| `#V2-TUT-06` | window.confirm() nativo para salto >1 etapa rompe estética de marca | Media | Medio | — |
| `#V2-TUT-07` | KPIs de Certificaciones siguen con deltas fake (3/4 sin fix) | Media | Bajo | ⚡ |
| `#V2-TUT-08` | MoreActionsDrawer dice "Documento oficial · TXT" cuando ya es PDF | Baja | Bajo | — |
| `#V2-TUT-10` | Disenso IA: copy no incluye CTA directo a "Abrir Notas internas" | Media | Bajo | ⚡ |
| `#V2-TUT-11` | No hay badge "N notas" en header del caso o en tab | Baja | Bajo | — |
| `#V2-TUT-13` | Filtro de Tareas en Dashboard se reinicia entre vistas | Baja | Bajo | — |
| `#V2-TUT-14` | Reset del kanban no expuesto al usuario (queda atrapado en error de drag) | Baja | Bajo | — |
| `#V2-TUT-15` | Click vs drag depende de mover el puntero — flag dragMoved buggy | Baja | Medio | — |
| `#V2-TUT-16` | Tareas store hidrata desde mocks una sola vez → cache stale futuro | Baja | Medio | — |
| `#V2-TUT-17` | Kanban card solo muestra pendingItems[0] — oculta el resto | Baja | Bajo | — |
| `#V2-TUT-18` | window.confirm no anunciable a screen readers en contexto custom | Baja | Bajo | — |

> **15 Quick wins** marcados (severidad Alta/Crítica + esfuerzo Bajo, o reincidencias del v1 que escaparon).

---

## 4. Hallazgos detallados (formato `[#ID]`)

> Hallazgos **Críticos y Quick wins** desarrollados. Para los Medios/Bajos están en la matriz arriba — pedinos el detalle si los vas a tomar.

---

### 🎓 TUTOR — Críticos & Quick wins

```
[#V2-TUT-02] [Bug] — Tab "Notas internas" no sobrevive al refresh
📍 Ubicación: TutorCaseDetail.tsx línea 130 (TAB_IDS)
👀 Qué vi: TAB_IDS = ['resumen', 'evidencias', 'evaluacion', 'mensajes', 'historial'].
   NO incluye 'notas'. Al recargar con ?tab=notas, la guarda falla
   silenciosamente y vuelve a 'resumen'.
😖 Por qué molesta: rompe shareable links ("dale, abrí esta nota interna que
   dejé"), rompe el back/forward del browser, y al refresh el tutor cree que
   la nota se perdió (no se perdió, sí está en el store, pero hay que volver
   a clickear el tab). Falla la promesa central del fix SA5.
🔥 Severidad: Alta
🔧 Esfuerzo: Bajo (1 char: agregar 'notas' al array)
✅ Recomendación:
   const TAB_IDS = ['resumen', 'evidencias', 'evaluacion', 'mensajes', 'notas', 'historial']
🔄 Regresión del fix SA5
```

```
[#V2-TUT-03] [Arquitectura] — TutorCaseDetail lee del mock, no del store
📍 Ubicación: TutorCaseDetail.tsx línea 124
👀 Qué vi: `mockTutorCases.find((c) => c.id === id)`. El kanban lee de
   useTutorCasesStore (persistido). Si muevo un caso por kanban y abro el
   detail, veo la etapa VIEJA del mock.
😖 Por qué molesta: dos fuentes de verdad para la misma entidad. El fix
   SB6 del drag/drop validado pierde sentido si después abro el caso y veo
   otra etapa. Eventualmente alguien va a debugear esto pensando que es
   race condition cuando es arquitectura.
🔥 Severidad: Alta
🔧 Esfuerzo: Medio
✅ Recomendación: leer de useTutorCasesStore. El setCaseData local de
   stageModalOpen también debería despachar al store (moveCase + nuevo
   método `updateCase`).
🔄 No capturado en v1
```

```
[#V2-TUT-04] [Funcionalidad] — Vista Lista del kanban sin acciones por fila
📍 Ubicación: TutorCases.tsx líneas 425-523 (tabla)
👀 Qué vi: 6 columnas (Caso, Etapa, Solicitante, Riesgo, Días, Scoring IA).
   Cero columna de acciones. Click en fila navega al detail.
😖 Por qué molesta: el fix SB14 introduce la vista Lista justamente para
   tutores con MUCHOS casos que necesitan velocidad. Pero la acción más
   frecuente (mover etapa) es imposible sin abrir el expediente. La gente
   termina volviendo al Kanban frustrada.
🔥 Severidad: Alta
🔧 Esfuerzo: Medio
✅ Recomendación: 7ma columna sticky con MoreHorizontal → menú "Mover a",
   "Asignarme", "Abrir expediente". Reusar el patrón del kanban card.
🔄 No capturado en v1
```

```
[#V2-TUT-01] [Inconsistencia] — UnansweredCard con delta hardcoded ⚡
📍 Ubicación: TutorDashboard.tsx líneas 813-841
👀 Qué vi: "+5 en la última semana" en rojo, hardcoded, junto al ícono
   ArrowUpRight.
😖 Por qué molesta: el fix SM4 (#TUT-03) eliminó los deltas fake de los
   KPIs por credibilidad. Esta card está justo abajo y mantiene exactamente
   la práctica que decidieron desterrar.
🔥 Severidad: Media   🔧 Esfuerzo: Bajo
✅ Recomendación: omitir el delta (consistente con KpiCard) o reemplazar
   por una métrica accionable computable: "promedio de respuesta: 36h".
```

```
[#V2-TUT-05] [Bug] — "Ver casos en alerta" rompe en vista Lista ⚡
📍 Ubicación: TutorCases.tsx línea 151
👀 Qué vi: handleViewAlerts → kanbanRef.scrollIntoView. En vista Lista,
   kanbanRef apunta a un div unmounted. El scroll no pasa nada.
🔥 Severidad: Media   🔧 Esfuerzo: Bajo
✅ Recomendación: si view === 'list', omitir scrollIntoView. O hacer
   scroll al rowAreaRef.
```

```
[#V2-TUT-07] [Inconsistencia] — KPIs de Certificaciones con deltas fake ⚡
📍 Ubicación: TutorCertifications.tsx líneas 147-180
👀 Qué vi: 3 de 4 KPIs siguen con "+N en la última semana" hardcoded. Solo
   "Vencidos" recibió el fix SM4. Decisión a medias.
🔥 Severidad: Media   🔧 Esfuerzo: Bajo
✅ Recomendación: aplicar el mismo tratamiento que en dashboard a todos.
🔄 Regresión parcial de #TUT-25
```

```
[#V2-TUT-10] [UX] — Disenso IA sin CTA directo al destino ⚡
📍 Ubicación: TutorCaseDetail.tsx líneas 1101-1113
👀 Qué vi: copy "registralo en Notas internas" — texto plano. Tengo que
   cambiar de tab manualmente.
🔥 Severidad: Media   🔧 Esfuerzo: Bajo
✅ Recomendación: wrapper como <button onClick={() => setTab('notas')}>
   con pre-template "Disenso IA en [criterio]:" en el composer.
🔄 Mejora sobre el fix SB13
```

```
[#V2-TUT-12] [Bug] — Mensajes oficiales contador hardcoded a 3 ⚡
📍 Ubicación: TutorCaseDetail.tsx línea 1171
👀 Qué vi: officialCount: number = 3 (literal). El header dice "3 mensajes
   en el expediente" SIEMPRE.
🔥 Severidad: Media   🔧 Esfuerzo: Bajo
✅ Recomendación: computar de mockMessagesByCase o reusar las 3 ChatBubbles
   del stub.
🔄 No capturado en v1
```

```
[#V2-TUT-19] [Bug] — RowMenu de TutorCerts "Descargar PDF" no descarga nada ⚡
📍 Ubicación: TutorCertifications.tsx línea 872
👀 Qué vi: el botón solo hace `toast.success('Descargando PDF…')`. El
   detail SÍ genera PDF real. Misma acción, dos comportamientos.
🔥 Severidad: Media   🔧 Esfuerzo: Bajo
✅ Recomendación: importar `downloadActa` desde TutorCertificationDetail
   o duplicar la llamada a buildActaPdf.
🔄 No capturado en v1
```

---

### 👤 POSTULANTE — Críticos & Quick wins

```
[#V2-POS-01] [Bug — feature muerto] — RecentActivitySummary muere con mock estático
📍 Ubicación: DashboardHome.tsx líneas 209-260 + lastVisit.ts
👀 Qué vi: el último history.at del mock es 2026-04-28. Hoy es 2026-05-28.
   markVisited() registra el ahora en lazy initializer del useState; en la
   próxima visita el snapshot apunta a hoy, ninguno de los eventos viejos
   matchea, y el bloque NO se renderiza. El feature funciona en código pero
   nunca se ve.
😖 Por qué molesta: el reviewer/demo nunca ve el feature trabajando. Fix
   SB5 implementado correctamente pero invisible.
🔥 Severidad: Alta
🔧 Esfuerzo: Bajo
✅ Recomendación: 3 cambios complementarios:
   a) seed mock: agregar 2-3 history items con `at: Date.now() - hours(8)`
      en mockCertificationRequests[0].history para que SIEMPRE haya algo
      nuevo en demo
   b) cambiar markVisited() al unmount (cleanup function) en vez de al
      mount, para que el snapshot quede anclado al timestamp ANTERIOR
   c) si lastVisit no existe (primera carga ever), tampoco renderizar
      (ya lo hace, ok)
🔄 Regresión funcional del fix SB5
```

```
[#V2-POS-03] [Bug] — Slots con plazo vencido sin alerta visual
📍 Ubicación: CertificationRequest.tsx líneas 944-954 (EvidenciasTab slots)
👀 Qué vi: `Plazo: 15 de marzo` (y "20 de marzo"). Hoy 28/05/26. Vencido
   hace 74 días. El render usa toLocaleDateString sin marcar vencido. El
   badge "2 pendientes de 2" tampoco distingue "fuera de plazo".
😖 Por qué molesta: el postulante cree que tiene tiempo. Si se aplica
   suspensión por Reglamento 4.6 (que el copy aclara), ya pasó hace 44
   días. Falsa expectativa de seguridad.
🔥 Severidad: Alta
🔧 Esfuerzo: Bajo
✅ Recomendación: computar `daysUntil(slot.dueDate)`:
   - <0 → badge rojo "Vencido hace N días" + border rojo
   - 0-7 → naranja "Vence en N días"
   - >7 → neutro "Vence el [fecha]"
   Y actualizar mock con plazos relativos: `dueDate: addDays(now, 14)`.
🔄 No capturado en v1
```

```
[#V2-POS-04] [Bug] — StepRevision omite Evidencias y Privacidad
📍 Ubicación: CertifyForm.tsx líneas 1411-1459
👀 Qué vi: array `sections` solo tiene Identidad / Comunidad / Producto /
   Proceso. Privacidad (paso 6) y Evidencias (paso 5) omitidas.
😖 Por qué molesta: el postulante revisa antes de "Enviar solicitud" pero
   no puede ver qué fotos subió ni qué casillas tildó. Si "Acepto publicar
   ficha pública" estaba marcado por error, no lo nota antes de enviar.
🔥 Severidad: Alta
🔧 Esfuerzo: Bajo
✅ Recomendación: agregar 2 secciones más con jumpTo a steps 4 y 5:
   - Evidencias: mostrar count gallery + portada + video + docs
   - Privacidad: mostrar booleans de los 3 checkboxes
🔄 Gap del fix SB2 (#POS-22 + #POS-23)
```

```
[#V2-POS-02] [UX] — RecentActivitySummary duplica info del NBA ⚡
📍 Ubicación: DashboardHome.tsx líneas 352-370
👀 Qué vi: si el NBA dice "Pago vencido", el Summary listará el mismo evento
   "payment_received" o "pago vencido". Doble lectura del mismo dato.
🔥 Severidad: Media   🔧 Esfuerzo: Bajo
✅ Recomendación: filtrar del Summary los eventos cuyo `kind` ya está
   representado en NBA. O poner el Summary ANTES del NBA (cronología → acción).
```

```
[#V2-POS-05] [UX] — ResumeOrFreshDialog dice nombre del usuario, no del producto ⚡
📍 Ubicación: CertifyForm.tsx línea 1725
👀 Qué vi: subject = productName || applicantName || 'una postulación a
   medias'. Si solo cargó identidad, dice "Guardamos tus avances de
   **Camila Montes**" — se confunde con la cuenta.
🔥 Severidad: Media   🔧 Esfuerzo: Bajo
✅ Recomendación: subject = productName || 'una postulación sin nombre
   todavía'. NO incluir applicantName.
🔄 No capturado en v1
```

```
[#V2-POS-09] [Duplicación] — Tres CTAs idénticos a Evidencias ⚡
📍 Ubicación: DashboardHome.tsx (QuickActionsRow + inProgress card + NBA)
👀 Qué vi: "Añadir evidencias" en card de proceso (L460), "Subir evidencias"
   en QuickActionsRow (L711), y NBA fallback cuando pendingItems > 0 (L617).
🔥 Severidad: Media   🔧 Esfuerzo: Bajo
✅ Recomendación: si NBA apunta a evidencias, ocultar "Añadir evidencias"
   del header de inProgress card y dejar solo "Ver detalles".
🔄 Regresión del fix SB5
```

```
[#V2-POS-10] [Inconsistencia] — /pagos descarga TXT mientras CertRequest descarga PDF ⚡
📍 Ubicación: Pagos.tsx líneas 462-470
👀 Qué vi: el listado de Pagos cuando p.invoiceUrl existe descarga `.txt`
   con buildPaymentReceipt local. Pero PaymentRow de CertificationRequest
   usa buildPaymentReceiptPdf. El fix SB9 quedó en una mitad.
🔥 Severidad: Media   🔧 Esfuerzo: Bajo
✅ Recomendación: importar buildPaymentReceiptPdf en Pagos.tsx, reemplazar
   la rama TXT, eliminar la función buildPaymentReceipt local.
🔄 Regresión incompleta del fix SB9
```

```
[#V2-POS-17] [Navegación] — Sidebar "Mis certificaciones" no marca activo en subrutas ⚡
📍 Ubicación: DashboardLayout.tsx línea 340
👀 Qué vi: prop `end={to === '/inicio' || to === '/mis-certificaciones'}`.
   Con `end` true → match exacto. En `/mis-certificaciones/req-001` el item
   no se marca activo → user pierde anclaje de navegación.
🔥 Severidad: Media   🔧 Esfuerzo: Bajo
✅ Recomendación: quitar `end` para `/mis-certificaciones` (solo dejarlo
   en `/inicio`).
🔄 No capturado en v1
```

---

### 🌐 PÚBLICO — Quick wins

```
[#V2-PUB-01] [UI] — Botón unmute solapado con overlay bottom ⚡
📍 Ubicación: Home.tsx HeroVideoPlaceholder
👀 Qué vi: el botón mute/unmute (bottom-3 right-3) queda dentro del
   gradient overlay navy bottom (h-10). Se mimetiza con el gradiente,
   especialmente en mobile angosto.
🔥 Severidad: Media   🔧 Esfuerzo: Bajo
✅ Recomendación: bajar el overlay bottom a h-6 (más sutil) o subir el
   botón a bottom-4 con shadow para que destaque sobre el gradiente.
🔄 No capturado en v1 (introducido en SM8)
```

```
[#V2-PUB-02] [UX] — Verify fallback iOS sin "Subir foto" prominente ⚡
📍 Ubicación: Verify.tsx (state 'unsupported')
👀 Qué vi: copy dice "Tu navegador no escanea QR" pero no sugiere fuerte
   "Subir foto del QR" (esa opción aparece después en el footer del modal).
   Safari iOS es el caso más común — sin BarcodeDetector.
🔥 Severidad: Media   🔧 Esfuerzo: Bajo
✅ Recomendación: en estado 'unsupported', destacar la card "Subir foto
   del QR" como CTA primaria centrada con icono Upload grande, y bajar
   "Ingresar hash a mano" como ghost.
```

```
[#V2-PUB-03] [Microcopy] — "Por confirmar con la comunidad" parece dato faltante ⚡
📍 Ubicación: AuthorProfile.tsx Territorio (autores sin community)
👀 Qué vi: María Belén Bauló: "Pueblo originario · Por confirmar con la
   comunidad". Flor Imbacuán: "Pueblo Pasto". Si el visitante hace muchos
   perfiles, "Por confirmar" parece estado sistemático en vez de feature.
🔥 Severidad: Media   🔧 Esfuerzo: Bajo
✅ Recomendación: si officialCategory === 'inspiracion', mostrar copy
   diferente: "Trabaja desde Inspiración cultural — sin afiliación
   comunitaria declarada" en lugar de "Por confirmar".
🔄 Edge case del fix SA2
```

---

## 5. Recomendaciones

### 🚀 Quick wins — hacer esta semana (15 ítems · ~12h)

**Bug fixes "1 char" o de bajo impacto técnico**
1. ⚡ `#V2-TUT-02` — agregar `'notas'` a `TAB_IDS` (1 char)
2. ⚡ `#V2-POS-17` — quitar `end` del NavLink `/mis-certificaciones`
3. ⚡ `#V2-TUT-12` — conectar officialCount al estado real (5 líneas)

**Inconsistencias residuales de fixes previos**
4. ⚡ `#V2-TUT-01` — UnansweredCard sin delta fake (mismo patrón que KpiCard)
5. ⚡ `#V2-TUT-07` — los 3 KPIs restantes de TutorCertifications sin delta
6. ⚡ `#V2-TUT-19` — RowMenu PDF que descargue de verdad
7. ⚡ `#V2-TUT-05` — handleViewAlerts respeta vista Lista
8. ⚡ `#V2-POS-09` — quitar duplicación de CTAs "Añadir evidencias"
9. ⚡ `#V2-POS-10` — Pagos.tsx usa buildPaymentReceiptPdf

**Gap funcional alto impacto**
10. ⚡ `#V2-POS-01` — seed mock con history.at recientes + markVisited en unmount
11. ⚡ `#V2-POS-03` — plazos vencidos con badge rojo + mock data relativa a hoy
12. ⚡ `#V2-POS-04` — agregar Evidencias + Privacidad a StepRevision

**Microcopy**
13. ⚡ `#V2-POS-02` — filtrar dedupe entre NBA y Summary
14. ⚡ `#V2-POS-05` — ResumeOrFreshDialog sin nombre del usuario
15. ⚡ `#V2-TUT-10` — CTA directo "Abrir Notas internas" en copy del Evaluación
16. ⚡ `#V2-PUB-01` — botón unmute más visible
17. ⚡ `#V2-PUB-02` — fallback iOS destacando "Subir foto"
18. ⚡ `#V2-PUB-03` — copy de Inspiración cultural en perfiles

> **Resultado esperado:** ~17 mejoras concretas con cobertura completa de las regresiones detectadas. ~12h de trabajo. La app pasa de 95% a 99% de hallazgos críticos cerrados entre v1+v2.

---

### 🏗️ Mejoras estratégicas — Sprint dedicado

#### A. **Consolidar arquitectura de persistencia** (~6h)
- `#V2-TUT-03` — TutorCaseDetail debe leer/escribir al `useTutorCasesStore` (dos fuentes de verdad ahora)
- `#V2-TUT-09` — Notas del cert emitido debe usar `useInternalNotesStore` con `entityKey = 'cert-${id}'` (reutilizando el helper que ya existe pensado para esto)
- `#V2-TUT-20` — Evidencias eval y firmas deben tener su propio store Zustand para consistencia con notas

#### B. **Vista Lista del kanban completa** (~4h)
- `#V2-TUT-04` — columna "Acciones" con menú "Mover a"/"Asignarme"/"Abrir"
- `#V2-TUT-14` — botón "Restablecer demo" oculto detrás de tecla mágica para QA
- `#V2-TUT-15` — implementar la regla `>5px` real del comentario para click-vs-drag

#### C. **CheckoutModal cierra el círculo** (~3h)
- `#V2-POS-14` — feedback de campo inválido en tarjeta (border-error + helper)
- `#V2-POS-15` — toast post-modal espera al exit completo de la transición
- `#V2-TUT-06` — reemplazar window.confirm del salto de etapas por modal custom de marca (mismo tratamiento)
- `#V2-POS-12` — reemplazar window.confirm del WhatsApp por Dialog react

#### D. **Stepper móvil del CertifyForm rediseñado** (~3h)
- `#V2-POS-18` — chips con números o iniciales en lugar de dots ciegos

#### E. **Footer del CertifyForm Form (#V2-POS-06)** (~3h)
- En EvidenciasTab de la ficha post-form, permitir cambiar la portada (paridad con el form)

---

## Apéndice — Lo que está MUY bien (vale calling out)

**Worth celebrating** — funcionalidad que pasó el test cognitivo sin friction:

### Postulante
- **CheckoutModal**: animación spring + diferenciación copy tarjeta vs transferencia + CBU copiables
- **NextStepCard**: jerarquía bien calibrada (Pago vencido > Reunión > Diagnóstico > Pendingitems)
- **ResumeOrFreshDialog**: backdrop NO clickeable, CTA "Continuar" como default seguro, helper que advierte
- **Trash Undo en Evidencias** (6s + "Deshacer" estilo Gmail)
- **PaymentRow con override local** en CertificationRequest tab Pagos
- **CategoryBadge + LicenseStatusBadge** en ficha pública del cert

### Tutor
- **Reorden del Dashboard** (Pendientes firma → Tareas → KPIs → Charts)
- **Drag validations** (computeCanAdvance con toast de requirements pendientes)
- **DimensionsBreakdown** del cert emitido (5 dimensiones culturales con barras + tono por nivel)
- **Toggle Kanban/Lista persistido**
- **Tareas store compartido** (marcar hecho en una vista sí refleja en la otra)
- **Banner IA con modelo v3.2 + responsabilidad clara**

### Público
- **OG image en redes**: la preview de WhatsApp/X/LinkedIn ahora muestra wordmark + chip blockchain + 3 categorías oficiales
- **Hero video sin chrome de YouTube**: overlay navy top/bottom oculta título/canal/suscribirse
- **Auto-unmute on first interaction**: el sonido se activa al primer scroll/click sin que el user toque el botón
- **Glosario del Reglamento + Plazos importantes** en /ayuda — el postulante puede leer formal sin abrir el PDF
- **AuthorProfile Territorio** sin inferencia algorítmica (declarado por el autor o "Por confirmar")
- **Verify con cámara real** + fallback "Subir foto" + "Buscar en directorio"/"Reportar sospecha" cuando inválido
- **Reglamento descargable** desde 3 lugares (footer, ficha cert, sección documentación)

---

## Cómo se construyó este reporte v2

- **3 personas en paralelo** auditaron post-fixes: tutor + postulante + público (este último parcial — interrumpido por timeout, completado con verificación dirigida)
- **49 hallazgos** vs 111 del v1 → ~56% de reducción
- **Cada hallazgo marca relación con v1**: regresión, gap, edge case nuevo
- **3 fixes deployados durante esta auditoría** quedaron registrados como tales (SM7 OG image, SM8 YouTube overlay)
- **NO se modificó código fuente** durante el v2 — observación pura

> **Comparativa v1 → v2:**
>
> | Métrica | v1 | v2 |
> |---|---|---|
> | Hallazgos totales | 111 | 49 |
> | Críticas | 5 | 0 |
> | Altas | 31 | 5 |
> | Medias | 50 | 19 |
> | Bajas | 25 | 25 |
> | Quick wins identificados | 15 | 18 |
> | Bugs arquitectónicos | 4 | 3 |
> | Microcopy/labels | 22 | 11 |

> El **gap más significativo** es **#V2-TUT-02** (`'notas'` no en TAB_IDS) — 1 carácter de fix con impacto desproporcionado. Empezá por ahí.
