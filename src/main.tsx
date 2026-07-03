import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'sonner'
// Side-effect: instala el error map global de Zod (mensajes en español).
// Debe ir antes que cualquier schema valide para estandarizar errores.
import './lib/zodErrorMap'
import { router } from './routes'
import { purgeOrphanServiceWorkers } from './lib/swRecovery'
import { useThemeEffect } from './hooks/useThemeEffect'
import './index.css'

/**
 * Wrapper minimal que ejecuta efectos globales (tema, futuro: i18n,
 * analytics). Va dentro de StrictMode pero fuera de RouterProvider para
 * que el efecto persista entre cambios de ruta.
 */
function AppShell() {
  useThemeEffect()
  return (
    <HelmetProvider>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </HelmetProvider>
  )
}

async function bootstrap() {
  // En dev MSW es el único SW posible; el purge de SW huérfanos (Workbox
  // viejo de una versión anterior que pisa a MSW) solo tiene sentido en
  // prod. Si dispara una recarga, cortamos: la página se está yendo.
  if (!import.meta.env.DEV) {
    const reloading = await purgeOrphanServiceWorkers()
    if (reloading) return
  }

  if (import.meta.env.VITE_USE_MSW !== 'false') {
    const { startMockWorker } = await import('./services/mocks/browser')
    await startMockWorker()
  }

  // Root idempotente: en dev, el HMR (o una doble ejecución del módulo por
  // el churn de varias sesiones editando el server) puede re-ejecutar este
  // archivo. Sin esto, createRoot() se llamaría dos veces sobre #root y React
  // tira el warning "container already passed to createRoot". Cacheamos el
  // root en window y solo re-renderizamos.
  const container = document.getElementById('root')!
  const w = window as unknown as {
    __appRoot?: ReturnType<typeof createRoot>
  }
  const root = w.__appRoot ?? createRoot(container)
  w.__appRoot = root
  root.render(
    <StrictMode>
      <AppShell />
    </StrictMode>,
  )
}

bootstrap()
