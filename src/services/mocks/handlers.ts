import { http, HttpResponse, delay } from 'msw'
import {
  mockAuthors,
  mockCategories,
  mockCertifications,
  mockUser,
} from './data'
import type { Certification, DirectoryFilters } from '@/types'

// Latencia simulada para que se vean los skeletons sin que la demo se sienta
// lenta. 120–300 ms: alcanza para un parpadeo de skeleton pero ~3× más ágil
// que el 300–800 ms original (los perfiles públicos cargaban en ~1 s).
const realisticDelay = () => delay(120 + Math.random() * 180)

// Bug producción (mayo 2026): el SW de MSW se registra dentro del scope
// `/ancestral-seed-app/`, así que los fetch del cliente van a
// `/ancestral-seed-app/api/...`. Los handlers definidos con `*/api/...`
// usan `*` como wildcard de HOSTNAME — el path tiene que matchear EXACTO.
// Por eso en dev (path = `/api/...`) matcheaban y en prod (path =
// `/ancestral-seed-app/api/...`) no → MSW no interceptaba → fetch caía
// al server real (GH Pages) que devuelve index.html → res.json() falla
// → "Error inesperado".
// Fix: usar regex que matchea ambos prefixes en el path final.
function api(suffix: string): RegExp {
  // Escapamos `/` y permitimos cualquier cantidad de segmentos antes,
  // matcheando query string opcional al final.
  // Ejemplo: api('certifications') → /\/api\/certifications(?:\?.*)?$/
  return new RegExp(`/api/${suffix}(?:\\?.*)?$`)
}

// Helper para extraer el último segmento del path (sin query string).
// Reemplaza el `params.slug` que perdimos al migrar de string a RegExp.
function extractLastPathSegment(url: string): string {
  const p = new URL(url).pathname.replace(/\/$/, '')
  return p.substring(p.lastIndexOf('/') + 1)
}

function applyFilters(
  items: Certification[],
  filters: DirectoryFilters,
): Certification[] {
  let result = [...items]

  if (filters.query) {
    const q = filters.query.toLowerCase()
    result = result.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.authorName.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        // El placeholder del buscador promete "región" y "hash": antes solo
        // matcheaba category, así que buscar por país/ubicación o por hash
        // del certificado devolvía vacío.
        (c.location?.toLowerCase().includes(q) ?? false) ||
        c.hash.toLowerCase().includes(q),
    )
  }

  if (filters.category) {
    result = result.filter((c) => c.category === filters.category)
  }

  if (filters.status) {
    result = result.filter((c) => c.status === filters.status)
  }

  switch (filters.sortBy) {
    case 'name':
      result.sort((a, b) => a.title.localeCompare(b.title))
      break
    case 'popular':
      result.sort(
        (a, b) =>
          (b.status === 'verified' ? 1 : 0) -
          (a.status === 'verified' ? 1 : 0),
      )
      break
    case 'recent':
    default:
      result.sort(
        (a, b) =>
          new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime(),
      )
  }

  return result
}

export const handlers = [
  http.get(api('certifications'), async ({ request }) => {
    await realisticDelay()
    const url = new URL(request.url)
    const filters: DirectoryFilters = {
      query: url.searchParams.get('q') ?? undefined,
      category: url.searchParams.get('category') ?? undefined,
      status:
        (url.searchParams.get('status') as DirectoryFilters['status']) ??
        undefined,
      sortBy:
        (url.searchParams.get('sortBy') as DirectoryFilters['sortBy']) ??
        undefined,
    }
    const filtered = applyFilters(mockCertifications, filters)
    return HttpResponse.json({
      items: filtered,
      total: filtered.length,
      page: 1,
      pageSize: filtered.length,
    })
  }),

  http.get(api('certifications/featured'), async () => {
    await realisticDelay()
    // Orden específico curado para la home (feedback Mario/Raúl):
    // 1. Producto Ancestral auténtico  → Tejido
    // 2. Producto Tradicional con raíces ancestrales → Filigrana
    // 3. Producto de Inspiración Cultural → Sabores cósmicos
    // 4. Servicio Ancestral → Ecodestinos
    const FEATURED_SLUGS = [
      'tejido-textil-tradicional',
      'tecnica-ancestral-filigrana',
      'libro-sabores-cosmicos',
      'ecodestinos-turismo-ancestral',
    ]
    const ordered = FEATURED_SLUGS
      .map((slug) => mockCertifications.find((c) => c.slug === slug))
      .filter((c): c is NonNullable<typeof c> => !!c)
    return HttpResponse.json(ordered)
  }),

  http.get(api('certifications/[^/]+'), async ({ request }) => {
    await realisticDelay()
    const slug = extractLastPathSegment(request.url)
    const cert = mockCertifications.find((c) => c.slug === slug)
    if (!cert) {
      return HttpResponse.json(
        { message: 'Certificado no encontrado' },
        { status: 404 },
      )
    }
    return HttpResponse.json(cert)
  }),

  http.post(api('certifications/verify'), async ({ request }) => {
    await realisticDelay()
    const { hashOrCode } = (await request.json()) as { hashOrCode: string }
    const found = mockCertifications.find(
      (c) =>
        c.hash.toLowerCase() === hashOrCode.toLowerCase() ||
        c.slug === hashOrCode,
    )
    if (found && found.status === 'verified') {
      return HttpResponse.json({ valid: true, certification: found })
    }
    return HttpResponse.json({ valid: false })
  }),

  http.get(api('authors'), async () => {
    await realisticDelay()
    return HttpResponse.json(mockAuthors)
  }),

  // /api/authors/:slug/certifications — debe ir ANTES del :slug solo
  // (regex matchea de arriba a abajo)
  http.get(api('authors/[^/]+/certifications'), async ({ request }) => {
    await realisticDelay()
    const segments = new URL(request.url).pathname.split('/')
    const slug = segments[segments.length - 2] // antes de "certifications"
    const author = mockAuthors.find((a) => a.slug === slug)
    if (!author) return HttpResponse.json([], { status: 404 })
    const certs = mockCertifications.filter((c) => c.authorId === author.id)
    return HttpResponse.json(certs)
  }),

  http.get(api('authors/[^/]+'), async ({ request }) => {
    await realisticDelay()
    const slug = extractLastPathSegment(request.url)
    const author = mockAuthors.find((a) => a.slug === slug)
    if (!author) {
      return HttpResponse.json(
        { message: 'Autor no encontrado' },
        { status: 404 },
      )
    }
    return HttpResponse.json(author)
  }),

  http.get(api('categories'), async () => {
    await realisticDelay()
    return HttpResponse.json(mockCategories)
  }),

  http.post(api('auth/login'), async ({ request }) => {
    await realisticDelay()
    const { email, password } = (await request.json()) as {
      email: string
      password: string
    }
    if (!email || !password) {
      return HttpResponse.json(
        { message: 'Credenciales inválidas' },
        { status: 400 },
      )
    }
    return HttpResponse.json({
      user: mockUser,
      token: 'mock-jwt-token-xxx',
    })
  }),

  http.post(api('auth/logout'), async () => {
    await realisticDelay()
    return HttpResponse.json({ ok: true })
  }),

  http.post(api('incidents'), async ({ request }) => {
    await realisticDelay()
    const body = (await request.json()) as Record<string, unknown>
    if (!body.reason) {
      return HttpResponse.json(
        { message: 'Motivo requerido' },
        { status: 400 },
      )
    }
    return HttpResponse.json({
      ok: true as const,
      ticketId: `INC-${Date.now()}`,
    })
  }),
]
