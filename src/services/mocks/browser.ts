import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

/**
 * Arranca el SW de MSW.
 *
 * Decisiones clave (documentadas tras el fix de mayo 2026):
 *
 * 1. La race del SW (el SW se registra pero todavía no controla ESTA carga
 *    en el primer load) se maneja en la capa de fetch: `api.ts` espera al
 *    SW (`waitForMswReady`) y reintenta de forma transparente. Antes
 *    usábamos `waitUntilReady` (deprecado en MSW v2, generaba warning) + un
 *    reload con guard en sessionStorage, que era jarring y se TRABABA si el
 *    guard quedaba seteado → "Certificado no encontrado" recurrente.
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
    serviceWorker: {
      url: `${base}mockServiceWorker.js`,
      options: { updateViaCache: 'none' },
    },
  })

  // Ya NO recargamos la página si el SW todavía no controla esta carga
  // (era jarring y el guard en sessionStorage podía trabarse, causando el
  // "Certificado no encontrado" recurrente). La capa de fetch (api.ts →
  // request/waitForMswReady) espera al SW y reintenta de forma transparente.
  // Acá solo dejamos un diagnóstico en dev.
  if (
    import.meta.env.DEV &&
    typeof navigator !== 'undefined' &&
    navigator.serviceWorker
  ) {
    const controller = navigator.serviceWorker.controller
    console.info(
      controller
        ? `[MSW] Controlando la página · scope=${controller.scriptURL}`
        : '[MSW] SW registrado; aún no controla esta carga — los fetch a /api/* reintentan solos.',
    )
  }
}
