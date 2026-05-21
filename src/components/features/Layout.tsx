import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { ErrorBoundary } from './ErrorBoundary'
import { SkipToContent } from './SkipToContent'
import { CommandPalette } from './CommandPalette'
import { HashScrollHandler } from './HashScrollHandler'

export function Layout() {
  const location = useLocation()
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SkipToContent />
      {/* Maneja scroll a anchors (#beneficios, #como-funciona) cuando se
          navega vía Link/NavLink. Sin esto, React Router solo cambia el
          pathname y queda en el top de la página. */}
      <HashScrollHandler />
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        {/* key={pathname} reinicia el boundary al cambiar de ruta:
            el user no queda atrapado en una pantalla rota si navega */}
        <ErrorBoundary key={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
      <CommandPalette />
    </div>
  )
}
