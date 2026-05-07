import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

export async function startMockWorker() {
  if (import.meta.env.VITE_USE_MSW === 'false') return
  const base = import.meta.env.BASE_URL || '/'
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: `${base}mockServiceWorker.js` },
  })
}
