import { Monitor, Moon, Sun } from 'lucide-react'
import { useSettingsStore } from '@/store/settings'
import { cn } from '@/lib/utils'

/**
 * Toggle de tema con 3 estados: light, dark, system.
 *
 * Estilos:
 *  - `variant="icon"` (default): un botón compacto con ícono que rota.
 *    Pensado para el Header.
 *  - `variant="segmented"`: 3 píldoras lado a lado (Settings panel).
 *
 * El estado real vive en `useSettingsStore.theme` y la aplicación al DOM
 * está en `useThemeEffect()` (en main.tsx). Este componente solo dispara
 * `update({ theme })`.
 */
interface ThemeToggleProps {
  variant?: 'icon' | 'segmented'
  className?: string
}

export function ThemeToggle({ variant = 'icon', className }: ThemeToggleProps) {
  const theme = useSettingsStore((s) => s.theme)
  const update = useSettingsStore((s) => s.update)

  if (variant === 'segmented') {
    const options: Array<{
      value: 'light' | 'dark' | 'system'
      label: string
      Icon: typeof Sun
    }> = [
      { value: 'light', label: 'Claro', Icon: Sun },
      { value: 'system', label: 'Sistema', Icon: Monitor },
      { value: 'dark', label: 'Oscuro', Icon: Moon },
    ]
    return (
      <div
        role="radiogroup"
        aria-label="Elegir tema"
        className={cn(
          'inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-white p-1 dark:border-white/10 dark:bg-white/5',
          className,
        )}
      >
        {options.map(({ value, label, Icon }) => {
          const active = theme === value
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => update({ theme: value })}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                active
                  ? 'bg-navy-500 text-white shadow-sm'
                  : 'text-navy-500 hover:bg-neutral-100 dark:text-white/70 dark:hover:bg-white/10',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          )
        })}
      </div>
    )
  }

  // icon variant — cicla light → dark → system → light
  const next: Record<'light' | 'dark' | 'system', 'light' | 'dark' | 'system'> =
    {
      light: 'dark',
      dark: 'system',
      system: 'light',
    }
  const Icon = theme === 'dark' ? Moon : theme === 'system' ? Monitor : Sun
  const label =
    theme === 'dark' ? 'Tema oscuro' : theme === 'system' ? 'Tema del sistema' : 'Tema claro'

  return (
    <button
      type="button"
      onClick={() => update({ theme: next[theme] })}
      aria-label={`Cambiar tema (actual: ${label})`}
      title={label}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-full text-navy-500 transition-colors hover:bg-neutral-100 dark:text-white/80 dark:hover:bg-white/10',
        className,
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}
