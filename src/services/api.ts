import type {
  Author,
  Certification,
  DirectoryFilters,
  LoginCredentials,
  PaginatedResult,
  User,
} from '@/types'
import { ERRORS } from '@/lib/copy'
import {
  orphanControllerPresent,
  purgeOrphanServiceWorkers,
  resetServiceWorkersAndReload,
} from '@/lib/swRecovery'

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

/**
 * Detecta si el response es HTML (el SPA fallback de GH Pages cuando la
 * ruta no existe). Pasa si content-type empieza con "text/html" o si
 * el body arranca con "<".
 *
 * Esto cubre el caso patológico: MSW no está controlando la página, la
 * request sale al network, GH Pages no encuentra `/api/...` como archivo
 * y devuelve `index.html` con status 200 o 404. Sin esta detección, el
 * cliente intentaría `res.json()` y crashearía con un syntax error
 * confuso ("Unexpected token <").
 */
function isHtmlResponse(res: Response): boolean {
  const ct = res.headers.get('content-type') || ''
  return ct.toLowerCase().includes('text/html')
}

/**
 * ¿Es plausible que estemos en la race del SW de MSW? Solo si hay un SW
 * registrado que todavía NO controla esta carga. Si no hay `serviceWorker`
 * (tests/jsdom, o backend real sin SW) NO reintentamos: ahí un HTML o un
 * error de red es real, no una race transitoria.
 */
function mswRaceLikely(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    !!navigator.serviceWorker &&
    !navigator.serviceWorker.controller
  )
}

/**
 * Espera a que el Service Worker de MSW esté listo y controlando la
 * página, con backoff creciente. En el primer load (o tras un HMR) el SW
 * puede tardar un tick en reclamar el cliente; mientras tanto los fetch a
 * /api/* caen al dev server y devuelven index.html (SPA fallback). En vez
 * de fallarle al usuario, esperamos al SW y reintentamos.
 */
async function waitForMswReady(attempt: number): Promise<void> {
  const backoff = 120 * (attempt + 1)
  if (typeof navigator === 'undefined' || !navigator.serviceWorker) {
    await new Promise((r) => setTimeout(r, backoff))
    return
  }
  try {
    await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((r) => setTimeout(r, backoff)),
    ])
  } catch {
    /* ignore */
  }
  // Si el SW está activo pero todavía no controla ESTA carga, esperamos el
  // `controllerchange` (clients.claim) o el backoff, lo que pase primero.
  if (!navigator.serviceWorker.controller) {
    await new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, backoff)
      navigator.serviceWorker.addEventListener(
        'controllerchange',
        () => {
          clearTimeout(timer)
          resolve()
        },
        { once: true },
      )
    })
  }
}

/** Reintentos ante la race del SW de MSW (no es un error real del backend). */
const MAX_API_RETRIES = 3

async function request<T>(
  path: string,
  init?: RequestInit,
  attempt = 0,
): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    })
  } catch {
    // TypeError → red caída / el SW todavía no intercepta. En la demo (MSW)
    // suele ser la race del SW en el primer load: esperamos y reintentamos.
    if (attempt < MAX_API_RETRIES && mswRaceLikely()) {
      await waitForMswReady(attempt)
      return request<T>(path, init, attempt + 1)
    }
    throw new ApiError('network', ERRORS.network)
  }

  // HTML en vez de JSON = MSW no está controlando la página y caímos al SPA
  // fallback. NO es un error del backend: el SW todavía no reclamó el
  // cliente. Esperamos a que tome control y reintentamos en vez de mostrar
  // "no pudimos cargar los datos". Solo si tras varios intentos sigue HTML
  // (caso patológico real) tiramos el error.
  if (isHtmlResponse(res)) {
    // Un SW huérfano (Workbox viejo de una versión anterior) controlando la
    // página deja pasar /api/* al server → SPA-fallback (HTML). No es un
    // error del backend: hay que DESREGISTRAR ese SW para que MSW tome
    // control. La purga recarga la página; si lo hace, cortamos acá.
    if (orphanControllerPresent()) {
      const reloading = await purgeOrphanServiceWorkers()
      if (reloading) {
        // La página se está recargando: devolvemos una promesa que nunca
        // resuelve para no mostrar el error en el frame que se va.
        return new Promise<T>(() => {})
      }
    }
    if (attempt < MAX_API_RETRIES && mswRaceLikely()) {
      if (import.meta.env.DEV) {
        console.warn(
          `[api] MSW aún no controla la página para ${path} — reintento ${attempt + 1}/${MAX_API_RETRIES}.`,
        )
      }
      await waitForMswReady(attempt)
      return request<T>(path, init, attempt + 1)
    }
    // Último recurso: seguimos recibiendo HTML y hay un SW CONTROLANDO la
    // página que evidentemente no mockea — un `mockServiceWorker.js` viejo/roto
    // (que la purga de huérfanos no toca) o un huérfano que sobrevivió. Reset
    // duro acotado: desregistra TODOS los SW + limpia caches + recarga para que
    // MSW arranque limpio. El contador de sesión evita loops.
    if (
      typeof navigator !== 'undefined' &&
      navigator.serviceWorker?.controller
    ) {
      const reloading = await resetServiceWorkersAndReload({ bounded: true })
      if (reloading) return new Promise<T>(() => {})
    }
    throw new ApiError(
      'server',
      'No pudimos cargar los datos. Probá refrescar la página (Cmd+Shift+R) y reintentar.',
      res.status,
    )
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
