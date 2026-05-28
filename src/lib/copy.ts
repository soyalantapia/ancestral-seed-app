/**
 * Glosario de términos canónicos de Ancestral Seed.
 *
 * El producto mezclaba sinónimos en distintas pantallas (Tutor/Auditor/Curador
 * para el mismo rol; Postulante/Solicitante/Autor para personas en distintas
 * etapas del journey). Este archivo es la fuente única de verdad.
 *
 * Cuando necesites referirte a un rol o estado, importá la constante en vez
 * de hardcodear el string. Esto evita drift cuando un PM cambia el copy.
 *
 * @example
 *   import { ROLES, STAGES } from '@/lib/copy'
 *   toast.success(`${ROLES.tutor.label} ${name} firmó la evaluación`)
 */

export const ROLES = {
  /** Quien evalúa, audita y firma certificaciones. Antes mezclado con
   *  "Auditor cultural" o "Curador". Decisión: usar "Tutor" en UI por ser
   *  más cercano y educativo. */
  tutor: { id: 'tutor', label: 'Tutor cultural', plural: 'Tutores culturales' },
  /** Persona en proceso de certificación (postulación → certificado).
   *  Antes mezclado con "Solicitante". Decisión: "Postulante" mientras
   *  está en proceso, "Autor" cuando ya tiene una certificación emitida. */
  postulante: {
    id: 'postulante',
    label: 'Postulante',
    plural: 'Postulantes',
  },
  /** Persona con al menos una certificación emitida. Mostrado en directorio
   *  público y en `/perfil/:slug`. */
  autor: { id: 'autor', label: 'Autor', plural: 'Autores' },
  /** Visitante público que quiere verificar un certificado puntual. */
  verificador: {
    id: 'verificador',
    label: 'Verificador',
    plural: 'Verificadores',
  },
} as const

export const STAGES = {
  postulado: { id: 'postulado', label: 'Postulado' },
  revision: { id: 'revision', label: 'Revisión inicial' },
  elegible: { id: 'elegible', label: 'Elegible' },
  /** Etapa intermedia entre Elegible y Diagnóstico — el tutor revisa
   *  evidencias preliminares antes de profundizar. Detectado en mock
   *  data (`mockCertificationRequests`) como estado de Camila. */
  prediagnostico: { id: 'prediagnostico', label: 'Prediagnóstico' },
  /** Etapa "Inicio del proceso" del flujo del postulante (RequestStage).
   *  Distinta de "postulado" (estado tutor) — acá ya hay Orden de Trabajo
   *  abierta y Tutor asignado. */
  inicio: { id: 'inicio', label: 'Inicio del proceso' },
  diagnostico: { id: 'diagnostico', label: 'Diagnóstico' },
  auditoria: { id: 'auditoria', label: 'Auditoría' },
  evaluacion: { id: 'evaluacion', label: 'Evaluación' },
  certificacion: { id: 'certificacion', label: 'Certificación' },
} as const

export const ACTIONS = {
  /** Acción de iniciar el proceso. En el form, "Certificar" es más simple
   *  que "Postular" porque comunica el outcome no el proceso. */
  certify: 'Certificar producto',
  /** Acción de comprobar autenticidad de un cert existente. */
  verify: 'Verificar certificado',
  /** Firmar evaluación read-only AI (tutor). */
  signEvaluation: 'Aceptar y firmar evaluación IA',
} as const

/**
 * Las 3 categorías oficiales del Reglamento de Marca (cláusula 2.1.1).
 *
 * Descripciones textuales del documento — NO reformular sin coordinación
 * con Ancestral Seed. La taxonomía es legalmente vinculante.
 *
 * El `tone` define el tratamiento visual de los badges:
 * - autentico → gold (rango más alto, pertenencia plena)
 * - tradicional → navy (vínculo por raíz/participación)
 * - inspiracion → cream (referencia/inspiración, menor proximidad)
 */
export const CATEGORIES = {
  autentico: {
    id: 'autentico' as const,
    label: 'Ancestral Auténtico',
    shortLabel: 'Auténtico',
    description:
      'Producto o servicio constituido como comunidad indígena, o cuyo ' +
      'proceso demuestre su característica ancestral.',
    tone: 'gold' as const,
  },
  tradicional: {
    id: 'tradicional' as const,
    label: 'Tradicional con raíces ancestrales',
    shortLabel: 'Tradicional',
    description:
      'Referencia directa a comunidad indígena por su técnica o ' +
      'participación, o cuyo proceso demuestre su característica ancestral.',
    tone: 'navy' as const,
  },
  inspiracion: {
    id: 'inspiracion' as const,
    label: 'Inspiración cultural',
    shortLabel: 'Inspiración',
    description:
      'Producto o servicio no constituido como comunidad indígena, pero ' +
      'cuyo proceso demuestra referencia o inspiración en una etnia o ' +
      'comunidad indígena determinada.',
    tone: 'cream' as const,
  },
} as const

/** Estados de licencia del Reglamento, cap. 5. */
export const LICENSE_STATUS = {
  vigente: {
    id: 'vigente' as const,
    label: 'Licencia vigente',
    shortLabel: 'Vigente',
    description: 'La licencia de uso del Sello está activa.',
    tone: 'success' as const,
  },
  suspendida: {
    id: 'suspendida' as const,
    label: 'Licencia suspendida',
    shortLabel: 'Suspendida',
    description:
      'Pausada por no conformidades sin resolver. El titular no puede ' +
      'usar el Sello hasta subsanar.',
    tone: 'warning' as const,
  },
  cancelada: {
    id: 'cancelada' as const,
    label: 'Licencia cancelada',
    shortLabel: 'Cancelada',
    description:
      'Revocada. El titular debe cesar todo uso del Sello y publicidad ' +
      'relacionada.',
    tone: 'danger' as const,
  },
} as const

/**
 * Datos legales del Organismo de Certificación (Reglamento 1.2).
 * Fuente única para footer, /legal, /nosotros y emails transaccionales.
 */
export const LEGAL_ENTITY = {
  name: 'Seed One Global Corp.',
  address: 'Miami Beach, FL · USA',
  phone: '+54 9 11 4937 8422',
  email: 'info@ancestralseed.com',
  website: 'https://www.ancestralseed.com',
} as const

/**
 * Documentos oficiales descargables. Reglamento 1.4 obliga a que el
 * documento esté disponible electrónicamente para los usuarios.
 *
 * `path` es relativo a BASE_URL (en prod queda
 * `/ancestral-seed-app/docs/...`, en dev `/docs/...`). NO hardcodear.
 */
export const OFFICIAL_DOCS = {
  reglamentoMarca: {
    id: 'reglamento-marca',
    title: 'Reglamento de uso de la Marca',
    description:
      'Define las condiciones de uso del Sello Ancestral Seed por parte ' +
      'de los titulares de la licencia.',
    path: 'docs/reglamento-marca-ancestral-seed.pdf',
    sizeKb: 278,
    pages: 11,
    updatedAt: '2026-05-27',
  },
} as const

/** Mensajes de error de API tipados — usados por services/api.ts cuando
 *  diferenciamos 404 vs 500 vs NetworkError. */
export const ERRORS = {
  network:
    'No pudimos conectarnos. Revisá tu conexión a internet y volvé a intentar.',
  notFound: 'No encontramos lo que estás buscando.',
  serverError:
    'Algo falló de nuestro lado. Probá de nuevo en unos minutos.',
  unauthorized: 'Necesitás iniciar sesión para hacer esto.',
  forbidden: 'No tenés permisos para esta acción.',
  unknown: 'Pasó algo inesperado. Si sigue, escribinos a hola@ancestralseed.org.',
} as const
