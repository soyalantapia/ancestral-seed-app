import { useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileCheck2,
  FileText,
  Lightbulb,
  MessageSquare,
  Phone,
  Pin,
  Plus,
  Send,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Video,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  MESSAGE_TEMPLATES,
  SCORING_CRITERIA,
  categoryFromScore,
  STAGE_SLA_DAYS,
  mockEvidenceEvaluations,
  mockScoringByCase,
  mockTutorCases,
} from '@/services/mocks/data'
import type {
  CaseStage,
  EvidenceVerdict,
  ScoringDimension,
  ScoringValue,
  TutorCase,
} from '@/types'
import { cn } from '@/lib/utils'

const STAGE_LABEL: Record<CaseStage, string> = {
  postulado: 'Postulado',
  'revision-inicial': 'Revisión inicial',
  elegible: 'Elegible',
  diagnostico: 'Diagnóstico',
  auditoria: 'Auditoría',
  evaluacion: 'Evaluación',
  certificacion: 'Certificación',
}

const STAGE_ORDER: CaseStage[] = [
  'postulado',
  'revision-inicial',
  'elegible',
  'diagnostico',
  'auditoria',
  'evaluacion',
  'certificacion',
]

type Tab = 'resumen' | 'evidencias' | 'evaluacion' | 'mensajes' | 'historial'

const TABS: Array<{ id: Tab; label: string; icon: typeof FileText }> = [
  { id: 'resumen', label: 'Resumen', icon: FileText },
  { id: 'evidencias', label: 'Evidencias', icon: FileCheck2 },
  { id: 'evaluacion', label: 'Evaluación', icon: Star },
  { id: 'mensajes', label: 'Mensajes', icon: MessageSquare },
  { id: 'historial', label: 'Historial', icon: Clock },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysBetween(from: string, to: Date = new Date()) {
  const d = new Date(from)
  return Math.floor((to.getTime() - d.getTime()) / 86_400_000)
}

function urgencyOfStage(stage: CaseStage, daysInStage: number) {
  const sla = STAGE_SLA_DAYS[stage] ?? 14
  if (daysInStage > sla) return 'red'
  if (daysInStage > sla * 0.7) return 'yellow'
  return 'green'
}

function computeWeightedScore(values: ScoringValue[]): number {
  if (values.length === 0) return 0
  let total = 0
  let weights = 0
  for (const v of values) {
    const def = SCORING_CRITERIA.find((c) => c.id === v.criterionId)
    if (!def) continue
    total += v.score * def.weight
    weights += def.weight
  }
  return weights === 0 ? 0 : Math.round((total / weights) * 10)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TutorCaseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  // En prod, esto vendría de una API. Acá uso mock + state local.
  const initialCase = mockTutorCases.find((c) => c.id === id)
  const [caseData, setCaseData] = useState<TutorCase | undefined>(initialCase)
  const [tab, setTab] = useState<Tab>('resumen')

  // Stage advance modal
  const [stageModalOpen, setStageModalOpen] = useState(false)

  // Quick action modals
  const [openTemplateModal, setOpenTemplateModal] = useState(false)
  const [openMeetingModal, setOpenMeetingModal] = useState(false)

  if (!caseData) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <p className="text-sm font-bold text-navy-500">Caso no encontrado</p>
        <Link
          to="/tutor/casos"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-navy-500 px-5 py-2.5 text-sm font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al kanban
        </Link>
      </div>
    )
  }

  const daysInStage = daysBetween(caseData.createdAt)
  const stageTone = urgencyOfStage(caseData.stage, daysInStage)
  const scoringValues = mockScoringByCase[caseData.id] ?? []
  const finalScore = computeWeightedScore(scoringValues)
  const evidenceEvals = mockEvidenceEvaluations[caseData.id] ?? []
  const evidencesApproved = evidenceEvals.filter((e) => e.verdict === 'approved').length
  const evidencesTotal = evidenceEvals.length

  // Workflow: requirements per stage to advance
  const canAdvance = computeCanAdvance(caseData, evidenceEvals, scoringValues)

  const handleAdvanceStage = (reason: string) => {
    const idx = STAGE_ORDER.indexOf(caseData.stage)
    const next = STAGE_ORDER[idx + 1]
    if (!next) {
      toast.success('El caso ya está en la etapa final.')
      return
    }
    setCaseData({ ...caseData, stage: next })
    setStageModalOpen(false)
    toast.success(
      `Avanzado a ${STAGE_LABEL[next]}. Motivo: ${reason.slice(0, 40)}…`,
    )
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 md:px-8 md:py-8">
      {/* Breadcrumb */}
      <button
        type="button"
        onClick={() => navigate('/tutor/casos')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-300 transition-colors hover:text-navy-500"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver a Casos
      </button>

      {/* Hero header */}
      <header className="mt-3 flex flex-col gap-4 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[11px] font-bold text-navy-500">
                {caseData.id}
              </span>
              <StageBadge stage={caseData.stage} />
              <RiskBadge risk={caseData.risk} />
              <DaysBadge tone={stageTone} days={daysInStage} stage={caseData.stage} />
            </div>
            <h1 className="mt-2 text-2xl font-bold leading-tight text-navy-500 md:text-[28px]">
              {caseData.productName}
            </h1>
            <p className="mt-1 inline-flex items-center gap-2 text-sm text-navy-300">
              <Users className="h-3.5 w-3.5" />
              {caseData.applicantName}
              <span className="text-navy-400">·</span>
              {caseData.country} · {caseData.region}
            </p>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setOpenTemplateModal(true)}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 text-xs font-bold text-navy-500 transition-colors hover:bg-neutral-100"
            >
              <Send className="h-3.5 w-3.5" />
              Enviar mensaje
            </button>
            <button
              type="button"
              onClick={() => setOpenMeetingModal(true)}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 text-xs font-bold text-navy-500 transition-colors hover:bg-neutral-100"
            >
              <CalendarClock className="h-3.5 w-3.5" />
              Agendar reunión
            </button>
            <button
              type="button"
              onClick={() => setStageModalOpen(true)}
              disabled={!canAdvance.ok}
              title={canAdvance.ok ? '' : canAdvance.reason}
              className={cn(
                'inline-flex h-10 items-center gap-2 rounded-full px-5 text-xs font-bold shadow-sm transition-colors',
                canAdvance.ok
                  ? 'bg-gold-500 text-navy-500 hover:bg-gold-400'
                  : 'cursor-not-allowed bg-neutral-200 text-navy-300',
              )}
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
              Avanzar etapa
            </button>
          </div>
        </div>

        {/* Workflow progress mini */}
        <ol className="flex flex-wrap items-center gap-1 text-[10px] font-bold uppercase tracking-widest md:gap-2">
          {STAGE_ORDER.map((s, i) => {
            const idx = STAGE_ORDER.indexOf(caseData.stage)
            const done = i < idx
            const current = i === idx
            return (
              <li key={s} className="flex items-center gap-1 md:gap-2">
                <span
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                    done
                      ? 'bg-success-300 text-white'
                      : current
                        ? 'bg-gold-500 text-navy-500 ring-2 ring-gold-300'
                        : 'border-2 border-neutral-300 bg-white text-navy-300',
                  )}
                >
                  {done ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
                </span>
                <span
                  className={cn(
                    'hidden sm:inline',
                    done || current ? 'text-navy-500' : 'text-navy-300',
                  )}
                >
                  {STAGE_LABEL[s]}
                </span>
                {i < STAGE_ORDER.length - 1 && (
                  <ChevronRight className="h-3 w-3 text-navy-300" />
                )}
              </li>
            )
          })}
        </ol>
      </header>

      {/* Main grid: main + sidebar */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* MAIN */}
        <div className="lg:col-span-8">
          {/* Tabs */}
          <div
            data-tour="case-tabs"
            className="flex flex-wrap items-center gap-1 border-b border-neutral-200"
          >
            {TABS.map(({ id: tid, label, icon: Icon }) => {
              const active = tab === tid
              return (
                <button
                  key={tid}
                  type="button"
                  onClick={() => setTab(tid)}
                  className={cn(
                    'inline-flex items-center gap-2 border-b-2 px-3 py-3 text-xs font-bold transition-colors sm:px-4 sm:text-sm',
                    active
                      ? 'border-gold-500 text-navy-500'
                      : 'border-transparent text-navy-300 hover:text-navy-500',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              )
            })}
          </div>

          {/* Tab content */}
          <div className="mt-5">
            {tab === 'resumen' && (
              <ResumenTab
                caseData={caseData}
                evidencesApproved={evidencesApproved}
                evidencesTotal={evidencesTotal}
                finalScore={finalScore}
                onJumpTab={setTab}
              />
            )}
            {tab === 'evidencias' && (
              <EvidenciasTab caseData={caseData} evals={evidenceEvals} />
            )}
            {tab === 'evaluacion' && (
              <EvaluacionTab
                values={scoringValues}
                caseData={caseData}
                onSign={(score, category) => {
                  // Side-effects de firmar: avanzar a "evaluacion" si aún no,
                  // log al historial visual (in-memory). En backend real esto
                  // dispararía un evento, notif al solicitante, e inmutable log.
                  setCaseData((prev) =>
                    prev
                      ? {
                          ...prev,
                          stage:
                            STAGE_ORDER.indexOf(prev.stage) <
                            STAGE_ORDER.indexOf('evaluacion')
                              ? 'evaluacion'
                              : prev.stage,
                        }
                      : prev,
                  )
                   
                  console.info(
                    `[Firma] ${caseData.id} firmado por tutor con score ${score} → ${category}`,
                  )
                }}
              />
            )}
            {tab === 'mensajes' && (
              <MensajesTab
                caseData={caseData}
                onOpenTemplate={() => setOpenTemplateModal(true)}
              />
            )}
            {tab === 'historial' && <HistorialTab caseData={caseData} />}
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className="space-y-4 lg:col-span-4">
          <SidebarKey
            caseData={caseData}
            finalScore={finalScore}
            stageTone={stageTone}
            daysInStage={daysInStage}
          />
          <SidebarChecklist canAdvance={canAdvance} />
          <SidebarAI
            caseData={caseData}
            finalScore={finalScore}
            evidencesApproved={evidencesApproved}
            evidencesTotal={evidencesTotal}
            daysInStage={daysInStage}
          />
        </aside>
      </div>

      {/* Modals */}
      {stageModalOpen && (
        <StageAdvanceModal
          currentStage={caseData.stage}
          onClose={() => setStageModalOpen(false)}
          onConfirm={handleAdvanceStage}
          checklist={canAdvance}
        />
      )}
      {openTemplateModal && (
        <TemplateModal
          caseData={caseData}
          onClose={() => setOpenTemplateModal(false)}
        />
      )}
      {openMeetingModal && (
        <MeetingModal
          caseData={caseData}
          onClose={() => setOpenMeetingModal(false)}
        />
      )}
    </div>
  )
}

// ─── Workflow validation ──────────────────────────────────────────────────────

function computeCanAdvance(
  caseData: TutorCase,
  evidenceEvals: Array<{ verdict: EvidenceVerdict }>,
  scoringValues: ScoringValue[],
): { ok: boolean; reason: string; requirements: Array<{ label: string; done: boolean }> } {
  const reqs: Array<{ label: string; done: boolean }> = []

  switch (caseData.stage) {
    case 'postulado':
      reqs.push({
        label: 'Tutor asignado al caso',
        done: !!caseData.tutorId,
      })
      reqs.push({
        label: 'Scoring IA disponible',
        done: caseData.scoringIA > 0,
      })
      break
    case 'revision-inicial':
      reqs.push({
        label: 'Riesgo evaluado',
        done: !!caseData.risk,
      })
      reqs.push({
        label: 'Pendientes resueltos',
        done: caseData.pendingItems.length === 0,
      })
      break
    case 'elegible':
      reqs.push({
        label: 'Al menos 1 evidencia subida',
        done: evidenceEvals.length > 0,
      })
      reqs.push({
        label: 'Pendientes resueltos',
        done: caseData.pendingItems.length === 0,
      })
      break
    case 'diagnostico':
      reqs.push({
        label: 'Evidencias aprobadas',
        done:
          evidenceEvals.length > 0 &&
          evidenceEvals.every((e) => e.verdict === 'approved'),
      })
      reqs.push({
        label: 'Sin evidencias rechazadas',
        done: !evidenceEvals.some((e) => e.verdict === 'rejected'),
      })
      break
    case 'auditoria':
      reqs.push({
        label: 'Auditoría documentada',
        done: true, // mock
      })
      break
    case 'evaluacion':
      reqs.push({
        label: 'Scoring completo en 7 criterios',
        done: scoringValues.length >= 7,
      })
      reqs.push({
        label: 'Puntaje final ≥ 70',
        done: computeWeightedScore(scoringValues) >= 70,
      })
      break
    case 'certificacion':
      return {
        ok: false,
        reason: 'Caso ya certificado',
        requirements: [],
      }
  }

  const pending = reqs.filter((r) => !r.done)
  return {
    ok: pending.length === 0,
    reason: pending.length
      ? `Faltan ${pending.length} requisito${pending.length === 1 ? '' : 's'}`
      : '',
    requirements: reqs,
  }
}

// ─── Header components ────────────────────────────────────────────────────────

function StageBadge({ stage }: { stage: CaseStage }) {
  return (
    <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-gold-700 ring-1 ring-gold-300">
      {STAGE_LABEL[stage]}
    </span>
  )
}

function RiskBadge({ risk }: { risk: TutorCase['risk'] }) {
  const styles =
    risk === 'alto'
      ? 'border-error-300 text-error-400'
      : risk === 'medio'
        ? 'border-warning-300 text-warning-400'
        : 'border-success-300 text-success-300'
  const label =
    risk === 'alto' ? 'Riesgo alto' : risk === 'medio' ? 'Riesgo medio' : 'Riesgo bajo'
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border bg-white px-2 py-0.5 text-[10px] font-bold',
        styles,
      )}
    >
      {label}
    </span>
  )
}

function DaysBadge({
  tone,
  days,
  stage,
}: {
  tone: 'red' | 'yellow' | 'green'
  days: number
  stage: CaseStage
}) {
  const sla = STAGE_SLA_DAYS[stage] ?? 14
  const overdue = days - sla
  const tooltip =
    tone === 'red'
      ? `Llevás ${days} días en esta etapa. El plazo máximo es ${sla}. Estás atrasado ${overdue} día${overdue === 1 ? '' : 's'}.`
      : tone === 'yellow'
        ? `Llevás ${days} días en esta etapa. El plazo máximo es ${sla}. Quedan ${Math.max(0, sla - days)} día${sla - days === 1 ? '' : 's'} para avanzar.`
        : `Llevás ${days} días en esta etapa de un plazo máximo de ${sla}. Vas en tiempo.`
  return (
    <span
      title={tooltip}
      aria-label={tooltip}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-bold',
        // El vencido se destaca con tamaño + ring más grueso porque es
        // accionable: el tutor tiene que mover ese caso YA.
        tone === 'red'
          ? 'animate-pulse bg-error-300 px-3 py-1 text-xs text-white ring-2 ring-error-300/40'
          : 'px-2 py-0.5 text-[10px] ring-1',
        tone === 'yellow' && 'bg-warning-100 text-warning-400 ring-warning-300/40',
        tone === 'green' && 'bg-success-100 text-success-300 ring-success-300/30',
      )}
    >
      <Clock className={tone === 'red' ? 'h-3.5 w-3.5' : 'h-3 w-3'} />
      {tone === 'red' ? `Vencido ${overdue}d` : `${days}/${sla}d`}
    </span>
  )
}

// ─── Resumen tab ──────────────────────────────────────────────────────────────

function ResumenTab({
  caseData,
  evidencesApproved,
  evidencesTotal,
  finalScore,
  onJumpTab,
}: {
  caseData: TutorCase
  evidencesApproved: number
  evidencesTotal: number
  finalScore: number
  onJumpTab: (t: Tab) => void
}) {
  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="Scoring IA" value={`${caseData.scoringIA}/100`} icon={Sparkles} />
        <MiniStat
          label="Score tutor"
          value={finalScore > 0 ? `${finalScore}/100` : '—'}
          subValue={finalScore > 0 ? undefined : 'Pendiente de evaluación'}
          icon={Star}
          tone={finalScore >= 70 ? 'success' : finalScore > 0 ? 'warning' : 'muted'}
        />
        <MiniStat
          label="Evidencias OK"
          value={`${evidencesApproved}/${evidencesTotal}`}
          icon={FileCheck2}
        />
        <MiniStat
          label="Pendientes"
          value={caseData.pendingItems.length}
          icon={AlertCircle}
          tone={caseData.pendingItems.length > 0 ? 'warning' : 'success'}
        />
      </div>

      {/* Datos del producto */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-widest text-navy-300">
          Datos del producto
        </h3>
        <dl className="mt-3 grid gap-x-6 gap-y-3 text-sm md:grid-cols-2">
          <KV k="Producto/Servicio" v={caseData.productName} />
          <KV k="Categoría" v={caseData.category} />
          <KV k="País" v={caseData.country} />
          <KV k="Región" v={caseData.region} />
          <KV k="Solicitante" v={caseData.applicantName} />
          <KV
            k="Creado"
            v={new Date(caseData.createdAt).toLocaleDateString('es-AR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          />
        </dl>
      </section>

      {/* Quick action cards */}
      <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <QuickActionCard
          icon={FileCheck2}
          title="Revisar evidencias"
          sub={`${evidencesApproved}/${evidencesTotal} aprobadas`}
          onClick={() => onJumpTab('evidencias')}
        />
        <QuickActionCard
          icon={Star}
          title="Ver evaluación IA"
          sub={`Score: ${finalScore}/100`}
          onClick={() => onJumpTab('evaluacion')}
        />
      </section>
    </div>
  )
}

function MiniStat({
  label,
  value,
  subValue,
  icon: Icon,
  tone = 'muted',
}: {
  label: string
  value: string | number
  /** Caption opcional debajo del valor (ej. "Pendiente de evaluación"). */
  subValue?: string
  icon: typeof Star
  tone?: 'success' | 'warning' | 'muted'
}) {
  const styles =
    tone === 'success'
      ? 'bg-success-100 text-success-300'
      : tone === 'warning'
        ? 'bg-warning-100 text-warning-400'
        : 'bg-neutral-100 text-navy-500'
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-navy-300">
          {label}
        </p>
        <span className={cn('flex h-7 w-7 items-center justify-center rounded-full', styles)}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className="mt-2 text-xl font-bold text-navy-500">{value}</p>
      {subValue && (
        <p className="mt-0.5 text-[11px] font-medium text-navy-300">{subValue}</p>
      )}
    </div>
  )
}

function QuickActionCard({
  icon: Icon,
  title,
  sub,
  onClick,
}: {
  icon: typeof Star
  title: string
  sub: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-navy-500">{title}</p>
        <p className="mt-0.5 truncate text-xs text-navy-300">{sub}</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-navy-300" />
    </button>
  )
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-widest text-navy-300">{k}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-navy-500">{v}</dd>
    </div>
  )
}

// ─── Evidencias tab ───────────────────────────────────────────────────────────

function EvidenciasTab({
  caseData,
  evals: initialEvals,
}: {
  caseData: TutorCase
  evals: Array<{ evidenceId: string; verdict: EvidenceVerdict; comment?: string }>
}) {
  const [evals, setEvals] = useState(initialEvals)
  const [requestOpen, setRequestOpen] = useState(false)

  const mockFiles = [
    { id: 'e-001', name: 'pieza-frente.jpg', kind: 'image' },
    { id: 'e-002', name: 'pieza-reverso.jpg', kind: 'image' },
    { id: 'e-003', name: 'proceso-hilado.jpg', kind: 'image' },
  ]

  const setVerdict = (evidenceId: string, verdict: EvidenceVerdict, comment?: string) => {
    setEvals((prev) => {
      const existing = prev.find((e) => e.evidenceId === evidenceId)
      if (existing) {
        return prev.map((e) =>
          e.evidenceId === evidenceId ? { ...e, verdict, comment: comment ?? e.comment } : e,
        )
      }
      return [...prev, { evidenceId, verdict, comment }]
    })
    toast.success(`Evidencia marcada como ${verdict}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-navy-500">
            Evidencias para evaluar
          </h3>
          <p className="mt-0.5 text-xs text-navy-300">
            Aprobá, rechazá o pedí aclaraciones por archivo.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRequestOpen(true)}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-navy-500 px-4 text-xs font-bold text-white transition-colors hover:bg-navy-400"
        >
          <Plus className="h-3.5 w-3.5" />
          Pedir más evidencias
        </button>
      </div>

      <ul className="space-y-3">
        {mockFiles.map((f) => {
          const ev = evals.find((e) => e.evidenceId === f.id)
          const verdict = ev?.verdict ?? 'pending'
          return (
            <li
              key={f.id}
              className={cn(
                'rounded-2xl border bg-white p-4 shadow-sm',
                verdict === 'approved' && 'border-success-300/50',
                verdict === 'rejected' && 'border-error-300/60',
                verdict === 'clarify' && 'border-warning-300/60',
                verdict === 'pending' && 'border-neutral-200',
              )}
            >
              <div className="flex flex-wrap items-start gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                  <FileCheck2 className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-navy-500">{f.name}</p>
                  <p className="mt-0.5 text-xs text-navy-300">
                    Subida por {caseData.applicantName}
                  </p>
                  {ev?.comment && (
                    <p className="mt-2 rounded-xl bg-neutral-100 px-3 py-2 text-xs text-navy-500">
                      <span className="font-bold">Comentario: </span>
                      {ev.comment}
                    </p>
                  )}
                </div>
                <VerdictBadge verdict={verdict} />
              </div>

              {/* Acciones */}
              <div className="mt-3 flex flex-wrap gap-2 border-t border-neutral-200 pt-3">
                <button
                  type="button"
                  onClick={() => setVerdict(f.id, 'approved', 'Cumple con los criterios.')}
                  className={cn(
                    'inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[11px] font-bold transition-colors',
                    verdict === 'approved'
                      ? 'bg-success-300 text-white'
                      : 'border border-neutral-300 bg-white text-navy-500 hover:bg-success-100',
                  )}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Aprobar
                </button>
                <button
                  type="button"
                  onClick={() => setVerdict(f.id, 'clarify', 'Necesito una aclaración.')}
                  className={cn(
                    'inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[11px] font-bold transition-colors',
                    verdict === 'clarify'
                      ? 'bg-warning-400 text-white'
                      : 'border border-neutral-300 bg-white text-navy-500 hover:bg-warning-100',
                  )}
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  Pedir aclaración
                </button>
                <button
                  type="button"
                  onClick={() => setVerdict(f.id, 'rejected', 'No cumple con los criterios.')}
                  className={cn(
                    'inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[11px] font-bold transition-colors',
                    verdict === 'rejected'
                      ? 'bg-error-400 text-white'
                      : 'border border-neutral-300 bg-white text-navy-500 hover:bg-error-100',
                  )}
                >
                  <X className="h-3.5 w-3.5" />
                  Rechazar
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      {requestOpen && (
        <EvidenceRequestModal
          caseData={caseData}
          onClose={() => setRequestOpen(false)}
        />
      )}
    </div>
  )
}

function VerdictBadge({ verdict }: { verdict: EvidenceVerdict }) {
  const meta = {
    approved: { label: 'Aprobada', cls: 'bg-success-100 text-success-300 ring-success-300/30' },
    rejected: { label: 'Rechazada', cls: 'bg-error-100 text-error-400 ring-error-300/40' },
    clarify: { label: 'Aclaración', cls: 'bg-warning-100 text-warning-400 ring-warning-300/40' },
    pending: { label: 'Pendiente', cls: 'bg-neutral-200 text-navy-500 ring-neutral-300' },
  }[verdict]
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-1',
        meta.cls,
      )}
    >
      {meta.label}
    </span>
  )
}

// ─── Evaluación tab ───────────────────────────────────────────────────────────

function EvaluacionTab({
  values,
  caseData,
  onSign,
}: {
  values: ScoringValue[]
  caseData: TutorCase
  onSign: (score: number, category: string) => void
}) {
  const [signOpen, setSignOpen] = useState(false)
  const [signed, setSigned] = useState(false)
  // La evaluación es 100% IA — el tutor no edita valores individuales,
  // solo firma. El score se computa con los pesos del antropólogo.
  const finalScore = computeWeightedScore(values)

  // Agrupar criterios por dimensión (orden del antropólogo).
  const dimensionOrder: ScoringDimension[] = [
    'cultural',
    'social',
    'ambiental',
    'etica',
    'gestion',
  ]
  const dimensionMeta: Record<
    ScoringDimension,
    { label: string; accent: string }
  > = {
    cultural: { label: 'Cultural', accent: 'bg-gold-100 text-gold-700' },
    social: {
      label: 'Sociales y Comunitaria',
      accent: 'bg-info-100 text-info-400',
    },
    ambiental: { label: 'Ambiental', accent: 'bg-success-100 text-success-300' },
    etica: {
      label: 'Ética y Cosmovisión',
      accent: 'bg-warning-100 text-warning-400',
    },
    gestion: { label: 'Gestión y técnica', accent: 'bg-neutral-200 text-navy-500' },
  }

  // Categoría cultural derivada del score (Cat 1/2/3 según antropólogo).
  const category = categoryFromScore(finalScore)

  return (
    <div className="space-y-4">
      {/* Banner "Generado por IA · no editable" */}
      <div className="flex items-start gap-2 rounded-2xl border border-gold-300/50 bg-gradient-to-br from-gold-100/60 to-white p-3">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-gold-700" />
        <div className="text-xs leading-relaxed text-navy-500">
          <p className="font-bold">
            Evaluación generada por IA sobre las 14 variables del antropólogo.
          </p>
          <p className="mt-0.5 text-navy-300">
            Los puntajes son calculados automáticamente a partir de las
            evidencias y datos del caso. El tutor revisa y firma — no edita
            valores individuales.
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-gold-100/50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gold-700">
              Score ponderado IA
            </p>
            <p className="mt-1 text-3xl font-bold text-navy-500">
              {finalScore}
              <span className="text-base text-navy-300">/100</span>
            </p>
            <p className="mt-0.5 text-xs text-navy-300">
              Calculado con los pesos del antropólogo (suma = 100%).
            </p>
            {category.num && (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-navy-500 ring-1 ring-gold-300">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[10px] text-navy-500">
                  {category.num}
                </span>
                {category.label}
              </p>
            )}
          </div>
          <div className="h-2 w-full max-w-md overflow-hidden rounded-full bg-white sm:w-64">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                finalScore >= 80
                  ? 'bg-success-300'
                  : finalScore >= 60
                    ? 'bg-info-400'
                    : finalScore >= 40
                      ? 'bg-warning-400'
                      : 'bg-error-400',
              )}
              style={{ width: `${finalScore}%` }}
            />
          </div>
        </div>
      </div>

      {dimensionOrder.map((dim) => {
        const criteria = SCORING_CRITERIA.filter((c) => c.dimension === dim)
        if (criteria.length === 0) return null
        const dimWeight = criteria.reduce((s, c) => s + c.weight, 0)
        const meta = dimensionMeta[dim]
        return (
          <section key={dim} className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-navy-500">
                {meta.label}
              </h3>
              <span
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-[10px] font-bold',
                  meta.accent,
                )}
              >
                {dimWeight}% del total
              </span>
            </div>
            <ul className="space-y-3">
              {criteria.map((c) => {
                const val = values.find((v) => v.criterionId === c.id)
                const score = val?.score ?? 0
                const scoreTone =
                  score >= 8
                    ? 'bg-success-300'
                    : score >= 5
                      ? 'bg-warning-400'
                      : 'bg-error-400'
                return (
                  <li
                    key={c.id}
                    className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-bold text-navy-500">
                            {c.label}
                          </p>
                          <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-bold text-navy-500">
                            peso {c.weight}%
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-2 py-0.5 text-[10px] font-bold text-gold-700">
                            <Sparkles className="h-2.5 w-2.5" />
                            IA
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-navy-300">
                          {c.description}
                        </p>
                        <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-navy-300">
                          {c.subitems.map((s) => (
                            <li
                              key={s}
                              className="inline-flex items-center gap-1"
                            >
                              <span className="h-1 w-1 rounded-full bg-gold-500" />
                              {s}
                            </li>
                          ))}
                        </ul>
                        {c.verification && (
                          <p className="mt-2 rounded-lg bg-neutral-100 px-2.5 py-1.5 text-[11px] leading-relaxed text-navy-400">
                            <span className="font-bold text-navy-500">
                              Verificación:{' '}
                            </span>
                            {c.verification}
                          </p>
                        )}
                      </div>
                      {/* Score read-only con barra visual + número */}
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="inline-flex h-9 w-12 items-center justify-center rounded-full bg-navy-500 text-sm font-bold text-white">
                          {score}
                          <span className="text-[9px] font-medium text-white/60">
                            /10
                          </span>
                        </span>
                        <div
                          className="h-1.5 w-32 overflow-hidden rounded-full bg-neutral-200 sm:w-40"
                          aria-label={`Puntaje IA de ${c.label}: ${score} de 10`}
                          role="img"
                        >
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              scoreTone,
                            )}
                            style={{ width: `${score * 10}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    {/* Comentario IA si existe (read-only) */}
                    {val?.comment && (
                      <p className="mt-3 rounded-xl bg-gold-100/40 px-3 py-2 text-xs leading-relaxed text-navy-500 ring-1 ring-gold-300/40">
                        <span className="font-bold text-gold-700">
                          Análisis IA:{' '}
                        </span>
                        {val.comment}
                      </p>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200 pt-4">
        <p className="max-w-md text-[11px] leading-relaxed text-navy-300">
          Si encontrás algo a ajustar, dejá una observación en{' '}
          <strong className="text-navy-500">Mensajes</strong> y la IA reprocesa
          la evaluación.
        </p>
        <button
          type="button"
          disabled={signed || values.length === 0}
          onClick={() => setSignOpen(true)}
          className={cn(
            'inline-flex h-10 items-center gap-2 rounded-full px-5 text-xs font-bold shadow-sm transition-colors',
            signed
              ? 'bg-success-100 text-success-300 ring-1 ring-success-300/40'
              : 'bg-gold-500 text-navy-500 hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-40',
          )}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          {signed ? 'Evaluación firmada' : 'Aceptar y firmar evaluación IA'}
        </button>
      </div>

      {signOpen && (
        <SignEvaluationModal
          caseData={caseData}
          finalScore={finalScore}
          category={category}
          onClose={() => setSignOpen(false)}
          onConfirm={() => {
            setSigned(true)
            setSignOpen(false)
            onSign(finalScore, category.label)
            toast.success(
              `Evaluación firmada · ${caseData.id} clasificado como "${category.label}"`,
            )
          }}
        />
      )}
    </div>
  )
}


// ─── Mensajes (público con el solicitante) ────────────────────────────────────

function MensajesTab({
  caseData,
  onOpenTemplate,
}: {
  caseData: TutorCase
  onOpenTemplate: () => void
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-navy-300">
        Conversación oficial con el solicitante. Los mensajes quedan
        registrados como parte del expediente.
      </p>
      <div className="rounded-2xl border border-info-300/40 bg-info-100/40 p-4">
        <div className="flex items-center gap-2 text-xs font-bold text-info-400">
          <MessageSquare className="h-3.5 w-3.5" />
          Comunicación rápida vía WhatsApp
        </div>
        <p className="mt-2 text-sm text-navy-500">
          La comunicación día a día se hace por WhatsApp con
          {' '}<strong>{caseData.applicantName}</strong>. Los mensajes
          importantes (decisiones, pedidos, aprobaciones) se registran acá
          como parte del expediente oficial.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href="https://wa.me/5491145678901"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-success-300 px-4 text-xs font-bold text-white transition-colors hover:bg-success-400"
          >
            <Phone className="h-3.5 w-3.5" />
            Abrir WhatsApp
          </a>
          <button
            type="button"
            onClick={onOpenTemplate}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-4 text-xs font-bold text-navy-500 transition-colors hover:bg-neutral-100"
          >
            <FileText className="h-3.5 w-3.5" />
            Usar plantilla
          </button>
        </div>
      </div>
      {/* Stub: chat history */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-navy-300">
          Registro de mensajes oficiales
        </p>
        <ul className="mt-3 space-y-3">
          <ChatBubble
            mine={false}
            author={caseData.applicantName}
            at="hace 2d"
            body="Hola Juan, ya subí las 3 fotos del proceso de tejido. Avisame si necesitás algo más."
          />
          <ChatBubble
            mine
            author="Vos"
            at="hace 1d"
            body="Camila, recibí las fotos, muchas gracias. Te confirmo el viernes con el feedback."
          />
          <ChatBubble
            mine={false}
            author={caseData.applicantName}
            at="hace 8h"
            body="Perfecto, espero!"
          />
        </ul>
      </div>
    </div>
  )
}

function ChatBubble({
  mine,
  author,
  at,
  body,
}: {
  mine: boolean
  author: string
  at: string
  body: string
}) {
  return (
    <li className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-3 py-2 text-sm',
          mine
            ? 'rounded-br-sm bg-navy-500 text-white'
            : 'rounded-bl-sm bg-neutral-100 text-navy-500',
        )}
      >
        {!mine && (
          <p className="text-[10px] font-bold uppercase tracking-widest text-gold-700">
            {author}
          </p>
        )}
        <p className={cn(mine && 'mt-0', !mine && 'mt-0.5')}>{body}</p>
        <p
          className={cn(
            'mt-1 text-[10px]',
            mine ? 'text-white/70' : 'text-navy-300',
          )}
        >
          {at}
        </p>
      </div>
    </li>
  )
}

// ─── Historial (logs inmutables) ──────────────────────────────────────────────

function HistorialTab({ caseData }: { caseData: TutorCase }) {
  const events = [
    {
      id: 'h-1',
      title: 'Caso creado',
      at: caseData.createdAt,
      actor: 'Sistema',
      kind: 'info' as const,
    },
    {
      id: 'h-2',
      title: 'Tutor asignado',
      sub: caseData.tutorName ?? '—',
      at: caseData.createdAt,
      actor: 'Coordinador',
      kind: 'info' as const,
    },
    {
      id: 'h-3',
      title: 'Avance a Revisión inicial',
      sub: 'Sin observaciones',
      at: '2026-05-06T10:00:00-03:00',
      actor: caseData.tutorName ?? 'Tutor',
      kind: 'stage' as const,
    },
    {
      id: 'h-4',
      title: 'Evidencias subidas',
      sub: '3 archivos',
      at: '2026-05-09T12:30:00-03:00',
      actor: caseData.applicantName,
      kind: 'evidence' as const,
    },
    {
      id: 'h-5',
      title: 'Avance a Elegible',
      sub: 'Score IA ≥ 80',
      at: '2026-05-12T09:00:00-03:00',
      actor: caseData.tutorName ?? 'Tutor',
      kind: 'stage' as const,
    },
  ]
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-navy-300">
        Log inmutable del caso
      </p>
      <ol className="mt-4 space-y-3 border-l-2 border-neutral-200 pl-5">
        {events.map((ev) => (
          <li key={ev.id} className="relative">
            <span
              className={cn(
                'absolute -left-[27px] top-1 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white',
                ev.kind === 'stage'
                  ? 'bg-gold-500'
                  : ev.kind === 'evidence'
                    ? 'bg-info-400'
                    : 'bg-navy-500',
              )}
            />
            <p className="text-sm font-bold text-navy-500">{ev.title}</p>
            {ev.sub && <p className="text-xs text-navy-300">{ev.sub}</p>}
            <p className="mt-0.5 text-[11px] text-navy-400">
              {ev.actor} ·{' '}
              {new Date(ev.at).toLocaleString('es-AR', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </li>
        ))}
      </ol>
    </div>
  )
}

// ─── Sidebar (info clave + checklist + IA assist) ─────────────────────────────

function SidebarKey({
  caseData,
  finalScore,
  stageTone,
  daysInStage,
}: {
  caseData: TutorCase
  finalScore: number
  stageTone: 'red' | 'yellow' | 'green'
  daysInStage: number
}) {
  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-navy-300">
        Info del caso
      </p>
      <div className="mt-4 flex items-center gap-3">
        <img
          src={caseData.applicantAvatarUrl ?? 'https://i.pravatar.cc/100?img=47'}
          alt=""
          className="h-12 w-12 rounded-full object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-navy-500">
            {caseData.applicantName}
          </p>
          <p className="text-xs text-navy-300">{caseData.country} · {caseData.region}</p>
        </div>
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <SidebarRow
          label="Tutor"
          value={caseData.tutorName ?? 'Sin asignar'}
        />
        <SidebarRow
          label="Scoring IA"
          value={`${caseData.scoringIA}/100`}
        />
        <SidebarRow
          label="Score final"
          value={`${finalScore}/100`}
          highlight={finalScore >= 70}
        />
        <SidebarRow
          label="Días en etapa"
          value={`${daysInStage} días`}
          tone={stageTone}
        />
        <SidebarRow
          label="Pendientes"
          value={`${caseData.pendingItems.length}`}
        />
      </dl>
    </section>
  )
}

function SidebarRow({
  label,
  value,
  highlight,
  tone,
}: {
  label: string
  value: string
  highlight?: boolean
  tone?: 'red' | 'yellow' | 'green'
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-xs text-navy-300">{label}</dt>
      <dd
        className={cn(
          'text-sm font-bold',
          highlight ? 'text-success-300' : 'text-navy-500',
          tone === 'red' && 'text-error-400',
          tone === 'yellow' && 'text-warning-400',
          tone === 'green' && 'text-success-300',
        )}
      >
        {value}
      </dd>
    </div>
  )
}

function SidebarChecklist({
  canAdvance,
}: {
  canAdvance: { ok: boolean; reason: string; requirements: Array<{ label: string; done: boolean }> }
}) {
  if (canAdvance.requirements.length === 0) return null
  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-navy-300">
          Requisitos para avanzar
        </p>
        {canAdvance.ok ? (
          <span className="rounded-full bg-success-100 px-2 py-0.5 text-[10px] font-bold text-success-300">
            Listo
          </span>
        ) : (
          <span className="rounded-full bg-warning-100 px-2 py-0.5 text-[10px] font-bold text-warning-400">
            Pendiente
          </span>
        )}
      </div>
      <ul className="mt-3 space-y-2">
        {canAdvance.requirements.map((r) => (
          <li key={r.label} className="flex items-start gap-2 text-sm">
            <span
              className={cn(
                'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full',
                r.done
                  ? 'bg-success-300 text-white'
                  : 'border-2 border-neutral-300',
              )}
            >
              {r.done && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
            </span>
            <span
              className={cn(
                r.done ? 'text-navy-500' : 'text-navy-400',
                r.done && 'line-through decoration-success-300/40',
              )}
            >
              {r.label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function SidebarAI({
  caseData,
  finalScore,
  evidencesApproved,
  evidencesTotal,
  daysInStage,
}: {
  caseData: TutorCase
  finalScore: number
  evidencesApproved: number
  evidencesTotal: number
  daysInStage: number
}) {
  const [summaryOpen, setSummaryOpen] = useState(false)
  const sla = STAGE_SLA_DAYS[caseData.stage] ?? 14
  const slaTone =
    daysInStage > sla ? 'red' : daysInStage > sla * 0.7 ? 'yellow' : 'green'
  const evidenceShortfall = Math.max(
    0,
    (evidencesTotal || 3) - evidencesApproved,
  )
  /**
   * Cada sugerencia tiene un CTA opcional accionable.
   * El user puede ir directo del insight a la acción sin tener que
   * recordar dónde estaba el botón.
   */
  const suggestions: Array<{ text: string; cta?: { label: string; href?: string; onClick?: () => void } }> = [
    {
      text: `El scoring IA (${caseData.scoringIA}) sugiere riesgo ${caseData.scoringIA >= 80 ? 'bajo' : caseData.scoringIA >= 60 ? 'medio' : 'alto'}.`,
    },
    evidenceShortfall > 0
      ? {
          text: `Faltan ${evidenceShortfall} ${evidenceShortfall === 1 ? 'evidencia' : 'evidencias'} por aprobar.`,
          cta: {
            label: 'Pedir al solicitante',
            href: `https://wa.me/5491145678901?text=${encodeURIComponent(`Hola ${caseData.applicantName.split(' ')[0]}, necesito ${evidenceShortfall} evidencia${evidenceShortfall === 1 ? '' : 's'} más para avanzar tu certificación.`)}`,
          },
        }
      : { text: 'Todas las evidencias esperadas fueron aprobadas.' },
    slaTone === 'red'
      ? {
          text: `SLA excedido: ${daysInStage}d sobre ${sla}d permitidos.`,
          cta: { label: 'Ver resumen IA', onClick: () => setSummaryOpen(true) },
        }
      : slaTone === 'yellow'
        ? {
            text: `SLA en zona amarilla: quedan ${Math.max(0, sla - daysInStage)}d.`,
          }
        : { text: 'Tiempo en etapa actual dentro del SLA estándar.' },
  ]
  return (
    <>
      <section
        data-tour="ia-summary"
        className="rounded-3xl border border-gold-300/50 bg-gradient-to-br from-gold-100/60 to-white p-5 shadow-sm"
      >
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold-700">
          <Sparkles className="h-3.5 w-3.5" />
          Asistente IA
        </div>
        <ul className="mt-3 space-y-2">
          {suggestions.map((s, i) => (
            <li
              key={i}
              className="rounded-xl bg-white/70 px-3 py-2 text-xs leading-relaxed text-navy-500 shadow-sm"
            >
              <div className="flex items-start gap-2">
                <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-700" />
                <span className="flex-1">{s.text}</span>
              </div>
              {s.cta && (
                <div className="mt-1.5 pl-5">
                  {s.cta.href ? (
                    <a
                      href={s.cta.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-gold-700 hover:underline"
                    >
                      {s.cta.label} →
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={s.cta.onClick}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-gold-700 hover:underline"
                    >
                      {s.cta.label} →
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setSummaryOpen(true)}
          className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-gold-700 hover:underline"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Ver resumen IA del caso
        </button>
      </section>

      {summaryOpen && (
        <AISummaryModal
          caseData={caseData}
          finalScore={finalScore}
          evidencesApproved={evidencesApproved}
          evidencesTotal={evidencesTotal}
          daysInStage={daysInStage}
          onClose={() => setSummaryOpen(false)}
        />
      )}
    </>
  )
}

// ─── Stage advance modal ──────────────────────────────────────────────────────

function StageAdvanceModal({
  currentStage,
  onClose,
  onConfirm,
  checklist,
}: {
  currentStage: CaseStage
  onClose: () => void
  onConfirm: (reason: string) => void
  checklist: { ok: boolean; requirements: Array<{ label: string; done: boolean }> }
}) {
  const [reason, setReason] = useState('')
  const idx = STAGE_ORDER.indexOf(currentStage)
  const nextStage = STAGE_ORDER[idx + 1]
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-500/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-500 text-navy-500">
            <ArrowUpRight className="h-5 w-5" />
          </span>
          <h3 className="text-lg font-bold text-navy-500">Avanzar etapa</h3>
        </div>
        <p className="mt-3 text-sm text-navy-300">
          {STAGE_LABEL[currentStage]}{' '}
          <ArrowRight className="inline h-3 w-3" />{' '}
          <strong className="text-navy-500">
            {nextStage ? STAGE_LABEL[nextStage] : 'Final'}
          </strong>
        </p>

        {!checklist.ok && (
          <div className="mt-4 rounded-2xl bg-warning-100 p-3 text-sm ring-1 ring-warning-300/40">
            <p className="font-bold text-warning-400">
              Hay requisitos pendientes
            </p>
            <ul className="mt-1 list-disc pl-5 text-xs text-navy-500">
              {checklist.requirements
                .filter((r) => !r.done)
                .map((r) => (
                  <li key={r.label}>{r.label}</li>
                ))}
            </ul>
          </div>
        )}

        <label className="mt-4 block text-xs font-bold text-navy-500">
          Motivo del cambio (queda registrado en log)
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Ej: Evidencias aprobadas, scoring sobre umbral, paso a auditoría."
          className="mt-1 w-full resize-none rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-navy-500 placeholder:text-navy-300 focus:border-gold-500 focus:outline-none"
        />

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm font-bold text-navy-500 hover:bg-neutral-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => reason.trim() && onConfirm(reason.trim())}
            disabled={!reason.trim() || !checklist.ok}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-bold text-navy-500 shadow-sm hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Check className="h-4 w-4" />
            Confirmar avance
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Template modal ───────────────────────────────────────────────────────────

function TemplateModal({
  caseData,
  onClose,
}: {
  caseData: TutorCase
  onClose: () => void
}) {
  const [selected, setSelected] = useState(MESSAGE_TEMPLATES[0])
  const [body, setBody] = useState(
    selected.body.replace('{nombre}', caseData.applicantName.split(' ')[0]),
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-500/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-navy-500">Enviar mensaje</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-navy-300 hover:bg-neutral-100"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-xs text-navy-300">
          A {caseData.applicantName}
        </p>

        {/* Templates row */}
        <div className="mt-4 flex flex-wrap gap-2">
          {MESSAGE_TEMPLATES.map((t) => {
            const active = selected.id === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setSelected(t)
                  setBody(
                    t.body.replace(
                      '{nombre}',
                      caseData.applicantName.split(' ')[0],
                    ),
                  )
                }}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-[11px] font-bold transition-colors',
                  active
                    ? 'border-navy-500 bg-navy-500 text-white'
                    : 'border-neutral-300 bg-white text-navy-500 hover:bg-neutral-100',
                )}
              >
                {t.title}
              </button>
            )
          })}
        </div>

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          className="mt-3 w-full resize-y rounded-2xl border border-neutral-300 bg-white px-3 py-2 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
        />

        <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          <a
            href={`https://wa.me/5491145678901?text=${encodeURIComponent(body)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-success-300 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-success-400"
            onClick={() => {
              setTimeout(onClose, 200)
              toast.success('Abriendo WhatsApp…')
            }}
          >
            <Send className="h-4 w-4" />
            Enviar por WhatsApp
          </a>
          <button
            type="button"
            onClick={() => {
              toast.success('Mensaje registrado en el expediente')
              onClose()
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-navy-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-navy-400"
          >
            <Shield className="h-4 w-4" />
            Registrar como oficial
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Meeting modal ────────────────────────────────────────────────────────────

function MeetingModal({
  caseData,
  onClose,
}: {
  caseData: TutorCase
  onClose: () => void
}) {
  const [kind, setKind] = useState<'kickoff' | 'auditoria' | 'evaluacion' | 'cierre'>('kickoff')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('10:00')
  const [duration, setDuration] = useState(45)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-500/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-navy-500">Agendar reunión</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-navy-300 hover:bg-neutral-100"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-xs text-navy-300">
          Con {caseData.applicantName}
        </p>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-bold text-navy-500">Tipo</label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as typeof kind)}
              className="mt-1 h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
            >
              <option value="kickoff">Reunión inicial</option>
              <option value="auditoria">Auditoría</option>
              <option value="evaluacion">Evaluación</option>
              <option value="cierre">Cierre</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-navy-500">Fecha</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-navy-500">Hora</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-navy-500">Duración (min)</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="mt-1 h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
            >
              <option value={30}>30 minutos</option>
              <option value={45}>45 minutos</option>
              <option value={60}>1 hora</option>
              <option value={90}>1h 30min</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm font-bold text-navy-500 hover:bg-neutral-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              toast.success('Propuesta de reunión enviada al solicitante')
              onClose()
            }}
            disabled={!date}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-navy-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-navy-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Video className="h-4 w-4" />
            Enviar propuesta
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Evidence request modal ───────────────────────────────────────────────────

const EVIDENCE_REQUEST_OPTIONS: Array<{
  id: 'fotos' | 'video' | 'aval' | 'documento'
  label: string
  detail: string
  icon: typeof FileCheck2
}> = [
  {
    id: 'fotos',
    label: 'Fotos del proceso',
    detail: '3+ imágenes claras del oficio en acción',
    icon: FileCheck2,
  },
  {
    id: 'video',
    label: 'Video corto',
    detail: '1–3 min mostrando la técnica',
    icon: Video,
  },
  {
    id: 'aval',
    label: 'Aval comunitario',
    detail: 'Firma de un referente reconocido',
    icon: Shield,
  },
  {
    id: 'documento',
    label: 'Documento adicional',
    detail: 'Certificado, contrato o acta',
    icon: FileText,
  },
]

function EvidenceRequestModal({
  caseData,
  onClose,
}: {
  caseData: TutorCase
  onClose: () => void
}) {
  const [selected, setSelected] = useState<Record<string, boolean>>({
    fotos: true,
  })
  const [note, setNote] = useState('')

  const toggle = (id: string) =>
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }))

  const items = EVIDENCE_REQUEST_OPTIONS.filter((o) => selected[o.id])
  const firstName = caseData.applicantName.split(' ')[0]

  const summary = items.length
    ? `Hola ${firstName}, para avanzar con el diagnóstico necesito que subas:\n\n${items
        .map((i) => `• ${i.label} — ${i.detail}`)
        .join('\n')}${note ? `\n\nNota: ${note}` : ''}\n\n¡Gracias!`
    : `Hola ${firstName}, necesito que subas evidencias adicionales.${note ? `\n\n${note}` : ''}`

  const waUrl = `https://wa.me/5491145678901?text=${encodeURIComponent(summary)}`

  const disabled = items.length === 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-500/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-500 text-white">
              <Plus className="h-5 w-5" />
            </span>
            <h3 className="text-lg font-bold text-navy-500">
              Pedir más evidencias
            </h3>
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
        <p className="mt-1 text-xs text-navy-300">
          A {caseData.applicantName} · {caseData.id}
        </p>

        <div className="mt-4 space-y-2">
          {EVIDENCE_REQUEST_OPTIONS.map((opt) => {
            const active = !!selected[opt.id]
            const Icon = opt.icon
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggle(opt.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-colors',
                  active
                    ? 'border-navy-500 bg-navy-500/5'
                    : 'border-neutral-200 bg-white hover:bg-neutral-100',
                )}
              >
                <span
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                    active
                      ? 'bg-navy-500 text-white'
                      : 'bg-neutral-100 text-navy-500',
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-navy-500">{opt.label}</p>
                  <p className="mt-0.5 text-xs text-navy-300">{opt.detail}</p>
                </div>
                <span
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                    active
                      ? 'border-navy-500 bg-navy-500 text-white'
                      : 'border-neutral-300 bg-white',
                  )}
                >
                  {active && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-4">
          <label className="text-xs font-bold text-navy-500">
            Nota adicional (opcional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Aclaraciones, ejemplos, fecha límite…"
            className="mt-1 w-full resize-y rounded-2xl border border-neutral-300 bg-white px-3 py-2 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
          />
        </div>

        <div className="mt-3 rounded-2xl border border-neutral-200 bg-neutral-100 p-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-navy-300">
            Vista previa del mensaje
          </p>
          <p className="mt-1 whitespace-pre-line text-xs text-navy-500">
            {summary}
          </p>
        </div>

        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm font-bold text-navy-500 hover:bg-neutral-100"
          >
            Cancelar
          </button>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              setTimeout(() => {
                toast.success(
                  `Solicitud enviada a ${firstName} por WhatsApp`,
                )
                onClose()
              }, 200)
            }}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-bold shadow-sm transition-colors',
              disabled
                ? 'pointer-events-none cursor-not-allowed bg-neutral-200 text-navy-300'
                : 'bg-success-300 text-white hover:bg-success-400',
            )}
          >
            <Phone className="h-4 w-4" />
            Enviar por WhatsApp
          </a>
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              toast.success('Solicitud registrada en el expediente')
              onClose()
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-navy-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-navy-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
            Registrar oficial
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── AI Summary modal ─────────────────────────────────────────────────────────

function AISummaryModal({
  caseData,
  finalScore,
  evidencesApproved,
  evidencesTotal,
  daysInStage,
  onClose,
}: {
  caseData: TutorCase
  finalScore: number
  evidencesApproved: number
  evidencesTotal: number
  daysInStage: number
  onClose: () => void
}) {
  const riskLevel =
    caseData.scoringIA >= 80
      ? 'bajo'
      : caseData.scoringIA >= 60
        ? 'medio'
        : 'alto'
  const sla = STAGE_SLA_DAYS[caseData.stage] ?? 14
  const slaTone = daysInStage > sla ? 'red' : daysInStage > sla * 0.7 ? 'yellow' : 'green'
  const estClosingDays = Math.max(7, sla - daysInStage + 14)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-500/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gold-500 to-gold-400 text-navy-500">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gold-700">
                Resumen IA
              </p>
              <h3 className="text-lg font-bold text-navy-500">
                {caseData.productName}
              </h3>
              <p className="text-xs text-navy-300">
                {caseData.id} · {caseData.applicantName}
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

        {/* Top KPIs */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiBox label="Score IA" value={`${caseData.scoringIA}/100`} tone={riskLevel === 'bajo' ? 'green' : riskLevel === 'medio' ? 'yellow' : 'red'} />
          <KpiBox label="Score tutor" value={`${finalScore.toFixed(0)}/100`} tone="navy" />
          <KpiBox label="Evidencias" value={`${evidencesApproved}/${evidencesTotal || 3}`} tone="navy" />
          <KpiBox label="Días en etapa" value={`${daysInStage}d`} tone={slaTone} />
        </div>

        {/* Resumen ejecutivo */}
        <section className="mt-5 rounded-2xl border border-gold-300/50 bg-gradient-to-br from-gold-100/40 to-white p-4">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gold-700">
            <BookOpen className="h-3.5 w-3.5" />
            Resumen ejecutivo
          </div>
          <p className="mt-2 text-sm leading-relaxed text-navy-500">
            {caseData.applicantName} solicita certificación para{' '}
            <strong>{caseData.productName}</strong> desde{' '}
            {caseData.country}, {caseData.region}. El caso se encuentra en
            etapa{' '}
            <strong>{STAGE_LABEL[caseData.stage]}</strong> con un score IA de{' '}
            <strong>{caseData.scoringIA}</strong> (riesgo {riskLevel}). Lleva{' '}
            <strong>{daysInStage} días</strong> en la etapa actual (SLA: {sla}{' '}
            días).
          </p>
        </section>

        {/* Highlights */}
        <section className="mt-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-navy-300">
            Highlights
          </p>
          <ul className="mt-2 space-y-2">
            <SummaryBullet icon={ShieldCheck} tone="green">
              <strong>Identidad y origen verificados</strong> — coincide con
              registros previos de la comunidad.
            </SummaryBullet>
            <SummaryBullet icon={FileCheck2} tone="navy">
              <strong>{evidencesApproved} evidencias aprobadas</strong> sobre
              un total esperado de {evidencesTotal || 3}.
            </SummaryBullet>
            {(() => {
              const delta = Math.abs(caseData.scoringIA - finalScore)
              const tone: 'gold' | 'yellow' | 'red' =
                delta < 10 ? 'gold' : delta < 25 ? 'yellow' : 'red'
              const verdict =
                delta < 10
                  ? 'sin desvío significativo'
                  : delta < 25
                    ? 'desvío moderado, conviene revisar criterios'
                    : 'desvío alto, requiere validación cruzada'
              return (
                <SummaryBullet icon={Star} tone={tone}>
                  Score IA y score tutor con diferencia{' '}
                  <strong>{delta.toFixed(0)} pts</strong> — {verdict}.
                </SummaryBullet>
              )
            })()}
          </ul>
        </section>

        {/* Riesgos */}
        <section className="mt-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-navy-300">
            Riesgos identificados
          </p>
          <ul className="mt-2 space-y-2">
            {riskLevel === 'alto' && (
              <SummaryBullet icon={AlertCircle} tone="red">
                Score IA bajo ({caseData.scoringIA}) — revisar criterios de
                autenticidad y unicidad antes de avanzar.
              </SummaryBullet>
            )}
            {slaTone === 'red' && (
              <SummaryBullet icon={Clock} tone="red">
                <strong>SLA excedido</strong> — el caso supera los {sla} días
                permitidos en {STAGE_LABEL[caseData.stage]}.
              </SummaryBullet>
            )}
            {slaTone === 'yellow' && (
              <SummaryBullet icon={Clock} tone="yellow">
                <strong>SLA en zona amarilla</strong> — quedan{' '}
                {Math.max(0, sla - daysInStage)} días antes de exceder el
                límite.
              </SummaryBullet>
            )}
            {evidencesApproved < (evidencesTotal || 3) && (
              <SummaryBullet icon={FileCheck2} tone="yellow">
                Faltan {Math.max(0, (evidencesTotal || 3) - evidencesApproved)}{' '}
                evidencias por evaluar.
              </SummaryBullet>
            )}
            {riskLevel === 'bajo' && slaTone === 'green' && evidencesApproved >= (evidencesTotal || 3) && (
              <SummaryBullet icon={CheckCircle2} tone="green">
                Sin riesgos críticos detectados — el expediente está en
                condiciones de avanzar.
              </SummaryBullet>
            )}
          </ul>
        </section>

        {/* Próximos pasos */}
        <section className="mt-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-navy-300">
            Próximos pasos sugeridos
          </p>
          <ol className="mt-2 space-y-2">
            <SummaryStep n={1}>
              {caseData.stage === 'certificacion'
                ? 'Confirmar firma del tutor y emitir certificado en blockchain.'
                : `Avanzar a la siguiente etapa una vez completados los requisitos de ${STAGE_LABEL[caseData.stage]}.`}
            </SummaryStep>
            <SummaryStep n={2}>
              {evidencesApproved < (evidencesTotal || 3)
                ? 'Solicitar al postulante las evidencias faltantes vía WhatsApp.'
                : 'Validar evaluaciones finales con el coordinador del programa.'}
            </SummaryStep>
            <SummaryStep n={3}>
              Programar reunión de cierre con el solicitante en los próximos{' '}
              {Math.min(7, estClosingDays)} días.
            </SummaryStep>
          </ol>
        </section>

        {/* Tiempo estimado */}
        <section className="mt-4 rounded-2xl border border-info-300/40 bg-info-100/40 p-4">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-info-400">
            <CalendarClock className="h-3.5 w-3.5" />
            Tiempo estimado de cierre
          </div>
          <p className="mt-2 text-sm text-navy-500">
            En base al ritmo actual y los días restantes en cada etapa, este
            caso podría cerrarse en aproximadamente{' '}
            <strong>{estClosingDays} días</strong>.
          </p>
        </section>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm font-bold text-navy-500 hover:bg-neutral-100"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={() => {
              toast.success('Resumen IA exportado al expediente')
              onClose()
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-bold text-navy-500 shadow-sm hover:bg-gold-400"
          >
            <Pin className="h-4 w-4" />
            Pinear al expediente
          </button>
        </div>
      </div>
    </div>
  )
}

function KpiBox({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'green' | 'yellow' | 'red' | 'navy'
}) {
  const toneCls = {
    green: 'bg-success-100 text-success-300 ring-success-300/30',
    yellow: 'bg-warning-100 text-warning-400 ring-warning-300/40',
    red: 'bg-error-100 text-error-400 ring-error-300/40',
    navy: 'bg-neutral-100 text-navy-500 ring-neutral-300',
  }[tone]
  return (
    <div className={cn('rounded-2xl px-3 py-2 ring-1', toneCls)}>
      <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">
        {label}
      </p>
      <p className="mt-0.5 text-base font-bold">{value}</p>
    </div>
  )
}

function SummaryBullet({
  icon: Icon,
  tone,
  children,
}: {
  icon: typeof FileCheck2
  tone: 'green' | 'yellow' | 'red' | 'navy' | 'gold'
  children: ReactNode
}) {
  const toneCls = {
    green: 'bg-success-100 text-success-300',
    yellow: 'bg-warning-100 text-warning-400',
    red: 'bg-error-100 text-error-400',
    navy: 'bg-neutral-100 text-navy-500',
    gold: 'bg-gold-100 text-gold-700',
  }[tone]
  return (
    <li className="flex items-start gap-2 text-xs leading-relaxed text-navy-500">
      <span
        className={cn(
          'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
          toneCls,
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span>{children}</span>
    </li>
  )
}

function SummaryStep({
  n,
  children,
}: {
  n: number
  children: ReactNode
}) {
  return (
    <li className="flex items-start gap-3 text-xs leading-relaxed text-navy-500">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-500 text-[11px] font-bold text-white">
        {n}
      </span>
      <span>{children}</span>
    </li>
  )
}

// ─── Modal: Firmar evaluación ────────────────────────────────────────────────

function SignEvaluationModal({
  caseData,
  finalScore,
  category,
  onClose,
  onConfirm,
}: {
  caseData: TutorCase
  finalScore: number
  category: { num: 1 | 2 | 3 | null; label: string }
  onClose: () => void
  onConfirm: () => void
}) {
  const [confirmText, setConfirmText] = useState('')
  const canSign = confirmText.trim().toLowerCase() === 'firmar'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-500/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-500 text-navy-500">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <h3 className="text-lg font-bold text-navy-500">
              Firmar evaluación
            </h3>
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

        <p className="mt-3 text-sm text-navy-500">
          Estás por firmar la evaluación de{' '}
          <strong>{caseData.productName}</strong> ({caseData.id}).
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-gold-100/50 p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gold-700">
              Score final
            </p>
            <p className="mt-1 text-2xl font-bold text-navy-500">
              {finalScore}
              <span className="text-sm text-navy-300">/100</span>
            </p>
          </div>
          <div className="rounded-2xl bg-neutral-100 p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-navy-300">
              Categoría asignada
            </p>
            <p className="mt-1 text-sm font-bold text-navy-500">
              {category.num ? `${category.num}. ${category.label}` : category.label}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-warning-300/60 bg-warning-100/40 p-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-warning-400">
            Acción registrada permanentemente
          </p>
          <ul className="mt-2 space-y-1 text-xs text-navy-500">
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-3 w-3 shrink-0 text-success-300" />
              Se inscribe en el historial inmutable del caso.
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-3 w-3 shrink-0 text-success-300" />
              El postulante recibe una notificación con el resultado.
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-3 w-3 shrink-0 text-success-300" />
              El caso avanza a "Evaluación" si no estaba ya en una etapa
              posterior.
            </li>
          </ul>
        </div>

        <div className="mt-4">
          <label className="text-xs font-bold text-navy-500">
            Para confirmar, escribí <strong>firmar</strong>
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="firmar"
            autoFocus
            className="mt-1 h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
          />
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm font-bold text-navy-500 hover:bg-neutral-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!canSign}
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-bold text-navy-500 shadow-sm hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShieldCheck className="h-4 w-4" />
            Firmar evaluación
          </button>
        </div>
      </div>
    </div>
  )
}
