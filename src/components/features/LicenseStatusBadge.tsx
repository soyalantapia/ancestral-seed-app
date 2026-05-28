import { CheckCircle2, AlertTriangle, Ban } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LICENSE_STATUS } from '@/lib/copy'
import type { LicenseStatus } from '@/types'

/**
 * Badge tipado para el estado de la licencia de uso del Sello según
 * Reglamento cap. 5. Toma el `LicenseStatus` y aplica color + ícono
 * consistente con el resto del sistema.
 *
 * Por qué hay un badge separado y no se reusa el `status` del cert:
 * "status" representa lo UX/lifecycle (verified, pending, expired) y
 * "licenseStatus" representa la dimensión legal/comercial del titular.
 * Pueden divergir: un cert puede estar `verified` (la auditoría salió
 * OK) pero `suspendida` por incumplimiento ético posterior.
 */
const TONE_CLASSES = {
  success:
    'bg-success-100/80 text-success-700 ring-success-300/40',
  warning:
    'bg-amber-50 text-amber-700 ring-amber-300/50',
  danger:
    'bg-red-50 text-red-700 ring-red-300/50',
} as const

const STATUS_ICON = {
  vigente: CheckCircle2,
  suspendida: AlertTriangle,
  cancelada: Ban,
} as const

interface LicenseStatusBadgeProps {
  status: LicenseStatus
  /** Compact = sólo ícono + shortLabel. Default false = label completo. */
  compact?: boolean
  className?: string
}

export function LicenseStatusBadge({
  status,
  compact = false,
  className,
}: LicenseStatusBadgeProps) {
  const def = LICENSE_STATUS[status]
  const Icon = STATUS_ICON[status]
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
      <Icon className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
      {compact ? def.shortLabel : def.label}
    </span>
  )
}
