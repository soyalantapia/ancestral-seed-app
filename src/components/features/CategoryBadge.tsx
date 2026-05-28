import { Sparkles, Sprout, Compass } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CATEGORIES } from '@/lib/copy'
import type { OfficialCategory } from '@/types'

/**
 * Badge tipado para las 3 categorías oficiales del Reglamento 2.1.1.
 *
 * Cada categoría tiene:
 * - Color (tone) coherente con la paleta de marca
 * - Ícono semántico (Sprout = origen, Compass = vínculo,
 *   Sparkles = inspiración)
 * - Tooltip con la descripción textual del reglamento
 *
 * La taxonomía es legalmente vinculante — no inventar variantes ni
 * reformular labels sin coordinar con Ancestral Seed.
 */
const TONE_CLASSES = {
  gold:
    'bg-gold-100 text-gold-800 ring-gold-300/50',
  navy:
    'bg-navy-100 text-navy-500 ring-navy-200',
  cream:
    'bg-cream-100 text-navy-400 ring-cream-300',
} as const

const CATEGORY_ICON = {
  autentico: Sprout,
  tradicional: Compass,
  inspiracion: Sparkles,
} as const

interface CategoryBadgeProps {
  category: OfficialCategory
  /** Compact = sólo ícono + shortLabel. Default = label completo. */
  compact?: boolean
  /** Si true, NO muestra ícono (útil cuando el contexto ya lo aporta). */
  hideIcon?: boolean
  className?: string
}

export function CategoryBadge({
  category,
  compact = false,
  hideIcon = false,
  className,
}: CategoryBadgeProps) {
  const def = CATEGORIES[category]
  const Icon = CATEGORY_ICON[category]
  const toneClass = TONE_CLASSES[def.tone]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1',
        toneClass,
        className,
      )}
      title={def.description}
    >
      {!hideIcon && (
        <Icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
      )}
      {compact ? def.shortLabel : def.label}
    </span>
  )
}
