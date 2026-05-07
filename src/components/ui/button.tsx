import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        gold: 'bg-gold-500 text-navy-500 hover:bg-gold-400 hover:shadow-lg hover:shadow-gold-500/30',
        navy: 'bg-navy-500 text-white hover:bg-navy-400 hover:shadow-lg hover:shadow-navy-500/30',
        outlineGold:
          'border-2 border-gold-500 bg-transparent text-gold-700 hover:bg-gold-100',
        outlineNavy:
          'border-2 border-navy-500 bg-transparent text-navy-500 hover:bg-navy-500 hover:text-white',
        ghost:
          'bg-transparent text-navy-500 hover:bg-neutral-200 hover:text-navy-500',
        link: 'bg-transparent text-gold-700 underline-offset-4 hover:underline px-0',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-sm',
        lg: 'h-13 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'gold',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { buttonVariants }
