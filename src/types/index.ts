export type CertificationStatus = 'verified' | 'pending' | 'expired' | 'revoked'

export interface Author {
  id: string
  slug: string
  name: string
  title: string
  bio: string
  avatarUrl: string
  location?: string
  certificationsCount: number
  joinedAt: string
}

export interface Certification {
  id: string
  slug: string
  title: string
  authorId: string
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
}
