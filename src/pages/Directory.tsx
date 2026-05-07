import { useMemo, useState } from 'react'
import {
  ArrowUpDown,
  Check,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet } from '@/components/ui/sheet'
import { CertificationCard } from '@/components/features/CertificationCard'
import { useCategories, useCertifications } from '@/hooks/useCertifications'
import type { CertificationStatus, DirectoryFilters } from '@/types'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 9

const sortOptions = [
  { value: 'recent' as const, label: 'Más recientes' },
  { value: 'name' as const, label: 'Nombre A-Z' },
  { value: 'popular' as const, label: 'Verificados primero' },
]

const statusOptions: { value: CertificationStatus; label: string }[] = [
  { value: 'verified', label: 'Activos' },
  { value: 'pending', label: 'En revisión' },
  { value: 'expired', label: 'Vencidos' },
]

const regions = [
  'Argentina · Quebrada de Humahuaca',
  'Argentina · NOA',
  'Argentina · Jujuy',
  'Argentina · Chaco árido',
  'Argentina · Valle de Uco',
  'Argentina · Sierras de Córdoba',
]

export default function Directory() {
  const [filters, setFilters] = useState<DirectoryFilters>({
    sortBy: 'recent',
  })
  const [page, setPage] = useState(1)
  const [showFiltersSheet, setShowFiltersSheet] = useState(false)
  const [showSortSheet, setShowSortSheet] = useState(false)
  const { data: categories } = useCategories()
  const { data: certs, isLoading, error, refetch } = useCertifications(filters)

  const total = certs?.length ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const paged = useMemo(() => {
    if (!certs) return []
    const start = (page - 1) * PAGE_SIZE
    return certs.slice(start, start + PAGE_SIZE)
  }, [certs, page])

  const updateFilter = <K extends keyof DirectoryFilters>(
    key: K,
    value: DirectoryFilters[K] | undefined,
  ) => {
    setFilters((f) => ({ ...f, [key]: value }))
    setPage(1)
  }

  const clearFilters = () =>
    setFilters({ sortBy: filters.sortBy ?? 'recent' })

  return (
    <>
      <section className="bg-pattern-gold pb-12 pt-8 md:pb-16 md:pt-10">
        <div className="mx-auto max-w-[1320px] px-4 md:px-8">
          <div className="rounded-3xl bg-white px-8 py-10 text-center shadow-sm md:px-16 md:py-12">
            <h1 className="text-2xl font-bold leading-tight text-navy-500 md:text-4xl">
              Directorio de certificaciones auténticas
            </h1>
            <p className="mt-2 text-sm text-navy-300 md:text-base">
              Explorá historias, territorios y procesos validados con
              transparencia.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-[1320px] px-4 py-6 md:px-8 md:py-8">
          <div className="relative">
            <button
              type="button"
              className="absolute left-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-navy-500 text-white transition-colors hover:bg-navy-400"
              aria-label="Buscar"
            >
              <Search className="h-4 w-4" />
            </button>
            <Input
              placeholder="Buscar certificaciones, Nombre, ID, Hash..."
              value={filters.query ?? ''}
              onChange={(e) => updateFilter('query', e.target.value)}
              className="h-12 rounded-full border-neutral-300 pl-14"
            />
          </div>

          {/* Mobile: 2 buttons that open sheets */}
          <div className="mt-4 flex items-center gap-2 md:hidden">
            <Button
              variant="outlineNavy"
              size="sm"
              onClick={() => setShowFiltersSheet(true)}
              className="flex-1"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
              {(filters.category || filters.status) && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold text-navy-500">
                  {[filters.category, filters.status].filter(Boolean).length}
                </span>
              )}
            </Button>
            <Button
              variant="outlineNavy"
              size="sm"
              onClick={() => setShowSortSheet(true)}
              className="flex-1"
            >
              <ArrowUpDown className="h-4 w-4" />
              Ordenar
            </Button>
          </div>

          {/* Desktop: filter chips inline */}
          <div className="mt-5 hidden flex-wrap items-center gap-2 md:flex">
            <FilterChip
              label="Categorías"
              value={filters.category}
              options={(categories ?? []).map((c) => ({ value: c, label: c }))}
              onChange={(v) => updateFilter('category', v)}
            />
            <FilterChip
              label="Nombre"
              value={undefined}
              options={[]}
              onChange={() => {}}
              disabled
            />
            <FilterChip
              label="País/Región"
              value={undefined}
              options={regions.map((r) => ({ value: r, label: r }))}
              onChange={() => {}}
            />
            <FilterChip
              label="Puntaje"
              value={undefined}
              options={[
                { value: '90-100', label: '90 - 100' },
                { value: '80-90', label: '80 - 90' },
                { value: '0-80', label: 'Menos de 80' },
              ]}
              onChange={() => {}}
            />
            <FilterChip
              label="Estado"
              value={filters.status}
              options={statusOptions.map((s) => ({
                value: s.value,
                label: s.label,
              }))}
              onChange={(v) =>
                updateFilter('status', v as CertificationStatus | undefined)
              }
            />
            <FilterChip
              label="Hash/ID"
              value={undefined}
              options={[]}
              onChange={() => {}}
              disabled
            />

            <div className="ml-auto flex items-center gap-2">
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  updateFilter('sortBy', e.target.value as DirectoryFilters['sortBy'])
                }
                className="h-9 rounded-full border border-neutral-300 bg-white px-3 pr-8 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
                aria-label="Ordenar por"
              >
                {sortOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    Ordenar por · {s.label}
                  </option>
                ))}
              </select>
              <ArrowUpDown className="h-4 w-4 text-navy-300" />
            </div>
          </div>

          <Sheet
            open={showFiltersSheet}
            onClose={() => setShowFiltersSheet(false)}
            title="Filtros"
            description="Refiná tu búsqueda en el directorio"
          >
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-navy-300">
                  Categoría
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(categories ?? []).map((cat) => {
                    const active = filters.category === cat
                    return (
                      <button
                        key={cat}
                        onClick={() =>
                          updateFilter(
                            'category',
                            active ? undefined : cat,
                          )
                        }
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-xs font-semibold transition-all',
                          active
                            ? 'border-gold-500 bg-gold-500 text-navy-500'
                            : 'border-neutral-300 bg-white text-navy-300',
                        )}
                      >
                        {cat}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-navy-300">
                  Estado
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {statusOptions.map((opt) => {
                    const active = filters.status === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() =>
                          updateFilter(
                            'status',
                            active ? undefined : opt.value,
                          )
                        }
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-xs font-semibold transition-all',
                          active
                            ? 'border-navy-500 bg-navy-500 text-white'
                            : 'border-neutral-300 bg-white text-navy-300',
                        )}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="flex gap-2 pt-3">
                <Button
                  variant="outlineNavy"
                  size="md"
                  className="flex-1"
                  onClick={clearFilters}
                >
                  Limpiar
                </Button>
                <Button
                  variant="navy"
                  size="md"
                  className="flex-1"
                  onClick={() => setShowFiltersSheet(false)}
                >
                  Aplicar
                </Button>
              </div>
            </div>
          </Sheet>

          <Sheet
            open={showSortSheet}
            onClose={() => setShowSortSheet(false)}
            title="Ordenar por"
          >
            <ul className="flex flex-col">
              {sortOptions.map((s) => {
                const active = filters.sortBy === s.value
                return (
                  <li key={s.value}>
                    <button
                      onClick={() => {
                        updateFilter('sortBy', s.value)
                        setShowSortSheet(false)
                      }}
                      className={cn(
                        'flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors',
                        active
                          ? 'bg-gold-100 text-navy-500'
                          : 'text-navy-300 hover:bg-neutral-100',
                      )}
                    >
                      <span>{s.label}</span>
                      {active && <Check className="h-4 w-4 text-gold-700" />}
                    </button>
                  </li>
                )
              })}
            </ul>
          </Sheet>

          <div className="mt-8">
            {isLoading && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[4/3] w-full" />
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-9 w-32" />
                  </div>
                ))}
              </div>
            )}

            {error && (
              <ErrorState message={error} onRetry={refetch} />
            )}

            {!isLoading && !error && paged.length === 0 && (
              <EmptyState onClear={clearFilters} />
            )}

            {!isLoading && !error && paged.length > 0 && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {paged.map((c) => (
                  <CertificationCard key={c.id} certification={c} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                onPage={setPage}
                className="mt-10"
              />
            )}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 md:px-8 md:pb-20">
        <div className="relative mx-auto max-w-[1320px] overflow-hidden rounded-3xl">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('${import.meta.env.BASE_URL}cta-banner.png')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-500/85 via-navy-500/70 to-navy-500/85" />
          <div className="relative z-10 px-6 py-12 text-center text-white md:px-12 md:py-16">
            <h2 className="text-2xl font-bold md:text-3xl">
              Verificá la autenticidad de un certificado ancestral
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-200 md:text-base">
              Cada certificado está protegido. Podés escanear el QR o ingresar
              su ID para conocer su origen y validez.
            </p>
            <Link
              to="/verificar"
              className={cn(
                buttonVariants({ variant: 'gold', size: 'lg' }),
                'mt-7',
              )}
            >
              Verificar Certificado
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

interface FilterChipProps<T extends string> {
  label: string
  value: T | undefined
  options: { value: T; label: string }[]
  onChange: (value: T | undefined) => void
  disabled?: boolean
}

function FilterChip<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
}: FilterChipProps<T>) {
  if (options.length === 0 || disabled) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex h-9 items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 text-sm text-navy-300 disabled:opacity-60"
      >
        {label}
        <ChevronRight className="h-3.5 w-3.5 rotate-90" />
      </button>
    )
  }
  return (
    <div className="relative">
      <select
        value={value ?? ''}
        onChange={(e) => onChange((e.target.value || undefined) as T | undefined)}
        className={cn(
          'h-9 appearance-none rounded-full border bg-white pl-4 pr-9 text-sm transition-colors focus:outline-none',
          value
            ? 'border-gold-500 text-navy-500 font-semibold'
            : 'border-neutral-300 text-navy-300 hover:border-navy-300',
        )}
      >
        <option value="">{label}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-navy-300" />
    </div>
  )
}

function Pagination({
  page,
  totalPages,
  onPage,
  className,
}: {
  page: number
  totalPages: number
  onPage: (p: number) => void
  className?: string
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  return (
    <div className={cn('flex items-center justify-end gap-1', className)}>
      <button
        type="button"
        onClick={() => onPage(Math.max(1, page - 1))}
        disabled={page === 1}
        aria-label="Página anterior"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 text-navy-300 transition-colors hover:border-navy-500 hover:text-navy-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPage(p)}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors',
            p === page
              ? 'bg-gold-100 text-navy-500'
              : 'text-navy-300 hover:bg-neutral-100',
          )}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onPage(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        aria-label="Página siguiente"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 text-navy-300 transition-colors hover:border-navy-500 hover:text-navy-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="rounded-3xl border border-dashed border-neutral-300 bg-gold-100/30 p-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-100 text-gold-700">
        <Search className="h-6 w-6" />
      </div>
      <p className="mt-4 text-base font-bold text-navy-500">
        No encontramos certificaciones con esos filtros
      </p>
      <p className="mt-1 text-sm text-navy-300">
        Probá ajustar los criterios de búsqueda.
      </p>
      <Button variant="outlineNavy" size="sm" onClick={onClear} className="mt-5">
        Limpiar filtros
      </Button>
    </div>
  )
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <div className="rounded-3xl border border-error-300 bg-error-100 p-10 text-center">
      <p className="text-base font-bold text-error-400">
        Algo salió mal cargando los certificados
      </p>
      <p className="mt-1 text-sm text-error-400/80">{message}</p>
      <Button variant="outlineNavy" size="sm" onClick={onRetry} className="mt-5">
        Reintentar
      </Button>
    </div>
  )
}
