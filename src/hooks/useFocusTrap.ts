import { useEffect, useRef } from 'react'

/**
 * Atrapa el foco del teclado dentro de un container (típicamente un
 * modal/dialog). Implementación liviana ~30 líneas sin dependencias.
 *
 * Comportamiento:
 *   1. Al montar: enfoca el primer elemento focusable dentro del container.
 *   2. Al presionar Tab al final: vuelve al primer elemento.
 *   3. Al presionar Shift+Tab al principio: salta al último.
 *   4. Al desmontar: devuelve el foco al elemento que lo tenía antes.
 *
 * Uso:
 *   const ref = useFocusTrap<HTMLDivElement>(isOpen)
 *   return <div ref={ref} role="dialog">...</div>
 */
export function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const containerRef = useRef<T | null>(null)

  useEffect(() => {
    if (!active) return
    const container = containerRef.current
    if (!container) return

    // Guardamos el elemento que tenía foco antes de abrir el modal
    // para restaurarlo al cerrar (UX estándar).
    const previouslyFocused = document.activeElement as HTMLElement | null

    const getFocusable = (): HTMLElement[] => {
      const selector = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(',')
      return Array.from(container.querySelectorAll<HTMLElement>(selector))
        .filter((el) => !el.hasAttribute('aria-hidden'))
    }

    // Auto-focus al primer focusable disponible
    const first = getFocusable()[0]
    first?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const focusables = getFocusable()
      if (focusables.length === 0) return
      const firstEl = focusables[0]
      const lastEl = focusables[focusables.length - 1]

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault()
        lastEl.focus()
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault()
        firstEl.focus()
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => {
      container.removeEventListener('keydown', handleKeyDown)
      // Devolver el foco al elemento previo (si sigue en DOM)
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus()
      }
    }
  }, [active])

  return containerRef
}
