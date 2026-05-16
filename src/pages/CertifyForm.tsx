import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Headphones,
  Image as ImageIcon,
  Play,
  Upload,
  X,
} from 'lucide-react'
import { useForm, FormProvider, useFormContext } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/features/Logo'
import { useCertifyFormStore, type CertifyFormData } from '@/store/certifyForm'
import { useAuthStore } from '@/store/auth'
import { cn } from '@/lib/utils'

// Per-step zod schemas
const stepSchemas = [
  // Step 1 — Identidad
  z.object({
    applicantName: z.string().min(2, 'Tu nombre completo'),
    documentType: z.enum(['DNI', 'Pasaporte', 'CUIT'], { message: 'Elegí un tipo' }),
    documentNumber: z.string().min(5, 'Documento inválido'),
    email: z.string().email('Email inválido'),
    phonePrefix: z.string().min(1, 'Prefijo'),
    phoneNumber: z.string().min(6, 'Teléfono inválido'),
    country: z.string().min(2, 'Seleccioná un país'),
    region: z.string().min(2, 'Seleccioná una región'),
    department: z.string().min(2, 'Seleccioná departamento o provincia'),
    address: z.string().min(3, 'Indicá una dirección'),
  }),
  // Step 2 — Comunidad
  z.object({
    communityRole: z.string().min(2, 'Seleccioná un rol'),
    communityActivity: z.string().min(2, 'Seleccioná una actividad'),
    hasKinship: z.enum(['si', 'no'], { message: 'Elegí una opción' }),
    communityName: z.string().min(2, 'Indicá el nombre'),
    territoryName: z.string().optional().or(z.literal('')),
    inspirationCommunity: z.string().min(2, 'Indicá comunidad o región'),
  }),
  // Step 3 — Producto
  z.object({
    productName: z.string().min(3, 'Mínimo 3 caracteres'),
    productType: z.string().min(2, 'Seleccioná un tipo'),
    productSector: z.string().min(2, 'Seleccioná un sector'),
    productSubcategory: z.string().min(2, 'Seleccioná una subcategoría'),
  }),
  // Step 4 — Proceso
  z.object({
    processDescription: z.string().min(20, 'Mínimo 20 caracteres').max(400, 'Máximo 400'),
    producerType: z.string().min(2, 'Seleccioná'),
    productionCapacity: z.string().min(2, 'Indicá la capacidad'),
    batchType: z.enum(['lotes', 'partidas'], { message: 'Elegí una opción' }),
    batchIdentifiers: z.array(z.string()).min(1, 'Seleccioná al menos uno'),
  }),
  // Step 5 — Evidencias
  z.object({
    coverImageName: z.string().min(1, 'Subí al menos una foto'),
    galleryNames: z.array(z.string()).optional(),
    videoUrl: z.string().optional().or(z.literal('')),
    references: z.string().optional().or(z.literal('')),
  }),
  // Step 6 — Privacidad
  z.object({
    acceptTerms: z.literal(true, { message: 'Aceptá los términos' }),
    acceptDataPolicy: z.literal(true, { message: 'Aceptá las políticas de datos' }),
    acceptPublic: z.boolean().optional(),
  }),
  // Step 7 — Revisión (no validation, just review)
  z.object({}),
]

const steps = [
  { id: 'identidad', title: 'Identidad' },
  { id: 'comunidad', title: 'Comunidad' },
  { id: 'producto', title: 'Producto' },
  { id: 'proceso', title: 'Proceso' },
  { id: 'evidencias', title: 'Evidencias' },
  { id: 'privacidad', title: 'Privacidad' },
  { id: 'revisión', title: 'Revisión' },
]

const benefits = [
  'Mayor legitimidad y respaldo',
  'Origen y trazabilidad segura',
  'Más oportunidades de venta',
  'Visibilidad en el directorio',
]

export default function CertifyForm() {
  const navigate = useNavigate()
  const { data, step, setStep, updateData, reset } = useCertifyFormStore()
  const setSession = useAuthStore((s) => s.setSession)
  const [submitted, setSubmitted] = useState(false)
  const [postponeOpen, setPostponeOpen] = useState(false)

  const schema = stepSchemas[step]
  const methods = useForm<Partial<CertifyFormData>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any) as any,
    defaultValues: data,
    mode: 'onChange',
  })

  // Sync store → form when step changes
  useEffect(() => {
    methods.reset({ ...data })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  const onNext = methods.handleSubmit((values) => {
    updateData(values)
    if (step < steps.length - 1) {
      setStep(step + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      onSubmitFinal({ ...data, ...values } as CertifyFormData)
    }
  })

  const onBack = () => {
    if (step > 0) {
      updateData(methods.getValues())
      setStep(step - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const onSubmitFinal = async (final: CertifyFormData) => {
    toast.success('Solicitud enviada · Recibirás novedades en tu email')
    setSubmitted(true)
    updateData(final)
    // Auto-login del solicitante con los datos del form para que pueda
    // entrar al área de seguimiento.
    setSession(
      {
        id: 'u-001',
        email: final.email ?? 'usuario@email.com',
        name: final.applicantName ?? 'Solicitante',
        avatarUrl: 'https://i.pravatar.cc/300?img=47',
        authorSlug: 'camila-montes',
      },
      'demo-token',
    )
  }

  if (submitted) {
    return (
      <SuccessState
        onGoDashboard={() => {
          reset()
          setSubmitted(false)
          navigate('/inicio')
        }}
        onReset={() => {
          reset()
          setSubmitted(false)
          navigate('/')
        }}
      />
    )
  }

  return (
    <div className="bg-white">
      {/* Top pattern strip */}
      <div className="bg-pattern-strip h-12 md:h-16" aria-hidden />

      {/* Floating header card */}
      <section className="relative bg-white">
        <div className="mx-auto -mt-6 max-w-[1100px] px-4 md:-mt-10 md:px-8">
          <div className="relative rounded-2xl bg-white px-6 py-8 text-center shadow-md md:px-12 md:py-10">
            <button
              type="button"
              onClick={() => setPostponeOpen(true)}
              className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-[11px] font-bold text-navy-400 transition-colors hover:bg-neutral-100 hover:text-navy-500 md:right-6 md:top-6 md:text-xs"
            >
              <Clock className="h-3.5 w-3.5" />
              Postergar
            </button>
            <h1 className="text-2xl font-bold text-navy-500 md:text-[34px] md:leading-tight">
              Formulario de Certificación Ancestral
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-navy-300 md:text-base">
              Ingresá la información solicitada para certificar la autenticidad
              ancestral de tu trabajo
            </p>
          </div>
        </div>

        {/* Benefits bar */}
        <div className="mx-auto mt-7 max-w-[1320px] px-4 md:mt-8 md:px-8">
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-navy-500 md:gap-x-6 md:text-sm">
            {benefits.map((b) => (
              <li key={b} className="inline-flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500"
                  aria-hidden
                />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Stepper */}
      <section className="bg-white pt-10 md:pt-12">
        <div className="mx-auto max-w-[1100px] px-4 md:px-8">
          <Stepper current={step} />
        </div>
      </section>

      {/* Postpone modal */}
      <PostponeModal
        open={postponeOpen}
        onClose={() => setPostponeOpen(false)}
        onConfirm={() => {
          setPostponeOpen(false)
          toast.success('Guardamos tus avances. Podés continuar más adelante.')
          navigate('/')
        }}
      />

      {/* Form + video panel */}
      <section className="bg-white pb-16 md:pb-24">
        <div className="mx-auto max-w-[1100px] px-4 md:px-8">
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
            {/* LEFT: form card */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-10">
                <FormProvider {...methods}>
                  <form onSubmit={onNext}>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        {step === 0 && <StepIdentidad />}
                        {step === 1 && <StepComunidad />}
                        {step === 2 && <StepProducto />}
                        {step === 3 && <StepProceso />}
                        {step === 4 && <StepEvidencias />}
                        {step === 5 && <StepPrivacidad />}
                        {step === 6 && <StepRevision data={data} />}
                      </motion.div>
                    </AnimatePresence>

                    <div className="mt-8 flex items-center justify-between gap-3">
                      {step > 0 ? (
                        <button
                          type="button"
                          onClick={onBack}
                          className="inline-flex items-center gap-2 rounded-full bg-navy-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-navy-400"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Volver
                        </button>
                      ) : (
                        <span />
                      )}
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-full bg-navy-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-navy-400"
                      >
                        {step === steps.length - 1 ? 'Enviar solicitud' : 'Continuar'}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </form>
                </FormProvider>
              </div>
            </div>

            {/* RIGHT: video panel + help button */}
            <div className="lg:col-span-5">
              <div className="space-y-4 lg:sticky lg:top-6">
                <VideoPanel />
                <div className="flex justify-center lg:justify-end">
                  <a
                    href="mailto:soporte@ancestralseed.org?subject=Necesito%20ayuda%20con%20el%20formulario%20de%20certificación"
                    className="inline-flex items-center gap-2 rounded-full bg-navy-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-navy-400"
                  >
                    Necesito ayuda
                    <Headphones className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function VideoPanel() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gold-300 shadow-md">
      <div
        className="relative aspect-[16/10] w-full bg-cover bg-center md:aspect-[4/5]"
        style={{ backgroundImage: `url('${import.meta.env.BASE_URL}hero-image.webp')` }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            type="button"
            className="flex h-16 w-16 items-center justify-center rounded-full bg-white/30 backdrop-blur-md ring-1 ring-white/40 transition-all hover:scale-105 hover:bg-white/40"
            aria-label="Reproducir video"
          >
            <Play className="h-7 w-7 translate-x-0.5 text-white" fill="white" />
          </button>
        </div>
      </div>
    </div>
  )
}

function Stepper({ current }: { current: number }) {
  const progressPct = ((current + 1) / steps.length) * 100
  const currentLabel = steps[current]?.title ?? ''
  const nextLabel = steps[current + 1]?.title
  return (
    <div>
      {/* MOBILE: compact "Paso N de 7" + label */}
      <div className="md:hidden">
        <div className="flex items-baseline justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-gold-700">
            Paso {current + 1} de {steps.length}
          </p>
          <p className="text-xs text-navy-300">
            {nextLabel ? `Sigue: ${nextLabel}` : 'Último paso'}
          </p>
        </div>
        <p className="mt-1 text-base font-bold text-navy-500">{currentLabel}</p>
        {/* dot indicator row */}
        <ol className="mt-3 flex items-center gap-1.5" aria-hidden>
          {steps.map((s, i) => {
            const active = i === current
            const done = i < current
            return (
              <li
                key={s.id}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-colors',
                  done && 'bg-navy-500',
                  active && 'bg-gold-500',
                  !done && !active && 'bg-neutral-200',
                )}
              />
            )
          })}
        </ol>
      </div>

      {/* DESKTOP: full stepper */}
      <ol className="hidden flex-wrap items-center gap-x-3 gap-y-2 text-sm md:flex">
        {steps.map((s, i) => {
          const active = i === current
          const done = i < current
          const reached = done || active
          return (
            <li key={s.id} className="flex items-center gap-2">
              <span
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors',
                  done && 'bg-navy-500 text-white',
                  active && 'border-2 border-navy-500 bg-white',
                  !reached && 'border-2 border-neutral-300 bg-white',
                )}
              >
                {done ? (
                  <Check className="h-3 w-3" strokeWidth={3} />
                ) : active ? (
                  <span className="h-2 w-2 rounded-full bg-navy-500" />
                ) : null}
              </span>
              <span
                className={cn(
                  'font-semibold',
                  reached ? 'text-navy-500' : 'text-navy-300',
                )}
              >
                {s.title}
              </span>
              {i < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 text-navy-300" />
              )}
            </li>
          )
        })}
      </ol>
      <div className="mt-3 hidden h-[3px] w-full rounded-full bg-neutral-200 md:block">
        <div
          className="h-full rounded-full bg-navy-500 transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  )
}

function StepHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-navy-500 md:text-xl">{title}</h2>
      <p className="mt-1 text-sm text-navy-300">{description}</p>
    </div>
  )
}

function FieldError({ name }: { name: string }) {
  const {
    formState: { errors },
  } = useFormContext()
  const err = (errors as Record<string, { message?: string } | undefined>)[name]
  if (!err?.message) return null
  return <p className="mt-1 text-xs font-medium text-error-400">{err.message}</p>
}

function FieldRow({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>
}

function Select({
  id,
  options,
  placeholder = 'Seleccionar',
  registration,
}: {
  id: string
  options: string[]
  placeholder?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registration: any
}) {
  return (
    <select
      id={id}
      className="mt-2 h-11 w-full appearance-none rounded-lg border border-neutral-300 bg-white bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23334060%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><polyline points=%226 9 12 15 18 9%22/></svg>')] bg-[length:12px_12px] bg-[position:right_14px_center] bg-no-repeat px-3 pr-10 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
      {...registration}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — IDENTIDAD
// ─────────────────────────────────────────────────────────────────────────────

function StepIdentidad() {
  const { register } = useFormContext<Partial<CertifyFormData>>()
  return (
    <div>
      <StepHeader
        title="Identidad del solicitante"
        description="Completá tus datos personales para iniciar la certificación."
      />
      <div className="space-y-5">
        <FieldRow>
          <div>
            <Label htmlFor="applicantName">Nombre y apellido</Label>
            <Input
              id="applicantName"
              placeholder="Ej.: Pedro Fernandez"
              className="mt-2"
              {...register('applicantName')}
            />
            <FieldError name="applicantName" />
          </div>
          <div>
            <Label>Documento</Label>
            <div className="mt-2 flex gap-2">
              <select
                className="h-11 w-24 appearance-none rounded-lg border border-neutral-300 bg-white bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23334060%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><polyline points=%226 9 12 15 18 9%22/></svg>')] bg-[length:12px_12px] bg-[position:right_10px_center] bg-no-repeat px-3 pr-8 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
                {...register('documentType')}
              >
                <option value="">DNI</option>
                <option value="DNI">DNI</option>
                <option value="Pasaporte">Pas.</option>
                <option value="CUIT">CUIT</option>
              </select>
              <Input
                placeholder="99.999.999"
                className="flex-1"
                {...register('documentNumber')}
              />
            </div>
            <FieldError name="documentNumber" />
          </div>
        </FieldRow>

        <FieldRow>
          <div>
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="ejemplo.email@gmail.com"
              className="mt-2"
              {...register('email')}
            />
            <FieldError name="email" />
          </div>
          <div>
            <Label>Teléfono</Label>
            <div className="mt-2 flex gap-2">
              <Input
                className="w-16"
                placeholder="+1"
                {...register('phonePrefix')}
              />
              <Input
                className="flex-1"
                placeholder="1234 5678"
                {...register('phoneNumber')}
              />
            </div>
            <FieldError name="phoneNumber" />
          </div>
        </FieldRow>

        <FieldRow>
          <div>
            <Label htmlFor="country">País</Label>
            <Select
              id="country"
              options={['Argentina', 'Colombia', 'Perú', 'México', 'Bolivia', 'Ecuador', 'Chile']}
              registration={register('country')}
            />
            <FieldError name="country" />
          </div>
          <div>
            <Label htmlFor="region">Región/Territorio</Label>
            <Select
              id="region"
              options={['Norte', 'Centro', 'Sur', 'Litoral', 'Patagonia', 'Cuyo', 'NOA', 'NEA']}
              registration={register('region')}
            />
            <FieldError name="region" />
          </div>
        </FieldRow>

        <FieldRow>
          <div>
            <Label htmlFor="department">Departmento/Provincia</Label>
            <Select
              id="department"
              options={['Jujuy', 'Salta', 'Tucumán', 'Catamarca', 'La Rioja', 'Otro']}
              registration={register('department')}
            />
            <FieldError name="department" />
          </div>
          <div>
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              placeholder=""
              className="mt-2"
              {...register('address')}
            />
            <FieldError name="address" />
          </div>
        </FieldRow>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — COMUNIDAD
// ─────────────────────────────────────────────────────────────────────────────

function StepComunidad() {
  const { register, watch, setValue } = useFormContext<Partial<CertifyFormData>>()
  const has = watch('hasKinship')
  return (
    <div>
      <StepHeader
        title="Comunidad"
        description="Ingresá la información de tu comunidad y funciones dentro de la misma."
      />
      <div className="space-y-5">
        <FieldRow>
          <div>
            <Label htmlFor="communityRole">¿Qué rol cumple?</Label>
            <Select
              id="communityRole"
              options={['Artesano/a', 'Productor/a', 'Líder comunitario', 'Curador/a', 'Intermediario/a', 'Otro']}
              registration={register('communityRole')}
            />
            <FieldError name="communityRole" />
          </div>
          <div>
            <Label htmlFor="communityActivity">¿Cuál actividad realiza?</Label>
            <Select
              id="communityActivity"
              options={['Tejido', 'Orfebrería', 'Cerámica', 'Cocina ancestral', 'Medicina', 'Agricultura', 'Otro']}
              registration={register('communityActivity')}
            />
            <FieldError name="communityActivity" />
          </div>
        </FieldRow>

        <div>
          <p className="text-sm font-bold text-navy-500">
            ¿Tiene alguna relación de parentesco, consanguinidad o afinidad con
            alguna comunidad?
          </p>
          <div className="mt-3 flex gap-6">
            {(['si', 'no'] as const).map((v) => (
              <label
                key={v}
                className="flex cursor-pointer items-center gap-2 text-sm text-navy-500"
              >
                <input
                  type="radio"
                  name="hasKinship"
                  checked={has === v}
                  onChange={() => setValue('hasKinship', v, { shouldValidate: true })}
                  className="h-4 w-4 accent-gold-500"
                />
                <span className="capitalize">{v}</span>
              </label>
            ))}
          </div>
          <FieldError name="hasKinship" />
        </div>

        <div>
          <Label htmlFor="communityName">
            ¿Cuál es el nombre de la comunidad, organización o colectivo al que
            pertenece el producto, servicio o práctica?
          </Label>
          <Input
            id="communityName"
            className="mt-2"
            {...register('communityName')}
          />
          <FieldError name="communityName" />
        </div>

        <div>
          <Label htmlFor="territoryName">
            ¿Existe un nombre propio para su territorio o comunidad, además del
            nombre oficial?
          </Label>
          <Input
            id="territoryName"
            className="mt-2"
            {...register('territoryName')}
          />
        </div>

        <div>
          <Label htmlFor="inspirationCommunity">
            ¿En qué comunidad, etnia o región se inspira el producto?
          </Label>
          <Input
            id="inspirationCommunity"
            className="mt-2"
            {...register('inspirationCommunity')}
          />
          <FieldError name="inspirationCommunity" />
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3 — PRODUCTO
// ─────────────────────────────────────────────────────────────────────────────

function StepProducto() {
  const { register } = useFormContext<Partial<CertifyFormData>>()
  return (
    <div>
      <StepHeader
        title="Producto, servicio o práctica"
        description="Definí el nombre, tipo, categoría y especialización de tu producto, servicio o práctica"
      />
      <div className="space-y-5">
        <div>
          <Label htmlFor="productName">Nombre de tu producto, servicio o práctica</Label>
          <Input
            id="productName"
            className="mt-2"
            {...register('productName')}
          />
          <FieldError name="productName" />
        </div>

        <FieldRow>
          <div>
            <Label htmlFor="productType">Tipo de producto y/o servicio</Label>
            <Select
              id="productType"
              options={['Producto físico', 'Servicio', 'Producto + Servicio', 'Práctica cultural']}
              registration={register('productType')}
            />
            <FieldError name="productType" />
          </div>
          <div>
            <Label htmlFor="productSector">Sector al que pertenece</Label>
            <Select
              id="productSector"
              options={['Joyería y orfebrería', 'Tejidos y textiles', 'Cocina ancestral', 'Productos agroecológicos', 'Turismo cultural', 'Medicina ancestral', 'Cerámica y alfarería', 'Otro']}
              registration={register('productSector')}
            />
            <FieldError name="productSector" />
          </div>
        </FieldRow>

        <div className="max-w-[calc(50%-0.5rem)]">
          <Label htmlFor="productSubcategory">Subcategoría</Label>
          <Select
            id="productSubcategory"
            options={['Filigrana', 'Tejido en telar', 'Bordado', 'Cestería', 'Hilado', 'Cerámica negra', 'Otro']}
            registration={register('productSubcategory')}
          />
          <FieldError name="productSubcategory" />
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 4 — PROCESO
// ─────────────────────────────────────────────────────────────────────────────

function StepProceso() {
  const { register, watch, setValue } = useFormContext<Partial<CertifyFormData>>()
  const description = watch('processDescription') ?? ''
  const batchType = watch('batchType')
  const identifiers = (watch('batchIdentifiers') as string[]) ?? []

  const toggleIdentifier = (val: string) => {
    if (identifiers.includes(val)) {
      setValue(
        'batchIdentifiers',
        identifiers.filter((v) => v !== val),
        { shouldValidate: true },
      )
    } else {
      setValue('batchIdentifiers', [...identifiers, val], { shouldValidate: true })
    }
  }

  return (
    <div>
      <StepHeader
        title="Proceso de producción o prestación"
        description="Describe cómo se realiza el producto o servicio, quién participa en su elaboración y cómo se organiza su producción o prestación."
      />
      <div className="space-y-5">
        <div>
          <Label htmlFor="processDescription">
            ¿Podría describir brevemente en qué consiste este producto, servicio
            o práctica y cuál es su función?
          </Label>
          <div className="relative">
            <textarea
              id="processDescription"
              rows={6}
              maxLength={400}
              placeholder="Descripción"
              className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-navy-500 placeholder:text-neutral-600 focus:border-gold-500 focus:outline-none"
              {...register('processDescription')}
            />
            <span className="absolute bottom-2 right-3 text-xs text-navy-300">
              {description.length}/400
            </span>
          </div>
          <FieldError name="processDescription" />
        </div>

        <div>
          <Label htmlFor="producerType">¿Quién realiza principalmente la producción o prestación?</Label>
          <Select
            id="producerType"
            options={['Yo mismo/a', 'Mi familia', 'Mi comunidad', 'Colectivo / cooperativa', 'Tercerizado']}
            registration={register('producerType')}
          />
          <FieldError name="producerType" />
        </div>

        <div>
          <Label htmlFor="productionCapacity">
            ¿Cómo es la capacidad de producción y/o prestación del servicio?
          </Label>
          <Input
            id="productionCapacity"
            className="mt-2"
            {...register('productionCapacity')}
          />
          <p className="mt-1 text-xs text-navy-300">
            Por ejemplo: Pequeña escala, mediana, solo por encargo, uso interno, venta externa, etc.
          </p>
          <FieldError name="productionCapacity" />
        </div>

        <div>
          <p className="text-sm font-bold text-navy-500">
            Cuando producen o prestan el servicio, ¿lo hacen en lotes o en
            partidas identificables?
          </p>
          <div className="mt-3 space-y-2">
            {(
              [
                { id: 'lotes', label: 'Lotes' },
                { id: 'partidas', label: 'Partidas identificables (fecha, nombre, lugar, etc)' },
              ] as const
            ).map((opt) => (
              <label key={opt.id} className="flex cursor-pointer items-center gap-2 text-sm text-navy-500">
                <input
                  type="radio"
                  name="batchType"
                  checked={batchType === opt.id}
                  onChange={() => setValue('batchType', opt.id, { shouldValidate: true })}
                  className="h-4 w-4 accent-gold-500"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
          <FieldError name="batchType" />
        </div>

        <div>
          <p className="text-sm font-bold text-navy-500">¿Cómo identifican esos lotes o partidas?</p>
          <div className="mt-3 grid grid-cols-1 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            {['Por fecha', 'Por lugar/territorio', 'Por grupo de personas', 'Por nombre', 'Por número/código', 'Otro'].map((v) => (
              <label key={v} className="flex cursor-pointer items-center gap-2 text-sm text-navy-500">
                <input
                  type="checkbox"
                  checked={identifiers.includes(v)}
                  onChange={() => toggleIdentifier(v)}
                  className="h-4 w-4 accent-gold-500"
                />
                <span>{v}</span>
              </label>
            ))}
          </div>
          <FieldError name="batchIdentifiers" />
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 5 — EVIDENCIAS
// ─────────────────────────────────────────────────────────────────────────────

function StepEvidencias() {
  const { setValue, watch } = useFormContext<Partial<CertifyFormData>>()
  const gallery = (watch('galleryNames') as string[]) ?? []
  const cover = watch('coverImageName')
  const docs = (watch('references') as string) ?? ''

  const addPhoto = (name: string) => {
    setValue('galleryNames', [...gallery, name].slice(0, 12))
    if (!cover) setValue('coverImageName', name, { shouldValidate: true })
  }
  const removePhoto = (i: number) => {
    const next = gallery.filter((_, idx) => idx !== i)
    setValue('galleryNames', next)
    if (cover && i === gallery.indexOf(cover)) {
      setValue('coverImageName', next[0] ?? '', { shouldValidate: true })
    }
  }

  return (
    <div>
      <StepHeader
        title="Evidencias"
        description="Subí fotos, videos y documentos que respalden tu producto."
      />
      <div className="space-y-7">
        <EvidenceSection
          title="Fotos del producto o proceso"
          hint="Subí o tomá fotos claras, activá la fecha y hora. (Mínimo 3 fotos)"
        >
          <UploadPill
            icon={Upload}
            label="Subir imágen"
            accept="image/*"
            multiple
            onPick={(names) => names.forEach(addPhoto)}
          />
          <UploadPill
            icon={Camera}
            label="Tomar foto"
            accept="image/*"
            capture
            onPick={(names) => names.forEach(addPhoto)}
          />
        </EvidenceSection>

        {gallery.length > 0 && (
          <ul className="-mt-3 flex flex-wrap gap-2">
            {gallery.map((name, i) => (
              <li
                key={i}
                className="inline-flex items-center gap-2 rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold text-gold-700"
              >
                <ImageIcon className="h-3 w-3" />
                {name}
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="ml-1 text-gold-700/70 hover:text-error-400"
                  aria-label="Quitar"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        <FieldError name="coverImageName" />

        <EvidenceSection
          title="Video del producto o proceso"
          hint="Subí o grabá un video, activá la fecha y hora."
        >
          <UploadPill
            icon={Upload}
            label="Subir video"
            accept="video/*"
            onPick={(names) => setValue('videoUrl', names[0] ?? '')}
          />
          <UploadPill
            icon={Camera}
            label="Grabar video"
            accept="video/*"
            capture
            onPick={(names) => setValue('videoUrl', names[0] ?? '')}
          />
        </EvidenceSection>

        <EvidenceSection
          title="Documento/Aval/Acta"
          hint="Documento en formato pdf, png o jpg"
        >
          <UploadPill
            icon={Upload}
            label="Subir archivo"
            accept="application/pdf,image/*"
            onPick={(names) => setValue('references', (docs ? docs + ', ' : '') + names.join(', '))}
          />
        </EvidenceSection>
        {docs && (
          <p className="-mt-4 text-xs text-navy-300">
            Archivos: <span className="font-semibold text-navy-500">{docs}</span>
          </p>
        )}
      </div>
    </div>
  )
}

function EvidenceSection({
  title,
  hint,
  children,
}: {
  title: string
  hint: string
  children: ReactNode
}) {
  return (
    <div>
      <p className="text-sm font-bold text-navy-500">{title}</p>
      <p className="mt-1 text-xs text-navy-300 md:text-sm">{hint}</p>
      <div className="mt-3 flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function UploadPill({
  icon: Icon,
  label,
  accept,
  multiple = false,
  capture = false,
  onPick,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any
  label: string
  accept: string
  multiple?: boolean
  capture?: boolean
  onPick: (names: string[]) => void
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-neutral-200 px-4 py-2 text-xs font-semibold text-navy-300 transition-colors hover:bg-neutral-300 hover:text-navy-500 md:text-sm">
      <Icon className="h-4 w-4" />
      {label}
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        {...(capture ? { capture: 'environment' as const } : {})}
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? [])
          if (files.length) onPick(files.map((f) => f.name))
        }}
      />
    </label>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 6 — PRIVACIDAD
// ─────────────────────────────────────────────────────────────────────────────

function StepPrivacidad() {
  const { register } = useFormContext<Partial<CertifyFormData>>()
  return (
    <div>
      <StepHeader
        title="Privacidad"
        description="Definí qué información querés que sea pública y aceptá los términos."
      />
      <div className="space-y-4">
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-neutral-200 bg-gold-100/30 p-4 text-sm text-navy-500">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-neutral-400 text-gold-500 focus:ring-gold-500"
            {...register('acceptTerms')}
          />
          <span>
            Confirmo que la información provista es verídica y autorizo a
            Ancestral Seed a iniciar la auditoría correspondiente. Acepto los{' '}
            <Link to="/" className="font-semibold text-gold-700 hover:underline">
              términos y condiciones
            </Link>
            .
          </span>
        </label>
        <FieldError name="acceptTerms" />

        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-navy-500">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-neutral-400 text-gold-500 focus:ring-gold-500"
            {...register('acceptDataPolicy')}
          />
          <span>
            Acepto el tratamiento de mis datos personales conforme a la{' '}
            <Link to="/" className="font-semibold text-gold-700 hover:underline">
              política de privacidad
            </Link>
            .
          </span>
        </label>
        <FieldError name="acceptDataPolicy" />

        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-navy-500">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-neutral-400 text-gold-500 focus:ring-gold-500"
            {...register('acceptPublic')}
          />
          <span>
            Autorizo que mi ficha sea pública y aparezca en el directorio una
            vez certificada (opcional, podés cambiar esto luego).
          </span>
        </label>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 7 — REVISIÓN
// ─────────────────────────────────────────────────────────────────────────────

function StepRevision({ data }: { data: Partial<CertifyFormData> }) {
  const sections: Array<{ title: string; items: Array<[string, string | undefined]> }> = [
    {
      title: 'Identidad',
      items: [
        ['Nombre', data.applicantName],
        ['Documento', data.documentType && data.documentNumber ? `${data.documentType} ${data.documentNumber}` : undefined],
        ['Email', data.email],
        ['Teléfono', data.phoneNumber ? `${data.phonePrefix ?? ''} ${data.phoneNumber}` : undefined],
        ['Ubicación', [data.address, data.department, data.region, data.country].filter(Boolean).join(', ') || undefined],
      ],
    },
    {
      title: 'Comunidad',
      items: [
        ['Rol', data.communityRole],
        ['Actividad', data.communityActivity],
        ['Parentesco', data.hasKinship],
        ['Comunidad', data.communityName],
        ['Territorio propio', data.territoryName],
        ['Inspiración', data.inspirationCommunity],
      ],
    },
    {
      title: 'Producto',
      items: [
        ['Nombre', data.productName],
        ['Tipo', data.productType],
        ['Sector', data.productSector],
        ['Subcategoría', data.productSubcategory],
      ],
    },
    {
      title: 'Proceso',
      items: [
        ['Descripción', data.processDescription],
        ['Productor', data.producerType],
        ['Capacidad', data.productionCapacity],
        ['Identificación', data.batchType],
      ],
    },
  ]
  return (
    <div>
      <StepHeader
        title="Revisión"
        description="Revisá la información antes de enviarla. Podés volver a editar cualquier paso."
      />
      <div className="space-y-5">
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-2xl border border-neutral-200 bg-white p-5"
          >
            <p className="text-sm font-bold uppercase tracking-widest text-navy-300">
              {section.title}
            </p>
            <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm md:grid-cols-2">
              {section.items
                .filter(([, v]) => Boolean(v))
                .map(([k, v]) => (
                  <div key={k} className="flex flex-col">
                    <dt className="text-xs text-navy-300">{k}</dt>
                    <dd className="font-medium text-navy-500">{v}</dd>
                  </div>
                ))}
            </dl>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SUCCESS
// ─────────────────────────────────────────────────────────────────────────────

function SuccessState({
  onReset,
  onGoDashboard,
}: {
  onReset: () => void
  onGoDashboard: () => void
}) {
  return (
    <section className="bg-pattern-gold py-16 md:py-24">
      <div className="mx-auto max-w-2xl px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="rounded-3xl bg-white p-10 text-center shadow-xl md:p-12"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-400 text-white shadow-lg">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-navy-500 md:text-[32px] md:leading-tight">
            Solicitud recibida
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-navy-300 md:text-base">
            ¡Gracias por sumarte! Recibimos tu solicitud y nuestro equipo de
            curaduría va a revisarla. Te vamos a contactar en las próximas{' '}
            <strong>72 horas hábiles</strong> para coordinar los siguientes
            pasos de la auditoría.
          </p>
          <div className="mt-8 grid gap-3 rounded-2xl bg-gold-100/40 p-5 text-left text-sm">
            <p className="flex items-center gap-2 font-semibold text-navy-500">
              <Logo markClassName="h-6 w-6" showWordmark={false} />
              Próximos pasos
            </p>
            <ul className="flex flex-col gap-2 text-navy-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-700" />
                Te creamos tu panel de seguimiento donde vas a ver el avance.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-700" />
                Un curador te contacta para coordinar la auditoría.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-700" />
                Si aprobado, generamos el hash en blockchain y publicamos la
                ficha pública.
              </li>
            </ul>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onGoDashboard}
              className={cn(buttonVariants({ variant: 'gold', size: 'lg' }))}
            >
              Ir a mi panel
            </button>
            <button
              type="button"
              onClick={onReset}
              className={cn(buttonVariants({ variant: 'ghost', size: 'lg' }))}
            >
              Volver al inicio
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// POSTPONE MODAL
// ─────────────────────────────────────────────────────────────────────────────

function PostponeModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  // Close on Esc
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="absolute inset-0 bg-navy-500/50 backdrop-blur-[2px]"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="postpone-title"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            className="relative w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl md:p-10"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute right-4 top-4 rounded-full p-1.5 text-navy-300 transition-colors hover:bg-neutral-100 hover:text-navy-500"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-100 text-success-300 ring-4 ring-success-100/60">
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <h2
              id="postpone-title"
              className="mt-5 text-xl font-bold text-navy-500 md:text-2xl"
            >
              ¿Postergar tu solicitud?
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-navy-300">
              Guardamos tus avances de forma segura. Podés retomar la
              certificación más adelante desde tu panel.
            </p>

            <div className="mt-7 flex flex-col gap-2">
              <button
                type="button"
                onClick={onConfirm}
                className="inline-flex h-11 items-center justify-center rounded-full bg-navy-500 px-6 text-sm font-bold text-white shadow-sm transition-colors hover:bg-navy-400"
              >
                Postergar y guardar
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-semibold text-navy-400 transition-colors hover:bg-neutral-100 hover:text-navy-500"
              >
                Seguir completando
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
