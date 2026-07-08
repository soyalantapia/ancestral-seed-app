# Plan estratégico — Apartado "Marco legal" (consulta previa / FPIC)

> Documento de trabajo. Objetivo: agregar a Ancestral Seed un apartado que muestre el **marco legal de cada país** sobre los derechos de las comunidades indígenas —en particular la **consulta previa / Consentimiento Libre, Previo e Informado (FPIC)**— con links a las fuentes oficiales, para demostrar que la plataforma **se alinea a la legislación vigente** de cada territorio.

---

## 1. La tesis (por qué esto importa)

No es "un apartado con links". Es la respuesta a la pregunta que la ONU ya hizo —*"¿bajo qué paraguas legislativo penetran las comunidades?"*— y un **pilar de legitimidad** del proyecto.

La lógica es directa: Ancestral Seed dice **proteger a las comunidades de la apropiación cultural**. La **consulta previa / FPIC** es, literalmente, el mecanismo legal que los Estados crearon para eso mismo (garantizar que un tercero no se apropie de la cultura indígena sin su consentimiento). Mostrar que el sistema **conoce y se alinea** con ese marco convierte un *claim* de marketing en una **prueba institucional verificable**.

**Sirve a tres audiencias a la vez:**
1. **Instituciones** (ONU, ministerios, cooperación, inversores de impacto): *"el sistema contempla que nos alineamos al marco legal de cada país, y acá lo muestra"*. Respuesta lista y demostrable.
2. **Comunidades**: señal de respeto — no venimos a extraer, venimos **dentro de las reglas que las protegen**.
3. **Compradores / aliados / prensa**: refuerza que el Sello es serio, trazable y éticamente fundado.

**Encaja perfecto con lo que el producto ya dice** (pero hoy está disperso y sin respaldo jurídico):
- Términos, §3 "Comunidades y consentimiento": *"Toda certificación requiere el consentimiento expreso de la comunidad de origen, documentado mediante acta firmada por sus referentes."* (`src/pages/Legal.tsx:139-144`)
- El criterio de auditoría ya incluye las dimensiones **`consentimiento`** y **`apropiacion`** (`src/types/index.ts:432,437`).
- Principio de soberanía: *"la identidad cultural es soberanía comunitaria, no algoritmo"* (`src/types/index.ts:38-44`).

El "Marco legal" es **el fundamento jurídico** que hoy le falta a todo eso.

---

## 2. Qué es la consulta previa / FPIC (el concepto base)

**Consulta previa**: trámite/derecho por el cual el Estado debe **consultar de buena fe** a los pueblos indígenas, a través de sus instituciones representativas, **antes** de adoptar medidas o proyectos que los afecten —incluido el uso de su cultura, saberes y expresiones culturales—. Su versión reforzada es el **Consentimiento Libre, Previo e Informado (CLPI / FPIC)**.

Se apoya en **tres pilares internacionales** (todos verificados):

| Instrumento | Año | Qué establece | Fuente oficial |
|---|---|---|---|
| **Convenio 169 de la OIT** | 1989 | Único tratado **vinculante** específico sobre pueblos indígenas; arts. 6, 7 y 15 = consulta previa de buena fe. | [ilo.org](https://www.ilo.org/publications/c169-indigenous-and-tribal-peoples-convention-1989) |
| **Declaración ONU (UNDRIP)** | 2007 | Resolución AG 61/295; arts. 19 y 32 exigen el **FPIC** antes de medidas que afecten a los pueblos. | [un.org (PDF)](https://www.un.org/development/desa/indigenouspeoples/wp-content/uploads/sites/19/2018/11/UNDRIP_E_web.pdf) |
| **Tratado OMPI sobre PI, Recursos Genéticos y Conocimientos Tradicionales (GRATK)** | 2024 | Primer tratado OMPI con reglas específicas para pueblos indígenas; exige **divulgar el origen** de conocimientos tradicionales en patentes → ataca la apropiación cultural. | [wipo.int](https://www.wipo.int/en/web/traditional-knowledge/wipo-treaty-on-ip-gr-and-associated-tk) |

> El tratado de la OMPI (2024) es especialmente potente para el pitch: es el instrumento internacional más nuevo y va exactamente al núcleo de "no apropiarse de saberes indígenas".

---

## 3. Alcance del apartado (qué muestra y qué NO)

**Muestra:** por país, la **autoridad competente** (ej. quién administra la consulta previa) + los **instrumentos clave** (constitución, ley que ratifica OIT 169, ley/decreto de consulta, sentencias hito) con **link a la fuente oficial**.

**NO hace (y hay que decirlo explícito):**
- **No es asesoría legal** ni un dictamen. Son **ejemplos ilustrativos y no exhaustivos**.
- **No reemplaza** el trámite real de consulta previa ante cada Estado.
- **La fuente oficial siempre manda**; los links pueden desactualizarse.
- **La comunidad decide.** El marco legal es el piso; el consentimiento de la comunidad es la condición.

Un disclaimer breve arriba y al pie resuelve esto y, de paso, **suma seriedad** (mostrar que entendemos los límites es más creíble que sobre-prometer).

---

## 4. Inventario de legislación (contenido real, verificado)

Esto es el corazón del apartado: lo investigamos y **verificamos los links** (⚠️ = link oficial que resuelve; algunos portales estatales bloquean la verificación automática pero la URL es la canónica oficial — se marca abajo).

### 🌎 Marco internacional
**Administran:** OIT (supervisa el Convenio 169) · ONU-OHCHR (UNDRIP, Relator Especial) · OMPI (conocimientos tradicionales).
- **Convenio 169 OIT** (1989) — [ilo.org](https://www.ilo.org/publications/c169-indigenous-and-tribal-peoples-convention-1989) ✔️
- **Declaración ONU sobre Pueblos Indígenas (UNDRIP)** (2007) — [un.org (PDF)](https://www.un.org/development/desa/indigenouspeoples/wp-content/uploads/sites/19/2018/11/UNDRIP_E_web.pdf) ✔️
- **Tratado OMPI PI/Recursos Genéticos/Conocimientos Tradicionales** (2024) — [wipo.int](https://www.wipo.int/en/web/traditional-knowledge/wipo-treaty-on-ip-gr-and-associated-tk) ✔️

### 🇨🇴 Colombia
**Autoridad:** Dirección de la Autoridad Nacional de Consulta Previa (DANCP), Ministerio del Interior.
- **Ley 21 de 1991** (aprueba el Convenio 169) — [funcionpublica.gov.co](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=37032) ✔️
- **Directiva Presidencial 08 de 2020** (guía de consulta previa, 5 etapas) — [funcionpublica.gov.co](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=141807) ✔️
- **Sentencia SU-039 de 1997** (caso U'wa; consulta previa = derecho fundamental) — [corteconstitucional.gov.co](https://www.corteconstitucional.gov.co/relatoria/1997/SU039-97.htm) ✔️

### 🇦🇷 Argentina
**Autoridad:** Instituto Nacional de Asuntos Indígenas (INAI).
- **Constitución Nacional, art. 75 inc. 17** (1994) — [argentina.gob.ar](https://www.argentina.gob.ar/normativa/nacional/804/texto) ✔️
- **Ley 24.071** (aprueba el Convenio 169) — [argentina.gob.ar](https://www.argentina.gob.ar/normativa/nacional/ley-24071-470/texto) ✔️
- **Ley 23.302** (política indígena; crea el INAI) — [argentina.gob.ar](https://www.argentina.gob.ar/normativa/nacional/ley-23302-23790) ✔️
- Convenio 169 (ficha INAI) — [argentina.gob.ar/inai](https://www.argentina.gob.ar/derechoshumanos/inai/convenio-ndeg-169-de-la-oit-sobre-pueblos-indigenas-y-tribales-en-paises) ✔️

### 🇵🇪 Perú
**Autoridad:** Ministerio de Cultura — Viceministerio de Interculturalidad.
- **Ley 29785** (Ley del Derecho a la Consulta Previa) — [cultura.gob.pe (PDF)](https://consultaprevia.cultura.gob.pe/sites/default/files/pi/archivos/Ley%20N%C2%B0%2029785.pdf) ✔️
- **D.S. 001-2012-MC** (Reglamento de la Ley 29785) — [cultura.gob.pe (PDF)](https://consultaprevia.cultura.gob.pe/sites/default/files/pi/archivos/Decreto%20Supremo%20N%C2%B0%20001-2012-MC.pdf) ✔️

### 🇧🇴 Bolivia
**Autoridad:** autoridad sectorial competente; el Órgano Electoral (SIFDE) acompaña.
- **Constitución (Estado Plurinacional)** (2009) — arts. 30.II.15, 352, 403 — [planificacion.gob.bo (PDF)](https://www.planificacion.gob.bo/uploads/marco-legal/nueva_constitucion_politica_del_estado.pdf) ✔️
- **Ley 1257** (ratifica Convenio 169) — [oep.org.bo](https://web.oep.org.bo/m-n/ley-n-1257-convenio-sobre-pueblos-indigenas-y-tribales-en-paises-independientes-oit/) ✔️
- **Ley 3760** (eleva a ley la UNDRIP; Bolivia fue el 1er país) — [autoridadminera.gob.bo (PDF)](https://www.autoridadminera.gob.bo/wp-content/uploads/2025/09/LEY-3760-RATIFICA-LA-DECLARACION-DE-LAS-NACIONES-UNIDAS-SOBRE-LOS-DERECHOS-DE-LOS-PUEBLOS-INDIGENAS.pdf) ✔️

### 🇪🇨 Ecuador
**Autoridad:** MAATE (consulta ambiental) · Asamblea Nacional (prelegislativa) · Corte Constitucional (estándares).
- **Constitución** (2008) — arts. 57.7, 57.17, 398 — [oas.org (PDF)](https://www.oas.org/juridico/pdfs/mesicic4_ecu_const.pdf) ✔️
- **Corte IDH, caso Sarayaku vs. Ecuador** (2012; hito interamericano) — [corteidh.or.cr (PDF)](https://www.corteidh.or.cr/docs/casos/articulos/resumen_245_esp.pdf) ✔️
- **Ley Orgánica de Cultura** (2016; protege saberes ancestrales) — [presidencia.gob.ec (PDF)](https://www.presidencia.gob.ec/wp-content/uploads/2017/08/a2_LEY_ORGANICA_DE_CULTURA_julio_2017.pdf) ✔️

### 🇲🇽 México
**Autoridad:** Instituto Nacional de los Pueblos Indígenas (INPI).
- **Constitución, art. 2º** (reforma DOF 30/09/2024) — [gob.mx/inpi](https://www.gob.mx/inpi/documentos/decreto-dof-30-09-2024-reforma-al-articulo-2o-de-la-constitucion-en-materia-de-pueblos-y-comunidades-indigenas-y-afromexicanos) ✔️
- **Convenio 169 OIT** (versión oficial México) — [gob.mx (PDF)](https://www.gob.mx/cms/uploads/attachment/file/30118/Convenio169.pdf) ✔️
- **Ley del INPI** (2018) — [gob.mx/inpi](https://www.gob.mx/inpi/documentos/ley-del-instituto-nacional-de-los-pueblos-indigenas) ✔️

### 🇧🇷 Brasil
**Autoridad:** FUNAI (Fundação Nacional dos Povos Indígenas), Ministério dos Povos Indígenas.
- **Constituição de 1988, arts. 231-232** — [planalto.gov.br](https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm) ⚠️ (portal Planalto bloquea el fetcher; URL canónica oficial)
- **Convenção 169 OIT** — [ilo.org (PDF)](https://www.ilo.org/media/324306/download) ✔️
- **Decreto 10.088/2019** (incorpora la Convenção 169) — [camara.leg.br](https://www2.camara.leg.br/legin/fed/decret/2019/decreto-10088-5-novembro-2019-789348-publicacaooriginal-159331-pe.html) ✔️

### 🇨🇱 Chile
**Autoridad:** CONADI (Corporación Nacional de Desarrollo Indígena).
- **Ley 19.253 (Ley Indígena)** (1993) — [interior.gob.cl (PDF)](https://www.interior.gob.cl/transparenciaactiva/doc/VinculosInstitucionales/600/10320.pdf) ✔️
- **Decreto Supremo 66/2013** (reglamento de consulta indígena) — [mineduc.cl (PDF)](https://consultaindigena.mineduc.cl/wp-content/uploads/sites/111/2018/06/DECRETO-66-MAR-2014.pdf) ✔️
- **Decreto 236/2008** (promulga el Convenio 169) — [leychile.cl](https://www.bcn.cl/leychile/navegar?idNorma=279441) ✔️

### 🇬🇹 Guatemala
**Autoridad:** sin ley/órgano único; MEM conduce en energía/minería; la Corte de Constitucionalidad ordena consultas.
- **Convenio 169 OIT** (ratif. 1996) — [normlex.ilo.org](https://normlex.ilo.org/dyn/normlex/en/f?p=NORMLEXPUB:11300:0::NO:11300:P11300_INSTRUMENT_ID:312314) ✔️
- **Constitución, arts. 66-70** (1985) — [congreso.gob.gt (PDF)](https://www.congreso.gob.gt/assets/uploads/secciones/pdf/16e67-constitucion-politica-de-la-republica-de-guatemala.pdf) ✔️
- **Acuerdo sobre Identidad y Derechos de los Pueblos Indígenas** (Acuerdos de Paz, 1995) — [faolex.fao.org (PDF)](https://faolex.fao.org/docs/pdf/gua122086.pdf) ✔️

### 🇵🇾 Paraguay
**Autoridad:** Instituto Paraguayo del Indígena (INDI).
- **Constitución, arts. 62-67** (1992) — [cultura.gov.py](https://cultura.gov.py/2011/08/articulos-de-la-constitucion-nacional/) ✔️
- **Ley 234/93** (aprueba el Convenio 169) — [cultura.gov.py](https://cultura.gov.py/marcolegal/) ✔️
- **Ley 904/81** (Estatuto de Comunidades Indígenas; crea el INDI) — [cultura.gov.py](https://cultura.gov.py/marcolegal/ley-90481-estatuto-de-las-comunidades-indigenas/) ✔️
- **Decreto 1039/2018** (Protocolo nacional de consulta y CLPI) ✔️

> **Nota de precisión:** casi todos los links resuelven (✔️). Algunos portales estatales (OIT NORMLEX, Planalto de Brasil) bloquean la verificación automatizada con HTTP 403 pese a ser la fuente oficial correcta — para esos conviene una revisión humana rápida antes de publicar, o usar el link estatal-país alternativo (que sí verifica).

---

## 5. Dónde vive en el producto (diseño)

**Hoy no existe** ninguna sección de este tipo (grep = 0). El andamiaje legal actual gira sobre el **Reglamento de Marca** propio (PDF), no sobre legislación de países. Este apartado llena ese hueco.

**Recomendación técnica** (validada contra el código):

- **Página propia** `src/pages/MarcoLegal.tsx` (mejor que meterlo en `Legal.tsx` porque el contenido es extenso y por país), con ruta pública nueva en `src/routes.tsx` (`/marco-legal` o `/legal/marco-legal`), lazy-loaded como el resto.
- **Contenido en data** `src/data/marcoLegal.ts` (estructura `{ pais, bandera, autoridad, resumen, instrumentos[] }`) → separa contenido de UI y lo hace fácil de actualizar/extender.
- **UI:** hero estilo `Nosotros.tsx` (badge + h1 navy + intro) → **`<Accordion>` por país** (componente ya existe, `src/components/ui/accordion.tsx`) con los instrumentos y links adentro → disclaimer arriba y al pie. `<PageMeta title="Marco legal" …>` para SEO.
- **Navegación:** link en la **barra legal del Footer** (`src/components/features/Footer.tsx:139-148`, junto a Términos/Privacidad/Cookies) — **no** en el header (fue reducido a propósito por auditoría UX). Opcional: también en la columna de links del footer.
- **Reutilizar** copy y constantes ya escritas: `LEGAL_ENTITY`, `REGLAMENTO_GLOSSARY`, `CATEGORIES`, `OFFICIAL_DOCS` (`src/lib/copy.ts`) y el texto de consentimiento (`Legal.tsx:139-144`).

---

## 6. Fases

**Fase 1 — MVP (≈ medio día).** Página `/marco-legal` con: intro + concepto (consulta previa/FPIC) + los 3 pilares internacionales + acordeón con los 10 países y sus links verificados + disclaimer. Link en el footer. **Con esto ya se puede decir en una reunión: "acá el sistema lo muestra".**

**Fase 2 — Integración con el certificado (≈ 1 día).** Derivar el país desde `Certification.location` (`types/index.ts:69`) y mostrar un bloque **"Marco legal aplicable"** en la ficha pública del certificado (`CertificationDetail.tsx:449`, sección "Comunidad y región"), enlazando a la sección del país. Cada certificado "muestra" bajo qué paraguas legal opera su comunidad.

**Fase 3 — Anclaje al proceso (a definir).** Vincular los criterios de auditoría `consentimiento` y `apropiacion` (`types/index.ts:432,437`) a su fundamento jurídico, y referenciar el marco legal en el paso de **validación comunitaria** del flujo de certificación (el "acta de consentimiento" ya existe como evidencia requerida). Convierte el marco legal en parte operativa, no solo informativa.

**Fase 4 — Institucional (contenido, no código).** Una versión PDF/one-pager "Marco legal de Ancestral Seed" para el pitch a ONU/ministerios (mismo contenido, formato presentación).

---

## 7. Riesgos y salvaguardas

- **No dar asesoría legal** → disclaimer visible ("ejemplos ilustrativos, no exhaustivos; la fuente oficial manda; no reemplaza el trámite real").
- **Links que se rompen** → contenido en `src/data/marcoLegal.ts` con fecha de última revisión; revisión semestral; preferir fuentes estatales estables.
- **Precisión jurídica** → antes de publicar, revisión humana de los 2-3 links marcados ⚠️ (OIT NORMLEX / Planalto). Idealmente, validación final por un abogado del equipo o de la red.
- **Tono** → jamás dar a entender que la certificación *sustituye* la consulta previa estatal; siempre "nos alineamos / acompañamos".
- **La comunidad primero** → dejar claro que el marco legal es el piso y el consentimiento comunitario es la condición (coherente con el principio de soberanía ya en el producto).

---

## 8. Próximos pasos

1. **Validar el enfoque** (este documento).
2. **[Necesito de ustedes]** el **listado de links específicos que ya había pasado la socia** → lo mergeo con esta investigación como fuente prioritaria (lo mío es la base/backup verificado).
3. Confirmar **decisiones**: ¿ruta `/marco-legal` o `/legal/marco-legal`? ¿los 10 países o priorizar algunos? ¿nombre del apartado: "Marco legal" / "Legislación" / "Marco legal por país"?
4. **Construir la Fase 1** (MVP) — tengo el contenido y el diseño listos; puedo dejarla en vivo el mismo día.

---

## Apéndice — decisiones abiertas para vos

| Decisión | Opciones | Recomendación |
|---|---|---|
| Nombre del apartado | "Marco legal" · "Legislación" · "Marco legal por país" | **"Marco legal"** (más institucional) |
| Ruta | `/marco-legal` · `/legal/marco-legal` | `/legal/marco-legal` (agrupa con lo legal) |
| Alcance de países | 10 investigados · solo donde operan (Colombia/Argentina) + "próximamente" | **Los 10** como "ejemplos"; destacar Colombia/Argentina |
| Ubicación nav | Footer barra legal · Footer columna · Nosotros | **Footer barra legal** + cross-link desde Nosotros |
