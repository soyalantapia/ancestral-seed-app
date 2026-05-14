import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Award,
  Calendar,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Flag,
  Globe,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { mockIssuedCertifications } from '@/services/mocks/data'
import type { IssuedCertStatus } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_META: Record<
  IssuedCertStatus,
  { label: string; cls: string }
> = {
  vigente: {
    label: 'Vigente',
    cls: 'bg-success-100 text-success-300 ring-success-300/30',
  },
  renovacion: {
    label: 'En renovación',
    cls: 'bg-warning-100 text-warning-400 ring-warning-300/40',
  },
  vencido: {
    label: 'Vencido',
    cls: 'bg-info-100 text-info-400 ring-info-300/40',
  },
  denegado: {
    label: 'Denegado',
    cls: 'bg-error-100 text-error-400 ring-error-300/40',
  },
}

export default function TutorCertificationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const cert = mockIssuedCertifications.find((c) => c.id === id)
  const [reportOpen, setReportOpen] = useState(false)

  if (!cert) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <p className="text-sm font-bold text-navy-500">
          Certificación no encontrada
        </p>
        <Link
          to="/tutor/certificaciones"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-navy-500 px-5 py-2.5 text-sm font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al listado
        </Link>
      </div>
    )
  }

  const meta = STATUS_META[cert.status]
  // Hash derivado mock
  const hash = `0x${cert.id.toLowerCase().repeat(8).slice(0, 60)}`

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <button
        type="button"
        onClick={() => navigate('/tutor/certificaciones')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-300 transition-colors hover:text-navy-500"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver a Certificaciones
      </button>

      {/* Hero */}
      <header className="mt-3 overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="bg-pattern-gold px-5 py-5 md:px-8 md:py-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-navy-500">
                  {cert.id}
                </span>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-1',
                    meta.cls,
                  )}
                >
                  <Award className="h-3 w-3" />
                  {meta.label}
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-bold leading-tight text-navy-500 md:text-[28px]">
                {cert.productName}
              </h1>
              <p className="mt-1 inline-flex items-center gap-2 text-sm text-navy-300">
                <Users className="h-3.5 w-3.5" />
                {cert.authorName}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => toast.success('Descargando PDF…')}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-navy-500 px-4 text-xs font-bold text-white shadow-sm transition-colors hover:bg-navy-400"
              >
                <Download className="h-3.5 w-3.5" />
                Descargar PDF
              </button>
              <button
                type="button"
                onClick={() => toast.info('Iniciando renovación…')}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 text-xs font-bold text-navy-500 transition-colors hover:bg-neutral-100"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Renovar
              </button>
            </div>
          </div>
        </div>

        {/* KPIs row */}
        <div className="grid grid-cols-2 gap-3 border-t border-neutral-200 p-5 md:grid-cols-4 md:gap-4 md:p-6">
          <Stat icon={Star} label="Puntaje final" value={cert.scoreLabel} />
          <Stat
            icon={Calendar}
            label="Fecha de emisión"
            value={cert.issuedAt}
          />
          <Stat icon={Calendar} label="Vencimiento" value={cert.expiresAt} />
          <Stat icon={ShieldCheck} label="Categoría" value={cert.category} />
        </div>
      </header>

      {/* Main grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* MAIN */}
        <div className="space-y-5 lg:col-span-8">
          {/* Origen */}
          <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-navy-500" />
              <h2 className="text-base font-bold text-navy-500">
                Origen geográfico
              </h2>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <KV icon={Globe} label="País" value={cert.country} />
              <KV icon={MapPin} label="Región" value={cert.region} />
            </div>
          </section>

          {/* Blockchain */}
          <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-gold-700" />
              <h2 className="text-base font-bold text-navy-500">
                Registro en blockchain
              </h2>
            </div>
            <p className="mt-2 text-sm text-navy-300">
              Polygon Mainnet · Bloque #{52_000_000 + (parseInt(cert.id.slice(3)) || 0)}
            </p>
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-100 px-3 py-2">
              <code className="flex-1 truncate text-[10px] text-navy-500">
                {hash}
              </code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(hash)
                  toast.success('Hash copiado')
                }}
                className="inline-flex items-center gap-1 rounded-full bg-gold-500 px-3 py-1 text-xs font-semibold text-navy-500 transition-colors hover:bg-gold-400"
              >
                <Copy className="h-3 w-3" />
                Copiar
              </button>
            </div>
            <a
              href={`https://polygonscan.com/search?q=${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-gold-700 hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              Abrir en explorador
            </a>
          </section>

          {/* Acciones tutor */}
          <section className="rounded-3xl border border-warning-300/40 bg-warning-100/30 p-5 shadow-sm md:p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-warning-400" />
              <h2 className="text-base font-bold text-navy-500">
                Acciones del tutor
              </h2>
            </div>
            <p className="mt-1 text-xs text-navy-300">
              Operaciones administrativas sobre esta certificación.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => toast.info('Programando recordatorio de renovación')}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 text-xs font-bold text-navy-500 transition-colors hover:bg-neutral-100"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Programar renovación
              </button>
              <button
                type="button"
                onClick={() => toast.success('Notificación enviada al autor')}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 text-xs font-bold text-navy-500 transition-colors hover:bg-neutral-100"
              >
                <FileText className="h-3.5 w-3.5" />
                Notificar al autor
              </button>
              <button
                type="button"
                onClick={() => setReportOpen(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-error-300 bg-white px-3 text-xs font-bold text-error-400 transition-colors hover:bg-error-100"
              >
                <Flag className="h-3.5 w-3.5" />
                Reportar incidencia
              </button>
            </div>
          </section>
        </div>

        {/* SIDEBAR */}
        <aside className="space-y-4 lg:col-span-4">
          <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-navy-300">
              Autor
            </p>
            <div className="mt-3 flex items-center gap-3">
              <img
                src={cert.authorAvatarUrl ?? 'https://i.pravatar.cc/100?img=47'}
                alt=""
                className="h-12 w-12 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-navy-500">
                  {cert.authorName}
                </p>
                <p className="text-xs text-navy-300">
                  {cert.country} · {cert.region}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-navy-300">
              Estado actual
            </p>
            <div className="mt-3">
              <span
                className={cn(
                  'inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1',
                  meta.cls,
                )}
              >
                {meta.label}
              </span>
            </div>
            {cert.status === 'vigente' && (
              <p className="mt-3 text-xs text-navy-300">
                Próximo vencimiento: <strong className="text-navy-500">{cert.expiresAt}</strong>
              </p>
            )}
            {cert.status === 'vencido' && (
              <p className="mt-3 text-xs text-error-400">
                Esta certificación venció el {cert.expiresAt}. Iniciá la renovación.
              </p>
            )}
            {cert.status === 'renovacion' && (
              <p className="mt-3 text-xs text-warning-400">
                Renovación en curso. Revisá el flujo en Casos.
              </p>
            )}
          </section>

          <Link
            to={`/certificado/${cert.id.toLowerCase()}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-gold-700 hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            Ver ficha pública
          </Link>
        </aside>
      </div>

      {/* Report modal */}
      {reportOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-500/40 p-4 backdrop-blur-sm"
          onClick={() => setReportOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-navy-500">
              Reportar incidencia
            </h3>
            <p className="mt-2 text-sm text-navy-300">
              Describí brevemente qué encontraste en {cert.productName}.
            </p>
            <textarea
              rows={4}
              className="mt-3 w-full resize-none rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
              placeholder="Detalle del problema..."
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReportOpen(false)}
                className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm font-bold text-navy-500 hover:bg-neutral-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.success('Incidencia registrada')
                  setReportOpen(false)
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-error-400 px-5 py-2.5 text-sm font-bold text-white hover:bg-error-300"
              >
                <Flag className="h-3.5 w-3.5" />
                Reportar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Star
  label: string
  value: string
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-navy-300">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 text-sm font-bold text-navy-500">{value}</p>
    </div>
  )
}

function KV({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Globe
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-widest text-navy-300">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-bold text-navy-500">
          {value}
        </p>
      </div>
    </div>
  )
}
