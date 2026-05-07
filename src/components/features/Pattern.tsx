import { cn } from '@/lib/utils'

type Variant = 'gold' | 'navy' | 'cream-gold'

interface PatternProps {
  variant?: Variant
  className?: string
}

export function Pattern({ variant = 'gold', className }: PatternProps) {
  const fill =
    variant === 'navy' ? '#001c38' : variant === 'cream-gold' ? '#c7a800' : '#c7a800'
  const bg =
    variant === 'navy' ? '#000d1c' : variant === 'cream-gold' ? '#f4eccc' : '#f4eccc'
  return (
    <div
      aria-hidden
      className={cn('overflow-hidden', className)}
      style={{ backgroundColor: bg }}
    >
      <svg
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full"
      >
        <defs>
          <pattern
            id={`aztec-${variant}`}
            x="0"
            y="0"
            width="50"
            height="50"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 0h50v50H0z"
              fill="none"
            />
            <path
              d="M25 5 L40 20 L25 35 L10 20 Z"
              stroke={fill}
              strokeWidth="1.5"
              fill="none"
              opacity="0.8"
            />
            <path
              d="M0 25 L10 25 M40 25 L50 25 M25 0 L25 5 M25 45 L25 50"
              stroke={fill}
              strokeWidth="1.5"
              opacity="0.6"
            />
            <circle cx="25" cy="20" r="2" fill={fill} opacity="0.7" />
          </pattern>
        </defs>
        <rect width="200" height="200" fill={`url(#aztec-${variant})`} />
      </svg>
    </div>
  )
}
