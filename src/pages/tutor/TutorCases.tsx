import { useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowUpDown,
  BarChart3,
  ChevronDown,
  Clock,
  Filter,
  MoreHorizontal,
  Plus,
  TriangleAlert,
  Users,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  STAGE_SLA_DAYS,
  mockTutor,
  mockTutorCases,
} from '@/services/mocks/data'
import type { CaseRisk, CaseStage, TutorCase } from '@/types'
import { cn } from '@/lib/utils'

function daysInStageFromCase(c: TutorCase): number {
  return Math.floor((Date.now() - new Date(c.createdAt).getTime()) / 86_400_000)
}

function slaToneForCase(c: TutorCase): 'red' | 'yellow' | 'green' {
  const sla = STAGE_SLA_DAYS[c.stage] ?? 14
  const days = daysInStageFromCase(c)
  if (days > sla) return 'red'
  if (days > sla * 0.7) return 'yellow'
  return 'green'
}

const STAGES: Array<{ id: CaseStage; label: string }> = [
  { id: 'postulado', label: 'Postulados' },
  { id: 'revision-inicial', label: 'Revisión inicial' },
  { id: 'elegible', label: 'Elegible' },
  { id: 'diagnostico', label: 'Diagnóstico' },
  { id: 'auditoria', label: 'Auditoría' },
  { id: 'evaluacion', label: 'Evaluación' },
  { id: 'certificacion', label: 'Certificación' },
]

export default function TutorCases() {
  const [cases, setCases] = useState<TutorCase[]>(mockTutorCases)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [hoverColumn, setHoverColumn] = useState<CaseStage | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [slaFilter, setSlaFilter] = useState<'all' | 'alerts'>('all')
  const kanbanRef = useRef<HTMLDivElement | null>(null)

  const total = cases.length
  const assigned = cases.filter((c) => c.tutorId).length

  // SLA: casos vencidos / por vencer
  const slaAlerts = useMemo(() => {
    const overdue = cases.filter((c) => slaToneForCase(c) === 'red')
    const watch = cases.filter((c) => slaToneForCase(c) === 'yellow')
    return { overdue, watch }
  }, [cases])

  // Vista filtrada según el filtro SLA
  const visibleCases = useMemo(() => {
    if (slaFilter === 'alerts') {
      return cases.filter((c) => slaToneForCase(c) !== 'green')
    }
    return cases
  }, [cases, slaFilter])

  const byStage = useMemo(() => {
    const map = new Map<CaseStage, TutorCase[]>()
    STAGES.forEach((s) => map.set(s.id, []))
    for (const c of visibleCases) {
      map.get(c.stage)?.push(c)
    }
    return map
  }, [visibleCases])

  const handleCreateCase = (data: {
    productName: string
    applicantName: string
    country: string
    region: string
    category: string
    risk: CaseRisk
    pending?: string
  }) => {
    const nextId = `CE-${String(200 + cases.length).padStart(3, '0')}`
    const newCase: TutorCase = {
      id: nextId,
      productName: data.productName,
      applicantName: data.applicantName,
      scoringIA: 0,
      risk: data.risk,
      pendingItems: data.pending ? [data.pending] : ['Completar postulación'],
      stage: 'postulado',
      category: data.category,
      country: data.country,
      region: data.region,
      createdAt: new Date().toISOString(),
    }
    setCases((prev) => [newCase, ...prev])
    setCreateOpen(false)
    toast.success(`Solicitud ${nextId} creada en Postulados`)
  }

  const handleViewAlerts = () => {
    setSlaFilter('alerts')
    toast.success('Mostrando solo casos con SLA en alerta')
    setTimeout(() => {
      kanbanRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 60)
  }

  const handleDrop = (target: CaseStage) => {
    if (!draggingId) return
    const moving = cases.find((c) => c.id === draggingId)
    if (!moving || moving.stage === target) {
      setDraggingId(null)
      setHoverColumn(null)
      return
    }
    setCases((prev) =>
      prev.map((c) => (c.id === draggingId ? { ...c, stage: target } : c)),
    )
    toast.success(
      `${moving.productName} movido a ${STAGES.find((s) => s.id === target)?.label}`,
    )
    setDraggingId(null)
    setHoverColumn(null)
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-500 md:text-[28px]">
            Casos
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-navy-300 md:text-base">
            Visualiza, prioriza y gestiona los casos a lo largo del proceso de
            certificación.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-navy-500">
            <span className="inline-flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-navy-300" />
              <span className="text-navy-300">Total casos:</span>
              <span className="font-bold">{total}</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <Users className="h-4 w-4 text-navy-300" />
              <span className="text-navy-300">Casos asignados:</span>
              <span className="font-bold">{assigned}</span>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-gold-500 px-5 text-sm font-bold text-navy-500 shadow-sm transition-colors hover:bg-gold-400"
        >
          <Plus className="h-4 w-4" />
          Crear solicitud
        </button>
      </header>

      <hr className="my-6 border-neutral-200" />

      {/* SLA alerts banner */}
      {(slaAlerts.overdue.length > 0 || slaAlerts.watch.length > 0) && (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border-2 border-warning-300/60 bg-warning-100/60 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning-300 text-white">
            <TriangleAlert className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-navy-500">
              SLA en alerta
            </p>
            <p className="mt-0.5 text-xs text-navy-500/80">
              {slaAlerts.overdue.length > 0 && (
                <>
                  <span className="font-bold text-error-400">
                    {slaAlerts.overdue.length}{' '}
                    {slaAlerts.overdue.length === 1 ? 'caso vencido' : 'casos vencidos'}
                  </span>
                  {slaAlerts.watch.length > 0 && ' · '}
                </>
              )}
              {slaAlerts.watch.length > 0 && (
                <span className="font-semibold text-warning-400">
                  {slaAlerts.watch.length}{' '}
                  {slaAlerts.watch.length === 1 ? 'cerca del límite' : 'cerca del límite'}
                </span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={handleViewAlerts}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-navy-500 px-4 text-xs font-bold text-white transition-colors hover:bg-navy-400"
          >
            Ver casos en alerta
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterPill label="Tutor" />
        <FilterPill label="Solicitante" />
        <FilterPill label="Riesgo" />
        <FilterPill label="Pendientes" />
        <FilterPill label="Certificación" />
        <button
          type="button"
          className="ml-auto inline-flex h-9 items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 text-xs font-bold text-navy-500 transition-colors hover:bg-neutral-100"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          Ordenar por
        </button>
      </div>

      {/* Filtro SLA activo */}
      {slaFilter === 'alerts' && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-warning-300/60 bg-warning-100/30 p-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning-300/30 text-warning-400">
            <Filter className="h-4 w-4" />
          </span>
          <p className="flex-1 text-xs text-navy-500">
            <span className="font-bold">Filtro activo:</span> mostrando solo
            casos con SLA en alerta ({visibleCases.length}/{total}).
          </p>
          <button
            type="button"
            onClick={() => setSlaFilter('all')}
            className="inline-flex h-8 items-center gap-1 rounded-full border border-neutral-300 bg-white px-3 text-[11px] font-bold text-navy-500 hover:bg-neutral-100"
          >
            <X className="h-3 w-3" />
            Quitar filtro
          </button>
        </div>
      )}

      {/* Kanban */}
      <div
        ref={kanbanRef}
        data-tour="kanban-board"
        className="mt-6 -mx-4 overflow-x-auto pb-4 sm:-mx-6 md:-mx-8"
      >
        <div className="flex gap-4 px-4 sm:px-6 md:px-8" style={{ minWidth: 'max-content' }}>
          {STAGES.map((stage) => {
            const items = byStage.get(stage.id) ?? []
            const isHover = hoverColumn === stage.id
            return (
              <div
                key={stage.id}
                onDragOver={(e) => {
                  e.preventDefault()
                  setHoverColumn(stage.id)
                }}
                onDragLeave={() => {
                  if (hoverColumn === stage.id) setHoverColumn(null)
                }}
                onDrop={() => handleDrop(stage.id)}
                className={cn(
                  'w-[280px] shrink-0 rounded-3xl border-2 p-3 transition-colors',
                  isHover
                    ? 'border-gold-500 bg-gold-100/40'
                    : 'border-transparent bg-neutral-100',
                )}
              >
                <div className="flex items-center justify-between px-2 pb-3">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-navy-500">
                    <span>{stage.label}</span>
                    <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-bold text-navy-500 ring-1 ring-neutral-200">
                      {items.length}
                    </span>
                  </h3>
                </div>
                <ul className="flex flex-col gap-3">
                  {items.length === 0 ? (
                    <li className="rounded-2xl border border-dashed border-neutral-300 bg-white p-4 text-center">
                      <p className="text-xs text-navy-300">
                        No hay casos en esta etapa
                      </p>
                    </li>
                  ) : (
                    items.map((c) => (
                      <CaseCard
                        key={c.id}
                        caseData={c}
                        dragging={draggingId === c.id}
                        onDragStart={() => setDraggingId(c.id)}
                        onDragEnd={() => {
                          setDraggingId(null)
                          setHoverColumn(null)
                        }}
                        onAssignSelf={() => {
                          setCases((prev) =>
                            prev.map((x) =>
                              x.id === c.id
                                ? {
                                    ...x,
                                    tutorId: mockTutor.id,
                                    tutorName: mockTutor.name.replace(
                                      'Lic. ',
                                      '',
                                    ),
                                    tutorAvatarUrl: mockTutor.avatarUrl,
                                  }
                                : x,
                            ),
                          )
                          toast.success('Te asignaste el caso')
                        }}
                      />
                    ))
                  )}
                </ul>
              </div>
            )
          })}
        </div>
      </div>

      <p className="mt-4 text-center text-[11px] text-navy-300">
        💡 Arrastrá una card entre columnas para cambiar su etapa
      </p>

      {createOpen && (
        <CreateCaseModal
          onClose={() => setCreateOpen(false)}
          onCreate={handleCreateCase}
        />
      )}
    </div>
  )
}

function CreateCaseModal({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (data: {
    productName: string
    applicantName: string
    country: string
    region: string
    category: string
    risk: CaseRisk
    pending?: string
  }) => void
}) {
  const [productName, setProductName] = useState('')
  const [applicantName, setApplicantName] = useState('')
  const [country, setCountry] = useState('Argentina')
  const [region, setRegion] = useState('')
  const [category, setCategory] = useState('Textil')
  const [risk, setRisk] = useState<CaseRisk>('medio')
  const [pending, setPending] = useState('')

  const canSubmit =
    productName.trim().length > 0 && applicantName.trim().length > 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-500/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-500 text-navy-500">
              <Plus className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-navy-500">
                Crear solicitud
              </h3>
              <p className="text-xs text-navy-300">
                La solicitud queda en etapa{' '}
                <strong className="text-navy-500">Postulados</strong>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-navy-300 hover:bg-neutral-100"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          <Field label="Nombre del producto / oficio *">
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Ej: Cerámica negra de Mata Ortiz"
              className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
            />
          </Field>

          <Field label="Postulante (comunidad o autor) *">
            <input
              type="text"
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
              placeholder="Ej: María Elena Quezada"
              className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="País">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
              >
                <option>Argentina</option>
                <option>Bolivia</option>
                <option>Chile</option>
                <option>Colombia</option>
                <option>Ecuador</option>
                <option>México</option>
                <option>Paraguay</option>
                <option>Perú</option>
                <option>Uruguay</option>
              </select>
            </Field>
            <Field label="Región">
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="Ej: Salta"
                className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Categoría">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
              >
                <option>Textil</option>
                <option>Cerámica</option>
                <option>Joyería</option>
                <option>Madera</option>
                <option>Cuero</option>
                <option>Gastronomía</option>
                <option>Música</option>
                <option>Otro</option>
              </select>
            </Field>
            <Field label="Riesgo estimado">
              <select
                value={risk}
                onChange={(e) => setRisk(e.target.value as CaseRisk)}
                className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
              >
                <option value="bajo">Bajo</option>
                <option value="medio">Medio</option>
                <option value="alto">Alto</option>
              </select>
            </Field>
          </div>

          <Field label="Primer pendiente (opcional)">
            <input
              type="text"
              value={pending}
              onChange={(e) => setPending(e.target.value)}
              placeholder="Ej: Subir documentación de origen"
              className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
            />
          </Field>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm font-bold text-navy-500 hover:bg-neutral-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() =>
              onCreate({
                productName: productName.trim(),
                applicantName: applicantName.trim(),
                country,
                region: region.trim() || '—',
                category,
                risk,
                pending: pending.trim() || undefined,
              })
            }
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-bold text-navy-500 shadow-sm hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            Crear solicitud
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-navy-500">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}

function FilterPill({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 text-xs font-bold text-navy-500 transition-colors hover:bg-neutral-100"
    >
      {label}
      <ChevronDown className="h-3.5 w-3.5 text-navy-300" />
    </button>
  )
}

function CaseCard({
  caseData: c,
  dragging,
  onDragStart,
  onDragEnd,
  onAssignSelf,
}: {
  caseData: TutorCase
  dragging: boolean
  onDragStart: () => void
  onDragEnd: () => void
  onAssignSelf: () => void
}) {
  const navigate = useNavigate()
  // Distinguir entre click y drag: si el puntero se movió >5px durante mousedown,
  // es drag (no navegamos). Si no se movió, es click.
  const [dragMoved, setDragMoved] = useState(false)
  const riskStyle =
    c.risk === 'alto'
      ? 'border-error-300 text-error-400'
      : c.risk === 'medio'
        ? 'border-warning-300 text-warning-400'
        : 'border-success-300 text-success-300'
  const riskLabel =
    c.risk === 'alto'
      ? 'Riesgo alto'
      : c.risk === 'medio'
        ? 'Riesgo medio'
        : 'Riesgo bajo'
  const slaTone = slaToneForCase(c)
  const days = daysInStageFromCase(c)
  const sla = STAGE_SLA_DAYS[c.stage] ?? 14

  const openCase = () => {
    if (dragMoved) {
      setDragMoved(false)
      return
    }
    navigate(`/tutor/casos/${c.id}`)
  }

  return (
    <li
      draggable
      role="button"
      tabIndex={0}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move'
        setDragMoved(true)
        onDragStart()
      }}
      onDragEnd={onDragEnd}
      onClick={openCase}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          navigate(`/tutor/casos/${c.id}`)
        }
      }}
      className={cn(
        'group cursor-pointer rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all hover:border-gold-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500',
        dragging && 'opacity-50 ring-2 ring-gold-500',
      )}
    >
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 text-sm font-bold text-navy-500">
            {c.productName}
          </p>
          <button
            type="button"
            aria-label="Más opciones"
            className="text-navy-300 hover:text-navy-500"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex flex-col gap-1.5 text-xs text-navy-300">
          <div className="inline-flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-navy-300" />
            <span className="text-navy-300">Solicitante:</span>
            <span className="truncate font-semibold text-navy-500">
              {c.applicantName}
            </span>
          </div>
          <div className="inline-flex items-center gap-2">
            <BarChart3 className="h-3.5 w-3.5 text-navy-300" />
            <span className="text-navy-300">Scoring IA:</span>
            <span className="font-semibold text-navy-500">
              {c.scoringIA}/100
            </span>
          </div>
          {c.pendingItems.length > 0 && (
            <div className="inline-flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5 text-error-300" />
              <span className="text-navy-300">Pendiente:</span>
              <span className="font-semibold text-navy-500">
                {c.pendingItems[0]}
              </span>
            </div>
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              'inline-flex rounded-full border bg-white px-2.5 py-0.5 text-[10px] font-bold',
              riskStyle,
            )}
          >
            {riskLabel}
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold',
              slaTone === 'red'
                ? 'bg-error-100 text-error-400 ring-1 ring-error-300/40'
                : slaTone === 'yellow'
                  ? 'bg-warning-100 text-warning-400 ring-1 ring-warning-300/40'
                  : 'bg-success-100 text-success-300 ring-1 ring-success-300/30',
            )}
            title={`SLA de la etapa: ${sla} días`}
          >
            <Clock className="h-3 w-3" />
            {days}d / {sla}d
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-neutral-200 px-4 py-3">
        {c.tutorId ? (
          <span className="inline-flex items-center gap-1.5">
            <img
              src={c.tutorAvatarUrl ?? 'https://i.pravatar.cc/100?img=15'}
              alt=""
              className="h-6 w-6 rounded-full object-cover"
            />
            <span className="text-[11px] font-semibold text-navy-500">
              {c.tutorName ?? '—'}
            </span>
          </span>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onAssignSelf()
            }}
            className="inline-flex h-8 items-center rounded-full border border-neutral-300 bg-white px-3 text-[11px] font-bold text-navy-500 transition-colors hover:bg-neutral-100"
          >
            Asignar tutor
          </button>
        )}
        <Link
          to={`/tutor/casos/${c.id}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex h-8 items-center rounded-full bg-navy-500 px-3 text-[11px] font-bold text-white transition-colors hover:bg-navy-400"
        >
          Ver caso
        </Link>
      </div>
    </li>
  )
}
