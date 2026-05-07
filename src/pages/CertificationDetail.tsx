import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Award,
  CheckCircle2,
  Copy,
  FileText,
  Flag,
  Hash,
  MapPin,
  Printer,
  QrCode,
  Share2,
  ShieldCheck,
  Star,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useCertification } from '@/hooks/useCertifications'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Sheet } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/services/api'
import { cn, formatDate } from '@/lib/utils'

const PLACEHOLDER = '__placeholder__'

const isPlaceholder = (v: string) => v === PLACEHOLDER || !v

function resolveAsset(url: string) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${import.meta.env.BASE_URL}${url.replace(/^\//, '')}`
}

const reportSchema = z.object({
  reason: z.string().min(3, 'Indicá un motivo'),
  description: z.string().min(10, 'Mínimo 10 caracteres'),
})
type ReportForm = z.infer<typeof reportSchema>

export default function CertificationDetail() {
  const { slug } = useParams()
  const { data: cert, isLoading, error } = useCertification(slug)
  const [showReport, setShowReport] = useState(false)
  const [showQr, setShowQr] = useState(false)

  if (isLoading) return <DetailSkeleton />
  if (error || !cert) return <DetailError message={error ?? 'No encontrado'} />

  const region = isPlaceholder(cert.category)
    ? 'País - Región'
    : `Colombia · ${cert.category}`
  const authorName = isPlaceholder(cert.authorName) ? 'Autor' : cert.authorName

  return (
    <>
      <section className="bg-white">
        <div className="mx-auto max-w-[1320px] px-4 py-8 md:px-8 md:py-10">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <h1 className="text-2xl font-extrabold leading-tight text-navy-500 md:text-4xl">
              {cert.title}
            </h1>
            <div className="flex items-center gap-2">
              <Badge variant="success" className="gap-1.5">
                <CheckCircle2 className="h-3 w-3" />
                En Estado
              </Badge>
              <Badge variant="success" className="gap-1.5">
                <ShieldCheck className="h-3 w-3" />
                Certificada Auténtica
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  toast.success('Link copiado')
                }}
              >
                <Share2 className="h-4 w-4" />
                Compartir
              </Button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100">
                <img
                  src={resolveAsset(cert.coverUrl)}
                  alt={cert.title}
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </div>

            <aside className="lg:col-span-5">
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      cert.authorAvatarUrl ||
                      'https://i.pravatar.cc/200?img=47'
                    }
                    alt={authorName}
                    className="h-12 w-12 rounded-full border-2 border-gold-300 object-cover"
                  />
                  <div className="flex-1">
                    <Link
                      to={`/autor/${cert.authorId}`}
                      className="flex items-center gap-1 text-base font-bold text-navy-500 hover:text-gold-700"
                    >
                      {authorName}
                      {!isPlaceholder(cert.authorName) && (
                        <CheckCircle2 className="h-4 w-4 text-gold-500" />
                      )}
                    </Link>
                    <p className="text-xs text-navy-300">{region}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-widest text-navy-300">
                      Score
                    </p>
                    <p className="text-base font-extrabold text-navy-500">
                      100/100
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4 border-t border-neutral-200 pt-5">
                  <Stat
                    icon={Star}
                    label="Puntaje"
                    value="95/100"
                    pillTone="gold"
                  />
                  <Stat
                    icon={Award}
                    label="Símbolos"
                    value="100/100"
                    pillTone="gold"
                  />
                  <Stat
                    icon={FileText}
                    label="Fecha de emisión"
                    value={formatDate(cert.issuedAt)}
                    pillTone="navy"
                  />
                  <Stat
                    icon={FileText}
                    label="Fecha de expiración"
                    value={
                      cert.expiresAt ? formatDate(cert.expiresAt) : 'Indefinida'
                    }
                    pillTone="navy"
                  />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2 border-t border-neutral-200 pt-4 sm:grid-cols-4">
                  <ActionButton
                    icon={QrCode}
                    label="QR"
                    onClick={() => setShowQr(true)}
                  />
                  <ActionButton
                    icon={Share2}
                    label="Compartir"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href)
                      toast.success('Link copiado')
                    }}
                  />
                  <ActionButton
                    icon={Printer}
                    label="Imprimir"
                    onClick={() => window.print()}
                  />
                  <ActionButton
                    icon={Flag}
                    label="Reportar"
                    onClick={() => setShowReport(true)}
                  />
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-neutral-200 bg-gold-100/30 p-4">
                <div className="flex items-center gap-2">
                  <Hash className="h-3.5 w-3.5 text-navy-300" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-gold-700">
                    Hash en blockchain
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(cert.hash)
                      toast.success('Hash copiado')
                    }}
                    className="ml-auto text-navy-300 hover:text-navy-500"
                    aria-label="Copiar hash"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
                <code className="mt-1 block break-all text-[10px] leading-relaxed text-navy-300">
                  {cert.hash}
                </code>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-[1320px] px-4 pb-10 md:px-8 md:pb-12">
          <article className="prose prose-sm max-w-none">
            <SectionHeading num="1">Comunidad y legado</SectionHeading>
            <p className="mt-3 leading-relaxed text-navy-300">
              Comunidad: comunidad creativa transmitida de manera ancestral en
              la zona de la Sierra Nevada de Santa Marta y zonas
              representativas tradicionales de la región.
            </p>
            <p className="mt-3 leading-relaxed text-navy-300">
              Esta práctica nace como manifestación de la cosmovisión y de las
              tradiciones culturales originarias del territorio, integrando
              elementos simbólicos del entorno —como la naturaleza, el agua y
              los elementos del territorio— a las piezas elaboradas en plata.
            </p>

            <SectionHeading num="2" className="mt-8">
              Materia y proceso
            </SectionHeading>
            <p className="mt-3 leading-relaxed text-navy-300">
              La filigrana es una técnica de orfebrería que requiere un
              dominio de hilos de plata muy finos, trabajados con
              herramientas especializadas y procesos artesanales que
              implican fundir, estirar y entrelazar los hilos en composiciones
              decorativas únicas.
            </p>
            <p className="mt-3 leading-relaxed text-navy-300">
              El rigor del proceso, el lenguaje propio del oficio y el
              respeto por la tradición son fundamentales: cada pieza requiere
              tiempos prolongados de elaboración, y se reconoce por su
              identidad simbólica, complejidad técnica y la calidad del
              material que respeta su origen.
            </p>
          </article>

          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-square overflow-hidden rounded-2xl border border-neutral-200"
              >
                <img
                  src={resolveAsset(cert.coverUrl)}
                  alt=""
                  className="h-full w-full object-cover opacity-90 transition-opacity hover:opacity-100"
                />
              </div>
            ))}
          </div>

          <div className="mt-8 overflow-hidden rounded-3xl border border-neutral-200">
            <div className="relative aspect-[16/6] bg-gradient-to-br from-gold-100 via-neutral-100 to-gold-100/40">
              <svg
                viewBox="0 0 1600 600"
                preserveAspectRatio="xMidYMid slice"
                className="h-full w-full"
                aria-hidden
              >
                <defs>
                  <pattern
                    id="map-grid"
                    width="80"
                    height="80"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 80 0 L 0 0 0 80"
                      fill="none"
                      stroke="rgba(0,28,56,0.05)"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>
                <rect width="1600" height="600" fill="url(#map-grid)" />
                <path
                  d="M200,300 Q420,180 600,260 T960,300 Q1180,380 1400,260"
                  stroke="rgba(199,168,0,0.35)"
                  strokeWidth="3"
                  strokeDasharray="8 6"
                  fill="none"
                />
                <circle
                  cx="820"
                  cy="280"
                  r="60"
                  fill="rgba(199,168,0,0.18)"
                />
                <circle cx="820" cy="280" r="30" fill="#C7A800" />
              </svg>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-gold-500 text-navy-500 shadow-xl">
                  <MapPin className="h-6 w-6" />
                </div>
              </div>
              <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-navy-500 shadow">
                Sierra Nevada de Santa Marta · Colombia
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-pattern-aztec">
        <div className="mx-auto max-w-[1320px] px-4 py-12 text-center text-white md:px-8 md:py-16">
          <h2 className="text-2xl font-extrabold md:text-3xl">
            Nuestra metodología de certificación
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-neutral-300">
            Cuatro pilares que sostienen cada certificado emitido por la
            plataforma Ancestral Seed.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {[
              'Origen Validado',
              'Materiales auténticos',
              'Saber tradicional',
              'Comunidad responsable',
            ].map((p) => (
              <span
                key={p}
                className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-500"
              >
                <CheckCircle2 className="h-4 w-4" />
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      <ReportSheet
        open={showReport}
        onClose={() => setShowReport(false)}
        certificationId={cert.id}
      />
      <QrSheet
        open={showQr}
        onClose={() => setShowQr(false)}
        certUrl={typeof window !== 'undefined' ? window.location.href : ''}
        title={cert.title}
      />
    </>
  )
}

function ReportSheet({
  open,
  onClose,
  certificationId,
}: {
  open: boolean
  onClose: () => void
  certificationId: string
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReportForm>({ resolver: zodResolver(reportSchema) })

  const onSubmit = async (data: ReportForm) => {
    try {
      await api.reportIncident({ certificationId, ...data })
      toast.success('Reporte enviado · Te contactamos en 48hs')
      reset()
      onClose()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Reportar incidencia"
      description="Si encontraste un dato erróneo o sospecha de fraude, contanos."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="reason">Motivo</Label>
          <select
            id="reason"
            className="mt-2 h-12 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
            {...register('reason')}
          >
            <option value="">Seleccioná un motivo…</option>
            <option value="dato-erroneo">Dato erróneo</option>
            <option value="autoria-incorrecta">Autoría incorrecta</option>
            <option value="sospecha-fraude">Sospecha de fraude</option>
            <option value="otro">Otro</option>
          </select>
          {errors.reason && (
            <p className="mt-1 text-xs font-medium text-error-400">
              {errors.reason.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="description">Descripción</Label>
          <textarea
            id="description"
            rows={4}
            placeholder="Contanos qué encontraste…"
            className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-navy-500 placeholder:text-neutral-600 focus:border-gold-500 focus:outline-none"
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1 text-xs font-medium text-error-400">
              {errors.description.message}
            </p>
          )}
        </div>
        <Button
          type="submit"
          variant="navy"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Enviando…' : 'Enviar reporte'}
        </Button>
      </form>
    </Sheet>
  )
}

function QrSheet({
  open,
  onClose,
  certUrl,
  title,
}: {
  open: boolean
  onClose: () => void
  certUrl: string
  title: string
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Compartir QR" description={title}>
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-56 w-56 items-center justify-center rounded-3xl border border-neutral-200 bg-white p-4">
          <QrPreview value={certUrl} />
        </div>
        <p className="text-center text-xs text-navy-300">
          Escaneá el QR para abrir esta ficha pública.
        </p>
        <div className="flex w-full gap-2">
          <Button
            variant="outlineNavy"
            size="md"
            className="flex-1"
            onClick={() => {
              navigator.clipboard.writeText(certUrl)
              toast.success('Link copiado')
            }}
          >
            Copiar link
          </Button>
          <Button
            variant="navy"
            size="md"
            className="flex-1"
            onClick={() => window.print()}
          >
            Imprimir
          </Button>
        </div>
      </div>
    </Sheet>
  )
}

function QrPreview({ value }: { value: string }) {
  // Compact deterministic faux-QR (visual placeholder) — keeps demo offline-friendly.
  const cells = 17
  const seed = value
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return (
    <svg viewBox={`0 0 ${cells} ${cells}`} className="h-full w-full">
      <rect width={cells} height={cells} fill="#ffffff" />
      {Array.from({ length: cells * cells }).map((_, i) => {
        const x = i % cells
        const y = Math.floor(i / cells)
        const corner =
          (x < 3 && y < 3) ||
          (x > cells - 4 && y < 3) ||
          (x < 3 && y > cells - 4)
        const fill = ((x * 31 + y * 7 + seed) % 3) === 0 || corner
        return fill ? (
          <rect key={i} x={x} y={y} width={1} height={1} fill="#001c38" />
        ) : null
      })}
      <rect x="0" y="0" width="3" height="3" fill="#fff" stroke="#001c38" strokeWidth="0.4" />
      <rect x="0.7" y="0.7" width="1.6" height="1.6" fill="#001c38" />
      <rect x={cells - 3} y="0" width="3" height="3" fill="#fff" stroke="#001c38" strokeWidth="0.4" />
      <rect x={cells - 2.3} y="0.7" width="1.6" height="1.6" fill="#001c38" />
      <rect x="0" y={cells - 3} width="3" height="3" fill="#fff" stroke="#001c38" strokeWidth="0.4" />
      <rect x="0.7" y={cells - 2.3} width="1.6" height="1.6" fill="#001c38" />
    </svg>
  )
}

function SectionHeading({
  num,
  children,
  className,
}: {
  num: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <h2
      className={cn(
        'flex items-center gap-3 text-xl font-extrabold text-navy-500 md:text-2xl',
        className,
      )}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-100 text-sm font-extrabold text-gold-700">
        {num}
      </span>
      {children}
    </h2>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
  pillTone,
}: {
  icon: typeof Award
  label: string
  value: string
  pillTone: 'gold' | 'navy'
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
          pillTone === 'gold'
            ? 'bg-gold-100 text-gold-700'
            : 'bg-navy-500 text-gold-400',
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-widest text-navy-300">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-bold text-navy-500">{value}</p>
      </div>
    </div>
  )
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Award
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1 rounded-2xl border border-neutral-200 bg-white px-2 py-3 text-xs font-semibold text-navy-300 transition-colors hover:border-gold-500 hover:bg-gold-100 hover:text-navy-500"
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-[1320px] px-4 py-12 md:px-8">
      <Skeleton className="h-10 w-3/4" />
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <Skeleton className="aspect-[4/3] lg:col-span-7" />
        <div className="space-y-3 lg:col-span-5">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  )
}

function DetailError({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-2xl font-extrabold text-navy-500">
        Certificado no encontrado
      </h1>
      <p className="mt-2 text-sm text-navy-300">{message}</p>
      <Link
        to="/directorio"
        className={cn(buttonVariants({ variant: 'gold', size: 'md' }), 'mt-6')}
      >
        Volver al directorio
      </Link>
    </div>
  )
}
