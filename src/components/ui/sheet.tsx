import { useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SheetProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  side?: 'bottom' | 'right'
  children: ReactNode
  className?: string
}

export function Sheet({
  open,
  onClose,
  title,
  description,
  side = 'bottom',
  children,
  className,
}: SheetProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  const isBottom = side === 'bottom'
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-navy-500/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={isBottom ? { y: '100%' } : { x: '100%' }}
            animate={isBottom ? { y: 0 } : { x: 0 }}
            exit={isBottom ? { y: '100%' } : { x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'absolute bg-white shadow-2xl',
              isBottom
                ? 'bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl'
                : 'right-0 top-0 h-full w-full max-w-md overflow-y-auto',
              className,
            )}
          >
            {isBottom && (
              <div className="sticky top-0 flex justify-center bg-white pb-2 pt-3">
                <span className="h-1.5 w-12 rounded-full bg-neutral-300" />
              </div>
            )}
            {(title || description) && (
              <div className="flex items-start justify-between gap-4 px-6 pt-2 pb-4">
                <div className="flex-1">
                  {title && (
                    <h2 className="text-lg font-bold text-navy-500">{title}</h2>
                  )}
                  {description && (
                    <p className="mt-1 text-sm text-navy-300">{description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-navy-300 hover:bg-neutral-100 hover:text-navy-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className={cn('px-6 pb-8', !title && !description && 'pt-2')}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
