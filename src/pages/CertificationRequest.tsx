import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { mockCertificationRequests } from '@/services/mocks/data'
import { StagePipeline, StageStatusBadge } from '@/components/features/StagePipeline'
import type {
  AuditMeeting,
  AuditMeetingStatus,
  RequestStageItem,
} from '@/types'
import { cn } from '@/lib/utils'

const tabs = [
  'Seguimiento',
  'Evaluación',
  'Datos de la solicitud',
  'Evidencias',
  'Pagos',
  'Historial',
] as const

type Tab = (typeof tabs)[number]

export default function CertificationRequest() {
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const tabParam = params.get('tab')
  const initialTab: Tab =
    tabParam === 'evaluacion' ? 'Evaluación'
    : tabParam === 'evidencias' ? 'Evidencias'
    : tabParam === 'datos' ? 'Datos de la solicitud'
    : tabParam === 'pagos' ? 'Pagos'
    : tabParam === 'historial' ? 'Historial'
    : 'Seguimiento'
  const [tab, setTab] = useState<Tab>(initialTab)
  const [reschedule, setReschedule] = useState<AuditMeeting | null>(null)
  const [confirmReject, setConfirmReject] = useState<AuditMeeting | null>(null)
  const [meetings, setMeetings] = useState<AuditMeeting[]>(
    mockCertificationRequests[0].meetings,
  )

  const request = mockCertificationRequests.find((r) => r.id === id) ?? mockCertificationRequests[0]
  if (!request) return <NotFound />

  const updateMeeting = (id: string, status: AuditMeetingStatus) => {
    setMeetings((ms) => ms.map((m) => (m.id === id ? { ...m, status } : m)))
  }

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-8 md:px-10 md:py-10">
      <Link
        to="/mis-certificaciones"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-300 hover:text-navy-500"
      >
        <ArrowLeft className="h-4 w-4" />
        Mis certificaciones
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-navy-500 md:text-[28px]">
        Solicitud de certificación · <span className="text-navy-300">{request.number}</span>
      </h1>

      <div className="mt-3 flex flex-col gap-2 text-sm text-navy-500">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-navy-300" />
          <span className="font-bold">Fecha de creación:</span>
          <span>{request.createdAt}</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-navy-300" />
          <span className="font-bold">Pendientes:</span>
          <span>{request.pendingItems.join('  /  ')}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 overflow-x-auto">
        <div className="flex gap-2">
          {tabs.map((t) => {
            const slug =
              t === 'Evaluación' ? 'evaluacion'
              : t === 'Evidencias' ? 'evidencias'
              : t === 'Datos de la solicitud' ? 'datos'
              : t === 'Pagos' ? 'pagos'
              : t === 'Historial' ? 'historial'
              : ''
            return (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTab(t)
                  if (slug) setParams({ tab: slug }, { replace: true })
                  else setParams({}, { replace: true })
                }}
                className={cn(
                  'whitespace-nowrap rounded-full px-5 py-2 text-sm font-bold transition-colors',
                  tab === t
                    ? 'bg-gold-100 text-gold-700 ring-1 ring-gold-300'
                    : 'text-navy-300 hover:bg-neutral-100 hover:text-navy-500',
                )}
              >
                {t}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-8">
        {tab === 'Seguimiento' && <SeguimientoTab request={request} />}
        {tab === 'Evaluación' && (
          <EvaluacionTab
            deadline={request.diagnosticDeadline ?? '15/03'}
            meetings={meetings}
            onAccept={(id) => {
              updateMeeting(id, 'accepted')
              toast.success('Reunión aceptada')
            }}
            onReject={(m) => setConfirmReject(m)}
            onReschedule={(m) => setReschedule(m)}
          />
        )}
        {tab === 'Datos de la solicitud' && <DatosTab />}
        {tab === 'Evidencias' && <EvidenciasTab />}
        {tab === 'Pagos' && <PagosTab />}
        {tab === 'Historial' && <HistorialTab />}
      </div>

      <RescheduleSheet
        meeting={reschedule}
        onClose={() => setReschedule(null)}
        onSubmit={(meeting, isoDate) => {
          updateMeeting(meeting.id, 'rescheduled')
          setReschedule(null)
          toast.success(`Solicitud de reprogramación enviada · ${isoDate}`)
        }}
      />

      <ConfirmRejectDialog
        meeting={confirmReject}
        onClose={() => setConfirmReject(null)}
        onConfirm={(id) => {
          updateMeeting(id, 'rejected')
          setConfirmReject(null)
          toast.success('Reunión rechazada · El tutor será notificado')
        }}
      />
    </div>
  )
}

function ConfirmRejectDialog({
  meeting,
  onClose,
  onConfirm,
}: {
  meeting: AuditMeeting | null
  onClose: () => void
  onConfirm: (id: string) => void
}) {
  if (!meeting) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-500/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error-100 text-error-400">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-lg font-bold text-navy-500">
          ¿Rechazar esta reunión?
        </h3>
        <p className="mt-2 text-sm text-navy-300">
          Vas a notificar a <strong>{meeting.auditorName}</strong> que no podés
          asistir a la reunión del <strong>{formatDM(meeting.scheduledAt).trim()}</strong> a las{' '}
          <strong>{formatHour(meeting.scheduledAt)}</strong>. Tu solicitud puede demorar más en avanzar.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-navy-500 transition-colors hover:bg-neutral-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(meeting.id)}
            className="inline-flex items-center justify-center rounded-full bg-error-400 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-error-300"
          >
            Sí, rechazar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Tab: Seguimiento ────────────────────────────────────────────────────────

function SeguimientoTab({
  request,
}: {
  request: (typeof mockCertificationRequests)[number]
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-navy-500">
              Tu certificación en proceso
            </h2>
            <p className="mt-1 text-sm text-navy-300">{request.productName}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-navy-300">
            Estado actual:
            <StageStatusBadge status="Preadiagnóstico" />
          </div>
        </div>

        <div className="mt-6">
          <StagePipeline stages={request.stages} />
        </div>

        <div className="mt-6">
          <Link
            to={`?tab=evidencias`}
            className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-500 shadow-sm transition-colors hover:bg-gold-400"
          >
            <Plus className="h-4 w-4" />
            Añadir evidencias
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
        <h3 className="text-lg font-bold text-navy-500">
          Detalles de seguimiento de solicitud
        </h3>
        <p className="mt-1 text-sm text-navy-300">{request.productName}</p>

        <Timeline stages={request.stages} />
      </section>
    </div>
  )
}

function Timeline({ stages }: { stages: RequestStageItem[] }) {
  return (
    <ol className="relative mt-6 ml-3 border-l border-neutral-200 pl-6">
      {stages.map((s, i) => {
        const active = s.status === 'in_progress'
        const done = s.status === 'completed'
        return (
          <li key={s.stage} className={cn(i < stages.length - 1 && 'pb-6')}>
            <span
              className={cn(
                'absolute -left-[7px] flex h-3 w-3 items-center justify-center rounded-full border-2',
                active && 'border-info-300 bg-white',
                done && 'border-success-300 bg-success-300',
                !active && !done && 'border-neutral-400 bg-white',
              )}
              aria-hidden
            />
            <div className="flex items-center justify-between gap-3">
              <div>
                <p
                  className={cn(
                    'text-base font-bold',
                    active || done ? 'text-navy-500' : 'text-navy-300',
                  )}
                >
                  {s.label}
                </p>
                {s.date && (
                  <p className="mt-0.5 text-xs text-navy-300">{s.date}</p>
                )}
                {s.description && (
                  <p className="mt-0.5 text-xs text-navy-300">
                    {s.description}
                  </p>
                )}
              </div>
              {active && (
                <span className="rounded-full bg-info-100 px-3 py-1 text-xs font-semibold text-info-400">
                  En progreso
                </span>
              )}
              {!active && !done && (
                <span className="rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold text-gold-700">
                  Pendiente
                </span>
              )}
              {done && (
                <span className="rounded-full bg-success-100 px-3 py-1 text-xs font-semibold text-success-300">
                  Completado
                </span>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

// ─── Tab: Evaluación ─────────────────────────────────────────────────────────

function EvaluacionTab({
  deadline,
  meetings,
  onAccept,
  onReject,
  onReschedule,
}: {
  deadline: string
  meetings: AuditMeeting[]
  onAccept: (id: string) => void
  onReject: (m: AuditMeeting) => void
  onReschedule: (m: AuditMeeting) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-navy-500">Evaluación</h2>
        <p className="mt-1 text-sm text-navy-300">
          Gestioná las instancias necesarias para avanzar hacia la emisión de tu certificación.
        </p>
      </div>

      {/* Diagnóstico */}
      <section>
        <header className="rounded-t-2xl bg-neutral-200 px-5 py-3 text-base font-bold text-navy-500">
          Diagnóstico
        </header>
        <div className="rounded-b-2xl border border-t-0 border-neutral-200 bg-white p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning-300" />
            <p className="text-sm text-navy-500">
              Respondé el diagnóstico solicitado por el tutor para continuar con
              el proceso
            </p>
          </div>
          <p className="mt-3 text-sm font-bold text-navy-500">
            Fecha límite: <span className="font-medium">{deadline}</span>
          </p>
          <button
            type="button"
            onClick={() => toast.info('Abriendo cuestionario de diagnóstico…')}
            className="mt-4 inline-flex items-center rounded-full bg-navy-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-400"
          >
            Completar diagnóstico
          </button>
        </div>
      </section>

      {/* Auditorías pendientes */}
      <section>
        <header className="rounded-t-2xl bg-neutral-200 px-5 py-3 text-base font-bold text-navy-500">
          Auditorías pendientes
        </header>
        <div className="space-y-4 rounded-b-2xl border border-t-0 border-neutral-200 bg-white p-5">
          {meetings.length === 0 && (
            <p className="text-sm text-navy-300">No hay auditorías pendientes.</p>
          )}
          {meetings.map((m) => (
            <article key={m.id} className="rounded-2xl border border-neutral-200 bg-white p-5">
              <dl className="space-y-1.5 text-sm">
                <Field label="Auditor:" value={m.auditorName} />
                <Field label="Tipo de reunión:" value={m.type} />
                <Field
                  label="Fecha y hora:"
                  value={`${formatDM(m.scheduledAt)}— ${formatHour(m.scheduledAt)} (${m.timezone})`}
                />
                <div className="pt-2">
                  <p className="font-bold text-navy-500">Mensaje</p>
                  <p className="mt-1 text-navy-300">{m.message}</p>
                </div>
              </dl>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onAccept(m.id)}
                  disabled={m.status === 'accepted'}
                  className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2 text-sm font-semibold text-navy-500 shadow-sm transition-colors hover:bg-gold-400 disabled:opacity-60"
                >
                  <Check className="h-4 w-4" />
                  {m.status === 'accepted' ? 'Aceptada' : 'Aceptar'}
                </button>
                <button
                  type="button"
                  onClick={() => onReschedule(m)}
                  className="inline-flex items-center gap-2 rounded-full border border-navy-500 bg-white px-4 py-2 text-sm font-semibold text-navy-500 transition-colors hover:bg-navy-500 hover:text-white disabled:opacity-60"
                >
                  <Clock className="h-4 w-4" />
                  Reprogramar
                </button>
                <button
                  type="button"
                  onClick={() => onReject(m)}
                  disabled={m.status === 'rejected'}
                  className="ml-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-error-400 transition-colors hover:bg-error-100 disabled:opacity-60"
                >
                  <X className="h-4 w-4" />
                  {m.status === 'rejected' ? 'Rechazada' : 'Rechazar'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Auditorías programadas */}
      <section>
        <header className="rounded-t-2xl bg-neutral-200 px-5 py-3 text-base font-bold text-navy-500">
          Auditorías programadas
        </header>
        <div className="rounded-b-2xl border border-t-0 border-neutral-200 bg-white p-5 text-center text-sm text-navy-300">
          No tienes auditorías programadas en este momento
        </div>
      </section>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="font-bold text-navy-500">{label}</span>{' '}
      <span className="text-navy-500">{value}</span>
    </div>
  )
}

function formatDM(iso: string) {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} `
}
function formatHour(iso: string) {
  const d = new Date(iso)
  const h = d.getHours()
  const m = String(d.getMinutes()).padStart(2, '0')
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${((h + 11) % 12) + 1}:${m} ${ampm}`
}

// ─── Tabs stubs ──────────────────────────────────────────────────────────────

function DatosTab() {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
      <h2 className="text-lg font-bold text-navy-500">Datos de la solicitud</h2>
      <p className="mt-2 text-sm text-navy-300">
        Resumen de los datos que enviaste en el formulario. Próximamente podrás
        editar campos antes de la auditoría.
      </p>
    </div>
  )
}

function EvidenciasTab() {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
      <h2 className="text-lg font-bold text-navy-500">Evidencias</h2>
      <p className="mt-2 text-sm text-navy-300">
        Subí o reemplazá las evidencias asociadas a tu solicitud.
      </p>
    </div>
  )
}

function PagosTab() {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
      <h2 className="text-lg font-bold text-navy-500">Pagos</h2>
      <p className="mt-2 text-sm text-navy-300">
        Historial de pagos y comprobantes.
      </p>
    </div>
  )
}

function HistorialTab() {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
      <h2 className="text-lg font-bold text-navy-500">Historial</h2>
      <p className="mt-2 text-sm text-navy-300">
        Línea de tiempo de toda la actividad asociada a esta solicitud.
      </p>
    </div>
  )
}

function NotFound() {
  return (
    <div className="px-10 py-20 text-center">
      <p className="text-sm text-navy-300">Solicitud no encontrada.</p>
    </div>
  )
}

// ─── Reschedule drawer ───────────────────────────────────────────────────────

function RescheduleSheet({
  meeting,
  onClose,
  onSubmit,
}: {
  meeting: AuditMeeting | null
  onClose: () => void
  onSubmit: (meeting: AuditMeeting, formatted: string) => void
}) {
  const today = new Date()
  const [month, setMonth] = useState(today.getMonth())
  const [year, setYear] = useState(today.getFullYear())
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate())
  const [hour, setHour] = useState('09:00 — 10:00')
  const [reason, setReason] = useState('')

  if (!meeting) return null

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ]
  const monthLabel = `${monthNames[month]} ${year}`

  // Build calendar grid
  const first = new Date(year, month, 1)
  const startDay = (first.getDay() + 6) % 7 // Mon = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: Array<number | null> = []
  for (let i = 0; i < startDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  // Helper to detect past dates
  const isPast = (d: number) => {
    const cellDate = new Date(year, month, d)
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    return cellDate < todayMidnight
  }
  const isAllMonthPast =
    year < today.getFullYear() ||
    (year === today.getFullYear() && month < today.getMonth())

  const prevMonth = () => {
    if (isAllMonthPast) return // shouldn't be possible with the guard below but safe
    if (month === 0) { setMonth(11); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }

  const canGoPrev =
    year > today.getFullYear() ||
    (year === today.getFullYear() && month > today.getMonth())

  const monthShort = monthNames[month].slice(0, 3)
  const summary = selectedDay ? `${monthShort}, ${selectedDay}  ${hour}` : ''

  const timeSlots = [
    '08:00 — 09:00',
    '09:00 — 10:00',
    '10:00 — 11:00',
    '11:00 — 12:00',
    '12:00 — 13:00',
    '14:00 — 15:00',
    '15:00 — 16:00',
    '16:00 — 17:00',
    '17:00 — 18:00',
    '18:00 — 19:00',
  ]

  return (
    <div className="fixed inset-0 z-50 bg-navy-500/30 backdrop-blur-sm" onClick={onClose}>
      <aside
        className="ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-neutral-200 px-6 py-5">
          <button type="button" onClick={onClose} className="text-navy-500" aria-label="Volver">
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <h2 className="text-xl font-bold text-navy-500">Reprogramar reunión</h2>
          <p className="mt-1 text-sm text-navy-300">
            Elige una fecha alternativa y enviá la solicitud al tutor.
          </p>

          {/* Calendar */}
          <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-navy-500">{monthLabel}</p>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={prevMonth}
                  disabled={!canGoPrev}
                  className="rounded-full p-1 text-navy-500 hover:bg-neutral-200 disabled:opacity-40 disabled:hover:bg-transparent"
                  aria-label="Mes anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="rounded-full p-1 text-navy-500 hover:bg-neutral-200"
                  aria-label="Mes siguiente"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-7 text-center text-xs font-medium text-navy-300">
              {['Lu', 'Ma', 'Mie', 'Jue', 'Vie', 'Sa', 'Do'].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-y-2 text-center text-sm">
              {cells.map((d, i) => {
                const past = d !== null && isPast(d)
                const selected = d !== null && selectedDay === d
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={d === null || past}
                    onClick={() => d !== null && !past && setSelectedDay(d)}
                    className={cn(
                      'mx-auto flex h-9 w-9 items-center justify-center rounded-full font-semibold transition-colors',
                      d === null && 'text-transparent',
                      d !== null && past && 'text-navy-300/50 line-through',
                      d !== null && !past && selected && 'bg-gold-500 text-navy-500',
                      d !== null && !past && !selected && 'text-navy-500 hover:bg-neutral-200',
                    )}
                  >
                    {d ?? ''}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Hora */}
          <div className="mt-6">
            <p className="text-sm font-bold text-navy-500">Hora</p>
            <select
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
            >
              {timeSlots.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            {summary && (
              <p className="mt-2 inline-flex items-center gap-2 text-sm text-navy-500">
                <CalendarIcon className="h-4 w-4 text-navy-300" />
                {summary}
              </p>
            )}
          </div>

          {/* Motivo */}
          <div className="mt-6">
            <p className="text-sm font-bold text-navy-500">Motivo de reprogramación</p>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
            >
              <option value="">Seleccionar</option>
              <option value="conflicto">Conflicto de horario</option>
              <option value="documentos">Necesito más tiempo para documentos</option>
              <option value="comunidad">Reunión comunitaria</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        </div>

        <div className="border-t border-neutral-200 px-6 py-4">
          <button
            type="button"
            onClick={() => {
              if (!selectedDay) return toast.error('Elegí una fecha')
              if (!reason) return toast.error('Elegí un motivo')
              onSubmit(meeting, summary)
            }}
            className="w-full rounded-full bg-navy-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-400"
          >
            Enviar solicitud de reprogramación
          </button>
        </div>
      </aside>
    </div>
  )
}
