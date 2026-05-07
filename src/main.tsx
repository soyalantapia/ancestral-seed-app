import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { router } from './routes'
import './index.css'

async function bootstrap() {
  if (import.meta.env.VITE_USE_MSW !== 'false') {
    const { startMockWorker } = await import('./services/mocks/browser')
    await startMockWorker()
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </StrictMode>,
  )
}

bootstrap()
