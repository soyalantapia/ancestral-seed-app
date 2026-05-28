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
import { Breadcrumbs } from '@/components/features/Breadcrumbs'
import {
  STAGE_SLA_DAYS,
  mockEvidenceEvaluations,
  mockScoringByCase,
  mockTutor,
} from '@/services/mocks/data'
import type { CaseRisk, CaseStage, TutorCase } from '@/types'
import { useTutorCasesStore } from '@/store/tutorCases'
import { validateCaseAdvance } from '@/lib/caseValidation'
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
  // Cases persistidos en zustand store (key tutor-cases-v1). Antes el
  // useState local hacía que un drag/drop o "Crear solicitud" se
  // perdiera al refrescar/navegar.
  const navigateRouter = useNavigate()
  const cases = useTutorCasesStore((s) => s.cases)
  const moveCase = useTutorCasesStore((s) => s.moveCase)
  const addCase = useTutorCasesStore((s) => s.addCase)
  const assignTutor = useTutorCasesStore((s) => s.assignTutor)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [hoverColumn, setHoverColumn] = useState<CaseStage | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [slaFilter, setSlaFilter] = useState<'all' | 'alerts'>('all')
  // QT8: filtros adicionales de kanban — riesgo + sin asignar
  const [riskFilter, setRiskFilter] = useState<'all' | CaseRisk>('all')
  const [unassignedOnly, setUnassignedOnly] = useState(false)
  // QT6: anuncio a screen readers cuando se mueve un caso
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('')
  const kanbanRef = useRef<HTMLDivElement | null>(null)
  /**
   * Fix SB14 (#TUT-09, auditoría UX): el kanban de 7 columnas no entra
   * en pantalla 13" — el tutor tenía que scrollear horizontalmente para
   * ver el final del pipeline. Ahora un toggle deja elegir Kanban o
   * Lista. Persiste en localStorage (clave v1).
   */
  const [view, setView] = useState<'kanban' | 'list'>(() => {
    if (typeof window === 'undefined') return 'kanban'
    return (
      (localStorage.getItem('ancestral-seed:tutor-cases-view') as
        | 'kanban'
        | 'list') ?? 'kanban'
    )
  })
  function setViewPersist(v: 'kanban' | 'list') {
    setView(v)
    localStorage.setItem('ancestral-seed:tutor-cases-view', v)
  }

  const total = cases.length
  const assigned = cases.filter((c) => c.tutorId).length

  // SLA: casos vencidos / por vencer
  const slaAlerts = useMemo(() => {
    const overdue = cases.filter((c) => slaToneForCase(c) === 'red')
    const watch = cases.filter((c) => slaToneForCase(c) === 'yellow')
    return { overdue, watch }
  }, [cases])

  // Vista filtrada — aplica todos los filtros activos en cascada
  const visibleCases = useMemo(() => {
    let result = cases
    if (slaFilter === 'alerts') {
      result = result.filter((c) => slaToneForCase(c) !== 'green')
    }
    if (riskFilter !== 'all') {
      result = result.filter((c) => c.risk === riskFilter)
    }
    if (unassignedOnly) {
      result = result.filter((c) => !c.tutorId)
    }
    return result
  }, [cases, slaFilter, riskFilter, unassignedOnly])

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
    addCase(newCase)
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

    const fromIdx = STAGES.findIndex((s) => s.id === moving.stage)
    const toIdx = STAGES.findIndex((s) => s.id === target)
    const jump = toIdx - fromIdx
    const isBackwards = jump < 0

    /**
     * Fix SB6 (#TUT-08, auditoría UX): el drag-and-drop saltaba las
     * mismas validaciones que el botón "Avanzar etapa" del expediente.
     * Eso dejaba 2 workflows incompatibles: el formal con checklist
     * (computeCanAdvance) y el informal con drag. Para el tutor con
     * prisa, el atajo siempre ganaba.
     *
     * Ahora aplicamos el mismo `computeCanAdvance()` antes de mover.
     * Si no cumple, mostramos toast.error con los requirements
     * pendientes. Retroceder (jump<0) sigue OK sin validar — es
     * corrección de errores, no avance.
     */
    if (!isBackwards) {
      const advanceCheck = validateCaseAdvance(moving, target, {
        evidenceEvals: mockEvidenceEvaluations[moving.id] ?? [],
        scoringValues: mockScoringByCase[moving.id] ?? [],
      })
      if (!advanceCheck.ok) {
        const pendings = advanceCheck.requirements
          .filter((r) => !r.done)
          .map((r) => r.label)
          .join(' · ')
        toast.error(
          `No podés avanzar "${moving.productName}" a ${STAGES[toIdx].label}: ${pendings || advanceCheck.reason}. ` +
            `Ingresá al caso y resolvelo desde ahí.`,
        )
        setDraggingId(null)
        setHoverColumn(null)
        return
      }
    }

    // QT5: si pasa la validación pero salta >1 etapa, pedir confirmación
    // extra (puede ser intencional pero requiere segundo OK).
    if (jump > 1) {
      const ok = window.confirm(
        `Estás saltando ${jump} etapas (de "${STAGES[fromIdx].label}" a "${STAGES[toIdx].label}"). ` +
          `Esto puede dejar el caso sin auditoría completa. ¿Continuar?`,
      )
      if (!ok) {
        setDraggingId(null)
        setHoverColumn(null)
        return
      }
    }

    moveCase(draggingId, target)
    toast.success(
      `${moving.productName} movido a ${STAGES.find((s) => s.id === target)?.label}`,
    )

    // QT6: anunciar el movimiento para screen readers
    setLiveAnnouncement(
      `Caso ${moving.id} ${moving.productName} movido de ${STAGES[fromIdx].label} a ${STAGES[toIdx].label}`,
    )

    setDraggingId(null)
    setHoverColumn(null)
  }

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <Breadcrumbs
        items={[
          { label: 'Tutor', to: '/tutor/dashboard' },
          { label: 'Casos' },
        ]}
        className="mb-4"
      />
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

        <div className="flex items-center gap-2">
          {/* SB14: toggle vista */}
          <div className="inline-flex h-11 items-center rounded-full bg-neutral-200 p-1">
            <button
              type="button"
              onClick={() => setViewPersist('kanban')}
              className={cn(
                'rounded-full px-3 text-xs font-bold transition-colors',
                view === 'kanban'
                  ? 'bg-white text-navy-500 shadow-sm'
                  : 'text-navy-300',
              )}
            >
              Kanban
            </button>
            <button
              type="button"
              onClick={() => setViewPersist('list')}
              className={cn(
                'rounded-full px-3 text-xs font-bold transition-colors',
                view === 'list'
                  ? 'bg-white text-navy-500 shadow-sm'
                  : 'text-navy-300',
              )}
            >
              Lista
            </button>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-gold-500 px-5 text-sm font-bold text-navy-500 shadow-sm transition-colors hover:bg-gold-400"
          >
            <Plus className="h-4 w-4" />
            Crear solicitud
          </button>
        </div>
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

      {/* Filters — QT8 funcionales (riesgo + sin asignar). Los pills sin
          onClick son placeholders esperando spec del producto. */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterPill label="Tutor" />
        <FilterPill label="Solicitante" />
        {/* Filtro Riesgo funcional: toggle entre all → alto → medio → bajo → all */}
        <button
          type="button"
          onClick={() => {
            const order: Array<'all' | CaseRisk> = ['all', 'alto', 'medio', 'bajo']
            const i = order.indexOf(riskFilter)
            setRiskFilter(order[(i + 1) % order.length])
          }}
          className={cn(
            'inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-bold transition-colors',
            riskFilter === 'all'
              ? 'border-neutral-300 bg-white text-navy-500 hover:bg-neutral-100'
              : 'border-warning-300 bg-warning-100 text-warning-400',
          )}
        >
          Riesgo: {riskFilter === 'all' ? 'todos' : riskFilter}
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        {/* Filtro Sin asignar (toggle) */}
        <button
          type="button"
          onClick={() => setUnassignedOnly((v) => !v)}
          aria-pressed={unassignedOnly}
          className={cn(
            'inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-bold transition-colors',
            unassignedOnly
              ? 'border-navy-500 bg-navy-500 text-white'
              : 'border-neutral-300 bg-white text-navy-500 hover:bg-neutral-100',
          )}
        >
          Sin asignar
        </button>
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

      {/* QT6: anuncio aria-live para screen readers cuando un caso se
          mueve de columna. visualmente invisible, accesible a NVDA/JAWS. */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {liveAnnouncement}
      </div>

      {/* Vista lista — Fix SB14 (#TUT-09) */}
      {view === 'list' && (
        <section className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-100">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-navy-300">
                  Caso
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-navy-300">
                  Etapa
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-navy-300">
                  Solicitante
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-navy-300">
                  Riesgo
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-navy-300">
                  Días en etapa
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-widest text-navy-300">
                  Scoring IA
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {visibleCases.map((c) => {
                const stageMeta = STAGES.find((s) => s.id === c.stage)
                const days = daysInStageFromCase(c)
                const overdue = days > STAGE_SLA_DAYS[c.stage]
                return (
                  <tr
                    key={c.id}
                    onClick={() => navigateRouter(`/tutor/casos/${c.id}`)}
                    className="cursor-pointer transition-colors hover:bg-neutral-50"
                  >
                    <td className="px-4 py-3">
                      <p className="text-xs font-bold text-navy-300">
                        {c.id}
                      </p>
                      <p className="font-bold text-navy-500">
                        {c.productName}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-navy-500">
                      {stageMeta?.label}
                    </td>
                    <td className="px-4 py-3 text-xs text-navy-500">
                      {c.applicantName}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest',
                          c.risk === 'alto' && 'bg-error-100 text-error-400',
                          c.risk === 'medio' &&
                            'bg-warning-100 text-warning-400',
                          c.risk === 'bajo' && 'bg-success-100 text-success-300',
                        )}
                      >
                        {c.risk}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span
                        className={cn(
                          'tabular-nums',
                          overdue
                            ? 'font-bold text-error-400'
                            : 'text-navy-500',
                        )}
                      >
                        {days}d / {STAGE_SLA_DAYS[c.stage]}d
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold tabular-nums text-navy-500">
                        {c.scoringIA > 0
                          ? `${c.scoringIA}/100`
                          : 'Pendiente'}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {visibleCases.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-sm text-navy-300"
                  >
                    No hay casos con los filtros actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}

      {/* Kanban */}
      {view === 'kanban' && (
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
                          assignTutor(c.id, {
                            id: mockTutor.id,
                            name: mockTutor.name.replace('Lic. ', ''),
                            avatarUrl: mockTutor.avatarUrl,
                          })
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
      )}

      {view === 'kanban' && (
        <p className="mt-4 text-center text-[11px] text-navy-300">
          Arrastrá una card entre columnas para cambiar su etapa
        </p>
      )}

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

/**
 * Pill de filtro placeholder — todavía sin lógica conectada.
 *
 * Fix QW-C2 (auditoría UX): antes estos pills se veían idénticos a los
 * funcionales (Riesgo, Sin asignar), lo que confundía: el tutor
 * clickeaba y nada pasaba. Ahora con opacity-60 + cursor not-allowed +
 * tooltip "Próximamente" se ve a la legua qué está disponible y qué
 * no, sin necesitar leer release notes.
 *
 * Cuando se implemente la lógica de cada filtro, sacar `disabled` y
 * reemplazar el title por la descripción del filtro.
 */
function FilterPill({ label }: { label: string }) {
  return (
    <button
      type="button"
      disabled
      title="Próximamente"
      aria-label={`${label} (próximamente)`}
      className="inline-flex h-9 cursor-not-allowed items-center gap-1.5 rounded-full border border-dashed border-neutral-300 bg-white/70 px-3 text-xs font-bold text-navy-300 opacity-60"
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
            {/* Fix QW-A7 (auditoría UX): caso recién creado tenía
                scoringIA=0 y mostrábamos "0/100" como si fuera un
                veredicto negativo. Ahora distinguimos "todavía no se
                evaluó" de "evaluado bajo". */}
            <span
              className={
                c.scoringIA > 0
                  ? 'font-semibold text-navy-500'
                  : 'font-medium italic text-navy-300'
              }
            >
              {c.scoringIA > 0 ? `${c.scoringIA}/100` : 'Pendiente IA'}
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
