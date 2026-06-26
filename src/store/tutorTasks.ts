import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TutorTask } from '@/types'
import { mockTutorTasks } from '@/services/mocks/data'

/**
 * Store compartido de tareas del tutor — Fix SB11 (#TUT-29 de la
 * auditoría UX). Antes vivían en useState local separado en
 * TutorDashboard y TutorTasks, así que marcar "hecha" en una vista
 * no se reflejaba en la otra. Dos fuentes de verdad para los mismos
 * datos.
 *
 * Ahora ambas vistas leen del mismo store Zustand persistido en
 * localStorage. Cuando llegue el backend, este store queda como
 * cache + sync layer.
 *
 * El initial state se hidrata desde mockTutorTasks solo en la primera
 * carga — después la persistencia toma el control.
 */
/**
 * Filtros disponibles en las listas de tareas (Dashboard + Tasks).
 *
 * Fix V2-TUT-13 (auditoría v2): antes el filtro vivía en `useState`
 * local de cada página → cada navegación lo reseteaba a 'all'.
 * Ahora persiste con el resto del store para que el tutor que filtra
 * por "Urgentes" en el dashboard siga viendo "Urgentes" cuando entra
 * a /tutor/tareas y al volver al día siguiente.
 */
export type TaskFilter =
  | 'all'
  | 'pending'
  | 'done'
  | 'urgent'
  | 'today'
  | 'this_week'

interface TutorTasksState {
  tasks: TutorTask[]
  /** Filtro activo persistido. */
  filter: TaskFilter
  setFilter: (filter: TaskFilter) => void
  /** Marca una tarea como hecha/no-hecha. */
  toggle: (id: string) => void
  /** Marca varias tareas como hechas (bulk action). */
  markDone: (ids: string[]) => void
  /** Borra una tarea (típicamente después de procesarla). */
  remove: (id: string) => void
  /** Reset al estado mock — útil para testing y para el "Empezar de
   *  cero" de futuras features. */
  reset: () => void
}

export const useTutorTasksStore = create<TutorTasksState>()(
  persist(
    (set) => ({
      tasks: mockTutorTasks,
      filter: 'all',
      setFilter: (filter) => set({ filter }),
      toggle: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, done: !t.done } : t,
          ),
        })),
      markDone: (ids) => {
        const set_ = new Set(ids)
        set((s) => ({
          tasks: s.tasks.map((t) =>
            set_.has(t.id) ? { ...t, done: true } : t,
          ),
        }))
      },
      remove: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      reset: () => set({ tasks: mockTutorTasks, filter: 'all' }),
    }),
    {
      name: 'ancestral-seed-tutor-tasks-v2',
      version: 2,
      /**
       * Fix V2-TUT-16 (auditoría v2): antes el initial state se
       * hidrataba con `mockTutorTasks` solo la primera vez que el
       * store se creaba en un browser. Si después actualizábamos el
       * mock (nuevas tareas, deadlines, etc.) los browsers existentes
       * no veían los cambios — quedaban cacheados con la versión vieja
       * indefinidamente. Cambiamos el `name` (v2) para invalidar
       * versiones previas y agregamos `migrate` para futuras
       * actualizaciones del schema.
       */
      migrate: (persisted, version) => {
        if (version < 2) {
          // Reset duro a mock cuando subimos versión — pierde el
          // estado del demo viejo pero gana coherencia con el nuevo mock.
          return {
            tasks: mockTutorTasks,
            filter: 'all',
          } as TutorTasksState
        }
        return persisted as TutorTasksState
      },
    },
  ),
)
