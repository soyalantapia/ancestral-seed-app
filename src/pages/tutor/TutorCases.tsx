import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowUpDown,
  BarChart3,
  ChevronDown,
  Clock,
  MoreHorizontal,
  Plus,
  TriangleAlert,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  STAGE_SLA_DAYS,
  mockTutor,
  mockTutorCases,
} from '@/services/mocks/data'
import type { CaseStage, TutorCase } from '@/types'
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

  const total = cases.length
  const assigned = cases.filter((c) => c.tutorId).length

  // SLA: casos vencidos / por vencer
  const slaAlerts = useMemo(() => {
    const overdue = cases.filter((c) => slaToneForCase(c) === 'red')
    const watch = cases.filter((c) => slaToneForCase(c) === 'yellow')
    return { overdue, watch }
  }, [cases])

  const byStage = useMemo(() => {
    const map = new Map<CaseStage, TutorCase[]>()
    STAGES.forEach((s) => map.set(s.id, []))
    for (const c of cases) {
      map.get(c.stage)?.push(c)
    }
    return map
  }, [cases])

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
          onClick={() => toast.info('Crear solicitud — próximamente')}
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
            onClick={() => toast.info('Filtrando casos con SLA en alerta')}
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

      {/* Kanban */}
      <div className="mt-6 -mx-4 overflow-x-auto pb-4 sm:-mx-6 md:-mx-8">
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
                  <h3 className="text-sm font-bold text-navy-500">
                    {stage.label}
                    <span className="ml-2 text-navy-300">{items.length}</span>
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
    </div>
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
