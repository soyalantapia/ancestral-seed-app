import { Link } from 'react-router-dom'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calendar,
  CalendarClock,
  Camera,
  CheckCircle2,
  CreditCard,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Info,
  Lightbulb,
  MessageSquare,
  Plus,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Upload,
  Users,
  X,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { useUiStore } from '@/store/ui'
import { useNotificationsStore } from '@/store/notifications'
import {
  mockCertificationRequests,
} from '@/services/mocks/data'
import { StagePipeline, StageStatusBadge } from '@/components/features/StagePipeline'
import { useAutoStartTour } from '@/hooks/useAutoStartTour'
import type { CertificationRequest, RequestStage, TutorMessage } from '@/types'
import { cn } from '@/lib/utils'

// ─── helpers ──────────────────────────────────────────────────────────────────

function greetingByHour(name: string) {
  const h = new Date().getHours()
  if (h < 6) return `Buenas noches, ${name}`
  if (h < 13) return `Buenos días, ${name}`
  if (h < 20) return `Buenas tardes, ${name}`
  return `Buenas noches, ${name}`
}

function daysUntil(iso?: string | null): number | null {
  if (!iso) return null
  // Accept both ISO and dd/MM partials
  let d: Date
  if (/^\d{2}\/\d{2}$/.test(iso)) {
    const [day, month] = iso.split('/').map(Number)
    const now = new Date()
    d = new Date(now.getFullYear(), month - 1, day)
  } else {
    d = new Date(iso)
  }
  if (Number.isNaN(d.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - today.getTime()) / 86_400_000)
}

function urgencyTone(days: number | null): 'red' | 'yellow' | 'green' | 'muted' {
  if (days === null) return 'muted'
  if (days < 0) return 'red'
  if (days <= 3) return 'red'
  if (days <= 7) return 'yellow'
  return 'green'
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diff / 60_000)
  if (mins < 1) return 'recién'
  if (mins < 60) return `hace ${mins}min`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `hace ${hrs}h`
  const days = Math.round(hrs / 24)
  if (days < 7) return `hace ${days}d`
  const weeks = Math.round(days / 7)
  if (weeks < 4) return `hace ${weeks}sem`
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
  })
}

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toLocaleString('es-AR')}`
  }
}

// ─── tips contextuales por etapa ──────────────────────────────────────────────

const STAGE_TIPS: Record<RequestStage, { title: string; body: string }> = {
  prediagnostico: {
    title: 'Cómo preparar el prediagnóstico',
    body: 'Tené a mano la documentación de comunidad y al menos 3 fotos del proceso de producción.',
  },
  inicio: {
    title: 'Qué esperar al inicio del proceso',
    body: 'Vas a tener una primera videollamada con tu tutor cultural para definir el alcance.',
  },
  diagnostico: {
    title: 'Cómo elegir buenas evidencias',
    body: 'Fotos claras del proceso completo, video corto del oficio en acción y aval de la comunidad.',
  },
  auditoria: {
    title: 'Cómo prepararte para la auditoría',
    body: 'Repasá tu descripción del proceso, tené testigos disponibles y un espacio bien iluminado para la videollamada.',
  },
  evaluacion: {
    title: 'Qué se evalúa en esta etapa',
    body: 'Coherencia entre la documentación, la auditoría y los criterios de autenticidad ancestral.',
  },
  certificacion: {
    title: 'Tu certificado está por emitirse',
    body: 'Una vez aprobado, firmamos el hash en blockchain y publicamos tu ficha pública. Te avisamos por email.',
  },
}

// ─── DashboardHome ────────────────────────────────────────────────────────────

export default function DashboardHome() {
  const user = useAuthStore((s) => s.user)
  // Tour guiado de 8 pasos en primera visita
  useAutoStartTour('solicitante')
  const dismissed = useUiStore((s) => s.dismissedBanners['welcome-info'])
  const dismissBanner = useUiStore((s) => s.dismissBanner)
  const notifs = useNotificationsStore((s) => s.items)
  const unread = notifs.filter((n) => !n.read).length

  const requests = mockCertificationRequests
  const inProgress = requests.find((r) => r.status === 'En curso')
  const upcomingMeetings = requests.flatMap((r) =>
    r.scheduledMeetings
      .concat(r.meetings.filter((m) => m.status === 'accepted'))
      .map((m) => ({ ...m, requestId: r.id, requestName: r.productName })),
  )
  const pendingMeetings = requests.flatMap((r) =>
    r.meetings
      .filter((m) => m.status === 'pending')
      .map((m) => ({ ...m, requestId: r.id, requestName: r.productName })),
  )
  const totalPending = requests.reduce((a, r) => a + r.pendingItems.length, 0)
  const allPayments = requests.flatMap((r) =>
    (r.payments ?? []).map((p) => ({
      ...p,
      requestId: r.id,
      requestName: r.productName,
    })),
  )
  const pendingPayments = allPayments.filter(
    (p) => p.status === 'pending' || p.status === 'overdue',
  )
  const urgentPayment = pendingPayments
    .slice()
    .sort((a, b) => (daysUntil(a.dueDate) ?? 99) - (daysUntil(b.dueDate) ?? 99))[0]

  // Last tutor message across all requests
  const lastTutorMessage = (() => {
    const msgs: Array<TutorMessage & { req: CertificationRequest; meetingId: string }> = []
    for (const r of requests) {
      const threads = r.threads ?? {}
      for (const [meetingId, list] of Object.entries(threads)) {
        for (const m of list) {
          if (m.author === 'tutor') msgs.push({ ...m, req: r, meetingId })
        }
      }
    }
    return msgs.sort(
      (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
    )[0]
  })()

  const name = user?.name?.split(' ')[0] ?? 'Camila'
  const firstName = name

  // Empty welcome state for first-time users
  if (requests.length === 0) {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 sm:py-12 md:px-10 md:py-20">
        <div className="relative overflow-hidden rounded-3xl bg-pattern-aztec p-10 text-center text-white shadow-xl md:p-16">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-500 text-navy-500 shadow-lg">
            <FileText className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-2xl font-bold md:text-[32px]">
            Hola {firstName} 👋
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-neutral-300 md:text-base">
            Tu cuenta está lista. Cuando inicies tu primera certificación, vas
            a ver el avance, las tareas y las reuniones acá.
          </p>
          <Link
            to="/certificar"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold-500 px-6 py-3 text-sm font-bold text-navy-500 shadow-md transition-colors hover:bg-gold-400"
          >
            <Plus className="h-4 w-4" />
            Iniciar mi primera certificación
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <FirstTimeCard
            icon={FileText}
            title="Completá el formulario"
            body="7 pasos guiados con preguntas sobre tu producto, comunidad y proceso."
          />
          <FirstTimeCard
            icon={CalendarClock}
            title="Auditoría con tutor"
            body="Un curador cultural revisa tu solicitud y agenda una videollamada."
          />
          <FirstTimeCard
            icon={CheckCircle2}
            title="Certificado blockchain"
            body="Si todo OK, generamos el hash y publicamos tu ficha pública."
          />
        </div>
      </div>
    )
  }

  // ─── Next Best Action ─────────────────────────────────────────────────────
  const nextBestAction = computeNextBestAction({
    pendingPayments,
    pendingMeetings,
    totalPending,
    inProgress,
    requests,
  })

  // ─── Upcoming events (14 days) ───────────────────────────────────────────
  const upcomingEvents = buildUpcomingEvents(requests)

  // ─── Published cert (for documents / metrics) ────────────────────────────
  const publishedCert = requests.find(
    (r) =>
      r.stages.find((s) => s.stage === 'certificacion')?.status === 'completed',
  )

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 md:px-10 md:py-10">

      {/* ─── Saludo contextual ─────────────────────────────────────────── */}
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-500 md:text-[28px]">
            {greetingByHour(firstName)}
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-navy-300 md:text-base">
            {greetingSubtitle(totalPending, upcomingMeetings.length)}
          </p>
        </div>
      </header>

      {/* ─── Quick Actions ─────────────────────────────────────────────── */}
      <QuickActionsRow inProgressId={inProgress?.id} />

      {/* ─── Next Best Action ─────────────────────────────────────────── */}
      {nextBestAction && (
        <NextBestActionCard
          tone={nextBestAction.tone}
          icon={nextBestAction.icon}
          eyebrow={nextBestAction.eyebrow}
          title={nextBestAction.title}
          body={nextBestAction.body}
          ctaLabel={nextBestAction.ctaLabel}
          ctaTo={nextBestAction.ctaTo}
        />
      )}

      {/* ─── Banner info ──────────────────────────────────────────────── */}
      {!dismissed && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl bg-info-100 px-5 py-4 text-sm text-navy-500 ring-1 ring-info-200">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-info-400" />
          <div className="flex-1">
            <p className="font-bold">Mantente atento a tus notificaciones</p>
            <p className="mt-1 text-navy-300">
              Podríamos solicitar información adicional o nuevas evidencias.
              Te avisaremos por correo y dentro de la plataforma.
            </p>
          </div>
          <button
            type="button"
            onClick={() => dismissBanner('welcome-info')}
            className="text-navy-300 hover:text-navy-500"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ─── KPIs ──────────────────────────────────────────────────────── */}
      <section className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <StatCard
          icon={FileText}
          label="Solicitudes activas"
          value={requests.filter((r) => r.status !== 'Certificado').length}
          tone="navy"
        />
        <StatCard
          icon={CalendarClock}
          label="Reuniones próximas"
          value={upcomingMeetings.length}
          tone="info"
        />
        <StatCard
          icon={AlertCircle}
          label="Tareas pendientes"
          value={totalPending}
          tone="warning"
        />
        <StatCard
          icon={Info}
          label="Notif. sin leer"
          value={unread}
          tone="gold"
        />
      </section>

      {/* ─── Pago urgente banner ──────────────────────────────────────────
          Solo mostramos si el "Tu próximo paso" arriba NO es ya este mismo
          pago. Evita duplicar el mismo CTA en la misma vista (auditoría UX). */}
      {urgentPayment && nextBestAction?.icon !== CreditCard && (
        <UrgentPaymentBanner
          payment={urgentPayment}
          daysLeft={daysUntil(urgentPayment.dueDate)}
        />
      )}

      {/* ─── Main grid 2-col ──────────────────────────────────────────── */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        {/* LEFT */}
        <div className="space-y-6 lg:col-span-8">
          {/* Tu certificación en proceso */}
          {inProgress && (
            <section
              data-tour="solicitudes-list"
              className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gold-700">
                    En proceso
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-navy-500">
                    {inProgress.productName}
                  </h2>
                  <p className="mt-0.5 text-sm text-navy-300">
                    {inProgress.progressLabel}
                  </p>
                </div>
                <StageStatusBadge status="Prediagnóstico" />
              </div>

              <div className="mt-6 overflow-x-auto">
                <StagePipeline stages={inProgress.stages} />
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <Link
                  to={`/mis-certificaciones/${inProgress.id}`}
                  className="inline-flex items-center rounded-full bg-navy-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-navy-400"
                >
                  Ver detalles
                </Link>
                <Link
                  to={`/mis-certificaciones/${inProgress.id}?tab=evidencias`}
                  className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-500 shadow-sm transition-colors hover:bg-gold-400"
                >
                  <Plus className="h-4 w-4" />
                  Añadir evidencias
                </Link>
              </div>
            </section>
          )}

          {/* Mensajes del tutor */}
          {lastTutorMessage && (
            <TutorMessageCard
              message={lastTutorMessage}
              requestId={lastTutorMessage.req.id}
            />
          )}

          {/* Tareas pendientes */}
          <PendingTasksCard
            requests={requests}
            totalPending={totalPending}
          />

          {/* Recordatorios */}
          <RemindersCard requests={requests} pendingPayments={pendingPayments} />

          {/* Actividad reciente */}
          <RecentActivityCard
            requests={requests}
            firstReqId={inProgress?.id ?? requests[0]?.id}
          />

          {/* Documentos del certificado emitido */}
          {publishedCert && <DocumentsCard cert={publishedCert} />}

          {/* Métricas (si hay cert publicado) */}
          {publishedCert && <ImpactMetricsCard cert={publishedCert} />}
        </div>

        {/* RIGHT */}
        <aside className="space-y-6 lg:col-span-4">
          {/* Próximas reuniones */}
          <UpcomingMeetingsCard meetings={upcomingMeetings} />

          {/* Mini timeline */}
          <MiniTimelineCard events={upcomingEvents} />

          {/* Tu perfil público */}
          <PublicProfileCard
            user={user}
            authorSlug={user?.authorSlug ?? 'camila-montes'}
          />

          {/* Tips contextuales según etapa */}
          {inProgress && <ContextualTipCard stage={inProgress.currentStage} />}

          {/* Recursos rápidos */}
          <QuickResourcesCard />
        </aside>
      </div>
    </div>
  )
}

// ─── helpers de copy ─────────────────────────────────────────────────────────

function greetingSubtitle(pending: number, meetings: number): string {
  if (pending === 0 && meetings === 0) {
    return 'Todo al día. Cuando haya novedades, las vas a ver acá.'
  }
  const parts: string[] = []
  if (pending > 0) {
    parts.push(`${pending} ${pending === 1 ? 'tarea pendiente' : 'tareas pendientes'}`)
  }
  if (meetings > 0) {
    parts.push(`${meetings} ${meetings === 1 ? 'reunión confirmada' : 'reuniones confirmadas'}`)
  }
  return `Tenés ${parts.join(' y ')}.`
}

function computeNextBestAction(args: {
  pendingPayments: Array<{
    id: string
    concept: string
    amount: number
    currency: string
    dueDate: string
    requestId: string
  }>
  pendingMeetings: Array<{
    id: string
    auditorName: string
    scheduledAt: string
    requestId: string
  }>
  totalPending: number
  inProgress?: CertificationRequest
  requests: CertificationRequest[]
}) {
  const { pendingPayments, pendingMeetings, inProgress, requests } = args

  // 1) Pago vencido / por vencer en <=7 días
  const overdue = pendingPayments
    .map((p) => ({ ...p, days: daysUntil(p.dueDate) }))
    .filter((p) => p.days !== null && p.days <= 7)
    .sort((a, b) => (a.days ?? 99) - (b.days ?? 99))[0]
  if (overdue) {
    const dys = overdue.days ?? 0
    const tone = dys < 0 ? 'red' : 'yellow'
    const when =
      dys < 0
        ? `vencido hace ${Math.abs(dys)} día${Math.abs(dys) === 1 ? '' : 's'}`
        : dys === 0
          ? 'vence hoy'
          : `vence en ${dys} día${dys === 1 ? '' : 's'}`
    return {
      tone: tone as 'red' | 'yellow',
      icon: CreditCard,
      eyebrow: 'Tu próximo paso',
      title: `Pago pendiente: ${overdue.concept}`,
      body: `${formatMoney(overdue.amount, overdue.currency)} · ${when}.`,
      ctaLabel: 'Ver y pagar',
      ctaTo: `/mis-certificaciones/${overdue.requestId}?tab=pagos`,
    }
  }

  // 2) Reunión pendiente de aceptar
  const meeting = pendingMeetings[0]
  if (meeting) {
    const d = new Date(meeting.scheduledAt)
    return {
      tone: 'yellow' as const,
      icon: CalendarClock,
      eyebrow: 'Tu próximo paso',
      title: `Confirmá la reunión con ${meeting.auditorName}`,
      body: `Propuesta para el ${d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })} a las ${d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}.`,
      ctaLabel: 'Aceptar o reagendar',
      ctaTo: `/mis-certificaciones/${meeting.requestId}?tab=evaluacion`,
    }
  }

  // 3) Pendiente de la solicitud en curso
  if (inProgress && inProgress.pendingItems.length > 0) {
    return {
      tone: 'yellow' as const,
      icon: Upload,
      eyebrow: 'Tu próximo paso',
      title: inProgress.pendingItems[0],
      body: `Continuá el avance de "${inProgress.productName}".`,
      ctaLabel: 'Resolver',
      ctaTo: `/mis-certificaciones/${inProgress.id}?tab=evidencias`,
    }
  }

  // 4) Sin urgencias: invitar a publicar perfil o explorar
  const firstReq = requests[0]
  return {
    tone: 'green' as const,
    icon: Sparkles,
    eyebrow: 'Todo al día',
    title: 'Aprovechá para enriquecer tu perfil público',
    body: 'Sumá fotos, descripción y destacados para que tu ficha luzca completa.',
    ctaLabel: 'Editar mi perfil',
    ctaTo: firstReq ? '/mi-perfil' : '/mi-perfil',
  }
}

function buildUpcomingEvents(requests: CertificationRequest[]) {
  type Event = {
    id: string
    at: Date
    kind: 'meeting' | 'payment' | 'deadline'
    title: string
    requestId: string
  }
  const out: Event[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const horizon = new Date(today)
  horizon.setDate(horizon.getDate() + 14)

  for (const r of requests) {
    // Reuniones
    for (const m of r.scheduledMeetings.concat(r.meetings)) {
      const d = new Date(m.scheduledAt)
      if (d >= today && d <= horizon) {
        out.push({
          id: `m-${m.id}`,
          at: d,
          kind: 'meeting',
          title: `Reunión · ${m.auditorName}`,
          requestId: r.id,
        })
      }
    }
    // Pagos
    for (const p of r.payments ?? []) {
      if (p.status !== 'pending' && p.status !== 'overdue') continue
      const d = new Date(p.dueDate)
      if (d >= today && d <= horizon) {
        out.push({
          id: `p-${p.id}`,
          at: d,
          kind: 'payment',
          title: `Vence: ${p.concept}`,
          requestId: r.id,
        })
      }
    }
    // Deadlines
    if (r.diagnosticDeadline && !r.diagnosticCompleted) {
      const dys = daysUntil(r.diagnosticDeadline)
      if (dys !== null && dys >= 0 && dys <= 14) {
        const d = new Date()
        d.setDate(d.getDate() + dys)
        out.push({
          id: `d-${r.id}`,
          at: d,
          kind: 'deadline',
          title: `Diagnóstico · ${r.productName}`,
          requestId: r.id,
        })
      }
    }
  }
  return out.sort((a, b) => a.at.getTime() - b.at.getTime()).slice(0, 5)
}

// ─── sub-componentes ─────────────────────────────────────────────────────────

function QuickActionsRow({ inProgressId }: { inProgressId?: string }) {
  /**
   * Auditoría UX: bajamos de 4 a 2 CTAs principales.
   * - "Verificar certificado" es acción de COMPRADOR, no del postulante
   *   → vive en el header público y en Cmd+K, no acá.
   * - "Contactar soporte" ya está en el sidebar (Ayuda) y en el header
   *   → no duplicamos.
   * Si el user tiene una solicitud en proceso, ordenamos "Subir evidencias"
   * primero (es la acción más frecuente día a día).
   */
  const actions = inProgressId
    ? [
        {
          icon: Upload,
          label: 'Subir evidencias',
          to: `/mis-certificaciones/${inProgressId}?tab=evidencias`,
          tone: 'gold' as const,
        },
        {
          icon: Plus,
          label: 'Nueva certificación',
          to: '/certificar',
          tone: 'navy' as const,
        },
      ]
    : [
        {
          icon: Plus,
          label: 'Empezar una certificación',
          to: '/certificar',
          tone: 'gold' as const,
        },
        {
          icon: ShieldCheck,
          label: 'Verificar un certificado',
          to: '/verificar',
          tone: 'navy' as const,
        },
      ]
  return (
    <div
      data-tour="quick-actions"
      className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2"
    >
      {actions.map(({ icon: Icon, label, to, tone }, idx) => {
        const styles =
          tone === 'gold'
            ? 'bg-gold-500 text-navy-500 hover:bg-gold-400 shadow-sm'
            : tone === 'navy'
              ? 'bg-navy-500 text-white hover:bg-navy-400 shadow-sm'
              : 'border border-neutral-300 bg-white text-navy-500 hover:bg-neutral-100'
        return (
          <Link
            key={label}
            to={to}
            data-tour={idx === 0 ? 'cta-nueva-cert' : undefined}
            className={cn(
              'inline-flex items-center justify-center gap-3 rounded-2xl px-5 py-4 text-sm font-bold transition-all sm:text-base',
              styles,
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="line-clamp-1 text-left">{label}</span>
          </Link>
        )
      })}
    </div>
  )
}

function NextBestActionCard({
  tone,
  icon: Icon,
  eyebrow,
  title,
  body,
  ctaLabel,
  ctaTo,
}: {
  tone: 'red' | 'yellow' | 'green'
  icon: typeof Plus
  eyebrow: string
  title: string
  body: string
  ctaLabel: string
  ctaTo: string
}) {
  const palette = {
    red: {
      bg: 'bg-error-100 border-error-300',
      iconBg: 'bg-error-300 text-white',
      eyebrow: 'text-error-400',
      cta: 'bg-error-400 text-white hover:bg-error-300',
    },
    yellow: {
      bg: 'bg-warning-100 border-warning-300',
      iconBg: 'bg-warning-300 text-white',
      eyebrow: 'text-warning-400',
      cta: 'bg-navy-500 text-white hover:bg-navy-400',
    },
    green: {
      bg: 'bg-success-100 border-success-300/40',
      iconBg: 'bg-success-300 text-white',
      eyebrow: 'text-success-400',
      cta: 'bg-navy-500 text-white hover:bg-navy-400',
    },
  }[tone]
  return (
    <section
      className={cn(
        'mt-6 flex flex-col gap-4 rounded-3xl border-2 p-5 sm:flex-row sm:items-start sm:gap-5 sm:p-6',
        palette.bg,
      )}
    >
      <span
        className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm',
          palette.iconBg,
        )}
      >
        <Icon className="h-6 w-6" />
      </span>
      <div className="flex-1">
        <p className={cn('text-[11px] font-bold uppercase tracking-widest', palette.eyebrow)}>
          {eyebrow}
        </p>
        <h2 className="mt-1 text-lg font-bold leading-tight text-navy-500 md:text-xl">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-navy-500/80">{body}</p>
      </div>
      <Link
        to={ctaTo}
        className={cn(
          'inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold shadow-sm transition-colors',
          palette.cta,
        )}
      >
        {ctaLabel}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  )
}

function UrgentPaymentBanner({
  payment,
  daysLeft,
}: {
  payment: {
    id: string
    concept: string
    amount: number
    currency: string
    dueDate: string
    requestId: string
    requestName: string
  }
  daysLeft: number | null
}) {
  const tone = urgencyTone(daysLeft)
  if (tone !== 'red' && tone !== 'yellow') return null
  const isOverdue = (daysLeft ?? 0) < 0
  const dueIn =
    daysLeft === null
      ? ''
      : isOverdue
        ? `Vencido hace ${Math.abs(daysLeft)} día${Math.abs(daysLeft) === 1 ? '' : 's'}`
        : daysLeft === 0
          ? 'Vence hoy'
          : `Vence en ${daysLeft} día${daysLeft === 1 ? '' : 's'}`
  return (
    <div
      className={cn(
        'mt-4 flex flex-col gap-3 rounded-2xl border-2 p-4 sm:flex-row sm:items-center sm:gap-4',
        tone === 'red'
          ? 'border-error-300 bg-error-100'
          : 'border-warning-300 bg-warning-100',
      )}
    >
      <span
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          tone === 'red'
            ? 'bg-error-300 text-white'
            : 'bg-warning-300 text-white',
        )}
      >
        <AlertTriangle className="h-5 w-5" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-widest text-error-400">
          Pago {isOverdue ? 'vencido' : 'próximo'}
        </p>
        <p className="mt-1 text-sm font-bold text-navy-500">
          {formatMoney(payment.amount, payment.currency)} · {payment.concept}
        </p>
        <p className="mt-0.5 text-xs text-navy-500/80">
          {payment.requestName} · {dueIn}
        </p>
      </div>
      <Link
        to={`/mis-certificaciones/${payment.requestId}?tab=pagos`}
        className={cn(
          'inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold shadow-sm transition-colors',
          tone === 'red'
            ? 'bg-error-400 text-white hover:bg-error-300'
            : 'bg-navy-500 text-white hover:bg-navy-400',
        )}
      >
        Pagar ahora
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

function TutorMessageCard({
  message,
  requestId,
}: {
  message: TutorMessage & { meetingId: string }
  requestId: string
}) {
  // Toda la comunicación es vía WhatsApp para reducir fricción.
  // Número mock del tutor — en prod vendría del backend asociado al meeting.
  const tutorPhone = '5491145678901'
  const waText = encodeURIComponent(
    `Hola ${message.authorName.split(' ')[0]}, te escribo desde Ancestral Seed por mi solicitud.`,
  )
  const whatsappUrl = `https://wa.me/${tutorPhone}?text=${waText}`
  return (
    <section className="rounded-3xl border border-info-300/40 bg-info-100/40 p-5 shadow-sm md:p-6">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-info-400">
        <MessageSquare className="h-3.5 w-3.5" />
        Tu tutor te escribió
        <span className="text-navy-300">· {formatRelative(message.at)}</span>
      </div>
      <div className="mt-3 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-500 text-sm font-bold text-white">
          {message.authorName
            .split(' ')
            .map((w) => w[0])
            .slice(0, 2)
            .join('')}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-navy-500">{message.authorName}</p>
          <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-navy-500/80">
            {message.body}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-success-300 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-success-400"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Responder por WhatsApp
        </a>
        <Link
          to={`/mis-certificaciones/${requestId}?tab=evaluacion`}
          className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-4 py-2 text-xs font-bold text-navy-500 transition-colors hover:bg-neutral-100"
        >
          Ver solicitud
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  )
}

function PendingTasksCard({
  requests,
  totalPending,
}: {
  requests: CertificationRequest[]
  totalPending: number
}) {
  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-navy-500">Tareas pendientes</h3>
        <Link
          to="/mis-certificaciones"
          className="text-sm font-semibold text-gold-700 hover:underline"
        >
          Ver todas →
        </Link>
      </div>
      <ul className="mt-4 space-y-3">
        {requests
          .flatMap((r) => r.pendingItems.map((p) => ({ req: r, label: p })))
          .map((t, i) => (
            <li
              key={`${t.req.id}-${t.label}-${i}`}
              className="flex items-start gap-3 rounded-2xl border border-neutral-200 p-4 transition-colors hover:bg-neutral-100"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-warning-300" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-navy-500">{t.label}</p>
                <p className="mt-0.5 text-xs text-navy-300">
                  Solicitud {t.req.number} · {t.req.productName}
                </p>
              </div>
              <Link
                to={`/mis-certificaciones/${t.req.id}?tab=evaluacion`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700 hover:underline"
              >
                Resolver
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </li>
          ))}
        {totalPending === 0 && (
          <li className="rounded-2xl border border-dashed border-neutral-300 p-6 text-center text-sm text-navy-300">
            <CheckCircle2 className="mx-auto h-6 w-6 text-success-300" />
            <p className="mt-2">No tenés tareas pendientes</p>
          </li>
        )}
      </ul>
    </section>
  )
}

function RemindersCard({
  requests,
  pendingPayments,
}: {
  requests: CertificationRequest[]
  pendingPayments: Array<{
    id: string
    concept: string
    dueDate: string
    amount: number
    currency: string
    requestId: string
    requestName: string
  }>
}) {
  type Reminder = {
    id: string
    label: string
    sub: string
    days: number | null
    to: string
  }
  const items: Reminder[] = []

  for (const r of requests) {
    if (r.diagnosticDeadline && !r.diagnosticCompleted) {
      items.push({
        id: `d-${r.id}`,
        label: `Diagnóstico de ${r.productName}`,
        sub: `Vence ${r.diagnosticDeadline}`,
        days: daysUntil(r.diagnosticDeadline),
        to: `/mis-certificaciones/${r.id}?tab=evaluacion`,
      })
    }
  }
  for (const p of pendingPayments) {
    items.push({
      id: `p-${p.id}`,
      label: p.concept,
      sub: `${p.requestName} · ${formatMoney(p.amount, p.currency)}`,
      days: daysUntil(p.dueDate),
      to: `/mis-certificaciones/${p.requestId}?tab=pagos`,
    })
  }

  if (items.length === 0) return null

  items.sort((a, b) => (a.days ?? 99) - (b.days ?? 99))

  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-navy-500" />
          <h3 className="text-lg font-bold text-navy-500">Recordatorios</h3>
        </div>
        <span className="text-xs text-navy-300">
          {items.length} {items.length === 1 ? 'pendiente' : 'pendientes'}
        </span>
      </div>
      <ul className="mt-4 space-y-2">
        {items.slice(0, 4).map((r) => {
          const tone = urgencyTone(r.days)
          const dot =
            tone === 'red'
              ? 'bg-error-300'
              : tone === 'yellow'
                ? 'bg-warning-400'
                : 'bg-success-300'
          const label =
            r.days === null
              ? r.sub
              : r.days < 0
                ? `Vencido hace ${Math.abs(r.days)}d`
                : r.days === 0
                  ? 'Vence hoy'
                  : `Vence en ${r.days}d`
          return (
            <li key={r.id}>
              <Link
                to={r.to}
                className="flex items-center gap-3 rounded-2xl border border-neutral-200 px-4 py-3 transition-colors hover:bg-neutral-100"
              >
                <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', dot)} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-navy-500">
                    {r.label}
                  </p>
                  <p className="truncate text-xs text-navy-300">{r.sub}</p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold',
                    tone === 'red'
                      ? 'bg-error-100 text-error-400'
                      : tone === 'yellow'
                        ? 'bg-warning-100 text-warning-400'
                        : 'bg-success-100 text-success-400',
                  )}
                >
                  {label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function RecentActivityCard({
  requests,
  firstReqId,
}: {
  requests: CertificationRequest[]
  firstReqId?: string
}) {
  const allEvents = requests
    .flatMap((r) => (r.history ?? []).map((ev) => ({ ...ev, req: r })))
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 5)

  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-navy-500" />
          <h3 className="text-lg font-bold text-navy-500">Actividad reciente</h3>
        </div>
        {firstReqId && (
          <Link
            to={`/mis-certificaciones/${firstReqId}?tab=historial`}
            className="text-sm font-semibold text-gold-700 hover:underline"
          >
            Ver historial →
          </Link>
        )}
      </div>
      {allEvents.length === 0 ? (
        <p className="mt-4 text-sm text-navy-300">
          Cuando avance tu solicitud, vas a ver actividad acá.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-neutral-200">
          {allEvents.map((ev) => (
            <li key={ev.id} className="flex items-start gap-3 py-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gold-500" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-navy-500">{ev.title}</p>
                <p className="mt-0.5 truncate text-xs text-navy-300">
                  Solicitud {ev.req.number} · {ev.req.productName}
                </p>
              </div>
              <span className="shrink-0 text-xs text-navy-300">
                {formatRelative(ev.at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function DocumentsCard({ cert }: { cert: CertificationRequest }) {
  return (
    <section className="rounded-3xl border-2 border-gold-300 bg-gradient-to-br from-gold-100 to-white p-6 shadow-sm md:p-8">
      <div className="flex items-center gap-2">
        <FileCheck2 className="h-5 w-5 text-gold-700" />
        <h3 className="text-lg font-bold text-navy-500">
          Tu certificado emitido
        </h3>
      </div>
      <p className="mt-2 text-sm text-navy-300">
        {cert.productName} · {cert.number}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          to={`/mis-certificaciones/${cert.id}`}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-gold-500 px-5 text-sm font-bold text-navy-500 shadow-sm transition-colors hover:bg-gold-400"
        >
          <Eye className="h-4 w-4" />
          Ver certificado
        </Link>
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 text-sm font-bold text-navy-500 transition-colors hover:bg-neutral-100"
        >
          <Download className="h-4 w-4" />
          Descargar PDF
        </button>
      </div>
    </section>
  )
}

function ImpactMetricsCard({ cert }: { cert: CertificationRequest }) {
  // Mock metrics (en prod vendrían del backend)
  const metrics = [
    { label: 'Visitas a la ficha', value: '247', icon: Eye, tone: 'navy' },
    { label: 'Verificaciones del hash', value: '38', icon: ShieldCheck, tone: 'gold' },
    { label: 'Compartidos', value: '12', icon: ArrowUpRight, tone: 'info' },
  ]
  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-navy-500" />
          <h3 className="text-lg font-bold text-navy-500">
            Impacto de tu certificado
          </h3>
        </div>
        <span className="text-xs text-navy-300">últimos 30 días</span>
      </div>
      <p className="mt-1 text-xs text-navy-300">
        Estadísticas de {cert.productName}
      </p>
      <div className="mt-5 grid grid-cols-3 gap-3">
        {metrics.map(({ label, value, icon: Icon, tone }) => {
          const styles =
            tone === 'navy'
              ? 'bg-navy-500 text-white'
              : tone === 'gold'
                ? 'bg-gold-100 text-gold-700'
                : 'bg-info-100 text-info-400'
          return (
            <div key={label} className="rounded-2xl border border-neutral-200 p-3">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full',
                  styles,
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <p className="mt-2 text-xl font-bold text-navy-500">{value}</p>
              <p className="mt-0.5 text-[11px] leading-tight text-navy-300">
                {label}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function UpcomingMeetingsCard({
  meetings,
}: {
  meetings: Array<{
    id: string
    auditorName: string
    scheduledAt: string
    requestId: string
    requestName: string
  }>
}) {
  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
      <div className="flex items-center gap-2">
        <CalendarClock className="h-5 w-5 text-navy-500" />
        <h3 className="text-base font-bold text-navy-500">Próximas reuniones</h3>
      </div>
      {meetings.length === 0 ? (
        <p className="mt-3 text-sm text-navy-300">
          No tenés reuniones programadas todavía.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {meetings.map((m) => {
            const d = new Date(m.scheduledAt)
            return (
              <li
                key={m.id}
                className="rounded-2xl border border-neutral-200 bg-info-100/40 p-3"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-info-400">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {d.toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: 'short',
                  })}{' '}
                  ·{' '}
                  {d.toLocaleTimeString('es-AR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                <p className="mt-1 text-sm font-bold text-navy-500">
                  {m.auditorName}
                </p>
                <p className="mt-0.5 truncate text-xs text-navy-300">
                  {m.requestName}
                </p>
                <Link
                  to={`/mis-certificaciones/${m.requestId}?tab=evaluacion`}
                  className="mt-2 inline-flex text-xs font-semibold text-gold-700 hover:underline"
                >
                  Ver →
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function MiniTimelineCard({
  events,
}: {
  events: Array<{
    id: string
    at: Date
    kind: 'meeting' | 'payment' | 'deadline'
    title: string
    requestId: string
  }>
}) {
  if (events.length === 0) return null
  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-navy-500" />
        <h3 className="text-base font-bold text-navy-500">Próximos 14 días</h3>
      </div>
      <ul className="mt-4 space-y-3">
        {events.map((ev) => {
          const days = Math.round(
            (ev.at.getTime() - Date.now()) / 86_400_000,
          )
          const tone = urgencyTone(days)
          const Icon =
            ev.kind === 'meeting'
              ? CalendarClock
              : ev.kind === 'payment'
                ? CreditCard
                : AlertCircle
          const iconStyle =
            ev.kind === 'meeting'
              ? 'bg-info-100 text-info-400'
              : ev.kind === 'payment'
                ? 'bg-warning-100 text-warning-400'
                : 'bg-neutral-200 text-navy-500'
          return (
            <li key={ev.id} className="flex items-start gap-3">
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                  iconStyle,
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-widest text-navy-300">
                  {ev.at.toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </p>
                <p className="mt-0.5 truncate text-sm font-bold text-navy-500">
                  {ev.title}
                </p>
              </div>
              <span
                className={cn(
                  'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold',
                  tone === 'red'
                    ? 'bg-error-100 text-error-400'
                    : tone === 'yellow'
                      ? 'bg-warning-100 text-warning-400'
                      : 'bg-success-100 text-success-400',
                )}
              >
                {days === 0 ? 'hoy' : `${days}d`}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function PublicProfileCard({
  user,
  authorSlug,
}: {
  user: { name?: string; avatarUrl?: string } | null
  authorSlug: string
}) {
  return (
    <section className="overflow-hidden rounded-3xl bg-pattern-aztec p-5 text-white shadow-sm md:p-6">
      <div className="flex items-center gap-3">
        <img
          src={user?.avatarUrl ?? 'https://i.pravatar.cc/100?img=47'}
          alt={user?.name ?? ''}
          className="h-12 w-12 rounded-full border-2 border-gold-500 object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-widest text-gold-500">
            Tu perfil público
          </p>
          <p className="mt-0.5 truncate text-sm font-bold text-white">
            {user?.name ?? 'Camila Montes'}
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-neutral-300">
        Así te ven los clientes y curadores que visitan tu ficha pública.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          to={`/perfil/${authorSlug}`}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-gold-500 px-3 text-xs font-bold text-navy-500 transition-colors hover:bg-gold-400"
        >
          <Eye className="h-3.5 w-3.5" />
          Ver perfil
        </Link>
        <Link
          to="/mi-perfil"
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 text-xs font-bold text-white transition-colors hover:bg-white/20"
        >
          Editar
        </Link>
      </div>
    </section>
  )
}

function ContextualTipCard({ stage }: { stage: RequestStage }) {
  const tip = STAGE_TIPS[stage]
  if (!tip) return null
  return (
    <section className="rounded-3xl border border-gold-300/40 bg-gold-100/40 p-5 shadow-sm md:p-6">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold-700">
        <Lightbulb className="h-3.5 w-3.5" />
        Tip de tu etapa actual
      </div>
      <p className="mt-3 text-sm font-bold text-navy-500">{tip.title}</p>
      <p className="mt-1.5 text-xs leading-relaxed text-navy-500/80">
        {tip.body}
      </p>
      <Link
        to="/ayuda"
        className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-gold-700 hover:underline"
      >
        Ver más guías
        <ArrowRight className="h-3 w-3" />
      </Link>
    </section>
  )
}

function QuickResourcesCard() {
  const resources = [
    { icon: BookOpen, label: 'Guía paso a paso', to: '/ayuda' },
    { icon: Camera, label: 'Cómo tomar buenas fotos', to: '/ayuda' },
    { icon: Users, label: 'Aval de la comunidad', to: '/ayuda' },
    { icon: ShieldCheck, label: 'Sobre la blockchain', to: '/#como-funciona' },
  ]
  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
      <div className="flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-navy-500" />
        <h3 className="text-base font-bold text-navy-500">Recursos rápidos</h3>
      </div>
      <ul className="mt-3 flex flex-col gap-1">
        {resources.map(({ icon: Icon, label, to }) => (
          <li key={label}>
            <Link
              to={to}
              className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm text-navy-500 transition-colors hover:bg-neutral-100"
            >
              <Icon className="h-4 w-4 text-gold-700" />
              <span className="flex-1">{label}</span>
              <ArrowRight className="h-3.5 w-3.5 text-navy-300" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

// ─── reusables ────────────────────────────────────────────────────────────────

function FirstTimeCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Info
  title: string
  body: string
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-100 text-gold-700">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm font-bold text-navy-500">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-navy-300">{body}</p>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Info
  label: string
  value: number
  tone: 'navy' | 'gold' | 'info' | 'warning'
}) {
  const tones = {
    navy: 'bg-navy-500 text-white',
    gold: 'bg-gold-100 text-gold-700',
    info: 'bg-info-100 text-info-400',
    warning: 'bg-warning-100 text-warning-400',
  }[tone]
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm sm:p-4 md:p-5">
      <div
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full',
          tones,
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 text-2xl font-bold text-navy-500">{value}</p>
      <p className="mt-1 text-xs text-navy-300">{label}</p>
    </div>
  )
}
