import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Donut concéntrico con varios anillos. Cada ring es un segmento
 * arc de un círculo, distinto radio. Usado en Tutor Dashboard
 * ("Casos de riesgo").
 *
 * `rings` tiene los valores absolutos y se normalizan al max para
 * que cada arco refleje su proporción dentro del rango.
 */
export function ConcentricDonut({
  rings,
  size = 220,
  thickness = 14,
  gap = 4,
  centerLabel,
  centerSub,
}: {
  rings: Array<{ color: string; value: number; max: number; label?: string }>
  size?: number
  thickness?: number
  gap?: number
  centerLabel?: ReactNode
  centerSub?: ReactNode
}) {
  const cx = size / 2
  const cy = size / 2
  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {rings.map((ring, i) => {
          const r = (size - thickness) / 2 - i * (thickness + gap)
          if (r <= thickness / 2) return null
          const circ = 2 * Math.PI * r
          const pct = ring.max > 0 ? Math.min(1, ring.value / ring.max) : 0
          const dash = circ * pct
          return (
            <g key={i}>
              {/* track */}
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke="#E5E7EB"
                strokeWidth={thickness}
              />
              {/* value arc */}
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={ring.color}
                strokeWidth={thickness}
                strokeDasharray={`${dash} ${circ - dash}`}
                strokeDashoffset={circ / 4}
                strokeLinecap="round"
                transform={`rotate(-90 ${cx} ${cy})`}
                style={{ transition: 'stroke-dasharray 600ms ease-out' }}
              />
            </g>
          )
        })}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        {centerLabel && (
          <span className="text-3xl font-bold text-navy-500 md:text-[40px]">
            {centerLabel}
          </span>
        )}
        {centerSub && (
          <span className="text-xs font-medium text-navy-300 md:text-sm">
            {centerSub}
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * Pie chart simple con slices proporcionales. Usado en Tutor Dashboard
 * ("Certificaciones"). Soporta hasta N slices.
 */
export function PieChart({
  slices,
  size = 220,
}: {
  slices: Array<{ color: string; value: number; label?: string }>
  size?: number
}) {
  const total = slices.reduce((a, s) => a + s.value, 0)
  if (total <= 0) return null
  const cx = size / 2
  const cy = size / 2
  const r = size / 2
  let startAngle = -Math.PI / 2 // 12 o'clock
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => {
        const angle = (s.value / total) * Math.PI * 2
        const endAngle = startAngle + angle
        const x1 = cx + r * Math.cos(startAngle)
        const y1 = cy + r * Math.sin(startAngle)
        const x2 = cx + r * Math.cos(endAngle)
        const y2 = cy + r * Math.sin(endAngle)
        const largeArc = angle > Math.PI ? 1 : 0
        const d =
          `M ${cx} ${cy} ` +
          `L ${x1} ${y1} ` +
          `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`
        const path = (
          <path
            key={i}
            d={d}
            fill={s.color}
            stroke="white"
            strokeWidth={2}
          />
        )
        startAngle = endAngle
        return path
      })}
    </svg>
  )
}

/**
 * Mini-calendar mensual para usar en el aside del Tutor Dashboard.
 */
export function MiniCalendar({
  highlightedDates = [],
  selected,
  onSelect,
  className,
}: {
  highlightedDates?: Date[]
  selected?: Date
  onSelect?: (d: Date) => void
  className?: string
}) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const cursor = selected ?? today
  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const monthName = new Date(year, month, 1).toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric',
  })

  const first = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startWeekday = (first.getDay() + 6) % 7
  const cells: Array<Date | null> = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  while (cells.length % 7 !== 0) cells.push(null)

  const isHighlighted = (d: Date) =>
    highlightedDates.some(
      (hd) =>
        hd.getFullYear() === d.getFullYear() &&
        hd.getMonth() === d.getMonth() &&
        hd.getDate() === d.getDate(),
    )

  const isSelected = (d: Date) =>
    selected &&
    selected.getFullYear() === d.getFullYear() &&
    selected.getMonth() === d.getMonth() &&
    selected.getDate() === d.getDate()

  const isToday = (d: Date) =>
    today.getFullYear() === d.getFullYear() &&
    today.getMonth() === d.getMonth() &&
    today.getDate() === d.getDate()

  return (
    <div className={cn('rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm', className)}>
      <p className="text-center text-sm font-bold text-navy-500 capitalize">
        {monthName}
      </p>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wider text-navy-300">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={`p-${i}`} className="aspect-square" />
          const hi = isHighlighted(d)
          const sel = isSelected(d)
          const tod = isToday(d)
          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => onSelect?.(d)}
              className={cn(
                'flex aspect-square items-center justify-center rounded-full text-xs font-semibold transition-colors',
                sel
                  ? 'bg-gold-500 text-navy-500'
                  : tod
                    ? 'bg-navy-500 text-white'
                    : hi
                      ? 'bg-gold-100 text-navy-500 hover:bg-gold-200'
                      : 'text-navy-500 hover:bg-neutral-100',
              )}
            >
              {d.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}
