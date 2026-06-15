export type CertificationStatus = 'verified' | 'pending' | 'expired' | 'revoked'

/**
 * Las 3 categorías oficiales definidas por el Reglamento de Marca,
 * cláusula 2.1.1. La taxonomía es fija por reglamento — no inventar
 * variantes nuevas sin coordinación con Ancestral Seed.
 *
 * - `autentico`: comunidad indígena constituida.
 * - `tradicional`: referencia directa o participación de comunidad.
 * - `inspiracion`: inspirado en comunidad, sin estar constituido.
 */
export type OfficialCategory = 'autentico' | 'tradicional' | 'inspiracion'

/**
 * Estado de la licencia de uso del Sello según el Reglamento
 * (capítulo 5 — Sanciones).
 *
 * - `vigente`: licencia activa, el titular puede usar el sello.
 * - `suspendida`: pausada por no conformidades sin resolver (>30 días).
 * - `cancelada`: revocada definitivamente.
 *
 * Distinto de `CertificationStatus` que es estado UX. La licencia
 * es la dimensión legal/comercial.
 */
export type LicenseStatus = 'vigente' | 'suspendida' | 'cancelada'

export interface Author {
  id: string
  slug: string
  name: string
  title: string
  bio: string
  avatarUrl: string
  location?: string
  email?: string
  certificationsCount: number
  joinedAt: string
  /**
   * Pueblo / comunidad de origen — autodeclarado por el autor o por
   * la comunidad. NO se infiere por keyword (la identidad cultural es
   * soberanía comunitaria, no algoritmo). Cuando falta, la UI dice
   * "Por confirmar con la comunidad".
   */
  community?: string
  /**
   * Lenguas vinculadas al saber/práctica del autor. Mismo principio
   * que `community` — solo se muestran si vienen del modelo. Lista
   * abierta porque un solo autor puede trabajar con varias lenguas.
   */
  languages?: string[]
}

export interface Certification {
  id: string
  slug: string
  title: string
  authorId: string
  authorSlug?: string
  authorName: string
  authorAvatarUrl: string
  issuedBy: string
  issuedAt: string
  expiresAt?: string
  status: CertificationStatus
  category: string
  description: string
  coverUrl: string
  hash: string
  /** "País · Región" — usado en ficha pública y mapa */
  location?: string
  /** Lugar puntual para el mapa embebido (Google Maps query). Default: location */
  mapQuery?: string
  /** URLs de la galería (carrusel). Si está vacío, usa coverUrl repetido */
  galleryUrls?: string[]
  /** Párrafos extra para la sección "Comunidad y región" */
  contextParagraphs?: string[]
  /** Párrafos extra para la sección "Técnica y producción" */
  techniqueParagraphs?: string[]
  /**
   * Categoría oficial según Reglamento 2.1.1. Opcional para
   * compatibilidad con mocks antiguos, pero todo cert NUEVO debería
   * tenerla. UI cae a `category` (libre) si falta.
   */
  officialCategory?: OfficialCategory
  /**
   * Tipo de entidad certificada. Por defecto 'producto'.
   * 'servicio' muestra "Servicio" en lugar del shortLabel de categoría.
   */
  entityType?: 'producto' | 'servicio'
  /**
   * Estado de la licencia de uso del Sello (Reglamento cap. 5).
   * Opcional por compat. Si falta, asumir 'vigente'.
   */
  licenseStatus?: LicenseStatus
  /** ISO date — fecha hasta la cual la licencia es válida. */
  licenseValidUntil?: string
  /**
   * N° de licencia oficial (formato sugerido: AS-YYYY-XXX). Opcional
   * según Reglamento 3.2: "N° de licencia: es opcional" para mostrar
   * junto al sello.
   */
  licenseNumber?: string
}

export interface DirectoryFilters {
  query?: string
  /** Categoría libre (region/temática) — campo histórico. */
  category?: string
  /** Categoría oficial del Reglamento 2.1.1. Filtrado en cliente. */
  officialCategory?: OfficialCategory
  status?: CertificationStatus
  sortBy?: 'recent' | 'name' | 'popular'
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface ApiError {
  message: string
  code?: string
}

export type UserRole = 'postulante' | 'tutor' | 'evaluador' | 'coordinador' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  authorSlug?: string
  /** Rol funcional en la plataforma. Default: postulante. */
  role?: UserRole
  /** Roles secundarios — un usuario puede ser postulante Y tutor a la vez. */
  roles?: UserRole[]
}

export interface LoginCredentials {
  email: string
  password: string
}

// ─── Dashboard / Certification Request lifecycle ─────────────────────────────
export type RequestStage =
  | 'prediagnostico'
  | 'inicio'
  | 'diagnostico'
  | 'auditoria'
  | 'evaluacion'
  | 'certificacion'

export type RequestStageStatus = 'completed' | 'in_progress' | 'pending'

export type RequestTab =
  | 'tab'
  | 'En curso'
  | 'En emisión'

export interface RequestStageItem {
  stage: RequestStage
  label: string
  status: RequestStageStatus
  date?: string
  description?: string
}

export type AuditMeetingStatus = 'pending' | 'accepted' | 'rejected' | 'rescheduled'

export interface AuditMeeting {
  id: string
  auditorName: string
  type: 'Videollamada' | 'Presencial'
  scheduledAt: string
  timezone: string
  message: string
  status: AuditMeetingStatus
}

export type NotificationKind =
  | 'audit_proposed'
  | 'audit_accepted'
  | 'evidence_request'
  | 'stage_changed'
  | 'message_received'
  | 'document_uploaded'
  | 'cert_published'

export interface Notification {
  id: string
  kind: NotificationKind
  title: string
  body: string
  createdAt: string // ISO
  read: boolean
  link?: string
}

export interface EvidenceFile {
  id: string
  name: string
  kind: 'image' | 'video' | 'document'
  sizeKb: number
  uploadedAt: string
  thumbUrl?: string
}

export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'refunded'

export interface PaymentItem {
  id: string
  concept: string
  amount: number
  currency: string
  status: PaymentStatus
  dueDate: string
  paidAt?: string
  invoiceUrl?: string
}

export type HistoryEventKind =
  | 'request_created'
  | 'evidence_uploaded'
  | 'audit_proposed'
  | 'audit_accepted'
  | 'audit_rescheduled'
  | 'audit_rejected'
  | 'stage_changed'
  | 'document_uploaded'
  | 'payment_received'
  | 'message_sent'
  | 'cert_published'

export interface HistoryEvent {
  id: string
  kind: HistoryEventKind
  title: string
  description?: string
  actor: 'Tú' | 'Tutor' | 'Sistema'
  at: string // ISO
}

export interface TutorMessage {
  id: string
  author: 'tu' | 'tutor'
  authorName: string
  body: string
  at: string
}

export interface RequestSubmittedData {
  applicantName: string
  email: string
  phone: string
  country: string
  region: string
  community: string
  inspirationCommunity?: string
  productType: string
  productSector: string
  productSubcategory: string
  processDescription: string
  producerType: string
}

// ─── Tutor panel ─────────────────────────────────────────────────────────────

export type CaseRisk = 'bajo' | 'medio' | 'alto'

export type CaseStage =
  | 'postulado'
  | 'revision-inicial'
  | 'elegible'
  | 'diagnostico'
  | 'auditoria'
  | 'evaluacion'
  | 'certificacion'

export interface TutorCase {
  id: string                  // CE-001
  productName: string
  applicantName: string
  applicantAvatarUrl?: string
  scoringIA: number           // 0-100
  risk: CaseRisk
  pendingItems: string[]
  stage: CaseStage
  tutorId?: string
  tutorName?: string
  tutorAvatarUrl?: string
  category: string
  country: string
  region: string
  createdAt: string           // ISO
}

export type IssuedCertStatus = 'vigente' | 'renovacion' | 'vencido' | 'denegado'

export interface IssuedCertification {
  id: string                  // CE-001
  productName: string
  authorName: string
  authorAvatarUrl?: string
  scoreLabel: string          // "95/100"
  status: IssuedCertStatus
  issuedAt: string            // ISO o dd/MM/yy
  expiresAt: string
  category: string
  country: string
  region: string
  // ─── Expediente extendido (tutor) ──────────────────────────────────────────
  authorPhone?: string
  authorEmail?: string
  authorRole?: string
  community?: string
  productType?: string
  productSector?: string
  productSubcategory?: string
  productionDescription?: string
  productionResponsible?: string
  productionCapacity?: string
  productionMode?: string
  batchIdentifier?: string
  renewalCycleMonths?: number
  lastRenewalAt?: string
  nextRenewalAt?: string
}

// ─── Recursos del expediente: evidencias, notas internas, checklist ──────────

export interface CertExpedienteEvidence {
  id: string
  kind: 'image' | 'video' | 'document'
  name: string
  sizeKb?: number
  uploadedAt?: string
  thumbUrl?: string
}

export interface CertExpedienteNote {
  id: string
  authorName: string
  authorInitials: string
  body: string
  at: string                  // ISO
}

export interface ChecklistItem {
  id: string
  label: string
  checked: boolean
}

export interface ChecklistCategory {
  id: string
  name: string
  items: ChecklistItem[]
  comment?: string
}

export interface RenewalPreTask {
  id: string
  certId: string
  title: string
  description: string
  evidenceTypes: Array<'image' | 'video' | 'document'>
  dueAt: string               // ISO o dd/MM/yy
  internalNote?: string
  createdAt: string
}

export interface TutorAgendaItem {
  id: string
  caseId: string
  caseName: string
  applicantName: string
  kind: 'kickoff' | 'auditoria' | 'evaluacion' | 'cierre'
  scheduledAt: string         // ISO
  durationMin: number
}

// ─── Scoring estructurado por criterios (Tutor) ──────────────────────────────
//
// Variables y ponderaciones definidas por el antropólogo del proyecto
// (archivo "Variables Finales.xlsx" entregado por Raúl). Las 14 variables
// están agrupadas en 5 dimensiones que suman 100%.
//
// Dimensiones:
//   - Cultural (37%): transmision + simbolos + practicas
//   - Sociales y Comunitaria (14%): organizacion + beneficio
//   - Ambiental (18%): territorio + biodiversidad + agua
//   - Ética y Cosmovisión (12%): cosmovision + apropiacion
//   - Gestión y técnica (19%): tecnicas + reconocimiento + asociatividad +
//     consentimiento

export type ScoringDimension =
  | 'cultural'
  | 'social'
  | 'ambiental'
  | 'etica'
  | 'gestion'

export type ScoringCriterionId =
  // Cultural
  | 'transmision'
  | 'simbolos'
  | 'practicas'
  // Sociales y Comunitaria
  | 'organizacion'
  | 'beneficio'
  // Ambiental
  | 'territorio'
  | 'biodiversidad'
  | 'agua'
  // Ética y Cosmovisión
  | 'cosmovision'
  | 'apropiacion'
  // Gestión y técnica
  | 'tecnicas'
  | 'reconocimiento'
  | 'asociatividad'
  | 'consentimiento'

export interface ScoringCriterionDef {
  id: ScoringCriterionId
  /** Dimensión a la que pertenece — para agruparlas visualmente. */
  dimension: ScoringDimension
  label: string
  description: string
  /** Peso 0-100. La suma de todos los pesos = 100. */
  weight: number
  subitems: string[]
  /** Medios de verificación esperados (del Excel del antropólogo). */
  verification?: string
}

export interface ScoringValue {
  criterionId: ScoringCriterionId
  score: number               // 0-10
  comment?: string
  evaluatedAt?: string
}

// ─── Evaluación de evidencias ────────────────────────────────────────────────

export type EvidenceVerdict = 'pending' | 'approved' | 'rejected' | 'clarify'

export interface EvidenceEvaluation {
  evidenceId: string
  verdict: EvidenceVerdict
  comment?: string
  evaluatedAt?: string
}

// ─── Notas internas (no visibles al solicitante) ─────────────────────────────

export interface InternalNote {
  id: string
  caseId: string
  author: string              // tutor name
  authorRole: 'tutor' | 'auditor' | 'curador' | 'coordinador'
  body: string
  at: string                  // ISO
  pinned?: boolean
}

// ─── Tareas del tutor (bandeja Hoy) ──────────────────────────────────────────

export type TutorTaskKind =
  | 'review_evidence'
  | 'call_applicant'
  | 'sign_evaluation'
  | 'send_message'
  | 'audit_meeting'
  | 'verify_documentation'
  | 'review_case'

export type TutorTaskPriority = 'urgent' | 'today' | 'this_week'

export interface TutorTask {
  id: string
  kind: TutorTaskKind
  title: string
  caseId: string
  caseName: string
  applicantName: string
  priority: TutorTaskPriority
  dueAt?: string              // ISO o "hoy"
  done: boolean
}

// ─── Cambio de etapa con motivo y log ────────────────────────────────────────

export interface StageChangeLogEntry {
  id: string
  caseId: string
  fromStage: CaseStage
  toStage: CaseStage
  reason: string
  at: string                  // ISO
  by: string                  // tutor name
}

// ─── Plantillas de mensajes / acciones rápidas ───────────────────────────────

export type MessageTemplateKind =
  | 'request_evidence'
  | 'schedule_meeting'
  | 'approve_stage'
  | 'request_clarification'
  | 'reminder'
  | 'closing'

export interface MessageTemplate {
  id: string
  kind: MessageTemplateKind
  title: string
  body: string                // Con {placeholders}
}

// ─── Plan de mejora (cuando score < 70) ──────────────────────────────────────

export type ImprovementActionStatus = 'pending' | 'in_progress' | 'done'

export interface ImprovementAction {
  id: string
  title: string
  detail?: string
  criterionId?: ScoringCriterionId
  dueDate?: string            // ISO o dd/MM
  responsible: 'solicitante' | 'tutor' | 'comunidad'
  status: ImprovementActionStatus
}

export interface ImprovementPlan {
  id: string
  caseId: string
  createdAt: string
  createdBy: string
  reEvaluationAt?: string
  actions: ImprovementAction[]
}

// ─── Firmas de certificación (multi-firma) ───────────────────────────────────

export type SignatureRole = 'tutor' | 'curador' | 'coordinador'
export type SignatureStatus = 'pending' | 'signed' | 'rejected'

export interface ApprovalSignature {
  id: string
  caseId: string
  caseName: string
  applicantName: string
  role: SignatureRole
  signerName: string
  status: SignatureStatus
  signedAt?: string
  requestedAt: string
}

// ─── Notificaciones específicas del tutor ────────────────────────────────────

export type TutorNotificationKind =
  | 'new_case_assigned'
  | 'evidence_uploaded'
  | 'applicant_replied'
  | 'sla_breach'
  | 'meeting_reminder'
  | 'signature_pending'
  | 'stage_changed'

export interface TutorNotification {
  id: string
  kind: TutorNotificationKind
  title: string
  body: string
  caseId?: string
  caseName?: string
  at: string
  read: boolean
  link?: string
}

// ─── Métricas de performance del tutor ───────────────────────────────────────

export interface TutorMetrics {
  approvalRate: number          // 0-100
  approvalRateDelta: number     // % vs último período
  avgDaysPerCase: number
  avgDaysDelta: number          // negativo = mejoró
  overdueCases: number
  responseTimeHours: number     // tiempo promedio de respuesta
  responseTimeDelta: number
  satisfactionScore: number     // 0-5
  totalCertified: number
  totalRejected: number
}

export interface CertificationRequest {
  id: string
  number: string                // "#001"
  productName: string
  createdAt: string
  currentStage: RequestStage
  stages: RequestStageItem[]
  pendingItems: string[]
  meetings: AuditMeeting[]
  scheduledMeetings: AuditMeeting[]
  status: 'En curso' | 'En emisión' | 'Certificado' | 'Denegada'
  progressLabel: string
  diagnosticDeadline?: string
  diagnosticCompleted?: boolean
  // Extended data
  evidences?: EvidenceFile[]
  payments?: PaymentItem[]
  history?: HistoryEvent[]
  threads?: Record<string, TutorMessage[]> // meetingId -> messages
  submittedData?: RequestSubmittedData
}
