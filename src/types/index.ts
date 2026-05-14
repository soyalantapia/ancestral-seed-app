export type CertificationStatus = 'verified' | 'pending' | 'expired' | 'revoked'

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
}

export interface DirectoryFilters {
  query?: string
  category?: string
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

export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  authorSlug?: string
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
  actor: 'Tú' | 'Auditor' | 'Sistema'
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
  status: 'En curso' | 'En emisión' | 'Certificado'
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
