import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CertifyFormData {
  // Step 1 — Producto
  title: string
  type: 'producto' | 'servicio' | ''
  category: string
  shortDescription: string
  // Step 2 — Origen
  country: string
  region: string
  community: string
  exactLocation: string
  // Step 3 — Materia y proceso
  materials: string
  technique: string
  processDescription: string
  generations: string
  // Step 4 — Documentación
  coverImageName: string
  galleryNames: string[]
  videoUrl: string
  references: string
  // Step 5 — Contacto
  applicantName: string
  email: string
  phone: string
  acceptTerms: boolean
}

interface CertifyFormState {
  data: Partial<CertifyFormData>
  step: number
  setStep: (step: number) => void
  updateData: (patch: Partial<CertifyFormData>) => void
  reset: () => void
}

const initial: Partial<CertifyFormData> = {
  type: '',
  galleryNames: [],
  acceptTerms: false,
}

export const useCertifyFormStore = create<CertifyFormState>()(
  persist(
    (set) => ({
      data: initial,
      step: 0,
      setStep: (step) => set({ step }),
      updateData: (patch) =>
        set((s) => ({ data: { ...s.data, ...patch } })),
      reset: () => set({ data: initial, step: 0 }),
    }),
    { name: 'ancestral-seed-certify-form' },
  ),
)
