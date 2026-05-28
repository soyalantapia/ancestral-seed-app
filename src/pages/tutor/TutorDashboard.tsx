import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckSquare,
  Clock,
  Download,
  FileCheck2,
  Gauge,
  MessageSquare,
  MessageSquareWarning,
  Phone,
  ShieldCheck,
  Star,
  Timer,
  TrendingDown,
  TrendingUp,
  Users,
  Video,
} from 'lucide-react'
import {
  mockPendingSignatures,
  mockTutor,
  mockTutorAgenda,
  mockTutorCases,
  mockTutorMetrics,
} from '@/services/mocks/data'
import type { ApprovalSignature, TutorTask, TutorTaskKind } from '@/types'
import { ConcentricDonut, MiniCalendar, PieChart } from '@/components/features/Charts'
import { useAutoStartTour } from '@/hooks/useAutoStartTour'
import { useTutorTasksStore } from '@/store/tutorTasks'
import { cn } from '@/lib/utils'

const periods = [
  { id: '7d', label: '7 días' },
  { id: '30d', label: '30 días' },
  { id: 'mes', label: 'Este mes' },
  { id: 'año', label: 'Este año' },
] as const
type PeriodId = (typeof periods)[number]['id']

function greetingByHour(name: string): string {
  const h = new Date().getHours()
  if (h < 12) return `Buenos días, ${name}`
  if (h < 20) return `Buenas tardes, ${name}`
  return `Buenas noches, ${name}`
}

export default function TutorDashboard() {
  // Tour guiado de 8 pasos en primera visita
  useAutoStartTour('tutor')
  const user = useAuthStore((s) => s.user)
  const firstName = user?.name?.split(' ')[0] ?? 'Tutor'
  const [period, setPeriod] = useState<PeriodId>('7d')
  const [calendarSelected, setCalendarSelected] = useState<Date | undefined>(
    undefined,
  )
  // SB11 fix: tasks vienen del store compartido (antes useState local
  // que se desincronizaba con /tutor/tareas).
  const tasks = useTutorTasksStore((s) => s.tasks)
  const toggleTask = useTutorTasksStore((s) => s.toggle)
  const [taskFilter, setTaskFilter] = useState<'all' | 'urgent' | 'today' | 'this_week'>('all')

  const cases = mockTutorCases.filter((c) => c.tutorId === mockTutor.id)
  const agenda = mockTutorAgenda

  // KPIs derivados
  const assigned = cases.length
  const inProgress = cases.filter(
    (c) => c.stage !== 'certificacion' && c.stage !== 'postulado',
  ).length
  const overdue = cases.filter((c) => c.pendingItems.length > 0 && c.risk !== 'bajo').length

  // Casos de riesgo
  const riskCounts = useMemo(() => {
    const c = { bajo: 0, medio: 0, alto: 0 }
    for (const k of cases) c[k.risk]++
    return c
  }, [cases])
  const totalRisk = riskCounts.bajo + riskCounts.medio + riskCounts.alto

  // Certificaciones donut (Planes de Mejora vs Certificaciones reales)
  const certPie = useMemo(() => {
    const finished = cases.filter((c) => c.stage === 'certificacion').length
    const improvement = cases.filter(
      (c) => c.stage === 'diagnostico' || c.stage === 'auditoria',
    ).length
    return { finished, improvement }
  }, [cases])

  const highlightedDates = agenda.map((a) => new Date(a.scheduledAt))

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-500 md:text-[28px]">
            {greetingByHour(firstName)}
          </h1>
          <p className="mt-1 text-sm text-navy-300">
            Tenés {inProgress} {inProgress === 1 ? 'caso' : 'casos'} en curso
            {overdue > 0 && (
              <>
                {', '}
                <strong className="text-error-400">
                  {overdue} {overdue === 1 ? 'atrasado' : 'atrasados'}
                </strong>
              </>
            )}
            {' '}y {tasks.filter((t) => !t.done).length} tareas pendientes.
          </p>
        </div>
        {/* Fix SM4 (#TUT-06, auditoría UX): antes el CTA "Crear
            solicitud" del header llevaba a /tutor/casos — el tutor
            esperaba abrir el modal de creación directamente. Ahora
            label coincide con el destino real: "Ver casos →". El
            modal de crear se abre desde /tutor/casos con el botón
            propio de esa página. */}
        <Link
          to="/tutor/casos"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-gold-500 px-5 text-sm font-bold text-navy-500 shadow-sm transition-colors hover:bg-gold-400"
        >
          Ver casos
          <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      {/* Period tabs + filtros */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {periods.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPeriod(p.id)}
            className={cn(
              'rounded-full px-4 py-1.5 text-xs font-bold transition-colors',
              period === p.id
                ? 'bg-gold-500 text-navy-500'
                : 'border border-neutral-300 bg-white text-navy-500 hover:bg-neutral-100',
            )}
          >
            {p.label}
          </button>
        ))}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <DropdownPill label="Período" />
          <DropdownPill label="País/Región" />
          <DropdownPill label="Categoría" />
          <DropdownPill label="Estado" />
          {/* Fix QW-C3 (auditoría UX): Exportar también era affordance
              falso (sin onClick). Mismo tratamiento que los DropdownPill
              de filtros: disabled + tooltip "Próximamente" hasta que se
              implemente el export real (CSV/PDF de métricas). */}
          <button
            type="button"
            disabled
            title="Próximamente"
            aria-label="Exportar (próximamente)"
            className="inline-flex h-9 cursor-not-allowed items-center gap-2 rounded-full border border-dashed border-neutral-300 bg-white/70 px-4 text-xs font-bold text-navy-300 opacity-60"
          >
            <Download className="h-3.5 w-3.5" />
            Exportar
          </button>
        </div>
      </div>

      {/* Main grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT */}
        <div className="space-y-6 lg:col-span-8">
          {/* Fix QW-D3 (auditoría UX): el orden anterior dejaba
              "Pendientes de mi firma" en posición #3 (después de KPIs y
              tareas) — el tutor con 3 firmas vencidas tenía que scrollear
              para verlas. Ahora arriba van LOS ACCIONABLES URGENTES
              (Pendientes de firma → Tareas hoy), después los indicadores
              (KPIs → métricas → charts). El "qué hacer ahora" precede al
              "cómo voy". */}

          {/* Pendientes de firma — accionable urgente, va primero */}
          <PendingSignaturesCard
            signatures={mockPendingSignatures}
          />

          {/* Mis tareas hoy — segundo accionable */}
          <TasksCard
            tasks={tasks}
            filter={taskFilter}
            onFilter={setTaskFilter}
            onToggle={toggleTask}
          />

          {/* KPIs — overview de carga */}
          <section
            data-tour="tutor-kpis"
            className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            {/* Fix SM4 (#TUT-03, auditoría UX): KPIs antes con delta y
                "+5 en la última semana" hardcoded — datos falsos en
                producción minaban credibilidad. Sin backend real con
                histórico, los omitimos. Si llega el backend, restaurar
                el delta computando contra el período anterior. */}
            <KpiCard
              icon={Users}
              label="Casos asignados"
              value={assigned}
              tone="navy"
            />
            <KpiCard
              icon={Clock}
              label="Casos en curso"
              value={inProgress}
              tone="info"
            />
            <KpiCard
              icon={AlertTriangle}
              label="Casos atrasados"
              value={overdue}
              tone="warning"
            />
          </section>

          {/* Métricas del tutor */}
          <TutorMetricsCard metrics={mockTutorMetrics} />

          {/* Charts row */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Casos de riesgo */}
            <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-bold text-navy-500">
                Casos de riesgo
              </h3>
              <div className="mt-4 flex justify-center">
                <ConcentricDonut
                  rings={[
                    { color: '#EF4444', value: riskCounts.alto, max: totalRisk },
                    { color: '#F59E0B', value: riskCounts.medio, max: totalRisk },
                    { color: '#22C55E', value: riskCounts.bajo, max: totalRisk },
                  ]}
                  size={200}
                  thickness={14}
                  gap={3}
                  centerLabel={totalRisk}
                  centerSub="Casos"
                />
              </div>
              <ul className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
                <Legend color="#22C55E" label="Bajo" value={`${riskCounts.bajo} casos`} />
                <Legend color="#F59E0B" label="Medio" value={`${riskCounts.medio} casos`} />
                <Legend color="#EF4444" label="Alto" value={`${riskCounts.alto} casos`} />
              </ul>
            </div>

            {/* Certificaciones */}
            <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-bold text-navy-500">
                Certificaciones
              </h3>
              <div className="mt-4 flex justify-center">
                <PieChart
                  slices={[
                    { color: '#8AA1B8', value: Math.max(certPie.improvement, 1) },
                    { color: '#001C38', value: Math.max(certPie.finished, 1) },
                  ]}
                  size={200}
                />
              </div>
              <ul className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <Legend
                  color="#8AA1B8"
                  label="Planes de Mejora"
                  value={`${pct(certPie.improvement, certPie.improvement + certPie.finished)}%`}
                />
                <Legend
                  color="#001C38"
                  label="Certificaciones"
                  value={`${pct(certPie.finished, certPie.improvement + certPie.finished)}%`}
                />
              </ul>
            </div>
          </section>

          {/* Bottom row */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TimesCard />
            <UnansweredCard />
          </section>
        </div>

        {/* RIGHT — Agenda */}
        <aside data-tour="tutor-agenda" className="space-y-3 lg:col-span-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-navy-300">
              Agenda
            </p>
            <Link
              to="/tutor/agenda"
              className="inline-flex items-center gap-1 text-xs font-bold text-gold-700 hover:underline"
            >
              Ver agenda completa
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <MiniCalendar
            highlightedDates={highlightedDates}
            selected={calendarSelected}
            onSelect={(d) => setCalendarSelected(d)}
          />
          {/* Fix SM4 (#TUT-04, #TUT-05, auditoría UX): cada item de la
              agenda muestra ahora el caso/postulante asociado, y linkea
              al expediente tutor del caso (no al panel solicitante como
              estaba antes). */}
          <ul className="space-y-2">
            {agenda.slice(0, 4).map((a) => {
              const d = new Date(a.scheduledAt)
              return (
                <li key={a.id}>
                  <Link
                    to={`/tutor/casos/${a.caseId}?tab=evaluacion`}
                    className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm transition-colors hover:border-gold-300 hover:bg-gold-50/40"
                  >
                    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-navy-500 text-white">
                      <span className="text-base font-bold leading-none">
                        {d.getDate()}
                      </span>
                      <span className="text-[10px] uppercase leading-tight">
                        {d.toLocaleDateString('es-AR', { weekday: 'short' })}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-navy-500">
                        Reunión {labelOf(a.kind)}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-navy-300">
                        <strong className="text-navy-500">
                          {a.caseName}
                        </strong>{' '}
                        · {a.applicantName}
                      </p>
                      <p className="mt-0.5 truncate text-[10px] text-navy-300">
                        {d.toLocaleDateString('es-AR', {
                          weekday: 'short',
                          day: '2-digit',
                          month: 'short',
                        })}{' '}
                        ·{' '}
                        {d.toLocaleTimeString('es-AR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </aside>
      </div>
    </div>
  )
}

function pct(part: number, total: number) {
  if (total <= 0) return 0
  return Math.round((part / total) * 100)
}

function labelOf(k: string) {
  switch (k) {
    case 'kickoff': return 'inicial'
    case 'auditoria': return 'de auditoría'
    case 'evaluacion': return 'de evaluación'
    case 'cierre': return 'de cierre'
    default: return ''
  }
}

/**
 * Pill placeholder con dropdown — lógica pendiente.
 *
 * Fix QW-C3 (auditoría UX): igual que FilterPill en TutorCases —
 * estaban en posición prominente y se veían funcionales pero al click
 * no pasaba nada, lo que minaba la confianza del tutor desde el primer
 * scroll del dashboard. Ahora se ven a la legua como "próximamente".
 */
function DropdownPill({ label }: { label: string }) {
  return (
    <button
      type="button"
      disabled
      title="Próximamente"
      aria-label={`${label} (próximamente)`}
      className="inline-flex h-9 cursor-not-allowed items-center gap-1.5 rounded-full border border-dashed border-neutral-300 bg-white/70 px-3 text-xs font-bold text-navy-300 opacity-60"
    >
      {label}
      <span className="text-navy-300">▾</span>
    </button>
  )
}

function KpiCard({
  icon: Icon,
  label,
  value,
  delta,
  deltaPositive,
  sub,
}: {
  icon: typeof Users
  label: string
  value: number
  /**
   * Fix SM4 (#TUT-03): delta + deltaPositive + sub ahora opcionales —
   * cuando no hay backend con histórico, los omitimos en vez de mostrar
   * datos falsos.
   */
  delta?: number
  deltaPositive?: boolean
  sub?: string
  tone: 'navy' | 'info' | 'warning'
}) {
  const Trend = deltaPositive ? TrendingUp : TrendingDown
  const hasDelta = typeof delta === 'number'
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-navy-500">{label}</p>
        <Icon className="h-5 w-5 text-navy-300" strokeWidth={1.5} />
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <p className="text-3xl font-bold text-navy-500 md:text-4xl">{value}</p>
        {hasDelta && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-xs font-bold',
              deltaPositive ? 'text-success-300' : 'text-error-400',
            )}
          >
            <Trend className="h-3.5 w-3.5" />
            {delta}%
          </span>
        )}
      </div>
      {sub && <p className="mt-1 text-xs text-navy-300">{sub}</p>}
    </div>
  )
}

function Legend({
  color,
  label,
  value,
}: {
  color: string
  label: string
  value: string
}) {
  return (
    <li className="inline-flex items-center gap-2">
      <span
        className="inline-block h-2.5 w-2.5 rounded-full"
        style={{ background: color }}
      />
      <span className="font-semibold text-navy-500">{label}</span>
      <span className="text-navy-300">{value}</span>
    </li>
  )
}

function TimesCard() {
  const rows = [
    { label: 'Prediagnóstico → Inicio del proceso', days: 6, max: 10 },
    { label: 'Diagnóstico → Evaluación', days: 4, max: 10 },
    { label: 'Evaluación → Certificación', days: 7, max: 10 },
  ]
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-navy-500">Tiempos promedio</h3>
        <Clock className="h-4 w-4 text-navy-300" />
      </div>
      <ul className="mt-4 space-y-4">
        {rows.map((r) => (
          <li key={r.label}>
            <div className="flex items-center justify-between text-xs">
              <span className="text-navy-500">{r.label}</span>
              <span className="font-bold text-navy-500">{r.days} días</span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-neutral-200">
              <div
                className="h-full rounded-full bg-navy-500"
                style={{ width: `${(r.days / r.max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

const TASK_ICON: Record<TutorTaskKind, typeof CheckSquare> = {
  review_evidence: FileCheck2,
  call_applicant: Phone,
  sign_evaluation: ShieldCheck,
  send_message: MessageSquare,
  audit_meeting: Video,
  verify_documentation: FileCheck2,
  review_case: CheckSquare,
}

const PRIORITY_META = {
  urgent: { label: 'Urgente', cls: 'bg-error-100 text-error-400 ring-error-300/40' },
  today: { label: 'Hoy', cls: 'bg-warning-100 text-warning-400 ring-warning-300/40' },
  this_week: { label: 'Esta semana', cls: 'bg-info-100 text-info-400 ring-info-300/40' },
}

function TasksCard({
  tasks,
  filter,
  onFilter,
  onToggle,
}: {
  tasks: TutorTask[]
  filter: 'all' | 'urgent' | 'today' | 'this_week'
  onFilter: (f: 'all' | 'urgent' | 'today' | 'this_week') => void
  onToggle: (id: string) => void
}) {
  const filtered = tasks.filter((t) => {
    if (filter === 'all') return true
    return t.priority === filter
  })
  const pending = tasks.filter((t) => !t.done)
  const counts = {
    all: tasks.length,
    urgent: tasks.filter((t) => t.priority === 'urgent').length,
    today: tasks.filter((t) => t.priority === 'today').length,
    this_week: tasks.filter((t) => t.priority === 'this_week').length,
  }

  return (
    <section
      data-tour="tutor-tareas"
      className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-navy-500">Mis tareas hoy</h3>
          <p className="mt-0.5 text-xs text-navy-300">
            {pending.length === 0
              ? 'Todo al día. Nada pendiente.'
              : `${pending.length} pendientes · prioridad por urgencia.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {(['all', 'urgent', 'today', 'this_week'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onFilter(f)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition-colors',
                filter === f
                  ? 'bg-navy-500 text-white'
                  : 'border border-neutral-300 bg-white text-navy-500 hover:bg-neutral-100',
              )}
            >
              {f === 'all'
                ? 'Todas'
                : f === 'urgent'
                  ? 'Urgentes'
                  : f === 'today'
                    ? 'Hoy'
                    : 'Esta semana'}
              <span
                className={cn(
                  'inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px]',
                  filter === f ? 'bg-gold-500 text-navy-500' : 'bg-neutral-200 text-navy-500',
                )}
              >
                {counts[f]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-neutral-300 p-6 text-center text-xs text-navy-300">
          No hay tareas en este filtro.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {filtered.map((t) => {
            const Icon = TASK_ICON[t.kind]
            const prio = PRIORITY_META[t.priority]
            return (
              <li
                key={t.id}
                className={cn(
                  'flex items-start gap-3 rounded-2xl border p-3 transition-colors',
                  t.done
                    ? 'border-neutral-200 bg-neutral-100 opacity-60'
                    : 'border-neutral-200 bg-white hover:bg-neutral-100',
                )}
              >
                <button
                  type="button"
                  onClick={() => onToggle(t.id)}
                  aria-label={t.done ? 'Reabrir tarea' : 'Marcar hecha'}
                  className={cn(
                    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors',
                    t.done
                      ? 'bg-success-300 text-white ring-1 ring-success-300'
                      : 'border-2 border-neutral-400 bg-white hover:border-success-300 hover:bg-success-100',
                  )}
                >
                  {t.done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                </button>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      'text-sm font-bold text-navy-500',
                      t.done && 'line-through',
                    )}
                  >
                    {t.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-navy-300">
                    {t.caseName} · {t.applicantName}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-bold ring-1',
                      prio.cls,
                    )}
                  >
                    {prio.label}
                  </span>
                  <Link
                    to={`/tutor/casos/${t.caseId}`}
                    className="text-[11px] font-bold text-gold-700 hover:underline"
                  >
                    Abrir →
                  </Link>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function PendingSignaturesCard({
  signatures,
}: {
  signatures: ApprovalSignature[]
}) {
  if (signatures.length === 0) return null
  return (
    <section className="rounded-3xl border-2 border-warning-300/40 bg-warning-100/40 p-5 shadow-sm md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-warning-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Pendientes de mi firma
          </p>
          <h3 className="mt-1 text-base font-bold text-navy-500">
            {signatures.length} {signatures.length === 1 ? 'caso espera' : 'casos esperan'} tu firma
          </h3>
        </div>
      </div>
      <ul className="mt-4 space-y-2">
        {signatures.map((s) => (
          <li
            key={s.id}
            className="flex flex-wrap items-center gap-3 rounded-2xl border border-warning-200 bg-white p-3 sm:flex-nowrap"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warning-100 text-warning-400">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-navy-500">{s.caseName}</p>
              <p className="mt-0.5 truncate text-xs text-navy-300">
                {s.caseId} · {s.applicantName} ·{' '}
                {new Date(s.requestedAt).toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: 'short',
                })}
              </p>
            </div>
            <Link
              to={`/tutor/casos/${s.caseId}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-navy-500 px-4 text-xs font-bold text-white transition-colors hover:bg-navy-400"
            >
              <Check className="h-3.5 w-3.5" />
              Revisar y firmar
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function TutorMetricsCard({ metrics: m }: { metrics: typeof mockTutorMetrics }) {
  const metrics = [
    {
      icon: Gauge,
      label: 'Tasa de aprobación',
      value: `${m.approvalRate}%`,
      delta: m.approvalRateDelta,
      deltaPositive: m.approvalRateDelta >= 0,
      sub: `${m.totalCertified} certificados · ${m.totalRejected} rechazados`,
    },
    {
      icon: Timer,
      label: 'Tiempo promedio por caso',
      value: `${m.avgDaysPerCase}d`,
      delta: Math.abs(m.avgDaysDelta),
      deltaPositive: m.avgDaysDelta < 0,
      sub:
        m.avgDaysDelta < 0
          ? 'mejoraste vs período anterior'
          : 'subió vs período anterior',
    },
    {
      icon: Phone,
      label: 'Tiempo de respuesta',
      value: `${m.responseTimeHours}h`,
      delta: Math.abs(m.responseTimeDelta),
      deltaPositive: m.responseTimeDelta < 0,
      sub:
        m.responseTimeDelta < 0
          ? 'más rápido que antes'
          : 'más lento que antes',
    },
    {
      icon: Star,
      label: 'Satisfacción de solicitantes',
      value: `${m.satisfactionScore}/5`,
      delta: 0.2,
      deltaPositive: true,
      sub: 'según encuestas post-proceso',
    },
  ]
  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gold-700">
            Tu performance
          </p>
          <h3 className="mt-1 text-base font-bold text-navy-500">
            Métricas del tutor — últimos 30 días
          </h3>
        </div>
        {m.overdueCases > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-error-100 px-3 py-1 text-[11px] font-bold text-error-400 ring-1 ring-error-300/40">
            <AlertTriangle className="h-3 w-3" />
            {m.overdueCases} {m.overdueCases === 1 ? 'caso vencido' : 'casos vencidos'}
          </span>
        )}
      </div>
      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(({ icon: Icon, label, value, delta, deltaPositive, sub }) => {
          const Trend = deltaPositive ? TrendingUp : TrendingDown
          return (
            <li
              key={label}
              className="rounded-2xl border border-neutral-200 bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-100 text-gold-700">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 text-[11px] font-bold',
                    deltaPositive ? 'text-success-300' : 'text-error-400',
                  )}
                >
                  <Trend className="h-3 w-3" />
                  {delta}
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold text-navy-500">{value}</p>
              <p className="mt-0.5 text-[11px] font-medium text-navy-500">
                {label}
              </p>
              <p className="mt-0.5 text-[10px] leading-tight text-navy-300">
                {sub}
              </p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function UnansweredCard() {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-navy-500">
          Solicitudes sin responder
        </h3>
        <MessageSquareWarning className="h-4 w-4 text-navy-300" />
      </div>
      <p className="mt-3 text-xs text-navy-300">Más de 48h sin respuesta</p>
      <p className="mt-2 text-4xl font-bold text-navy-500">7</p>
      <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-error-400">
        <ArrowUpRight className="h-3 w-3" />
        +5 en la última semana
      </p>
      {/* Fix SM4 (#TUT-07): el link antes navegaba a /tutor/casos sin
          filtro. Ahora pasa `?filter=unanswered` que la página puede
          interpretar para mostrar solo las sin responder (cuando esa
          lógica esté implementada en TutorCases). */}
      <Link
        to="/tutor/casos?filter=unanswered"
        className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-gold-700 hover:underline"
      >
        Ver las sin responder
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  )
}
