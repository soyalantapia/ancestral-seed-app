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
 * Datos bancarios del Organismo para pagos por transferencia.
 *
 * Estos son los valores que ve el postulante en el CheckoutModal
 * cuando elige "Transferencia bancaria". Centralizados acá para que
 * cualquier cambio (cuenta nueva, alias renombrado) sea una sola
 * edición y se refleje en /pagos + tab Pagos de CertificationRequest
 * + email de notificación.
 *
 * Modo demo: los valores son mock; en producción vendrán del backend
 * por moneda y por país.
 */
export const PAYMENT_TRANSFER = {
  bankName: 'Galicia',
  accountHolder: 'Seed One Global Corp.',
  cuit: '30-71234567-9',
  cbu: '0070110820000123456789',
  cvu: '0000003100012345678901',
  alias: 'ANCESTRAL.SEED.AR',
  currency: 'ARS',
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

/**
 * Glosario del Reglamento de Marca, cláusula 1.3 — vocabulario formal
 * que el postulante puede ver en /ayuda o /nosotros.
 *
 * Mantiene los términos textuales del PDF para que cualquier consulta
 * formal del titular contra el reglamento coincida con lo que ve en
 * la app.
 */
export const REGLAMENTO_GLOSSARY = [
  {
    term: 'AS · Ancestral Seed',
    body:
      'Organismo de Certificación. Es la entidad que evalúa, otorga y gestiona la Licencia para usar el Sello. Cláusula 1.3 del Reglamento.',
  },
  {
    term: 'Sello AS de conformidad con Norma',
    body:
      'Marca registrada por Ancestral Seed que se otorga según las cláusulas del Reglamento de Certificación de Procesos, asegurando que el proceso cumple con todas las exigencias de una Norma.',
  },
  {
    term: 'Licencia',
    body:
      'Documento que establece las condiciones para el uso del Sello, con la responsabilidad que implica disponer del aval de Certificación de AS.',
  },
  {
    term: 'Licenciatario',
    body:
      'Persona física o jurídica a la cual AS otorga la Licencia para uso del Sello AS de conformidad con Norma. En la app aparece como "Autor" o "Titular".',
  },
  {
    term: 'Esquema de certificación',
    body:
      'Sistema de certificación aplicado a un proceso determinado, donde se aplican requisitos, reglas y procedimientos específicos.',
  },
  {
    term: 'Comité de Certificación',
    body:
      'Comité integrado por miembros de nivel gerencial de AS y responsable por la emisión, suspensión y cancelación de la certificación.',
  },
  {
    term: 'No Conformidad',
    body:
      'Incumplimiento de un requisito. Cuando el tutor detecta una no conformidad durante la auditoría, el titular tiene 30 días corridos para subsanarla (cláusula 4.6).',
  },
  {
    term: 'Apelación',
    body:
      'Recurso presentado por el titular para reconsiderar una decisión de AS. Se presenta en 5 días hábiles desde la notificación; el Comité de Certificación resuelve en máximo 15 días (cláusulas 5.6 y 8).',
  },
] as const

/**
 * Plazos clave del Reglamento — usados en UI para informar al titular
 * en el contexto correcto (vencimiento, banner, copy informativo).
 *
 * Fuente única para evitar inconsistencias si cambian.
 */
export const REGLAMENTO_DEADLINES = {
  /** Cláusula 1.5 — sin avance del titular durante 90 días, AS cierra el caso. */
  inactivityDaysToCloseCase: 90,
  /** Cláusula 1.5 — porcentaje mínimo para emitir la Licencia. */
  minimumScoreToIssueLicense: 80,
  /** Cláusula 4.6 — plazo del titular para subsanar no conformidades. */
  daysToFixNonConformity: 30,
  /** Cláusula 5.6 — plazo para apelar una sanción. */
  daysToAppealSanction: 5,
  /** Cláusula 5.6 — plazo del Comité para resolver una apelación. */
  daysToResolveAppeal: 15,
} as const

/**
 * Guía de uso del Sello — Reglamento 3.3.
 *
 * Importante mostrarlo al titular junto al `<OfficialSeal />` o en una
 * página dedicada, para que no use el Sello donde no corresponde.
 */
export const SEAL_USAGE_RULES = {
  allowed: [
    'Páginas web propias del titular',
    'Presentaciones y propuestas comerciales',
    'Material publicitario (folletos, banners, carteles)',
    'Vehículos corporativos',
    'Documentos contractuales',
    'Papelería de la organización (papel membretado, sobres, facturas, tarjetas)',
  ],
  forbidden: [
    'Informes técnicos al cliente',
    'Sobre el producto físico',
    'Sobre el embalaje del producto',
  ],
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
