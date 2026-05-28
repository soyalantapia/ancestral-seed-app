import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'sonner'
import { router } from './routes'
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

/**
 * Cleanup defensivo de Service Workers huérfanos.
 *
 * Contexto: el bug original (mayo 2026) era que VitePWA registraba un SW
 * de Workbox que pisaba al de MSW. Aunque ya parcheamos vite.config con
 * `injectRegister: null` + `selfDestroying: true`, los browsers que
 * tenían el SW viejo instalado siguen con él controlando la página hasta
 * que el browser haga `update()` (que puede tardar).
 *
 * Esta función desregistra ACTIVAMENTE cualquier SW que no sea el de MSW
 * y limpia el Caches API. Si hubo que limpiar, dispara un reload UNA vez
 * (flag en sessionStorage previene loops infinitos).
 *
 * Solo corre en producción — en dev MSW es el único SW posible y no
 * queremos ciclos extra de cleanup que rompen HMR.
 */
async function purgeOrphanServiceWorkers(): Promise<boolean> {
  if (import.meta.env.DEV) return false
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return false
  }
  const ALREADY_PURGED = 'ancestral-seed:sw-purged-v1'
  if (sessionStorage.getItem(ALREADY_PURGED) === '1') return false

  const regs = await navigator.serviceWorker.getRegistrations()
  let purged = false
  for (const reg of regs) {
    const scriptUrl =
      reg.active?.scriptURL ||
      reg.installing?.scriptURL ||
      reg.waiting?.scriptURL ||
      ''
    // Solo dejamos vivo el SW de MSW. Cualquier otro (Workbox sw.js,
    // workers de extensiones que no estén en ese scope) muere.
    if (scriptUrl && !scriptUrl.includes('mockServiceWorker.js')) {
      // eslint-disable-next-line no-console
      console.warn(
        `[bootstrap] Desregistrando SW huérfano: ${scriptUrl}`,
      )
      try {
        await reg.unregister()
        purged = true
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[bootstrap] No pude desregistrar SW:', e)
      }
    }
  }

  if (purged && 'caches' in self) {
    try {
      const names = await caches.keys()
      await Promise.all(names.map((n) => caches.delete(n)))
      // eslint-disable-next-line no-console
      console.warn(`[bootstrap] Caches limpiados: ${names.length}`)
    } catch {
      /* ignore cache cleanup failures */
    }
  }

  if (purged) {
    sessionStorage.setItem(ALREADY_PURGED, '1')
    // Reload sin el SW viejo controlando → MSW puede registrarse limpio.
    window.location.reload()
    return true
  }
  return false
}

async function bootstrap() {
  // Si purgamos algo, el reload está en camino — no seguir bootstrapeando
  // con la página vieja porque iba a fallar igual.
  const purged = await purgeOrphanServiceWorkers()
  if (purged) return

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
