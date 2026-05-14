import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Clock,
  Download,
  MessageSquareWarning,
  Plus,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react'
import {
  mockTutor,
  mockTutorAgenda,
  mockTutorCases,
} from '@/services/mocks/data'
import { ConcentricDonut, MiniCalendar, PieChart } from '@/components/features/Charts'
import { cn } from '@/lib/utils'

const periods = [
  { id: '7d', label: '7 días' },
  { id: '30d', label: '30 días' },
  { id: 'mes', label: 'Este mes' },
  { id: 'año', label: 'Este año' },
] as const
type PeriodId = (typeof periods)[number]['id']

export default function TutorDashboard() {
  const [period, setPeriod] = useState<PeriodId>('7d')
  const [calendarSelected, setCalendarSelected] = useState<Date | undefined>(
    undefined,
  )

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
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-navy-300">
            Vista general de tu actividad como tutor.
          </p>
        </div>
        <Link
          to="/tutor/casos"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-gold-500 px-5 text-sm font-bold text-navy-500 shadow-sm transition-colors hover:bg-gold-400"
        >
          <Plus className="h-4 w-4" />
          Crear solicitud
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
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 text-xs font-bold text-navy-500 transition-colors hover:bg-neutral-100"
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
          {/* KPIs */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <KpiCard
              icon={Users}
              label="Casos asignados"
              value={assigned}
              delta={8}
              deltaPositive
              sub="+5 en la última semana"
              tone="navy"
            />
            <KpiCard
              icon={Clock}
              label="Casos en curso"
              value={inProgress}
              delta={8}
              deltaPositive
              sub="+5 en la última semana"
              tone="info"
            />
            <KpiCard
              icon={AlertTriangle}
              label="Casos atrasados"
              value={overdue}
              delta={2}
              deltaPositive={false}
              sub="+1 en la última semana"
              tone="warning"
            />
          </section>

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
        <aside className="space-y-3 lg:col-span-4">
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
          <ul className="space-y-2">
            {agenda.slice(0, 4).map((a) => {
              const d = new Date(a.scheduledAt)
              return (
                <li
                  key={a.id}
                  className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm"
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
                    <p className="text-sm font-bold text-navy-500">
                      Reunión {labelOf(a.kind)}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-navy-300">
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

function DropdownPill({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 text-xs font-bold text-navy-500 transition-colors hover:bg-neutral-100"
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
  delta: number
  deltaPositive: boolean
  sub: string
  tone: 'navy' | 'info' | 'warning'
}) {
  const Trend = deltaPositive ? TrendingUp : TrendingDown
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-navy-500">{label}</p>
        <Icon className="h-5 w-5 text-navy-300" strokeWidth={1.5} />
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <p className="text-3xl font-bold text-navy-500 md:text-4xl">{value}</p>
        <span
          className={cn(
            'inline-flex items-center gap-0.5 text-xs font-bold',
            deltaPositive ? 'text-success-300' : 'text-error-400',
          )}
        >
          <Trend className="h-3.5 w-3.5" />
          {delta}%
        </span>
      </div>
      <p className="mt-1 text-xs text-navy-300">{sub}</p>
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
      <Link
        to="/tutor/casos"
        className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-gold-700 hover:underline"
      >
        Ver todas las solicitudes
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  )
}
