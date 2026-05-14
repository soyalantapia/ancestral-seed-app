import { useMemo, useState } from 'react'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Eye,
  MoreHorizontal,
  Search,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { mockIssuedCertifications } from '@/services/mocks/data'
import type { IssuedCertification, IssuedCertStatus } from '@/types'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 8

const STATUS_META: Record<
  IssuedCertStatus,
  { label: string; className: string }
> = {
  vigente: {
    label: 'Vigente',
    className: 'bg-success-100 text-success-300 ring-1 ring-success-300/30',
  },
  renovacion: {
    label: 'En renovación',
    className: 'bg-warning-100 text-warning-400 ring-1 ring-warning-300/40',
  },
  vencido: {
    label: 'Vencido',
    className: 'bg-info-100 text-info-400 ring-1 ring-info-300/40',
  },
  denegado: {
    label: 'Denegado',
    className: 'bg-error-100 text-error-400 ring-1 ring-error-300/40',
  },
}

type SortKey = 'id' | 'productName' | 'authorName' | 'scoreLabel' | 'status' | 'issuedAt' | 'expiresAt'

export default function TutorCertifications() {
  const all = mockIssuedCertifications

  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({
    key: 'issuedAt',
    dir: 'desc',
  })
  const [openRow, setOpenRow] = useState<string | null>(null)

  // KPIs
  const stats = useMemo(() => {
    const r = { vigente: 0, renovacion: 0, vencido: 0, denegado: 0 }
    for (const c of all) r[c.status]++
    return r
  }, [all])

  // Filtered + sorted
  const filtered = useMemo(() => {
    let list = [...all]
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.productName.toLowerCase().includes(q) ||
          c.authorName.toLowerCase().includes(q),
      )
    }
    list.sort((a, b) => {
      const av = a[sort.key]
      const bv = b[sort.key]
      const c = String(av).localeCompare(String(bv))
      return sort.dir === 'asc' ? c : -c
    })
    return list
  }, [all, query, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const allOnPageSelected = paged.length > 0 && paged.every((c) => selected.has(c.id))

  const toggleSort = (key: SortKey) => {
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' },
    )
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <header>
        <h1 className="text-2xl font-bold text-navy-500 md:text-[28px]">
          Certificaciones emitidas
        </h1>
      </header>

      {/* KPIs */}
      <section className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Vigentes"
          value={stats.vigente}
          delta={2}
          deltaPositive
          sub="+2 en la última semana"
        />
        <StatCard
          label="En renovación"
          value={stats.renovacion}
          delta={1}
          deltaPositive
          sub="+1 en la última semana"
        />
        <StatCard
          label="Vencidos"
          value={stats.vencido}
          delta={3}
          deltaPositive={false}
          sub="+3 en la última semana"
        />
        <StatCard
          label="Denegados"
          value={stats.denegado}
          delta={2}
          deltaPositive={false}
          sub="+2 en la última semana"
        />
      </section>

      {/* Filters row */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <FilterPill label="Categoría" />
        <FilterPill label="Estado" />
        <FilterPill label="Puntaje" />
        <FilterPill label="País" />
        <FilterPill label="Región" />
        <FilterPill label="Fecha" />
        <div className="relative ml-auto w-full max-w-xs">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
            placeholder="Buscar por ID, autor o producto..."
            className="h-10 w-full rounded-full border border-neutral-300 bg-white pl-11 pr-4 text-sm text-navy-500 placeholder:text-navy-300 focus:border-gold-500 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => toast.success('Exportando…')}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 text-xs font-bold text-navy-500 transition-colors hover:bg-neutral-100"
        >
          <Download className="h-4 w-4" />
          Exportar
        </button>
      </div>

      {/* Tabla desktop */}
      <section className="mt-6 hidden overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-100/50 text-xs uppercase tracking-widest text-navy-300">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allOnPageSelected}
                  onChange={(e) => {
                    const next = new Set(selected)
                    if (e.target.checked) paged.forEach((c) => next.add(c.id))
                    else paged.forEach((c) => next.delete(c.id))
                    setSelected(next)
                  }}
                  className="h-4 w-4 rounded border-neutral-400 text-gold-500 focus:ring-gold-500"
                  aria-label="Seleccionar todos en esta página"
                />
              </th>
              <SortableTh label="ID" sortKey="id" sort={sort} onSort={toggleSort} />
              <SortableTh
                label="Producto/Servicio"
                sortKey="productName"
                sort={sort}
                onSort={toggleSort}
              />
              <SortableTh label="Autor" sortKey="authorName" sort={sort} onSort={toggleSort} />
              <SortableTh label="Puntaje" sortKey="scoreLabel" sort={sort} onSort={toggleSort} />
              <SortableTh label="Estado" sortKey="status" sort={sort} onSort={toggleSort} />
              <SortableTh label="Emisión" sortKey="issuedAt" sort={sort} onSort={toggleSort} />
              <SortableTh label="Vencimiento" sortKey="expiresAt" sort={sort} onSort={toggleSort} />
              <th className="w-10 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {paged.map((c) => {
              const isSel = selected.has(c.id)
              const meta = STATUS_META[c.status]
              return (
                <tr
                  key={c.id}
                  className={cn(
                    'transition-colors hover:bg-neutral-100',
                    isSel && 'bg-gold-100/40',
                  )}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isSel}
                      onChange={(e) => {
                        const next = new Set(selected)
                        if (e.target.checked) next.add(c.id)
                        else next.delete(c.id)
                        setSelected(next)
                      }}
                      className="h-4 w-4 rounded border-neutral-400 text-gold-500 focus:ring-gold-500"
                      aria-label={`Seleccionar ${c.id}`}
                    />
                  </td>
                  <td className="px-4 py-3 font-bold text-navy-500">{c.id}</td>
                  <td className="px-4 py-3 text-navy-500">{c.productName}</td>
                  <td className="px-4 py-3 text-navy-500">{c.authorName}</td>
                  <td className="px-4 py-3 text-navy-500">{c.scoreLabel}</td>
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
                  <td className="px-4 py-3 text-xs text-navy-300">{c.issuedAt}</td>
                  <td className="px-4 py-3 text-xs text-navy-300">{c.expiresAt}</td>
                  <td className="px-4 py-3 text-right">
                    <RowMenu
                      open={openRow === c.id}
                      onToggle={() =>
                        setOpenRow(openRow === c.id ? null : c.id)
                      }
                      cert={c}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Empty state */}
        {paged.length === 0 && (
          <div className="p-10 text-center">
            <p className="text-sm font-bold text-navy-500">Sin resultados</p>
            <p className="mt-1 text-xs text-navy-300">
              Probá ajustar el buscador o los filtros.
            </p>
          </div>
        )}
      </section>

      {/* Cards mobile */}
      <ul className="mt-6 space-y-3 md:hidden">
        {paged.map((c) => {
          const meta = STATUS_META[c.status]
          return (
            <li
              key={c.id}
              className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-navy-300">
                    {c.id}
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-navy-500">
                    {c.productName}
                  </p>
                  <p className="mt-0.5 text-xs text-navy-300">{c.authorName}</p>
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
              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <p className="text-navy-300">Puntaje</p>
                  <p className="font-bold text-navy-500">{c.scoreLabel}</p>
                </div>
                <div>
                  <p className="text-navy-300">Vence</p>
                  <p className="font-bold text-navy-500">{c.expiresAt}</p>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      {/* Selection bar + paginación */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {selected.size > 0 && (
            <div className="inline-flex items-center gap-3 rounded-full bg-neutral-200 px-4 py-2">
              <span className="text-xs font-bold text-navy-500">
                {selected.size} seleccionados
              </span>
              <button
                type="button"
                onClick={() => toast.success(`Exportando ${selected.size} certificaciones`)}
                className="inline-flex items-center gap-1.5 rounded-full bg-navy-500 px-3 py-1 text-xs font-bold text-white transition-colors hover:bg-navy-400"
              >
                <Download className="h-3.5 w-3.5" />
                Exportar
                <ChevronDown className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                aria-label="Limpiar selección"
                className="text-navy-500 hover:text-navy-400"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        <Pagination page={page} totalPages={totalPages} onPage={setPage} />
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  delta,
  deltaPositive,
  sub,
}: {
  label: string
  value: number
  delta: number
  deltaPositive: boolean
  sub: string
}) {
  const Trend = deltaPositive ? TrendingUp : TrendingDown
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-navy-500">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-3xl font-bold text-navy-500 md:text-4xl">{value}</p>
        <span
          className={cn(
            'inline-flex items-center gap-0.5 text-xs font-bold',
            deltaPositive ? 'text-success-300' : 'text-error-400',
          )}
        >
          <Trend className="h-3.5 w-3.5" />
          {delta}
        </span>
      </div>
      <p className="mt-1 text-xs text-navy-300">{sub}</p>
    </div>
  )
}

function FilterPill({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 text-xs font-bold text-navy-500 transition-colors hover:bg-neutral-100"
    >
      {label}
      <ChevronDown className="h-3.5 w-3.5 text-navy-300" />
    </button>
  )
}

function SortableTh({
  label,
  sortKey,
  sort,
  onSort,
}: {
  label: string
  sortKey: SortKey
  sort: { key: SortKey; dir: 'asc' | 'desc' }
  onSort: (k: SortKey) => void
}) {
  const active = sort.key === sortKey
  return (
    <th className="px-4 py-3 font-semibold">
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="inline-flex items-center gap-1 transition-colors hover:text-navy-500"
      >
        {label}
        <span className={cn('inline-block text-xs', !active && 'opacity-30')}>
          {active && sort.dir === 'asc' ? '▲' : '▼'}
        </span>
      </button>
    </th>
  )
}

function RowMenu({
  open,
  onToggle,
  cert,
}: {
  open: boolean
  onToggle: () => void
  cert: IssuedCertification
}) {
  const actions = [
    {
      icon: Eye,
      label: 'Ver detalle',
      onClick: () => toast.info(`Abriendo ${cert.id}…`),
    },
    {
      icon: Download,
      label: 'Descargar PDF',
      onClick: () => toast.success('Descargando PDF…'),
    },
    {
      icon: TrendingUp,
      label: 'Iniciar renovación',
      onClick: () => toast.info('Iniciando renovación…'),
    },
    {
      icon: X,
      label: 'Reportar incidencia',
      onClick: () => toast.info('Abriendo formulario…'),
      danger: true,
    },
  ]
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={onToggle}
        aria-label="Acciones"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-navy-300 hover:bg-neutral-200 hover:text-navy-500"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={onToggle}
            aria-hidden
          />
          <ul className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg">
            {actions.map((a) => {
              const Icon = a.icon
              return (
                <li key={a.label}>
                  <button
                    type="button"
                    onClick={() => {
                      a.onClick()
                      onToggle()
                    }}
                    className={cn(
                      'flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold transition-colors',
                      a.danger
                        ? 'text-error-400 hover:bg-error-100'
                        : 'text-navy-500 hover:bg-neutral-100',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {a.label}
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}

function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number
  totalPages: number
  onPage: (p: number) => void
}) {
  // Compact pagination con … en el medio
  const pages: Array<number | '...'> = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1, 2, 3)
    if (page > 4) pages.push('...')
    if (page > 3 && page < totalPages - 2) pages.push(page)
    if (page < totalPages - 3) pages.push('...')
    pages.push(totalPages)
  }
  return (
    <div className="ml-auto flex items-center gap-1">
      <PaginBtn label="Primera" onClick={() => onPage(1)} disabled={page === 1}>
        <ChevronsLeft className="h-4 w-4" />
      </PaginBtn>
      <PaginBtn
        label="Anterior"
        onClick={() => onPage(Math.max(1, page - 1))}
        disabled={page === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </PaginBtn>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`e-${i}`} className="px-2 text-sm text-navy-300">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPage(p)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors',
              p === page
                ? 'bg-gold-500 text-navy-500'
                : 'text-navy-500 hover:bg-neutral-100',
            )}
          >
            {p}
          </button>
        ),
      )}
      <PaginBtn
        label="Siguiente"
        onClick={() => onPage(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </PaginBtn>
      <PaginBtn
        label="Última"
        onClick={() => onPage(totalPages)}
        disabled={page === totalPages}
      >
        <ChevronsRight className="h-4 w-4" />
      </PaginBtn>
    </div>
  )
}

function PaginBtn({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled: boolean
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full text-navy-500 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  )
}
