import { Outlet, useLocation } from 'react-router-dom'
import { ErrorBoundary } from './ErrorBoundary'
import { HashScrollHandler } from './HashScrollHandler'

/**
 * Layout de CREDENCIAL — el destino del QR físico (ruta `/c/:slug`).
 *
 * A diferencia de `Layout`, NO monta Header, Footer, CommandPalette ni
 * SkipToContent: el objetivo es que al escanear el QR la ficha se lea como
 * una CREDENCIAL autocontenida (un carnet), no como "el website". Es una
 * vista sin navegación de salida a propósito (decisión de producto:
 * credencial pura).
 *
 * El contenido es la misma página `CertificationDetail` — que detecta el
 * modo por la ruta `/c/` — enmarcada centrada como una tarjeta sobre un
 * fondo tenue. En mobile ocupa todo el ancho (como un carnet en la mano);
 * en pantallas grandes flota como tarjeta redondeada.
 */
export function CredentialLayout() {
  const location = useLocation()
  return (
    <div className="min-h-screen bg-neutral-100">
      <HashScrollHandler />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-3xl focus:outline-none sm:px-4 sm:py-8"
      >
        <div className="overflow-hidden bg-white shadow-xl sm:rounded-3xl sm:ring-1 sm:ring-neutral-200">
          <ErrorBoundary key={location.pathname}>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
}
