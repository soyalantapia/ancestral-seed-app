import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEscape } from '@/hooks/useEscape'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { cn } from '@/lib/utils'

/**
 * Modal genérico con focus trap + escape + click-outside + animación.
 * Sigue el patrón de ModalShell de Verify.tsx pero centralizado para
 * que TODOS los modales tengan a11y correcto sin repetir código.
 *
 * Uso:
 *   <Modal isOpen={open} onClose={() => setOpen(false)} title="...">
 *     {children}
 *   </Modal>
 *
 * Comportamiento a11y:
 *   - role="dialog" + aria-modal="true"
 *   - Esc cierra
 *   - Click en backdrop cierra
 *   - Tab queda atrapado adentro
 *   - Focus inicial al primer focusable
 *   - Al cerrar, foco vuelve al elemento previo
 */
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  /** Etiqueta accesible cuando no querés un title visible. */
  ariaLabel?: string
  /** Tamaño del contenedor. Default 'md'. */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Mostrar botón X de cerrar. Default true. */
  showCloseButton?: boolean
  children: React.ReactNode
  /** Clases extras al contenedor interno (el "card"). */
  className?: string
}

const SIZE_CLASS: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

export function Modal({
  isOpen,
  onClose,
  title,
  ariaLabel,
  size = 'md',
  showCloseButton = true,
  children,
  className,
}: ModalProps) {
  useEscape(isOpen, onClose)
  const trapRef = useFocusTrap<HTMLDivElement>(isOpen)

  if (!isOpen) return null

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={title ?? ariaLabel}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-500/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        ref={trapRef}
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'relative w-full overflow-hidden rounded-3xl bg-white shadow-2xl',
          SIZE_CLASS[size],
          className,
        )}
      >
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-navy-300 transition-colors hover:bg-neutral-100 hover:text-navy-500"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {title && (
          <h2 className="border-b border-neutral-200 px-6 py-4 text-lg font-bold text-navy-500">
            {title}
          </h2>
        )}
        <div className={title ? 'p-6' : 'p-6 md:p-8'}>{children}</div>
      </motion.div>
    </motion.div>
  )
}
