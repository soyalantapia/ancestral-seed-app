import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TourId = 'solicitante' | 'tutor' | 'certifyForm'

interface OnboardingState {
  /** Tour activo en este momento. null si ningún tour está corriendo. */
  activeTour: TourId | null
  /** Índice del step actual (0-based). */
  step: number
  /** Tours que el user ya completó o saltó. Para no re-disparar auto. */
  completed: Partial<Record<TourId, boolean>>

  /** Arranca un tour desde el step 0. */
  start: (tour: TourId) => void
  /** Avanza al siguiente step. Si era el último, marca como completed. */
  next: () => void
  /** Retrocede al step anterior (clamp a 0). */
  prev: () => void
  /** Cierra el tour sin marcarlo completo — re-aparecerá en próxima visita
   *  si auto-start está enabled. */
  pause: () => void
  /** Cierra y marca como completo — no vuelve a auto-disparar. */
  finish: () => void
  /** Salta directo a un step (para "Ya completé esto, llevame al siguiente"). */
  setStep: (n: number) => void
  /** Resetea — útil para "ver tour de nuevo" desde Settings/Help. */
  reset: (tour: TourId) => void
  /** Marca un tour como visto SIN abrirlo — para el "Ahora no" de la
   *  invitación suave (no queremos que vuelva a ofrecerse cada visita). */
  decline: (tour: TourId) => void
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      activeTour: null,
      step: 0,
      completed: { solicitante: false, tutor: false },

      start: (tour) => set({ activeTour: tour, step: 0 }),
      next: () => set((s) => ({ step: s.step + 1 })),
      prev: () => set((s) => ({ step: Math.max(0, s.step - 1) })),
      pause: () => set({ activeTour: null }),
      finish: () =>
        set((s) =>
          s.activeTour
            ? {
                activeTour: null,
                step: 0,
                completed: { ...s.completed, [s.activeTour]: true },
              }
            : {},
        ),
      setStep: (n) => set({ step: Math.max(0, n) }),
      reset: (tour) =>
        set((s) => ({
          activeTour: tour,
          step: 0,
          completed: { ...s.completed, [tour]: false },
        })),
      decline: (tour) =>
        set((s) => ({ completed: { ...s.completed, [tour]: true } })),
    }),
    {
      name: 'ancestral-seed-onboarding',
      version: 1,
      // No persistir el `activeTour` ni el `step` — solo qué tours completó.
      // Si el user recarga a mitad de un tour, no queremos forzarlo a
      // seguir desde donde estaba: que el auto-start decida.
      partialize: ({ completed }) => ({ completed }),
    },
  ),
)
