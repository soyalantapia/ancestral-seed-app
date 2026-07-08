import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { cn, normalizeText as norm } from '@/lib/utils'

export interface ComboboxOption {
  value: string
  label: string
  /** Nodo opcional a la izquierda (ej.: emoji de bandera). */
  icon?: ReactNode
  /** Texto extra para el filtro (ej.: prefijo telefónico). */
  keywords?: string
}

interface ComboboxProps {
  value: string
  onChange: (value: string) => void
  options: ComboboxOption[]
  id?: string
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  invalid?: boolean
  className?: string
  onBlur?: () => void
}

/**
 * Select buscable: botón con flechita visible (queda claro que es un
 * select) que abre un panel con input de búsqueda + lista filtrable.
 * Soporta icono/bandera por opción. Sin dependencias externas.
 */
export function Combobox({
  value,
  onChange,
  options,
  id,
  placeholder = 'Seleccionar',
  searchPlaceholder = 'Buscar…',
  emptyText = 'Sin resultados',
  disabled = false,
  invalid = false,
  className,
  onBlur,
}: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const reactId = useId()
  const listboxId = `${id ?? reactId}-listbox`

  const selected = options.find((o) => o.value === value) ?? null

  const filtered = useMemo(() => {
    const q = norm(query.trim())
    if (!q) return options
    return options.filter(
      (o) => norm(o.label).includes(q) || (o.keywords && norm(o.keywords).includes(q)),
    )
  }, [options, query])

  // Cerrar al click afuera.
  useEffect(() => {
    if (!open) return
    function onDocPointer(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
        onBlur?.()
      }
    }
    document.addEventListener('pointerdown', onDocPointer)
    return () => document.removeEventListener('pointerdown', onDocPointer)
  }, [open, onBlur])

  // Al abrir: reset búsqueda + foco al input.
  useEffect(() => {
    if (!open) return
    setQuery('')
    const idx = selected ? Math.max(0, filtered.indexOf(selected)) : 0
    setActiveIndex(idx)
    const raf = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Mantener la opción activa a la vista.
  useEffect(() => {
    if (!open) return
    const node = listRef.current?.children[activeIndex] as HTMLElement | undefined
    node?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open])

  function choose(opt: ComboboxOption) {
    onChange(opt.value)
    setOpen(false)
    onBlur?.()
  }

  function onButtonKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpen(true)
    }
  }

  function onInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const opt = filtered[activeIndex]
      if (opt) choose(opt)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      onBlur?.()
    }
  }

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={onButtonKeyDown}
        className={cn(
          'flex h-11 w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 text-sm transition-colors',
          'focus:border-gold-500 focus:outline-none',
          invalid ? 'border-error-400' : 'border-neutral-300',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      >
        <span
          className={cn(
            'flex min-w-0 items-center gap-2',
            selected ? 'text-navy-500' : 'text-neutral-600',
          )}
        >
          {selected?.icon && <span className="shrink-0">{selected.icon}</span>}
          <span className="truncate">{selected ? selected.label : placeholder}</span>
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-navy-300 transition-transform',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-xl">
          <div className="flex items-center gap-2 border-b border-neutral-100 px-3">
            <Search className="h-4 w-4 shrink-0 text-neutral-500" aria-hidden />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActiveIndex(0)
              }}
              onKeyDown={onInputKeyDown}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="h-10 w-full bg-transparent text-sm text-navy-500 placeholder:text-neutral-500 focus:outline-none"
            />
          </div>
          <ul
            ref={listRef}
            role="listbox"
            id={listboxId}
            className="max-h-60 overflow-auto py-1"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-neutral-500">{emptyText}</li>
            ) : (
              filtered.map((o, i) => {
                const isActive = i === activeIndex
                const isSelected = o.value === value
                return (
                  <li
                    key={o.value}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => choose(o)}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-navy-500',
                      isActive && 'bg-gold-100',
                    )}
                  >
                    {o.icon && <span className="shrink-0">{o.icon}</span>}
                    <span className="min-w-0 flex-1 truncate">{o.label}</span>
                    {isSelected && (
                      <Check className="h-4 w-4 shrink-0 text-gold-700" aria-hidden />
                    )}
                  </li>
                )
              })
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
