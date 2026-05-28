import { describe, it, expect, vi, afterEach } from 'vitest'
import { ApiError } from '@/services/api'
import { api } from '@/services/api'

/**
 * Test de regresión del bug "Algo salió mal cargando los certificados".
 *
 * Causa raíz: cuando MSW no controla la página (PWA SW lo pisó), la
 * request a /api/* salía al network, GH Pages devolvía 404 + HTML del
 * SPA fallback, y `request()` intentaba JSON parse → error críptico.
 *
 * Fix: detectar content-type text/html en `request()` y devolver un
 * ApiError tipado con mensaje útil + log de diagnóstico.
 */

afterEach(() => {
  vi.restoreAllMocks()
})

describe('api.request() — fallback HTML defensivo', () => {
  it('detecta cuando el server devuelve HTML y lanza ApiError(server)', async () => {
    // Mock global fetch para simular GH Pages devolviendo HTML
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        '<!doctype html><html><head><title>404</title></head></html>',
        {
          status: 404,
          headers: { 'content-type': 'text/html; charset=utf-8' },
        },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    let captured: unknown
    try {
      await api.getCertifications()
    } catch (e) {
      captured = e
    }

    expect(captured).toBeInstanceOf(ApiError)
    if (captured instanceof ApiError) {
      expect(captured.code).toBe('server')
      // El mensaje debe instruir al user a hacer hard reload
      expect(captured.message.toLowerCase()).toContain('refrescar')
    }
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('si el server devuelve JSON 404 normal, código es not_found (no html)', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: 'Certificado no encontrado' }), {
        status: 404,
        headers: { 'content-type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    let captured: unknown
    try {
      await api.getCertificationBySlug('inexistente')
    } catch (e) {
      captured = e
    }

    expect(captured).toBeInstanceOf(ApiError)
    if (captured instanceof ApiError) {
      expect(captured.code).toBe('not_found')
      expect(captured.message).toContain('no encontrado')
    }
  })

  it('si el fetch falla (TypeError), ApiError code=network', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
    )

    let captured: unknown
    try {
      await api.getCertifications()
    } catch (e) {
      captured = e
    }

    expect(captured).toBeInstanceOf(ApiError)
    if (captured instanceof ApiError) {
      expect(captured.code).toBe('network')
    }
  })

  it('200 OK con JSON válido → resuelve normalmente', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ items: [], total: 0, page: 1, pageSize: 0 }),
          {
            status: 200,
            headers: { 'content-type': 'application/json' },
          },
        ),
      ),
    )

    const result = await api.getCertifications()
    expect(result.items).toEqual([])
    expect(result.total).toBe(0)
  })
})
