/**
 * Datos del apartado "Legislación" — marco legal por país sobre derechos
 * de los pueblos indígenas y consulta previa / Consentimiento Libre, Previo
 * e Informado (FPIC).
 *
 * Fuentes oficiales verificadas (investigación 07/2026). Se presentan como
 * EJEMPLOS ILUSTRATIVOS y NO EXHAUSTIVOS — no constituyen asesoría legal ni
 * reemplazan el trámite de consulta previa ante cada Estado. La fuente
 * oficial siempre manda; los links pueden desactualizarse.
 *
 * Estructura pensada para extenderse: agregar países o instrumentos es
 * solo agregar entradas acá, sin tocar la UI.
 */

export type TipoInstrumento =
  | 'Tratado'
  | 'Constitución'
  | 'Ley'
  | 'Decreto'
  | 'Sentencia'
  | 'Acuerdo'

export interface LegalInstrument {
  nombre: string
  anio?: string
  tipo: TipoInstrumento
  url: string
  descripcion: string
}

export interface LegalJurisdiccion {
  id: string
  pais: string
  /** Emoji de bandera para acompañar el título del acordeón. */
  bandera: string
  /** Autoridad competente que administra la consulta previa / asuntos indígenas. */
  autoridad: string
  resumen: string
  instrumentos: LegalInstrument[]
}

/**
 * Los 3 pilares internacionales sobre los que se apoya toda la consulta
 * previa / FPIC en la región. Se muestran destacados, antes del detalle
 * por país.
 */
export const MARCO_INTERNACIONAL: LegalInstrument[] = [
  {
    nombre: 'Convenio 169 de la OIT sobre Pueblos Indígenas y Tribales',
    anio: '1989',
    tipo: 'Tratado',
    url: 'https://www.ilo.org/publications/c169-indigenous-and-tribal-peoples-convention-1989',
    descripcion:
      'Único tratado internacional vinculante específico sobre pueblos indígenas. Sus artículos 6, 7 y 15 establecen la obligación de consulta previa, libre e informada, de buena fe, cada vez que se prevean medidas que puedan afectarlos.',
  },
  {
    nombre: 'Declaración de la ONU sobre los Derechos de los Pueblos Indígenas (UNDRIP)',
    anio: '2007',
    tipo: 'Tratado',
    url: 'https://www.un.org/development/desa/indigenouspeoples/wp-content/uploads/sites/19/2018/11/UNDRIP_E_web.pdf',
    descripcion:
      'Resolución 61/295 de la Asamblea General. Sus artículos 19 y 32 exigen el Consentimiento Libre, Previo e Informado (FPIC) antes de adoptar medidas que afecten a los pueblos indígenas o a sus territorios, cultura y saberes.',
  },
  {
    nombre: 'Tratado de la OMPI sobre Propiedad Intelectual, Recursos Genéticos y Conocimientos Tradicionales Asociados',
    anio: '2024',
    tipo: 'Tratado',
    url: 'https://www.wipo.int/en/web/traditional-knowledge/wipo-treaty-on-ip-gr-and-associated-tk',
    descripcion:
      'Primer tratado de la OMPI con reglas específicas para pueblos indígenas. Obliga a divulgar el origen de los recursos genéticos y conocimientos tradicionales usados en solicitudes de patente — un mecanismo directo contra la apropiación cultural.',
  },
]

export const JURISDICCIONES: LegalJurisdiccion[] = [
  {
    id: 'colombia',
    pais: 'Colombia',
    bandera: '🇨🇴',
    autoridad:
      'Dirección de la Autoridad Nacional de Consulta Previa (DANCP), Ministerio del Interior.',
    resumen:
      'La consulta previa es un derecho fundamental de rango constitucional, reconocido por la Corte Constitucional y administrado por una autoridad nacional específica.',
    instrumentos: [
      {
        nombre: 'Ley 21 de 1991',
        anio: '1991',
        tipo: 'Ley',
        url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=37032',
        descripcion: 'Aprueba e incorpora el Convenio 169 de la OIT al ordenamiento colombiano.',
      },
      {
        nombre: 'Directiva Presidencial 08 de 2020',
        anio: '2020',
        tipo: 'Decreto',
        url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=141807',
        descripcion: 'Guía para la realización de la consulta previa, con sus cinco etapas.',
      },
      {
        nombre: 'Sentencia SU-039 de 1997',
        anio: '1997',
        tipo: 'Sentencia',
        url: 'https://www.corteconstitucional.gov.co/relatoria/1997/SU039-97.htm',
        descripcion:
          'Caso U’wa. La Corte Constitucional reconoce la consulta previa como derecho fundamental.',
      },
    ],
  },
  {
    id: 'argentina',
    pais: 'Argentina',
    bandera: '🇦🇷',
    autoridad: 'Instituto Nacional de Asuntos Indígenas (INAI).',
    resumen:
      'La Constitución reconoce la preexistencia de los pueblos indígenas y el país ratificó el Convenio 169 de la OIT, con el INAI como organismo de aplicación.',
    instrumentos: [
      {
        nombre: 'Constitución Nacional, art. 75 inc. 17',
        anio: '1994',
        tipo: 'Constitución',
        url: 'https://www.argentina.gob.ar/normativa/nacional/804/texto',
        descripcion:
          'Reconoce la preexistencia étnica y cultural de los pueblos indígenas argentinos y garantiza su participación.',
      },
      {
        nombre: 'Ley 24.071',
        anio: '1992',
        tipo: 'Ley',
        url: 'https://www.argentina.gob.ar/normativa/nacional/ley-24071-470/texto',
        descripcion: 'Aprueba el Convenio 169 de la OIT.',
      },
      {
        nombre: 'Ley 23.302 sobre Política Indígena',
        anio: '1985',
        tipo: 'Ley',
        url: 'https://www.argentina.gob.ar/normativa/nacional/ley-23302-23790',
        descripcion: 'Declara de interés nacional la atención a las comunidades indígenas y crea el INAI.',
      },
    ],
  },
  {
    id: 'peru',
    pais: 'Perú',
    bandera: '🇵🇪',
    autoridad: 'Ministerio de Cultura — Viceministerio de Interculturalidad.',
    resumen:
      'Perú tiene una de las leyes de consulta previa más desarrolladas de la región, con reglamento propio y una base de datos oficial de pueblos indígenas.',
    instrumentos: [
      {
        nombre: 'Ley 29785 — Ley del Derecho a la Consulta Previa',
        anio: '2011',
        tipo: 'Ley',
        url: 'https://consultaprevia.cultura.gob.pe/sites/default/files/pi/archivos/Ley%20N%C2%B0%2029785.pdf',
        descripcion:
          'Regula el derecho a la consulta previa de los pueblos indígenas u originarios reconocido en el Convenio 169 de la OIT.',
      },
      {
        nombre: 'Decreto Supremo 001-2012-MC',
        anio: '2012',
        tipo: 'Decreto',
        url: 'https://consultaprevia.cultura.gob.pe/sites/default/files/pi/archivos/Decreto%20Supremo%20N%C2%B0%20001-2012-MC.pdf',
        descripcion: 'Reglamento de la Ley 29785; detalla las siete etapas del proceso de consulta.',
      },
    ],
  },
  {
    id: 'bolivia',
    pais: 'Bolivia',
    bandera: '🇧🇴',
    autoridad: 'Autoridad sectorial competente; el Órgano Electoral Plurinacional (SIFDE) acompaña.',
    resumen:
      'El Estado Plurinacional reconoce ampliamente los derechos indígenas en su Constitución y fue el primer país en elevar la Declaración de la ONU a rango de ley.',
    instrumentos: [
      {
        nombre: 'Constitución Política del Estado, arts. 30, 352 y 403',
        anio: '2009',
        tipo: 'Constitución',
        url: 'https://www.planificacion.gob.bo/uploads/marco-legal/nueva_constitucion_politica_del_estado.pdf',
        descripcion:
          'Garantiza el derecho a la consulta previa, libre e informada de las naciones y pueblos indígena originario campesinos.',
      },
      {
        nombre: 'Ley 1257',
        anio: '1991',
        tipo: 'Ley',
        url: 'https://web.oep.org.bo/m-n/ley-n-1257-convenio-sobre-pueblos-indigenas-y-tribales-en-paises-independientes-oit/',
        descripcion: 'Ratifica el Convenio 169 de la OIT.',
      },
      {
        nombre: 'Ley 3760',
        anio: '2007',
        tipo: 'Ley',
        url: 'https://www.autoridadminera.gob.bo/wp-content/uploads/2025/09/LEY-3760-RATIFICA-LA-DECLARACION-DE-LAS-NACIONES-UNIDAS-SOBRE-LOS-DERECHOS-DE-LOS-PUEBLOS-INDIGENAS.pdf',
        descripcion: 'Eleva a rango de ley la Declaración de la ONU (UNDRIP); Bolivia fue el primer país en hacerlo.',
      },
    ],
  },
  {
    id: 'ecuador',
    pais: 'Ecuador',
    bandera: '🇪🇨',
    autoridad:
      'MAATE (consulta ambiental), Asamblea Nacional (consulta prelegislativa) y Corte Constitucional (estándares).',
    resumen:
      'La Constitución de 2008 reconoce derechos colectivos y el caso Sarayaku ante la Corte Interamericana fijó un estándar regional sobre consulta previa.',
    instrumentos: [
      {
        nombre: 'Constitución de la República, arts. 57 y 398',
        anio: '2008',
        tipo: 'Constitución',
        url: 'https://www.oas.org/juridico/pdfs/mesicic4_ecu_const.pdf',
        descripcion:
          'Reconoce la consulta previa, libre e informada y el derecho a preservar los conocimientos ancestrales.',
      },
      {
        nombre: 'Caso Pueblo Sarayaku vs. Ecuador (Corte IDH)',
        anio: '2012',
        tipo: 'Sentencia',
        url: 'https://www.corteidh.or.cr/docs/casos/articulos/resumen_245_esp.pdf',
        descripcion:
          'Hito interamericano: obliga al Estado a garantizar la consulta previa como derecho de los pueblos indígenas.',
      },
      {
        nombre: 'Ley Orgánica de Cultura',
        anio: '2016',
        tipo: 'Ley',
        url: 'https://www.presidencia.gob.ec/wp-content/uploads/2017/08/a2_LEY_ORGANICA_DE_CULTURA_julio_2017.pdf',
        descripcion: 'Protege los saberes ancestrales y el patrimonio cultural de los pueblos y nacionalidades.',
      },
    ],
  },
  {
    id: 'mexico',
    pais: 'México',
    bandera: '🇲🇽',
    autoridad: 'Instituto Nacional de los Pueblos Indígenas (INPI).',
    resumen:
      'La reforma constitucional de 2024 fortaleció el reconocimiento de los pueblos y comunidades indígenas y afromexicanos como sujetos de derecho público.',
    instrumentos: [
      {
        nombre: 'Constitución, art. 2º (reforma DOF 30/09/2024)',
        anio: '2024',
        tipo: 'Constitución',
        url: 'https://www.gob.mx/inpi/documentos/decreto-dof-30-09-2024-reforma-al-articulo-2o-de-la-constitucion-en-materia-de-pueblos-y-comunidades-indigenas-y-afromexicanos',
        descripcion:
          'Reconoce a los pueblos y comunidades indígenas y afromexicanos como sujetos de derecho público y su derecho a la consulta.',
      },
      {
        nombre: 'Convenio 169 de la OIT (versión oficial México)',
        anio: '1990',
        tipo: 'Tratado',
        url: 'https://www.gob.mx/cms/uploads/attachment/file/30118/Convenio169.pdf',
        descripcion: 'Texto oficial del Convenio 169 ratificado por México.',
      },
      {
        nombre: 'Ley del Instituto Nacional de los Pueblos Indígenas',
        anio: '2018',
        tipo: 'Ley',
        url: 'https://www.gob.mx/inpi/documentos/ley-del-instituto-nacional-de-los-pueblos-indigenas',
        descripcion: 'Crea el INPI como autoridad en materia de pueblos indígenas y afromexicanos.',
      },
    ],
  },
  {
    id: 'brasil',
    pais: 'Brasil',
    bandera: '🇧🇷',
    autoridad:
      'FUNAI (Fundação Nacional dos Povos Indígenas), Ministério dos Povos Indígenas.',
    resumen:
      'La Constitución de 1988 dedica un capítulo a los pueblos indígenas y el país incorporó el Convenio 169 de la OIT por decreto.',
    instrumentos: [
      {
        nombre: 'Constituição Federal, arts. 231 e 232',
        anio: '1988',
        tipo: 'Constitución',
        url: 'https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm',
        descripcion:
          'Reconoce a los indígenas su organización social, costumbres, lenguas y los derechos sobre las tierras que ocupan.',
      },
      {
        nombre: 'Convenção 169 da OIT',
        anio: '1989',
        tipo: 'Tratado',
        url: 'https://www.ilo.org/media/324306/download',
        descripcion: 'Texto de la Convención 169 aplicable en Brasil.',
      },
      {
        nombre: 'Decreto 10.088/2019',
        anio: '2019',
        tipo: 'Decreto',
        url: 'https://www2.camara.leg.br/legin/fed/decret/2019/decreto-10088-5-novembro-2019-789348-publicacaooriginal-159331-pe.html',
        descripcion: 'Consolida e incorpora la Convención 169 de la OIT al derecho brasileño.',
      },
    ],
  },
  {
    id: 'chile',
    pais: 'Chile',
    bandera: '🇨🇱',
    autoridad: 'Corporación Nacional de Desarrollo Indígena (CONADI).',
    resumen:
      'La Ley Indígena y el reglamento de consulta (Decreto 66) regulan la participación de los pueblos originarios, tras la promulgación del Convenio 169.',
    instrumentos: [
      {
        nombre: 'Ley 19.253 — Ley Indígena',
        anio: '1993',
        tipo: 'Ley',
        url: 'https://www.interior.gob.cl/transparenciaactiva/doc/VinculosInstitucionales/600/10320.pdf',
        descripcion: 'Establece normas sobre protección, fomento y desarrollo de los indígenas y crea la CONADI.',
      },
      {
        nombre: 'Decreto Supremo 66/2013',
        anio: '2013',
        tipo: 'Decreto',
        url: 'https://consultaindigena.mineduc.cl/wp-content/uploads/sites/111/2018/06/DECRETO-66-MAR-2014.pdf',
        descripcion: 'Reglamento que regula el procedimiento de consulta indígena conforme al Convenio 169.',
      },
      {
        nombre: 'Decreto 236/2008',
        anio: '2008',
        tipo: 'Decreto',
        url: 'https://www.bcn.cl/leychile/navegar?idNorma=279441',
        descripcion: 'Promulga el Convenio 169 de la OIT en Chile.',
      },
    ],
  },
  {
    id: 'guatemala',
    pais: 'Guatemala',
    bandera: '🇬🇹',
    autoridad:
      'Sin ley ni órgano único; el MEM conduce en energía y minería, y la Corte de Constitucionalidad ordena consultas.',
    resumen:
      'La consulta previa se apoya en el Convenio 169, la Constitución y los Acuerdos de Paz, con desarrollo jurisprudencial de la Corte de Constitucionalidad.',
    instrumentos: [
      {
        nombre: 'Convenio 169 de la OIT (ratificado 1996)',
        anio: '1996',
        tipo: 'Tratado',
        url: 'https://normlex.ilo.org/dyn/normlex/en/f?p=NORMLEXPUB:11300:0::NO:11300:P11300_INSTRUMENT_ID:312314',
        descripcion: 'Guatemala ratifica el Convenio 169, base de la consulta previa en el país.',
      },
      {
        nombre: 'Constitución Política, arts. 66 a 70',
        anio: '1985',
        tipo: 'Constitución',
        url: 'https://www.congreso.gob.gt/assets/uploads/secciones/pdf/16e67-constitucion-politica-de-la-republica-de-guatemala.pdf',
        descripcion: 'Reconoce y protege la identidad y las formas de vida de las comunidades indígenas.',
      },
      {
        nombre: 'Acuerdo sobre Identidad y Derechos de los Pueblos Indígenas',
        anio: '1995',
        tipo: 'Acuerdo',
        url: 'https://faolex.fao.org/docs/pdf/gua122086.pdf',
        descripcion: 'Parte de los Acuerdos de Paz; compromete al Estado con los derechos de los pueblos indígenas.',
      },
    ],
  },
  {
    id: 'paraguay',
    pais: 'Paraguay',
    bandera: '🇵🇾',
    autoridad: 'Instituto Paraguayo del Indígena (INDI).',
    resumen:
      'La Constitución dedica un capítulo a los pueblos indígenas y el país cuenta con un protocolo nacional de consulta y consentimiento libre, previo e informado.',
    instrumentos: [
      {
        nombre: 'Constitución Nacional, arts. 62 a 67',
        anio: '1992',
        tipo: 'Constitución',
        url: 'https://cultura.gov.py/2011/08/articulos-de-la-constitucion-nacional/',
        descripcion: 'Reconoce a los pueblos indígenas como grupos anteriores al Estado y sus derechos culturales.',
      },
      {
        nombre: 'Ley 234/93',
        anio: '1993',
        tipo: 'Ley',
        url: 'https://cultura.gov.py/marcolegal/',
        descripcion: 'Aprueba el Convenio 169 de la OIT.',
      },
      {
        nombre: 'Ley 904/81 — Estatuto de las Comunidades Indígenas',
        anio: '1981',
        tipo: 'Ley',
        url: 'https://cultura.gov.py/marcolegal/ley-90481-estatuto-de-las-comunidades-indigenas/',
        descripcion: 'Regula la vida de las comunidades indígenas y crea el INDI.',
      },
    ],
  },
]
