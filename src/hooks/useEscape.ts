import { useEffect } from 'react'

/**
 * Cierra un modal/sheet/popover al presionar ESC.
 * @param when condicional booleano para sólo activar el listener cuando está abierto
 * @param onClose callback de cierre
 */
export function useEscape(when: boolean, onClose: () => void) {
  useEffect(() => {
    if (!when) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [when, onClose])
}
