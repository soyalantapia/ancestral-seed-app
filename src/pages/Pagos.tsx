import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Download,
  FileText,
  Filter,
  Plus,
  Receipt,
  Search,
  Wallet,
} from 'lucide-react'
import { toast } from 'sonner'
import { mockCertificationRequests } from '@/services/mocks/data'
import type { PaymentStatus } from '@/types'
import { cn } from '@/lib/utils'

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
  const allPayments: FlatPayment[] = useMemo(
    () =>
      mockCertificationRequests.flatMap((r) =>
        (r.payments ?? []).map((p) => ({
          ...p,
          requestId: r.id,
          requestName: r.productName,
          requestNumber: r.number,
        })),
      ),
    [],
  )

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | PaymentStatus>('all')

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
    // Más recientes primero (por fecha de pago o vencimiento)
    return list.slice().sort((a, b) => {
      const da = a.paidAt ?? a.dueDate
      const db = b.paidAt ?? b.dueDate
      return new Date(db).getTime() - new Date(da).getTime()
    })
  }, [allPayments, filter, query])

  // KPIs
  const totalPaid = allPayments
    .filter((p) => p.status === 'paid')
    .reduce((a, p) => a + p.amount, 0)
  const totalPending = allPayments
    .filter((p) => p.status === 'pending' || p.status === 'overdue')
    .reduce((a, p) => a + p.amount, 0)
  const next = allPayments
    .filter((p) => p.status === 'pending' || p.status === 'overdue')
    .slice()
    .sort(
      (a, b) =>
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    )[0]
  const currency = allPayments[0]?.currency ?? 'ARS'

  const pendingCount = allPayments.filter(
    (p) => p.status === 'pending' || p.status === 'overdue',
  ).length

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 md:px-10 md:py-10">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-500 md:text-[28px]">
            Pagos
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-navy-300 md:text-base">
            Historial completo, próximos vencimientos y métodos de pago en un
            solo lugar.
          </p>
        </div>
      </header>

      {/* KPIs */}
      <section className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
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
        <KpiCard
          icon={CreditCard}
          label="Próximo vencimiento"
          value={
            next
              ? new Date(next.dueDate).toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: 'short',
                })
              : '—'
          }
          tone="navy"
          sub={next ? `${fmt(next.amount, next.currency)}` : 'Sin próximos'}
        />
      </section>

      {/* Pendientes destacados */}
      {pendingCount > 0 && (
        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-navy-500">
              Pagos pendientes
            </h2>
            <span className="text-xs text-navy-300">
              Ordenados por urgencia
            </span>
          </div>
          <ul className="mt-4 space-y-3">
            {allPayments
              .filter(
                (p) => p.status === 'pending' || p.status === 'overdue',
              )
              .slice()
              .sort(
                (a, b) =>
                  new Date(a.dueDate).getTime() -
                  new Date(b.dueDate).getTime(),
              )
              .map((p) => {
                const days = daysUntil(p.dueDate)
                const tone =
                  p.status === 'overdue' || (days !== null && days < 0)
                    ? 'red'
                    : days !== null && days <= 7
                      ? 'yellow'
                      : 'green'
                const label =
                  days === null
                    ? 'Sin fecha'
                    : days < 0
                      ? `Vencido hace ${Math.abs(days)}d`
                      : days === 0
                        ? 'Vence hoy'
                        : `Vence en ${days}d`
                return (
                  <li
                    key={p.id}
                    className={cn(
                      'flex flex-col gap-3 rounded-2xl border-2 p-4 sm:flex-row sm:items-center sm:gap-4',
                      tone === 'red'
                        ? 'border-error-300 bg-error-100'
                        : tone === 'yellow'
                          ? 'border-warning-300 bg-warning-100'
                          : 'border-neutral-200 bg-white',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                        tone === 'red'
                          ? 'bg-error-300 text-white'
                          : tone === 'yellow'
                            ? 'bg-warning-400 text-white'
                            : 'bg-navy-500 text-white',
                      )}
                    >
                      <CreditCard className="h-5 w-5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-navy-500">
                        {p.concept}
                      </p>
                      <p className="mt-0.5 text-xs text-navy-300">
                        {p.requestNumber} · {p.requestName}
                      </p>
                      <p className="mt-1 inline-flex items-center gap-2 text-xs font-bold text-navy-500">
                        {fmt(p.amount, p.currency)}
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[10px] font-bold',
                            tone === 'red'
                              ? 'bg-error-200 text-error-400'
                              : tone === 'yellow'
                                ? 'bg-warning-200 text-warning-400'
                                : 'bg-success-100 text-success-400',
                          )}
                        >
                          {label}
                        </span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        toast.success(`Iniciando pago de ${p.concept}`)
                      }
                      className={cn(
                        'inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold shadow-sm transition-colors',
                        tone === 'red'
                          ? 'bg-error-400 text-white hover:bg-error-300'
                          : 'bg-navy-500 text-white hover:bg-navy-400',
                      )}
                    >
                      Pagar ahora
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </li>
                )
              })}
          </ul>
        </section>
      )}

      {/* Historial completo */}
      <section className="mt-8 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-navy-500" />
            <h2 className="text-lg font-bold text-navy-500">
              Historial de pagos
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
              placeholder="Buscar concepto, certificación..."
              className="h-10 w-full rounded-full border border-neutral-300 bg-white pl-11 pr-4 text-sm text-navy-500 placeholder:text-navy-300 focus:border-gold-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Filter chips */}
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

        {/* Lista */}
        {filtered.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-neutral-300 p-10 text-center">
            <Receipt className="mx-auto h-8 w-8 text-navy-300" />
            <p className="mt-3 text-sm font-bold text-navy-500">
              Sin resultados
            </p>
            <p className="mt-1 text-xs text-navy-300">
              Ajustá los filtros o la búsqueda.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop: tabla */}
            <div className="mt-5 hidden overflow-hidden rounded-2xl border border-neutral-200 md:block">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-100 text-xs uppercase tracking-widest text-navy-300">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Concepto</th>
                    <th className="px-4 py-3 font-semibold">Certificación</th>
                    <th className="px-4 py-3 font-semibold">Fecha</th>
                    <th className="px-4 py-3 font-semibold text-right">
                      Monto
                    </th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                    <th className="px-4 py-3 font-semibold text-right">
                      Factura
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filtered.map((p) => {
                    const meta = statusMeta(p.status)
                    return (
                      <tr key={p.id} className="hover:bg-neutral-100">
                        <td className="px-4 py-3 font-semibold text-navy-500">
                          {p.concept}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            to={`/mis-certificaciones/${p.requestId}?tab=pagos`}
                            className="text-xs font-semibold text-gold-700 hover:underline"
                          >
                            {p.requestNumber} · {p.requestName}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-xs text-navy-300">
                          {new Date(
                            p.paidAt ?? p.dueDate,
                          ).toLocaleDateString('es-AR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-navy-500">
                          {fmt(p.amount, p.currency)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              'inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold',
                              meta.className,
                            )}
                          >
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {p.invoiceUrl ? (
                            <button
                              type="button"
                              onClick={() => toast.success('Descargando factura')}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700 hover:underline"
                            >
                              <Download className="h-3.5 w-3.5" />
                              PDF
                            </button>
                          ) : (
                            <span className="text-[11px] text-navy-300">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile: cards */}
            <ul className="mt-5 space-y-3 md:hidden">
              {filtered.map((p) => {
                const meta = statusMeta(p.status)
                return (
                  <li
                    key={p.id}
                    className="rounded-2xl border border-neutral-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-navy-500">
                          {p.concept}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-navy-300">
                          {p.requestNumber} · {p.requestName}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold',
                          meta.className,
                        )}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <div className="mt-3 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[11px] text-navy-300">
                          {new Date(
                            p.paidAt ?? p.dueDate,
                          ).toLocaleDateString('es-AR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="mt-0.5 text-base font-bold text-navy-500">
                          {fmt(p.amount, p.currency)}
                        </p>
                      </div>
                      {p.invoiceUrl ? (
                        <button
                          type="button"
                          onClick={() => toast.success('Descargando factura')}
                          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-neutral-200 px-3 text-xs font-bold text-navy-500 transition-colors hover:bg-neutral-300"
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
          </>
        )}
      </section>

      {/* Métodos de pago */}
      <section className="mt-8 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-navy-500" />
            <h2 className="text-lg font-bold text-navy-500">
              Métodos de pago
            </h2>
          </div>
          <button
            type="button"
            onClick={() => toast.info('Agregar método de pago — próximamente')}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-gold-500 px-4 text-xs font-bold text-navy-500 transition-colors hover:bg-gold-400"
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar
          </button>
        </div>
        <p className="mt-2 text-xs text-navy-300">
          Tarjetas y cuentas guardadas para futuras facturas.
        </p>

        <div className="mt-5 rounded-2xl border border-dashed border-neutral-300 p-8 text-center">
          <CreditCard className="mx-auto h-8 w-8 text-navy-300" />
          <p className="mt-3 text-sm font-bold text-navy-500">
            No tenés métodos de pago guardados
          </p>
          <p className="mt-1 text-xs text-navy-300">
            Agregá una tarjeta o cuenta para automatizar tus próximos pagos.
          </p>
        </div>
      </section>

      {/* Ayuda */}
      <section className="mt-8 flex flex-col gap-3 rounded-3xl bg-info-100 p-5 ring-1 ring-info-200 sm:flex-row sm:items-center sm:gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-info-400 text-white">
          <FileText className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <p className="text-sm font-bold text-navy-500">
            ¿Dudas sobre un pago o factura?
          </p>
          <p className="mt-0.5 text-xs text-navy-300">
            Contactanos y te ayudamos a resolverlo rápido.
          </p>
        </div>
        <Link
          to="/ayuda"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-navy-500 px-5 text-sm font-bold text-white transition-colors hover:bg-navy-400"
        >
          Ir a Ayuda
        </Link>
      </section>
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
