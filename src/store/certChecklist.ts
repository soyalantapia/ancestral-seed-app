import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChecklistCategory } from '@/types'

/**
 * Fix V2-TUT-20 (auditoría v2): el ChecklistDrawer del cert emitido
 * editaba las categorías con `useState` local — al cerrar el drawer
 * y abrirlo de nuevo, los toggles y comentarios se perdían. La
 * promesa del expediente firmado se rompía silenciosamente.
 *
 * Este store persiste el progreso del checklist por certId. La
 * primera vez que se abre el drawer y NO hay state guardado para ese
 * cert, hidratamos con el `initial` que el componente recibe. Las
 * sucesivas mutaciones (toggle, comment) van directo al store.
 *
 * Cuando llegue el backend, este store queda como cache + sync layer
 * (igual patrón que internalNotes, tutorCases).
 */
interface CertChecklistState {
  /** Map de certId → ChecklistCategory[] con el progreso del tutor. */
  byCert: Record<string, ChecklistCategory[]>
  /** Devuelve el checklist guardado o null si no fue hidratado todavía. */
  get: (certId: string) => ChecklistCategory[] | null
  /** Hidratar con seed inicial (solo si no existe todavía). */
  hydrateIfEmpty: (certId: string, initial: ChecklistCategory[]) => void
  /** Reemplaza el checklist completo (toggle items o set comment). */
  set: (certId: string, categories: ChecklistCategory[]) => void
}

export const useCertChecklistStore = create<CertChecklistState>()(
  persist(
    (set, get) => ({
      byCert: {},
      get: (certId) => get().byCert[certId] ?? null,
      hydrateIfEmpty: (certId, initial) => {
        if (get().byCert[certId]) return
        set((s) => ({
          byCert: { ...s.byCert, [certId]: initial },
        }))
      },
      set: (certId, categories) =>
        set((s) => ({
          byCert: { ...s.byCert, [certId]: categories },
        })),
    }),
    { name: 'ancestral-seed-cert-checklist-v1' },
  ),
)
