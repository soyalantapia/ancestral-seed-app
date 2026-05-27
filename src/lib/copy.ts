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
