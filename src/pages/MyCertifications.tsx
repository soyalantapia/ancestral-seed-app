import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  Award,
  Calendar,
  ChevronDown,
  Clock,
  FileText,
  MoreHorizontal,
  PauseCircle,
  Plus,
  Search,
  SlidersHorizontal,
  TrendingUp,
  X,
} from 'lucide-react'
import { mockCertificationRequests } from '@/services/mocks/data'
import { StageStatusBadge } from '@/components/features/StagePipeline'
import { useCertifyFormStore } from '@/store/certifyForm'
import { STAGES } from '@/lib/copy'
import { cn } from '@/lib/utils'

/**
 * Fix SB4 (#POS-11, auditoría UX): antes solo "En curso" y "En emisión".
 * El postulante con certificación EMITIDA no la encontraba acá, y los
 * borradores postergados tampoco aparecían.
 *
 * Ahora 4 tabs cubren todos los estados de vida del journey:
 * - En curso: postulaciones activas con tutor revisando
 * - En emisión: aprobadas, esperando emisión administrativa
 * - Certificadas: con licencia ya otorgada → link a /certificado/[slug]
 * - Postergadas: borradores guardados en el CertifyForm store
 */
const tabs = ['En curso', 'En emisión', 'Certificadas', 'Postergadas'] as const
type Tab = (typeof tabs)[number]

const sortOptions = [
  { id: 'recent', label: 'Más recientes' },
  { id: 'oldest', label: 'Más antiguas' },
  { id: 'name', label: 'Nombre A-Z' },
  { id: 'pending', label: 'Más pendientes' },
] as const
type SortId = (typeof sortOptions)[number]['id']

/**
 * Mapeo tab → status del request. "Certificadas" corresponde al status
 * 'Certificado' del modelo (singular en types/index.ts), "Postergadas"
 * no es un status de request sino del store del CertifyForm.
 */
function statusForTab(tab: Tab): 'En curso' | 'En emisión' | 'Certificado' | null {
  if (tab === 'En curso') return 'En curso'
  if (tab === 'En emisión') return 'En emisión'
  if (tab === 'Certificadas') return 'Certificado'
  return null // Postergadas no tiene status
}

/** Estado del wizard postergado — derivado del store. */
interface PostponedDraft {
  productName: string
  applicantName: string
  step: number
  totalSteps: number
}

export default function MyCertifications() {
  const [tab, setTab] = useState<Tab>('En curso')
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortId>('recent')
  const [sortOpen, setSortOpen] = useState(false)
  const [filterPending, setFilterPending] = useState(false)
  const [filterUpcoming, setFilterUpcoming] = useState(false)

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

  const requests = useMemo(() => {
    const status = statusForTab(tab)
    if (status === null) return [] // Postergadas no usa requests
    let r = mockCertificationRequests.filter((r) => r.status === status)
    if (query) {
      r = r.filter((x) => x.productName.toLowerCase().includes(query.toLowerCase()))
    }
    if (filterPending) {
      r = r.filter((x) => x.pendingItems.length > 0)
    }
    if (filterUpcoming) {
      r = r.filter((x) => x.scheduledMeetings.length > 0)
    }
    // sort
    const sorted = [...r]
    if (sortBy === 'recent') {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else if (sortBy === 'oldest') {
      sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    } else if (sortBy === 'name') {
      sorted.sort((a, b) => a.productName.localeCompare(b.productName))
    } else if (sortBy === 'pending') {
      sorted.sort((a, b) => b.pendingItems.length - a.pendingItems.length)
    }
    return sorted
  }, [tab, query, sortBy, filterPending, filterUpcoming])

  // Conteo por tab — el bottom-counter del chip de la tab muestra la
  // cantidad real de items disponibles en cada tab.
  function countForTab(t: Tab): number {
    const status = statusForTab(t)
    if (status === null) {
      return postponedDraft ? 1 : 0
    }
    return mockCertificationRequests.filter((r) => r.status === status).length
  }

  const activeFiltersCount = (filterPending ? 1 : 0) + (filterUpcoming ? 1 : 0)
  const allRequests = mockCertificationRequests
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
          <div className="relative w-full md:w-64">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar"
              className="h-11 w-full rounded-full border border-neutral-300 bg-white pl-11 pr-4 text-sm text-navy-500 placeholder:text-navy-300 focus:border-gold-500 focus:outline-none"
            />
          </div>
          <Link
            to="/certificar"
            className="inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full bg-gold-500 px-4 text-sm font-semibold text-navy-500 shadow-sm transition-colors hover:bg-gold-400"
          >
            <Plus className="h-4 w-4" />
            Nueva
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => {
            const count = countForTab(t)
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition-colors',
                  tab === t
                    ? 'bg-gold-100 text-gold-700 ring-1 ring-gold-300'
                    : 'text-navy-300 hover:bg-neutral-100 hover:text-navy-500',
                )}
              >
                {t}
                <span
                  className={cn(
                    'inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold',
                    tab === t ? 'bg-gold-500 text-navy-500' : 'bg-neutral-200 text-navy-300',
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Filter + sort */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterPending((v) => !v)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
              filterPending
                ? 'border-gold-500 bg-gold-100 text-gold-700'
                : 'border-neutral-300 bg-white text-navy-500 hover:border-gold-300',
            )}
          >
            <AlertCircle className="h-3.5 w-3.5" />
            Con pendientes
            {filterPending && <X className="h-3 w-3" />}
          </button>
          <button
            type="button"
            onClick={() => setFilterUpcoming((v) => !v)}
            // Fix SM5 (#POS-13): tooltip explica el rango temporal.
            title="Reuniones agendadas en los próximos 7 días"
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
              filterUpcoming
                ? 'border-info-300 bg-info-100 text-info-400'
                : 'border-neutral-300 bg-white text-navy-500 hover:border-info-300',
            )}
          >
            <Calendar className="h-3.5 w-3.5" />
            Con reunión esta semana
            {filterUpcoming && <X className="h-3 w-3" />}
          </button>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setSortOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-navy-500 transition-colors hover:bg-neutral-100"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {sortOptions.find((s) => s.id === sortBy)?.label}
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', sortOpen && 'rotate-180')} />
            </button>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                <ul className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg">
                  {sortOptions.map((o) => (
                    <li key={o.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSortBy(o.id)
                          setSortOpen(false)
                        }}
                        className={cn(
                          'flex w-full items-center px-3 py-2 text-left text-xs font-semibold transition-colors',
                          sortBy === o.id
                            ? 'bg-gold-100 text-gold-700'
                            : 'text-navy-500 hover:bg-neutral-100',
                        )}
                      >
                        {o.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setFilterPending(false)
                setFilterUpcoming(false)
              }}
              className="text-xs font-semibold text-navy-300 hover:text-navy-500"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* List — depende del tab activo */}
      {tab === 'Postergadas' ? (
        postponedDraft ? (
          <ul className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
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
          </ul>
        ) : (
          <div className="mt-10 rounded-3xl border border-dashed border-neutral-300 p-10 text-center">
            <PauseCircle className="mx-auto h-8 w-8 text-navy-300" />
            <p className="mt-3 text-sm font-bold text-navy-500">
              Sin borradores postergados
            </p>
            <p className="mt-1 text-xs text-navy-300">
              Cuando dejes una postulación a medias, va a aparecer acá
              durante 60 días.
            </p>
          </div>
        )
      ) : requests.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-neutral-300 p-10 text-center">
          {tab === 'Certificadas' ? (
            <>
              <Award className="mx-auto h-8 w-8 text-navy-300" />
              <p className="mt-3 text-sm font-bold text-navy-500">
                Todavía no tenés certificaciones emitidas
              </p>
              <p className="mt-1 text-xs text-navy-300">
                Cuando se emita la primera, vas a poder bajar el sello
                oficial y compartirlo desde acá.
              </p>
            </>
          ) : (
            <p className="text-sm text-navy-300">
              No hay resultados para los filtros aplicados.
            </p>
          )}
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          {requests.map((r) => (
            <li
              key={r.id}
              className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <p className="text-base font-bold text-navy-500">
                  {r.productName}
                </p>
                <button type="button" aria-label="Más opciones" className="text-navy-300 hover:text-navy-500">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>

              <dl className="mt-3 space-y-2 text-sm">
                <Row
                  icon={Clock}
                  label="Estado:"
                  value={
                    <StageStatusBadge
                      status={
                        r.status === 'En emisión'
                          ? 'En emisión'
                          : r.status === 'Certificado'
                            ? 'Vigente'
                            : STAGES[r.currentStage]?.label ?? 'En curso'
                      }
                    />
                  }
                />
                <Row icon={TrendingUp} label="Progreso:" value={r.progressLabel} />
                <Row icon={Calendar} label="Fecha de creación:" value={r.createdAt} />
                {r.pendingItems.length > 0 && (
                  <div className="flex items-start gap-2 text-navy-500">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-error-300" />
                    <span className="font-bold">Pendientes:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {r.pendingItems.map((p) => (
                        <span
                          key={p}
                          className="inline-flex items-center rounded-full bg-error-100 px-2 py-0.5 text-xs font-semibold text-error-400 ring-1 ring-error-200"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </dl>

              <div className="mt-5 flex justify-end">
                <Link
                  to={`/mis-certificaciones/${r.id}`}
                  className="inline-flex items-center rounded-full bg-navy-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-navy-400"
                >
                  Ver solicitud
                </Link>
              </div>
            </li>
          ))}
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
