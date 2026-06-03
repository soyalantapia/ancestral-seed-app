import type { LucideIcon } from 'lucide-react'
import { CalendarClock, CreditCard, FileText, Scale } from 'lucide-react'
import type { CertificationRequest } from '@/types'

/**
 * Alertas accionables del postulante — lo que necesita hacer para que sus
 * certificaciones avancen (pagar, responder al auditor, completar el
 * diagnóstico, apelar). Antes vivían como un banner "Tu próximo paso" dentro
 * del detalle de cada certificación; se centralizaron en la pestaña
 * Notificaciones para que estén todas en un solo lugar.
 */
export interface ActionAlert {
  id: string
  urgent: boolean
  icon: LucideIcon
  title: string
  body: string
  cta: { label: string; to: string }
}

function money(amount: number, currency: string): string {
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

export function deriveActionAlerts(
  requests: CertificationRequest[],
): ActionAlert[] {
  const alerts: ActionAlert[] = []
  const now = Date.now()

  for (const r of requests) {
    // Denegada → apelar
    if (r.status === 'Denegada') {
      alerts.push({
        id: `apelar-${r.id}`,
        urgent: true,
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
      alerts.push({
        id: `pay-${p.id}`,
        urgent: overdue,
        icon: CreditCard,
        title: overdue
          ? 'Regularizá tu arancel'
          : 'Pagá el arancel para avanzar',
        body: `${r.productName} · ${p.concept} · ${money(p.amount, p.currency)}`,
        cta: { label: 'Pagar ahora', to: '/pagos' },
      })
    }

    // Reuniones propuestas sin responder
    for (const m of r.meetings ?? []) {
      if (m.status !== 'pending') continue
      alerts.push({
        id: `meet-${m.id}`,
        urgent: true,
        icon: CalendarClock,
        title: 'Respondé la propuesta del auditor',
        body: `${m.auditorName} propuso una reunión para ${r.productName}. Confirmá o reprogramá.`,
        cta: {
          label: 'Ver propuesta',
          to: `/mis-certificaciones/${r.id}?tab=seguimiento`,
        },
      })
    }

    // Diagnóstico inicial pendiente
    if (r.diagnosticDeadline && r.diagnosticCompleted === false) {
      alerts.push({
        id: `diag-${r.id}`,
        urgent: true,
        icon: FileText,
        title: 'Completá el diagnóstico',
        body: `Es el primer paso para avanzar de etapa. Vence el ${r.diagnosticDeadline}.`,
        cta: {
          label: 'Completar ahora',
          to: `/mis-certificaciones/${r.id}?tab=evaluacion`,
        },
      })
    }
  }

  // Urgentes primero.
  return alerts.sort((a, b) => Number(b.urgent) - Number(a.urgent))
}
