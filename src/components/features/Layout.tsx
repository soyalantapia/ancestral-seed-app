import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { ErrorBoundary } from './ErrorBoundary'
import { SkipToContent } from './SkipToContent'
import { CommandPalette } from './CommandPalette'
import { HashScrollHandler } from './HashScrollHandler'
import { DemoModeBanner } from './DemoModeBanner'
import { CookieBanner } from './CookieBanner'

export function Layout() {
  const location = useLocation()
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SkipToContent />
      {/* Fix #FEAT-05/07 (análisis proyecto): banner persistente que
          aclara que el demo no tiene backend / blockchain real. */}
      <DemoModeBanner />
      <HashScrollHandler />
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        <ErrorBoundary key={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
      <CommandPalette />
      {/* Fix #FEAT-13: aviso de cookies LGPD/GDPR. */}
      <CookieBanner />
    </div>
  )
}
