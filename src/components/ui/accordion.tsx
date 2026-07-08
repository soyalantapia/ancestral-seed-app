import { useEffect, useRef, useState, type ReactNode } from 'react'
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
  /**
   * Abre el item cuyo id matchea el hash de la URL (deep-link, ej:
   * /legal/legislacion#colombia), tanto en carga inicial como ante un
   * `hashchange` (clicks same-route). El scroll hasta el item lo resuelve
   * el <HashScrollHandler> global del Layout (usa el `id` de cada card).
   * Opt-in: por defecto el acordeón arranca cerrado, como siempre.
   */
  syncWithHash?: boolean
}

export function Accordion({
  items,
  className,
  syncWithHash = false,
}: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null)

  // Ref al set actual de items para validar el hash sin re-correr el efecto
  // por identidad del array: si un consumidor pasa `items` inline (nueva
  // referencia en cada render), no queremos re-abrir el item del hash y
  // pisar lo que el usuario abrió/cerró a mano. Se actualiza en efecto
  // (no en render) para no acceder al ref durante el render.
  const itemsRef = useRef(items)
  useEffect(() => {
    itemsRef.current = items
  }, [items])

  useEffect(() => {
    if (!syncWithHash) return
    const openFromHash = () => {
      const id = window.location.hash.replace('#', '')
      if (id && itemsRef.current.some((it) => it.id === id)) setOpenId(id)
    }
    openFromHash() // deep-link al montar
    window.addEventListener('hashchange', openFromHash) // clicks same-route
    return () => window.removeEventListener('hashchange', openFromHash)
  }, [syncWithHash])
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {items.map((item) => {
        const open = openId === item.id
        return (
          <div
            key={item.id}
            // El ancla DOM (id + scroll-mt para el header sticky) solo se
            // expone cuando el deep-link por hash está activo, para no
            // publicar ids autor-controlados en otros acordeones (ej: FAQ).
            id={syncWithHash ? item.id : undefined}
            className={cn(
              'rounded-2xl border bg-white transition-shadow',
              syncWithHash && 'scroll-mt-24',
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
