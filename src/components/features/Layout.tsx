import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { ErrorBoundary } from './ErrorBoundary'

export function Layout() {
  const location = useLocation()
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* key={pathname} reinicia el boundary al cambiar de ruta:
            el user no queda atrapado en una pantalla rota si navega */}
        <ErrorBoundary key={location.pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  )
}
