import type {
  Author,
  Certification,
  DirectoryFilters,
  LoginCredentials,
  PaginatedResult,
  User,
} from '@/types'

// El sitio se sirve desde el BASE_URL del bundle (por ej. `/ancestral-seed-app/`
// en GitHub Pages, `/` en dev). El service worker de MSW se registra dentro
// de ese scope, así que los fetch deben usar el mismo prefix — si no, salen
// fuera del scope del SW y caen al server real (405/404).
const BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
const BASE_URL = `${BASE}/api`

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(error.message || 'Error inesperado')
  }
  return res.json() as Promise<T>
}

export const api = {
  getCertifications: (filters?: DirectoryFilters) => {
    const params = new URLSearchParams()
    if (filters?.query) params.set('q', filters.query)
    if (filters?.category) params.set('category', filters.category)
    if (filters?.status) params.set('status', filters.status)
    if (filters?.sortBy) params.set('sortBy', filters.sortBy)
    const qs = params.toString()
    return request<PaginatedResult<Certification>>(
      `/certifications${qs ? `?${qs}` : ''}`,
    )
  },

  getCertificationBySlug: (slug: string) =>
    request<Certification>(`/certifications/${slug}`),

  getFeaturedCertifications: () =>
    request<Certification[]>('/certifications/featured'),

  verifyCertificate: (hashOrCode: string) =>
    request<{ valid: boolean; certification?: Certification }>(
      '/certifications/verify',
      {
        method: 'POST',
        body: JSON.stringify({ hashOrCode }),
      },
    ),

  getAuthors: () => request<Author[]>('/authors'),

  getAuthorBySlug: (slug: string) => request<Author>(`/authors/${slug}`),

  getAuthorCertifications: (slug: string) =>
    request<Certification[]>(`/authors/${slug}/certifications`),

  getCategories: () => request<string[]>('/categories'),

  login: (credentials: LoginCredentials) =>
    request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  logout: () => request<{ ok: true }>('/auth/logout', { method: 'POST' }),

  reportIncident: (payload: {
    certificationId: string
    reason: string
    description: string
  }) =>
    request<{ ok: true; ticketId: string }>('/incidents', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}
