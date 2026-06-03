import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Notification } from '@/types'
import { mockNotifications } from '@/services/mocks/data'

interface NotificationsState {
  items: Notification[]
  markRead: (id: string) => void
  markAllRead: () => void
  remove: (id: string) => void
  unreadCount: () => number
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      items: mockNotifications,
      markRead: (id) =>
        set((s) => ({
          items: s.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
      markAllRead: () =>
        set((s) => ({ items: s.items.map((n) => ({ ...n, read: true })) })),
      remove: (id) =>
        set((s) => ({ items: s.items.filter((n) => n.id !== id) })),
      unreadCount: () => get().items.filter((n) => !n.read).length,
    }),
    {
      name: 'ancestral-seed-notifications',
      // v3: se quitaron las notis que apuntaban a certs eliminadas (req-002)
      // al pasar el demo a una sola certificación. Bump → reseed limpio.
      version: 3,
      // If schema or mocks change, bump version and reseed
      migrate: () => ({ items: mockNotifications } as Partial<NotificationsState>),
    },
  ),
)

// Cross-tab sync: re-hidrate cuando otra pestaña modifica el storage
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'ancestral-seed-notifications' && e.newValue) {
      try {
        const data = JSON.parse(e.newValue)
        if (data?.state?.items) {
          useNotificationsStore.setState({ items: data.state.items })
        }
      } catch {
        // ignore
      }
    }
  })
}
