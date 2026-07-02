import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { ErrorBoundary } from './ErrorBoundary'
import { SkipToContent } from './SkipToContent'
import { CommandPalette } from './CommandPalette'
import { HashScrollHandler } from './HashScrollHandler'
// import { CookieBanner } from './CookieBanner' — reactivar junto con el JSX de abajo

export function Layout() {
  const location = useLocation()
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SkipToContent />
      <HashScrollHandler />
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        <ErrorBoundary key={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
      <CommandPalette />
      {/* Aviso de cookies (Fix #FEAT-13, LGPD/GDPR) — oculto a pedido,
          se reactiva más adelante. Descomentar <CookieBanner /> cuando
          se retome. */}
    </div>
  )
}
