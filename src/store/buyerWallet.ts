import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Fix #FEAT-01 + ADR-0001 (análisis proyecto): wallet de hashes
 * guardados para el rol Comprador B2B.
 *
 * Una marca / distribuidor guarda los certs de sus proveedores y
 * recibe alertas si alguno cambia de estado. Esta es la versión
 * mock del store; en prod va contra `/api/v1/buyer/wallet/*`.
 */
export interface SavedCert {
  hash: string
  productName: string
  authorName: string
  category: 'ancestral' | 'tradicional' | 'inspiracion'
  status: 'vigente' | 'renovacion' | 'vencido' | 'suspendido' | 'denegado'
  savedAt: string
  /** Notas internas que la marca agrega para su uso. */
  note?: string
}

interface BuyerWalletState {
  certs: SavedCert[]
  add: (cert: SavedCert) => void
  remove: (hash: string) => void
  setNote: (hash: string, note: string) => void
}

export const useBuyerWalletStore = create<BuyerWalletState>()(
  persist(
    (set) => ({
      certs: [],
      add: (cert) =>
        set((s) => {
          if (s.certs.some((c) => c.hash === cert.hash)) return s
          return { certs: [cert, ...s.certs] }
        }),
      remove: (hash) =>
        set((s) => ({ certs: s.certs.filter((c) => c.hash !== hash) })),
      setNote: (hash, note) =>
        set((s) => ({
          certs: s.certs.map((c) => (c.hash === hash ? { ...c, note } : c)),
        })),
    }),
    { name: 'ancestral-seed-buyer-wallet-v1' },
  ),
)
