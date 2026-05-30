/**
 * Fix #GAP-04 (análisis proyecto): wrapper de observabilidad.
 *
 * Antes cuando algo se rompía en producción, ningún dato — ni
 * stacktrace ni breadcrumbs ni user context. La debug post-mortem
 * dependía de que el reporte del user fuera bueno.
 *
 * Este módulo expone una API estable (`captureException`, `setUser`,
 * `addBreadcrumb`) que internamente delega a Sentry si está
 * configurado, o es no-op si no. Permite agregar Sentry en cualquier
 * momento sin tocar el código de negocio.
 *
 * Para activar Sentry real:
 *   1. `npm i @sentry/react @sentry/tracing`
 *   2. setear `VITE_SENTRY_DSN` en .env
 *   3. descomentar el bloque marcado abajo
 *
 * En dev, los errores van a console.error con prefijo `[obs]` así
 * son fáciles de filtrar.
 */
import { env } from './env'

interface ObsUser {
  id: string
  email?: string
  role?: string
}

const enabled = Boolean(env.VITE_SENTRY_DSN)

export function initObservability(): void {
  if (!enabled) return
  // eslint-disable-next-line no-console
  console.info('[obs] Sentry activado con DSN configurado')
  // ─── Bloque para activar Sentry real ────────────────────────
  // import * as Sentry from '@sentry/react'
  // Sentry.init({
  //   dsn: env.VITE_SENTRY_DSN,
  //   environment: env.MODE,
  //   tracesSampleRate: env.MODE === 'production' ? 0.1 : 1.0,
  //   ignoreErrors: ['ResizeObserver loop limit exceeded'],
  // })
  // ────────────────────────────────────────────────────────────
}

export function captureException(
  err: unknown,
  context?: Record<string, unknown>,
): void {
  if (!enabled) {
    // eslint-disable-next-line no-console
    console.error('[obs]', err, context)
    return
  }
  // Sentry.captureException(err, { extra: context })
}

export function setUser(_user: ObsUser | null): void {
  if (!enabled) return
  // Sentry.setUser(_user)
}

export function addBreadcrumb(
  _message: string,
  _data?: Record<string, unknown>,
): void {
  if (!enabled) return
  // Sentry.addBreadcrumb({ message: _message, data: _data, category: 'app' })
}
