import { useTutorCasesStore } from './tutorCases'
import { useTutorTasksStore } from './tutorTasks'
import { useInternalNotesStore } from './internalNotes'
import { useCertChecklistStore } from './certChecklist'
import { useCoverByRequestStore } from './coverByRequest'
import { useLastVisitStore } from './lastVisit'
import { useCertifyFormStore } from './certifyForm'
import { useNotificationsStore } from './notifications'
import { useCaseSignaturesStore } from './caseSignatures'

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
/**
 * Fix V3-POS-05 (auditoría v3): el logout y "Eliminar cuenta" no
 * limpiaban los stores del v2. En navegador compartido / kiosko /
 * equipo de pruebas, el siguiente usuario veía la portada elegida,
 * el draft del CertifyForm y las notas internas del anterior. Esta
 * función tiene una variante `forLogout: true` que ADEMÁS limpia:
 *
 * - `useCertifyFormStore` (draft de postulación con datos personales)
 * - `useNotificationsStore` (historial de notifs)
 *
 * Para "Restaurar demo" del kanban del tutor preferimos NO borrar
 * estos dos (el reviewer puede estar a mitad de un draft o quiere
 * mantener las notifs), pero para logout sí los limpiamos.
 */
/**
 * Helper interno: notifica a las OTRAS pestañas que el localStorage
 * fue purgado. Sin esto, otra tab con la app cargada NO recibe el
 * storage event del removeItem (`storage` solo dispara cross-tab para
 * `setItem`/`removeItem` en OTRA tab — pero el persist middleware
 * inmediatamente re-escribe con su estado en memoria, anulando el
 * cleanup).
 *
 * Disparamos manualmente un StorageEvent custom que el listener de
 * notifications.ts (y futuros) puede chequear para refrescar.
 *
 * Fix V4-POS-11 (auditoría v4).
 */
function broadcastStoresReset(): void {
  if (typeof window === 'undefined' || typeof StorageEvent === 'undefined') {
    return
  }
  try {
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: '__ancestral-seed-demo-reset__',
        newValue: String(Date.now()),
      }),
    )
  } catch {
    // Algunos browsers viejos no permiten construir StorageEvent.
  }
}

export function resetDemoStores(opts?: {
  forLogout?: boolean
  /**
   * Fix V4-POS-10 (auditoría v4): por defecto NO limpia
   * `caseSignatures` — esas son datos del tutor y un postulante que
   * cierra sesión no debería tener authority sobre ellas. Solo el
   * "Restaurar demo" del kanban (forTutorReset:true) las limpia.
   */
  forTutorReset?: boolean
}): readonly string[] {
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
    // Fix V3-TUT-11: incluir el nuevo store de firmas
    'ancestral-seed-case-signatures-v1',
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
  // Fix V4-POS-10: solo limpiar firmas en reset del tutor.
  if (opts?.forTutorReset) {
    try {
      useCaseSignaturesStore.getState().clear()
      touched.push('caseSignatures')
    } catch {
      /* noop */
    }
  }

  // Limpiezas adicionales solo en logout / delete-account — datos
  // que el "Restaurar demo" prefiere mantener (draft en progreso,
  // notifs leídas).
  if (opts?.forLogout) {
    if (typeof window !== 'undefined' && window.localStorage) {
      for (const key of [
        'ancestral-seed-certify-form-v2',
        'ancestral-seed-notifications',
      ]) {
        try {
          window.localStorage.removeItem(key)
        } catch {
          /* noop */
        }
      }
    }
    try {
      useCertifyFormStore.getState().reset()
      touched.push('certifyForm')
    } catch {
      /* noop */
    }
    try {
      // useNotificationsStore no expone reset oficialmente; lo
      // limpiamos con setState directo a un array vacío.
      useNotificationsStore.setState({ items: [] })
      touched.push('notifications')
    } catch {
      /* noop */
    }
  }

  // Fix V4-POS-11: notificar a otras tabs para que refresquen.
  broadcastStoresReset()
  return touched
}
