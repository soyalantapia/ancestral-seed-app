import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Fix V3-TUT-11 (auditoría v3): antes el state `signed` de
 * EvaluacionTab vivía en `useState` local. El tutor firmaba la
 * evaluación → botón pasaba a "Evaluación firmada" → cerraba la
 * pestaña o navegaba a otro caso → al volver, el botón aparecía
 * como "Aceptar y firmar evaluación IA" de nuevo. La promesa de
 * firma no se preservaba entre sesiones.
 *
 * Este store persiste la firma por caseId. La firma es un evento
 * inmutable en la lógica de negocio (Reglamento art. 4.5), así que
 * una vez firmada NUNCA debería "des-firmarse" en UI.
 *
 * Fix V4-TUT-02 (auditoría v4): antes existía un método `unsign()`
 * que era dead code (nadie lo invocaba) y cuya semántica
 * contradecía el comentario ("idempotente: setea false" pero el
 * cuerpo borraba la entrada). Eliminado. Para resetear el demo se
 * usa `clear()` que borra todas las firmas a la vez.
 *
 * Cuando llegue el backend, el state se hidrata desde
 * `GET /cases/:id` y `sign()` dispara `POST /cases/:id/sign`.
 */
interface CaseSignaturesState {
  /** Map de caseId → { signed: boolean, at?: ISO, by?: tutorId } */
  signatures: Record<
    string,
    {
      signed: boolean
      at?: string
      by?: string
      finalScore?: number
      category?: string
    }
  >
  isSigned: (caseId: string) => boolean
  getSignature: (caseId: string) => {
    signed: boolean
    at?: string
    by?: string
    finalScore?: number
    category?: string
  } | null
  sign: (input: {
    caseId: string
    tutorId: string
    finalScore: number
    category: string
  }) => void
  /** Limpia todas las firmas — para reset del demo. */
  clear: () => void
}

export const useCaseSignaturesStore = create<CaseSignaturesState>()(
  persist(
    (set, get) => ({
      signatures: {},
      isSigned: (caseId) => get().signatures[caseId]?.signed === true,
      getSignature: (caseId) => get().signatures[caseId] ?? null,
      sign: ({ caseId, tutorId, finalScore, category }) =>
        set((s) => ({
          signatures: {
            ...s.signatures,
            [caseId]: {
              signed: true,
              at: new Date().toISOString(),
              by: tutorId,
              finalScore,
              category,
            },
          },
        })),
      clear: () => set({ signatures: {} }),
    }),
    { name: 'ancestral-seed-case-signatures-v1' },
  ),
)
