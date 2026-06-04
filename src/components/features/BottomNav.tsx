import { NavLink } from 'react-router-dom'
import { Bell, CreditCard, FileText, Menu, UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Barra de navegación inferior estilo app — SOLO en celular (`md:hidden`).
 * Reemplaza el toolbar "Menú" superior. A partir de `md` (768px) toma el
 * control el sidebar del DashboardLayout.
 *
 * 4 pestañas principales + "Más" (abre el drawer con Ayuda, Tutorial y
 * Cerrar sesión). Etiquetas cortas para entrar en 5 columnas a 320px.
 */
const TABS: Array<{ to: string; icon: typeof FileText; label: string; aria: string }> = [
  { to: '/mis-certificaciones', icon: FileText, label: 'Certif.', aria: 'Certificaciones' },
  { to: '/notificaciones', icon: Bell, label: 'Alertas', aria: 'Notificaciones' },
  { to: '/pagos', icon: CreditCard, label: 'Pagos', aria: 'Pagos' },
  { to: '/mi-perfil', icon: UserRound, label: 'Perfil', aria: 'Perfil' },
]

export function BottomNav({
  onMore,
  alertCount = 0,
}: {
  onMore: () => void
  alertCount?: number
}) {
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-neutral-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-1px_12px_rgba(11,31,58,0.07)] backdrop-blur md:hidden"
    >
      {TABS.map((t) => {
        const Icon = t.icon
        const showBadge = t.to === '/notificaciones' && alertCount > 0
        return (
          <NavLink
            key={t.to}
            to={t.to}
            aria-label={t.aria}
            className={({ isActive }) =>
              cn(
                'relative flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 pb-1.5 pt-2.5 text-[10px] font-bold transition-colors',
                isActive ? 'text-navy-500' : 'text-navy-300',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute top-0 h-1 w-9 rounded-b-full bg-gold-500"
                  />
                )}
                <span className="relative">
                  <Icon className="h-6 w-6" strokeWidth={isActive ? 2.25 : 1.75} />
                  {showBadge && (
                    <span className="absolute -right-2 -top-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold-500 px-1 text-[9px] font-bold text-navy-500 ring-2 ring-white">
                      {alertCount > 9 ? '9+' : alertCount}
                    </span>
                  )}
                </span>
                <span>{t.label}</span>
              </>
            )}
          </NavLink>
        )
      })}

      {/* "Más" abre el drawer existente (Ayuda · Tutorial · Cerrar sesión) */}
      <button
        type="button"
        onClick={onMore}
        aria-label="Más opciones"
        className="flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 pb-1.5 pt-2.5 text-[10px] font-bold text-navy-300 transition-colors active:text-navy-500"
      >
        <Menu className="h-6 w-6" strokeWidth={1.75} />
        <span>Más</span>
      </button>
    </nav>
  )
}
