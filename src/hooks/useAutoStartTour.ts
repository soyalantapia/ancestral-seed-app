import { useEffect } from 'react'
import { useOnboardingStore, type TourId } from '@/store/onboarding'

/**
 * Dispara automáticamente un tour si:
 *   - el user no lo completó nunca (no está en `completed`)
 *   - no hay otro tour activo en este momento
 *   - `paused` no está activo (fix V2-POS-11: no arrancar el tour
 *     atrás del ResumeOrFreshDialog del CertifyForm)
 *
 * Pensado para llamarse desde la página "principal" de cada flow:
 *   - /inicio → `useAutoStartTour('solicitante')`
 *   - /tutor/dashboard → `useAutoStartTour('tutor')`
 *
 * Delay configurable: el tour arranca tras `delayMs` para dar tiempo al
 * usuario a ver la pantalla antes de que aparezca el spotlight.
 *
 * Opción `paused`: si está en true, el effect no programa el tour. Útil
 * cuando hay un modal bloqueante arriba (resume dialog, signup, etc.)
 * que debe resolverse antes. Cuando paused vuelve a false, el effect
 * re-corre y agenda el tour normalmente.
 */
export function useAutoStartTour(
  tour: TourId,
  delayMs = 800,
  paused = false,
) {
  const completed = useOnboardingStore((s) => s.completed[tour])
  const activeTour = useOnboardingStore((s) => s.activeTour)
  const start = useOnboardingStore((s) => s.start)

  useEffect(() => {
    if (paused || completed || activeTour) return
    const t = setTimeout(() => {
      // Re-check con el state actual (puede haber cambiado durante el delay)
      const fresh = useOnboardingStore.getState()
      if (!fresh.completed[tour] && !fresh.activeTour) {
        start(tour)
      }
    }, delayMs)
    return () => clearTimeout(t)
  }, [tour, completed, activeTour, start, delayMs, paused])
}
