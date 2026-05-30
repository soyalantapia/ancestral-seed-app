import { useEffect, useRef, useState, type ReactNode } from 'react'
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
  Save,
  Sparkles,
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
import { Combobox } from '@/components/ui/combobox'
import { LATAM_COUNTRIES, GENERIC_DOC_TYPES, getLatamCountry } from '@/data/latam'
import { Logo } from '@/components/features/Logo'
import { useCertifyFormStore, type CertifyFormData } from '@/store/certifyForm'
import { useAuthStore } from '@/store/auth'
import { useAutoStartTour } from '@/hooks/useAutoStartTour'
import { GuidedTour } from '@/components/features/GuidedTour'
import { cn } from '@/lib/utils'

// Per-step zod schemas
const stepSchemas = [
  // Step 1 — Identidad
  z.object({
    applicantName: z.string().min(2, 'Tu nombre completo'),
    email: z.string().email('Email inválido'),
    country: z.string().min(2, 'Seleccioná un país'),
    phonePrefix: z.string().min(1, 'Prefijo'),
    phoneNumber: z.string().min(6, 'Teléfono inválido'),
    department: z.string().min(2, 'Seleccioná departamento o provincia'),
    documentType: z.string().min(2, 'Elegí un tipo'),
    documentNumber: z.string().min(5, 'Documento inválido'),
    address: z.string().min(3, 'Indicá una dirección'),
    region: z.string().optional().or(z.literal('')),
  }),
  // Step 2 — Comunidad
  z
    .object({
      communityRole: z.string().min(2, 'Seleccioná un rol'),
      communityRoleOther: z.string().optional().or(z.literal('')),
      communityActivity: z.string().min(2, 'Seleccioná una actividad'),
      hasKinship: z.enum(['si', 'no'], { message: 'Elegí una opción' }),
      communityName: z.string().min(2, 'Indicá el nombre'),
      territoryName: z.string().optional().or(z.literal('')),
      inspirationCommunity: z.string().min(2, 'Indicá comunidad o región'),
    })
    .superRefine((val, ctx) => {
      // Si el rol es "Otro", la aclaración pasa a ser obligatoria.
      if (val.communityRole === 'Otro' && !(val.communityRoleOther ?? '').trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['communityRoleOther'],
          message: 'Aclará cuál es tu rol',
        })
      }
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
    /**
     * Fix QW-A6 (auditoría UX): el hint en pantalla decía "Mínimo 3
     * fotos" pero el schema solo exigía 1 — el postulante podía pasar
     * con 1 foto y bloquearse después en auditoría. Ahora coincide:
     * `galleryNames` (que incluye la cover) debe tener ≥ 3.
     */
    galleryNames: z
      .array(z.string())
      .min(3, 'Subí al menos 3 fotos del producto o proceso'),
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

/**
 * Detecta si el store de CertifyForm tiene datos significativos (no
 * solo los defaults iniciales). Si los hay y el user vuelve a entrar
 * al form sin haber finalizado o reseteado, mostramos el dialog
 * "¿Continuar o empezar nueva?".
 *
 * Significativo = al menos un campo identitario libre tiene contenido.
 * Los enums vacíos (documentType: '') o los arrays vacíos NO cuentan.
 */
function hasSignificantData(d: Partial<CertifyFormData>): boolean {
  return Boolean(
    d.applicantName?.trim() ||
      d.productName?.trim() ||
      d.communityName?.trim() ||
      d.communityActivity?.trim() ||
      d.processDescription?.trim() ||
      (d.galleryNames && d.galleryNames.length > 0) ||
      (d.batchIdentifiers && d.batchIdentifiers.length > 0),
  )
}

export default function CertifyForm() {
  const navigate = useNavigate()
  const { data, step, setStep, updateData, reset } = useCertifyFormStore()
  const setSession = useAuthStore((s) => s.setSession)
  const [submitted, setSubmitted] = useState(false)
  const [postponeOpen, setPostponeOpen] = useState(false)
  // Autosave UI: timestamp del último guardado para mostrar "Guardado 19:43"
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)

  /**
   * Fix SA3 (#POS-21, auditoría UX): el bug crítico era que entrar a
   * /certificar cargaba silenciosamente los datos de la postulación
   * anterior. El user podía enviar "Filigrana ancestral" como nombre
   * cuando quería postular otra cosa.
   *
   * Ahora si hay datos persistidos al montar, mostramos un dialog
   * obligatorio que pide elegir: "Continuar la postulación a medias"
   * o "Empezar de cero". El initializer lazy se evalúa una sola vez
   * al montar — navegar entre pasos no re-dispara el dialog.
   *
   * Una vez resuelto, el flag queda en false durante esta vida del
   * componente. Si el user sale y vuelve, se evalúa otra vez (que es
   * exactamente el comportamiento esperable).
   */
  const [showResumeDialog, setShowResumeDialog] = useState<boolean>(() =>
    hasSignificantData(data),
  )

  // Fix V2-POS-11 (auditoría v2): el tour guiado arrancaba 1.2s
  // después del mount sin saber si había un ResumeOrFreshDialog
  // arriba. Resultado: el spotlight aparecía DETRÁS del dialog y el
  // user no entendía qué pasaba. Ahora le pasamos `paused` = open
  // del dialog para que el tour espere a que se resuelva.
  useAutoStartTour('certifyForm', 1200, showResumeDialog)

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

  // Autosave: cada cambio del form persiste a zustand (debounced 500ms).
  // Esto evita perder progreso si el user refresca o cierra la pestaña
  // sin haber clickeado "Siguiente". Antes solo se guardaba en onNext.
  const autosaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    const subscription = methods.watch((values) => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current)
      }
      autosaveTimeoutRef.current = setTimeout(() => {
        updateData(values as Partial<CertifyFormData>)
        setLastSavedAt(new Date())
      }, 500)
    })
    return () => {
      subscription.unsubscribe()
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methods.watch, step])

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

  /**
   * Salto directo a un paso ya visitado. Persiste los valores actuales
   * antes de saltar (igual que onBack) para que no se pierdan datos
   * tipeados sin "Siguiente". Solo se permite saltar a pasos <= step
   * (el Stepper valida eso visualmente con `done`).
   */
  const onJumpTo = (target: number) => {
    if (target < 0 || target >= steps.length || target === step) return
    updateData(methods.getValues())
    setStep(target)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
            <div className="absolute right-4 top-4 flex items-center gap-2 md:right-6 md:top-6">
              {/* Badge de autosave — visible cuando ya guardamos al menos
                  una vez. Comunica al user que su progreso no se pierde
                  si refresca / cierra la pestaña. */}
              {lastSavedAt && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success-100 px-3 py-1.5 text-[11px] font-bold text-success-300 ring-1 ring-success-300/30 md:text-xs">
                  <Save className="h-3 w-3" />
                  Borrador guardado ·{' '}
                  {lastSavedAt.toLocaleTimeString('es-AR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
              <button
                type="button"
                onClick={() => setPostponeOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-[11px] font-bold text-navy-400 transition-colors hover:bg-neutral-100 hover:text-navy-500 md:text-xs"
              >
                <Clock className="h-3.5 w-3.5" />
                Postergar
              </button>
            </div>
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
          <Stepper current={step} onJumpTo={onJumpTo} />
        </div>
      </section>

      {/* Resume-or-fresh dialog (SA3 fix) — se muestra una sola vez al
          montar si hay datos persistidos. No bloquea: el user puede
          elegir continuar (mantiene store) o empezar nueva (reset()). */}
      <ResumeOrFreshDialog
        open={showResumeDialog}
        currentStep={step}
        productName={data.productName}
        applicantName={data.applicantName}
        onContinue={() => setShowResumeDialog(false)}
        onStartFresh={() => {
          reset()
          // El form reanuda en step 0 con defaults — el useEffect que
          // sincroniza store↔form lo maneja automáticamente.
          setShowResumeDialog(false)
          toast.success('Empezaste una postulación nueva')
        }}
      />

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
                        {step === 6 && (
                          <StepRevision data={data} onJumpTo={onJumpTo} />
                        )}
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

            {/* RIGHT: video panel (el botón de ayuda ahora flota
                abajo a la derecha, ver más abajo) */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-6">
                <VideoPanel />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Botón de ayuda flotante — fijo abajo a la derecha, siempre
          accesible sin importar el scroll del formulario. */}
      <a
        href="mailto:soporte@ancestralseed.org?subject=Necesito%20ayuda%20con%20el%20formulario%20de%20certificación"
        className="fixed right-5 bottom-5 z-40 inline-flex items-center gap-2 rounded-full bg-navy-500 px-5 py-3 text-sm font-semibold text-white shadow-xl ring-1 ring-white/10 transition-all hover:bg-navy-400 md:right-8 md:bottom-8"
      >
        Necesito ayuda
        <Headphones className="h-4 w-4" />
      </a>

      {/* Tour de 4 pasos al primer ingreso al form. Se monta acá para que
          el spotlight pueda apuntar a elementos del propio form. */}
      <GuidedTour />
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

/**
 * Stepper del CertifyForm.
 *
 * Fix SB2 (#POS-22): antes los pasos eran <span> y el postulante que
 * quería corregir un dato del paso 1 estando en el 5 tenía que hacer
 * Volver × 4. Ahora los pasos ya VISITADOS (done) son `<button>` con
 * onJumpTo — el current y los futuros no, para forzar el flujo
 * lineal (no se saltea sin validar).
 */
function Stepper({
  current,
  onJumpTo,
}: {
  current: number
  /** Salto solo permitido a pasos ya visitados. */
  onJumpTo?: (step: number) => void
}) {
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
        {/* Fix V2-POS-18 (auditoría v2): los 7 dots eran barras
            indistinguibles — el header "Paso N de 7" daba contexto del
            actual, pero al ver los dots no quedaba claro qué era cada
            uno. Ahora cada dot tiene aria-label descriptivo para SR.

            Fix V3-POS-10 (auditoría v3): el `title=` attribute solo se
            renderiza como tooltip con MOUSEOVER — en mobile/touch no
            hay hover, así que el title es código muerto. Lo dejamos
            SOLO en los dots clickeables (done && onJumpTo), donde el
            usuario desktop puede al menos verlo. Para los no-clickeables
            solo aria-label (útil al SR, sin promesa visual rota). */}
        <ol
          className="mt-3 flex items-center gap-1.5"
          aria-label={`Progreso del formulario: paso ${current + 1} de ${steps.length}`}
        >
          {steps.map((s, i) => {
            const active = i === current
            const done = i < current
            const label = `Paso ${i + 1} de ${steps.length}: ${s.title}${
              done ? ' (completado)' : active ? ' (actual)' : ' (próximo)'
            }`
            const className = cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              done && 'bg-navy-500',
              active && 'bg-gold-500',
              !done && !active && 'bg-neutral-200',
            )
            if (done && onJumpTo) {
              return (
                <li key={s.id} className="contents">
                  <button
                    type="button"
                    aria-label={`Volver al ${label}`}
                    title={s.title}
                    onClick={() => onJumpTo(i)}
                    className={cn(className, 'cursor-pointer hover:opacity-80')}
                  />
                </li>
              )
            }
            // No-clickeables (futuros) sin `title` — el SR sí tiene
            // aria-label y el visual queda más limpio en mobile.
            return (
              <li
                key={s.id}
                className={className}
                aria-label={label}
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
          const inner = (
            <>
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
            </>
          )
          // Pasos visitados (done) son clickeables; el current y los
          // futuros no — el current ya estás ahí, los futuros requieren
          // pasar la validación del paso actual.
          return (
            <li key={s.id} className="flex items-center gap-2">
              {done && onJumpTo ? (
                <button
                  type="button"
                  onClick={() => onJumpTo(i)}
                  aria-label={`Volver al paso ${i + 1}: ${s.title}`}
                  className="inline-flex items-center gap-2 rounded-full px-1 py-0.5 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                >
                  {inner}
                </button>
              ) : (
                <span className="inline-flex items-center gap-2 px-1 py-0.5">
                  {inner}
                </span>
              )}
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
  // `registration` viene de register('field'); usamos su .name para
  // manejar el valor vía watch/setValue y renderizar un Combobox
  // buscable (todo select del form tiene buscador + flechita).
  const name = registration.name
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<Partial<CertifyFormData>>()
  const value = (watch(name) as string) ?? ''
  const hasError = Boolean(
    (errors as Record<string, unknown>)[name as string],
  )
  return (
    <Combobox
      id={id}
      value={value}
      onChange={(v) =>
        setValue(name, v as never, { shouldValidate: true, shouldDirty: true })
      }
      options={options.map((o) => ({ value: o, label: o }))}
      placeholder={placeholder}
      invalid={hasError}
      className="mt-2"
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — IDENTIDAD
// ─────────────────────────────────────────────────────────────────────────────

function StepIdentidad() {
  const { register, watch, setValue } = useFormContext<Partial<CertifyFormData>>()

  const country = watch('country') ?? ''
  const phonePrefix = watch('phonePrefix') ?? ''
  const documentType = watch('documentType') ?? ''
  const department = watch('department') ?? ''
  const countryData = getLatamCountry(country)

  const countryOptions = LATAM_COUNTRIES.map((c) => ({
    value: c.name,
    label: c.name,
    icon: <span className="text-base leading-none">{c.flag}</span>,
    keywords: c.dialCode,
  }))
  const subLabel = countryData?.subdivisionLabel ?? 'Provincia / Departamento'
  const subOptions = (countryData?.subdivisions ?? []).map((s) => ({
    value: s,
    label: s,
  }))
  const docOptions = (countryData?.documentTypes ?? GENERIC_DOC_TYPES).map((d) => ({
    value: d,
    label: d,
  }))

  // Al elegir país: autocompleta el prefijo telefónico y resetea los
  // campos que dependen del país (subdivisión, documento) para que NO
  // queden valores de otro país.
  function onCountryChange(name: string) {
    const c = getLatamCountry(name)
    setValue('country', name, { shouldValidate: true, shouldDirty: true })
    if (c) setValue('phonePrefix', c.dialCode, { shouldValidate: true })
    setValue('department', '', { shouldValidate: false })
    setValue('documentType', '', { shouldValidate: false })
  }

  return (
    <div>
      <StepHeader
        title="Identidad del solicitante"
        description="Completá tus datos personales para iniciar la certificación."
      />
      <div className="space-y-5">
        {/* 1 — Nombre completo */}
        <div>
          <Label htmlFor="applicantName">Nombre completo</Label>
          <Input
            id="applicantName"
            placeholder="Ej.: Pedro Fernández"
            className="mt-2"
            {...register('applicantName')}
          />
          <FieldError name="applicantName" />
        </div>

        {/* 2 — Correo electrónico */}
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

        {/* 3 — País (con bandera) + 4 — Teléfono (prefijo según país) */}
        <FieldRow>
          <div>
            <Label htmlFor="country">País</Label>
            <Combobox
              id="country"
              value={country}
              onChange={onCountryChange}
              options={countryOptions}
              placeholder="Elegí tu país"
              searchPlaceholder="Buscar país…"
              className="mt-2"
            />
            <FieldError name="country" />
          </div>
          <div>
            <Label htmlFor="phoneNumber">Teléfono</Label>
            <div className="mt-2 flex gap-2">
              <span
                className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-lg border border-neutral-300 bg-neutral-100 px-3 text-sm text-navy-500"
                aria-label="Prefijo telefónico según el país"
                title="Se completa solo al elegir el país"
              >
                {countryData && (
                  <span className="text-base leading-none">{countryData.flag}</span>
                )}
                <span>{phonePrefix || '+—'}</span>
              </span>
              <Input
                id="phoneNumber"
                className="flex-1"
                placeholder="1234 5678"
                inputMode="tel"
                {...register('phoneNumber')}
              />
            </div>
            <FieldError name="phoneNumber" />
          </div>
        </FieldRow>

        {/* 5 — Subdivisión (label + opciones según país) + Dirección */}
        <FieldRow>
          <div>
            <Label htmlFor="department">{subLabel}</Label>
            <Combobox
              id="department"
              value={department}
              onChange={(v) =>
                setValue('department', v, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              options={subOptions}
              placeholder={
                countryData ? `Elegí ${subLabel.toLowerCase()}` : 'Elegí primero un país'
              }
              searchPlaceholder="Buscar…"
              disabled={!countryData}
              className="mt-2"
            />
            <FieldError name="department" />
          </div>
          <div>
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              placeholder="Calle, número, localidad"
              className="mt-2"
              {...register('address')}
            />
            <FieldError name="address" />
          </div>
        </FieldRow>

        {/* Documento (tipos según país) */}
        <FieldRow>
          <div>
            <Label htmlFor="documentType">Tipo de documento</Label>
            <Combobox
              id="documentType"
              value={documentType}
              onChange={(v) =>
                setValue('documentType', v, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              options={docOptions}
              placeholder="Elegí tipo"
              searchPlaceholder="Buscar…"
              className="mt-2"
            />
            <FieldError name="documentType" />
          </div>
          <div>
            <Label htmlFor="documentNumber">Número de documento</Label>
            <Input
              id="documentNumber"
              placeholder="99.999.999"
              className="mt-2"
              {...register('documentNumber')}
            />
            <FieldError name="documentNumber" />
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
  const role = watch('communityRole')
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
              options={['Artesano/a', 'Productor/a', 'Líder comunitario', 'Otro']}
              registration={register('communityRole')}
            />
            <FieldError name="communityRole" />
            {role === 'Otro' && (
              <div className="mt-2">
                <Input
                  id="communityRoleOther"
                  placeholder="Aclará cuál es tu rol"
                  aria-label="Aclará cuál es tu rol"
                  {...register('communityRoleOther')}
                />
                <FieldError name="communityRoleOther" />
              </div>
            )}
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

  /**
   * Fix SB3 (#POS-26, auditoría UX): antes solo aparecía un chip con
   * "foto.jpg". Ahora generamos thumbnails con URL.createObjectURL
   * para que el postulante vea exactamente qué subió. El map
   * `previewUrls` sobrevive a re-renders mientras el componente esté
   * montado; el cleanup revoca los blob URLs al desmontar para evitar
   * leaks de memoria.
   */
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    return () => {
      // Cleanup global al desmontar — revocamos TODAS las URLs del map.
      Object.values(previewUrls).forEach((u) => URL.revokeObjectURL(u))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addPhotos = (files: File[]) => {
    const newNames: string[] = []
    const newPreviews: Record<string, string> = {}
    files.forEach((f) => {
      newNames.push(f.name)
      // Solo creamos preview si es imagen (PNG/JPG/WebP/etc) — los
      // otros tipos se ignoran para preview pero se cuentan igual.
      if (f.type.startsWith('image/') && !previewUrls[f.name]) {
        newPreviews[f.name] = URL.createObjectURL(f)
      }
    })
    if (Object.keys(newPreviews).length > 0) {
      setPreviewUrls((prev) => ({ ...prev, ...newPreviews }))
    }
    const next = [...gallery, ...newNames].slice(0, 12)
    setValue('galleryNames', next, { shouldValidate: true })
    if (!cover && newNames[0]) {
      setValue('coverImageName', newNames[0], { shouldValidate: true })
    }
  }
  const removePhoto = (i: number) => {
    const removedName = gallery[i]
    const next = gallery.filter((_, idx) => idx !== i)
    setValue('galleryNames', next, { shouldValidate: true })
    if (cover === removedName) {
      setValue('coverImageName', next[0] ?? '', { shouldValidate: true })
    }
    // Revocar el blob URL del archivo eliminado si lo teníamos.
    if (previewUrls[removedName]) {
      URL.revokeObjectURL(previewUrls[removedName])
      setPreviewUrls((prev) => {
        const { [removedName]: _, ...rest } = prev
        return rest
      })
    }
  }
  const setCover = (name: string) => {
    setValue('coverImageName', name, { shouldValidate: true })
    toast.success('Portada actualizada')
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
          hint={
            // Contador en vivo coherente con el schema (≥3).
            //
            // Fix V2-POS-08 (auditoría v2): antes el hint decía
            // "✓ Cumpliste el mínimo (4/3)" — fracción incómoda que
            // parecía error de validación (subí 4 pero el "mínimo"
            // es 3). Ahora separamos los dos estados: cuando todavía
            // falta mostramos progreso; cuando cumple desaparece la
            // fracción y solo confirma la cantidad real subida.
            gallery.length >= 3
              ? `Subí o tomá fotos claras, activá la fecha y hora. ✓ ${gallery.length} foto${gallery.length === 1 ? '' : 's'} subida${gallery.length === 1 ? '' : 's'}.`
              : `Subí o tomá fotos claras, activá la fecha y hora. Llevás ${gallery.length} de 3 mínimas.`
          }
        >
          <UploadPill
            icon={Upload}
            label="Subir imágen"
            accept="image/*"
            multiple
            onPickFiles={addPhotos}
          />
          <UploadPill
            icon={Camera}
            label="Tomar foto"
            accept="image/*"
            capture
            onPickFiles={addPhotos}
          />
        </EvidenceSection>

        {gallery.length > 0 && (
          <ul className="-mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {gallery.map((name, i) => {
              const url = previewUrls[name]
              const isCover = cover === name
              return (
                <li
                  key={`${name}-${i}`}
                  className={cn(
                    'group relative aspect-square overflow-hidden rounded-2xl border-2 bg-neutral-100 transition-all',
                    isCover
                      ? 'border-gold-500 ring-2 ring-gold-200'
                      : 'border-neutral-200 hover:border-navy-300',
                  )}
                >
                  {url ? (
                    <img
                      src={url}
                      alt={name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    // Si no es imagen (entró sin preview) o el File no
                    // está disponible (re-mount), mostrar placeholder.
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-2 text-center text-navy-300">
                      <ImageIcon className="h-8 w-8" />
                      <p className="line-clamp-2 text-[10px] font-medium">
                        {name}
                      </p>
                    </div>
                  )}

                  {/* Badge "Portada" en la cover */}
                  {isCover && (
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-navy-500 shadow">
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      Portada
                    </span>
                  )}

                  {/* Botón quitar */}
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-error-400 opacity-0 shadow transition-opacity hover:bg-white group-hover:opacity-100"
                    aria-label={`Quitar ${name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>

                  {/* Botón "Hacer portada" si no es la actual */}
                  {!isCover && (
                    <button
                      type="button"
                      onClick={() => setCover(name)}
                      className="absolute inset-x-2 bottom-2 inline-flex items-center justify-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold text-navy-500 opacity-0 shadow transition-opacity hover:bg-white group-hover:opacity-100"
                    >
                      Usar como portada
                    </button>
                  )}
                </li>
              )
            })}
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
  onPickFiles,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any
  label: string
  accept: string
  multiple?: boolean
  capture?: boolean
  /** Callback con solo los nombres. Para casos donde alcanza la metadata. */
  onPick?: (names: string[]) => void
  /**
   * Callback con los File completos. Necesario para generar thumbnails
   * con URL.createObjectURL() en StepEvidencias (#POS-26).
   */
  onPickFiles?: (files: File[]) => void
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
          if (files.length) {
            onPick?.(files.map((f) => f.name))
            onPickFiles?.(files)
            // Resetear value para permitir re-subir el mismo archivo
            ;(e.target as HTMLInputElement).value = ''
          }
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

function StepRevision({
  data,
  onJumpTo,
}: {
  data: Partial<CertifyFormData>
  /**
   * Fix SB2 (#POS-23): antes el copy decía "Podés volver a editar
   * cualquier paso" pero NO había link "Editar →" por sección. El
   * postulante tenía que adivinar a qué paso pertenecía cada dato.
   * Ahora cada sección lleva la step index correcta y un botón que
   * salta directo allá.
   */
  onJumpTo?: (step: number) => void
}) {
  const sections: Array<{
    title: string
    step: number
    items: Array<[string, string | undefined]>
  }> = [
    {
      title: 'Identidad',
      step: 0,
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
      step: 1,
      items: [
        [
          'Rol',
          data.communityRole === 'Otro'
            ? data.communityRoleOther || 'Otro'
            : data.communityRole,
        ],
        ['Actividad', data.communityActivity],
        ['Parentesco', data.hasKinship],
        ['Comunidad', data.communityName],
        ['Territorio propio', data.territoryName],
        ['Inspiración', data.inspirationCommunity],
      ],
    },
    {
      title: 'Producto',
      step: 2,
      items: [
        ['Nombre', data.productName],
        ['Tipo', data.productType],
        ['Sector', data.productSector],
        ['Subcategoría', data.productSubcategory],
      ],
    },
    {
      title: 'Proceso',
      step: 3,
      items: [
        ['Descripción', data.processDescription],
        ['Productor', data.producerType],
        ['Capacidad', data.productionCapacity],
        ['Identificación', data.batchType],
      ],
    },
    // Fix V2-POS-04 (auditoría v2): faltaban Evidencias y Privacidad
    // en la pantalla de revisión. Eran 4/6 secciones — el postulante
    // no podía ver qué fotos iban a quedar publicadas ni si tildó
    // "perfil público" sin volver atrás manualmente. Cerramos las 6.
    {
      title: 'Evidencias',
      step: 4,
      items: [
        ['Portada', data.coverImageName],
        [
          'Fotos del producto',
          data.galleryNames && data.galleryNames.length > 0
            ? `${data.galleryNames.length} foto${data.galleryNames.length === 1 ? '' : 's'} subidas`
            : undefined,
        ],
        ['Video del proceso', data.videoUrl || undefined],
        ['Referencias / fuentes', data.references || undefined],
      ],
    },
    {
      title: 'Privacidad',
      step: 5,
      items: [
        [
          'Términos y condiciones',
          data.acceptTerms ? 'Aceptados' : undefined,
        ],
        [
          'Política de datos',
          data.acceptDataPolicy ? 'Aceptada' : undefined,
        ],
        [
          'Perfil público en el directorio',
          data.acceptPublic
            ? 'Sí · tu producto puede aparecer en /directorio una vez emitido'
            : 'No · solo el comprador con QR/hash podrá verificarlo',
        ],
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
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold uppercase tracking-widest text-navy-300">
                {section.title}
              </p>
              {onJumpTo && (
                <button
                  type="button"
                  onClick={() => onJumpTo(section.step)}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-gold-700 transition-colors hover:bg-gold-50 hover:text-gold-700"
                  aria-label={`Editar paso ${section.step + 1}: ${section.title}`}
                >
                  Editar
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
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
            auditoría cultural va a revisarla. Te vamos a contactar en las
            próximas <strong>72 horas hábiles</strong> para coordinar los
            siguientes pasos.
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
                Un auditor te contacta para coordinar la auditoría cultural.
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
              Guardamos tus avances por 60 días. Podés retomar desde
              <strong>"Mis certificaciones" → "Postergadas"</strong> en
              tu panel.
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

/**
 * Dialog que aparece al entrar al CertifyForm si hay datos persistidos
 * del último intento. Cierra el bug #POS-21 (auditoría UX): postulación
 * nueva con datos contaminados.
 *
 * Reutiliza el mismo layout que PostponeModal (consistencia visual) pero
 * con icono Sparkles + tono más "elegir camino" en vez de "confirmar
 * acción destructiva". El call-to-action principal es "Continuar" porque
 * en la mayoría de los casos el user va a querer retomar — solo
 * ocasionalmente quiere empezar de cero.
 */
function ResumeOrFreshDialog({
  open,
  currentStep,
  productName,
  applicantName,
  onContinue,
  onStartFresh,
}: {
  open: boolean
  currentStep: number
  productName?: string
  applicantName?: string
  onContinue: () => void
  onStartFresh: () => void
}) {
  // Esc cierra "continuando" (acción menos destructiva — mantiene datos).
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onContinue()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onContinue])

  // Descripción contextual: si tenemos nombre del producto, lo mostramos
  // para que el user identifique de qué postulación habla.
  //
  // Fix V2-POS-05 (auditoría v2): si solo se cargó applicantName (paso
  // 1 sin producto todavía) el fallback usaba el nombre del solicitante
  // y la frase quedaba "Guardamos tus avances de **Camila Montes**"
  // — confuso porque Camila es la cuenta del user, no el producto.
  // Ahora si no hay productName y solo hay applicantName, usamos un
  // copy explícito de "tu postulación a tu nombre" en vez del nombre
  // pelado.
  const hasProductName = (productName ?? '').trim().length > 0
  const subjectNode = hasProductName ? (
    <strong className="text-navy-500">{productName}</strong>
  ) : applicantName ? (
    <>
      tu postulación a nombre de{' '}
      <strong className="text-navy-500">{applicantName}</strong>
    </>
  ) : (
    <strong className="text-navy-500">una postulación a medias</strong>
  )
  const stepLabel = currentStep > 0 ? ` (paso ${currentStep + 1} de 7)` : ''

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
          {/* Backdrop NO clickeable — obliga a elegir explícitamente.
              Si fuera dismissable por backdrop, el user podría perder
              datos sin saber qué pasó. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-navy-500/60 backdrop-blur-[2px]"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="resume-title"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            className="relative w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl md:p-10"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-100 text-gold-700 ring-4 ring-gold-100/60">
              <Sparkles className="h-7 w-7" />
            </div>

            <h2
              id="resume-title"
              className="mt-5 text-xl font-bold text-navy-500 md:text-2xl"
            >
              Tenés una postulación a medias
            </h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-navy-300">
              Guardamos tus avances de {subjectNode}
              {stepLabel}. ¿Querés continuarla o empezás una nueva?
            </p>

            <div className="mt-7 flex flex-col gap-2">
              <button
                type="button"
                onClick={onContinue}
                className="inline-flex h-11 items-center justify-center rounded-full bg-navy-500 px-6 text-sm font-bold text-white shadow-sm transition-colors hover:bg-navy-400"
              >
                Continuar donde quedé
              </button>
              <button
                type="button"
                onClick={onStartFresh}
                className="inline-flex h-11 items-center justify-center rounded-full border border-neutral-300 px-6 text-sm font-semibold text-navy-500 transition-colors hover:bg-neutral-100"
              >
                Empezar una nueva
              </button>
            </div>
            <p className="mt-3 text-[11px] text-navy-300">
              Si elegís empezar nueva, se borra el borrador actual y no
              podrás recuperarlo.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
