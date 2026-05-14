import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  ExternalLink,
} from 'lucide-react'
import { mockCertificationRequests } from '@/services/mocks/data'
import type { CertificationRequest } from '@/types'
import { cn } from '@/lib/utils'

type EventKind = 'meeting' | 'payment' | 'deadline'
type CalEvent = {
  id: string
  date: Date
  kind: EventKind
  title: string
  sub: string
  to: string
}

function buildEvents(requests: CertificationRequest[]): CalEvent[] {
  const out: CalEvent[] = []
  for (const r of requests) {
    // Meetings (programadas + pendientes + scheduled)
    for (const m of r.scheduledMeetings.concat(r.meetings)) {
      out.push({
        id: `m-${m.id}`,
        date: new Date(m.scheduledAt),
        kind: 'meeting',
        title: `Reunión con ${m.auditorName}`,
        sub: `${r.number} · ${r.productName}`,
        to: `/mis-certificaciones/${r.id}?tab=evaluacion`,
      })
    }
    // Pagos pendientes
    for (const p of r.payments ?? []) {
      if (p.status !== 'pending' && p.status !== 'overdue') continue
      out.push({
        id: `p-${p.id}`,
        date: new Date(p.dueDate),
        kind: 'payment',
        title: p.concept,
        sub: `${r.number} · ${r.productName}`,
        to: `/mis-certificaciones/${r.id}?tab=pagos`,
      })
    }
    // Diagnostic deadline (dd/MM)
    if (r.diagnosticDeadline && !r.diagnosticCompleted) {
      const [d, mo] = r.diagnosticDeadline.split('/').map(Number)
      if (d && mo) {
        const now = new Date()
        const candidate = new Date(now.getFullYear(), mo - 1, d)
        out.push({
          id: `d-${r.id}`,
          date: candidate,
          kind: 'deadline',
          title: 'Diagnóstico inicial',
          sub: `${r.number} · ${r.productName}`,
          to: `/mis-certificaciones/${r.id}?tab=evaluacion`,
        })
      }
    }
  }
  return out
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export default function Calendario() {
  const allEvents = useMemo(
    () => buildEvents(mockCertificationRequests),
    [],
  )

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const year = cursor.getFullYear()
  const month = cursor.getMonth()

  // Construir grilla de días del mes (incluyendo padding inicial)
  const grid = useMemo(() => {
    const first = new Date(year, month, 1)
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    // En España/AR la semana arranca en lunes
    const startWeekday = (first.getDay() + 6) % 7 // 0=L, 6=D
    const cells: Array<Date | null> = []
    for (let i = 0; i < startWeekday; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [year, month])

  // Eventos del mes actual
  const monthEvents = allEvents.filter(
    (e) => e.date.getFullYear() === year && e.date.getMonth() === month,
  )

  // Eventos del día seleccionado (o de hoy si no hay selección)
  const dayFocus = selectedDate ?? today
  const dayEvents = allEvents.filter((e) => sameDay(e.date, dayFocus))

  // Próximos eventos (next 30 days)
  const next30 = (() => {
    const horizon = new Date(today)
    horizon.setDate(horizon.getDate() + 30)
    return allEvents
      .filter((e) => e.date >= today && e.date <= horizon)
      .slice()
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  })()

  const goPrev = () => {
    setCursor(new Date(year, month - 1, 1))
    setSelectedDate(null)
  }
  const goNext = () => {
    setCursor(new Date(year, month + 1, 1))
    setSelectedDate(null)
  }
  const goToday = () => {
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedDate(today)
  }

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 md:px-10 md:py-10">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-500 md:text-[28px]">
            Calendario
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-navy-300 md:text-base">
            Reuniones con tutores, vencimientos de pago y deadlines de
            certificación en una sola vista.
          </p>
        </div>
      </header>

      {/* Layout principal */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Calendar */}
        <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6 lg:col-span-8">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-navy-500 md:text-xl">
              {MONTHS[month]} {year}
            </h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Mes anterior"
                className="flex h-9 w-9 items-center justify-center rounded-full text-navy-500 hover:bg-neutral-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={goToday}
                className="inline-flex h-9 items-center rounded-full px-3 text-xs font-bold text-navy-500 hover:bg-neutral-100"
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Mes siguiente"
                className="flex h-9 w-9 items-center justify-center rounded-full text-navy-500 hover:bg-neutral-100"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Leyenda */}
          <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-navy-300">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-info-400" /> Reuniones
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-warning-400" /> Pagos
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-error-400" /> Deadlines
            </span>
          </div>

          {/* Headers días */}
          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase tracking-widest text-navy-300">
            {WEEKDAYS.map((d, i) => (
              <div key={i}>{d}</div>
            ))}
          </div>

          {/* Grid */}
          <div className="mt-2 grid grid-cols-7 gap-1">
            {grid.map((cell, i) => {
              if (!cell) {
                return <div key={`pad-${i}`} className="aspect-square" />
              }
              const isToday = sameDay(cell, today)
              const isSelected = selectedDate ? sameDay(cell, selectedDate) : false
              const dayEvts = monthEvents.filter((e) => sameDay(e.date, cell))
              return (
                <button
                  key={cell.toISOString()}
                  type="button"
                  onClick={() => setSelectedDate(cell)}
                  className={cn(
                    'flex aspect-square flex-col items-center justify-start gap-0.5 rounded-xl border p-1 text-xs transition-colors sm:p-1.5',
                    isSelected
                      ? 'border-gold-500 bg-gold-100 text-navy-500 ring-1 ring-gold-300'
                      : isToday
                        ? 'border-navy-500 bg-navy-500 text-white'
                        : 'border-transparent text-navy-500 hover:bg-neutral-100',
                  )}
                >
                  <span
                    className={cn(
                      'text-[11px] font-bold sm:text-xs',
                      isToday && !isSelected && 'text-white',
                    )}
                  >
                    {cell.getDate()}
                  </span>
                  {dayEvts.length > 0 && (
                    <span className="flex items-center gap-0.5">
                      {dayEvts.slice(0, 3).map((e) => (
                        <span
                          key={e.id}
                          className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            e.kind === 'meeting'
                              ? 'bg-info-400'
                              : e.kind === 'payment'
                                ? 'bg-warning-400'
                                : 'bg-error-400',
                          )}
                        />
                      ))}
                      {dayEvts.length > 3 && (
                        <span
                          className={cn(
                            'text-[9px] font-bold',
                            isToday && !isSelected ? 'text-white' : 'text-navy-300',
                          )}
                        >
                          +{dayEvts.length - 3}
                        </span>
                      )}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </section>

        {/* Aside: día seleccionado + próximos 30 días */}
        <aside className="space-y-6 lg:col-span-4">
          {/* Día seleccionado */}
          <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-navy-500" />
              <h3 className="text-base font-bold text-navy-500">
                {sameDay(dayFocus, today)
                  ? 'Hoy'
                  : dayFocus.toLocaleDateString('es-AR', {
                      weekday: 'long',
                      day: '2-digit',
                      month: 'long',
                    })}
              </h3>
            </div>
            {dayEvents.length === 0 ? (
              <p className="mt-3 text-sm text-navy-300">
                No hay eventos para este día.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {dayEvents.map((e) => (
                  <EventRow key={e.id} event={e} />
                ))}
              </ul>
            )}
          </section>

          {/* Próximos 30 días */}
          <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
            <h3 className="text-base font-bold text-navy-500">
              Próximos 30 días
            </h3>
            {next30.length === 0 ? (
              <p className="mt-3 text-sm text-navy-300">
                Sin eventos próximos.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {next30.slice(0, 8).map((e) => {
                  const days = Math.round(
                    (e.date.getTime() - today.getTime()) / 86_400_000,
                  )
                  return (
                    <li key={e.id}>
                      <Link
                        to={e.to}
                        className="flex items-start gap-3 rounded-xl border border-neutral-200 p-3 transition-colors hover:bg-neutral-100"
                      >
                        <KindIcon kind={e.kind} />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold uppercase tracking-widest text-navy-300">
                            {e.date.toLocaleDateString('es-AR', {
                              day: '2-digit',
                              month: 'short',
                            })}
                            {' · '}
                            {days === 0 ? 'hoy' : `${days}d`}
                          </p>
                          <p className="mt-0.5 truncate text-sm font-bold text-navy-500">
                            {e.title}
                          </p>
                          <p className="truncate text-xs text-navy-300">
                            {e.sub}
                          </p>
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  )
}

function EventRow({ event }: { event: CalEvent }) {
  return (
    <li>
      <Link
        to={event.to}
        className="flex items-start gap-3 rounded-2xl border border-neutral-200 p-3 transition-colors hover:bg-neutral-100"
      >
        <KindIcon kind={event.kind} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-navy-500">{event.title}</p>
          <p className="mt-0.5 truncate text-xs text-navy-300">{event.sub}</p>
          <p className="mt-1 text-[11px] font-semibold text-navy-400">
            {event.date.toLocaleTimeString('es-AR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-navy-300" />
      </Link>
    </li>
  )
}

function KindIcon({ kind }: { kind: EventKind }) {
  const Icon =
    kind === 'meeting'
      ? CalendarClock
      : kind === 'payment'
        ? CreditCard
        : AlertCircle
  const styles =
    kind === 'meeting'
      ? 'bg-info-100 text-info-400'
      : kind === 'payment'
        ? 'bg-warning-100 text-warning-400'
        : 'bg-error-100 text-error-400'
  return (
    <span
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
        styles,
      )}
    >
      <Icon className="h-4 w-4" />
    </span>
  )
}
