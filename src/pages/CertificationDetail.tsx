import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Award,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ArrowRight,
  Download,
  ExternalLink,
  FileCheck2,
  Flag,
  Mail,
  Network,
  Search as SearchIcon,
  Share2,
  ShieldCheck,
  Sprout,
  Star,
  Users,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useCertification } from '@/hooks/useCertifications'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
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
  const [galleryIndex, setGalleryIndex] = useState(0)

  if (isLoading) return <DetailSkeleton />
  if (error || !cert) return <DetailError message={error ?? 'No encontrado'} />

  const authorName = isPlaceholder(cert.authorName) ? 'Autor' : cert.authorName
  const region = isPlaceholder(cert.category)
    ? 'Colombia · Caribe colombiano'
    : `Colombia · ${cert.category}`

  return (
    <>
      {/* Decorative chevron pattern strip */}
      <div className="bg-pattern-strip h-16 md:h-24" aria-hidden />

      <section className="bg-white">
        <div className="mx-auto max-w-[1320px] px-4 py-8 md:px-8 md:py-10">
          <h1 className="text-3xl font-bold leading-tight text-navy-500 md:text-[40px]">
            {cert.title}
          </h1>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
            {/* LEFT: Cover image */}
            <div className="lg:col-span-6">
              <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100">
                <img
                  src={resolveAsset(cert.coverUrl)}
                  alt={cert.title}
                  className="aspect-square w-full object-cover"
                />
              </div>
            </div>

            {/* RIGHT: Action buttons + Author card + Stats */}
            <div className="space-y-5 lg:col-span-6">
              <div className="flex flex-wrap gap-2">
                <button className="inline-flex h-11 items-center gap-2 rounded-full bg-gold-500 px-5 text-sm font-semibold text-navy-500 transition-colors hover:bg-gold-400">
                  <ShieldCheck className="h-4 w-4" />
                  Ver en Blockchain
                </button>
                <button className="inline-flex h-11 items-center gap-2 rounded-full bg-navy-500 px-5 text-sm font-semibold text-white transition-colors hover:bg-navy-400">
                  <ShieldCheck className="h-4 w-4" />
                  Ver Certificado Verificado
                </button>
                <button className="inline-flex h-11 items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 text-sm font-semibold text-navy-500 transition-colors hover:bg-neutral-100">
                  <Download className="h-4 w-4" />
                  Descargar
                </button>
              </div>

              <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <img
                    src={cert.authorAvatarUrl || 'https://i.pravatar.cc/200?img=47'}
                    alt={authorName}
                    className="h-12 w-12 rounded-full border border-neutral-200 object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-xs text-navy-300">Autor</p>
                    <div className="flex items-center gap-2">
                      <p className="text-base font-bold text-navy-500">
                        {authorName}
                      </p>
                      <Link
                        to={`/perfil/${cert.authorId}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700 hover:underline"
                      >
                        <span>Ver Perfil</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-5 border-t border-neutral-200 pt-5">
                  <Stat
                    icon={Star}
                    label="Puntaje"
                    value="100/100"
                    iconBg="bg-gold-500"
                    iconColor="text-navy-500"
                  />
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-500 text-navy-500">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs text-navy-300">Estado</p>
                      <span className="mt-0.5 inline-block rounded-full bg-success-200 px-2.5 py-0.5 text-xs font-semibold text-success-400">
                        Vigente
                      </span>
                    </div>
                  </div>
                  <Stat
                    icon={Calendar}
                    label="Fecha de emisión"
                    value={formatDate(cert.issuedAt)}
                    iconBg="bg-gold-500"
                    iconColor="text-navy-500"
                  />
                  <Stat
                    icon={Calendar}
                    label="Fecha de vigencia"
                    value={cert.expiresAt ? formatDate(cert.expiresAt) : 'Indefinida'}
                    iconBg="bg-gold-500"
                    iconColor="text-navy-500"
                  />
                </div>

                <div className="mt-5 flex flex-wrap gap-2 border-t border-neutral-200 pt-4">
                  <button className="inline-flex h-9 items-center gap-1.5 rounded-full border border-neutral-300 px-4 text-xs font-semibold text-navy-500 transition-colors hover:bg-neutral-100">
                    <Mail className="h-3.5 w-3.5" />
                    Contactar
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href)
                      toast.success('Link copiado')
                    }}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-neutral-300 px-4 text-xs font-semibold text-navy-500 transition-colors hover:bg-neutral-100"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    Compartir
                  </button>
                  <button
                    onClick={() => setShowReport(true)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-neutral-300 px-4 text-xs font-semibold text-navy-500 transition-colors hover:bg-neutral-100"
                  >
                    <Flag className="h-3.5 w-3.5" />
                    Reportar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-[1320px] px-4 pb-10 md:px-8 md:pb-12">
          <div className="rounded-3xl border border-neutral-200 bg-white p-8 md:p-10">
            <h2 className="flex items-center gap-2 text-base font-bold text-navy-500">
              <Users className="h-4 w-4 text-gold-700" />
              Comunidad y región
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-navy-300">
              {region}. Esta técnica mantiene un vínculo ancestral con la
              Sierra Nevada de Santa Marta, transmitido a través de herencias
              familiares de comunidades indígenas del territorio.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-navy-300">
              Esta práctica tiene raíces milenarias, con hallazgos en
              civilizaciones antiguas como Egipto y Grecia, y se desarrolló
              ampliamente en distintas regiones de América Latina —como
              Colombia, México y Perú— y Europa, especialmente en Portugal y
              España.
            </p>

            <h2 className="mt-10 flex items-center gap-2 text-base font-bold text-navy-500">
              <Sprout className="h-4 w-4 text-gold-700" />
              Técnica y producción
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-navy-300">
              {cert.description}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-navy-300">
              A lo largo del tiempo, la práctica se mantuvo viva gracias a la
              transmisión oral y a la práctica familiar, conservando su valor
              cultural y simbólico como una forma de expresión ligada a la
              paciencia, la precisión y el trabajo manual.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-navy-300">
              La pieza es elaborada mediante trabajo manual, utilizando la
              técnica de enrollado y trenzado de hilos metálicos extremadamente
              finos. Cada elemento se construye y se une mediante soldadura
              artesanal, desarrollando la pieza completamente a mano, sin
              intervención de procesos industriales.
            </p>

            <Gallery
              cover={resolveAsset(cert.coverUrl)}
              index={galleryIndex}
              setIndex={setGalleryIndex}
            />

            <MapPreview region={region} />
          </div>
        </div>
      </section>

      <MethodologySection />

      <ReportSheet
        open={showReport}
        onClose={() => setShowReport(false)}
        certificationId={cert.id}
      />
    </>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
  iconBg = 'bg-gold-100',
  iconColor = 'text-gold-700',
}: {
  icon: typeof Award
  label: string
  value: string
  iconBg?: string
  iconColor?: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
          iconBg,
          iconColor,
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-navy-300">{label}</p>
        <p className="mt-0.5 text-sm font-bold text-navy-500">{value}</p>
      </div>
    </div>
  )
}

function Gallery({
  cover,
  index,
  setIndex,
}: {
  cover: string
  index: number
  setIndex: (n: number) => void
}) {
  const items = [cover, cover, cover, cover]
  return (
    <div className="relative mt-10">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {items.map((src, i) => (
          <div
            key={i}
            className="aspect-square overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100"
          >
            <img src={src} alt="" className="h-full w-full object-cover" />
          </div>
        ))}
      </div>
      <button
        type="button"
        aria-label="Anterior"
        onClick={() => setIndex(Math.max(0, index - 1))}
        className="absolute -left-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-gold-500 text-navy-500 shadow-lg transition-all hover:scale-110 hover:bg-gold-400 md:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Siguiente"
        onClick={() => setIndex(Math.min(items.length - 1, index + 1))}
        className="absolute -right-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-gold-500 text-navy-500 shadow-lg transition-all hover:scale-110 hover:bg-gold-400 md:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}

function MapPreview({ region }: { region: string }) {
  return (
    <div className="mt-10 overflow-hidden rounded-3xl border border-neutral-200">
      <div className="relative aspect-[16/7] bg-neutral-100">
        <iframe
          title="Mapa de origen"
          src="https://www.google.com/maps?q=Sierra+Nevada+de+Santa+Marta,+Colombia&t=m&z=7&ie=UTF8&output=embed"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0"
        />
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-navy-500 shadow">
          {region}
          <a
            href="https://www.google.com/maps/search/Sierra+Nevada+de+Santa+Marta"
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto ml-2 inline-flex items-center gap-1 text-gold-700 hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  )
}

function MethodologySection() {
  const items = [
    { label: 'Auditoría\nPersonalizada', icon: SearchIcon },
    { label: 'Verificación\nComunitaria', icon: Users },
    { label: 'Integridad\nBlockchain', icon: Network },
    { label: 'Criterios\nPonderados', icon: FileCheck2 },
  ]
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('${import.meta.env.BASE_URL}cta-banner.png')`,
        }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-navy-500/85" aria-hidden />
      <div className="relative z-10 mx-auto max-w-[1320px] px-4 py-14 text-center text-white md:px-8 md:py-16">
        <h2 className="text-2xl font-bold md:text-[32px] md:leading-tight">
          Nuestra metodología de certificación
        </h2>
        <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-neutral-200 md:text-base">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
          ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {items.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className="inline-flex h-16 items-center justify-center gap-3 rounded-2xl bg-gold-500 px-5 text-sm font-semibold text-navy-500 shadow-md transition-all hover:bg-gold-400 hover:scale-[1.02]"
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="whitespace-pre-line text-left leading-tight">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
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

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-[1320px] px-4 py-12 md:px-8">
      <Skeleton className="h-10 w-3/4" />
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <Skeleton className="aspect-square lg:col-span-6" />
        <div className="space-y-3 lg:col-span-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  )
}

function DetailError({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-navy-500">
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
