import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
/* eslint-disable react-hooks/exhaustive-deps */
import { useEscape } from '@/hooks/useEscape'
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  File as FileIcon,
  Film,
  Image as ImageIcon,
  MessageSquare,
  Plus,
  Receipt,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { mockCertificationRequests } from '@/services/mocks/data'
import { StagePipeline, StageStatusBadge } from '@/components/features/StagePipeline'
import type {
  AuditMeeting,
  AuditMeetingStatus,
  CertificationRequest as CertificationRequestType,
  EvidenceFile,
  HistoryEvent,
  HistoryEventKind,
  RequestStageItem,
  TutorMessage,
} from '@/types'
import { REGLAMENTO_DEADLINES, STAGES } from '@/lib/copy'
import { useCoverByRequestStore } from '@/store/coverByRequest'
import { cn } from '@/lib/utils'

// Fix UX (revisión postulante): la barra tenía 6 tabs que se cortaban en
// mobile y mezclaban acción con referencia. Dejamos 4 tabs accionables;
// "Datos de la solicitud" e "Historial" pasan a acordeones al pie (son
// referencia, no flujo de acción).
const tabs = [
  'Seguimiento',
  'Evaluación',
  'Auditoría',
  'Evidencias',
  'Datos',
  'Historial',
] as const

type Tab = (typeof tabs)[number]

function tabFromParam(p: string | null): Tab {
  if (p === 'evaluacion') return 'Evaluación'
  if (p === 'auditoria') return 'Auditoría'
  if (p === 'evidencias') return 'Evidencias'
  if (p === 'datos') return 'Datos'
  if (p === 'historial') return 'Historial'
  return 'Seguimiento'
}

export default function CertificationRequest() {
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const tab = tabFromParam(params.get('tab'))
  const setTab = (t: Tab) => {
    const slug =
      t === 'Evaluación' ? 'evaluacion'
      : t === 'Auditoría' ? 'auditoria'
      : t === 'Evidencias' ? 'evidencias'
      : t === 'Datos' ? 'datos'
      : t === 'Historial' ? 'historial'
      : ''
    if (slug) setParams({ tab: slug }, { replace: true })
    else setParams({}, { replace: true })
  }
  // Resolver request por id (puede ser undefined)
  const request = mockCertificationRequests.find((r) => r.id === id)

  const [reschedule, setReschedule] = useState<AuditMeeting | null>(null)
  const [confirmReject, setConfirmReject] = useState<AuditMeeting | null>(null)
  // Init seguro: usa las meetings del request actual (o [] si no existe)
  const [meetings, setMeetings] = useState<AuditMeeting[]>(
    () => request?.meetings ?? [],
  )
  const [diagnosticOpen, setDiagnosticOpen] = useState(false)
  const [threadFor, setThreadFor] = useState<AuditMeeting | null>(null)
  const [tutorFor, setTutorFor] = useState<string | null>(null)

  // Re-sync cuando cambia la URL (id) — evita mostrar meetings del request anterior
  useEffect(() => {
    setMeetings(request?.meetings ?? [])
    setReschedule(null)
    setConfirmReject(null)
    setThreadFor(null)
    setTutorFor(null)
    setDiagnosticOpen(false)
  }, [id])

  if (!request) return <RequestNotFound />

  const updateMeeting = (id: string, status: AuditMeetingStatus) => {
    setMeetings((ms) => ms.map((m) => (m.id === id ? { ...m, status } : m)))
  }

  // Compute progress percentage from stages
  const stagesArr = request.stages
  const stageProgress = (() => {
    const total = stagesArr.length
    const idx = stagesArr.findIndex((s) => s.status === 'in_progress')
    const done = stagesArr.filter((s) => s.status === 'completed').length
    if (idx === -1) return Math.round((done / total) * 100)
    return Math.round(((done + 0.5) / total) * 100)
  })()
  const currentStageLabel =
    stagesArr.find((s) => s.status === 'in_progress')?.label ??
    stagesArr.filter((s) => s.status === 'completed').slice(-1)[0]?.label ??
    'Sin avances'

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 md:px-10 md:py-8">
      <Link
        to="/mis-certificaciones"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-300 hover:text-navy-500"
      >
        <ArrowLeft className="h-4 w-4" />
        Mis certificaciones
      </Link>

      {/* El bloque "Tu próximo paso" se movió a la pestaña Notificaciones,
          que ahora centraliza TODAS las alertas accionables (pagos,
          propuestas del tutor, diagnóstico, apelaciones) en un solo lugar.
          Ver src/lib/alerts.ts + pages/Notifications.tsx. */}

      {/* Hero summary card */}
      <section className="mt-4 overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto]">
          {/* Left: info */}
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-neutral-200 px-2.5 py-0.5 text-[11px] font-bold text-navy-500">
                {request.number}
              </span>
              {/* Fix QW-A4 (auditoría UX): badge antes mentía con
                  "Prediagnóstico" aunque la solicitud estuviera en
                  Diagnóstico/Auditoría/Evaluación. Ahora deriva del
                  currentStage real, con "En emisión" como override
                  cuando ya entró a esa fase administrativa. */}
              <StageStatusBadge
                status={
                  request.status === 'En emisión'
                    ? 'En emisión'
                    : request.status === 'Certificado'
                      ? 'Vigente'
                      : request.status === 'Denegada'
                        ? 'Denegada'
                        : STAGES[request.currentStage]?.label ?? 'En curso'
                }
              />
              {request.pendingItems.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-error-100 px-2.5 py-0.5 text-[11px] font-bold text-error-400 ring-1 ring-error-200">
                  <AlertTriangle className="h-3 w-3" />
                  {request.pendingItems.length} pendiente{request.pendingItems.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <h1 className="mt-3 text-2xl font-bold text-navy-500 md:text-[28px]">
              {request.productName}
            </h1>

            {/* Progress */}
            <div className="mt-5">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-bold text-navy-500">
                  Etapa actual: <span className="text-gold-700">{currentStageLabel}</span>
                </span>
                <span className="font-bold text-navy-500">{stageProgress}%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-200">
                <div
                  className="h-full rounded-full bg-gold-500 transition-all"
                  style={{ width: `${stageProgress}%` }}
                />
              </div>
              {/* SM6 fix: aviso reglamentario del umbral mínimo. */}
              <p className="mt-2 text-[11px] text-navy-300">
                La Licencia se emite con puntaje mínimo del{' '}
                <strong className="text-navy-500">
                  {REGLAMENTO_DEADLINES.minimumScoreToIssueLicense}%
                </strong>{' '}
                en la auditoría (Reglamento cláusula 1.5).
              </p>
            </div>

            {/* Meta stats */}
            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-sm lg:grid-cols-3">
              <Meta icon={CalendarIcon} label="Creación" value={request.createdAt} />
              <Meta icon={Clock} label="Última actividad" value={formatLastActivity(request)} />
              <Meta icon={Award} label="Tutor" value={request.meetings[0]?.auditorName ?? request.scheduledMeetings[0]?.auditorName ?? 'Por asignar'} />
            </dl>
            {/* Aviso de inactividad — solo si la solicitud está activa
                (no aplica a una emitida ni a una denegada). Colapsable
                para no intimidar. */}
            {(request.status === 'En curso' ||
              request.status === 'En emisión') && (
              <details className="mt-3 text-[11px] text-navy-300">
                <summary className="inline-flex cursor-pointer list-none items-center font-medium text-navy-400 underline-offset-2 hover:text-navy-500 hover:underline">
                  ¿Hay un plazo para responder?
                </summary>
                <p className="mt-1 leading-relaxed">
                  Si pasan{' '}
                  <strong className="text-navy-500">
                    {REGLAMENTO_DEADLINES.inactivityDaysToCloseCase} días corridos
                  </strong>{' '}
                  sin novedades de tu parte (respuestas, evidencias o pagos), la
                  solicitud se cierra y la podés reabrir cuando quieras
                  (Reglamento 1.5).
                </p>
              </details>
            )}

            {/* Certificación emitida → accesos a renovar / plan de mejora
                (antes eran rutas huérfanas sin punto de entrada). */}
            {request.status === 'Certificado' && (
              <div className="mt-6 flex flex-wrap gap-2">
                <Link
                  to={`/mis-certificaciones/${request.id}/renovar`}
                  className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-4 py-2 text-sm font-bold text-navy-500 shadow-sm transition-colors hover:bg-gold-400"
                >
                  <RefreshCw className="h-4 w-4" />
                  Renovar certificación
                </Link>
                <Link
                  to={`/mis-certificaciones/${request.id}/plan-mejora`}
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-navy-500 transition-colors hover:bg-neutral-100"
                >
                  <Sparkles className="h-4 w-4" />
                  Plan de mejora
                </Link>
              </div>
            )}

            {/* Certificación denegada → acceso a la apelación. */}
            {request.status === 'Denegada' && (
              <div className="mt-6 flex flex-wrap gap-2">
                <Link
                  to={`/mis-certificaciones/${request.id}/apelar`}
                  className="inline-flex items-center gap-2 rounded-full bg-error-400 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-error-300"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Apelar la denegación
                </Link>
              </div>
            )}

          </div>

          {/* Right: decorative pattern */}
          <div className="hidden bg-pattern-aztec lg:block lg:w-56" aria-hidden />
        </div>
      </section>

      {/* Sticky tabs */}
      <div
        data-tour="seguimiento"
        className="sticky top-16 z-10 -mx-4 mt-6 overflow-x-auto border-b border-neutral-200 bg-white/95 px-4 backdrop-blur [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6 md:top-20 md:-mx-10 md:px-10"
      >
        <div className="flex gap-1 py-3">
          {tabs.map((t) => {
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  'whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition-colors',
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
          <EvaluacionTab onOpenDiagnostic={() => setDiagnosticOpen(true)} />
        )}
        {tab === 'Auditoría' && (
          <AuditoriaTab
            meetings={meetings}
            onAccept={(id) => {
              updateMeeting(id, 'accepted')
              toast.success('Reunión aceptada')
            }}
            onReject={(m) => setConfirmReject(m)}
            onReschedule={(m) => setReschedule(m)}
            onOpenThread={(m) => setThreadFor(m)}
            onOpenTutor={(name) => setTutorFor(name)}
            threads={request.threads ?? {}}
          />
        )}
        {tab === 'Evidencias' && <EvidenciasTab request={request} />}
        {tab === 'Datos' && <DatosTab request={request} />}
        {tab === 'Historial' && <HistorialTab request={request} />}
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

      <DiagnosticDialog
        open={diagnosticOpen}
        onClose={() => setDiagnosticOpen(false)}
      />

      <MessageThreadSheet
        meeting={threadFor}
        thread={threadFor ? request.threads?.[threadFor.id] ?? [] : []}
        onClose={() => setThreadFor(null)}
      />

      <TutorSheet
        name={tutorFor}
        onClose={() => setTutorFor(null)}
        onMessage={() => {
          const meeting =
            meetings.find((m) => m.auditorName === tutorFor) ??
            request.scheduledMeetings.find((m) => m.auditorName === tutorFor)
          if (meeting) {
            setTutorFor(null)
            setThreadFor(meeting)
          }
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
  useEscape(Boolean(meeting), onClose)
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
            {/* Fix QW-A4 (auditoría UX): igual que el hero — derivar del
                currentStage. */}
            <StageStatusBadge
              status={STAGES[request.currentStage]?.label ?? 'En curso'}
            />
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
  onOpenDiagnostic,
}: {
  onOpenDiagnostic: () => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-navy-500">Evaluación</h2>
        <p className="mt-1 text-sm text-navy-300">
          El diagnóstico inicial lo completa tu tutor a partir de tus evidencias
          y la auditoría cultural. Acá podés ver lo que registró.
        </p>
      </div>

      {/* Diagnóstico — lo completa el tutor; el postulante solo lo ve */}
      <section>
        <header className="flex flex-wrap items-center gap-2 rounded-t-2xl bg-neutral-200 px-5 py-3 text-base font-bold text-navy-500">
          Diagnóstico
          <span className="inline-flex items-center gap-1 rounded-full bg-success-100 px-2.5 py-0.5 text-xs font-bold text-success-700 ring-1 ring-success-300/40">
            <Check className="h-3 w-3" /> Completado por tu tutor
          </span>
        </header>
        <div className="rounded-b-2xl border border-t-0 border-neutral-200 bg-white p-5">
          <p className="text-sm text-navy-500">
            Tu tutor revisó tu caso y registró el diagnóstico inicial. Lo completa
            el equipo de certificación; vos podés leerlo cuando quieras.
          </p>
          <button
            type="button"
            onClick={onOpenDiagnostic}
            className="mt-4 inline-flex items-center rounded-full bg-navy-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-400"
          >
            Ver diagnóstico del tutor
          </button>
        </div>
      </section>
    </div>
  )
}

function AuditoriaTab({
  meetings,
  onAccept,
  onReject,
  onReschedule,
  onOpenThread,
  onOpenTutor,
  threads,
}: {
  meetings: AuditMeeting[]
  onAccept: (id: string) => void
  onReject: (m: AuditMeeting) => void
  onReschedule: (m: AuditMeeting) => void
  onOpenThread: (m: AuditMeeting) => void
  onOpenTutor: (name: string) => void
  threads: Record<string, TutorMessage[]>
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-navy-500">Auditoría</h2>
        <p className="mt-1 text-sm text-navy-300">
          Coordiná las instancias de auditoría cultural con tu tutor para avanzar
          hacia la emisión de tu certificación.
        </p>
      </div>

      {/* Auditorías pendientes */}
      <section>
        <header className="rounded-t-2xl bg-neutral-200 px-5 py-3 text-base font-bold text-navy-500">
          Auditorías pendientes
        </header>
        <div className="space-y-4 rounded-b-2xl border border-t-0 border-neutral-200 bg-white p-5">
          {meetings.length === 0 && (
            <p className="text-sm text-navy-300">No hay auditorías pendientes.</p>
          )}
          {meetings.map((m) => {
            const thread = threads[m.id] ?? []
            return (
            <article key={m.id} className="rounded-2xl border border-neutral-200 bg-white p-5">
              <dl className="space-y-1.5 text-sm">
                <div>
                  <span className="font-bold text-navy-500">Tutor:</span>{' '}
                  <button
                    type="button"
                    onClick={() => onOpenTutor(m.auditorName)}
                    className="font-medium text-navy-500 underline-offset-2 hover:text-gold-700 hover:underline"
                  >
                    {m.auditorName}
                  </button>
                </div>
                <Field label="Tipo de reunión:" value={m.type} />
                <Field
                  label="Fecha y hora:"
                  value={`${formatDM(m.scheduledAt)}— ${formatHour(m.scheduledAt)} (${m.timezone})`}
                />
                <div className="pt-2">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-navy-500">Mensaje</p>
                    <button
                      type="button"
                      onClick={() => onOpenThread(m)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-700 hover:underline"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      {thread.length > 0 ? `Ver thread (${thread.length})` : 'Responder'}
                    </button>
                  </div>
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
          )})}
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

// ─── Tab: Datos de la solicitud ──────────────────────────────────────────────

function DatosTab({ request }: { request: CertificationRequestType }) {
  const [changeOpen, setChangeOpen] = useState(false)
  const d = request.submittedData
  if (!d) {
    return (
      <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
        <h2 className="text-lg font-bold text-navy-500">Datos de la solicitud</h2>
        <p className="mt-2 text-sm text-navy-300">No hay datos disponibles.</p>
      </div>
    )
  }

  const groups: Array<{ title: string; items: Array<[string, string | undefined]> }> = [
    {
      title: 'Identidad',
      items: [
        ['Nombre', d.applicantName],
        ['Email', d.email],
        ['Teléfono', d.phone],
        ['País', d.country],
        ['Región', d.region],
      ],
    },
    {
      title: 'Comunidad',
      items: [
        ['Comunidad', d.community],
        ['Inspiración', d.inspirationCommunity],
      ],
    },
    {
      title: 'Producto',
      items: [
        ['Nombre', request.productName],
        ['Tipo', d.productType],
        ['Sector', d.productSector],
        ['Subcategoría', d.productSubcategory],
      ],
    },
    {
      title: 'Proceso',
      items: [
        ['Descripción', d.processDescription],
        ['Productor principal', d.producerType],
      ],
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-navy-500">Datos de la solicitud</h2>
          <p className="mt-1 text-sm text-navy-300">
            Resumen de la información enviada en el formulario.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setChangeOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-navy-500 transition-colors hover:bg-neutral-100"
        >
          Solicitar cambio
        </button>
      </div>

      <ChangeRequestDialog
        open={changeOpen}
        onClose={() => setChangeOpen(false)}
        request={request}
      />

      {groups.map((g) => (
        <section key={g.title} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-widest text-navy-300">
            {g.title}
          </p>
          <dl className="mt-3 grid gap-x-6 gap-y-3 text-sm md:grid-cols-2">
            {g.items
              .filter(([, v]) => Boolean(v))
              .map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs font-medium text-navy-300">{k}</dt>
                  <dd className="mt-0.5 font-semibold text-navy-500">{v}</dd>
                </div>
              ))}
          </dl>
        </section>
      ))}
    </div>
  )
}

// ─── Tab: Evidencias ─────────────────────────────────────────────────────────

/**
 * Slots de evidencias solicitadas explícitamente por el tutor — Fix
 * SB8 (#POS-16, auditoría UX). Antes el postulante veía solo 3 grupos
 * genéricos (Fotos / Videos / Documentos) sin saber qué pidió el tutor
 * específicamente. Ahora cada solicitud del request tiene su slot
 * dedicado con título + descripción + deadline + estado.
 *
 * En producción esto vive en el backend (request.tutorRequests).
 * Por ahora lo hidratamos por requestId desde un map local.
 */
interface RequestedEvidenceSlot {
  id: string
  title: string
  description: string
  dueDate: string
  /** Tipos de archivo aceptados. Define el accept del input. */
  acceptedKinds: Array<'image' | 'video' | 'document'>
}

const REQUESTED_EVIDENCES_BY_REQUEST: Record<string, RequestedEvidenceSlot[]> = {
  'req-001': [
    {
      id: 'req-001-aval',
      title: 'Aval del cacique o autoridad comunitaria',
      description:
        'Documento firmado por la autoridad de la comunidad que certifica el vínculo del producto/servicio con el saber ancestral.',
      dueDate: '2026-03-15',
      acceptedKinds: ['document', 'image'],
    },
    {
      id: 'req-001-process',
      title: 'Video del proceso de filigrana paso a paso',
      description:
        'Grabación mostrando desde el hilado hasta la pieza terminada. Mínimo 3 minutos.',
      dueDate: '2026-03-20',
      acceptedKinds: ['video'],
    },
  ],
}

function EvidenciasTab({ request }: { request: CertificationRequestType }) {
  const [items, setItems] = useState<EvidenceFile[]>(request.evidences ?? [])
  /**
   * Fix V2-POS-06 (auditoría v2): la portada se elegía solo en el paso 5
   * del CertifyForm. Una vez enviada la postulación, no había manera
   * de cambiarla — el postulante que subía una mejor foto después
   * quedaba con la portada vieja. Ahora persistimos override por
   * requestId en localStorage. La portada efectiva es:
   *   coverOverride ?? primera imagen del listado.
   */
  const coverOverride = useCoverByRequestStore((s) => s.overrides[request.id])
  const setCover = useCoverByRequestStore((s) => s.setCover)
  const clearIfCover = useCoverByRequestStore((s) => s.clearIfCover)
  const firstImageId = items.find((it) => it.kind === 'image')?.id
  const currentCoverId = coverOverride ?? firstImageId ?? null
  /**
   * Track de qué slots ya fueron cumplidos en esta sesión. En producción
   * vendría linkeado por slotId → evidenceId. Acá mantenemos un map
   * simple de slotId → evidenceId asignado por el postulante.
   */
  const [slotFulfillments, setSlotFulfillments] = useState<
    Record<string, EvidenceFile>
  >({})

  const requestedSlots = REQUESTED_EVIDENCES_BY_REQUEST[request.id] ?? []
  const pendingSlotsCount = requestedSlots.filter(
    (s) => !slotFulfillments[s.id],
  ).length

  const groups: Array<{ kind: EvidenceFile['kind']; title: string; icon: typeof ImageIcon }> = [
    { kind: 'image', title: 'Fotos', icon: ImageIcon },
    { kind: 'video', title: 'Videos', icon: Film },
    { kind: 'document', title: 'Documentos', icon: FileIcon },
  ]

  const handleUpload = (kind: EvidenceFile['kind']) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const newItems: EvidenceFile[] = files.map((f) => ({
      id: `e-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: f.name,
      kind,
      sizeKb: Math.round(f.size / 1024),
      uploadedAt: new Date().toISOString(),
    }))
    setItems((prev) => [...prev, ...newItems])
    toast.success(`${files.length} archivo(s) subido(s)`)
  }

  const handleSlotUpload = (slot: RequestedEvidenceSlot) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const kind: EvidenceFile['kind'] = file.type.startsWith('image/')
        ? 'image'
        : file.type.startsWith('video/')
          ? 'video'
          : 'document'
      const evidence: EvidenceFile = {
        id: `e-slot-${slot.id}-${Date.now()}`,
        name: file.name,
        kind,
        sizeKb: Math.round(file.size / 1024),
        uploadedAt: new Date().toISOString(),
      }
      setItems((prev) => [...prev, evidence])
      setSlotFulfillments((prev) => ({ ...prev, [slot.id]: evidence }))
      toast.success(`Evidencia "${slot.title}" enviada al tutor`)
      ;(e.target as HTMLInputElement).value = ''
    }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-navy-500">Evidencias</h2>
        <p className="mt-1 text-sm text-navy-300">
          Material que respalda tu solicitud. Podés sumar o reemplazar archivos antes
          de la auditoría.
        </p>
      </div>

      {/* Bloque "Pedidas por el tutor" — solo si hay slots definidos */}
      {requestedSlots.length > 0 && (
        <section className="rounded-2xl border-2 border-dashed border-gold-300/70 bg-gold-50/40 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h3 className="inline-flex items-center gap-2 text-sm font-bold text-navy-500">
              <AlertTriangle className="h-4 w-4 text-gold-700" />
              Evidencias solicitadas por tu tutor
            </h3>
            <span className="rounded-full bg-gold-500/15 px-2.5 py-0.5 text-[11px] font-bold text-gold-700">
              {pendingSlotsCount} pendiente
              {pendingSlotsCount === 1 ? '' : 's'} de {requestedSlots.length}
            </span>
          </div>
          {/* SM6 fix: aclaración del plazo del Reglamento 4.6 */}
          <p className="mt-2 text-[11px] text-navy-300">
            Por Reglamento (cláusula 4.6) tenés{' '}
            <strong className="text-navy-500">
              {REGLAMENTO_DEADLINES.daysToFixNonConformity} días corridos
            </strong>{' '}
            para subsanar cada no conformidad. Pasado ese plazo se aplica
            suspensión.
          </p>
          <ul className="mt-4 space-y-3">
            {requestedSlots.map((slot) => {
              const fulfilled = slotFulfillments[slot.id]
              const accept = slot.acceptedKinds
                .map((k) =>
                  k === 'image'
                    ? 'image/*'
                    : k === 'video'
                      ? 'video/*'
                      : '.pdf,.doc,.docx',
                )
                .join(',')
              // Fix V2-POS-03 (auditoría v2): los slots mostraban "Plazo:
              // 15 de marzo" sin alerta visual de vencido. Con today =
              // 28 de mayo y slot del 15 de marzo, eran 74 días pasados
              // y el postulante podía pensar que tenía tiempo. Por
              // Reglamento 4.6 son 30 días corridos máximo. Ahora
              // computamos `expired` y la card cambia de tono + label.
              const dueTs = new Date(slot.dueDate).getTime()
              const expired = !fulfilled && dueTs < Date.now()
              const daysLate = expired
                ? Math.ceil((Date.now() - dueTs) / 86_400_000)
                : 0
              return (
                <li
                  key={slot.id}
                  className={cn(
                    'rounded-xl border bg-white p-4 transition-colors',
                    fulfilled
                      ? 'border-success-300 bg-success-100/30'
                      : expired
                        ? 'border-error-400 bg-error-100/30'
                        : 'border-neutral-200',
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-navy-500">
                        {slot.title}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-navy-300">
                        {slot.description}
                      </p>
                      <p className="mt-1.5 text-[11px] font-medium text-navy-300">
                        Plazo:{' '}
                        <span
                          className={cn(
                            'font-semibold',
                            expired ? 'text-error-400' : 'text-navy-500',
                          )}
                        >
                          {new Date(slot.dueDate).toLocaleDateString('es-AR', {
                            day: '2-digit',
                            month: 'long',
                          })}
                        </span>
                        {expired && (
                          <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-error-400 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                            Vencido hace {daysLate}d
                          </span>
                        )}
                      </p>
                    </div>
                    {fulfilled ? (
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-success-300 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                          <Check className="h-3 w-3" strokeWidth={3} />
                          Enviada
                        </span>
                        <span className="text-[10px] text-navy-300">
                          {fulfilled.name}
                        </span>
                      </div>
                    ) : (
                      <label className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-navy-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-navy-400">
                        <Upload className="h-3.5 w-3.5" />
                        Subir
                        <input
                          type="file"
                          hidden
                          accept={accept}
                          onChange={handleSlotUpload(slot)}
                        />
                      </label>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {groups.map((g) => {
        const groupItems = items.filter((it) => it.kind === g.kind)
        return (
          <section
            key={g.kind}
            className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-navy-500">
                <g.icon className="h-4 w-4" />
                <h3 className="text-sm font-bold">{g.title}</h3>
                <span className="text-xs text-navy-300">({groupItems.length})</span>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-neutral-200 px-3 py-1.5 text-xs font-semibold text-navy-500 transition-colors hover:bg-neutral-300">
                <Upload className="h-3.5 w-3.5" />
                Subir
                <input
                  type="file"
                  multiple
                  hidden
                  accept={
                    g.kind === 'image' ? 'image/*'
                    : g.kind === 'video' ? 'video/*'
                    : '.pdf,.doc,.docx,image/*'
                  }
                  onChange={handleUpload(g.kind)}
                />
              </label>
            </div>

            {groupItems.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-neutral-300 p-6 text-center text-xs text-navy-300">
                Sin {g.title.toLowerCase()} aún
              </p>
            ) : (
              <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                {groupItems.map((it) => (
                  <li
                    key={it.id}
                    className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100"
                  >
                    {it.kind === 'image' ? (
                      <div className="aspect-square bg-neutral-200">
                        {it.thumbUrl ? (
                          <img
                            src={`${import.meta.env.BASE_URL}${it.thumbUrl.replace(/^\//, '')}`}
                            alt={it.name}
                            className="h-full w-full object-cover"
                            onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-navy-300">
                            <ImageIcon className="h-7 w-7" />
                          </div>
                        )}
                        {/* Fix V2-POS-06: badge + acción para portada */}
                        {currentCoverId === it.id ? (
                          <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-navy-500 shadow-sm">
                            ★ Portada
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setCover(request.id, it.id)
                              toast.success(`"${it.name}" es la nueva portada`)
                            }}
                            className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-navy-500 opacity-0 shadow-sm backdrop-blur transition-opacity hover:bg-white group-hover:opacity-100 focus:opacity-100"
                          >
                            Usar como portada
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex aspect-square items-center justify-center text-navy-300">
                        {it.kind === 'video' ? <Film className="h-8 w-8" /> : <FileIcon className="h-8 w-8" />}
                      </div>
                    )}
                    <div className="p-2">
                      <p className="truncate text-xs font-semibold text-navy-500">{it.name}</p>
                      <p className="text-[10px] text-navy-300">
                        {it.sizeKb < 1024
                          ? `${it.sizeKb} KB`
                          : `${(it.sizeKb / 1024).toFixed(1)} MB`}
                      </p>
                    </div>
                    {/* Fix QW-D1 (auditoría UX): antes el Trash borraba
                        sin confirmar y solo con toast success — un click
                        accidental destruía evidencia subida. Ahora el
                        toast trae acción "Deshacer" durante 6s: si el
                        user toca, restauramos el item en su posición
                        original. Patrón estándar (Gmail / Slack). */}
                    <button
                      type="button"
                      onClick={() => {
                        const removed = it
                        const removedIndex = groupItems.findIndex(
                          (x) => x.id === it.id,
                        )
                        // Fix V3-POS-04 (auditoría v3): si la imagen
                        // borrada era la portada, limpiar el override
                        // del store ANTES del filter — sino queda un
                        // id huérfano y el badge desaparece de TODAS
                        // las imágenes. Si el user Deshace, el cover
                        // queda en el "firstImageId" default (decisión
                        // razonable: era la portada por inferencia
                        // antes de marcar override).
                        const wasCover = it.id === coverOverride
                        if (wasCover) {
                          clearIfCover(request.id, it.id)
                        }
                        setItems((prev) =>
                          prev.filter((x) => x.id !== it.id),
                        )
                        toast.success(`"${removed.name}" eliminado`, {
                          duration: 6000,
                          action: {
                            label: 'Deshacer',
                            onClick: () => {
                              setItems((prev) => {
                                // Restaurar en la posición original si la
                                // lista no cambió, o al final si cambió.
                                const next = [...prev]
                                const targetIndex =
                                  removedIndex >= 0 &&
                                  removedIndex <= next.length
                                    ? removedIndex
                                    : next.length
                                next.splice(targetIndex, 0, removed)
                                return next
                              })
                              // Si el item deshecho era cover, re-setear
                              // el override para que el badge vuelva.
                              if (wasCover) {
                                setCover(request.id, removed.id)
                              }
                            },
                          },
                        })
                      }}
                      className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-error-400 shadow transition-opacity hover:bg-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
                      aria-label={`Eliminar ${it.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}

// ─── Tab: Historial ──────────────────────────────────────────────────────────

const historyIconMap: Record<HistoryEventKind, { icon: typeof Plus; tone: string }> = {
  request_created: { icon: Plus, tone: 'bg-info-100 text-info-400' },
  evidence_uploaded: { icon: ImageIcon, tone: 'bg-gold-100 text-gold-700' },
  audit_proposed: { icon: CalendarIcon, tone: 'bg-info-100 text-info-400' },
  audit_accepted: { icon: Check, tone: 'bg-success-100 text-success-300' },
  audit_rescheduled: { icon: Clock, tone: 'bg-warning-100 text-warning-400' },
  audit_rejected: { icon: X, tone: 'bg-error-100 text-error-400' },
  stage_changed: { icon: CheckCircle2, tone: 'bg-success-100 text-success-300' },
  document_uploaded: { icon: FileIcon, tone: 'bg-neutral-200 text-navy-500' },
  payment_received: { icon: Receipt, tone: 'bg-success-100 text-success-300' },
  message_sent: { icon: MessageSquare, tone: 'bg-info-100 text-info-400' },
  cert_published: { icon: CheckCircle2, tone: 'bg-success-100 text-success-300' },
}

function HistorialTab({ request }: { request: CertificationRequestType }) {
  const events: HistoryEvent[] = [...(request.history ?? [])].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  )

  return (
    <div>
      <h2 className="text-lg font-bold text-navy-500">Historial</h2>
      <p className="mt-1 text-sm text-navy-300">
        Línea de tiempo de toda la actividad asociada a la solicitud {request.number}.
      </p>

      <ol className="relative mt-6 ml-4 border-l-2 border-neutral-200">
        {events.map((ev) => {
          const meta = historyIconMap[ev.kind]
          return (
            <li key={ev.id} className="mb-6 ml-6 last:mb-0">
              <span
                className={cn(
                  'absolute -left-[15px] flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-white',
                  meta.tone,
                )}
              >
                <meta.icon className="h-3.5 w-3.5" />
              </span>
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-bold text-navy-500">{ev.title}</p>
                {ev.description && (
                  <p className="mt-1 text-sm text-navy-300">{ev.description}</p>
                )}
                <p className="mt-2 text-xs text-navy-300">
                  {ev.actor} · {new Date(ev.at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })} ·{' '}
                  {new Date(ev.at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </li>
          )
        })}
        {events.length === 0 && (
          <li className="ml-6 text-sm text-navy-300">No hay eventos aún.</li>
        )}
      </ol>
    </div>
  )
}

// ─── Change request dialog ───────────────────────────────────────────────────

function ChangeRequestDialog({
  open,
  onClose,
  request,
}: {
  open: boolean
  onClose: () => void
  request: CertificationRequestType
}) {
  const [field, setField] = useState('')
  const [reason, setReason] = useState('')
  const [proposed, setProposed] = useState('')

  useEscape(open, onClose)
  if (!open) return null

  const fieldOptions = [
    'Nombre del producto',
    'Descripción del proceso',
    'Comunidad / territorio',
    'Tipo / sector',
    'Subcategoría',
    'Datos de contacto',
    'Otro',
  ]

  const handleSubmit = () => {
    if (!field) return toast.error('Elegí qué campo querés cambiar')
    if (!reason.trim()) return toast.error('Contanos brevemente el motivo')
    toast.success(`Solicitud de cambio enviada · El tutor te responderá en 24-48hs`)
    setField('')
    setReason('')
    setProposed('')
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-500/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-navy-500">Solicitar cambio</h2>
            <p className="mt-0.5 text-xs text-navy-300">
              Solicitud {request.number} · {request.productName}
            </p>
            {/* Fix SM3 (#POS-15, auditoría UX): plazo de respuesta
                visible ANTES de enviar (no solo en el toast posterior). */}
            <p className="mt-1.5 text-[11px] font-medium text-info-400">
              Tu tutor responde dentro de las 24-48 hs hábiles.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-navy-500 hover:bg-neutral-200"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-6">
          <p className="rounded-2xl bg-info-100 px-4 py-3 text-xs text-navy-500 ring-1 ring-info-200">
            La edición directa de campos se habilita antes de la auditoría. Por
            ahora, escribinos qué necesitás cambiar y el tutor lo revisa con vos.
          </p>

          <div>
            <label className="text-sm font-bold text-navy-500">Campo a cambiar</label>
            <select
              value={field}
              onChange={(e) => setField(e.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
            >
              <option value="">Seleccionar…</option>
              {fieldOptions.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-bold text-navy-500">Valor propuesto</label>
            <input
              type="text"
              value={proposed}
              onChange={(e) => setProposed(e.target.value)}
              placeholder="¿Qué querés que diga ahora?"
              className="mt-2 h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-navy-500">Motivo del cambio</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Contanos por qué necesitás este cambio…"
              className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-neutral-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-navy-500 hover:bg-neutral-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 rounded-full bg-navy-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-navy-400"
          >
            <Send className="h-4 w-4" />
            Enviar solicitud
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Diagnostic dialog ───────────────────────────────────────────────────────

const diagnosticQuestions = [
  {
    id: 'q1',
    label: '¿Cuántos años hace que practicás este oficio?',
    type: 'text' as const,
    placeholder: 'Ej. 12 años',
  },
  {
    id: 'q2',
    label: '¿Quién te enseñó la técnica originalmente?',
    type: 'text' as const,
    placeholder: 'Familiar, comunidad, formación formal…',
  },
  {
    id: 'q3',
    label: '¿Producís en lotes regulares o por encargo?',
    type: 'choice' as const,
    options: ['Lotes regulares', 'Por encargo', 'Mixto'],
  },
  {
    id: 'q4',
    label: '¿Tu producto tiene certificaciones previas o reconocimientos?',
    type: 'choice' as const,
    options: ['Sí', 'No', 'No estoy seguro/a'],
  },
  {
    id: 'q5',
    label: 'Contanos brevemente cómo se transmite este saber en tu comunidad',
    type: 'textarea' as const,
    placeholder: 'Describí brevemente el rol generacional, espacios de aprendizaje, etc.',
  },
] as const

/**
 * Diagnóstico cargado por el TUTOR (mock). El postulante solo lo lee
 * — antes este formulario lo respondía el postulante; ahora la carga
 * es responsabilidad del equipo de certificación.
 */
const tutorDiagnosis: Record<string, string> = {
  q1: 'Alrededor de 14 años dedicada a la filigrana en plata.',
  q2: 'Aprendió la técnica de su abuela y la perfeccionó junto a orfebres de San Juan de Pasto.',
  q3: 'Mixto: produce por encargo y arma pequeños lotes para ferias.',
  q4: 'Sí — reconocimiento de la Cámara de Artesanías de Nariño (2023).',
  q5: 'El saber se transmite de forma intergeneracional en el taller familiar: las nuevas generaciones aprenden observando y practicando junto a las personas mayores.',
}

function DiagnosticDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  useEscape(open, onClose)
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-500/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-2xl flex-col rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-navy-500">Diagnóstico del tutor</h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-success-700">
              <Check className="h-3.5 w-3.5" /> Completado por Lic. Juan Pérez
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full text-navy-500 hover:bg-neutral-200"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-6 py-6">
          <p className="rounded-2xl bg-info-100 px-4 py-3 text-xs text-navy-500 ring-1 ring-info-200">
            Este diagnóstico lo completa tu tutor a partir de tus evidencias y la
            auditoría cultural. Es de lectura.
          </p>
          {diagnosticQuestions.map((q) => (
            <div key={q.id}>
              <p className="text-xs font-bold uppercase tracking-wide text-navy-300">
                {q.label}
              </p>
              <p className="mt-1 rounded-2xl border border-neutral-200 bg-neutral-100/60 px-4 py-3 text-sm text-navy-500">
                {tutorDiagnosis[q.id]}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-end border-t border-neutral-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-full bg-navy-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-400"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Tutor profile sheet ─────────────────────────────────────────────────────

const tutorProfiles: Record<string, {
  name: string
  role: string
  bio: string
  avatarUrl: string
  signedCount: number
  yearsExperience: number
  specialties: string[]
  speaks: string[]
}> = {
  'Lic. Juan Pérez': {
    name: 'Lic. Juan Pérez',
    role: 'Tutor cultural · Orfebrería andina',
    bio: 'Especialista en técnicas ancestrales de orfebrería con foco en filigrana y trabajo en plata. Ha auditado más de 200 piezas en la región andina colombiana y peruana.',
    avatarUrl: 'https://i.pravatar.cc/200?img=33',
    signedCount: 212,
    yearsExperience: 14,
    specialties: ['Filigrana', 'Plata 925', 'Orfebrería andina'],
    speaks: ['Español', 'Quechua'],
  },
  'Mtra. Sofía Quispe': {
    name: 'Mtra. Sofía Quispe',
    role: 'Tutora cultural · Textiles ancestrales',
    bio: 'Investigadora en tejidos en telar y técnicas ancestrales de hilado. Trabaja con comunidades del altiplano y el Caribe colombiano.',
    avatarUrl: 'https://i.pravatar.cc/200?img=44',
    signedCount: 156,
    yearsExperience: 11,
    specialties: ['Telar vertical', 'Tintes naturales', 'Hilado a mano'],
    speaks: ['Español', 'Aymara'],
  },
}

function TutorSheet({
  name,
  onClose,
  onMessage,
}: {
  name: string | null
  onClose: () => void
  onMessage: () => void
}) {
  useEscape(Boolean(name), onClose)
  if (!name) return null
  const profile =
    tutorProfiles[name] ??
    {
      name,
      role: 'Tutor cultural',
      bio: 'Perfil de tutor próximamente disponible.',
      avatarUrl: 'https://i.pravatar.cc/200?img=12',
      signedCount: 0,
      yearsExperience: 0,
      specialties: [],
      speaks: [],
    }

  return (
    <div
      className="fixed inset-0 z-50 bg-navy-500/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <aside
        className="ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-neutral-200 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="text-navy-500"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <p className="text-sm font-bold text-navy-500">Perfil del tutor</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="h-20 w-20 rounded-full object-cover ring-2 ring-gold-500"
            />
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-navy-500">{profile.name}</h3>
              <p className="mt-0.5 text-sm text-navy-300">{profile.role}</p>
            </div>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-navy-500">{profile.bio}</p>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-neutral-200 bg-white p-4">
              <p className="text-2xl font-bold text-navy-500">{profile.signedCount}</p>
              <p className="mt-0.5 text-xs text-navy-300">Certificados firmados</p>
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-4">
              <p className="text-2xl font-bold text-navy-500">{profile.yearsExperience}</p>
              <p className="mt-0.5 text-xs text-navy-300">Años de experiencia</p>
            </div>
          </div>

          {profile.specialties.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-widest text-navy-300">
                Especialidades
              </p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {profile.specialties.map((s) => (
                  <li
                    key={s}
                    className="rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold text-gold-700"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {profile.speaks.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-widest text-navy-300">
                Idiomas
              </p>
              <p className="mt-1 text-sm text-navy-500">
                {profile.speaks.join(' · ')}
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-neutral-200 bg-white px-6 py-4">
          <button
            type="button"
            onClick={onMessage}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-400"
          >
            <MessageSquare className="h-4 w-4" />
            Enviar mensaje
          </button>
        </div>
      </aside>
    </div>
  )
}

// ─── Message thread sheet ────────────────────────────────────────────────────

function MessageThreadSheet({
  meeting,
  thread,
  onClose,
}: {
  meeting: AuditMeeting | null
  thread: TutorMessage[]
  onClose: () => void
}) {
  const [messages, setMessages] = useState<TutorMessage[]>(thread)
  const [draft, setDraft] = useState('')

  // Reset al cambiar de meeting — NO en cada render. Antes `thread` estaba en
  // las deps, pero el padre puede pasar un `[]` nuevo por render, lo que
  // re-disparaba el effect y borraba los mensajes recién enviados con
  // handleSend. Con solo `meeting?.id` el reset ocurre al abrir otro meeting;
  // el seed inicial ya viene de useState(thread).
  useEffect(() => {
    setMessages(thread)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset solo al cambiar el meeting abierto, no al recrearse `thread`
  }, [meeting?.id])

  useEscape(Boolean(meeting), onClose)
  if (!meeting) return null

  const handleSend = () => {
    if (!draft.trim()) return
    const next: TutorMessage = {
      id: `msg-${Date.now()}`,
      author: 'tu',
      authorName: 'Tú',
      body: draft.trim(),
      at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, next])
    setDraft('')
    toast.success('Mensaje enviado')
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-navy-500/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <aside
        className="ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-neutral-200 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="text-navy-500"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <p className="text-sm font-bold text-navy-500">Conversación con</p>
            <p className="truncate text-xs text-navy-300">{meeting.auditorName}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-neutral-100 px-5 py-5">
          {messages.length === 0 ? (
            <p className="mt-10 text-center text-sm text-navy-300">
              Aún no hay mensajes. Iniciá la conversación.
            </p>
          ) : (
            <ul className="space-y-3">
              {messages.map((m) => {
                const mine = m.author === 'tu'
                return (
                  <li key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                    <div
                      className={cn(
                        'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm',
                        mine
                          ? 'rounded-br-sm bg-navy-500 text-white'
                          : 'rounded-bl-sm bg-white text-navy-500',
                      )}
                    >
                      {!mine && (
                        <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-navy-300">
                          {m.authorName}
                        </p>
                      )}
                      <p className="whitespace-pre-line leading-relaxed">{m.body}</p>
                      <p className={cn('mt-1 text-[10px]', mine ? 'text-white/70' : 'text-navy-300')}>
                        {new Date(m.at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-neutral-200 bg-white px-5 py-3">
          <div className="flex items-end gap-2">
            <textarea
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Escribí un mensaje…"
              className="flex-1 resize-none rounded-2xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!draft.trim()}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-500 text-white transition-colors hover:bg-navy-400 disabled:opacity-60"
              aria-label="Enviar"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1 text-[10px] text-navy-300">Enter para enviar · Shift+Enter para salto</p>
        </div>
      </aside>
    </div>
  )
}

function Meta({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarIcon
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-navy-300" />
      <div>
        <dt className="text-[11px] font-medium uppercase tracking-widest text-navy-300">{label}</dt>
        <dd className="text-sm font-bold text-navy-500">{value}</dd>
      </div>
    </div>
  )
}

function formatLastActivity(r: CertificationRequestType): string {
  const events = r.history ?? []
  const last = events[events.length - 1]
  if (!last) return r.createdAt
  const d = new Date(last.at)
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function RequestNotFound() {
  return (
    <div className="mx-auto max-w-xl px-6 py-20 text-center md:px-10">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-warning-100 text-warning-400">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h2 className="mt-6 text-xl font-bold text-navy-500">Solicitud no encontrada</h2>
      <p className="mt-2 text-sm text-navy-300">
        El ID de solicitud que estás buscando no existe o no pertenece a tu cuenta.
      </p>
      <Link
        to="/mis-certificaciones"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-navy-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a Mis certificaciones
      </Link>
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
  useEscape(Boolean(meeting), onClose)
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

  /**
   * Fix SB12 (#POS-19, auditoría UX): antes el postulante elegía un
   * slot a ciegas sin saber si el tutor tenía disponibilidad — iba y
   * volvía hasta encajar. Ahora simulamos disponibilidad con reglas
   * deterministas basadas en día de semana + hora.
   *
   * En producción esto vendrá del calendario real del tutor por API.
   *
   * Reglas mock:
   * - Fines de semana: todos los slots NO disponibles
   * - Lun/Mié/Vie 10:00, 15:00 → ocupado (tiene otras reuniones)
   * - Mar/Jue 16:00 → ocupado
   * - Resto → disponible
   */
  function slotStatus(
    day: number | null,
    slot: string,
  ): 'available' | 'busy' | 'unavailable' {
    if (!day) return 'unavailable'
    const date = new Date(year, month, day)
    const dow = date.getDay() // 0=Dom, 6=Sáb
    if (dow === 0 || dow === 6) return 'unavailable'
    const hourPart = slot.slice(0, 5)
    const busyByDow: Record<number, string[]> = {
      1: ['10:00', '15:00'], // lun
      3: ['10:00', '15:00'], // mié
      5: ['10:00', '15:00'], // vie
      2: ['16:00'], // mar
      4: ['16:00'], // jue
    }
    if (busyByDow[dow]?.includes(hourPart)) return 'busy'
    return 'available'
  }

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
            Elegí una fecha alternativa y enviá la solicitud al tutor.
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

          {/* Hora — grilla con disponibilidad visual */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-navy-500">Hora</p>
              {/* Leyenda */}
              <div className="flex items-center gap-2 text-[10px] text-navy-300">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-success-300" />
                  Disponible
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-neutral-300" />
                  Ocupado
                </span>
              </div>
            </div>
            <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {timeSlots.map((s) => {
                const status = slotStatus(selectedDay, s)
                const isSelected = hour === s && status === 'available'
                const disabled = status !== 'available'
                return (
                  <li key={s}>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => setHour(s)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-lg border px-3 py-2 text-xs font-bold transition-colors',
                        disabled &&
                          'cursor-not-allowed border-neutral-200 bg-neutral-100/60 text-navy-300',
                        !disabled &&
                          isSelected &&
                          'border-navy-500 bg-navy-500 text-white shadow-sm',
                        !disabled &&
                          !isSelected &&
                          'border-success-300/60 bg-success-100/30 text-navy-500 hover:border-success-300 hover:bg-success-100/60',
                      )}
                    >
                      <span>{s.slice(0, 5)}</span>
                      <span
                        className={cn(
                          'h-2 w-2 rounded-full',
                          disabled
                            ? 'bg-neutral-300'
                            : isSelected
                              ? 'bg-gold-400'
                              : 'bg-success-300',
                        )}
                        aria-hidden
                      />
                    </button>
                  </li>
                )
              })}
            </ul>
            {summary && (
              <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-gold-100 px-3 py-1.5 text-xs font-bold text-gold-700">
                <CalendarIcon className="h-3.5 w-3.5" />
                {summary}
              </p>
            )}
            <p className="mt-2 text-[11px] text-navy-300">
              Te confirmamos en menos de 24h si el tutor acepta. Si no,
              te proponemos otro horario.
            </p>
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
              if (slotStatus(selectedDay, hour) !== 'available')
                return toast.error(
                  'Ese horario no está disponible. Elegí un día hábil y un slot libre.',
                )
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
