import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Image as ImageIcon,
  Info,
  Leaf,
  MapPin,
  Save,
  Upload,
  Users,
} from 'lucide-react'
import { useForm, FormProvider, useFormContext } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/features/Logo'
import { useCertifyFormStore, type CertifyFormData } from '@/store/certifyForm'
import { cn } from '@/lib/utils'

// Per-step zod schemas
const stepSchemas = [
  z.object({
    title: z.string().min(3, 'Mínimo 3 caracteres'),
    type: z.enum(['producto', 'servicio'], {
      message: 'Elegí una opción',
    }),
    category: z.string().min(2, 'Indicá una categoría'),
    shortDescription: z.string().min(20, 'Mínimo 20 caracteres'),
  }),
  z.object({
    country: z.string().min(2, 'Indicá un país'),
    region: z.string().min(2, 'Indicá una región'),
    community: z.string().min(2, 'Indicá la comunidad o territorio'),
    exactLocation: z.string().optional().or(z.literal('')),
  }),
  z.object({
    materials: z.string().min(5, 'Listá los materiales principales'),
    technique: z.string().min(3, 'Nombre de la técnica'),
    processDescription: z.string().min(40, 'Mínimo 40 caracteres'),
    generations: z.string().optional().or(z.literal('')),
  }),
  z.object({
    coverImageName: z.string().min(1, 'Subí una imagen de portada'),
    galleryNames: z.array(z.string()).optional(),
    videoUrl: z
      .string()
      .url('URL inválida')
      .optional()
      .or(z.literal('')),
    references: z.string().optional().or(z.literal('')),
  }),
  z.object({
    applicantName: z.string().min(2, 'Tu nombre'),
    email: z.string().email('Email inválido'),
    phone: z
      .string()
      .min(6, 'Mínimo 6 dígitos')
      .optional()
      .or(z.literal('')),
    acceptTerms: z.literal(true, {
      message: 'Tenés que aceptar los términos',
    }),
  }),
]

const steps = [
  {
    id: 'producto',
    title: 'Producto',
    description: 'Decinos qué querés certificar.',
    icon: Leaf,
  },
  {
    id: 'origen',
    title: 'Origen',
    description: 'Territorio y comunidad de origen.',
    icon: MapPin,
  },
  {
    id: 'proceso',
    title: 'Materia y proceso',
    description: 'La técnica y los materiales.',
    icon: Info,
  },
  {
    id: 'documentacion',
    title: 'Documentación',
    description: 'Imágenes y referencias.',
    icon: ImageIcon,
  },
  {
    id: 'contacto',
    title: 'Contacto',
    description: 'Cómo nos comunicamos con vos.',
    icon: Users,
  },
]

export default function CertifyForm() {
  const navigate = useNavigate()
  const { data, step, setStep, updateData, reset } = useCertifyFormStore()
  const [submitted, setSubmitted] = useState(false)

  const schema = stepSchemas[step]
  const methods = useForm<Partial<CertifyFormData>>({
    resolver: zodResolver(schema),
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

  const onSaveDraft = () => {
    updateData(methods.getValues())
    toast.success('Borrador guardado · Podés volver más tarde')
  }

  const onSubmitFinal = async (final: CertifyFormData) => {
    toast.success('Solicitud enviada · Recibirás novedades en tu email')
    setSubmitted(true)
    // Persist final data first then reset (we keep submission visible)
    updateData(final)
  }

  if (submitted) {
    return <SuccessState onReset={() => { reset(); setSubmitted(false); navigate('/') }} />
  }

  return (
    <section className="bg-pattern-gold py-12 md:py-16">
      <div className="mx-auto max-w-[1100px] px-4 md:px-8">
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
          <div className="relative bg-pattern-aztec px-6 py-8 text-white md:px-10 md:py-10">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs text-neutral-300 hover:text-gold-400"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Volver al inicio
            </Link>
            <h1 className="mt-3 text-2xl font-bold md:text-3xl">
              Certificar Producto
            </h1>
            <p className="mt-1 max-w-xl text-sm text-neutral-300">
              Completá los siguientes pasos para iniciar tu solicitud de
              certificación ancestral. Vamos a revisar la información y te
              contactaremos para confirmar la auditoría.
            </p>
          </div>

          <Stepper current={step} />

          <FormProvider {...methods}>
            <form onSubmit={onNext} className="px-6 pb-8 md:px-10 md:pb-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="pt-8"
                >
                  {step === 0 && <StepProducto />}
                  {step === 1 && <StepOrigen />}
                  {step === 2 && <StepProceso />}
                  {step === 3 && <StepDocumentacion />}
                  {step === 4 && <StepContacto />}
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-neutral-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  {step > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="md"
                      onClick={onBack}
                    >
                      <ArrowLeft className="h-4 w-4" /> Anterior
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={onSaveDraft}
                  >
                    <Save className="h-4 w-4" /> Guardar borrador
                  </Button>
                </div>
                <Button
                  type="submit"
                  variant={step === steps.length - 1 ? 'gold' : 'navy'}
                  size="lg"
                >
                  {step === steps.length - 1
                    ? 'Enviar solicitud'
                    : 'Siguiente'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </section>
  )
}

function Stepper({ current }: { current: number }) {
  return (
    <div className="border-b border-neutral-200 bg-white px-4 py-6 md:px-10 md:py-7">
      <ol className="flex items-start gap-1 md:gap-2">
        {steps.map((s, i) => {
          const active = i === current
          const done = i < current
          return (
            <li
              key={s.id}
              className={cn(
                'flex flex-col items-center',
                i < steps.length - 1 && 'flex-1',
              )}
            >
              <div className="flex w-full items-center">
                <div className="flex-1 md:hidden" />
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-all',
                    active &&
                      'border-gold-500 bg-gold-500 text-navy-500 shadow-md',
                    done && 'border-gold-500 bg-gold-500 text-navy-500',
                    !active && !done && 'border-neutral-300 text-neutral-400',
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={cn(
                      'mx-1 h-px flex-1 transition-colors md:mx-2',
                      done ? 'bg-gold-500' : 'bg-neutral-300',
                    )}
                  />
                )}
              </div>
              <p
                className={cn(
                  'mt-2 hidden text-center text-[10px] font-bold uppercase tracking-widest md:block',
                  active || done ? 'text-navy-500' : 'text-navy-300',
                )}
                style={
                  i < steps.length - 1
                    ? { marginRight: 'calc(50% - 18px - 8px)' }
                    : undefined
                }
              >
                {s.title}
              </p>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function FieldRow({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>
}

function FieldError({ name }: { name: string }) {
  const {
    formState: { errors },
  } = useFormContext()
  const err = (errors as Record<string, { message?: string } | undefined>)[name]
  if (!err?.message) return null
  return (
    <p className="mt-1 text-xs font-medium text-error-400">{err.message}</p>
  )
}

function StepHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-navy-500 md:text-2xl">
        {title}
      </h2>
      <p className="mt-1 text-sm text-navy-300">{description}</p>
    </div>
  )
}

function StepProducto() {
  const { register, watch, setValue } = useFormContext<Partial<CertifyFormData>>()
  const type = watch('type')
  return (
    <div>
      <StepHeader
        title="Datos del producto o servicio"
        description="Empezamos con lo básico: qué es lo que querés certificar."
      />

      <div className="space-y-5">
        <div>
          <Label htmlFor="title">Título del producto/servicio</Label>
          <Input
            id="title"
            placeholder="Ej. Tejido y diseño textil tradicional"
            className="mt-2"
            {...register('title')}
          />
          <FieldError name="title" />
        </div>

        <div>
          <Label>¿Es producto o servicio?</Label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(['producto', 'servicio'] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setValue('type', opt, { shouldValidate: true })}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold capitalize transition-all',
                  type === opt
                    ? 'border-gold-500 bg-gold-100 text-navy-500'
                    : 'border-neutral-300 text-navy-300 hover:border-gold-300',
                )}
              >
                {type === opt && <Check className="h-4 w-4" />}
                {opt}
              </button>
            ))}
          </div>
          <FieldError name="type" />
        </div>

        <div>
          <Label htmlFor="category">Categoría</Label>
          <select
            id="category"
            className="mt-2 h-12 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
            {...register('category')}
          >
            <option value="">Seleccioná…</option>
            <option value="Joyería y orfebrería">Joyería y orfebrería</option>
            <option value="Tejidos y textiles">Tejidos y textiles</option>
            <option value="Cocina ancestral">Cocina ancestral</option>
            <option value="Productos agroecológicos">
              Productos agroecológicos
            </option>
            <option value="Turismo cultural">Turismo cultural</option>
            <option value="Medicina ancestral">Medicina ancestral</option>
            <option value="Cerámica y alfarería">Cerámica y alfarería</option>
            <option value="Otro">Otro</option>
          </select>
          <FieldError name="category" />
        </div>

        <div>
          <Label htmlFor="shortDescription">Descripción breve</Label>
          <textarea
            id="shortDescription"
            rows={4}
            placeholder="Contanos en pocas líneas qué hace única tu propuesta."
            className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-navy-500 placeholder:text-neutral-600 focus:border-gold-500 focus:outline-none"
            {...register('shortDescription')}
          />
          <FieldError name="shortDescription" />
        </div>
      </div>
    </div>
  )
}

function StepOrigen() {
  const { register } = useFormContext<Partial<CertifyFormData>>()
  return (
    <div>
      <StepHeader
        title="Origen y procedencia"
        description="Documentamos el territorio y la comunidad detrás de tu saber."
      />

      <div className="space-y-5">
        <FieldRow>
          <div>
            <Label htmlFor="country">País</Label>
            <Input
              id="country"
              placeholder="Ej. Argentina"
              className="mt-2"
              {...register('country')}
            />
            <FieldError name="country" />
          </div>
          <div>
            <Label htmlFor="region">Región / Provincia</Label>
            <Input
              id="region"
              placeholder="Ej. Jujuy"
              className="mt-2"
              {...register('region')}
            />
            <FieldError name="region" />
          </div>
        </FieldRow>

        <div>
          <Label htmlFor="community">Comunidad / Territorio</Label>
          <Input
            id="community"
            placeholder="Ej. Quebrada de Humahuaca · Comunidad Tilcara"
            className="mt-2"
            {...register('community')}
          />
          <FieldError name="community" />
        </div>

        <div>
          <Label htmlFor="exactLocation">Ubicación específica (opcional)</Label>
          <Input
            id="exactLocation"
            placeholder="Coordenadas, link Maps o referencias"
            className="mt-2"
            {...register('exactLocation')}
          />
          <FieldError name="exactLocation" />
        </div>
      </div>
    </div>
  )
}

function StepProceso() {
  const { register } = useFormContext<Partial<CertifyFormData>>()
  return (
    <div>
      <StepHeader
        title="Materia y proceso"
        description="Cómo lo hacés y con qué materiales trabajás."
      />

      <div className="space-y-5">
        <div>
          <Label htmlFor="technique">Nombre de la técnica</Label>
          <Input
            id="technique"
            placeholder="Ej. Filigrana · Mopa-Mopa · Quinoa Real"
            className="mt-2"
            {...register('technique')}
          />
          <FieldError name="technique" />
        </div>

        <div>
          <Label htmlFor="materials">Materiales principales</Label>
          <Input
            id="materials"
            placeholder="Ej. Plata 925, lana de oveja, hierbas nativas…"
            className="mt-2"
            {...register('materials')}
          />
          <FieldError name="materials" />
        </div>

        <div>
          <Label htmlFor="processDescription">Descripción del proceso</Label>
          <textarea
            id="processDescription"
            rows={5}
            placeholder="Detallá las etapas del proceso: preparación, elaboración, terminación. Incluí prácticas tradicionales si aplican."
            className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-navy-500 placeholder:text-neutral-600 focus:border-gold-500 focus:outline-none"
            {...register('processDescription')}
          />
          <FieldError name="processDescription" />
        </div>

        <div>
          <Label htmlFor="generations">
            Generaciones que sostienen este saber (opcional)
          </Label>
          <Input
            id="generations"
            placeholder="Ej. 4ta generación · desde 1947"
            className="mt-2"
            {...register('generations')}
          />
          <FieldError name="generations" />
        </div>
      </div>
    </div>
  )
}

function StepDocumentacion() {
  const { register, setValue, watch } =
    useFormContext<Partial<CertifyFormData>>()
  const cover = watch('coverImageName')
  const gallery = watch('galleryNames') ?? []
  return (
    <div>
      <StepHeader
        title="Documentación"
        description="Imágenes y referencias que ayudan a validar tu solicitud."
      />

      <div className="space-y-5">
        <div>
          <Label>Imagen de portada</Label>
          <FilePicker
            multiple={false}
            value={cover ? [cover] : []}
            onChange={(names) =>
              setValue('coverImageName', names[0] ?? '', {
                shouldValidate: true,
              })
            }
            hint="JPG o PNG · Mínimo 1200px de ancho"
          />
          <FieldError name="coverImageName" />
        </div>

        <div>
          <Label>Galería (hasta 6 imágenes adicionales)</Label>
          <FilePicker
            multiple
            value={gallery}
            onChange={(names) => setValue('galleryNames', names.slice(0, 6))}
            hint="Mostrá distintos ángulos, etapas del proceso, contexto"
          />
        </div>

        <div>
          <Label htmlFor="videoUrl">Video (opcional)</Label>
          <Input
            id="videoUrl"
            type="url"
            placeholder="Link de YouTube, Vimeo o Drive"
            className="mt-2"
            {...register('videoUrl')}
          />
          <FieldError name="videoUrl" />
        </div>

        <div>
          <Label htmlFor="references">Referencias y certificados previos (opcional)</Label>
          <textarea
            id="references"
            rows={3}
            placeholder="Listá certificaciones previas, publicaciones, premios o reconocimientos relacionados."
            className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-navy-500 placeholder:text-neutral-600 focus:border-gold-500 focus:outline-none"
            {...register('references')}
          />
        </div>
      </div>
    </div>
  )
}

function FilePicker({
  multiple,
  value,
  onChange,
  hint,
}: {
  multiple: boolean
  value: string[]
  onChange: (names: string[]) => void
  hint: string
}) {
  return (
    <div className="mt-2">
      <label
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-gold-100/30 p-8 text-center transition-colors hover:border-gold-500',
          value.length > 0 ? 'border-gold-500' : 'border-neutral-300',
        )}
      >
        <Upload className="h-6 w-6 text-gold-700" />
        <p className="text-sm font-semibold text-navy-500">
          {value.length > 0
            ? multiple
              ? `${value.length} archivo(s) cargado(s)`
              : value[0]
            : 'Arrastrá tus archivos o hacé click para subir'}
        </p>
        <p className="text-xs text-navy-300">{hint}</p>
        <input
          type="file"
          multiple={multiple}
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? [])
            const names = files.map((f) => f.name)
            onChange(multiple ? [...value, ...names] : names)
          }}
        />
      </label>
      {multiple && value.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {value.map((name, i) => (
            <li
              key={i}
              className="inline-flex items-center gap-2 rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold text-gold-700"
            >
              <ImageIcon className="h-3 w-3" />
              {name}
              <button
                type="button"
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                className="ml-1 text-gold-700/70 hover:text-error-400"
                aria-label="Quitar"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function StepContacto() {
  const { register } = useFormContext<Partial<CertifyFormData>>()
  return (
    <div>
      <StepHeader
        title="Datos de contacto"
        description="Necesitamos cómo comunicarnos con vos para coordinar la auditoría."
      />

      <div className="space-y-5">
        <div>
          <Label htmlFor="applicantName">Nombre y apellido</Label>
          <Input
            id="applicantName"
            placeholder="Ej. Camila Montes"
            className="mt-2"
            {...register('applicantName')}
          />
          <FieldError name="applicantName" />
        </div>

        <FieldRow>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              className="mt-2"
              {...register('email')}
            />
            <FieldError name="email" />
          </div>
          <div>
            <Label htmlFor="phone">Teléfono (opcional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+54 387 555 0123"
              className="mt-2"
              {...register('phone')}
            />
            <FieldError name="phone" />
          </div>
        </FieldRow>

        <div className="rounded-2xl border border-neutral-200 bg-gold-100/30 p-4">
          <label className="flex cursor-pointer items-start gap-3 text-sm text-navy-300">
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
        </div>
      </div>
    </div>
  )
}

function SuccessState({ onReset }: { onReset: () => void }) {
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
                Revisamos la documentación enviada.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-700" />
                Coordinamos una entrevista con curadores culturales.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-700" />
                Si aprobado, generamos el hash en blockchain y publicamos la
                ficha pública.
              </li>
            </ul>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/directorio"
              className={cn(buttonVariants({ variant: 'gold', size: 'lg' }))}
            >
              Ver directorio
            </Link>
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
