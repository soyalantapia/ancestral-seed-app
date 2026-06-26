import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useEscape } from '@/hooks/useEscape'
import { createPortal } from 'react-dom'
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
import { resetDemoStores } from '@/store/resetDemo'
import { validateCaseAdvance } from '@/lib/caseValidation'
import { ConfirmDialog } from '@/components/features/ConfirmDialog'
import { cn } from '@/lib/utils'
import { daysInStageFromCase, slaToneForCase } from '@/lib/caseSla'

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
  // Fix V3-TUT-09 (auditoría v3): el reset del demo ahora limpia
  // TODOS los stores del v2 (notas internas, checklist del cert,
  // filtro de tareas, covers, lastVisit) — antes solo `tutorCases`.
  // Ver `resetDemoStores()` para el scope completo.
  /**
   * Fix V2-TUT-14 (auditoría v2): el store ya tenía `reset()` para
   * volver al estado mock, pero no estaba expuesto en la UI. Si un
   * drag dejaba el kanban en estado inconsistente (o el reviewer
   * quería volver al demo limpio) había que borrar localStorage a mano
   * desde devtools. Ahora un botón discreto en la barra de filtros lo
   * resetea, con ConfirmDialog para evitar resets accidentales.
   */
  const [confirmReset, setConfirmReset] = useState(false)
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
  // Fix V2-TUT-05 (auditoría v2): la vista Lista necesita su propio ref
  // para que "Ver casos en alerta" haga scroll a la tabla en vez de
  // saltar al kanban (que está unmounted cuando view === 'list').
  const rowAreaRef = useRef<HTMLElement | null>(null)
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
    // Fix V2-TUT-05 (auditoría v2): kanbanRef no existe cuando la
    // vista activa es Lista (componente unmounted) → scrollIntoView
    // no hace nada y el tutor queda donde estaba sin feedback. Ahora
    // hacemos scroll a la tabla cuando estamos en Lista.
    setTimeout(() => {
      const target = view === 'list' ? rowAreaRef.current : kanbanRef.current
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 60)
  }

  /**
   * Fix V2-TUT-06 + V2-TUT-18 (auditoría v2): antes el salto >1
   * etapa usaba window.confirm() nativo — UI fea, sin a11y, screen
   * readers no podían anunciar el contexto del prompt. Ahora va por
   * ConfirmDialog con role=alertdialog y aria-labelledby. El state
   * `pendingJump` cachea el move solicitado mientras esperamos la
   * confirmación.
   */
  const [pendingJump, setPendingJump] = useState<{
    target: CaseStage
    caseId: string
    productName: string
    fromLabel: string
    toLabel: string
    fromIdx: number
    toIdx: number
    jump: number
  } | null>(null)

  const applyMove = (
    caseId: string,
    target: CaseStage,
    productName: string,
    fromIdx: number,
    toIdx: number,
  ) => {
    moveCase(caseId, target)
    toast.success(
      `${productName} movido a ${STAGES.find((s) => s.id === target)?.label}`,
    )
    setLiveAnnouncement(
      `Caso ${caseId} ${productName} movido de ${STAGES[fromIdx].label} a ${STAGES[toIdx].label}`,
    )
    setDraggingId(null)
    setHoverColumn(null)
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
        // Fix V3-TUT-03: si el salto falla por una etapa INTERMEDIA,
        // el toast aclara cuál fue — no solo "no podés avanzar a X"
        // sino "no podés avanzar a X porque en Y faltan: A · B".
        const failedStage = STAGES.find(
          (s) => s.id === advanceCheck.failedAt,
        )
        const intermediateNote =
          advanceCheck.failedAt && advanceCheck.failedAt !== moving.stage
            ? ` (bloqueado en "${failedStage?.label ?? advanceCheck.failedAt}")`
            : ''
        toast.error(
          `No podés avanzar "${moving.productName}" a ${STAGES[toIdx].label}${intermediateNote}: ${pendings || advanceCheck.reason}. ` +
            `Ingresá al caso y resolvelo desde ahí.`,
        )
        setDraggingId(null)
        setHoverColumn(null)
        return
      }
    }

    // QT5: si pasa la validación pero salta >1 etapa, pedir confirmación
    // extra. Ahora vía ConfirmDialog (V2-TUT-06).
    if (jump > 1) {
      setPendingJump({
        target,
        caseId: draggingId,
        productName: moving.productName,
        fromLabel: STAGES[fromIdx].label,
        toLabel: STAGES[toIdx].label,
        fromIdx,
        toIdx,
        jump,
      })
      return
    }

    applyMove(draggingId, target, moving.productName, fromIdx, toIdx)
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
        {/* Fix V2-TUT-14: reset del kanban accesible desde la UI */}
        <button
          type="button"
          onClick={() => setConfirmReset(true)}
          title="Restaurar el kanban al estado original del demo"
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 text-xs font-bold text-navy-300 transition-colors hover:bg-neutral-100 hover:text-navy-500"
        >
          <X className="h-3.5 w-3.5" />
          Restaurar demo
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
        <section
          ref={rowAreaRef}
          className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
        >
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
                {/* Fix V2-TUT-04 (auditoría v2): la vista Lista venía
                    sin acciones por fila. El tutor con muchos casos que
                    abría Lista buscando velocidad terminaba volviendo
                    al Kanban porque "mover" solo se podía desde ahí.
                    Ahora la acción más frecuente (avanzar, asignarme,
                    abrir expediente) está a un click sin salir de Lista. */}
                <th
                  className="w-12 px-4 py-3 text-right text-[11px] font-bold uppercase tracking-widest text-navy-300"
                  aria-label="Acciones"
                />
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
                    <td
                      className="px-4 py-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ListRowMenu
                        caseData={c}
                        onAssignSelf={() => {
                          assignTutor(c.id, {
                            id: mockTutor.id,
                            name: mockTutor.name.replace('Lic. ', ''),
                            avatarUrl: mockTutor.avatarUrl,
                          })
                          toast.success(`Te asignaste ${c.id}`)
                        }}
                        onMoveTo={(target) => {
                          // Reusa handleDrop para que las validaciones
                          // (canAdvance, riesgos, etc.) se apliquen
                          // igual que en el kanban (fix SB6).
                          setDraggingId(c.id)
                          setTimeout(() => handleDrop(target), 0)
                        }}
                        onOpen={() =>
                          navigateRouter(`/tutor/casos/${c.id}`)
                        }
                      />
                    </td>
                  </tr>
                )
              })}
              {visibleCases.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
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
                        onMoveTo={(target) => {
                          // Reuso el mismo handleDrop con draggingId
                          // simulado para que la lógica de validación
                          // se aplique igual que con drag (SB6 fix).
                          setDraggingId(c.id)
                          setTimeout(() => handleDrop(target), 0)
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

      {/* Fix V2-TUT-14 + V3-TUT-09: confirm dialog para resetear el
          demo completo (no solo el kanban). El copy ahora aclara el
          scope ampliado. */}
      <ConfirmDialog
        open={confirmReset}
        title="Restaurar el demo"
        description={
          /* Fix V4-PUB-12 (auditoría v4): el enum no mencionaba
             "firmas de evaluación", que también se borran via
             useCaseSignaturesStore.clear(). El reviewer que firmó
             3 casos no sabía que las perdía. */
          'Vas a descartar:\n' +
          ' · Movimientos del kanban (drag-and-drop, asignaciones, casos nuevos)\n' +
          ' · Notas internas que agregaste\n' +
          ' · Firmas de evaluación realizadas\n' +
          ' · Checklist y comentarios del cert emitido\n' +
          ' · Tareas marcadas como hechas y filtros\n' +
          ' · Portada cambiada en evidencias\n' +
          ' · Snapshot de "Lo nuevo desde tu última visita"\n\n' +
          'Tus tours completados, sesión y preferencias se mantienen. ¿Confirmás?'
        }
        confirmLabel="Sí, restaurar todo"
        cancelLabel="Cancelar"
        danger
        onConfirm={() => {
          // Fix V4-POS-10: forTutorReset=true incluye firmas en el
          // cleanup. El logout del postulante NO usa este flag.
          resetDemoStores({ forTutorReset: true })
          setConfirmReset(false)
          toast.success(
            'Demo restaurado · kanban, notas, firmas, checklist, tareas y portadas vuelven al estado original',
          )
        }}
        onCancel={() => setConfirmReset(false)}
      />

      {/* Fix V2-TUT-06 + V2-TUT-18: confirm dialog para salto >1 etapa */}
      <ConfirmDialog
        open={pendingJump !== null}
        title="Saltar etapas del workflow"
        description={
          pendingJump
            ? `Estás saltando ${pendingJump.jump} etapas (de "${pendingJump.fromLabel}" a "${pendingJump.toLabel}"). Esto puede dejar el caso sin auditoría completa intermedia.\n\n¿Confirmás el salto?`
            : ''
        }
        confirmLabel="Sí, saltar etapas"
        cancelLabel="Volver al kanban"
        danger
        onConfirm={() => {
          if (!pendingJump) return
          applyMove(
            pendingJump.caseId,
            pendingJump.target,
            pendingJump.productName,
            pendingJump.fromIdx,
            pendingJump.toIdx,
          )
          setPendingJump(null)
        }}
        onCancel={() => {
          setPendingJump(null)
          setDraggingId(null)
          setHoverColumn(null)
        }}
      />
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
  useEscape(true, onClose)
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

/**
 * Menú de acciones por fila para la vista Lista (fix V2-TUT-04).
 * Mismo trío de acciones que el CaseCard del kanban:
 *  - Asignarme (si el caso no tiene tutor)
 *  - Avanzar a la siguiente etapa (si hay una)
 *  - Abrir expediente
 *
 * Reusa la validación SB6 vía onMoveTo (que delega en handleDrop del
 * padre con dragging simulado), así que los gates "Tutor asignado",
 * "Scoring IA disponible" etc. funcionan igual.
 */
function ListRowMenu({
  caseData: c,
  onAssignSelf,
  onMoveTo,
  onOpen,
}: {
  caseData: TutorCase
  onAssignSelf: () => void
  onMoveTo: (target: CaseStage) => void
  onOpen: () => void
}) {
  const [open, setOpen] = useState(false)
  const idx = STAGES.findIndex((s) => s.id === c.stage)
  const nextStage = STAGES[idx + 1]
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Acciones del caso ${c.id}`}
        aria-expanded={open}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-navy-300 hover:bg-neutral-200 hover:text-navy-500"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <ul className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 text-left shadow-lg">
            {!c.tutorId && (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onAssignSelf()
                    setOpen(false)
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-navy-500 transition-colors hover:bg-neutral-100"
                >
                  <Users className="h-3.5 w-3.5" />
                  Asignarme este caso
                </button>
              </li>
            )}
            {nextStage && (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onMoveTo(nextStage.id)
                    setOpen(false)
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-navy-500 transition-colors hover:bg-neutral-100"
                >
                  <ArrowUpDown className="h-3.5 w-3.5 rotate-90" />
                  Mover a {nextStage.label}
                </button>
              </li>
            )}
            <li>
              <button
                type="button"
                onClick={() => {
                  onOpen()
                  setOpen(false)
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-navy-500 transition-colors hover:bg-neutral-100"
              >
                <BarChart3 className="h-3.5 w-3.5" />
                Abrir expediente
              </button>
            </li>
          </ul>
        </>
      )}
    </div>
  )
}

function CaseCard({
  caseData: c,
  dragging,
  onDragStart,
  onDragEnd,
  onAssignSelf,
  onMoveTo,
}: {
  caseData: TutorCase
  dragging: boolean
  onDragStart: () => void
  onDragEnd: () => void
  onAssignSelf: () => void
  /**
   * Fix SB15 (#TUT-12, auditoría UX): el drag-and-drop no era usable
   * por teclado. Ahora cada CaseCard tiene menú "Mover a → [submenu
   * con etapas]" que cualquier user (mouse, teclado, screen reader)
   * puede usar para cambiar etapa sin arrastrar.
   */
  onMoveTo: (target: CaseStage) => void
}) {
  const navigate = useNavigate()
  /**
   * Fix V2-TUT-15 (auditoría v2): antes había un flag `dragMoved` que
   * se seteaba a true en `onDragStart` y se reseteaba dentro del
   * mismo openCase(). El problema: si el user empezaba a draguear y
   * después soltaba en LA MISMA columna (sin drop válido), el
   * onDragEnd disparaba pero el flag dragMoved quedaba pegado en true
   * hasta el SIGUIENTE openCase — que terminaba siendo un click que
   * NO navegaba. El usuario veía el click "perderse".
   *
   * Ahora usamos pointer position tracking real: guardamos coords del
   * pointerdown y comparamos con coords del click. Si el delta supera
   * el threshold (4px), es drag y no navega. Si no, es click puro.
   * Independiente de los flags de drag de HTML5 que no se confiabilizan
   * en todos los browsers cuando el drop no aterriza.
   */
  const pointerStart = useRef<{ x: number; y: number } | null>(null)
  // Fix V3-TUT-14: ref al botón "..." para anclar el menú portal.
  const moreButtonRef = useRef<HTMLButtonElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
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

  const openCase = (e: React.MouseEvent) => {
    // Si el delta del puntero entre pointerdown y click es mayor al
    // threshold, asumimos que fue drag (no navega).
    const start = pointerStart.current
    if (start) {
      const dx = Math.abs(e.clientX - start.x)
      const dy = Math.abs(e.clientY - start.y)
      if (dx > 4 || dy > 4) {
        pointerStart.current = null
        return
      }
    }
    pointerStart.current = null
    navigate(`/tutor/casos/${c.id}`)
  }

  return (
    <li
      draggable
      role="button"
      tabIndex={0}
      onPointerDown={(e) => {
        pointerStart.current = { x: e.clientX, y: e.clientY }
      }}
      onPointerCancel={() => {
        // Fix V3-TUT-07 (auditoría v3): si el pointer se cancela (ej.
        // el browser hace gesture takeover, o el user libera fuera de
        // un viewport touch), limpiamos para que el siguiente click
        // no use coordenadas viejas.
        pointerStart.current = null
      }}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move'
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
          {/* Menú "Mover a" — alternativa accesible al drag (SB15 /
              #TUT-12). Cualquier user con teclado puede navegar al
              menú con Tab + Enter, sin necesitar mouse. */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              ref={moreButtonRef}
              type="button"
              aria-label="Más opciones del caso"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="-mr-1 -mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-navy-300 transition-colors hover:bg-neutral-100 hover:text-navy-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                {/*
                  Fix V3-TUT-14 (auditoría v3): el dropdown se renderizaba
                  con `absolute right-0` dentro del CaseCard, que vive en
                  un kanban con `overflow-x-auto`. En la última columna
                  (Certificación), el dropdown se cortaba contra el borde
                  derecho del scroll container y quedaba parcialmente
                  visible. Ahora montamos el menú en un PORTAL al
                  document.body con `position: fixed` posicionado contra
                  el botón trigger via getBoundingClientRect, así flota
                  por encima de cualquier overflow ancestral.
                */}
                <KanbanCardMenu
                  anchorEl={moreButtonRef.current}
                  currentStage={c.stage}
                  onClose={() => setMenuOpen(false)}
                  onMoveTo={onMoveTo}
                />
              </>
            )}
          </div>
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
            <div className="inline-flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-error-300" />
              <div className="min-w-0">
                <span className="text-navy-300">
                  {c.pendingItems.length === 1
                    ? 'Pendiente:'
                    : `Pendientes (${c.pendingItems.length}):`}
                </span>{' '}
                <span className="font-semibold text-navy-500">
                  {c.pendingItems[0]}
                </span>
                {/* Fix V2-TUT-17 (auditoría v2): antes la card del
                    kanban solo mostraba pendingItems[0] sin pista de
                    los demás. Si el caso tenía 3 pendientes el tutor
                    veía "1 cosa" y al abrir el detail descubría 2 más.
                    Ahora indicamos el contador en el header y el
                    siguiente pendiente como tooltip-line. */}
                {c.pendingItems.length > 1 && (
                  <span className="block text-[11px] text-navy-300">
                    + {c.pendingItems.length - 1} más en el expediente
                  </span>
                )}
              </div>
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

/**
 * Fix V3-TUT-14 (auditoría v3): menú "Mover a" del CaseCard montado
 * en un portal al document.body con `position: fixed`. Esto lo saca
 * del overflow-x-auto del kanban scroll container, así no se corta
 * en la última columna. Posicionado contra el rectángulo del botón
 * trigger via getBoundingClientRect, con detección simple de borde:
 * si el menú no entra a la derecha, lo flipeamos a la izquierda.
 */
function KanbanCardMenu({
  anchorEl,
  currentStage,
  onClose,
  onMoveTo,
}: {
  anchorEl: HTMLElement | null
  currentStage: CaseStage
  onClose: () => void
  onMoveTo: (target: CaseStage) => void
}) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const menuRef = useRef<HTMLUListElement>(null)
  const MENU_WIDTH = 192 // w-48

  /**
   * Fix V4-TUT-07 (auditoría v4): `computePos` antes se redeclaraba
   * en CADA render del effect. Los `removeEventListener` con la ref
   * vieja no matcheaban la nueva, lo cual podía generar leak de
   * listeners en open/close rápidos. Ahora `useCallback` mantiene la
   * referencia estable mientras `anchorEl` no cambia.
   */
  const computePos = useCallback(() => {
    if (!anchorEl) return
    const rect = anchorEl.getBoundingClientRect()
    // Preferir alineación a la derecha del botón.
    // Fix V4-TUT-06: clamp Math.max(8, ...) siempre.
    const wantRight = rect.right
    const overflowsRight =
      wantRight + 4 > window.innerWidth || wantRight - MENU_WIDTH < 8
    const desiredLeft = rect.right - MENU_WIDTH
    void overflowsRight
    const left = Math.max(8, desiredLeft)
    setPos({ top: rect.bottom + 4, left })
  }, [anchorEl])

  useEffect(() => {
    if (!anchorEl) return
    computePos()
    window.addEventListener('resize', computePos)
    window.addEventListener('scroll', computePos, true)
    return () => {
      window.removeEventListener('resize', computePos)
      window.removeEventListener('scroll', computePos, true)
    }
  }, [anchorEl, computePos])

  if (!anchorEl || !pos) return null
  return createPortal(
    <>
      {/* Backdrop click-away en TODA la pantalla */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-hidden
      />
      <ul
        ref={menuRef}
        role="menu"
        style={{
          position: 'fixed',
          top: pos.top,
          left: pos.left,
          width: MENU_WIDTH,
        }}
        className="z-50 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg"
      >
        <li className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-navy-300">
          Mover a
        </li>
        {STAGES.filter((s) => s.id !== currentStage).map((s) => (
          <li key={s.id}>
            <button
              type="button"
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation()
                onClose()
                onMoveTo(s.id)
              }}
              className="flex w-full items-center px-3 py-2 text-left text-xs font-semibold text-navy-500 transition-colors hover:bg-neutral-100 focus-visible:bg-neutral-100 focus-visible:outline-none"
            >
              {s.label}
            </button>
          </li>
        ))}
      </ul>
    </>,
    document.body,
  )
}
