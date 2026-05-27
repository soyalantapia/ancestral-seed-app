import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface NotificationChannel {
  email: boolean
  inApp: boolean
  sms: boolean
}

export interface SettingsState {
  // ─── Cuenta ──────────────────────────────────────────
  email: string
  emailVerified: boolean

  // ─── Seguridad ───────────────────────────────────────
  twoFactor: boolean
  sessionTimeout: number // minutes
  loginNotifications: boolean

  // ─── Privacidad ─────────────────────────────────────
  profilePublic: boolean
  showLocation: boolean
  showContact: boolean
  allowSearchEngines: boolean
  publicHashVisible: boolean

  // ─── Notificaciones ─────────────────────────────────
  notifAuditUpdates: NotificationChannel
  notifEvidenceRequests: NotificationChannel
  notifMessages: NotificationChannel
  notifPayments: NotificationChannel
  notifMarketing: NotificationChannel
  weeklyDigest: boolean

  // ─── Pagos ───────────────────────────────────────────
  defaultCurrency: 'ARS' | 'USD' | 'COP' | 'EUR'
  fiscalName: string
  fiscalId: string
  fiscalAddress: string

  // ─── Apariencia ──────────────────────────────────────
  theme: 'light' | 'dark' | 'system'
  density: 'compact' | 'normal' | 'comfortable'
  language: 'es-AR' | 'es-MX' | 'es-CO' | 'en'
  timezone: string
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'

  // ─── Setters ────────────────────────────────────────
  update: (patch: Partial<SettingsState>) => void
  reset: () => void
}

const initial = {
  email: 'camila@ancestralseed.org',
  emailVerified: false,

  twoFactor: false,
  sessionTimeout: 60,
  loginNotifications: true,

  profilePublic: true,
  showLocation: false,
  showContact: true,
  allowSearchEngines: true,
  publicHashVisible: true,

  notifAuditUpdates: { email: true, inApp: true, sms: false },
  notifEvidenceRequests: { email: true, inApp: true, sms: false },
  notifMessages: { email: true, inApp: true, sms: false },
  notifPayments: { email: true, inApp: true, sms: false },
  notifMarketing: { email: false, inApp: false, sms: false },
  weeklyDigest: false,

  defaultCurrency: 'ARS' as const,
  fiscalName: '',
  fiscalId: '',
  fiscalAddress: '',

  theme: 'light' as const,
  density: 'normal' as const,
  language: 'es-AR' as const,
  timezone: 'America/Argentina/Buenos_Aires',
  dateFormat: 'DD/MM/YYYY' as const,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...initial,
      update: (patch) => set((s) => ({ ...s, ...patch })),
      reset: () => set(initial),
    }),
    {
      name: 'ancestral-seed-settings',
      // Persistimos todo MENOS los métodos (update, reset). Spread y borrá.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      partialize: ({ update, reset, ...data }) => data,
    },
  ),
)
