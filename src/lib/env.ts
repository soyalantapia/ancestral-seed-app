/**
 * Fix #GAP-08 (análisis proyecto): schema zod para validar las env
 * vars al arranque. Antes un typo en VITE_USE_MSW (ej. "fals" en vez
 * de "false") daba comportamiento silencioso confuso. Ahora el parse
 * falla LOUD con mensaje claro al levantar la app.
 *
 * Vite expone solo las que empiezan con VITE_ al cliente. Las demás
 * (server, build-time) viven en process.env y solo se leen desde
 * scripts/*.mjs.
 */
import { z } from 'zod'

const EnvSchema = z.object({
  /** Si MSW intercepta /api/* en runtime. "false" lo desactiva (prod sin mocks). */
  VITE_USE_MSW: z.enum(['true', 'false']).default('true'),
  /** Sentry DSN opcional. Sin esto, el wrapper de observabilidad es no-op. */
  VITE_SENTRY_DSN: z.string().url().optional().or(z.literal('')),
  /** PostHog/Plausible token opcional para analytics. */
  VITE_ANALYTICS_TOKEN: z.string().optional().or(z.literal('')),
  /** Modo build: dev/prod. Vite la setea automático. */
  MODE: z.enum(['development', 'production', 'test']).default('development'),
})

export type Env = z.infer<typeof EnvSchema>

/**
 * Lee + parsea las env vars una vez al cargar el módulo. Si falla,
 * un `console.error` enumerable + fallback a defaults para que la app
 * arranque (mejor demo roto que pantalla blanca total).
 */
function loadEnv(): Env {
  const result = EnvSchema.safeParse({
    VITE_USE_MSW: import.meta.env.VITE_USE_MSW,
    VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
    VITE_ANALYTICS_TOKEN: import.meta.env.VITE_ANALYTICS_TOKEN,
    MODE: import.meta.env.MODE,
  })
  if (!result.success) {
    // eslint-disable-next-line no-console
    console.error(
      '[env] Variables inválidas — usando defaults:',
      result.error.flatten().fieldErrors,
    )
    return EnvSchema.parse({}) // todos los defaults
  }
  return result.data
}

export const env = loadEnv()
