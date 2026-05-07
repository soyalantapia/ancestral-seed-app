import { cn } from '@/lib/utils'

interface LogoProps {
  variant?: 'light' | 'dark'
  showWordmark?: boolean
  layout?: 'horizontal' | 'vertical'
  className?: string
  markClassName?: string
}

export function Logo({
  variant = 'dark',
  showWordmark = true,
  layout = 'horizontal',
  className,
  markClassName,
}: LogoProps) {
  const wordmarkColor = variant === 'light' ? 'text-white' : 'text-navy-500'
  const taglineColor = variant === 'light' ? 'text-gold-400' : 'text-gold-700'
  const isVertical = layout === 'vertical'

  return (
    <div
      className={cn(
        'flex shrink-0 items-center',
        isVertical ? 'flex-col gap-3' : 'flex-row gap-3',
        className,
      )}
    >
      <img
        src={`${import.meta.env.BASE_URL}logo-mark.png`}
        alt=""
        className={cn(
          isVertical ? 'h-16 w-16' : 'h-9 w-9',
          'shrink-0',
          markClassName,
        )}
      />
      {showWordmark && (
        <div
          className={cn(
            'flex flex-col leading-none',
            isVertical ? 'items-center text-center' : 'items-start',
          )}
        >
          <span
            className={cn(
              isVertical ? 'text-xl' : 'text-base',
              'font-extrabold tracking-[0.18em]',
              wordmarkColor,
            )}
          >
            ANCESTRAL SEED
          </span>
          <span
            className={cn(
              'mt-1 text-[10px] font-semibold tracking-[0.32em]',
              taglineColor,
            )}
          >
            CERTIFICACIÓN DIGITAL
          </span>
        </div>
      )}
    </div>
  )
}
