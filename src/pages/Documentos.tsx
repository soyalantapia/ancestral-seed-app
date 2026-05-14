import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Award,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  Image as ImageIcon,
  Receipt,
  Search,
  ShieldCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import { mockCertificationRequests } from '@/services/mocks/data'
import type { CertificationRequest, EvidenceFile, PaymentItem } from '@/types'
import { cn } from '@/lib/utils'

type Tab = 'certificados' | 'avales' | 'facturas'

const TABS: Array<{ id: Tab; label: string; icon: typeof FileCheck2 }> = [
  { id: 'certificados', label: 'Certificados', icon: ShieldCheck },
  { id: 'avales', label: 'Avales y evidencias', icon: FileText },
  { id: 'facturas', label: 'Facturas', icon: Receipt },
]

export default function Documentos() {
  const [tab, setTab] = useState<Tab>('certificados')
  const [query, setQuery] = useState('')

  // Datos derivados
  const requests = mockCertificationRequests

  const certificates = useMemo(
    () =>
      requests.map((r) => {
        const certStage = r.stages.find((s) => s.stage === 'certificacion')
        const isIssued = certStage?.status === 'completed'
        return { req: r, isIssued }
      }),
    [requests],
  )

  const allEvidences = useMemo(
    () =>
      requests.flatMap((r) =>
        (r.evidences ?? []).map((e) => ({ ...e, req: r })),
      ),
    [requests],
  )

  const allInvoices = useMemo(
    () =>
      requests.flatMap((r) =>
        (r.payments ?? [])
          .filter((p) => p.invoiceUrl)
          .map((p) => ({ ...p, req: r })),
      ),
    [requests],
  )

  const filteredEvidences = useMemo(() => {
    if (!query.trim()) return allEvidences
    const q = query.toLowerCase()
    return allEvidences.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.req.productName.toLowerCase().includes(q),
    )
  }, [allEvidences, query])

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 md:px-10 md:py-10">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-500 md:text-[28px]">
            Documentos
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-navy-300 md:text-base">
            Certificados emitidos, avales subidos y facturas — todo accesible
            desde un solo lugar.
          </p>
        </div>
      </header>

      {/* KPIs */}
      <section className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <SmallStat
          icon={ShieldCheck}
          label="Certificados emitidos"
          value={certificates.filter((c) => c.isIssued).length}
          tone="gold"
        />
        <SmallStat
          icon={FileCheck2}
          label="En proceso"
          value={certificates.filter((c) => !c.isIssued).length}
          tone="navy"
        />
        <SmallStat
          icon={ImageIcon}
          label="Evidencias subidas"
          value={allEvidences.length}
          tone="info"
        />
        <SmallStat
          icon={Receipt}
          label="Facturas disponibles"
          value={allInvoices.length}
          tone="success"
        />
      </section>

      {/* Tabs */}
      <div className="mt-8 flex flex-wrap items-center gap-1 border-b border-neutral-200">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                'inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-colors',
                active
                  ? 'border-gold-500 text-navy-500'
                  : 'border-transparent text-navy-300 hover:text-navy-500',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div className="mt-5 relative max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o certificación..."
          className="h-11 w-full rounded-full border border-neutral-300 bg-white pl-11 pr-4 text-sm text-navy-500 placeholder:text-navy-300 focus:border-gold-500 focus:outline-none"
        />
      </div>

      {/* Content */}
      <div className="mt-6">
        {tab === 'certificados' && (
          <CertificatesGrid certificates={certificates} query={query} />
        )}
        {tab === 'avales' && (
          <EvidencesList items={filteredEvidences} />
        )}
        {tab === 'facturas' && (
          <InvoicesList items={allInvoices} query={query} />
        )}
      </div>
    </div>
  )
}

// ─── Certificates ─────────────────────────────────────────────────────────────

function CertificatesGrid({
  certificates,
  query,
}: {
  certificates: Array<{ req: CertificationRequest; isIssued: boolean }>
  query: string
}) {
  const filtered = certificates.filter((c) =>
    !query.trim() ? true : c.req.productName.toLowerCase().includes(query.toLowerCase()),
  )
  if (filtered.length === 0) {
    return <EmptyState text="No hay certificados que coincidan." />
  }
  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filtered.map(({ req, isIssued }) => (
        <li
          key={req.id}
          className={cn(
            'flex flex-col overflow-hidden rounded-3xl border shadow-sm',
            isIssued
              ? 'border-gold-300 bg-gradient-to-br from-gold-100/80 to-white'
              : 'border-neutral-200 bg-white',
          )}
        >
          <div className="flex items-start justify-between gap-2 p-5">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-widest text-navy-300">
                {req.number}
              </p>
              <h3 className="mt-1 text-base font-bold leading-tight text-navy-500">
                {req.productName}
              </h3>
            </div>
            <span
              className={cn(
                'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold',
                isIssued
                  ? 'bg-success-100 text-success-300 ring-1 ring-success-300/30'
                  : 'bg-neutral-200 text-navy-500',
              )}
            >
              {isIssued ? (
                <>
                  <Award className="h-3 w-3" />
                  Vigente
                </>
              ) : (
                'En proceso'
              )}
            </span>
          </div>

          {isIssued ? (
            <>
              <div className="mx-5 rounded-xl bg-neutral-100 px-3 py-2">
                <p className="text-[10px] uppercase tracking-widest text-navy-300">
                  Hash blockchain
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <code className="flex-1 truncate text-[10px] font-medium text-navy-500">
                    {req.id}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(req.id)
                      toast.success('Hash copiado')
                    }}
                    aria-label="Copiar hash"
                    className="text-navy-300 hover:text-navy-500"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 p-5 pt-4">
                <Link
                  to={`/mis-certificaciones/${req.id}`}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-gold-500 px-3 text-xs font-bold text-navy-500 transition-colors hover:bg-gold-400"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Ver
                </Link>
                <button
                  type="button"
                  onClick={() => toast.success('Descargando PDF…')}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 text-xs font-bold text-navy-500 transition-colors hover:bg-neutral-100"
                >
                  <Download className="h-3.5 w-3.5" />
                  PDF
                </button>
                <button
                  type="button"
                  onClick={() => toast.success('Generando QR…')}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 text-xs font-bold text-navy-500 transition-colors hover:bg-neutral-100"
                >
                  QR
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3 p-5 pt-0">
              <p className="text-xs text-navy-300">
                {req.progressLabel}
              </p>
              <Link
                to={`/mis-certificaciones/${req.id}`}
                className="inline-flex h-9 w-fit items-center gap-1.5 rounded-full bg-navy-500 px-4 text-xs font-bold text-white transition-colors hover:bg-navy-400"
              >
                Ver progreso
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

// ─── Evidences ────────────────────────────────────────────────────────────────

function EvidencesList({
  items,
}: {
  items: Array<EvidenceFile & { req: CertificationRequest }>
}) {
  if (items.length === 0) {
    return <EmptyState text="No subiste evidencias todavía." />
  }
  return (
    <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {items.map((e) => {
        const Icon =
          e.kind === 'image' ? ImageIcon : e.kind === 'video' ? FileCheck2 : FileText
        return (
          <li
            key={e.id}
            className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-navy-500">
                {e.name}
              </p>
              <p className="mt-0.5 truncate text-xs text-navy-300">
                {e.req.number} · {e.req.productName}
              </p>
              <p className="mt-0.5 text-[11px] text-navy-300">
                {(e.sizeKb / 1024).toFixed(1)} MB ·{' '}
                {new Date(e.uploadedAt).toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => toast.success(`Descargando ${e.name}`)}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 text-xs font-bold text-navy-500 transition-colors hover:bg-neutral-100"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Descargar</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

function InvoicesList({
  items,
  query,
}: {
  items: Array<PaymentItem & { req: CertificationRequest }>
  query: string
}) {
  const filtered = !query.trim()
    ? items
    : items.filter(
        (i) =>
          i.concept.toLowerCase().includes(query.toLowerCase()) ||
          i.req.productName.toLowerCase().includes(query.toLowerCase()),
      )
  if (filtered.length === 0) {
    return <EmptyState text="No hay facturas todavía." />
  }
  return (
    <ul className="space-y-3">
      {filtered.map((i) => (
        <li
          key={i.id}
          className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:gap-4"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-success-100 text-success-300">
            <Receipt className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-navy-500">
              {i.concept}
            </p>
            <p className="mt-0.5 truncate text-xs text-navy-300">
              {i.req.number} · {i.req.productName}
            </p>
            <p className="mt-0.5 text-[11px] text-navy-300">
              {i.paidAt
                ? `Pagada el ${new Date(i.paidAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}`
                : 'Sin fecha de pago'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-base font-bold text-navy-500">
              {new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: i.currency,
                maximumFractionDigits: 0,
              }).format(i.amount)}
            </p>
            <button
              type="button"
              onClick={() => toast.success('Descargando factura')}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-gold-500 px-3 text-xs font-bold text-navy-500 transition-colors hover:bg-gold-400"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Factura</span>
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-neutral-300 p-12 text-center">
      <FileText className="mx-auto h-8 w-8 text-navy-300" />
      <p className="mt-3 text-sm font-bold text-navy-500">{text}</p>
    </div>
  )
}

function SmallStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof FileText
  label: string
  value: number
  tone: 'navy' | 'gold' | 'info' | 'success'
}) {
  const tones = {
    navy: 'bg-navy-500 text-white',
    gold: 'bg-gold-100 text-gold-700',
    info: 'bg-info-100 text-info-400',
    success: 'bg-success-100 text-success-300',
  }[tone]
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm md:p-5">
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
