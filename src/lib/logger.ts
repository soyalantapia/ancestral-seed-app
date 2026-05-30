/**
 * Fix #GAP-13 (análisis proyecto): logger estructurado.
 *
 * Antes había console.log/error/info esparcidos sin contexto. En
 * producción no sabemos qué módulo, qué user, qué request_id. Este
 * logger:
 *  - prefija con módulo (`[postulante]`, `[tutor]`)
 *  - opcionalmente envía a observability.captureException si es .error
 *  - silencia .debug en prod
 *  - acepta context structured
 *
 * Uso:
 *   const log = createLogger('checkout')
 *   log.info('payment_initiated', { itemId, method })
 *   log.error('payment_failed', err, { itemId })
 */
import { captureException } from './observability'
import { env } from './env'

interface LogContext {
  [key: string]: unknown
}

interface Logger {
  debug: (msg: string, ctx?: LogContext) => void
  info: (msg: string, ctx?: LogContext) => void
  warn: (msg: string, ctx?: LogContext) => void
  error: (msg: string, err?: unknown, ctx?: LogContext) => void
}

export function createLogger(scope: string): Logger {
  const prefix = `[${scope}]`
  const isProd = env.MODE === 'production'

  return {
    debug(msg, ctx) {
      if (isProd) return
      // eslint-disable-next-line no-console
      console.debug(prefix, msg, ctx ?? '')
    },
    info(msg, ctx) {
      // eslint-disable-next-line no-console
      console.info(prefix, msg, ctx ?? '')
    },
    warn(msg, ctx) {
      // eslint-disable-next-line no-console
      console.warn(prefix, msg, ctx ?? '')
    },
    error(msg, err, ctx) {
      // eslint-disable-next-line no-console
      console.error(prefix, msg, err, ctx ?? '')
      captureException(err ?? new Error(msg), { scope, msg, ...ctx })
    },
  }
}
