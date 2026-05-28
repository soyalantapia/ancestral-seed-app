import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Notas internas del equipo tutor — persistidas entre sesiones para
 * que el tutor que vuelve al día siguiente no pierda contexto.
 *
 * Cierra el bug #TUT-15 de la auditoría UX: el TutorCaseDetail (caso
 * activo) no tenía panel de notas internas, solo Mensajes (públicos
 * con postulante) e Historial (log inmutable). Las notas eran MÁS
 * valiosas durante el proceso activo que después de emitido — y
 * justamente solo existían en el cert emitido.
 *
 * Diseño:
 * - `entityKey` es genérico (case-CE-101, cert-CE-001, etc) para que
 *   este store sirva tanto al caso activo como al cert emitido en
 *   el futuro.
 * - Persiste en localStorage (key 'ancestral-seed-internal-notes-v1').
 *   Cuando entre backend, este store queda como cache + sync layer.
 * - Las notas SOLO se ven en el panel — nunca se mezclan con Mensajes
 *   públicos. Por eso no hay `visibility` o flags.
 */

export interface InternalNote {
  id: string
  /** Identificador del expediente — "case-CE-101" o "cert-CE-001". */
  entityKey: string
  authorName: string
  /** Iniciales para el avatar (2 chars). */
  authorInitials: string
  body: string
  /** ISO timestamp. */
  at: string
  /** Pinned arriba del todo si true. */
  pinned?: boolean
}

interface InternalNotesState {
  notes: InternalNote[]
  /**
   * Fix V3-TUT-02 (auditoría v3): sentinel persistido por entityKey
   * que marca "ya hidratamos los seeds aquí, no vuelvas a hacerlo".
   * Antes el NotesDrawer del cert chequeaba `if (notes.length === 0)`
   * para decidir hidratar — pero si el tutor borraba todas las notas
   * y reabría el drawer, ese check era true otra vez y los seeds
   * reaparecían como zombies. Este flag corta el ciclo: una vez
   * hidratado un entityKey, nunca más.
   */
  seeded: Record<string, true>
  /** Devuelve las notas de un expediente ordenadas por pinned desc + at desc. */
  notesFor: (entityKey: string) => InternalNote[]
  addNote: (input: {
    entityKey: string
    body: string
    authorName: string
    authorInitials: string
    /** Override del timestamp `at` para preservar fechas de seeds. */
    at?: string
  }) => InternalNote
  /** Marca un entityKey como hidratado para evitar re-seed posterior. */
  markSeeded: (entityKey: string) => void
  /** Devuelve true si ya hidratamos seeds para este entityKey. */
  isSeeded: (entityKey: string) => boolean
  updateNote: (id: string, body: string) => void
  removeNote: (id: string) => void
  togglePinned: (id: string) => void
}

export const useInternalNotesStore = create<InternalNotesState>()(
  persist(
    (set, get) => ({
      notes: [],
      seeded: {},
      notesFor: (entityKey) =>
        get()
          .notes.filter((n) => n.entityKey === entityKey)
          .sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
            return b.at.localeCompare(a.at)
          }),
      addNote: ({ entityKey, body, authorName, authorInitials, at }) => {
        const note: InternalNote = {
          id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          entityKey,
          authorName,
          authorInitials,
          body: body.trim(),
          // Fix V3-TUT-02: respetar el `at` original del seed si viene
          // explícito — antes los seeds hidratados perdían su timestamp
          // histórico (ej. 2026-02-12) y se convertían en "ahora".
          at: at ?? new Date().toISOString(),
        }
        set((s) => ({ notes: [note, ...s.notes] }))
        return note
      },
      markSeeded: (entityKey) =>
        set((s) => ({ seeded: { ...s.seeded, [entityKey]: true } })),
      isSeeded: (entityKey) => Boolean(get().seeded[entityKey]),
      updateNote: (id, body) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, body: body.trim() } : n,
          ),
        })),
      removeNote: (id) =>
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
      togglePinned: (id) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, pinned: !n.pinned } : n,
          ),
        })),
    }),
    {
      name: 'ancestral-seed-internal-notes-v2',
      version: 2,
      migrate: (persisted, version) => {
        if (version < 2) {
          // v1 → v2: agregar `seeded: {}`. Reset suave del cache.
          const s = (persisted ?? {}) as Partial<InternalNotesState>
          return {
            notes: s.notes ?? [],
            seeded: {},
          } as InternalNotesState
        }
        return persisted as InternalNotesState
      },
    },
  ),
)
