import { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { env } from '@/lib/env'

const STORAGE_KEY = 'ancestral-seed-demo-banner-dismissed-v1'

/**
 * Fix #FEAT-05 + #FEAT-07 (análisis proyecto): banner persistente
 * que aclara que el sitio es un "demo institucional" cuando el
 * backend real no está activo (MSW=true) o cuando el deploy es
 * gh-pages. Aparece arriba de todo y se puede minimizar (no se
 * cierra del todo — se acepta que es la verdad del demo).
 */
export function DemoModeBanner() {
  const [minimized, setMinimized] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(STORAGE_KEY) === '1'
  })
  const isMock = env.VITE_USE_MSW === 'true'
  if (!isMock) return null

  if (minimized) {
    return (
      <button
        type="button"
        onClick={() => {
          setMinimized(false)
          try {
            window.localStorage.removeItem(STORAGE_KEY)
          } catch {
            /* noop */
          }
        }}
        aria-label="Restaurar aviso de modo demo"
        className="fixed left-3 top-3 z-30 inline-flex items-center gap-1 rounded-full bg-warning-400 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg hover:bg-warning-400/90"
      >
        <AlertCircle className="h-3 w-3" />
        Demo
      </button>
    )
  }

  return (
    <div
      role="region"
      aria-label="Aviso modo demo"
      className="sticky top-0 z-30 w-full border-b border-warning-300 bg-warning-100/70 backdrop-blur"
    >
      <div className="mx-auto flex max-w-[1320px] items-center gap-3 px-4 py-2 text-[11px] leading-tight md:px-6">
        <AlertCircle className="h-3.5 w-3.5 shrink-0 text-warning-400" />
        <p className="flex-1 text-navy-500">
          <strong>Modo demo institucional ·</strong> Los pagos, firmas
          en blockchain y notificaciones por email son simulados. La
          integración real está prevista para Q3 2026.
        </p>
        <button
          type="button"
          onClick={() => {
            setMinimized(true)
            try {
              window.localStorage.setItem(STORAGE_KEY, '1')
            } catch {
              /* noop */
            }
          }}
          aria-label="Minimizar aviso"
          className="rounded-full p-0.5 text-navy-500 hover:bg-warning-300/40"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
