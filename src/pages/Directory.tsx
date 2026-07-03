import { useMemo, useState } from 'react'
import {
  ArrowUpDown,
  Check,
  ChevronDown,
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
import { PageMeta } from '@/components/features/PageMeta'
import { useCategories, useCertifications } from '@/hooks/useCertifications'
import { resetServiceWorkersAndReload } from '@/lib/swRecovery'
import type {
  CertificationStatus,
  DirectoryFilters,
  OfficialCategory,
} from '@/types'
import { CATEGORIES } from '@/lib/copy'
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

/**
 * Opciones del filtro de categoría oficial — Reglamento 2.1.1.
 * Orden por proximidad cultural: auténtico (constituido) → tradicional
 * (raíces) → inspiración (referencia).
 */
const officialCategoryOptions: { value: OfficialCategory; label: string }[] = [
  { value: 'autentico', label: CATEGORIES.autentico.label },
  { value: 'tradicional', label: CATEGORIES.tradicional.label },
  { value: 'inspiracion', label: CATEGORIES.inspiracion.label },
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

  // "Reintentar": si un Service Worker está controlando la página y los datos
  // no cargan, un refetch va a fallar igual (MSW no intercepta → /api = HTML).
  // Ahí hacemos un reset duro del SW + recarga, que sí lo arregla. Si no hay
  // SW controlando (error transitorio real), refetcheamos normal.
  const handleRetry = () => {
    if (
      typeof navigator !== 'undefined' &&
      navigator.serviceWorker?.controller
    ) {
      void resetServiceWorkersAndReload()
      return
    }
    refetch()
  }

  /**
   * Filtrado en cliente por categoría oficial. No tocamos el handler MSW
   * porque el campo `officialCategory` recién se agregó (Reglamento 2.1.1)
   * y todavía no aplica a todos los certs históricos.
   *
   * Si la categoría no está definida en el cert, lo dejamos pasar — así
   * el filtro funciona "best effort" sin ocultar contenido legacy.
   */
  const filteredCerts = useMemo(() => {
    if (!certs) return undefined
    if (!filters.officialCategory) return certs
    return certs.filter(
      (c) =>
        c.officialCategory === filters.officialCategory ||
        c.officialCategory === undefined,
    )
  }, [certs, filters.officialCategory])

  const total = filteredCerts?.length ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const paged = useMemo(() => {
    if (!filteredCerts) return []
    const start = (page - 1) * PAGE_SIZE
    return filteredCerts.slice(start, start + PAGE_SIZE)
  }, [filteredCerts, page])

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
      <PageMeta
        title="Directorio de certificaciones auténticas"
        description="Explorá productos y saberes ancestrales certificados de toda Latinoamérica. Filtros por país, categoría y técnica."
      />
      <section className="bg-pattern-gold pb-12 pt-8 md:pb-16 md:pt-10">
        <div className="mx-auto max-w-[1320px] px-4 md:px-8">
          <div className="rounded-3xl bg-white px-6 py-8 text-center shadow-sm sm:px-8 sm:py-10 md:px-16 md:py-12">
            <h1 className="text-2xl font-bold leading-tight text-navy-500 md:text-[32px]">
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
            {/* Fix SM2 (#PUB-09): antes había <button> con onClick
                vacío — affordance falso. Ahora es un <span> decorativo
                con pointer-events-none (la búsqueda es onChange real). */}
            <span
              aria-hidden
              className="pointer-events-none absolute left-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-navy-500 text-white"
            >
              <Search className="h-4 w-4" />
            </span>
            <Input
              placeholder="Buscar por nombre, región, autor o hash..."
              value={filters.query ?? ''}
              onChange={(e) => updateFilter('query', e.target.value)}
              className="h-12 rounded-full border-neutral-300 pl-14"
            />
          </div>

          {/* Mobile: 2 buttons that open sheets */}
          <div className="mt-4 flex items-center gap-2 md:hidden">
            <Button
              variant="outlineNavy"
              size="md"
              onClick={() => setShowFiltersSheet(true)}
              className="flex-1"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
              {(filters.officialCategory ||
                filters.category ||
                filters.status) && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold text-navy-500">
                  {
                    [
                      filters.officialCategory,
                      filters.category,
                      filters.status,
                    ].filter(Boolean).length
                  }
                </span>
              )}
            </Button>
            <Button
              variant="outlineNavy"
              size="md"
              onClick={() => setShowSortSheet(true)}
              className="flex-1"
            >
              <ArrowUpDown className="h-4 w-4" />
              Ordenar
            </Button>
          </div>

          {/* Desktop: filter chips inline */}
          <div className="mt-5 hidden flex-wrap items-center gap-2 md:flex">
            {/* Categoría oficial (Reglamento 2.1.1) — primera por ser la
                taxonomía vinculante. */}
            <FilterChip
              label="Tipo"
              value={filters.officialCategory}
              options={officialCategoryOptions.map((o) => ({
                value: o.value,
                label: o.label,
              }))}
              onChange={(v) =>
                updateFilter(
                  'officialCategory',
                  v as OfficialCategory | undefined,
                )
              }
            />
            <FilterChip
              label="Región"
              value={filters.category}
              options={(categories ?? []).map((c) => ({ value: c, label: c }))}
              onChange={(v) => updateFilter('category', v)}
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
            {(filters.officialCategory ||
              filters.category ||
              filters.status) && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-navy-300 hover:text-navy-500"
              >
                Limpiar filtros
              </button>
            )}

            <div className="relative ml-auto">
              <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-navy-300" />
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-navy-300" />
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  updateFilter('sortBy', e.target.value as DirectoryFilters['sortBy'])
                }
                className="h-9 appearance-none rounded-full border border-neutral-300 bg-white pl-9 pr-9 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
                aria-label="Ordenar por"
              >
                {sortOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Sheet
            open={showFiltersSheet}
            onClose={() => setShowFiltersSheet(false)}
            title="Filtros"
            description="Refiná tu búsqueda en el directorio"
          >
            <div className="space-y-5">
              {/* Tipo: las 3 categorías del Reglamento 2.1.1 */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-navy-300">
                  Tipo de certificación
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {officialCategoryOptions.map((opt) => {
                    const active = filters.officialCategory === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() =>
                          updateFilter(
                            'officialCategory',
                            active ? undefined : opt.value,
                          )
                        }
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-xs font-semibold transition-all',
                          active
                            ? 'border-gold-500 bg-gold-500 text-navy-500'
                            : 'border-neutral-300 bg-white text-navy-300',
                        )}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-navy-300">
                  Región
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
              <ErrorState message={error} onRetry={handleRetry} />
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
              backgroundImage: `url('${import.meta.env.BASE_URL}methodology-bg.webp')`,
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
}

function FilterChip<T extends string>({
  label,
  value,
  options,
  onChange,
}: FilterChipProps<T>) {
  if (options.length === 0) return null
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
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-navy-300" />
    </div>
  )
}

/**
 * Lista de páginas con ellipsis — fix SM5 (#PUB-12, auditoría UX).
 * Antes Array.from({length:totalPages}) escalaba mal: con 100 certs
 * y PAGE_SIZE=9 había 12 botones inline. Ahora truncamos con "..."
 * mostrando: [1] ... [current-1] [current] [current+1] ... [last]
 */
function buildPageList(current: number, total: number): Array<number | '…'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: Array<number | '…'> = [1]
  if (current > 3) pages.push('…')
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let p = start; p <= end; p++) pages.push(p)
  if (current < total - 2) pages.push('…')
  pages.push(total)
  return pages
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
  const pages = buildPageList(page, totalPages)
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
      {pages.map((p, i) =>
        p === '…' ? (
          <span
            key={`ellipsis-${i}`}
            aria-hidden
            className="flex h-9 w-6 items-center justify-center text-sm text-navy-300"
          >
            ···
          </span>
        ) : (
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
        ),
      )}
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
        Probá ajustar los criterios o sugerinos qué te gustaría encontrar.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <Button variant="outlineNavy" size="sm" onClick={onClear}>
          Limpiar filtros
        </Button>
        <a
          href="mailto:soporte@ancestralseed.org?subject=Sugerencia%20para%20el%20directorio&body=Hola%20equipo%20Ancestral%20Seed%2C%20me%20gustar%C3%ADa%20ver%20certificaciones%20de..."
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-navy-500 px-4 text-xs font-bold text-white shadow-sm hover:bg-navy-400"
        >
          Sugerirnos algo
        </a>
      </div>
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
