import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Download,
  Filter,
  Receipt,
  Search,
  Settings as SettingsIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { mockCertificationRequests } from '@/services/mocks/data'
import type { PaymentStatus } from '@/types'
import {
  CheckoutModal,
  type CheckoutPaymentInput,
  type CheckoutResult,
} from '@/components/features/CheckoutModal'
import { cn, downloadBlob, objectsToCsv } from '@/lib/utils'

function buildPaymentReceipt(p: FlatPayment): string {
  return [
    '═══════════════════════════════════════════════════════════════',
    '       ANCESTRAL SEED — COMPROBANTE DE PAGO',
    '═══════════════════════════════════════════════════════════════',
    '',
    `Identificador: ${p.id}`,
    `Concepto: ${p.concept}`,
    `Solicitud: ${p.requestNumber} · ${p.requestName}`,
    `Monto: ${p.currency} ${p.amount.toLocaleString('es-AR')}`,
    `Estado: ${p.status.toUpperCase()}`,
    `Vencimiento: ${p.dueDate}`,
    p.paidAt ? `Pagado el: ${p.paidAt}` : '',
    '',
    `Generado el ${new Date().toLocaleString('es-AR')}`,
    'Documento de validez oficial — Ancestral Seed Foundation',
  ]
    .filter(Boolean)
    .join('\n')
}

type FlatPayment = {
  id: string
  concept: string
  amount: number
  currency: string
  status: PaymentStatus
  dueDate: string
  paidAt?: string
  invoiceUrl?: string
  requestId: string
  requestName: string
  requestNumber: string
}

function daysUntil(iso: string): number | null {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - today.getTime()) / 86_400_000)
}

function fmt(amount: number, currency: string) {
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

function statusMeta(s: PaymentStatus): {
  label: string
  className: string
} {
  switch (s) {
    case 'paid':
      return {
        label: 'Pagado',
        className:
          'bg-success-100 text-success-300 ring-1 ring-success-300/30',
      }
    case 'pending':
      return {
        label: 'Pendiente',
        className:
          'bg-warning-100 text-warning-400 ring-1 ring-warning-300/40',
      }
    case 'overdue':
      return {
        label: 'Vencido',
        className: 'bg-error-100 text-error-400 ring-1 ring-error-300/40',
      }
    case 'refunded':
      return {
        label: 'Reintegrado',
        className: 'bg-info-100 text-info-400 ring-1 ring-info-300/40',
      }
  }
}

const filters: { id: 'all' | PaymentStatus; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'pending', label: 'Pendientes' },
  { id: 'paid', label: 'Pagados' },
  { id: 'overdue', label: 'Vencidos' },
]

export default function Pagos() {
  /**
   * SA4 (#POS-31, auditoría UX): antes "Pagar" disparaba toast inocuo.
   * Ahora abrimos CheckoutModal con el item seleccionado. Las
   * confirmaciones (card o transferencia) generan un override local
   * que marca el pago como `paid` en la lista, persistido en este
   * mount pero no en el mock global (que es read-only).
   *
   * En producción esto se reemplaza con un PATCH al backend que
   * propaga el cambio a todos los clientes.
   */
  const [checkoutItem, setCheckoutItem] =
    useState<CheckoutPaymentInput | null>(null)
  const [paidOverrides, setPaidOverrides] = useState<
    Record<string, { paidAt: string; method: 'card' | 'transfer' }>
  >({})

  const allPayments: FlatPayment[] = useMemo(
    () =>
      mockCertificationRequests.flatMap((r) =>
        (r.payments ?? []).map((p) => {
          const override = paidOverrides[p.id]
          return {
            ...p,
            status: override ? ('paid' as PaymentStatus) : p.status,
            paidAt: override?.paidAt ?? p.paidAt,
            requestId: r.id,
            requestName: r.productName,
            requestNumber: r.number,
          }
        }),
      ),
    [paidOverrides],
  )

  function handlePaid(result: CheckoutResult) {
    setPaidOverrides((prev) => ({
      ...prev,
      [result.itemId]: {
        paidAt: result.paidAt,
        method: result.method,
      },
    }))
    if (result.method === 'card') {
      toast.success('Pago confirmado — vas a recibir el recibo por email')
    } else {
      toast.success(
        'Comprobante recibido — lo revisamos en menos de 24h',
      )
    }
  }

  const pendingCount = allPayments.filter(
    (p) => p.status === 'pending' || p.status === 'overdue',
  ).length

  // Default filter: Pendientes si hay alguno; sino Todos
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | PaymentStatus>(
    pendingCount > 0 ? 'pending' : 'all',
  )

  const filtered = useMemo(() => {
    let list = allPayments
    if (filter !== 'all') list = list.filter((p) => p.status === filter)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (p) =>
          p.concept.toLowerCase().includes(q) ||
          p.requestName.toLowerCase().includes(q) ||
          p.requestNumber.toLowerCase().includes(q),
      )
    }
    return list.slice().sort((a, b) => {
      // Pendientes/vencidos primero por urgencia, después por fecha desc
      const aPending = a.status === 'pending' || a.status === 'overdue'
      const bPending = b.status === 'pending' || b.status === 'overdue'
      if (aPending && !bPending) return -1
      if (!aPending && bPending) return 1
      if (aPending && bPending) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      }
      const da = a.paidAt ?? a.dueDate
      const db = b.paidAt ?? b.dueDate
      return new Date(db).getTime() - new Date(da).getTime()
    })
  }, [allPayments, filter, query])

  // KPIs simplificados
  const totalPaid = allPayments
    .filter((p) => p.status === 'paid')
    .reduce((a, p) => a + p.amount, 0)
  const totalPending = allPayments
    .filter((p) => p.status === 'pending' || p.status === 'overdue')
    .reduce((a, p) => a + p.amount, 0)
  const currency = allPayments[0]?.currency ?? 'ARS'

  // Pago más urgente para banner highlight
  const urgent = allPayments
    .filter((p) => p.status === 'pending' || p.status === 'overdue')
    .map((p) => ({ ...p, days: daysUntil(p.dueDate) }))
    .filter((p) => p.days !== null && p.days <= 7)
    .sort((a, b) => (a.days ?? 99) - (b.days ?? 99))[0]

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 md:px-10 md:py-10">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-500 md:text-[28px]">
            Pagos
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-navy-300 md:text-base">
            Historial completo y próximos vencimientos en un solo lugar.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            const rows = filtered.map((p) => ({
              id: p.id,
              concepto: p.concept,
              certificacion: p.requestName,
              numero: p.requestNumber,
              monto: p.amount,
              moneda: p.currency,
              estado: p.status,
              vencimiento: p.dueDate,
              pagado_el: p.paidAt ?? '',
            }))
            downloadBlob(
              `pagos-${new Date().toISOString().slice(0, 10)}.csv`,
              objectsToCsv(rows),
              'text/csv;charset=utf-8',
            )
            toast.success(`${rows.length} pagos exportados a CSV`)
          }}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 text-xs font-bold text-navy-500 transition-colors hover:bg-neutral-100"
        >
          <Download className="h-3.5 w-3.5" />
          Exportar
        </button>
      </header>

      {/* KPIs (2 nada más) */}
      <section className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
        <KpiCard
          icon={CheckCircle2}
          label="Total pagado"
          value={fmt(totalPaid, currency)}
          tone="success"
        />
        <KpiCard
          icon={AlertTriangle}
          label="Pendiente de pago"
          value={fmt(totalPending, currency)}
          tone="warning"
          sub={
            pendingCount > 0
              ? `${pendingCount} pago${pendingCount === 1 ? '' : 's'}`
              : 'Sin pendientes'
          }
        />
      </section>

      {/* Urgent banner (solo si hay pago en <=7 días) */}
      {urgent && (
        <UrgentBanner
          concept={urgent.concept}
          amount={urgent.amount}
          currency={urgent.currency}
          days={urgent.days ?? 0}
          requestId={urgent.requestId}
        />
      )}

      {/* Historial unificado */}
      <section className="mt-6 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-navy-500" />
            <h2 className="text-lg font-bold text-navy-500">
              Movimientos
            </h2>
            <span className="text-xs text-navy-300">
              ({filtered.length})
            </span>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar concepto o solicitud..."
              className="h-10 w-full rounded-full border border-neutral-300 bg-white pl-11 pr-4 text-sm text-navy-500 placeholder:text-navy-300 focus:border-gold-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-navy-300" />
          {filters.map((f) => {
            const count =
              f.id === 'all'
                ? allPayments.length
                : allPayments.filter((p) => p.status === f.id).length
            const active = filter === f.id
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition-colors',
                  active
                    ? 'bg-navy-500 text-white'
                    : 'border border-neutral-300 bg-white text-navy-500 hover:bg-neutral-100',
                )}
              >
                {f.label}
                <span
                  className={cn(
                    'inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold',
                    active
                      ? 'bg-gold-500 text-navy-500'
                      : 'bg-neutral-200 text-navy-500',
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Lista (mismo render desktop y mobile, simple) */}
        {filtered.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-neutral-300 p-10 text-center">
            <Receipt className="mx-auto h-8 w-8 text-navy-300" />
            <p className="mt-3 text-sm font-bold text-navy-500">
              Sin movimientos
            </p>
            <p className="mt-1 text-xs text-navy-300">
              Ajustá los filtros o la búsqueda.
            </p>
          </div>
        ) : (
          <ul className="mt-5 space-y-2.5">
            {filtered.map((p) => {
              const days = daysUntil(p.dueDate)
              const isUrgent =
                (p.status === 'pending' || p.status === 'overdue') &&
                days !== null &&
                days <= 7
              const meta = statusMeta(p.status)
              return (
                <li
                  key={p.id}
                  className={cn(
                    'flex flex-col gap-3 rounded-2xl border p-4 transition-colors sm:flex-row sm:items-center',
                    isUrgent
                      ? p.status === 'overdue' || (days !== null && days < 0)
                        ? 'border-error-300 bg-error-100/50'
                        : 'border-warning-300 bg-warning-100/50'
                      : 'border-neutral-200 bg-white hover:bg-neutral-100',
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-navy-500">
                        {p.concept}
                      </p>
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[10px] font-bold',
                          meta.className,
                        )}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-navy-300">
                      {p.requestNumber} · {p.requestName}
                    </p>
                    <p className="mt-1 text-[11px] text-navy-300">
                      {p.status === 'paid' && p.paidAt
                        ? `Pagado el ${new Date(p.paidAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}`
                        : `Vence el ${new Date(p.dueDate).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}${
                            isUrgent
                              ? ` · ${
                                  days !== null && days < 0
                                    ? `vencido hace ${Math.abs(days)}d`
                                    : days === 0
                                      ? 'vence hoy'
                                      : `en ${days} día${days === 1 ? '' : 's'}`
                                }`
                              : ''
                          }`}
                    </p>
                    {/* Fix QW-B4 (auditoría UX): antes el "vencido" era
                        solo un color rojo y una etiqueta. El postulante
                        no sabía si era molestia o si le pausaban la
                        solicitud. Ahora el copy comunica la consecuencia
                        explícita del Reglamento 4.6 (suspensión por no
                        conformidades sin resolver). */}
                    {(p.status === 'overdue' ||
                      (p.status === 'pending' &&
                        days !== null &&
                        days < 0)) && (
                      <p className="mt-1 text-[11px] font-medium text-error-400">
                        Si no se regulariza en 30 días corridos, tu
                        solicitud queda pausada hasta subsanar.
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1.5">
                    <p className="text-base font-bold text-navy-500">
                      {fmt(p.amount, p.currency)}
                    </p>
                    {p.status === 'pending' || p.status === 'overdue' ? (
                      <button
                        type="button"
                        onClick={() =>
                          setCheckoutItem({
                            id: p.id,
                            concept: p.concept,
                            amount: p.amount,
                            currency: p.currency,
                            requestLabel: `${p.requestNumber} · ${p.requestName}`,
                            dueDate: p.dueDate,
                          })
                        }
                        className={cn(
                          'inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-bold transition-colors',
                          p.status === 'overdue' ||
                            (days !== null && days < 0)
                            ? 'bg-error-400 text-white hover:bg-error-300'
                            : 'bg-navy-500 text-white hover:bg-navy-400',
                        )}
                      >
                        Pagar
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    ) : p.invoiceUrl ? (
                      <button
                        type="button"
                        onClick={() => {
                          downloadBlob(
                            `factura-${p.id}.txt`,
                            buildPaymentReceipt(p),
                          )
                          toast.success(`Factura ${p.id} descargada`)
                        }}
                        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 text-xs font-bold text-navy-500 transition-colors hover:bg-neutral-100"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Factura
                      </button>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Link sutil a métodos de pago en Configuración */}
      <Link
        to="/configuracion"
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy-300 transition-colors hover:text-navy-500"
      >
        <SettingsIcon className="h-4 w-4" />
        Gestionar métodos de pago
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>

      {/* Checkout — abre al click "Pagar" sobre cualquier pago pendiente */}
      <CheckoutModal
        open={checkoutItem !== null}
        item={checkoutItem}
        onClose={() => setCheckoutItem(null)}
        onPaid={handlePaid}
      />
    </div>
  )
}

function UrgentBanner({
  concept,
  amount,
  currency,
  days,
  requestId,
}: {
  concept: string
  amount: number
  currency: string
  days: number
  requestId: string
}) {
  const isOverdue = days < 0
  const tone = isOverdue || days <= 3 ? 'red' : 'yellow'
  const when = isOverdue
    ? `Vencido hace ${Math.abs(days)} día${Math.abs(days) === 1 ? '' : 's'}`
    : days === 0
      ? 'Vence hoy'
      : `Vence en ${days} día${days === 1 ? '' : 's'}`
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
        <CreditCard className="h-5 w-5" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-widest text-error-400">
          Pago {isOverdue ? 'vencido' : 'urgente'}
        </p>
        <p className="mt-1 text-sm font-bold text-navy-500">
          {fmt(amount, currency)} · {concept}
        </p>
        <p className="mt-0.5 text-xs text-navy-500/80">{when}</p>
      </div>
      <Link
        to={`/mis-certificaciones/${requestId}?tab=pagos`}
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

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: typeof CreditCard
  label: string
  value: string
  sub?: string
  tone: 'navy' | 'success' | 'warning'
}) {
  const styles = {
    navy: 'bg-navy-500 text-white',
    success: 'bg-success-100 text-success-300',
    warning: 'bg-warning-100 text-warning-400',
  }[tone]
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm md:p-5">
      <div
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full',
          styles,
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 text-xl font-bold text-navy-500 md:text-2xl">
        {value}
      </p>
      <p className="mt-1 text-xs text-navy-300">{label}</p>
      {sub && (
        <p className="mt-1 text-[11px] font-semibold text-navy-400">{sub}</p>
      )}
    </div>
  )
}
