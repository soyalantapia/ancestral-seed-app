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
    { name: 'ancestral-seed-notifications' },
  ),
)
