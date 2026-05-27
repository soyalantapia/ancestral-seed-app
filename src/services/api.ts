import type {
  Author,
  Certification,
  DirectoryFilters,
  LoginCredentials,
  PaginatedResult,
  User,
} from '@/types'
import { ERRORS } from '@/lib/copy'

// El sitio se sirve desde el BASE_URL del bundle (por ej. `/ancestral-seed-app/`
// en GitHub Pages, `/` en dev). El service worker de MSW se registra dentro
// de ese scope, así que los fetch deben usar el mismo prefix — si no, salen
// fuera del scope del SW y caen al server real (405/404).
const BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
const BASE_URL = `${BASE}/api`

/**
 * Error tipado con código permite a la UI mostrar mensajes contextuales
 * en vez del genérico "Error inesperado".
 */
export class ApiError extends Error {
  public readonly code:
    | 'network'
    | 'not_found'
    | 'server'
    | 'unauthorized'
    | 'forbidden'
    | 'unknown'
  public readonly status?: number

  constructor(
    code: ApiError['code'],
    message: string,
    status?: number,
  ) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

function classifyHttp(status: number): ApiError['code'] {
  if (status === 404) return 'not_found'
  if (status === 401) return 'unauthorized'
  if (status === 403) return 'forbidden'
  if (status >= 500) return 'server'
  return 'unknown'
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    })
  } catch {
    // TypeError → red caída, CORS bloqueado, DNS fallido, etc.
    throw new ApiError('network', ERRORS.network)
  }
  if (!res.ok) {
    const code = classifyHttp(res.status)
    const fallback =
      ERRORS[
        code === 'not_found'
          ? 'notFound'
          : code === 'server'
            ? 'serverError'
            : code === 'unauthorized'
              ? 'unauthorized'
              : code === 'forbidden'
                ? 'forbidden'
                : 'unknown'
      ]
    const body = await res.json().catch(() => null)
    const message =
      (body as { message?: string } | null)?.message || fallback
    throw new ApiError(code, message, res.status)
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
