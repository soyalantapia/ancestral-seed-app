import { useEffect, useState } from 'react'
import { Cookie, X } from 'lucide-react'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'ancestral-seed-cookie-consent-v1'

/**
 * Fix #FEAT-13 (análisis proyecto): banner de consentimiento de
 * cookies. Cumple con LGPD/GDPR/Ley Argentina 25.326. Aparece
 * UNA VEZ por device hasta que el user acepta o rechaza. La
 * decisión persiste en localStorage; cualquier user puede revisarla
 * después en Settings → Mis datos personales.
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      // Pequeño delay para que no compita con el primer paint.
      const t = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(t)
    }
  }, [])

  if (!visible) return null

  const persist = (decision: 'accept' | 'reject') => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ decision, at: new Date().toISOString() }),
      )
    } catch {
      /* noop */
    }
    setVisible(false)
  }

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-3xl p-4"
    >
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xl md:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
            <Cookie className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-bold text-navy-500">
              Usamos cookies operativas y opcionales
            </p>
            <p className="mt-1 text-xs leading-relaxed text-navy-300">
              Las cookies operativas son necesarias para la sesión y la
              seguridad. Las opcionales nos ayudan a medir uso anónimo
              (Plausible). No usamos cookies de marketing ni de
              terceros para perfilado.{' '}
              <Link
                to="/legal/cookies"
                className="font-bold text-navy-500 underline"
              >
                Política de cookies
              </Link>
              .
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => persist('accept')}
                className="rounded-full bg-navy-500 px-4 py-2 text-xs font-bold text-white hover:bg-navy-400"
              >
                Aceptar todo
              </button>
              <button
                type="button"
                onClick={() => persist('reject')}
                className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-xs font-bold text-navy-500 hover:bg-neutral-100"
              >
                Solo operativas
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setVisible(false)}
            aria-label="Cerrar aviso (decide después)"
            className="rounded-full p-1 text-navy-300 hover:bg-neutral-100 hover:text-navy-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
