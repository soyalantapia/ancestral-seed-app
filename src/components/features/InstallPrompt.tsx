import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

/**
 * Captura el evento `beforeinstallprompt` de Chrome/Edge/Brave y muestra
 * un banner sutil ofreciendo instalar la PWA.
 *
 * Patrones:
 *  - El evento solo se dispara si el manifest + SW están registrados y
 *    el sitio cumple los criterios de instalabilidad de Chrome.
 *  - Una vez que el user acepta o rechaza, NO volvemos a mostrarlo en
 *    esa sesión (sessionStorage flag).
 *  - Si el user ya instaló la app (`display-mode: standalone`), nada se
 *    muestra.
 *
 * Tipos: `BeforeInstallPromptEvent` no está en lib.dom.d.ts; lo definimos
 * minimal para evitar `any`.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const DISMISS_KEY = 'ancestral-seed-install-dismissed'

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    // Skip si ya está instalada
    if (window.matchMedia('(display-mode: standalone)').matches) return
    // Skip si ya descartó en esta sesión
    if (sessionStorage.getItem(DISMISS_KEY)) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      // Esperar 6s antes de mostrar para no interrumpir la primera impresión
      setTimeout(() => setVisible(true), 6000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const dismiss = () => {
    setVisible(false)
    sessionStorage.setItem(DISMISS_KEY, '1')
  }

  const install = async () => {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    dismiss()
  }

  if (!visible || !deferred) return null

  return (
    <div
      role="dialog"
      aria-label="Instalar Ancestral Seed"
      className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-sm rounded-2xl border border-gold-300/50 bg-white p-4 shadow-2xl md:bottom-6 md:left-auto md:right-6"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-500 text-navy-500">
          <Download className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-navy-500">
            Instalá Ancestral Seed
          </p>
          <p className="mt-0.5 text-xs text-navy-300">
            Acceso rápido desde tu inicio + funciona offline.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Cerrar"
          className="rounded-full p-1.5 text-navy-300 hover:bg-neutral-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={dismiss}
          className="inline-flex h-9 items-center rounded-full px-3 text-xs font-bold text-navy-500 hover:bg-neutral-100"
        >
          Ahora no
        </button>
        <button
          type="button"
          onClick={install}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-navy-500 px-4 text-xs font-bold text-white shadow-sm hover:bg-navy-400"
        >
          <Download className="h-3.5 w-3.5" />
          Instalar
        </button>
      </div>
    </div>
  )
}
