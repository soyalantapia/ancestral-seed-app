# 🧪 Prompt de testeo QA manual — Ancestral Seed

> Pegá este documento a quien vaya a testear (persona o agente IA), o seguilo vos
> mismo. El objetivo: **entender todo lo que hace la plataforma y en qué estado
> está**, y dejar una lista de errores accionable que podamos arreglar por
> severidad.

---

## 0. Cómo usar este prompt

- **Si lo hacés a mano:** abrí cada pantalla, seguí los pasos, y marcá cada caso
  como ✅ (pasa) / ❌ (falla) / ⚠️ (raro) en la columna **Resultado**, con una nota.
- **Si se lo das a un agente IA:** que ejecute cada caso, marque el resultado y al
  final entregue (a) la tabla completa y (b) la lista de bugs con la plantilla del
  punto 7.
- No hace falta ser técnico: alcanza con usar la app como un usuario real y anotar
  lo que se rompe, confunde o se ve mal.

---

## 1. Qué es lo que estás testeando

**Ancestral Seed** certifica la **autenticidad cultural** de un producto, servicio
u oficio ancestral de Latinoamérica. Emite un **certificado digital** verificable
(QR / blockchain) y un **perfil público** del autor. El público objetivo son
**artesanos y comunidades** → la app es **mobile-first** y el lenguaje debe ser
**digno, claro y neutro**.

**3 roles:**
- **Público** (sin login): explora el directorio, verifica certificados.
- **Postulante** (el que se certifica): inicia y sigue su certificación. ← *foco principal*
- **Tutor** (evaluador): gestiona casos, evalúa y firma.

Es un **prototipo con datos simulados** (no hay backend real): los pagos, PDFs y
emails son mock.

---

## 2. Estado actual — qué cambió recién (poné el foco acá)

Veníamos de un rediseño grande; esto es lo nuevo/sensible:

1. **La página principal del postulante ahora es "Certificaciones"** (antes había
   "Inicio" y "Documentos", **eliminados**; `/inicio` y `/documentos` redirigen).
2. **Sidebar simplificado:** Certificaciones · Pagos · Perfil · Configuración ·
   Ayuda · **Tutorial**.
3. **Demo enfocado:** hay **una sola certificación en curso** ("Filigrana
   ancestral").
4. **Pagos centraliza las facturas:** toda compra pagada se ve y se descarga desde
   ahí (ya no hay página de Documentos).
5. **"Tutorial"** dispara un **recorrido guiado de 6 pasos**.

**Notas conocidas (NO son bugs):**
- En "Postergadas" puede figurar (1) por un borrador de prueba; en sesión limpia es 0.
- En la consola del navegador en modo dev puede aparecer un warning de HMR
  (`createRoot…`); no ocurre en producción.

---

## 3. Acceso

- **URL a testear:** **http://localhost:5175/**
  ⚠️ Testeá **acá** (localhost). La versión publicada en internet todavía es la
  **vieja** (sin estos cambios).
- **Entrar como postulante:** *Acceder* → **cualquier email con formato válido**
  (ej. `test@test.com`) + **una clave de 6+ caracteres** → *Iniciar sesión* →
  caés en **Certificaciones**.
- **Entrar como tutor:** ya logueado, abrí el **menú de usuario** (arriba a la
  derecha) → **"Cambiar a panel de tutor"**.
- **Probá en desktop Y en mobile** (achicá la ventana o usá el modo responsive del
  navegador, ~390px de ancho).

---

## 4. Escala de severidad (para clasificar lo que encuentres)

| | Nivel | Qué significa |
|---|---|---|
| 🔴 | **Crítico** | Rompe / bloquea: crash, pantalla en blanco, no se puede continuar. |
| 🟠 | **Alto** | Funciona mal o muestra datos incorrectos / flujo roto (aunque haya rodeo). |
| 🟡 | **Medio** | UX confusa, inconsistencia visible, copy/jerga, algo que despista. |
| 🔵 | **Bajo** | Cosmético / pulido (espaciados, colores, microcopy). |

---

## 5. Casos de prueba

> Columna **Resultado**: ✅ / ❌ / ⚠️ + nota. Si falla, anotá la severidad.

### Suite A — Acceso, navegación y layout

| ID | Qué probar | Resultado esperado | Resultado |
|----|------------|--------------------|-----------|
| A1 | Login con email válido + clave 6+ | Entra y cae en **Certificaciones** | |
| A2 | Login con email inválido o clave <6 | Muestra error claro, **no** entra | |
| A3 | Escribir en la URL `/inicio`, `/documentos`, `/dashboard` | Redirige a Certificaciones (sin pantalla en blanco) | |
| A4 | Sidebar desktop | Exactamente: Certificaciones, Pagos, Perfil, Configuración, Ayuda, Tutorial + Cerrar sesión. Cada uno navega; el activo se resalta | |
| A5 | Sidebar mobile | Botón "Menú" abre el drawer con los mismos ítems; al tocar uno navega y cierra | |
| A6 | Logo (arriba izq) estando logueado | Lleva a Certificaciones | |
| A7 | Menú de usuario (arriba der) | Opciones (Mi perfil, Mis certificaciones, Configuración, Cambiar a panel de tutor, Cerrar sesión) funcionan | |
| A8 | Cerrar sesión | Vuelve a login; con "atrás" no se cuela al panel | |
| A9 | Botón flotante de ayuda (?） abajo der | Abre el panel de ayuda y **no tapa** botones/CTAs | |

### Suite B — Certificaciones (lista + detalle)

| ID | Qué probar | Resultado esperado | Resultado |
|----|------------|--------------------|-----------|
| B1 | La lista principal | Muestra **1** cert: "Filigrana ancestral · En curso (Prediagnóstico)", con su estado y "Te falta para avanzar" | |
| B2 | Sub-pestañas (En curso/En emisión/Certificadas/Denegadas/Postergadas) | Cambian el filtro; las vacías muestran **mensaje claro** (no error/blanco) | |
| B3 | Buscador + filtros + orden | Filtran/ordenan la lista correctamente | |
| B4 | Botón "Continuar" / "Ver solicitud" | Abre el detalle de la cert | |
| B5 | Detalle: encabezado | Nombre del producto, número, estado y progreso; barra con 4 tabs: Seguimiento, Evaluación, Evidencias, Pagos | |
| B6 | Cada tab del detalle | Renderiza sin error; Seguimiento = etapas; Evidencias = archivos; Pagos = arancel | |
| B7 | Acción / próximo paso del detalle | Es clara y su botón lleva a donde dice | |
| B8 | URL directa a una cert inexistente (`/mis-certificaciones/req-999`) | "Solicitud no encontrada" (sin crash) | |

### Suite C — Formulario de certificación (7 pasos)

| ID | Qué probar | Resultado esperado | Resultado |
|----|------------|--------------------|-----------|
| C1 | "+ Nueva" / "Empezar" | Abre el formulario; si hay borrador, ofrece **Retomar / Empezar de nuevo** | |
| C2 | Paso Identidad | Orden: nombre → email → país (banderas + buscador) → teléfono (prefijo según país) → provincia adaptada al país. **Cada select** tiene buscador + flechita visible | |
| C3 | Validaciones | Dejar campos vacíos y avanzar → mensajes claros en español ("Completá este campo"), **consistentes** en todo el form | |
| C4 | Opción "Otro" en cualquier select | Aparece un **input** para aclarar | |
| C5 | Autosave | Cargar algo, salir y volver → se conserva el borrador (silencioso, sin cartel molesto) | |
| C6 | "Postergar" | Guarda y vuelve a Certificaciones; el borrador aparece en "Postergadas" | |
| C7 | Completar los 7 pasos | Llega a envío / checkout sin trabarse | |

### Suite D — Pagos y facturas

| ID | Qué probar | Resultado esperado | Resultado |
|----|------------|--------------------|-----------|
| D1 | Pantalla Pagos | Muestra el arancel **pendiente** ($45.000) + totales; el copy **no** suena amenazante | |
| D2 | Botón "Pagar" | Abre el checkout con concepto, monto y vencimiento correctos | |
| D3 | Pago con **Tarjeta** | El botón Pagar está **deshabilitado** hasta cargar datos válidos; con datos válidos se habilita y confirma | |
| D4 | Pago con **Transferencia** | Muestra datos bancarios + pide **subir comprobante** | |
| D5 | Después de pagar | La compra pasa a "Pagado" y aparece **"Ver factura"** sin recargar | |
| D6 | "Ver factura" | Modal con emisor (Ancestral Seed), "Facturado a: tu nombre", concepto, total y sello "Pagada" | |
| D7 | "Descargar PDF" | Descarga la factura (aviso "Factura descargada"), sin error | |
| D8 | Buscar facturas en otro lado | Ya **no** existe "Documentos"; todo lo de facturas vive en **Pagos** | |

### Suite E — Recorrido guiado (pestaña Tutorial)

| ID | Qué probar | Resultado esperado | Resultado |
|----|------------|--------------------|-----------|
| E1 | Tocar "Tutorial" | Arranca el recorrido ("Cómo funciona · 1/6") | |
| E2 | Cada paso | Resalta el elemento correcto (lista, botón Nueva, tabs del detalle, botón de ayuda) | |
| E3 | Navegación del recorrido | Cruza de Certificaciones → detalle sin romperse | |
| E4 | Controles | Anterior / Continuar / Saltar funcionan; **Esc** cierra | |
| E5 | Último paso | "Empezar mi certificación" abre el formulario y **cierra** el recorrido | |
| E6 | En mobile | El recorrido también funciona (cartel/resaltado legibles) | |
| E7 | Lenguaje | Neutro, digno, frases cortas | |

### Suite F — Perfil, Configuración, Ayuda

| ID | Qué probar | Resultado esperado | Resultado |
|----|------------|--------------------|-----------|
| F1 | Perfil | Carga; el checklist (si aparece) está colapsado tipo "Te falta: …" | |
| F2 | Configuración | Carga; las opciones se ven y responden sin romper | |
| F3 | Ayuda | Carga; "Ver cómo funciona" **re-dispara** el recorrido | |
| F4 | Exportar mis datos (si lo encontrás) | Lenguaje claro (sin "ZIP/JSON/SLA" sin explicar) | |

### Suite G — Lado público (sin login / cerrá sesión)

| ID | Qué probar | Resultado esperado | Resultado |
|----|------------|--------------------|-----------|
| G1 | Home `/` | Video (se pausa/silencia bien), sección "LatAm al mundo" con stats (+20 países, +800 pueblos, 9%, +500 lenguas), blockchain explicado simple | |
| G2 | Directorio `/directorio` | Lista de certificados + búsqueda/filtros | |
| G3 | Ficha de autor `/autor/...` | Perfil público del artesano | |
| G4 | Certificado público `/certificado/...` | Detalle + verificación | |
| G5 | Verificar `/verificar` | Flujo de verificación por QR / ID | |
| G6 | Nosotros / Legal / Denuncias | Cargan sin error | |

### Suite H — Lado tutor (menú de usuario → "Cambiar a panel de tutor")

| ID | Qué probar | Resultado esperado | Resultado |
|----|------------|--------------------|-----------|
| H1 | Acceso al panel tutor | Entra a `/tutor/dashboard` | |
| H2 | Dashboard tutor | KPIs, tareas y agenda visibles | |
| H3 | Casos → abrir un caso | Tabs (resumen, evidencias, evaluación, **notas internas**, mensajes, historial); **Notas internas NO debe tirar error** | |
| H4 | Certificaciones emitidas | Tabla con estados | |
| H5 | "Volver al panel solicitante" | Regresa al panel del postulante | |

### Suite I — Responsive / estados / accesibilidad

| ID | Qué probar | Resultado esperado | Resultado |
|----|------------|--------------------|-----------|
| I1 | Todo a ~390px (mobile) | Nada se corta horizontal; textos legibles; botones tappables | |
| I2 | Estados vacíos | Tabs/listas sin items → mensaje claro (no blanco/error) | |
| I3 | URL inexistente (`/cualquiercosa`) | Página 404 con forma de volver | |
| I4 | Teclado | Se puede tabular por formularios; el foco se ve | |
| I5 | Scroll horizontal | **No** debe existir en ninguna pantalla | |

### Suite J — Contenido y tono (clave para este público)

| ID | Qué probar | Resultado esperado | Resultado |
|----|------------|--------------------|-----------|
| J1 | Lenguaje | Neutro de género y digno; nada de jerga despectiva | |
| J2 | Jerga técnica | "blockchain/hash/QR" explicados simple; sin "SLA/ZIP/JSON" crudos | |
| J3 | Datos a la vista | Nombres reales de producto (no IDs tipo "req-001"); estados claros | |
| J4 | Copys de pago | No suenan amenazantes | |

---

## 6. Recorridos "estrella" (si tenés poco tiempo, hacé estos 3 de punta a punta)

1. **Postulante feliz:** Login → Certificaciones → abrir la cert → ver Seguimiento/
   Evidencias/Pagos → **pagar el arancel** (tarjeta) → **ver y descargar la factura**.
2. **Onboarding:** Tocar **Tutorial** → seguir los 6 pasos → terminar en el formulario
   → cargar el paso de Identidad (país con bandera, "Otro" → input).
3. **Tutor:** Menú de usuario → "Cambiar a panel de tutor" → abrir un caso → entrar a
   **Notas internas** (no debe romper) → volver al panel solicitante.

---

## 7. Plantilla para reportar cada bug

```
[ID o #]  Título corto y claro
Severidad: 🔴 / 🟠 / 🟡 / 🔵
Dónde:     (pantalla + URL) · (Desktop / Mobile)
Pasos:     1)…  2)…  3)…
Esperado:  …
Real:      …
Captura:   (si tenés, adjuntá)
```

---

## 8. Cómo cerramos el loop

Cuando termines, **pegame de vuelta**:
1. La **tabla de resultados** (con ✅/❌/⚠️ y notas), y
2. La **lista de bugs** usando la plantilla del punto 7.

Los priorizamos y arreglamos por severidad: **primero 🔴 y 🟠**, después 🟡/🔵.
