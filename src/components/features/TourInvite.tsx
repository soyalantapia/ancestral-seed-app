import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X } from 'lucide-react'
import { useOnboardingStore, type TourId } from '@/store/onboarding'

/**
 * Invitación suave al recorrido guiado.
 *
 * En vez de secuestrar la pantalla con un spotlight automático apenas
 * entrás, ofrecemos un cartelito NO bloqueante en una esquina: "¿Te muestro
 * cómo funciona?". El recorrido solo arranca si la persona acepta. Más
 * digno y menos invasivo para un público de baja alfabetización digital.
 *
 * Gating:
 *   - Solo aparece si el tour no fue visto (`completed[tour]` falso) y no
 *     hay otro tour activo.
 *   - "Ahora no" lo marca como visto (`decline`) para no insistir cada
 *     visita; se puede reabrir desde Ayuda → "Ver cómo funciona".
 *   - Tras un delay corto, para no aparecer encima del primer render.
 */
export function TourInvite({
  tour,
  delayMs = 900,
}: {
  tour: TourId
  delayMs?: number
}) {
  const completed = useOnboardingStore((s) => s.completed[tour])
  const activeTour = useOnboardingStore((s) => s.activeTour)
  const start = useOnboardingStore((s) => s.start)
  const decline = useOnboardingStore((s) => s.decline)
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (completed || activeTour) {
      setShow(false)
      return
    }
    const t = setTimeout(() => {
      const fresh = useOnboardingStore.getState()
      if (!fresh.completed[tour] && !fresh.activeTour) setShow(true)
    }, delayMs)
    return () => clearTimeout(t)
  }, [completed, activeTour, tour, delayMs])

  // Si arranca el tour (u otro), ocultamos la invitación.
  if (activeTour) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-label="¿Querés un recorrido guiado?"
          // Abajo a la derecha, JUSTO encima del FAB de ayuda (bottom-24),
          // para agruparse con la ayuda sin taparlo y sin pisar el sidebar.
          // Mobile: banner ancho (inset-x-4). Desktop: tarjeta de 360px.
          className="fixed inset-x-4 bottom-24 z-40 rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xl ring-1 ring-navy-500/5 sm:inset-x-auto sm:right-6 sm:w-[360px]"
        >
          <button
            type="button"
            onClick={() => decline(tour)}
            aria-label="Cerrar"
            className="absolute right-3 top-3 rounded-full p-1 text-navy-300 transition-colors hover:bg-neutral-100"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-3 pr-6">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-500 text-navy-500">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="font-bold text-navy-500">
                ¿Te muestro cómo funciona?
              </p>
              <p className="mt-1 text-sm leading-relaxed text-navy-300">
                Un recorrido guiado de 1 minuto por Ancestral Seed.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => decline(tour)}
              className="rounded-full px-4 py-2 text-sm font-semibold text-navy-300 transition-colors hover:bg-neutral-100 hover:text-navy-500"
            >
              Ahora no
            </button>
            <button
              type="button"
              onClick={() => start(tour)}
              className="inline-flex items-center gap-2 rounded-full bg-navy-500 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-navy-400"
            >
              <Sparkles className="h-4 w-4" />
              Sí, mostrame
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
