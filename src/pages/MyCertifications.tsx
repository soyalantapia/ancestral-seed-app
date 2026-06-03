import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Award,
  Clock,
  FileText,
  PauseCircle,
  Plus,
  Search,
  TrendingUp,
} from 'lucide-react'
import { mockCertificationRequests } from '@/services/mocks/data'
import { StageStatusBadge } from '@/components/features/StagePipeline'
import { useCertifyFormStore } from '@/store/certifyForm'
import { STAGES } from '@/lib/copy'
import { cn } from '@/lib/utils'

/**
 * Decisión de producto (jun-2026): el postulante tiene POCAS certificaciones,
 * así que reemplazamos las 5 tabs de estado + chips de filtro + orden
 * (maquinaria pensada para gestionar decenas de registros, que acá mostraba
 * "0,0,0,0" y agregaba ruido) por UNA sola lista con todo, ordenada "lo activo
 * primero". El estado de cada certificación ya se lee de un vistazo en su badge
 * + barra de progreso. La búsqueda aparece solo cuando hay suficientes ítems.
 *
 * Orden: lo que requiere atención arriba (En curso → En emisión), luego los
 * logros (Certificado) y al final lo cerrado (Denegada). El borrador postergado
 * del CertifyForm, si existe, va primero ("seguí donde lo dejaste").
 */
const STATUS_ORDER: Record<string, number> = {
  'En curso': 0,
  'En emisión': 1,
  Certificado: 2,
  Denegada: 3,
}

/** Estado del wizard postergado — derivado del store. */
interface PostponedDraft {
  productName: string
  applicantName: string
  step: number
  totalSteps: number
}

export default function MyCertifications() {
  const [query, setQuery] = useState('')

  // Borrador del CertifyForm (para tab "Postergadas")
  const formData = useCertifyFormStore((s) => s.data)
  const formStep = useCertifyFormStore((s) => s.step)
  const resetForm = useCertifyFormStore((s) => s.reset)

  const postponedDraft = useMemo<PostponedDraft | null>(() => {
    /**
     * Fix V2-POS-21 (auditoría v2): antes la tab "Postergadas" contaba
     * 1 borrador apenas el user tocaba CUALQUIER campo del CertifyForm,
     * inclusive aceptando un draft "Sin nombre · Borrador sin título"
     * que daba sensación de basura acumulada. Ahora exigimos AL MENOS
     * productName + applicantName con contenido real.
     *
     * Fix V3-POS-21 (auditoría v3): el criterio `productName.length >= 3`
     * excluía nombres legítimamente cortos en lenguas originarias
     * ("Ñe" guaraní, "Ru" mapuche). Ahora aceptamos productName de
     * cualquier longitud >= 1 char + applicantName >= 2 chars (el
     * applicantName puede ser razonablemente >= 2 porque es un nombre
     * de persona completo).
     */
    const productName = formData.productName?.trim() ?? ''
    const applicantName = formData.applicantName?.trim() ?? ''
    const hasRealContent =
      productName.length >= 1 && applicantName.length >= 2
    if (!hasRealContent) return null
    return {
      productName,
      applicantName,
      step: formStep,
      totalSteps: 7,
    }
  }, [formData, formStep])

  const allRequests = mockCertificationRequests

  const requests = useMemo(() => {
    const sorted = [...allRequests].sort((a, b) => {
      const pa = STATUS_ORDER[a.status] ?? 9
      const pb = STATUS_ORDER[b.status] ?? 9
      if (pa !== pb) return pa - pb
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
    const q = query.trim().toLowerCase()
    if (!q) return sorted
    return sorted.filter((x) => x.productName.toLowerCase().includes(q))
  }, [allRequests, query])

  // La búsqueda solo aparece cuando la lista es lo bastante larga como para
  // necesitarla (progressive disclosure); con pocas certificaciones, estorba.
  const showSearch = allRequests.length > 4
  const isEmpty = allRequests.length === 0 && !postponedDraft

  // First-time empty state
  if (isEmpty) {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 sm:py-12 md:px-10 md:py-20">
        <div className="rounded-3xl border border-neutral-200 bg-white p-10 text-center shadow-sm md:p-16">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-100 text-gold-700">
            <FileText className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-navy-500 md:text-[28px]">
            Aún no tenés certificaciones
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-navy-300 md:text-base">
            Empezá tu primer proceso de certificación ancestral. Te guiamos paso a
            paso por el formulario.
          </p>
          <Link
            to="/certificar"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-500 shadow-md transition-colors hover:bg-gold-400"
          >
            <Plus className="h-4 w-4" />
            Iniciar mi primera certificación
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 md:px-10 md:py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-500 md:text-[28px]">
            Mis certificaciones
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-navy-300 md:text-base">
            Revisá el progreso, documentos y estados de tus certificaciones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:w-auto">
          {showSearch && (
            <div className="relative w-full md:w-64">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar"
                className="h-11 w-full rounded-full border border-neutral-300 bg-white pl-11 pr-4 text-sm text-navy-500 placeholder:text-navy-300 focus:border-gold-500 focus:outline-none"
              />
            </div>
          )}
          <Link
            to="/certificar"
            data-tour="cta-nueva-cert"
            className="inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full bg-gold-500 px-4 text-sm font-semibold text-navy-500 shadow-sm transition-colors hover:bg-gold-400"
          >
            <Plus className="h-4 w-4" />
            Nueva
          </Link>
        </div>
      </div>

      {/* Lista única — borrador postergado (si hay) primero, luego las
          certificaciones ordenadas "lo activo primero". Sin tabs ni filtros:
          el estado se lee en el badge + barra de cada card. */}
      {requests.length === 0 && !postponedDraft ? (
        <div className="mt-10 rounded-3xl border border-dashed border-neutral-300 p-10 text-center">
          <p className="text-sm text-navy-300">
            No encontramos certificaciones para «{query}».
          </p>
        </div>
      ) : (
        <ul data-tour="solicitudes-list" className="mt-6 space-y-4">
          {postponedDraft && (
            <li className="rounded-3xl border-2 border-dashed border-gold-300 bg-gold-50/40 p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gold-700">
                    Borrador postergado
                  </p>
                  <p className="mt-1 text-base font-bold text-navy-500">
                    {postponedDraft.productName}
                  </p>
                </div>
                <PauseCircle className="h-6 w-6 shrink-0 text-gold-700" />
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <Row
                  icon={TrendingUp}
                  label="Progreso:"
                  value={`Paso ${postponedDraft.step + 1} de ${postponedDraft.totalSteps}`}
                />
                <Row
                  icon={Clock}
                  label="Guardamos por:"
                  value="60 días desde la última edición"
                />
              </dl>
              <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (
                      confirm(
                        'Vas a borrar el borrador. Esta acción no se puede deshacer.',
                      )
                    ) {
                      resetForm()
                    }
                  }}
                  className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-navy-500 transition-colors hover:bg-neutral-100"
                >
                  Descartar borrador
                </button>
                <Link
                  to="/certificar"
                  className="inline-flex items-center gap-1.5 rounded-full bg-navy-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-navy-400"
                >
                  <Plus className="h-4 w-4" />
                  Retomar
                </Link>
              </div>
            </li>
          )}
          {requests.map((r) => {
            const total = r.stages.length
            const currentIdx = (() => {
              const ip = r.stages.findIndex((s) => s.status === 'in_progress')
              if (ip >= 0) return ip
              const pend = r.stages.findIndex((s) => s.status === 'pending')
              return pend >= 0 ? pend : total - 1
            })()
            const currentLabel =
              r.stages[currentIdx]?.label ??
              STAGES[r.currentStage]?.label ??
              'En curso'
            const badgeStatus =
              r.status === 'En emisión'
                ? 'En emisión'
                : r.status === 'Certificado'
                  ? 'Vigente'
                  : r.status === 'Denegada'
                    ? 'Denegada'
                    : STAGES[r.currentStage]?.label ?? 'En curso'
            const isClosed =
              r.status === 'Certificado' || r.status === 'Denegada'
            const rawThumb = r.evidences?.find((e) => e.thumbUrl)?.thumbUrl
            const thumb = rawThumb
              ? rawThumb.startsWith('http')
                ? rawThumb
                : `${import.meta.env.BASE_URL}${rawThumb.replace(/^\//, '')}`
              : undefined
            const cta =
              r.status === 'Certificado'
                ? 'Ver certificado'
                : r.status === 'Denegada'
                  ? 'Ver y apelar'
                  : r.pendingItems.length > 0
                    ? 'Continuar'
                    : 'Ver solicitud'

            return (
              <li
                key={r.id}
                className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition-all hover:border-navy-200 hover:shadow-md"
              >
                <div className="flex flex-col gap-5 p-5 sm:flex-row sm:gap-6 sm:p-6">
                  {/* Miniatura de la pieza (fallback: patrón ancestral) */}
                  <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-2xl bg-pattern-aztec sm:aspect-square sm:w-36 md:w-44">
                    <span className="absolute inset-0 flex items-center justify-center text-white/50">
                      <Award className="h-8 w-8" strokeWidth={1.5} />
                    </span>
                    {thumb && (
                      <img
                        src={thumb}
                        alt={r.productName}
                        className="absolute inset-0 h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold leading-tight text-navy-500 md:text-xl">
                          {r.productName}
                        </h3>
                        <p className="mt-1 text-xs text-navy-300">
                          {r.number} · Creada {r.createdAt}
                        </p>
                      </div>
                      <StageStatusBadge status={badgeStatus} />
                    </div>

                    {/* Progreso del camino (6 etapas) */}
                    {!isClosed && (
                      <div className="mt-4">
                        <div className="flex items-center gap-1">
                          {r.stages.map((s, i) => (
                            <span
                              key={s.stage}
                              className={cn(
                                'h-1.5 flex-1 rounded-full transition-colors',
                                s.status === 'completed'
                                  ? 'bg-gold-500'
                                  : i === currentIdx
                                    ? 'bg-navy-400'
                                    : 'bg-neutral-200',
                              )}
                            />
                          ))}
                        </div>
                        <p className="mt-2 text-xs text-navy-300">
                          Etapa {currentIdx + 1} de {total} ·{' '}
                          <span className="font-semibold text-navy-500">
                            {currentLabel}
                          </span>
                        </p>
                      </div>
                    )}

                    {/* Próximo paso + CTA */}
                    <div className="mt-4 flex flex-col gap-3 sm:mt-auto sm:flex-row sm:items-end sm:justify-between sm:pt-4">
                      <div className="min-w-0">
                        {r.pendingItems.length > 0 ? (
                          <p className="text-sm leading-relaxed text-navy-500">
                            <span className="font-semibold">Para avanzar:</span>{' '}
                            <span className="text-navy-400">
                              {r.pendingItems.join(' · ')}
                            </span>
                          </p>
                        ) : (
                          <p className="text-sm leading-relaxed text-navy-400">
                            {r.progressLabel}
                          </p>
                        )}
                      </div>
                      <Link
                        to={`/mis-certificaciones/${r.id}`}
                        className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-navy-500 px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-navy-400 sm:w-auto"
                      >
                        {cta}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2 text-navy-500">
      <Icon className="h-4 w-4 shrink-0 text-navy-300" />
      <span className="font-bold">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
