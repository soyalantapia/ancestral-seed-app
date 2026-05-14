import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Video,
} from 'lucide-react'
import { mockTutorAgenda } from '@/services/mocks/data'
import type { TutorAgendaItem } from '@/types'
import { cn } from '@/lib/utils'

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function labelOf(kind: TutorAgendaItem['kind']) {
  switch (kind) {
    case 'kickoff': return 'Reunión inicial'
    case 'auditoria': return 'Auditoría'
    case 'evaluacion': return 'Evaluación'
    case 'cierre': return 'Cierre'
  }
}

export default function TutorAgenda() {
  const events = mockTutorAgenda
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const year = cursor.getFullYear()
  const month = cursor.getMonth()

  const grid = useMemo(() => {
    const first = new Date(year, month, 1)
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const startWeekday = (first.getDay() + 6) % 7
    const cells: Array<Date | null> = []
    for (let i = 0; i < startWeekday; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [year, month])

  const monthEvents = events.filter((e) => {
    const d = new Date(e.scheduledAt)
    return d.getFullYear() === year && d.getMonth() === month
  })

  const dayFocus = selectedDate ?? today
  const dayEvents = events.filter((e) => sameDay(new Date(e.scheduledAt), dayFocus))

  const upcoming = events
    .map((e) => ({ ...e, d: new Date(e.scheduledAt) }))
    .filter((e) => e.d >= today)
    .sort((a, b) => a.d.getTime() - b.d.getTime())
    .slice(0, 6)

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <header>
        <h1 className="text-2xl font-bold text-navy-500 md:text-[28px]">
          Agenda
        </h1>
        <p className="mt-1 text-sm text-navy-300">
          Tus reuniones con solicitantes a lo largo del proceso.
        </p>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Calendar */}
        <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6 lg:col-span-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-navy-500 md:text-xl">
              {MONTHS[month]} {year}
            </h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setCursor(new Date(year, month - 1, 1))
                  setSelectedDate(null)
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-navy-500 hover:bg-neutral-100"
                aria-label="Mes anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setCursor(new Date(today.getFullYear(), today.getMonth(), 1))
                  setSelectedDate(today)
                }}
                className="inline-flex h-9 items-center rounded-full px-3 text-xs font-bold text-navy-500 hover:bg-neutral-100"
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={() => {
                  setCursor(new Date(year, month + 1, 1))
                  setSelectedDate(null)
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-navy-500 hover:bg-neutral-100"
                aria-label="Mes siguiente"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase tracking-widest text-navy-300">
            {WEEKDAYS.map((d, i) => (
              <div key={i}>{d}</div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1">
            {grid.map((cell, i) => {
              if (!cell) return <div key={`p-${i}`} className="aspect-square" />
              const isToday = sameDay(cell, today)
              const isSelected = selectedDate ? sameDay(cell, selectedDate) : false
              const dayEvts = monthEvents.filter((e) =>
                sameDay(new Date(e.scheduledAt), cell),
              )
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
                            e.kind === 'kickoff'
                              ? 'bg-info-400'
                              : e.kind === 'auditoria'
                                ? 'bg-warning-400'
                                : e.kind === 'evaluacion'
                                  ? 'bg-gold-500'
                                  : 'bg-success-300',
                          )}
                        />
                      ))}
                      {dayEvts.length > 3 && (
                        <span
                          className={cn(
                            'text-[9px] font-bold',
                            isToday && !isSelected
                              ? 'text-white'
                              : 'text-navy-300',
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

        {/* Aside */}
        <aside className="space-y-6 lg:col-span-4">
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
                No hay reuniones para este día.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {dayEvents.map((e) => (
                  <AgendaRow key={e.id} event={e} />
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
            <h3 className="text-base font-bold text-navy-500">Próximas</h3>
            {upcoming.length === 0 ? (
              <p className="mt-3 text-sm text-navy-300">Sin próximas reuniones.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {upcoming.map((e) => (
                  <AgendaRow key={e.id} event={e} compact />
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  )
}

function AgendaRow({
  event,
  compact,
}: {
  event: TutorAgendaItem
  compact?: boolean
}) {
  const d = new Date(event.scheduledAt)
  return (
    <li>
      <Link
        to={`/mis-certificaciones/${event.caseId}?tab=evaluacion`}
        className="flex items-start gap-3 rounded-2xl border border-neutral-200 p-3 transition-colors hover:bg-neutral-100"
      >
        <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-navy-500 text-white">
          <span className="text-base font-bold leading-none">{d.getDate()}</span>
          <span className="text-[10px] uppercase leading-tight">
            {d.toLocaleDateString('es-AR', { weekday: 'short' })}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-navy-500">
            {labelOf(event.kind)}
          </p>
          <p className="mt-0.5 truncate text-xs text-navy-300">
            {event.caseName} · {event.applicantName}
          </p>
          <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-navy-400">
            <Video className="h-3 w-3" />
            {d.toLocaleTimeString('es-AR', {
              hour: '2-digit',
              minute: '2-digit',
            })}{' '}
            · {event.durationMin}min
          </p>
        </div>
        {!compact && <ExternalLink className="mt-1 h-3.5 w-3.5 text-navy-300" />}
      </Link>
    </li>
  )
}
