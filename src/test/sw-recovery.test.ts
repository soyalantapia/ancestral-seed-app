import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  orphanControllerPresent,
  purgeOrphanServiceWorkers,
} from '@/lib/swRecovery'

/**
 * Regresión del bug "Algo salió mal cargando los certificados".
 *
 * Causa raíz: un SW huérfano (Workbox/PWA de una versión anterior) queda
 * controlando la página; MSW no puede interceptar /api/* → los fetch caen
 * al SPA-fallback del server (HTML) → error. El purge de rescate anterior
 * era one-shot (flag de sesión) y, si perdía la race unregister→reload,
 * dejaba al cliente pegado para siempre.
 *
 * Este test aísla la lógica de recuperación (reproducción más cercana: no
 * podemos clonar el SW exacto del usuario, así que mockeamos el estado).
 */

const MSW_URL = 'https://x.test/mockServiceWorker.js'
const WORKBOX_URL = 'https://x.test/sw.js' // SW huérfano (no-MSW)
const ATTEMPTS_KEY = 'ancestral-seed:sw-purge-attempts'

function stubServiceWorker(opts: {
  controllerUrl?: string | null
  registrations?: Array<{ scriptURL: string; unregister: () => Promise<boolean> }>
}) {
  const controller = opts.controllerUrl
    ? { scriptURL: opts.controllerUrl }
    : null
  const registrations = (opts.registrations ?? []).map((r) => ({
    active: { scriptURL: r.scriptURL },
    waiting: null,
    installing: null,
    scope: 'https://x.test/',
    unregister: r.unregister,
  }))
  vi.stubGlobal('navigator', {
    serviceWorker: {
      controller,
      getRegistrations: vi.fn().mockResolvedValue(registrations),
    },
  })
}

let reloadSpy: ReturnType<typeof vi.fn>
let originalLocation: Location

beforeEach(() => {
  sessionStorage.clear()
  reloadSpy = vi.fn()
  originalLocation = window.location
  Object.defineProperty(window, 'location', {
    configurable: true,
    writable: true,
    value: { reload: reloadSpy },
  })
})

afterEach(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    writable: true,
    value: originalLocation,
  })
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('orphanControllerPresent()', () => {
  it('true cuando un SW NO-MSW controla la página', () => {
    stubServiceWorker({ controllerUrl: WORKBOX_URL })
    expect(orphanControllerPresent()).toBe(true)
  })

  it('false cuando controla el SW de MSW', () => {
    stubServiceWorker({ controllerUrl: MSW_URL })
    expect(orphanControllerPresent()).toBe(false)
  })

  it('false cuando no hay ningún controller', () => {
    stubServiceWorker({ controllerUrl: null })
    expect(orphanControllerPresent()).toBe(false)
  })
})

describe('purgeOrphanServiceWorkers()', () => {
  it('desregistra el SW huérfano y recarga (reintentable, no one-shot)', async () => {
    const unregister = vi.fn().mockResolvedValue(true)
    stubServiceWorker({
      controllerUrl: WORKBOX_URL,
      registrations: [{ scriptURL: WORKBOX_URL, unregister }],
    })

    const reloading = await purgeOrphanServiceWorkers()

    expect(unregister).toHaveBeenCalledTimes(1)
    expect(reloadSpy).toHaveBeenCalledTimes(1)
    expect(reloading).toBe(true)
    // Contador acotado (no flag one-shot): quedó en 1 para reintentar si hace falta.
    expect(sessionStorage.getItem(ATTEMPTS_KEY)).toBe('1')
  })

  it('NO recarga cuando solo está el SW de MSW (estado sano) y resetea el contador', async () => {
    sessionStorage.setItem(ATTEMPTS_KEY, '2')
    stubServiceWorker({
      controllerUrl: MSW_URL,
      registrations: [{ scriptURL: MSW_URL, unregister: vi.fn() }],
    })

    const reloading = await purgeOrphanServiceWorkers()

    expect(reloadSpy).not.toHaveBeenCalled()
    expect(reloading).toBe(false)
    expect(sessionStorage.getItem(ATTEMPTS_KEY)).toBeNull()
  })

  it('deja de recargar tras 3 intentos (no loopea infinito)', async () => {
    sessionStorage.setItem(ATTEMPTS_KEY, '3')
    const unregister = vi.fn().mockResolvedValue(true)
    stubServiceWorker({
      controllerUrl: WORKBOX_URL,
      registrations: [{ scriptURL: WORKBOX_URL, unregister }],
    })

    const reloading = await purgeOrphanServiceWorkers()

    expect(reloadSpy).not.toHaveBeenCalled()
    expect(reloading).toBe(false)
  })
})
