import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Fix V2-POS-06 (auditoría v2): la portada del producto se podía
 * elegir SOLO durante el CertifyForm (paso 5 evidencias). Una vez
 * enviada la postulación, el EvidenciasTab del CertificationRequest
 * no daba forma de cambiarla — si el postulante subía una mejor foto
 * después, no podía ser portada.
 *
 * Este store permite "override" de la portada por requestId. La
 * portada efectiva es: el override del store si existe, sino la
 * primera imagen del request (default). Cuando llegue el backend,
 * este store queda como cache + sync.
 */
interface CoverState {
  /** Map de requestId → evidenceId que actúa como portada. */
  overrides: Record<string, string>
  setCover: (requestId: string, evidenceId: string) => void
  clearCover: (requestId: string) => void
  getCover: (requestId: string) => string | null
}

export const useCoverByRequestStore = create<CoverState>()(
  persist(
    (set, get) => ({
      overrides: {},
      setCover: (requestId, evidenceId) =>
        set((s) => ({
          overrides: { ...s.overrides, [requestId]: evidenceId },
        })),
      clearCover: (requestId) =>
        set((s) => {
          const next = { ...s.overrides }
          delete next[requestId]
          return { overrides: next }
        }),
      getCover: (requestId) => get().overrides[requestId] ?? null,
    }),
    { name: 'ancestral-seed-cover-by-request-v1' },
  ),
)
