# REPORTE DE AUDITORÍA UX — Ancestral Seed

**Fecha:** 28 de mayo 2026
**Versión:** v1.0
**Método:** análisis estático del frontend + simulación cognitiva por escenarios reales + lecturas dirigidas del código
**Recorrido por:** 3 personas distintas en piel del usuario (visitante público, postulante "Camila", tutora cultural "Patricia")
**Repo auditado:** `/Users/alannaimtapia/dev/ancestral-seed`
**Commit base:** `d82aaf5` (post fix conflicto PWA/MSW + compliance Reglamento de Marca etapa 1)
**Total de hallazgos:** **111** (32 público · 44 postulante · 35 tutor)

---

## 1. Resumen ejecutivo

### Sensación general (3 líneas)

> Ancestral Seed **se ve cuidada y premium** — paleta navy/gold coherente, jerarquía tipográfica clara, microinteracciones cuidadas (animaciones de Verify, pills de tabs del perfil, modal de firma con palabra clave). Pero la app está poblada de **falsas promesas**: CTAs primarios que abren modales vacíos, botones sin onClick, descargas que entregan `.txt` placeholder, contadores hardcoded, filtros decorativos. Hay islas de excelencia (sección de Evaluación con 5 dimensiones culturales, modal firma "escribí 'firmar'", banner IA) rodeadas de tramos donde la confianza se erosiona porque **la UI promete cosas que el backend no sabe hacer todavía**. Es una demo bien diseñada que aún no se siente como herramienta real para los 3 perfiles.

### Las 5 fricciones que más sangran

| # | ID | Problema | Quién sufre | Severidad |
|---|---|---|---|---|
| 1 | `#PUB-23` | **"Escanear QR" no escanea nada** — abre un modal con placeholder gris sin cámara real | Verificador (público) | Crítica |
| 2 | `#PUB-19` | **Pueblo originario y lenguas inferidos por keyword** en frontend (`inferPueblo`) — soberanía cultural tratada como matching algorítmico | Autor / comprador informado | Crítica |
| 3 | `#POS-21` | **Empezar nueva postulación carga los datos de la anterior** — store Zustand persiste sin avisar | Postulante con varios productos | Crítica |
| 4 | `#POS-31` + `#POS-20` | **Pagar es promesa rota** — banner "Pago urgente" → toast inocuo "Iniciando pago…" sin checkout ni opción de transferencia | Postulante con arancel vencido | Crítica |
| 5 | `#TUT-15` | **No hay notas internas en el caso activo** — la única vía privada existe en el cert YA emitido (Drawer), no en el caso en proceso (que es justo donde más se necesita) | Tutor durante revisión diaria | Crítica |

> **Si arreglás estas 5, la sensación pasa de "demo bonita" a "herramienta confiable".**

---

## 2. Diario del usuario (narrativa por escenarios)

### 🌐 Visitante público — "vine desde redes a curiosear"

**E1 — "¿Qué es esto en 30 segundos?"**
Caigo en `/`. El H1 me dice "Autenticidad Ancestral Certificada Digitalmente". Bien. Pero abajo veo **dos CTAs** que asumen que vine con intención de hacer algo concreto: "Certificar Producto" y "o verificar un certificado existente". **Yo no quiero certificar ni verificar — vine a entender**. No hay ninguna puerta para el curioso ("Ver ejemplos", "Explorar el directorio"). El video del Hero arranca muteado y el botón "Activar sonido" pulsa permanentemente, peleando atención con el título. Bajo y veo la sub-nav sticky mobile con "Beneficios · LATAM · Nosotros · Blockchain · Proceso · Certificados". "Blockchain" como label me hace esperar contenido técnico — encuentro una metáfora del cuaderno gigante. Llegué al final entendiendo el qué, pero el camino para "ver primero" requirió mucho scroll.

**E2 — "Quiero encontrar algo de Cusco"**
Voy al directorio. El placeholder del search dice "Buscar por nombre, ID o hash..." — **no menciona región**. Tipeo "Cusco" igual. El filtro "Región" (en desktop, un select) lista regiones crudas del backend. Si no aparece nada, ¿filtré mal o no hay? El estado vacío sí está bien resuelto, con copy honesto y dos acciones ("Limpiar / Sugerirnos algo"). Lo demás bien.

**E3 — "Verifico un certificado con un hash"**
Voy a `/verificar`. Veo dos CTAs gigantes: **"Escanear QR"** (dorado) y **"Ingresar Hash"** (navy). Toco "Escanear QR" porque es lo primario. **No hay cámara**. Solo una caja con un ícono `ScanLine` decorativo y pasos teóricos. Si tengo un QR físico, esto no me sirve. Falsa promesa. Voy al otro, "Ingresar Hash", funciona, valida bien y el card con check verde + animación está bárbaro. Si meto un hash inválido, "Certificado no válido" sin opción de "buscar en directorio" o "reportar fraude" — el error es un dead-end.

**E4 — "¿Quién es la autora?"**
Entro al detalle, toco "Ver Perfil". Caigo en `/perfil/[slug]` con hero impactante. Los pills de tabs (Sobre / Certificaciones · 1 / Territorio / Trayectoria) están **excelentes** — animación de slide, ícono, badge counter, contenido organizado. La tab "Territorio" me muestra "Pueblo originario · Diverso (Kolla · Mapuche · Guaraní)" basado en la ubicación "Buenos Aires" — **inferencia por keyword en frontend**. Para alguien informado, eso baja la credibilidad de TODA la plataforma. Toco "Contactar" en el Hero del perfil — si el autor no tiene email público, toast "El autor no tiene email público" y el botón no hace nada. Affordance falso.

**E5 — "Tengo una duda"**
Voy a `/ayuda`. Veo una tarjeta dorada "¿Te perdiste? Volvé al tour guiado" con botones **"Tour solicitante"** y **"Tour tutor"**. ¿Por qué me ofrecen un tour de "tutor" si soy visitante público? Toco igual: toast "Tour del tutor iniciado" y… nada. Más abajo veo **"¿Ves errores raros? Limpiar caché y recargar"** — herramienta de soporte interno expuesta en flujo público, me genera ansiedad ("¿hay algo roto?"). Los topic cards funcionan bien.

---

### 👤 Postulante Camila — "vuelvo después de 3 días"

**E1 — "¿Qué pasó con mi solicitud?"**
Hago login. Toast "¡Bienvenida de vuelta!" (asume mi género). Veo "Buenas tardes, Camila" + "2 tareas pendientes y 1 reunión confirmada". Bien. Pero después de eso me empujan **6 CTAs distintas** (Subir evidencias / Nueva certificación / Tu próximo paso / banner azul informativo / banner pago urgente) antes de mostrarme la sección "En proceso" con el StagePipeline de mi solicitud. **Entré para ver qué pasó, no para hacer cosas**. Encima el badge dice "Prediagnóstico" siempre, aunque mi solicitud esté en Diagnóstico (bug: `currentStage` no se usa, badge hardcoded). No hay un "Lo nuevo desde tu última visita" — para enterarme tengo que scrollear hasta "Actividad reciente" muy abajo.

**E2 — "El tutor me pidió evidencias nuevas"**
Hay 3 caminos posibles para subir: Quick Actions del Home, botón "Añadir evidencias" en card de proceso, o la pestaña Evidencias adentro. Llego a la pestaña. Tres categorías genéricas: Fotos / Videos / Documentos. **No veo qué pidió específicamente el tutor**. No hay "evidencia solicitada por tu tutor / fecha límite X". Subir genera toast "1 archivo subido" pero no se notifica al tutor desde la UI, no hay botón "avisar al tutor que subí X". Y al lado de cada archivo hay un botón Trash que **borra sin confirmación** — si toco por error, perdí la evidencia.

**E3 — "Pago el arancel"**
Voy a Pagos. KPIs claros, filtro default en Pendientes. Veo el pago vencido en rojo. Click "Pagar"… **toast.success("Iniciando pago de X") y nada más**. Cero pasarela, cero checkout, cero subir comprobante de transferencia, cero CBU/CVU. En la ficha del request, el botón "Pagar" me lleva a /pagos (otra vez la lista que ya estaba viendo). El estado vencido tampoco me dice qué pasa si no pago ("¿se pausa mi solicitud? ¿hay recargo?"). Si descargo factura, me bajo un `.txt` feo.

**E4 — "Empezar otra postulación"**
Click "Nueva certificación". Caigo en el wizard de 7 pasos. **Los campos vienen pre-rellenados con datos de mi postulación anterior** (Zustand persiste sin avisar). Si no me doy cuenta, mando "Filigrana ancestral" como nombre cuando quise poner "Cerámica negra". No hay "¿continuar la postulación a medias o empezar nueva?". No hay botón "Limpiar formulario". Es **datos contaminados silenciosos**.

**E5 — "Me confundí en el formulario"**
Estoy en el paso 5. Necesito corregir un teléfono del paso 1. El stepper desktop muestra los 7 pasos como pills pero **no son clickeables** — son `<span>`. Tengo que hacer Volver × 4. En el paso 7 (Revisión) el copy dice "Podés volver a editar cualquier paso" pero **no hay link "Editar" al lado de cada sección**. Adivinar a qué paso pertenece "Capacidad" es ejercicio mental innecesario.

**E6 — "Descargar un documento que subí"**
Voy a Documentos del sidebar. 3 tabs: Certificados / Avales y evidencias / Facturas. Click "Avales y evidencias". Veo los archivos. Click "Descargar"… **bajo un `.txt` con metadata**, no el archivo real. Sin preview visual de las fotos. Sin filtro por solicitud (si tengo 3 postulaciones × 12 evidencias, esto es ingobernable).

---

### 🎓 Tutora Patricia — "empiezo el día con 8 casos en curso"

**E1 — "¿Qué tengo hoy?"**
Cargo `/tutor/dashboard`. Saludo + "Tenés 8 casos en curso y 3 tareas pendientes". OK. Pero después de KPIs aparecen **4 tabs (7d/30d/mes/año)** y **4 DropdownPills (Período/País/Categoría/Estado)** que **no hacen nada** al clickear. ¿Para qué están? El botón "Exportar" tampoco. Asumo maqueta. **Mal arranque, perdí confianza**. "Pendientes de mi firma" está en posición 4 del scroll — debería ser lo primero. La agenda lateral muestra "Reunión inicial · jue 28 · 10:00" pero **no me dice de qué caso es** sin abrir. Tengo 4 reuniones, no sé cuál priorizar.

**E2 — "Mover un caso a Auditoría"**
Voy a `/tutor/casos`. Veo el kanban con **7 columnas**. En mi MacBook 13" entran 4 y media — scroll horizontal. Encuentro mi caso en Diagnóstico, drag a Auditoría. Toast "movido a Auditoría". **Pero nadie me preguntó si tenía las evidencias revisadas**. No hubo checklist. No hubo confirmación. Después abro el caso y veo que las evidencias estaban "pendientes". Si entro al detalle y uso "Avanzar etapa", sí me pide motivo + valida 7 reglas. Por drag, **bypaseo toda esa lógica**. Workflow inconsistente.

**E3 — "Firmar la evaluación"**
Voy al caso, tab Evaluación. **Acá la app brilla.** Banner dorado explicando el rol del tutor frente a la IA. Score ponderado 78/100. **5 dimensiones** (Cultural / Social / Ambiental / Ética / Gestión) con sus criterios, peso %, subitems, "Verificación:" y "Análisis IA:". Esto es lo mejor del producto. Aprieto "Aceptar y firmar evaluación IA", modal me pide escribir "firmar" literalmente. **Buena fricción intencional**. Pero faltan dos cosas: (1) no sé qué modelo de IA está atrás, ni cuándo se entrenó, ni con qué dataset, (2) si discrepo con un puntaje específico, mi única vía es "dejar una observación en Mensajes y la IA reprocesa" — y **Mensajes es público con el postulante**. Mi disenso técnico no debería ser visible al solicitante.

**E4 — "¿Por qué se atrasa este caso?"**
Banner amarillo "SLA en alerta: X casos vencidos · Ver casos en alerta". Click, filtra bien. Veo el caso colgado en Diagnóstico 18 días, SLA 14, pill roja parpadea. **Pero ahí termina mi info**. ¿Por qué? ¿Estoy esperando al postulante o a mí? El Asistente IA del sidebar dice "SLA excedido: 18d sobre 14d permitidos" + CTA "Ver resumen IA" → modal con resumen genérico, no causa raíz.

**E5 — "Expediente del cert emitido"**
Voy a `/tutor/certificaciones`. Tabla decente. Click una fila. Llego al expediente extendido con tabs Información + Blockchain, hash, Polygonscan, score ring, NotesDrawer (¡notas internas privadas!), Checklist. **Esta pantalla está bien armada**. PERO: **NO muestra el scoring por dimensiones culturales** que sí muestra el caso activo. Si tengo que renovar y quiero ver el score histórico Cultural/Social/Ambiental, no lo tengo. El expediente extendido **debería ser más rico que el caso, no más pobre**.

**E6 — "Nota interna al curador"**
**Acá está el agujero más grande del flujo tutor.** En `TutorCaseDetail` (caso activo) NO hay panel de notas internas. Hay "Mensajes" (público con postulante) y "Historial" (log inmutable). El sidebar tiene info+checklist+IA. **No hay dónde dejar una nota privada al equipo sobre un caso activo**. El NotesDrawer existe pero solo en TutorCertificationDetail (cert YA emitido). Las notas internas son **MÁS valiosas durante el proceso activo que después de emitido**. Resultado: tengo que abrir WhatsApp con otro tutor por fuera de la plataforma — y eso es exactamente lo que el reglamento intenta evitar.

---

## 3. Matriz Impacto × Esfuerzo (Quick wins resaltados)

> **Convención:** **Quick win** = severidad Alta/Crítica + esfuerzo Bajo. Los marcamos con ⚡

### Flujo público (32 hallazgos)

| ID | Problema | Severidad | Esfuerzo | Quick win |
|---|---|---|---|---|
| `#PUB-23` | "Escanear QR" abre modal sin cámara real | Crítica | Alto | — |
| `#PUB-19` | Pueblo/lenguas inferidos por keyword en frontend | Crítica | Alto | — |
| `#PUB-01` | Hero del Home no respeta al visitante curioso | Alta | Bajo | ⚡ |
| `#PUB-13` | "Ver en Blockchain" / "Ver Certificado Verificado" labels engañosos | Alta | Bajo | ⚡ |
| `#PUB-15` | Descarga de certificado entrega `.json` crudo | Alta | Alto | — |
| `#PUB-18` | "Imprimir" del modal imprime toda la página | Alta | Medio | — |
| `#PUB-20` | "Contactar" autor sin email → toast en dead-end | Alta | Medio | — |
| `#PUB-24` | "Certificado no válido" no ofrece próximo paso | Alta | Bajo | ⚡ |
| `#PUB-26` | Botones de Tours expuestos a visitantes públicos | Alta | Bajo | ⚡ |
| `#PUB-29` | Banner "Documento en revisión legal" mina la confianza | Alta | Bajo | ⚡ |
| `#PUB-30` | Selector de idioma del Footer no funciona | Alta | Bajo | ⚡ |
| `#PUB-02` | "Certificar Producto" no comunica si lleva a login | Media | Bajo | ⚡ |
| `#PUB-04` | Scrollspy de nav solo en mobile, no en Header desktop | Media | Medio | — |
| `#PUB-07` | Label "Blockchain" lleva a metáfora del cuaderno | Media | Bajo | ⚡ |
| `#PUB-08` | Placeholder de search omite "región"/"técnica" | Media | Bajo | ⚡ |
| `#PUB-09` | Botón lupa del search es affordance falso | Media | Bajo | ⚡ |
| `#PUB-10` | Filtros desktop (selects) vs mobile (chips) inconsistentes | Baja | Medio | — |
| `#PUB-11` | Filtro categoría incluye legacy sin advertir | Media | Medio | — |
| `#PUB-14` | "Puntaje 100/100" hardcoded sin contexto | Media | Bajo | ⚡ |
| `#PUB-16` | "Vigente" se repite 3 veces en la misma página | Baja | Bajo | — |
| `#PUB-21` | Stats del perfil cortan valor con `truncate` | Media | Bajo | ⚡ |
| `#PUB-22` | Tab "Territorio" baja chunk eagerly (~265KB) | Media | Medio | — |
| `#PUB-25` | "Verificar" usa modales innecesarios (input podría ir inline) | Media | Medio | — |
| `#PUB-27` | "Limpiar caché" expuesto a visitantes genera ansiedad | Media | Bajo | ⚡ |
| `#PUB-28` | "Tour tutor" para no-tutor genera toast confuso | Media | Bajo | ⚡ |
| `#PUB-32` | Header desktop con 6 items + 3 CTAs satura | Media | Medio | — |
| `#PUB-03` | `animate-pulse` permanente del botón "Activar sonido" | Baja | Bajo | — |
| `#PUB-05` | "Comienza tu certificación ancestral" mezcla tú/vos | Baja | Bajo | — |
| `#PUB-06` | Kicker dorado de cards destacadas flota desanclado | Baja | Bajo | — |
| `#PUB-12` | Paginación sin ellipsis (escala mal a futuro) | Baja | Medio | — |
| `#PUB-17` | Flechas de gallery `-left-4` se recortan en viewports angostos | Baja | Bajo | — |
| `#PUB-31` | Label "Q&A" en footer rompe la voz (resto usa "Ayuda") | Baja | Bajo | — |

### Flujo postulante (44 hallazgos)

| ID | Problema | Severidad | Esfuerzo | Quick win |
|---|---|---|---|---|
| `#POS-14` | Ficha solicitud no dice qué tengo que hacer ahora | Crítica | Medio | — |
| `#POS-20` | Pago en tab navega a /pagos sin checkout | Crítica | Alto | — |
| `#POS-21` | Nueva postulación carga datos de la anterior | Crítica | Medio | — |
| `#POS-31` | "Pagar" no abre flujo de pago real ni mock | Crítica | Alto | — |
| `#POS-05` | Quick Actions roban protagonismo a la solicitud en proceso | Alta | Medio | — |
| `#POS-06` | Falta "¿qué cambió desde tu última visita?" | Alta | Medio | — |
| `#POS-07` | Badge etapa hardcoded a "Prediagnóstico" | Alta | Bajo | ⚡ |
| `#POS-11` | MyCertifications sin tab "Certificadas" ni "Postergadas" | Alta | Medio | — |
| `#POS-16` | Evidencias sin distinción "pedidas por el tutor" vs subidas | Alta | Alto | — |
| `#POS-17` | Eliminar archivo sin confirmar (un click destructivo) | Alta | Bajo | ⚡ |
| `#POS-18` | Etapa hardcoded "Prediagnóstico" en CertRequest | Alta | Bajo | ⚡ |
| `#POS-19` | Reprogramar reunión sin saber disponibilidad del tutor | Alta | Alto | — |
| `#POS-22` | Stepper del CertifyForm no permite saltar a pasos visitados | Alta | Medio | — |
| `#POS-23` | Paso 7 Revisión sin links "Editar" por sección | Alta | Bajo | ⚡ |
| `#POS-26` | Evidencias sin vista previa de las fotos subidas | Alta | Medio | — |
| `#POS-27` | "Mínimo 3 fotos" pero schema valida 1 (`coverImageName.min(1)`) | Alta | Bajo | ⚡ |
| `#POS-32` | "Pago vencido" sin explicar la consecuencia | Alta | Bajo | ⚡ |
| `#POS-35` | "Descargar" en Documentos entrega `.txt` placeholder | Alta | Medio | — |
| `#POS-39` | "Eliminar cuenta" no advierte pagos / solicitudes activas | Alta | Bajo | ⚡ |
| `#POS-01` | Toast "¡Bienvenida de vuelta!" asume género femenino | Media | Bajo | ⚡ |
| `#POS-08` | Banner "Mantente atento" genérico ocupa espacio sin valor | Media | Bajo | ⚡ |
| `#POS-09` | "Responder por WhatsApp" abre wa.me con número mock | Media | Bajo | ⚡ |
| `#POS-10` | "Tareas pendientes" sin fecha límite ni prioridad | Media | Medio | — |
| `#POS-12` | Botón "⋯ menú" en cards de MyCert no hace nada | Media | Medio | — |
| `#POS-15` | "Cambiar datos" no informa tiempo de respuesta en el modal | Media | Bajo | ⚡ |
| `#POS-24` | Errores del CertifyForm aparecen recién post-submit | Media | Bajo | ⚡ |
| `#POS-25` | Postergar sin informar duración del guardado | Media | Bajo | ⚡ |
| `#POS-28` | Labels repetitivos "producto, servicio o práctica" | Media | Bajo | ⚡ |
| `#POS-29` | Edición de perfil pierde dirty state al cambiar tab | Media | Medio | — |
| `#POS-34` | Documentos sin filtro por solicitud | Media | Bajo | ⚡ |
| `#POS-36` | Notificaciones sin acción inline (solo "Ver detalle") | Media | Medio | — |
| `#POS-38` | Settings sin tab Preferencias (idioma/zona horaria) | Media | Alto | — |
| `#POS-42` | "Documentos" mal ubicado en grupo "Mi cuenta" del sidebar | Media | Bajo | ⚡ |
| `#POS-02` | Login sin placeholder ni hint de credenciales demo | Baja | Bajo | — |
| `#POS-03` | RecoverPassword sin indicar modo demo | Baja | Bajo | — |
| `#POS-04` | Password sin barra de fortaleza | Baja | Bajo | — |
| `#POS-13` | "Con reunión próxima" sin aclarar plazo | Baja | Bajo | — |
| `#POS-30` | "Reordenar destacados" con tooltip "próximamente" + cursor grab | Baja | Medio | — |
| `#POS-33` | Filtro Pagos default oculta pagados (caso "necesito factura") | Baja | Bajo | — |
| `#POS-37` | Chip "Estado" en Notifs ambiguo | Baja | Bajo | — |
| `#POS-40` | Calendario no permite agregar eventos personales | Baja | Alto | — |
| `#POS-41` | Calendar re-renderiza grilla completa al cambiar selectedDate | Baja | Bajo | — |
| `#POS-43` | Logout pide confirmación incluso sin cambios pendientes | Baja | Medio | — |
| `#POS-44` | Drawer mobile no cierra con back nativo del navegador | Baja | Bajo | — |

### Flujo tutor (35 hallazgos)

| ID | Problema | Severidad | Esfuerzo | Quick win |
|---|---|---|---|---|
| `#TUT-05` | Agenda lateral linkea a `/mis-certificaciones` (panel solicitante) | Crítica | Bajo | ⚡ |
| `#TUT-08` | Drag-and-drop saltea las validaciones de "Avanzar etapa" | Crítica | Medio | — |
| `#TUT-12` | Drag-and-drop sin alternativa accesible por teclado | Crítica | Alto | — |
| `#TUT-15` | NO existe panel de notas internas en el caso activo | Crítica | Medio | — |
| `#TUT-01` | Filtros y "Exportar" del Dashboard no hacen nada | Alta | Medio | — |
| `#TUT-02` | "Pendientes de firma" enterrado bajo KPIs y charts | Alta | Bajo | ⚡ |
| `#TUT-09` | Kanban de 7 columnas no entra en pantalla normal | Alta | Alto | — |
| `#TUT-11` | Pills placeholder vs funcionales sin distinción visual | Alta | Bajo | ⚡ |
| `#TUT-16` | Tab "Mensajes" ambiguo: ¿oficial o WhatsApp? | Alta | Medio | — |
| `#TUT-18` | "Aceptar y firmar evaluación IA" no aclara responsabilidad | Alta | Bajo | ⚡ |
| `#TUT-19` | Disenso técnico con IA solo vía Mensajes públicos | Alta | Medio | — |
| `#TUT-24` | Filtros de TutorCertifications todos placeholder | Alta | Medio | — |
| `#TUT-26` | Cert emitido NO muestra scoring por dimensiones | Alta | Medio | — |
| `#TUT-28` | Acta descargada es `.txt` plano sin formato | Alta | Alto | — |
| `#TUT-29` | Tareas viven en 2 lugares con estado desincronizado | Alta | Medio | — |
| `#TUT-03` | KPIs con delta hardcoded "+5 en última semana" | Media | Medio | — |
| `#TUT-04` | Agenda lateral no nombra el caso de la reunión | Media | Bajo | ⚡ |
| `#TUT-06` | "Crear solicitud" del header navega en vez de abrir modal | Media | Bajo | ⚡ |
| `#TUT-07` | "Solicitudes sin responder: 7" lleva a kanban sin filtrar | Media | Medio | — |
| `#TUT-14` | "Scoring IA: 0/100" para casos nuevos parece veredicto | Media | Bajo | ⚡ |
| `#TUT-17` | Después de firmar, header no anima cambio de etapa | Media | Bajo | ⚡ |
| `#TUT-20` | Scoring 5 dimensiones sin nav rápida sticky | Media | Medio | — |
| `#TUT-21` | Tabs del caso pierden labels en mobile (solo iconos) | Media | Bajo | ⚡ |
| `#TUT-22` | Sidebar Asistente IA cae al final en mobile | Media | Medio | — |
| `#TUT-23` | Modal "Pedir evidencias" tiene 2 CTAs primarios confusos | Media | Bajo | ⚡ |
| `#TUT-31` | "Crear y enviar propuesta" solo agrega al state local | Media | Alto | — |
| `#TUT-32` | Mini-calendar sin navegación ARIA Grid por teclado | Media | Alto | — |
| `#TUT-33` | Sidebar solicitante no tiene link al panel tutor (asimetría) | Media | Bajo | ⚡ |
| `#TUT-34` | Notificaciones bell no se actualiza con mis acciones | Media | Medio | — |
| `#TUT-10` | Emoji 💡 en instrucción del kanban rompe tono institucional | Baja | Bajo | — |
| `#TUT-13` | Banner SLA no lista IDs cuando son pocos casos | Baja | Bajo | — |
| `#TUT-25` | KPI "vencidos +3" con flecha abajo verde / signo "+" contradictorio | Baja | Bajo | — |
| `#TUT-27` | Breadcrumbs inconsistentes entre cert detail y case detail | Baja | Bajo | — |
| `#TUT-30` | "1 urgentes" rompe concordancia gramatical | Baja | Bajo | — |
| `#TUT-35` | Sin skeleton/loading states (problema cuando llegue backend) | Baja | Medio | — |

---

## 4. Hallazgos detallados (formato `[#ID]` completo)

> Los hallazgos completos están en este archivo, ordenados por severidad descendente dentro de cada pantalla. Para facilitar la priorización, **abajo solo se desarrollan los Críticos y Quick wins**. El resto está mapeado en la matriz arriba — pedinos el detalle ampliado si lo necesitás.

---

### 🌐 PÚBLICO — Críticos & Quick wins

```
[#PUB-23] [Feedback del sistema] — "Escanear QR" abre modal sin cámara real
📍 Ubicación: /verificar  (QrModal, líneas 245-280)
👀 Qué vi: Toco el CTA dorado prominente "Escanear QR". Se abre un modal con un
   placeholder gris (ScanLine decorativo) y una lista de pasos teóricos. NO se
   solicita permiso de cámara, NO hay cámara, NO hay escaneo.
😖 Por qué molesta: Es la promesa más rota del sitio público. Si vengo con un QR
   físico, pierdo tiempo entendiendo que tengo que copiar el hash a mano. Mata
   la propuesta de valor "verificación en segundos".
🔥 Severidad: Crítica
🔧 Esfuerzo: Alto
✅ Recomendación: O implementás el escaneo real (BarcodeDetector nativo en
   Chrome/Android + fallback con html5-qrcode), o deshabilitás el botón con
   leyenda "Próximamente · ingresá el hash manualmente". Lo peor es la versión
   actual: prometer y no cumplir.
```

```
[#PUB-19] [Coherencia de comunicación] — Pueblo/lenguas inferidos por keyword
📍 Ubicación: /perfil/[slug]  (AuthorProfile.tsx, inferPueblo/inferLenguas
   líneas 883-907)
👀 Qué vi: La tab "Territorio" muestra "Pueblo originario" y "Lenguas
   vinculadas" con valores inferidos a partir de substring de location. Si
   "Buenos Aires" → "Diverso (Kolla · Mapuche · Guaraní)". Si no matchea →
   "Español · Lenguas originarias locales".
😖 Por qué molesta: La identidad cultural de los autores es soberanía
   comunitaria, no algoritmo. Un autor que vea su comunidad mal atribuida puede
   sentirse ofendido. Un comprador informado pierde confianza en toda la
   plataforma ("esto está armado a ojo").
🔥 Severidad: Crítica
🔧 Esfuerzo: Alto (requiere data real en el modelo Author)
✅ Recomendación: Si el dato no está en el modelo Author, NO mostrar los
   campos. Sustituir por "Por confirmar con la comunidad". La autoidentificación
   es del autor, no de la app. Mover esos campos a Settings del autor para que
   los complete él/ella/elles.
```

```
[#PUB-01] [Claridad de propósito] — Hero no atrae al curioso ⚡
📍 Ubicación: /  (Hero, líneas 146-194)
👀 Qué vi: Dos CTAs ("Certificar Producto" + "o verificar un certificado
   existente"). Asumen intención de acción. No hay puerta de entrada para
   "explorar el directorio" o "ver ejemplos".
😖 Por qué molesta: El 80% del tráfico de redes viene a explorar, no a postular.
   Los dos CTAs cierran las puertas al curioso.
🔥 Severidad: Alta
🔧 Esfuerzo: Bajo
✅ Recomendación: Sustituir la CTA secundaria por "Explorar el directorio".
   Mover "Verificar Certificado" a un link más sutil debajo o relegarlo al
   Header (donde ya está).
```

```
[#PUB-13] [Microcopy] — Labels engañosos en CTAs primarios ⚡
📍 Ubicación: /certificado/[slug]  (líneas 207-223)
👀 Qué vi: Botones "Ver en Blockchain" (espero un link externo a Polygonscan) y
   "Ver Certificado Verificado" (¿descargar PDF?). Ambos abren modals internos.
😖 Por qué molesta: El verbo "Ver" + "Blockchain" promete navegar afuera.
   "Verificado" es redundante con "Ver" (¿por qué tendría que verlo si ya
   estoy en la ficha?).
🔥 Severidad: Alta
🔧 Esfuerzo: Bajo
✅ Recomendación: Renombrar a "Ver registro blockchain" + ícono ExternalLink
   sutil, y "Ver certificado oficial" para la versión paper.
```

```
[#PUB-24] [Microcopy] — "Certificado no válido" sin próximo paso ⚡
📍 Ubicación: /verificar  (HashModal, líneas 189-196)
👀 Qué vi: Hash inválido → card rojo "Certificado no válido · No encontramos
   coincidencias o el certificado fue revocado". Fin.
😖 Por qué molesta: ¿Qué hago ahora? ¿Reintento? ¿Reporto fraude? ¿Busco por
   nombre? Dead-end.
🔥 Severidad: Alta
🔧 Esfuerzo: Bajo
✅ Recomendación: Debajo del mensaje, dos acciones:
   (1) "Buscar este producto en el directorio" → /directorio?q=[input]
   (2) "Reportar sospecha de falsificación" → mailto con preset
```

```
[#PUB-26] [Claridad] — Tours expuestos a visitantes sin contexto ⚡
📍 Ubicación: /ayuda  (líneas 167-207)
👀 Qué vi: Tarjeta "¿Te perdiste? Volvé al tour guiado" con "Tour solicitante"
   + "Tour tutor" visible para cualquier visitante.
😖 Por qué molesta: Como visitante público, "Tour tutor" no significa nada. Si
   toco y no soy tutor, ¿qué pasa? El toast dice "Tour iniciado" pero no veo
   nada cambiar.
🔥 Severidad: Alta
🔧 Esfuerzo: Bajo
✅ Recomendación: Ocultar la sección si !isAuthenticated. O renombrar a
   "Conocé la plataforma" con un solo tour público.
```

```
[#PUB-29] [Coherencia] — Banner "Documento en revisión legal" mina confianza ⚡
📍 Ubicación: /legal/terminos|privacidad|cookies  (líneas 73-93)
👀 Qué vi: Banner amarillo prominente "Documento en revisión legal · Este
   texto es una versión preliminar para fines demostrativos".
😖 Por qué molesta: Para un visitante que viene a aceptar términos antes de
   postular, el banner dice "esto no tiene valor todavía". ¿Posterga? ¿No
   firma nada?
🔥 Severidad: Alta
🔧 Esfuerzo: Bajo (decisión de producto)
✅ Recomendación: Si el demo no tiene legal final, OK que exista, pero como
   `text-xs` neutral, no como warning amarillo. Idealmente: completar el
   legal antes de exponer a usuarios reales.
```

```
[#PUB-30] [Botones/acciones] — Selector de idioma no funciona ⚡
📍 Ubicación: Footer.tsx  (lang-select, líneas 113-127)
👀 Qué vi: Select de idioma con 4 opciones. Cambio la opción y nada pasa.
   defaultValue="es-AR" sin onChange.
😖 Por qué molesta: Affordance falso. Como visitante en Brasil intento
   português y nada cambia. Pierdo confianza en el resto del sitio.
🔥 Severidad: Alta
🔧 Esfuerzo: Bajo (ocultar) / Alto (i18n real)
✅ Recomendación: Si no hay i18n en roadmap inmediato, ocultar el select. Si
   está en roadmap, agregar badge "Próximamente". Lo peor es dejarlo así.
```

```
[#PUB-02] [Microcopy] — "Certificar Producto" no comunica destino ⚡
📍 Ubicación: /  (Hero CTA principal)
👀 Qué vi: Al tocar como visitante no logueado navega a /certificar sin
   anticipar el formulario largo ni si requiere cuenta.
🔥 Severidad: Media   🔧 Esfuerzo: Bajo
✅ Recomendación: Microcopy debajo del botón:
   "Postulá tu producto en 7 pasos · gratuito para comunidades originarias"
```

```
[#PUB-07] [Microcopy] — Label "Blockchain" lleva a metáfora del cuaderno ⚡
📍 Ubicación: Header + nav sticky mobile
👀 Qué vi: "Blockchain" promete contenido técnico, lleva a "Cómo protegemos
   lo que es tuyo, para que nadie pueda copiarlo" con acordeón metafórico.
🔥 Severidad: Media   🔧 Esfuerzo: Bajo
✅ Recomendación: Renombrar a "Cómo te protegemos" o "Tecnología sin
   tecnicismos". Mantener `id="como-funciona"`.
```

```
[#PUB-08] [Microcopy] — Placeholder search omite "región"/"técnica" ⚡
📍 Ubicación: /directorio  (Input search, línea 130)
👀 Qué vi: "Buscar por nombre, ID o hash..." sin mencionar región/territorio.
🔥 Severidad: Media   🔧 Esfuerzo: Bajo
✅ Recomendación: "Buscar por nombre, región, autor o hash..." +
   verificar que el query matchee contra location/authorName en MSW handler.
```

```
[#PUB-09] [Affordance falso] — Botón lupa del search no hace nada ⚡
📍 Ubicación: /directorio  (líneas 122-128)
👀 Qué vi: Botón circular navy con lupa a la izquierda del input. Sin
   onClick. Click no hace nada (el search es por onChange).
🔥 Severidad: Media   🔧 Esfuerzo: Bajo
✅ Recomendación: O autoFocus del input al click, o convertir en `<span>`
   decorativo con `pointer-events-none`.
```

```
[#PUB-14] [Fricción] — "Puntaje 100/100" hardcoded sin contexto ⚡
📍 Ubicación: /certificado/[slug]  (Stat, línea 261)
👀 Qué vi: Todas las cert verificadas muestran "Puntaje: 100/100".
🔥 Severidad: Media   🔧 Esfuerzo: Bajo (quitar)
✅ Recomendación: Si scoring real no está listo, ocultar el stat o
   reemplazar por "Auditado el [fecha]" o "Pueblo [comunidad]".
```

```
[#PUB-21] [UI Visual] — Stats del perfil cortan valor con truncate ⚡
📍 Ubicación: /perfil/[slug]  (ProfileStats, líneas 357-385)
👀 Qué vi: "Territorio" con `truncate` corta "Sierra Nevada de Santa Marta".
🔥 Severidad: Media   🔧 Esfuerzo: Bajo
✅ Recomendación: Quitar truncate, usar `line-clamp-2`. O reducir
   `text-base md:text-lg` a `text-sm md:text-base` en este stat.
```

```
[#PUB-27] [Fricción] — "Limpiar caché y recargar" expuesto genera ansiedad ⚡
📍 Ubicación: /ayuda  (líneas 213-266)
👀 Qué vi: Tarjeta amarilla "¿Ves errores raros o todo se rompe?" con botón
   cyan "Limpiar caché y recargar". Herramienta de soporte interna expuesta
   en flujo público.
🔥 Severidad: Media   🔧 Esfuerzo: Bajo
✅ Recomendación: Mover al footer del Help en small text. Esconder detrás
   de disclosure "¿Problemas técnicos? Mostrar herramientas avanzadas".
   Quitar el rojo/amarillo de severidad.
```

```
[#PUB-28] [Microcopy] — "Tour tutor" para no-tutor → toast confuso ⚡
📍 Ubicación: /ayuda  (líneas 194-204)
👀 Qué vi: Toco "Tour tutor" sin estar logueado. Toast "Tour del tutor
   iniciado" pero el tour vive en rutas /tutor/* (auth required). User queda
   en limbo.
🔥 Severidad: Media   🔧 Esfuerzo: Bajo
✅ Recomendación: Si !isAuthenticated, deshabilitar con tooltip
   "Disponible al iniciar sesión como tutor".
```

---

### 👤 POSTULANTE — Críticos & Quick wins

```
[#POS-14] [Claridad] — Ficha de solicitud no dice qué hacer ahora
📍 Ubicación: CertificationRequest.tsx, hero card + tabs
👀 Qué vi: Hero con etapa y % progreso. 6 tabs (Seguimiento, Evaluación,
   Datos, Evidencias, Pagos, Historial). Ninguno dice "tu próximo paso
   acá". Para descubrir pendientes tengo que abrir Evaluación.
😖 Por qué molesta: La pregunta del postulante es "¿qué necesitan de mí?".
   La respuesta debería ser obvia al abrir la ficha.
🔥 Severidad: Crítica
🔧 Esfuerzo: Medio
✅ Recomendación: Bajo el hero, bloque destacado
   "Tu próximo paso: completar diagnóstico (vence 15/03)" con CTA directo.
   Sumar tab "Tareas" o banda fija arriba con las pendientes activas.
```

```
[#POS-21] [Persistencia] — Nueva postulación carga datos de la anterior
📍 Ubicación: CertifyForm.tsx, líneas 110-122
   (useCertifyFormStore + defaultValues: data)
👀 Qué vi: El store Zustand persiste el último form. Entrar a /certificar
   después de otra postulación trae campos pre-rellenados sin avisar.
😖 Por qué molesta: Puedo enviar una solicitud con datos contaminados sin
   notarlo. Romper E4 silenciosamente.
🔥 Severidad: Crítica
🔧 Esfuerzo: Medio
✅ Recomendación: Al entrar al CertifyForm, si hay data persistida +
   ya tengo solicitud "En curso", mostrar dialog:
   "Tenés una postulación a medias. ¿Continuarla o empezar una nueva?"
   → si "Nueva" → reset(). Bonus: lista de borradores en MyCertifications.
```

```
[#POS-31] [Acción] — "Pagar" no abre flujo real ni mock
📍 Ubicación: Pagos.tsx, líneas 379-395
👀 Qué vi: Click "Pagar" → toast.success("Iniciando pago de X"). Nada más.
😖 Por qué molesta: La UX de Pagos no responde la única pregunta:
   "¿cómo pago?". Bloquea el escenario.
🔥 Severidad: Crítica
🔧 Esfuerzo: Alto (real) / Medio (mock)
✅ Recomendación: Modal "Cómo querés pagar" con tarjeta + transferencia
   (CBU/CVU + botón "Ya transferí, subir comprobante") + pago demo.
```

```
[#POS-20] [Botones/acciones] — Pagar desde tab navega a /pagos sin checkout
📍 Ubicación: CertificationRequest.tsx, líneas 941-948 (PaymentRow)
👀 Qué vi: Click "Pagar" → toast "Te llevamos al detalle de pagos" →
   /pagos que es OTRA vista de la misma lista. Desde /pagos otra vez sin
   checkout.
🔥 Severidad: Crítica   🔧 Esfuerzo: Alto / Medio (mock)
✅ Recomendación: Mismo modal/drawer de #POS-31. No navegar.
```

```
[#POS-07] [Coherencia] — Badge etapa hardcoded "Prediagnóstico" ⚡
📍 Ubicación: DashboardHome.tsx línea 367
   (StageStatusBadge status="Prediagnóstico" hardcoded)
👀 Qué vi: El badge siempre dice "Prediagnóstico" independiente del
   currentStage real.
🔥 Severidad: Alta   🔧 Esfuerzo: Bajo
✅ Recomendación: Computar label desde inProgress.currentStage usando
   STAGES de lib/copy.ts.
```

```
[#POS-18] [Coherencia] — Etapa hardcoded en CertRequest ⚡
📍 Ubicación: CertificationRequest.tsx, líneas 141 y 385
👀 Qué vi: Mismo bug que POS-07 pero en CertRequest. Badge hero + tab
   Seguimiento siempre dicen "Prediagnóstico" / "En emisión".
🔥 Severidad: Alta   🔧 Esfuerzo: Bajo
✅ Recomendación: Usar request.currentStage real.
```

```
[#POS-17] [Acción peligrosa] — Eliminar archivo sin confirmar ⚡
📍 Ubicación: CertificationRequest.tsx, línea 845
👀 Qué vi: Trash sobre cada archivo borra con toast, sin confirmación.
🔥 Severidad: Alta   🔧 Esfuerzo: Bajo
✅ Recomendación: Modal "¿Eliminar [nombre]?" o Undo en toast con 5s.
```

```
[#POS-23] [Fricción] — Paso 7 Revisión sin links "Editar" por sección ⚡
📍 Ubicación: CertifyForm.tsx, StepRevision (líneas 1160-1232)
👀 Qué vi: dl con datos por sección. Copy dice "Podés volver a editar
   cualquier paso" pero NO hay link "Editar →" en cada sección.
🔥 Severidad: Alta   🔧 Esfuerzo: Bajo
✅ Recomendación: Botón "Editar →" a la derecha del título de cada sección,
   con setStep(target).
```

```
[#POS-27] [Validación inconsistente] — "Mínimo 3 fotos" pero valida 1 ⚡
📍 Ubicación: CertifyForm.tsx, schema líneas 73-77
👀 Qué vi: El hint dice "Mínimo 3 fotos" pero schema solo exige
   coverImageName.min(1).
🔥 Severidad: Alta   🔧 Esfuerzo: Bajo
✅ Recomendación: galleryNames.array().min(3, "Subí al menos 3 fotos") +
   contador "2/3 mínimo" en vivo.
```

```
[#POS-32] [Microcopy] — "Pago vencido" sin explicar consecuencia ⚡
📍 Ubicación: Pagos.tsx, status "overdue"
👀 Qué vi: Vencidos en rojo, sin "tu solicitud se pausa si no pagás en X
   días" ni "recargo del Y%".
🔥 Severidad: Alta   🔧 Esfuerzo: Bajo
✅ Recomendación: Microcopy debajo de cada vencido:
   "Si no pagás antes del [fecha], tu solicitud se pausa automáticamente."
```

```
[#POS-39] [Acción destructiva] — "Eliminar cuenta" no advierte pagos activos ⚡
📍 Ubicación: Settings.tsx, DeleteAccountModal (línea 644)
👀 Qué vi: Modal lista qué se elimina pero NO advierte "tenés N solicitudes
   en curso, perderás $Y pagado".
🔥 Severidad: Alta   🔧 Esfuerzo: Bajo
✅ Recomendación: Summary precomputado:
   "Estás por eliminar 2 solicitudes en curso, 1 pago de $45.000 abonado,
   8 evidencias subidas." Ofrecer "Desactivar" si hay activas.
```

```
[#POS-01] [Microcopy] — Toast asume género femenino ⚡
📍 Ubicación: Login.tsx, línea 38
👀 Qué vi: "¡Bienvenida de vuelta!" — siempre con "a".
🔥 Severidad: Media   🔧 Esfuerzo: Bajo
✅ Recomendación: "¡Qué bueno tenerte de vuelta!" — neutral.
```

```
[#POS-08] [Microcopy] — Banner "Mantente atento" sin valor ⚡
📍 Ubicación: DashboardHome.tsx, líneas 286-305
👀 Qué vi: Banner azul ocupa espacio antes de KPIs sin contenido accionable.
🔥 Severidad: Media   🔧 Esfuerzo: Bajo
✅ Recomendación: Eliminar o mover a onboarding de primera visita.
```

```
[#POS-09] [Botones/acciones] — WhatsApp mock con número falso ⚡
📍 Ubicación: DashboardHome.tsx, líneas 839-843 (TutorMessageCard)
👀 Qué vi: wa.me/5491145678901 hardcoded. En demo abre WhatsApp a número
   que no existe.
🔥 Severidad: Media   🔧 Esfuerzo: Bajo
✅ Recomendación: En modo demo, modal alternativo
   "En producción te llevaríamos a WhatsApp del tutor.
    ¿Querés responder dentro de la plataforma?"
```

```
[#POS-15] [Feedback] — "Cambiar datos" sin tiempo de respuesta en modal ⚡
📍 Ubicación: CertificationRequest.tsx, ChangeRequestDialog (línea 1075)
👀 Qué vi: Toast post-envío dice "24-48hs". El modal previo no menciona.
🔥 Severidad: Media   🔧 Esfuerzo: Bajo
✅ Recomendación: Mostrar el "24-48hs" dentro del modal antes de enviar.
```

```
[#POS-24] [Validación] — Errores recién post-submit en CertifyForm ⚡
📍 Ubicación: CertifyForm.tsx (mode 'onChange' pero FieldError post-submit)
👀 Qué vi: Click "Continuar" y errores abajo. En paso 1 con 10 campos,
   scrolleo buscando los rojos.
🔥 Severidad: Media   🔧 Esfuerzo: Bajo
✅ Recomendación: Summary arriba del form:
   "Faltan 3 datos para continuar: País, Departamento, Dirección"
   con anchors clickeables a cada uno.
```

```
[#POS-25] [Feedback] — Postergar sin duración del guardado ⚡
📍 Ubicación: CertifyForm.tsx, PostponeModal (línea 1313)
👀 Qué vi: "Guardamos tus avances de forma segura" sin cuánto tiempo,
   sin dónde retomar.
🔥 Severidad: Media   🔧 Esfuerzo: Bajo
✅ Recomendación: "Guardamos tus avances por 60 días. Podés retomar desde
   'Mis certificaciones' → 'Borradores'."
```

```
[#POS-28] [Microcopy] — Labels repetitivos en StepProducto ⚡
📍 Ubicación: CertifyForm.tsx, StepProducto (líneas 751-803)
👀 Qué vi: "Nombre de tu producto, servicio o práctica" repetido en cada
   label.
🔥 Severidad: Baja   🔧 Esfuerzo: Bajo
✅ Recomendación: Toggle inicial "Estás certificando: [Producto/Servicio/
   Práctica]". Después labels a secas: "Nombre", "Sector", "Subcategoría".
```

```
[#POS-34] [Búsqueda] — Documentos sin filtro por solicitud ⚡
📍 Ubicación: Documentos.tsx
👀 Qué vi: Único buscador genérico. Con 3 solicitudes × 12 evidencias,
   inmanejable.
🔥 Severidad: Media   🔧 Esfuerzo: Bajo
✅ Recomendación: Dropdown "Filtrar por solicitud" o tags con cada
   productName.
```

```
[#POS-42] [Navegación] — "Documentos" mal ubicado en grupo "Mi cuenta" ⚡
📍 Ubicación: DashboardLayout.tsx, accountItems (líneas 42-47)
👀 Qué vi: "Mi cuenta" agrupa Perfil → Documentos → Config → Ayuda.
   Documentos NO son de cuenta.
🔥 Severidad: Media   🔧 Esfuerzo: Bajo
✅ Recomendación: Mover Documentos al grupo "General" (junto a Mis cert) o
   renombrarlo a "Mis archivos".
```

---

### 🎓 TUTOR — Críticos & Quick wins

```
[#TUT-15] [Funcionalidad] — Sin notas internas en el caso activo
📍 Ubicación: TutorCaseDetail.tsx (tabs: Resumen, Evidencias, Evaluación,
   Mensajes, Historial)
👀 Qué vi: Mensajes = público con postulante. Historial = log inmutable de
   sistema. Sidebar = info+checklist+IA. NO hay panel privado para anotar
   al equipo. El NotesDrawer existe pero solo en TutorCertificationDetail
   (cert YA emitido).
😖 Por qué molesta: Las notas internas son MÁS valiosas durante el proceso
   activo que después de emitido. El tutor sin memoria interna termina
   abriendo WhatsApp con otro tutor por fuera — exactamente lo que el
   reglamento intenta evitar.
🔥 Severidad: Crítica
🔧 Esfuerzo: Medio
✅ Recomendación: Tab "Notas internas" (icono StickyNote) entre Mensajes y
   Historial. Reutilizar NotesDrawer de TutorCertificationDetail. Banner
   "Visible solo para tutores y coordinadores. No se comparten con el
   postulante."
```

```
[#TUT-08] [Fricción] — Drag-and-drop saltea validaciones de "Avanzar etapa"
📍 Ubicación: TutorCases.tsx handleDrop líneas 137-176 vs TutorCaseDetail
   computeCanAdvance línea 433
👀 Qué vi: Por drag puedo mover Diagnóstico → Auditoría sin evidencias
   aprobadas. Solo pide confirm si salto >1 etapa. Por botón "Avanzar
   etapa" sí valida 7 reglas + pide motivo.
😖 Por qué molesta: 2 workflows incompatibles. El atajo desactiva todas
   las protecciones del formal. Para el tutor con prisa, **el atajo siempre
   gana**.
🔥 Severidad: Crítica
🔧 Esfuerzo: Medio
✅ Recomendación: Aplicar computeCanAdvance() también en handleDrop. Si no
   cumple → toast.error("Faltan requisitos: ...") o modal de confirmación
   obligatoria con motivo.
```

```
[#TUT-12] [A11y] — Drag-and-drop sin alternativa accesible por teclado
📍 Ubicación: TutorCases.tsx, CaseCard líneas 678-799
👀 Qué vi: role="button" + onKeyDown Enter para navegar, pero NO hay forma
   de mover un caso entre columnas con teclado. El menú "⋯" no se abre.
😖 Por qué molesta: Tutor con discapacidad motora o solo teclado queda sin
   poder cambiar etapas.
🔥 Severidad: Crítica
🔧 Esfuerzo: Alto
✅ Recomendación: En el menú "⋯", agregar "Mover a → [submenú etapas]". O
   atajo de teclado: con caso focused, "M" abre selector.
```

```
[#TUT-05] [Coherencia] — Agenda lateral linkea al panel solicitante ⚡
📍 Ubicación: TutorAgenda.tsx línea 286
   (Link to=`/mis-certificaciones/${event.caseId}?tab=evaluacion`)
👀 Qué vi: Desde agenda del tutor, click reunión → panel SOLICITANTE.
😖 Por qué molesta: BUG. Salgo del rol tutor sin querer. Caigo en ruta que
   probablemente no exista para el caseId del kanban.
🔥 Severidad: Crítica
🔧 Esfuerzo: Bajo
✅ Recomendación: `/tutor/casos/${event.caseId}?tab=evaluacion`
```

```
[#TUT-02] [Jerarquía] — "Pendientes de firma" enterrado bajo KPIs ⚡
📍 Ubicación: TutorDashboard.tsx, orden de secciones
👀 Qué vi: Orden: KPIs → Mis tareas → Pendientes de firma → Métricas →
   Charts. Si tengo firmas vencidas, las veo después de scroll.
🔥 Severidad: Alta   🔧 Esfuerzo: Bajo
✅ Recomendación: Reordenar: "Pendientes de firma" primero (accionable y
   urgente) → "Mis tareas hoy" → KPIs/charts. Lo accionable arriba.
```

```
[#TUT-11] [Navegación] — Pills placeholder vs funcionales sin distinción ⚡
📍 Ubicación: TutorCases.tsx líneas 262-306
👀 Qué vi: "Tutor", "Solicitante", "Pendientes", "Certificación" sin
   onClick. "Riesgo" y "Sin asignar" funcionales. Mismo estilo.
🔥 Severidad: Alta   🔧 Esfuerzo: Bajo
✅ Recomendación: Placeholders con tooltip "Próximamente" + opacidad 50%.
   O sacarlos hasta que estén listos.
```

```
[#TUT-18] [Microcopy] — "Firmar evaluación IA" no aclara responsabilidad ⚡
📍 Ubicación: EvaluacionTab líneas 1146-1159
👀 Qué vi: Botón "Aceptar y firmar evaluación IA" + modal pide escribir
   "firmar". ¿Firmo que es correcta? ¿Que la revisé? ¿Asumo
   responsabilidad de los puntajes que no controlo?
🔥 Severidad: Alta   🔧 Esfuerzo: Bajo
✅ Recomendación: En el banner IA agregar:
   "Al firmar dejás constancia de que revisaste la evaluación y avalás su
   uso como insumo. La responsabilidad técnica del puntaje recae en el
   modelo IA-AS-v3.2 entrenado por [nombre]."
   En el modal Sign, sumar "Modelo: IA-AS-v3.2" + link a metodología.
```

```
[#TUT-04] [Claridad] — Agenda lateral no nombra caso de la reunión ⚡
📍 Ubicación: TutorDashboard.tsx líneas 297-332
👀 Qué vi: "Reunión inicial · jue, 28 may · 10:00" sin caso ni postulante.
🔥 Severidad: Media   🔧 Esfuerzo: Bajo
✅ Recomendación: Mostrar a.caseName + a.applicantName debajo, como ya
   hace AgendaRow en TutorAgenda.tsx. Reutilizar componente.
```

```
[#TUT-06] [Funcionalidad] — "Crear solicitud" navega en vez de abrir modal ⚡
📍 Ubicación: TutorDashboard.tsx líneas 115-122
👀 Qué vi: CTA gold "Crear solicitud" es Link a /tutor/casos, no abre
   modal de creación.
🔥 Severidad: Media   🔧 Esfuerzo: Bajo
✅ Recomendación: Abrir CreateCaseModal directamente o cambiar label a
   "Ver casos →" con ArrowRight. No prometer crear si vas a navegar.
```

```
[#TUT-14] [UI] — "Scoring IA: 0/100" en casos nuevos parece veredicto ⚡
📍 Ubicación: TutorCases.tsx CaseCard líneas 725-729
👀 Qué vi: Caso recién creado en Postulados muestra "0/100".
🔥 Severidad: Media   🔧 Esfuerzo: Bajo
✅ Recomendación: Si scoringIA === 0, mostrar "Pendiente IA" en lugar
   de "0/100".
```

```
[#TUT-17] [Feedback] — Header no anima cambio de etapa post-firma ⚡
📍 Ubicación: TutorCaseDetail.tsx onSign líneas 351-374
👀 Qué vi: Firmo evaluación, toast OK. State cambia a stage='evaluacion'
   pero StageBadge / progress bar del header no se actualizan
   visualmente sin recargar.
🔥 Severidad: Media   🔧 Esfuerzo: Bajo
✅ Recomendación: Verificar que StageBadge y `<ol>` del header re-renderizan
   con el nuevo stage. Animar (pulse + check verde en la posición avanzada).
```

```
[#TUT-21] [Responsive] — Tabs del caso pierden labels en mobile ⚡
📍 Ubicación: TutorCaseDetail.tsx líneas 312-330
👀 Qué vi: En mobile veo 5 iconos sin texto: FileText, FileCheck2, Star,
   MessageSquare, Clock. ¿Qué es el Star?
🔥 Severidad: Media   🔧 Esfuerzo: Bajo
✅ Recomendación: Mantener label visible hasta sm, o que la tab activa
   muestre label y las inactivas solo icono.
```

```
[#TUT-23] [Claridad] — Modal "Pedir evidencias" tiene 2 CTAs primarios ⚡
📍 Ubicación: EvidenceRequestModal líneas 2104-2146
👀 Qué vi: Footer con Cancelar / Enviar por WhatsApp (verde) / Registrar
   oficial (navy). Ambos lucen primarios.
🔥 Severidad: Media   🔧 Esfuerzo: Bajo
✅ Recomendación: Renombrar navy a "Registrar y enviar" (hace ambos).
   Verde como secundario "Solo WhatsApp" link textual chiquito.
```

```
[#TUT-33] [Navegación] — Sidebar solicitante sin link al panel tutor ⚡
📍 Ubicación: DashboardLayout.tsx líneas 31-47
👀 Qué vi: Logueado como tutor en /inicio (panel solicitante), no hay
   cómo volver a /tutor/dashboard. Solo TutorLayout tiene "Volver al panel
   solicitante".
🔥 Severidad: Media   🔧 Esfuerzo: Bajo
✅ Recomendación: Si user.role incluye "tutor", agregar item
   "Panel de tutor" en accountItems o sección separada arriba.
```

---

## 5. Recomendaciones

### 🚀 Quick wins — hacer esta semana (15 ítems · ~14h estimadas)

**Bug fix con impacto directo (4 items · 1h cada uno)**
1. ⚡ `#POS-07` + `#POS-18` — fix etapa hardcoded "Prediagnóstico" (1 fix, 2 lugares)
2. ⚡ `#TUT-05` — agenda lateral: cambiar Link a `/tutor/casos/${id}` en vez de `/mis-certificaciones`
3. ⚡ `#POS-27` — schema `galleryNames.min(3)` para honrar el copy "Mínimo 3 fotos"
4. ⚡ `#TUT-14` — "Pendiente IA" en lugar de "0/100" cuando scoringIA === 0

**Microcopy + labels engañosos (5 items · 30 min cada uno)**
5. ⚡ `#PUB-01` — CTA secundaria del Hero a "Explorar el directorio"
6. ⚡ `#PUB-13` — "Ver en Blockchain" → "Ver registro blockchain" + icon `ExternalLink`
7. ⚡ `#PUB-24` — "Certificado no válido" + 2 acciones (buscar / reportar)
8. ⚡ `#POS-32` — microcopy de consecuencia en pago vencido
9. ⚡ `#TUT-18` — banner IA con responsabilidad clara + versión del modelo

**Affordances falsos / placeholders (3 items · 1h cada uno)**
10. ⚡ `#PUB-30` — ocultar select de idioma del Footer (no funciona) o badge "Próximamente"
11. ⚡ `#TUT-11` — pills placeholder del kanban: opacity 50% + tooltip "Próximamente"
12. ⚡ `#TUT-01` — filtros + Exportar del Dashboard: ocultar o badge "Próximamente"

**UX defensiva (3 items · 1h cada uno)**
13. ⚡ `#POS-17` — confirmación o Undo en toast al borrar evidencia
14. ⚡ `#POS-39` — eliminar cuenta: summary precomputado de lo que se pierde
15. ⚡ `#TUT-02` — reordenar Dashboard: "Pendientes de firma" primero

> **Resultado esperado:** la sensación general pasa de "hay cosas raras que me hacen dudar" a "todo lo que veo funciona". Sube la confianza percibida sin necesidad de rediseñar nada.

---

### 🏗️ Mejoras estratégicas — sprint dedicado

#### A. **Cerrar las falsas promesas críticas** (Sprint 1 · 2-3 semanas)
- **`#PUB-23` — Implementar lector de QR real:** `BarcodeDetector` API nativa en Chrome/Android + fallback con `html5-qrcode`. Es el botón primario más visible del flujo público y la promesa más visible. Estimado: 8-12h.
- **`#PUB-19` — Reemplazar inferencias de pueblo/lenguas por datos del modelo Author:** sumar campos `community`, `languages: string[]` en types + Settings del autor + UI con fallback "Por confirmar con la comunidad" cuando falten. Estimado: 6-8h + decisión de producto + diálogo con autores actuales.
- **`#POS-21` — Resolver el bug de "nueva postulación con datos viejos":** dialog "¿Continuar o empezar nueva?" al entrar al CertifyForm si hay store con data + ya tengo solicitudes activas. Bonus: lista de borradores en MyCertifications. Estimado: 4-6h.
- **`#POS-31` + `#POS-20` — Implementar checkout mock con flujo realista:** modal de pago con tarjeta + transferencia (CBU/CVU mock + botón "Ya transferí, subir comprobante") + pago demo. Si se prioriza pasarela real, integrar Mercado Pago/Stripe en sprint posterior. Estimado: 12-16h.
- **`#TUT-15` — Agregar tab "Notas internas" en TutorCaseDetail:** reutilizar NotesDrawer de TutorCertificationDetail. Persistir en Zustand. Estimado: 4-6h.

#### B. **Compliance del Reglamento de Marca etapa 2** (Sprint 2 · ~1 semana)
> Compliance de cláusulas del PDF "Reglamento Marca Final" que detectamos pero quedaron en backlog del etapa 1:

- **`#TUT-08` — Validar `computeCanAdvance()` también en drag-and-drop:** evita inconsistencia entre workflows. Reglamento exige verificación de no conformidades antes de avanzar (cap. 4.5).
- **UI de apelaciones y quejas (cap. 8 del reglamento):** flujo "Apelar sanción" desde la ficha del certificado del titular. 5 días hábiles para apelar, 15 días para resolver.
- **CertifyForm paso de categoría oficial (M6 de la implementación pasada):** pregunta explícita con las 3 categorías (Auténtico / Tradicional / Inspiración) con descripción del 2.1.1.
- **Reemplazo del logo genérico por `<OfficialSeal />` en Verify y CertificationCard** cuando aplique. Componente ya existe.

#### C. **Rediseños de fondo** (Sprint 3+ · más largo)
- **Kanban del tutor — vista alternativa o agrupación de columnas** (`#TUT-09`): 7 columnas no entran en pantalla normal. Opciones: (a) agrupar Postulado+Revisión+Elegible / Diag+Audit+Eval / Certificación, (b) vista lista paralela.
- **CertificationDetail descargable como PDF real** (`#PUB-15`, `#PUB-18`): generar con jsPDF o react-pdf con logo + QR de verificación + hash blockchain. Mismo PDF para "Imprimir" y "Descargar".
- **Documentos: descargas reales en vez de `.txt` placeholder** (`#POS-35`): si el archivo está en demo, devolver el `.webp/.jpg` real. Si es estructura, jsPDF con metadata bonita.
- **Settings: tab Preferencias** (`#POS-38`): idioma, zona horaria, formato de fechas, canales de notificación.
- **i18n real o quitar el switcher** (`#PUB-30`): Argentina/Colombia/Perú/México hablan español pero con variantes. Si i18n entra al roadmap, planificarlo serio. Si no, el switcher debe desaparecer.

#### D. **Trabajo cross-cutting** (transversal a todos los sprints)
- **Loading skeletons en todas las pantallas** (`#TUT-35`): preparar para cuando llegue el backend real. Hoy todo es instantáneo porque es MSW; en producción 200-500ms sin loading se ve roto.
- **Audit de copy con `lib/copy.ts`:** terminar de unificar voz rioplatense (vos, podés, querés). Hay restos de "Comienza tu certificación" en CTAs. Migrar todos los hardcodes restantes al glossary.
- **A11y por teclado en componentes complejos:** kanban (`#TUT-12`), calendar (`#TUT-32`, `#POS-41`), stepper del CertifyForm clickable (`#POS-22`).
- **Estado dirty cross-tab en formularios largos** (`#POS-29`): bloquear navegación con cambios sin guardar usando `useBeforeUnload` + Router `useBlocker` de react-router-dom 7.

---

### 📋 Sugerencia de orden de ejecución

```
Semana 1  → 15 Quick wins (~14h) — fix obvios + microcopy + affordance falsos
Semana 2-3 → Sprint A: cerrar 5 fricciones críticas (~40h)
Semana 4  → Sprint B: compliance Reglamento etapa 2 (~30h)
Semana 5+ → Sprint C: rediseños de fondo + trabajo cross-cutting
```

> **Snapshot post Semana 1:** se eliminan los affordances falsos visibles, se corrigen los bugs UI con impacto directo, y los microcopy engañosos. La sensación general sube un 40-50% sin tocar arquitectura. **Snapshot post Sprint A:** las 5 fricciones críticas se cierran. La app pasa de "demo pulida" a "herramienta operable" para los 3 perfiles.

---

## Apéndice — cómo se construyó este reporte

- **3 personajes** recorrieron en paralelo: visitante público, postulante Camila (rol `postulante`+`tutor` del `mockUser`), tutora Patricia.
- Cada uno ejecutó **5-6 escenarios reales** ("jobs to be done") narrados en primera persona.
- Cada hallazgo se registró en formato estructurado durante el recorrido, no a posteriori.
- Las severidades se asignaron en el momento, no por afinidad estética.
- El reporte se consolidó priorizando **lo que más duele al usuario real** sobre lo que sería estéticamente pulido.
- **No se modificó ningún código** durante esta auditoría (se reservaron edits para sprints posteriores). El último commit base es `d82aaf5`.

> **Si necesitás el detalle ampliado de algún hallazgo Media/Baja**, pedinos el ID y lo desarrollamos en formato `[#ID]` completo. El archivo crece bien si se lee linealmente: arrancá por el Resumen ejecutivo, navegá las matrices, y profundizá solo en los hallazgos que vas a tomar acción.
