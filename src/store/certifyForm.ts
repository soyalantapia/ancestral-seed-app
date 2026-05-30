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
  communityActivityOther: string
  hasKinship: 'si' | 'no' | ''
  communityName: string
  territoryName: string
  inspirationCommunity: string

  // Step 3 — Producto, servicio o práctica
  productName: string
  productType: string
  productSector: string
  productSectorOther: string
  productSubcategory: string
  productSubcategoryOther: string

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

// Todos los campos arrancan definidos (string → '', array → [], enum →
// '', bool → false). Si un campo string quedara `undefined`, Zod haría
// el chequeo de tipo antes del `.min()` y mostraría "expected string,
// received undefined" en vez del mensaje amigable del `.min()`.
const initial: CertifyFormData = {
  // Step 1 — Identidad
  applicantName: '',
  documentType: '',
  documentNumber: '',
  email: '',
  phonePrefix: '+54',
  phoneNumber: '',
  country: '',
  region: '',
  department: '',
  address: '',

  // Step 2 — Comunidad
  communityRole: '',
  communityRoleOther: '',
  communityActivity: '',
  communityActivityOther: '',
  hasKinship: '',
  communityName: '',
  territoryName: '',
  inspirationCommunity: '',

  // Step 3 — Producto
  productName: '',
  productType: '',
  productSector: '',
  productSectorOther: '',
  productSubcategory: '',
  productSubcategoryOther: '',

  // Step 4 — Proceso
  processDescription: '',
  producerType: '',
  productionCapacity: '',
  batchType: '',
  batchIdentifiers: [],

  // Step 5 — Evidencias
  coverImageName: '',
  galleryNames: [],
  videoUrl: '',
  references: '',

  // Step 6 — Privacidad
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
    {
      name: 'ancestral-seed-certify-form-v2',
      // Borradores viejos pueden no tener todas las claves string; sin
      // este merge llegarían como `undefined` y Zod mostraría el error
      // de tipo en vez del mensaje amigable. Rellenamos sobre `initial`.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<CertifyFormState>
        return {
          ...current,
          step: p.step ?? current.step,
          data: { ...initial, ...(p.data ?? {}) },
        }
      },
    },
  ),
)
