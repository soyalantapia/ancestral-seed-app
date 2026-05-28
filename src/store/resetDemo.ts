import { useTutorCasesStore } from './tutorCases'
import { useTutorTasksStore } from './tutorTasks'
import { useInternalNotesStore } from './internalNotes'
import { useCertChecklistStore } from './certChecklist'
import { useCoverByRequestStore } from './coverByRequest'
import { useLastVisitStore } from './lastVisit'

/**
 * Fix V3-TUT-09 + V3-POS-20 + V3-POS-05 (auditoría v3):
 *
 * Helper centralizado para resetear TODOS los stores de demo a su
 * estado original. Antes "Restaurar demo" del kanban del tutor solo
 * tocaba `tutorCases` — pero el demo del v2 introdujo varios stores
 * persistidos más (`tutorTasks`, `internalNotes`, `certChecklist`,
 * `coverByRequest`, `lastVisit`) que quedaban con datos del reviewer
 * anterior cuando se "reseteaba" — generando estados Frankenstein.
 *
 * Este helper:
 * 1. Llama a `.reset()` o equivalente de cada store con esa API.
 * 2. Para los stores que NO tienen reset (`internalNotes`, `cover`,
 *    `lastVisit`), borra directamente el localStorage key — Zustand
 *    persist re-hidrata desde el initial state en el próximo
 *    `getState()`.
 * 3. Devuelve la lista de stores tocados para que el caller pueda
 *    mostrar feedback granular si quiere.
 *
 * NO toca:
 * - `useAuthStore` (sesión del user; el logout es responsabilidad
 *   aparte)
 * - `useOnboardingStore` (tours completados; queremos preservarlos
 *   para que el reviewer no los tenga que cerrar de nuevo)
 * - `useSettingsStore`, `useUiStore` (preferencias UX que el user
 *   eligió, no son "estado del demo")
 * - `useCertifyFormStore` (draft de postulación — borrarlo es
 *   destructivo; mejor que el user lo haga explícito desde el form)
 * - `useNotificationsStore` (parte del demo pero su reset puede
 *   confundir si el user ya leyó algunas)
 */
export function resetDemoStores(): readonly string[] {
  const touched: string[] = []

  // Stores con API reset() expuesta
  useTutorCasesStore.getState().reset()
  touched.push('tutorCases')

  useTutorTasksStore.getState().reset()
  touched.push('tutorTasks')

  // Stores sin reset() — limpiamos por localStorage + re-hidratación
  // mediante Zustand persist.clearStorage si está disponible.
  const keysToClear = [
    'ancestral-seed-internal-notes-v2',
    'ancestral-seed-cert-checklist-v1',
    'ancestral-seed-cover-by-request-v1',
    'ancestral-seed-last-visit-v1',
  ]
  if (typeof window !== 'undefined' && window.localStorage) {
    for (const key of keysToClear) {
      try {
        window.localStorage.removeItem(key)
      } catch {
        // ignore quota / permission errors
      }
    }
  }

  // Forzar re-hidratación de los stores que limpiamos por
  // localStorage. Zustand persist re-lee del storage la próxima vez
  // que se accede al state, pero si ya hay subscribers activos
  // necesitan saber del cambio. Disparamos un setState idéntico para
  // forzar notify.
  try {
    useInternalNotesStore.setState({ notes: [], seeded: {} })
    touched.push('internalNotes')
  } catch {
    /* noop */
  }
  try {
    useCertChecklistStore.setState({ byCert: {} })
    touched.push('certChecklist')
  } catch {
    /* noop */
  }
  try {
    useCoverByRequestStore.setState({ overrides: {} })
    touched.push('coverByRequest')
  } catch {
    /* noop */
  }
  try {
    useLastVisitStore.setState({ lastVisitAt: null })
    touched.push('lastVisit')
  } catch {
    /* noop */
  }

  return touched
}
