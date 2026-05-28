import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Breadcrumbs reutilizables para indicar dónde está parado el usuario
 * en una jerarquía de rutas.
 *
 * Ejemplo:
 *   <Breadcrumbs items={[
 *     { label: 'Casos', to: '/tutor/casos' },
 *     { label: 'CE-101' },          // sin `to` → estado actual
 *   ]} />
 *
 * Comportamiento:
 *   - El último item no tiene `to` y se renderiza como texto (no link).
 *   - Separadores `›` automáticos entre items.
 *   - aria-current="page" en el último.
 */
export interface BreadcrumbItem {
  label: string
  /** Si está, el item se renderiza como link. Si no, como texto plano. */
  to?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (items.length === 0) return null

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        'flex items-center gap-1.5 text-xs text-navy-300 md:text-sm',
        className,
      )}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <Fragment key={i}>
            {i > 0 && (
              <ChevronRight
                className="h-3.5 w-3.5 shrink-0 text-navy-300/60"
                aria-hidden="true"
              />
            )}
            {item.to && !isLast ? (
              <Link
                to={item.to}
                className="truncate font-medium text-navy-300 transition-colors hover:text-gold-700"
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current={isLast ? 'page' : undefined}
                className={cn(
                  'truncate',
                  isLast ? 'font-bold text-navy-500' : 'font-medium',
                )}
              >
                {item.label}
              </span>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}
