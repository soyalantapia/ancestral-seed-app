import { useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AccordionItem {
  id: string
  question: string
  answer: ReactNode
}

interface AccordionProps {
  items: AccordionItem[]
  className?: string
}

export function Accordion({ items, className }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null)
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {items.map((item) => {
        const open = openId === item.id
        return (
          <div
            key={item.id}
            className={cn(
              'rounded-2xl border bg-white transition-shadow',
              open
                ? 'border-gold-500 shadow-md'
                : 'border-neutral-200 hover:border-gold-300',
            )}
          >
            <button
              type="button"
              onClick={() => setOpenId(open ? null : item.id)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={open}
            >
              <span className="text-sm font-semibold text-navy-500 md:text-base">
                {item.question}
              </span>
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors',
                  open
                    ? 'bg-gold-500 text-navy-500'
                    : 'bg-neutral-100 text-navy-300',
                )}
              >
                {open ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 text-sm leading-relaxed text-navy-300">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
