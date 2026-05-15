import { useEffect } from 'react'
import { useSettingsStore } from '@/store/settings'

/**
 * Aplica/quita la clase `dark` en `<html>` según el setting `theme`.
 *
 * Modos soportados:
 *  - 'light'  → siempre claro
 *  - 'dark'   → siempre oscuro
 *  - 'system' → respeta `prefers-color-scheme` y se subscribe a cambios
 *
 * Diseño:
 *  - El hook se monta una vez en `<App>` (no en cada página).
 *  - Subscribe a Zustand para reaccionar a cambios desde Settings UI.
 *  - El listener de media query queda activo solo en modo 'system' — al
 *    cambiar a 'light'/'dark' lo desactiva para no provocar repaints
 *    fantasma cuando el SO cambia su tema.
 */
export function useThemeEffect() {
  const theme = useSettingsStore((s) => s.theme)

  useEffect(() => {
    if (typeof document === 'undefined') return
    const root = document.documentElement

    const apply = (mode: 'light' | 'dark') => {
      if (mode === 'dark') root.classList.add('dark')
      else root.classList.remove('dark')
      root.style.colorScheme = mode
    }

    if (theme === 'light' || theme === 'dark') {
      apply(theme)
      return
    }

    // theme === 'system'
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    apply(mq.matches ? 'dark' : 'light')

    const handler = (e: MediaQueryListEvent) =>
      apply(e.matches ? 'dark' : 'light')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])
}
