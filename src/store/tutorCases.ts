import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { mockTutorCases } from '@/services/mocks/data'
import type { CaseStage, TutorCase } from '@/types'

/**
 * Store del kanban del tutor con persist.
 *
 * Antes: TutorCases.tsx tenía `useState<TutorCase[]>(mockTutorCases)`
 * local. Si el tutor movía un caso entre columnas (drag/drop) y luego
 * navegaba a otra pantalla (ej. dashboard) y volvía, **el cambio se
 * perdía**. UX confusa que parecía un bug random.
 *
 * Ahora: estado global persistido en localStorage (key
 * `ancestral-seed-tutor-cases-v1`). Cuando exista backend real, los
 * setters van a llamar `api.updateCase()` y reflejar la respuesta.
 *
 * `reset()` vuelve al mockTutorCases original — útil para QA + demo.
 */
interface TutorCasesState {
  cases: TutorCase[]
  /** Mueve un caso entre etapas (drag/drop). */
  moveCase: (caseId: string, target: CaseStage) => void
  /** Agrega un caso nuevo al inicio (siempre en Postulados). */
  addCase: (newCase: TutorCase) => void
  /** Asigna un tutor a un caso (cuando alguien hace "Asignarme"). */
  assignTutor: (
    caseId: string,
    tutor: { id: string; name: string; avatarUrl?: string },
  ) => void
  /** Vuelve al state inicial mock — para demo / reset. */
  reset: () => void
}

export const useTutorCasesStore = create<TutorCasesState>()(
  persist(
    (set) => ({
      cases: mockTutorCases,
      moveCase: (caseId, target) =>
        set((s) => ({
          cases: s.cases.map((c) =>
            c.id === caseId ? { ...c, stage: target } : c,
          ),
        })),
      addCase: (newCase) =>
        set((s) => ({ cases: [newCase, ...s.cases] })),
      assignTutor: (caseId, tutor) =>
        set((s) => ({
          cases: s.cases.map((c) =>
            c.id === caseId
              ? {
                  ...c,
                  tutorId: tutor.id,
                  tutorName: tutor.name,
                  tutorAvatarUrl: tutor.avatarUrl,
                }
              : c,
          ),
        })),
      reset: () => set({ cases: mockTutorCases }),
    }),
    // v2: los casos mock se re-sincronizaron (autores/productos/regiones
    // reales). Sin bumpear la key, `persist` prioriza el localStorage viejo
    // y el tutor seguiría viendo los casos ANTERIORES. La key nueva descarta
    // el estado viejo y siembra desde el `mockTutorCases` actualizado.
    { name: 'ancestral-seed-tutor-cases-v2' },
  ),
)
