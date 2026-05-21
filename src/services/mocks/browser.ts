import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

export async function startMockWorker() {
  if (import.meta.env.VITE_USE_MSW === 'false') return
  const base = import.meta.env.BASE_URL || '/'
  await worker.start({
    onUnhandledRequest: 'bypass',
    // updateViaCache: 'none' fuerza al browser a no cachear el script del SW,
    // así si agregamos/movemos handlers no nos quedamos con un worker viejo
    // que devuelve 404 (caso típico: agregar /api/auth/login y que el SW
    // anterior no lo conozca).
    serviceWorker: {
      url: `${base}mockServiceWorker.js`,
      options: { updateViaCache: 'none' },
    },
  })
}
