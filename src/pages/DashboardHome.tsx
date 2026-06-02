import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  FileText,
  Image as ImageIcon,
  MessageCircle,
  Plus,
  Scale,
  Sparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { TourInvite } from '@/components/features/TourInvite'
import { mockCertificationRequests } from '@/services/mocks/data'
import { cn } from '@/lib/utils'
import type {
  CertificationRequest,
  HistoryEvent,
  HistoryEventKind,
} from '@/types'

/**
 * Panel de inicio — "centro de control".
 *
 * Decisión de producto (rediseño 2026-06): el Inicio NO es una mini-página
 * de detalle. Su único trabajo es responder, en 5 segundos, lo que ninguna
 * otra pantalla responde: "¿y ahora qué hago, en TODO, y está todo bien?".
 *
 * 3 zonas, en orden de prioridad:
 *   1. Tu próximo paso  — LA acción #1 agregada de TODAS las solicitudes
 *      (+ "y además" con el resto). Es la razón para abrir el panel.
 *   2. Tus certificaciones — vistazo compacto de TODAS (estado + progreso
 *      resumido). El timeline completo vive en el detalle, no acá.
 *   3. Novedades — lo último que pasó en cualquiera de tus solicitudes.
 *
 * Estado sin pendientes (idle): no te echa. Las Novedades pasan AL FRENTE
 * y la lista queda debajo. Preview: `?vista=idle`.
 */

// ─── helpers ──────────────────────────────────────────────────────────────────

function greetingByHour(name: string): string {
  const h = new Date().getHours()
  if (h < 6) return `Buenas noches, ${name}`
  if (h < 13) return `Buenos días, ${name}`
  if (h < 20) return `Buenas tardes, ${name}`
  return `Buenas noches, ${name}`
}

function formatMoney(amount: number, currency: string): string {
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

/** "hace 3 días" / "hace 8 h" / "recién" — relativo a ahora. */
function timeAgo(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const min = Math.round((Date.now() - then) / 60000)
  if (min < 1) return 'recién'
  if (min < 60) return `hace ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.round(h / 24)
  if (d < 7) return `hace ${d} ${d === 1 ? 'día' : 'días'}`
  if (d < 30) {
    const w = Math.round(d / 7)
    return `hace ${w} ${w === 1 ? 'semana' : 'semanas'}`
  }
  const mo = Math.round(d / 30)
  return `hace ${mo} ${mo === 1 ? 'mes' : 'meses'}`
}

function progressOf(r: CertificationRequest) {
  const total = r.stages.length
  const done = r.stages.filter((s) => s.status === 'completed').length
  const current = r.stages.find((s) => s.status === 'in_progress')
  return { done, total, current }
}

/** Orden de la lista: lo ACTIVO primero (lo que el postulante está
 *  trabajando), después lo cerrado. Dentro del mismo estado, lo más
 *  reciente arriba. */
const STATUS_RANK: Record<CertificationRequest['status'], number> = {
  'En emisión': 0,
  'En curso': 1,
  Certificado: 2,
  Denegada: 3,
}

function sortForList(
  requests: CertificationRequest[],
): CertificationRequest[] {
  return [...requests].sort(
    (a, b) =>
      STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
      b.createdAt.localeCompare(a.createdAt),
  )
}

// ─── estado de cada solicitud ───────────────────────────────────────────────

const STATE_META: Record<
  CertificationRequest['status'],
  { label: string; badge: string; dot: string }
> = {
  'En curso': {
    label: 'En curso',
    badge: 'bg-gold-100 text-gold-700',
    dot: 'bg-gold-500',
  },
  'En emisión': {
    label: 'En emisión',
    badge: 'bg-info-100 text-info-400',
    dot: 'bg-info-400',
  },
  Certificado: {
    label: 'Certificada',
    badge: 'bg-success-100 text-success-300 ring-1 ring-success-300/30',
    dot: 'bg-success-300',
  },
  Denegada: {
    label: 'Denegada',
    badge: 'bg-error-100 text-error-400 ring-1 ring-error-200',
    dot: 'bg-error-300',
  },
}

// ─── acciones agregadas (zona 1) ───────────────────────────────────────────────

interface HomeAction {
  id: string
  weight: number
  tone: 'gold' | 'navy' | 'error'
  icon: LucideIcon
  title: string
  body: string
  cta: { label: string; to: string }
}

const ACTION_TONE: Record<
  HomeAction['tone'],
  { wrap: string; iconBg: string }
> = {
  gold: { wrap: 'border-gold-300 bg-gold-100/60', iconBg: 'bg-gold-500 text-navy-500' },
  navy: { wrap: 'border-info-300/40 bg-info-100', iconBg: 'bg-navy-500 text-white' },
  error: { wrap: 'border-error-200 bg-error-100', iconBg: 'bg-error-300 text-white' },
}

/**
 * Recorre TODAS las solicitudes y arma la lista de cosas accionables por
 * el postulante, ordenadas por urgencia/impacto. Solo incluye acciones
 * reales del usuario (pagar, confirmar reunión, apelar) — NO los
 * `pendingItems`, que son estados del proceso (los muestra la lista).
 *
 * Robusto a la data vieja del demo: las reuniones pasadas se omiten
 * (confirmar una reunión vencida no tiene sentido); los pagos vencidos
 * siempre se pueden pagar, así que se mantienen y suben de prioridad.
 */
function deriveActions(requests: CertificationRequest[]): HomeAction[] {
  const actions: HomeAction[] = []
  const now = Date.now()

  for (const r of requests) {
    // Denegada → apelar (recurso con plazo; alta prioridad)
    if (r.status === 'Denegada') {
      actions.push({
        id: `appeal-${r.id}`,
        weight: 78,
        tone: 'error',
        icon: Scale,
        title: 'Podés apelar la decisión',
        body: `${r.productName} fue denegada. Pedí una reconsideración al Comité.`,
        cta: { label: 'Ver cómo apelar', to: `/mis-certificaciones/${r.id}/apelar` },
      })
    }

    // Pagos pendientes / vencidos
    for (const p of r.payments ?? []) {
      if (p.status !== 'pending' && p.status !== 'overdue') continue
      const overdue =
        p.status === 'overdue' || new Date(p.dueDate).getTime() < now
      const lastMile = r.status === 'En emisión'
      actions.push({
        id: `pay-${p.id}`,
        weight: 60 + (lastMile ? 15 : 0) + (overdue ? 10 : 0),
        tone: 'gold',
        icon: CreditCard,
        title: lastMile
          ? 'Pagá la emisión y recibí tu certificado'
          : 'Pagá el arancel para avanzar',
        body: `${r.productName} · ${p.concept} · ${formatMoney(p.amount, p.currency)}`,
        cta: { label: 'Pagar ahora', to: '/pagos' },
      })
    }

    // Reuniones pendientes de confirmar — solo futuras
    for (const m of r.meetings ?? []) {
      if (m.status !== 'pending') continue
      if (new Date(m.scheduledAt).getTime() < now) continue
      actions.push({
        id: `meet-${m.id}`,
        weight: 72,
        tone: 'navy',
        icon: CalendarClock,
        title: 'Confirmá la reunión con tu tutor',
        body: `${r.productName} · propuesta de ${m.auditorName}`,
        cta: { label: 'Ver propuesta', to: '/calendario' },
      })
    }
  }

  return actions.sort((a, b) => b.weight - a.weight)
}

// ─── novedades (zona 3) ─────────────────────────────────────────────────────

interface Novedad {
  event: HistoryEvent
  productName: string
  requestId: string
}

const NOV_ICON: Partial<Record<HistoryEventKind, LucideIcon>> = {
  request_created: Plus,
  evidence_uploaded: ImageIcon,
  audit_proposed: CalendarClock,
  audit_accepted: CheckCircle2,
  audit_rescheduled: CalendarClock,
  audit_rejected: CalendarClock,
  stage_changed: ArrowRight,
  document_uploaded: FileText,
  payment_received: CreditCard,
  message_sent: MessageCircle,
  cert_published: BadgeCheck,
}

/** Junta los eventos de historial de TODAS las solicitudes y los ordena
 *  por fecha desc. Los eventos relativos del mock (getter `at`) mantienen
 *  el feed siempre fresco en el demo. */
function collectNovedades(requests: CertificationRequest[]): Novedad[] {
  return requests
    .flatMap((r) =>
      (r.history ?? []).map((event) => ({
        event,
        productName: r.productName,
        requestId: r.id,
      })),
    )
    .filter((n) => Boolean(n.event.at))
    .sort(
      (a, b) =>
        new Date(b.event.at).getTime() - new Date(a.event.at).getTime(),
    )
}

// ─── componentes ────────────────────────────────────────────────────────────

function PrimaryAction({ action }: { action: HomeAction }) {
  const Icon = action.icon
  const tone = ACTION_TONE[action.tone]
  return (
    <section
      data-tour="quick-actions"
      className={cn('rounded-2xl border p-5 shadow-sm md:p-6', tone.wrap)}
    >
      <p className="text-xs font-bold uppercase tracking-wider text-navy-300">
        Tu próximo paso
      </p>
      <div className="mt-3 flex items-start gap-4">
        <span
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            tone.iconBg,
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-navy-500 md:text-lg">
            {action.title}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-navy-300">
            {action.body}
          </p>
          <Link
            to={action.cta.to}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-navy-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-navy-400"
          >
            {action.cta.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function SecondaryActions({ actions }: { actions: HomeAction[] }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-2">
      <p className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wider text-navy-300">
        Y además
      </p>
      <ul>
        {actions.map((a) => {
          const Icon = a.icon
          return (
            <li key={a.id}>
              <Link
                to={a.cta.to}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-neutral-50"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-navy-400">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-navy-500">
                    {a.title}
                  </span>
                  <span className="block truncate text-xs text-navy-300">
                    {a.body}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-neutral-400" />
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function ProgressDots({
  done,
  total,
}: {
  done: number
  total: number
}) {
  return (
    <span
      className="flex items-center gap-1"
      aria-label={`${done} de ${total} etapas completadas`}
    >
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'h-1.5 rounded-full transition-colors',
            i < done ? 'w-5 bg-gold-500' : i === done ? 'w-5 bg-navy-300' : 'w-2 bg-neutral-200',
          )}
        />
      ))}
    </span>
  )
}

function CertRow({ r }: { r: CertificationRequest }) {
  const meta = STATE_META[r.status]
  const { done, total, current } = progressOf(r)
  const isClosed = r.status === 'Certificado' || r.status === 'Denegada'
  const sub =
    r.status === 'Certificado'
      ? 'Vigente · registrada en blockchain'
      : r.status === 'Denegada'
        ? 'Proceso detenido · podés apelar'
        : current
          ? `Etapa actual: ${current.label}`
          : r.progressLabel

  return (
    <li>
      <Link
        to={`/mis-certificaciones/${r.id}`}
        className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 transition-colors hover:border-navy-300"
      >
        <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', meta.dot)} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="min-w-0 truncate font-bold text-navy-500">
              {r.productName}
            </p>
            <span
              className={cn(
                'shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold',
                meta.badge,
              )}
            >
              {meta.label}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-navy-300">{sub}</p>
          {!isClosed && (
            <div className="mt-2 flex items-center gap-2">
              <ProgressDots done={done} total={total} />
              <span className="text-[11px] font-semibold text-navy-300">
                {done} de {total}
              </span>
            </div>
          )}
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-neutral-400" />
      </Link>
    </li>
  )
}

function CertList({ requests }: { requests: CertificationRequest[] }) {
  return (
    <section data-tour="solicitudes-list">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-navy-300">
          Tus certificaciones
        </h2>
        <Link
          to="/certificar"
          data-tour="cta-nueva-cert"
          className="inline-flex items-center gap-1.5 rounded-full bg-navy-500 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-navy-400"
        >
          <Plus className="h-3.5 w-3.5" />
          Nueva
        </Link>
      </div>
      <ul className="mt-3 space-y-2">
        {requests.map((r) => (
          <CertRow key={r.id} r={r} />
        ))}
      </ul>
    </section>
  )
}

function Novedades({
  items,
  title,
  limit,
}: {
  items: Novedad[]
  title: string
  limit: number
}) {
  const shown = items.slice(0, limit)
  if (shown.length === 0) return null
  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-navy-300">
          {title}
        </h2>
        <Link
          to="/notificaciones"
          className="text-xs font-semibold text-navy-300 transition-colors hover:text-navy-500"
        >
          Ver todo
        </Link>
      </div>
      <ul className="mt-3 divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        {shown.map((n) => {
          const Icon = NOV_ICON[n.event.kind] ?? Sparkles
          return (
            <li key={n.event.id}>
              <Link
                to={`/mis-certificaciones/${n.requestId}`}
                className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-neutral-50"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-info-100 text-info-400">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-navy-500">
                    {n.event.title}
                  </p>
                  {n.event.description && (
                    <p className="truncate text-xs text-navy-300">
                      {n.event.description}
                    </p>
                  )}
                  <p className="mt-0.5 text-[11px] text-neutral-500">
                    {n.productName} · {timeAgo(n.event.at)}
                  </p>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function IdleBanner() {
  return (
    <section className="rounded-2xl border border-success-300/30 bg-success-100 p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success-300 text-white">
          <CheckCircle2 className="h-5 w-5" />
        </span>
        <div>
          <p className="font-bold text-navy-500">Estás al día</p>
          <p className="mt-1 text-sm leading-relaxed text-navy-300">
            No tenés nada pendiente por ahora. Te avisamos por email apenas
            haya novedades.
          </p>
        </div>
      </div>
    </section>
  )
}

// ─── DashboardHome ──────────────────────────────────────────────────────────

export default function DashboardHome() {
  const user = useAuthStore((s) => s.user)
  const [searchParams] = useSearchParams()
  const forceIdle = searchParams.get('vista') === 'idle'

  const requests = mockCertificationRequests
  const firstName = user?.name?.split(' ')[0] ?? 'Camila'

  const actions = useMemo(() => deriveActions(requests), [requests])
  const novedades = useMemo(() => collectNovedades(requests), [requests])
  const orderedRequests = useMemo(() => sortForList(requests), [requests])

  // Estado vacío — sin certificaciones todavía.
  if (requests.length === 0) {
    return (
      <div className="mx-auto max-w-[680px] px-4 py-12 sm:px-6 md:py-20">
        <div className="rounded-3xl bg-pattern-aztec p-8 text-center text-white shadow-xl md:p-12">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-500 text-navy-500 shadow-lg">
            <FileText className="h-8 w-8" />
          </span>
          <h1 className="mt-6 text-2xl font-bold md:text-[30px]">
            Hola {firstName} 👋
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-neutral-300 md:text-base">
            Cuando inicies tu primera certificación, vas a ver acá qué tenés
            que hacer y cómo va todo, paso a paso.
          </p>
          <Link
            to="/certificar"
            data-tour="cta-nueva-cert"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold-500 px-6 py-3 text-sm font-bold text-navy-500 shadow-md transition-colors hover:bg-gold-400"
          >
            <Plus className="h-4 w-4" />
            Empezar mi certificación
          </Link>
        </div>
        <TourInvite tour="solicitante" />
      </div>
    )
  }

  const hasActions = actions.length > 0 && !forceIdle
  const hero = hasActions ? actions[0] : null
  const rest = hasActions ? actions.slice(1) : []
  const hasNov = novedades.length > 0

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 md:px-10 md:py-10">
      <header>
        <h1 className="text-2xl font-bold text-navy-500 md:text-[28px]">
          {greetingByHour(firstName)}
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-navy-300 md:text-base">
          {hasActions
            ? 'Esto es lo más importante para que tus certificaciones avancen.'
            : 'Estás al día. Acá tenés lo último que pasó en tus certificaciones.'}
        </p>
      </header>

      {/* En desktop (lg+) usamos 2 columnas para aprovechar el ancho: a la
          izquierda el flujo principal, a la derecha un riel secundario.
          En mobile/tablet todo se apila en orden de prioridad. */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
        {hasActions && hero ? (
          <>
            <div
              className={cn(
                'space-y-6',
                hasNov ? 'lg:col-span-2' : 'lg:col-span-3',
              )}
            >
              <div className="space-y-3">
                <PrimaryAction action={hero} />
                {rest.length > 0 && <SecondaryActions actions={rest} />}
              </div>
              <CertList requests={orderedRequests} />
            </div>
            {hasNov && (
              <div className="lg:col-span-1">
                <Novedades items={novedades} title="Novedades" limit={5} />
              </div>
            )}
          </>
        ) : (
          <>
            <div className="space-y-6 lg:col-span-2">
              <IdleBanner />
              <Novedades items={novedades} title="Últimas novedades" limit={6} />
            </div>
            <div className="lg:col-span-1">
              <CertList requests={orderedRequests} />
            </div>
          </>
        )}
      </div>
      <TourInvite tour="solicitante" />
    </div>
  )
}
