/**
 * Fix #GAP-04 (parcial) — analytics wrapper.
 *
 * Misma estrategia que observability.ts: API estable, no-op por
 * default, activable cuando se configure VITE_ANALYTICS_TOKEN.
 *
 * Eventos típicos del demo:
 *  - track('cert_view', { slug })
 *  - track('cert_share', { slug, channel })
 *  - track('verify_qr_scan', { result: 'ok' | 'unknown' })
 *  - track('postulate_step', { step: 1..7 })
 *  - track('signup_complete')
 *
 * Para activar PostHog real:
 *   1. `npm i posthog-js`
 *   2. setear `VITE_ANALYTICS_TOKEN`
 *   3. descomentar bloque init y track
 *
 * Alternativa privacidad-first: Plausible (script tag en index.html).
 */
import { env } from './env'

const enabled = Boolean(env.VITE_ANALYTICS_TOKEN)

export function initAnalytics(): void {
  if (!enabled) return
  // eslint-disable-next-line no-console
  console.info('[analytics] Activado con token configurado')
  // import posthog from 'posthog-js'
  // posthog.init(env.VITE_ANALYTICS_TOKEN!, {
  //   api_host: 'https://app.posthog.com',
  //   autocapture: false, // explicit tracking only
  // })
}

export function track(
  event: string,
  props?: Record<string, string | number | boolean | null>,
): void {
  if (!enabled) {
    if (env.MODE === 'development') {
      // eslint-disable-next-line no-console
      console.debug('[analytics]', event, props)
    }
    return
  }
  // posthog.capture(event, props)
}

export function identify(
  _userId: string,
  _traits?: Record<string, unknown>,
): void {
  if (!enabled) return
  // posthog.identify(_userId, _traits)
}

export function reset(): void {
  if (!enabled) return
  // posthog.reset()
}
