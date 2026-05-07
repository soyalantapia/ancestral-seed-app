import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        gold: 'bg-gold-100 text-gold-700 border border-gold-300',
        navy: 'bg-navy-500 text-white',
        success: 'bg-success-200 text-success-400 border border-success-400/30',
        warning: 'bg-warning-100 text-warning-400 border border-warning-300',
        danger: 'bg-error-200 text-error-400 border border-error-300/40',
        muted: 'bg-neutral-200 text-navy-300',
      },
    },
    defaultVariants: {
      variant: 'muted',
    },
  },
)

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props} />
  )
}
