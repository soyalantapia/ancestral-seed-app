import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  /** Se llama cuando hay un error. Útil para limpiar state global (e.g. modales). */
  onError?: (error: Error, info: ErrorInfo) => void
  /** UI opcional custom. Si no se pasa, se usa el fallback default. */
  fallback?: (reset: () => void, error: Error) => ReactNode
}

interface State {
  error: Error | null
  isChunkError: boolean
}

/**
 * Detecta el típico error de "deploy mismatch": el bundle cacheado en el
 * browser apunta a chunks lazy que ya no existen porque hubo un deploy
 * nuevo. Manifestación: "Importing a module script failed",
 * "Failed to fetch dynamically imported module", "ChunkLoadError",
 * "Loading chunk N failed".
 */
function isChunkLoadError(error: Error): boolean {
  const msg = (error?.message ?? '').toLowerCase()
  const name = (error?.name ?? '').toLowerCase()
  return (
    name === 'chunkloaderror' ||
    msg.includes('importing a module script failed') ||
    msg.includes('failed to fetch dynamically imported module') ||
    msg.includes('loading chunk') ||
    msg.includes('loading css chunk')
  )
}

/**
 * Error boundary global. Captura errores de render/lifecycle de los hijos
 * y muestra una UI de fallback en vez de pantalla blanca. Permite resetear
 * sin recargar la página.
 *
 * Caso especial: si el error es por un chunk lazy que no se pudo cargar
 * (deploy mismatch), muestra una UI específica con un botón "Recargar"
 * que limpia el storage y vuelve a cargar. No reintenta solo para evitar
 * loops si el problema persiste.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, isChunkError: false }

  static getDerivedStateFromError(error: Error): State {
    return { error, isChunkError: isChunkLoadError(error) }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (typeof console !== 'undefined') {
      console.error('[ErrorBoundary]', error, info)
    }
    this.props.onError?.(error, info)
  }

  reset = () => {
    this.setState({ error: null, isChunkError: false })
  }

  reload = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('ancestral-seed-chunk-reload')
      window.location.reload()
    }
  }

  render() {
    const { error, isChunkError } = this.state
    if (!error) return this.props.children

    if (this.props.fallback) {
      return this.props.fallback(this.reset, error)
    }

    // UI específica para deploy mismatch (chunk load failure)
    if (isChunkError) {
      return (
        <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-100 text-gold-700">
            <RefreshCw className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-navy-500">
            Hay una versión nueva disponible
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-navy-300">
            Actualizamos la plataforma. Recargá la página para tomar la última
            versión y seguir trabajando.
          </p>
          <button
            type="button"
            onClick={this.reload}
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-navy-500 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-navy-400"
          >
            <RefreshCw className="h-4 w-4" />
            Recargar página
          </button>
        </div>
      )
    }

    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-error-100 text-error-400">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-navy-500">
          Algo salió mal
        </h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-navy-300">
          Tuvimos un problema cargando esta pantalla. Podés reintentar o volver
          al inicio. El equipo fue notificado.
        </p>
        <details className="mt-4 max-w-md text-left text-xs text-navy-300">
          <summary className="cursor-pointer font-semibold">
            Detalles técnicos
          </summary>
          <pre className="mt-2 max-h-32 overflow-auto rounded-lg bg-neutral-100 p-3 text-[11px] text-error-400">
            {error.message}
          </pre>
        </details>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={this.reset}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-navy-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-navy-400"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </button>
          <a
            href={import.meta.env.BASE_URL || '/'}
            className="inline-flex h-11 items-center rounded-full border border-neutral-300 bg-white px-5 text-sm font-semibold text-navy-500 transition-colors hover:bg-neutral-100"
          >
            Ir al inicio
          </a>
        </div>
      </div>
    )
  }
}
