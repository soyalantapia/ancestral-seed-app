import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'sonner'
import { router } from './routes'
import { useThemeEffect } from './hooks/useThemeEffect'
import { InstallPrompt } from './components/features/InstallPrompt'
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
      <InstallPrompt />
    </HelmetProvider>
  )
}

async function bootstrap() {
  if (import.meta.env.VITE_USE_MSW !== 'false') {
    const { startMockWorker } = await import('./services/mocks/browser')
    await startMockWorker()
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AppShell />
    </StrictMode>,
  )
}

bootstrap()
