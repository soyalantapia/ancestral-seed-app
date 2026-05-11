import { Link } from 'react-router-dom'
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  FileText,
  Info,
  Plus,
  X,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { useUiStore } from '@/store/ui'
import { useNotificationsStore } from '@/store/notifications'
import {
  mockCertificationRequests,
} from '@/services/mocks/data'
import { StagePipeline, StageStatusBadge } from '@/components/features/StagePipeline'
import { OnboardingTour } from '@/components/features/OnboardingTour'

export default function DashboardHome() {
  const user = useAuthStore((s) => s.user)
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
  const totalPending = requests.reduce((a, r) => a + r.pendingItems.length, 0)
  const name = user?.name?.split(' ')[0] ?? 'Camila'

  // Empty welcome state for first-time users
  if (requests.length === 0) {
    return (
      <div className="mx-auto max-w-[1100px] px-6 py-12 md:px-10 md:py-20">
        <OnboardingTour />
        <div className="relative overflow-hidden rounded-3xl bg-pattern-aztec p-10 text-center text-white shadow-xl md:p-16">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-500 text-navy-500 shadow-lg">
            <FileText className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-2xl font-bold md:text-[32px]">
            Bienvenido {name} 👋
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-neutral-300 md:text-base">
            Tu cuenta está lista. Cuando inicies tu primera certificación,
            vas a ver el avance, las tareas y las reuniones acá.
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

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-8 md:px-10 md:py-10">
      <OnboardingTour />
      <h1 className="text-2xl font-bold text-navy-500 md:text-[28px]">Inicio</h1>
      <p className="mt-2 max-w-3xl text-sm text-navy-300 md:text-base">
        Bienvenido {name}. Desde aquí podrás ver el avance de tus certificaciones,
        armar tu perfil público y administrar tu información.
      </p>

      {!dismissed && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl bg-info-100 px-5 py-4 text-sm text-navy-500 ring-1 ring-info-200">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-info-400" />
          <div className="flex-1">
            <p className="font-bold">Mantente atento a tus notificaciones</p>
            <p className="mt-1 text-navy-300">
              Podríamos solicitar información adicional o nuevas evidencias para
              continuar con la revisión. Te avisaremos por correo y dentro de la
              plataforma.
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

      {/* KPIs */}
      <section className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
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

      {/* Tu certificación en proceso */}
      {inProgress && (
        <section className="mt-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-navy-500">
                Tu certificación en proceso
              </h2>
              <p className="mt-1 text-sm text-navy-300">{inProgress.productName}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-navy-300">
              Estado actual:
              <StageStatusBadge status="Preadiagnóstico" />
            </div>
          </div>

          <div className="mt-6">
            <StagePipeline stages={inProgress.stages} />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to={`/mis-certificaciones/${inProgress.id}`}
              className="inline-flex items-center rounded-full bg-navy-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-navy-400"
            >
              Ver detalles del seguimiento
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

      {/* Recent activity feed */}
      <section className="mt-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-navy-500" />
            <h3 className="text-lg font-bold text-navy-500">Actividad reciente</h3>
          </div>
          <Link
            to={`/mis-certificaciones/${inProgress?.id ?? requests[0]?.id}?tab=historial`}
            className="text-sm font-semibold text-gold-700 hover:underline"
          >
            Ver historial →
          </Link>
        </div>
        {(() => {
          const allEvents = requests
            .flatMap((r) => (r.history ?? []).map((ev) => ({ ...ev, req: r })))
            .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
            .slice(0, 4)
          if (allEvents.length === 0) {
            return (
              <p className="mt-4 text-sm text-navy-300">
                Cuando avance tu solicitud, vas a ver actividad acá.
              </p>
            )
          }
          return (
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
                    {new Date(ev.at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                  </span>
                </li>
              ))}
            </ul>
          )
        })()}
      </section>

      {/* Pending tasks */}
      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
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
                  key={i}
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
        </div>

        {/* Próximas reuniones */}
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
          <h3 className="text-lg font-bold text-navy-500">Próximas reuniones</h3>
          {upcomingMeetings.length === 0 ? (
            <p className="mt-4 text-sm text-navy-300">
              No tienes reuniones programadas por el momento
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {upcomingMeetings.map((m) => {
                const d = new Date(m.scheduledAt)
                return (
                  <li
                    key={m.id}
                    className="rounded-2xl border border-neutral-200 bg-info-100/40 p-4"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-info-400">
                      <CalendarClock className="h-3.5 w-3.5" />
                      {d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })} ·{' '}
                      {d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <p className="mt-1 text-sm font-bold text-navy-500">{m.auditorName}</p>
                    <p className="mt-0.5 text-xs text-navy-300">{m.requestName}</p>
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
        </div>
      </section>
    </div>
  )
}

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
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm md:p-5">
      <div className={`flex h-9 w-9 items-center justify-center rounded-full ${tones}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 text-2xl font-bold text-navy-500">{value}</p>
      <p className="mt-1 text-xs text-navy-300">{label}</p>
    </div>
  )
}
