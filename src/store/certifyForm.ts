import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CertifyFormData {
  // Step 1 — Identidad del solicitante
  applicantName: string
  documentType: string
  documentNumber: string
  email: string
  phonePrefix: string
  phoneNumber: string
  country: string
  region: string
  department: string
  address: string

  // Step 2 — Comunidad
  communityRole: string
  communityRoleOther: string
  communityActivity: string
  hasKinship: 'si' | 'no' | ''
  communityName: string
  territoryName: string
  inspirationCommunity: string

  // Step 3 — Producto, servicio o práctica
  productName: string
  productType: string
  productSector: string
  productSubcategory: string

  // Step 4 — Proceso de producción o prestación
  processDescription: string
  producerType: string
  productionCapacity: string
  batchType: 'lotes' | 'partidas' | ''
  batchIdentifiers: string[]

  // Step 5 — Evidencias
  coverImageName: string
  galleryNames: string[]
  videoUrl: string
  references: string

  // Step 6 — Privacidad
  acceptTerms: boolean
  acceptDataPolicy: boolean
  acceptPublic: boolean
}

interface CertifyFormState {
  data: Partial<CertifyFormData>
  step: number
  setStep: (step: number) => void
  updateData: (patch: Partial<CertifyFormData>) => void
  reset: () => void
}

const initial: Partial<CertifyFormData> = {
  documentType: '',
  phonePrefix: '+54',
  hasKinship: '',
  batchType: '',
  batchIdentifiers: [],
  galleryNames: [],
  acceptTerms: false,
  acceptDataPolicy: false,
  acceptPublic: false,
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
    { name: 'ancestral-seed-certify-form-v2' },
  ),
)
