import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Última visita del usuario al dashboard — usado por
 * DashboardHome para mostrar el bloque "Lo nuevo desde tu
 * última visita" (#POS-06 de la auditoría UX).
 *
 * Persiste en localStorage. La key cambia si en el futuro
 * tenemos auth multi-usuario para no mezclar visitas de
 * diferentes cuentas en el mismo browser.
 */
interface LastVisitState {
  /** ISO timestamp de la última vez que el user vio el dashboard. */
  lastVisitAt: string | null
  /** Marca la visita actual como vista — se llama al desmontar/blur. */
  markVisited: () => void
}

export const useLastVisitStore = create<LastVisitState>()(
  persist(
    (set) => ({
      lastVisitAt: null,
      markVisited: () => set({ lastVisitAt: new Date().toISOString() }),
    }),
    { name: 'ancestral-seed-last-visit-v1' },
  ),
)
