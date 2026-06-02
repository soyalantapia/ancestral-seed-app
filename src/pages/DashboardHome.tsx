import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Check,
  CreditCard,
  ExternalLink,
  FileText,
  Plus,
  Search,
  Share2,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/auth'
import { useAutoStartTour } from '@/hooks/useAutoStartTour'
import { mockCertificationRequests } from '@/services/mocks/data'
import { cn } from '@/lib/utils'
import type {
  CertificationRequest,
  RequestStageItem,
} from '@/types'

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

const isCertified = (r: CertificationRequest): boolean =>
  r.status === 'Certificado' ||
  r.stages.find((s) => s.stage === 'certificacion')?.status === 'completed'

const completedCount = (r: CertificationRequest): number =>
  r.stages.filter((s) => s.status === 'completed').length

/**
 * Elegimos UNA certificación para destacar — el panel se enfoca en el
 * trayecto activo del usuario, sin amontonar tarjetas.
 *
 * Default: la más avanzada (más etapas completas, desempate por la más
 * reciente). El query `?vista=emitido|revision` permite previsualizar
 * cada estado del panel (útil para demo y diseño).
 */
function selectFeatured(
  requests: CertificationRequest[],
  vista: string | null,
): CertificationRequest | undefined {
  if (requests.length === 0) return undefined
  const byProgress = [...requests].sort(
    (a, b) =>
      completedCount(b) - completedCount(a) ||
      b.createdAt.localeCompare(a.createdAt),
  )
  const active = (r: CertificationRequest) =>
    r.status === 'En curso' || r.status === 'En emisión'
  if (vista === 'emitido') {
    return byProgress.find(isCertified) ?? byProgress[0]
  }
  if (vista === 'revision') {
    return byProgress.find(active) ?? byProgress[0]
  }
  // Auto: priorizamos un trayecto ACTIVO (necesita atención); si no hay,
  // el certificado más reciente; recién después, cualquier otro (denegada).
  return byProgress.find(active) ?? byProgress.find(isCertified) ?? byProgress[0]
}

interface NextStep {
  tone: 'gold' | 'navy' | 'calm'
  icon: typeof CreditCard
  title: string
  body: string
  cta?: { label: string; to: string }
}

function deriveNextStep(r: CertificationRequest): NextStep {
  const pendingPayment = (r.payments ?? []).find(
    (p) => p.status === 'pending' || p.status === 'overdue',
  )
  if (pendingPayment) {
    return {
      tone: 'gold',
      icon: CreditCard,
      title: 'Pagá el arancel para que tu certificación avance',
      body: `${pendingPayment.concept} · ${formatMoney(pendingPayment.amount, pendingPayment.currency)}`,
      cta: { label: 'Pagar ahora', to: '/pagos' },
    }
  }
  const pendingMeeting = (r.meetings ?? []).find((m) => m.status === 'pending')
  if (pendingMeeting) {
    return {
      tone: 'navy',
      icon: CalendarClock,
      title: 'Tu tutor propuso una reunión',
      body: 'Confirmá el horario para coordinar la auditoría de tu producto.',
      cta: { label: 'Ver propuesta', to: '/calendario' },
    }
  }
  if ((r.pendingItems ?? []).length > 0) {
    return {
      tone: 'navy',
      icon: FileText,
      title: 'Revisá lo que queda pendiente',
      body: r.pendingItems.join(' · '),
      cta: { label: 'Ver mi solicitud', to: `/mis-certificaciones/${r.id}` },
    }
  }
  return {
    tone: 'calm',
    icon: Sparkles,
    title: 'Tu tutor está revisando tu solicitud',
    body: 'No tenés nada pendiente por ahora. Te avisamos por email apenas haya novedades.',
  }
}

// ─── timeline ───────────────────────────────────────────────────────────────

function JourneyTimeline({ stages }: { stages: RequestStageItem[] }) {
  return (
    <ol className="mt-2">
      {stages.map((s, i) => {
        const last = i === stages.length - 1
        const done = s.status === 'completed'
        const current = s.status === 'in_progress'
        return (
          <li key={s.stage} className="relative flex gap-4 pb-6 last:pb-0">
            {!last && (
              <span
                aria-hidden
                className={cn(
                  'absolute left-[15px] top-8 h-[calc(100%-1rem)] w-0.5',
                  done ? 'bg-gold-300' : 'bg-neutral-200',
                )}
              />
            )}
            <span
              className={cn(
                'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                done && 'bg-gold-500 text-navy-500',
                current &&
                  'bg-navy-500 text-white ring-4 ring-navy-500/15',
                !done && !current && 'border-2 border-neutral-300 bg-white',
              )}
            >
              {done ? (
                <Check className="h-4 w-4" strokeWidth={3} />
              ) : current ? (
                <span className="h-2.5 w-2.5 rounded-full bg-white" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-neutral-300" />
              )}
            </span>
            <div className="pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <p
                  className={cn(
                    'text-sm font-semibold md:text-base',
                    current ? 'text-navy-500' : done ? 'text-navy-400' : 'text-neutral-500',
                  )}
                >
                  {s.label}
                </p>
                {current && (
                  <span className="inline-flex items-center rounded-full bg-navy-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    Estás acá
                  </span>
                )}
              </div>
              {s.date && (
                <p className="mt-0.5 text-xs text-neutral-500">{s.date}</p>
              )}
              {current && s.description && (
                <p className="mt-1 text-sm leading-relaxed text-navy-300">
                  {s.description}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

// ─── next step ────────────────────────────────────────────────────────────────

function NextStepCard({ step }: { step: NextStep }) {
  const Icon = step.icon
  const toneRing =
    step.tone === 'gold'
      ? 'border-gold-300 bg-gold-50/50'
      : step.tone === 'navy'
        ? 'border-navy-200 bg-navy-50/40'
        : 'border-neutral-200 bg-white'
  const iconBg =
    step.tone === 'gold'
      ? 'bg-gold-500 text-navy-500'
      : step.tone === 'navy'
        ? 'bg-navy-500 text-white'
        : 'bg-neutral-100 text-navy-400'
  return (
    <div
      data-tour="quick-actions"
      className={cn('mt-4 rounded-2xl border p-5', toneRing)}
    >
      <p className="text-xs font-bold uppercase tracking-wider text-navy-300">
        Qué sigue
      </p>
      <div className="mt-3 flex items-start gap-4">
        <span
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            iconBg,
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-navy-500">{step.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-navy-300">
            {step.body}
          </p>
          {step.cta && (
            <Link
              to={step.cta.to}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-navy-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-navy-400"
            >
              {step.cta.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── emitted ──────────────────────────────────────────────────────────────────

function EmittedHero({
  request,
  publicUrl,
}: {
  request: CertificationRequest
  publicUrl: string
}) {
  const share = () => {
    const url = `${window.location.origin}${publicUrl}`
    if (navigator.share) {
      navigator
        .share({ title: `Certificado · ${request.productName}`, url })
        .catch(() => {})
    } else {
      navigator.clipboard
        ?.writeText(url)
        .then(() => toast.success('Enlace copiado'))
        .catch(() => toast.error('No pudimos copiar el enlace'))
    }
  }
  return (
    <section
      data-tour="solicitudes-list"
      className="overflow-hidden rounded-3xl border border-gold-300/60 bg-gradient-to-br from-gold-50 to-cream-50 p-6 text-center shadow-sm md:p-10"
    >
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-500 text-navy-500 shadow-md">
        <BadgeCheck className="h-9 w-9" />
      </span>
      <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-gold-700">
        Certificado emitido
      </p>
      <h2 className="mt-2 text-2xl font-bold text-navy-500 md:text-[28px]">
        ¡Tu certificado está listo!
      </h2>
      <p className="mt-2 text-sm text-navy-300 md:text-base">
        {request.productName} · {request.number}
      </p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-navy-300">
        Tu autenticidad quedó registrada en blockchain. Cualquier persona
        puede verificarla escaneando el QR de tu producto.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          to={publicUrl}
          className="inline-flex items-center gap-2 rounded-full bg-navy-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-navy-400"
        >
          <ExternalLink className="h-4 w-4" />
          Ver mi ficha pública
        </Link>
        <button
          type="button"
          onClick={share}
          className="inline-flex items-center gap-2 rounded-full border border-navy-200 bg-white px-5 py-3 text-sm font-bold text-navy-500 transition-colors hover:bg-neutral-50"
        >
          <Share2 className="h-4 w-4" />
          Compartir
        </button>
        <Link
          to="/verificar"
          className="inline-flex items-center gap-2 rounded-full border border-navy-200 bg-white px-5 py-3 text-sm font-bold text-navy-500 transition-colors hover:bg-neutral-50"
        >
          <Search className="h-4 w-4" />
          Verificar
        </Link>
      </div>
    </section>
  )
}

// ─── atajos (secundario, discreto) ─────────────────────────────────────────────

function QuickLinks({ authorSlug }: { authorSlug?: string }) {
  const links = [
    {
      to: '/certificar',
      label: 'Nueva certificación',
      icon: Plus,
      tour: 'cta-nueva-cert',
    },
    {
      to: authorSlug ? `/autor/${authorSlug}` : '/mi-perfil',
      label: 'Mi perfil público',
      icon: ExternalLink,
      tour: undefined,
    },
    { to: '/ayuda', label: 'Centro de ayuda', icon: FileText },
  ]
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {links.map((l) => {
        const Icon = l.icon
        return (
          <Link
            key={l.label}
            to={l.to}
            data-tour={l.tour}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-navy-400 transition-colors hover:border-navy-300 hover:text-navy-500"
          >
            <Icon className="h-3.5 w-3.5" />
            {l.label}
          </Link>
        )
      })}
    </div>
  )
}

// ─── DashboardHome ──────────────────────────────────────────────────────────

export default function DashboardHome() {
  const user = useAuthStore((s) => s.user)
  useAutoStartTour('solicitante')
  const [searchParams] = useSearchParams()
  const vista = searchParams.get('vista')

  const requests = mockCertificationRequests
  const firstName = user?.name?.split(' ')[0] ?? 'Camila'
  const authorSlug = user?.authorSlug

  const featured = useMemo(
    () => selectFeatured(requests, vista),
    [requests, vista],
  )

  // Estado vacío — sin certificaciones todavía.
  if (!featured) {
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
            Cuando inicies tu primera certificación, vas a ver acá en qué
            etapa estás y qué sigue, paso a paso.
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
      </div>
    )
  }

  const emitted = vista === 'emitido' || isCertified(featured)
  // Para el estado emitido en demo (si la solicitud destacada todavía no
  // llegó a "certificación"), mostramos la línea de tiempo completa.
  const timelineStages: RequestStageItem[] = emitted
    ? featured.stages.map((s) => ({ ...s, status: 'completed' as const }))
    : featured.stages
  const publicUrl = authorSlug ? `/autor/${authorSlug}` : '/directorio'
  const nextStep = deriveNextStep(featured)

  return (
    <div className="mx-auto max-w-[680px] px-4 py-8 sm:px-6 md:py-12">
      {/* Saludo */}
      <header>
        <h1 className="text-2xl font-bold text-navy-500 md:text-[28px]">
          {greetingByHour(firstName)}
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-navy-300 md:text-base">
          {emitted
            ? 'Tu certificación está completa. Acá tenés todo para mostrarla.'
            : 'Acá ves en qué etapa está tu certificación y qué sigue.'}
        </p>
      </header>

      <div className="mt-6">
        {emitted ? (
          <>
            <EmittedHero request={featured} publicUrl={publicUrl} />
            <section className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-navy-300">
                El recorrido
              </p>
              <JourneyTimeline stages={timelineStages} />
            </section>
          </>
        ) : (
          <>
            <section
              data-tour="solicitudes-list"
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-navy-300">
                    {featured.number}
                  </p>
                  <h2 className="mt-0.5 truncate text-lg font-bold text-navy-500 md:text-xl">
                    {featured.productName}
                  </h2>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-navy-50 px-3 py-1 text-xs font-bold text-navy-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
                  En revisión
                </span>
              </div>
              <div className="mt-5 border-t border-neutral-100 pt-5">
                <JourneyTimeline stages={timelineStages} />
              </div>
            </section>

            <NextStepCard step={nextStep} />
          </>
        )}
      </div>

      <QuickLinks authorSlug={authorSlug} />
    </div>
  )
}
