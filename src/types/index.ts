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
