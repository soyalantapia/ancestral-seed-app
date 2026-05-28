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
  /**
   * Fix V3-POS-04 (auditoría v3): si una imagen marcada como portada
   * se elimina, hay que limpiar el override del store — sino queda
   * apuntando a un id huérfano y el badge "★ Portada" desaparece de
   * todas las imágenes. Esta función centraliza ese caso: si el
   * evidenceId que se elimina era el override actual, lo limpia.
   */
  clearIfCover: (requestId: string, evidenceId: string) => void
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
      clearIfCover: (requestId, evidenceId) =>
        set((s) => {
          if (s.overrides[requestId] !== evidenceId) return s
          const next = { ...s.overrides }
          delete next[requestId]
          return { overrides: next }
        }),
    }),
    { name: 'ancestral-seed-cover-by-request-v1' },
  ),
)
