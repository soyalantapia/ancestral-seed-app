import { useEffect, useId, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Fix V4-PUB-10 (auditoría v4): contador global de "scroll locks"
 * activos. Cada modal/drawer/dialog que quiere bloquear el body
 * scroll incrementa este contador al mount + decrementa al unmount.
 * Body.style.overflow se setea a 'hidden' SOLO cuando el contador
 * pasa de 0 a 1; se restaura al previo SOLO cuando vuelve a 0.
 *
 * Antes cada ConfirmDialog capturaba `prevOverflow` al mount y lo
 * restauraba al unmount. Si A se abría → B se abría → A se cerraba
 * antes que B, A restauraba al original (=scrollable) mientras B
 * seguía abierto. Body queda scrollable con modal visible.
 *
 * Con el counter, el lock se mantiene mientras CUALQUIER modal esté
 * abierto, y solo se libera cuando TODOS cerraron.
 */
let bodyScrollLockCount = 0
let bodyScrollLockPrev: string | null = null

function acquireBodyScrollLock(): void {
  if (typeof document === 'undefined') return
  if (bodyScrollLockCount === 0) {
    bodyScrollLockPrev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  bodyScrollLockCount++
}

function releaseBodyScrollLock(): void {
  if (typeof document === 'undefined') return
  if (bodyScrollLockCount > 0) bodyScrollLockCount--
  if (bodyScrollLockCount === 0) {
    document.body.style.overflow = bodyScrollLockPrev ?? ''
    bodyScrollLockPrev = null
  }
}

/**
 * Diálogo de confirmación reusable que reemplaza a `window.confirm()`.
 *
 * Fix V2-TUT-06 + V2-TUT-18 + V2-POS-12 (auditoría v2): el confirm
 * nativo rompía la estética de marca, era imposible de estilizar y
 * el screen reader no podía anunciar el contexto (los lectores leían
 * solo "OK" y "Cancelar" sin el título de la pregunta). Este componente
 * usa modal accesible con role=dialog, focus trap mínimo, ESC para
 * cerrar y botones bien tipados.
 *
 * Se usa con state local en cada caller:
 *   const [pending, setPending] = useState<Pending | null>(null)
 *   <ConfirmDialog
 *     open={pending !== null}
 *     title="Saltar etapas"
 *     description="…"
 *     confirmLabel="Sí, saltar"
 *     onConfirm={() => { applyMove(pending!); setPending(null) }}
 *     onCancel={() => setPending(null)}
 *   />
 */
export interface ConfirmDialogProps {
  open: boolean
  /** Título grande arriba (visible). También es el aria-labelledby del dialog. */
  title: string
  /** Descripción debajo del título (puede ser multilínea). */
  description: string
  /** Texto del botón principal. Default: "Confirmar". */
  confirmLabel?: string
  /** Texto del botón secundario. Default: "Cancelar". */
  cancelLabel?: string
  /** Si true, el botón confirm aparece en rojo (acción destructiva). */
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)
  /**
   * Fix V3-POS-12 + V3-PUB-12 (auditoría v3): antes los ids
   * `confirm-dialog-title` y `confirm-dialog-description` eran
   * estáticos — si dos ConfirmDialog convivían (raro pero posible:
   * MyProfile pendingTab abierto + notif que dispara otro confirm),
   * aria-labelledby de ambos apuntaban al mismo id y los screen
   * readers leían el primero solamente. Ahora generamos ids únicos
   * con `useId()` por instancia.
   */
  const reactId = useId()
  const titleId = `cd-${reactId}-title`
  const descId = `cd-${reactId}-desc`

  /**
   * ESC cancela siempre. Enter confirma SOLO si el foco está en el
   * botón confirm (no en Cancel o el backdrop).
   *
   * Fix V3-TUT-05 + V3-PUB-10 (auditoría v3): antes el listener
   * global escuchaba Enter sin importar el foco. Si el user tabeaba
   * al botón "Volver al kanban" (Cancel) y pulsaba Enter pensando
   * cancelar, el handler global confirmaba — peor aún con
   * variant="danger" que ejecutaba acciones destructivas (saltar
   * etapas, restaurar demo) por error. Ahora respetamos el foco.
   *
   * Fix V3-PUB-13: capturamos el overflow original del body antes de
   * setearlo a 'hidden' — al cerrar restauramos el valor previo, no
   * a '' (que rompía locks anidados de otros modales/drawers).
   */
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
      if (e.key === 'Enter') {
        /**
         * Confirmar SOLO si el foco está en el botón confirm,
         * O si el foco está en el body (mobile tap pierde focus).
         * Fix V4-PUB-09 (auditoría v4): antes solo aceptaba focus
         * en confirmRef — pero en mobile, varios browsers no
         * mantienen focus en buttons tras tap, y `activeElement`
         * queda en `document.body`. Sin esto, Enter desde keyboard
         * externo en iPad/Android no confirmaba.
         *
         * NO confirmamos si el foco está en Cancel u otro botón
         * dentro del dialog (preservamos la protección original).
         */
        const ae = document.activeElement
        if (ae === confirmRef.current || ae === document.body) {
          onConfirm()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    acquireBodyScrollLock()
    const t = setTimeout(() => confirmRef.current?.focus(), 50)
    return () => {
      document.removeEventListener('keydown', onKey)
      releaseBodyScrollLock()
      clearTimeout(t)
    }
  }, [open, onConfirm, onCancel])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/*
            Fix V3-PUB-11 (auditoría v3): antes el backdrop era un
            `<button>` con `aria-label="Cancelar"` — eso lo metía en el
            orden de tabulación, así que el Tab focuseaba el backdrop
            antes del primer botón real del dialog. Cualquier Enter ahí
            confirmaba "cancelar" sin que el user supiera. Ahora es un
            `<div role="presentation">` con `aria-hidden` y no
            tabulable; el click-away sigue funcionando.
          */}
          <div
            role="presentation"
            aria-hidden
            onClick={onCancel}
            className="absolute inset-0 bg-navy-500/60 backdrop-blur-[2px]"
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full',
                    danger
                      ? 'bg-error-100 text-error-400'
                      : 'bg-gold-100 text-gold-700',
                  )}
                >
                  <AlertTriangle className="h-5 w-5" />
                </span>
                <h3 id={titleId} className="text-lg font-bold text-navy-500">
                  {title}
                </h3>
              </div>
              <button
                type="button"
                onClick={onCancel}
                className="rounded-full p-1.5 text-navy-300 hover:bg-neutral-100"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p
              id={descId}
              className="mt-3 whitespace-pre-line text-sm leading-relaxed text-navy-500"
            >
              {description}
            </p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm font-bold text-navy-500 transition-colors hover:bg-neutral-100"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                ref={confirmRef}
                onClick={onConfirm}
                className={cn(
                  'inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-bold shadow-sm transition-colors',
                  danger
                    ? 'bg-error-400 text-white hover:bg-error-300'
                    : 'bg-navy-500 text-white hover:bg-navy-400',
                )}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
