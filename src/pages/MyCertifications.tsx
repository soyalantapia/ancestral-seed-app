import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Calendar, Clock, MoreHorizontal, Search, TrendingUp } from 'lucide-react'
import { mockCertificationRequests } from '@/services/mocks/data'
import { StageStatusBadge } from '@/components/features/StagePipeline'
import { cn } from '@/lib/utils'

const tabs = ['En curso', 'En emisión'] as const
type Tab = (typeof tabs)[number]

export default function MyCertifications() {
  const [tab, setTab] = useState<Tab>('En curso')
  const [query, setQuery] = useState('')

  const requests = mockCertificationRequests.filter((r) => r.status === tab)
  const filtered = query
    ? requests.filter((r) => r.productName.toLowerCase().includes(query.toLowerCase()))
    : requests

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-8 md:px-10 md:py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-500 md:text-[28px]">
            Mis certificaciones
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-navy-300 md:text-base">
            Revisá el progreso, documentos y estados de tus certificaciones.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar"
            className="h-11 w-full rounded-full border border-neutral-300 bg-white pl-11 pr-4 text-sm text-navy-500 placeholder:text-navy-300 focus:border-gold-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'rounded-full px-5 py-2 text-sm font-bold transition-colors',
              tab === t
                ? 'bg-gold-100 text-gold-700 ring-1 ring-gold-300'
                : 'text-navy-300 hover:bg-neutral-100 hover:text-navy-500',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-neutral-300 p-10 text-center text-sm text-navy-300">
          No hay certificaciones {tab.toLowerCase()}.
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          {filtered.map((r) => (
            <li
              key={r.id}
              className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <p className="text-base font-bold text-navy-500">
                  {r.productName}
                </p>
                <button type="button" aria-label="Más opciones" className="text-navy-300 hover:text-navy-500">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>

              <dl className="mt-3 space-y-2 text-sm">
                <Row icon={Clock} label="Estado:" value={<StageStatusBadge status="Preadiagnóstico" />} />
                <Row icon={TrendingUp} label="Progreso:" value={r.progressLabel} />
                <Row icon={Calendar} label="Fecha de creación:" value={r.createdAt} />
                <div className="flex items-start gap-2 text-navy-500">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-error-300" />
                  <span className="font-bold">Pendientes:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {r.pendingItems.map((p) => (
                      <span
                        key={p}
                        className="inline-flex items-center rounded-full bg-error-100 px-2 py-0.5 text-xs font-semibold text-error-400 ring-1 ring-error-200"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </dl>

              <div className="mt-5 flex justify-end">
                <Link
                  to={`/mis-certificaciones/${r.id}`}
                  className="inline-flex items-center rounded-full bg-navy-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-navy-400"
                >
                  Ver solicitud
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2 text-navy-500">
      <Icon className="h-4 w-4 shrink-0 text-navy-300" />
      <span className="font-bold">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
