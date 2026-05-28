import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

/**
 * Arranca el SW de MSW.
 *
 * Decisiones clave (documentadas tras el fix de mayo 2026):
 *
 * 1. `waitUntilReady: true` (default v2 pero explícito acá) — la promise
 *    no resuelve hasta que el SW está controlando la página. Sin esto,
 *    los primeros fetches del Home (`useFeaturedCertifications`) pueden
 *    salir antes de que MSW intercepte → 404 al server real.
 *
 * 2. `onUnhandledRequest: 'bypass'` — pasa al network las requests que
 *    no matchean ningún handler (CDN, fonts, etc). Si fuera 'warn',
 *    saturaríamos la consola con cada request normal.
 *
 * 3. `updateViaCache: 'none'` — fuerza al browser a no cachear el
 *    script del SW. Crítico tras deploys: si agregamos un handler nuevo
 *    (ej. /api/auth/login) y el browser sirve el SW viejo del cache,
 *    el handler nuevo no existe → 404.
 *
 * 4. **PWA Workbox NO se registra automáticamente** (vite.config.ts
 *    tiene `injectRegister: null`). Si pasara, pisaría a este SW
 *    porque ambos comparten el mismo scope.
 */
export async function startMockWorker() {
  if (import.meta.env.VITE_USE_MSW === 'false') return
  const base = import.meta.env.BASE_URL || '/'
  await worker.start({
    onUnhandledRequest: 'bypass',
    waitUntilReady: true,
    serviceWorker: {
      url: `${base}mockServiceWorker.js`,
      options: { updateViaCache: 'none' },
    },
  })

  // Diagnóstico: verificar que el SW efectivamente esté controlando
  // la página. Si no, las requests siguientes saldrán al network y
  // veremos 404s. Esto debería ser imposible con waitUntilReady:true,
  // pero el log nos da visibilidad para futuras regresiones.
  if (typeof navigator !== 'undefined' && navigator.serviceWorker) {
    const controller = navigator.serviceWorker.controller
    if (!controller) {
      // eslint-disable-next-line no-console
      console.warn(
        '[MSW] El SW se registró pero no está controlando la página. ' +
          'Las requests a /api/* podrían fallar con 404. ' +
          'Si pasa esto en producción, revisar conflicto con Workbox.',
      )
    } else if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.info(
        `[MSW] Controlando la página · scope=${controller.scriptURL}`,
      )
    }
  }
}
