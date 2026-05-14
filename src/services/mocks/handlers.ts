import { http, HttpResponse, delay } from 'msw'
import {
  mockAuthors,
  mockCategories,
  mockCertifications,
  mockUser,
} from './data'
import type { Certification, DirectoryFilters } from '@/types'

const realisticDelay = () => delay(300 + Math.random() * 500)

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
        c.category.toLowerCase().includes(q),
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
  http.get('*/api/certifications', async ({ request }) => {
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

  http.get('*/api/certifications/featured', async () => {
    await realisticDelay()
    return HttpResponse.json(
      mockCertifications.filter((c) => c.status === 'verified').slice(0, 4),
    )
  }),

  http.get('*/api/certifications/:slug', async ({ params }) => {
    await realisticDelay()
    const cert = mockCertifications.find((c) => c.slug === params.slug)
    if (!cert) {
      return HttpResponse.json(
        { message: 'Certificado no encontrado' },
        { status: 404 },
      )
    }
    return HttpResponse.json(cert)
  }),

  http.post('*/api/certifications/verify', async ({ request }) => {
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

  http.get('*/api/authors', async () => {
    await realisticDelay()
    return HttpResponse.json(mockAuthors)
  }),

  http.get('*/api/authors/:slug', async ({ params }) => {
    await realisticDelay()
    const author = mockAuthors.find((a) => a.slug === params.slug)
    if (!author) {
      return HttpResponse.json(
        { message: 'Autor no encontrado' },
        { status: 404 },
      )
    }
    return HttpResponse.json(author)
  }),

  http.get('*/api/authors/:slug/certifications', async ({ params }) => {
    await realisticDelay()
    const author = mockAuthors.find((a) => a.slug === params.slug)
    if (!author) return HttpResponse.json([], { status: 404 })
    const certs = mockCertifications.filter((c) => c.authorId === author.id)
    return HttpResponse.json(certs)
  }),

  http.get('*/api/categories', async () => {
    await realisticDelay()
    return HttpResponse.json(mockCategories)
  }),

  http.post('*/api/auth/login', async ({ request }) => {
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

  http.post('*/api/auth/logout', async () => {
    await realisticDelay()
    return HttpResponse.json({ ok: true })
  }),

  http.post('*/api/incidents', async ({ request }) => {
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
