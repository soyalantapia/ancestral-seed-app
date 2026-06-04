import { NavLink } from 'react-router-dom'
import { Award, Bell, CreditCard, Menu, UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Barra de navegación inferior estilo app — SOLO en celular (`md:hidden`).
 * A partir de `md` (768px) toma el control el sidebar del DashboardLayout.
 *
 * Layout: 5 columnas. La del centro es un botón CIRCULAR SOBRESALIENTE
 * (el "seal" de certificaciones, que sube por encima de la barra). A los
 * costados: Perfil · Alertas | Pagos · Más ("Más" abre el drawer con
 * Ayuda / Tutorial / Cerrar sesión).
 */
const sideTabClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'relative flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 pb-1.5 pt-2.5 text-[10px] font-bold transition-colors',
    isActive ? 'text-navy-500' : 'text-navy-300',
  )

function ActiveBar() {
  return (
    <span
      aria-hidden
      className="absolute top-0 h-1 w-9 rounded-b-full bg-gold-500"
    />
  )
}

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
      {/* 1 · Perfil */}
      <NavLink to="/mi-perfil" aria-label="Perfil" className={sideTabClass}>
        {({ isActive }) => (
          <>
            {isActive && <ActiveBar />}
            <UserRound className="h-6 w-6" strokeWidth={isActive ? 2.25 : 1.75} />
            <span>Perfil</span>
          </>
        )}
      </NavLink>

      {/* 2 · Alertas */}
      <NavLink to="/notificaciones" aria-label="Notificaciones" className={sideTabClass}>
        {({ isActive }) => (
          <>
            {isActive && <ActiveBar />}
            <span className="relative">
              <Bell className="h-6 w-6" strokeWidth={isActive ? 2.25 : 1.75} />
              {alertCount > 0 && (
                <span className="absolute -right-2 -top-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold-500 px-1 text-[9px] font-bold text-navy-500 ring-2 ring-white">
                  {alertCount > 9 ? '9+' : alertCount}
                </span>
              )}
            </span>
            <span>Alertas</span>
          </>
        )}
      </NavLink>

      {/* 3 · Certificado — botón central circular SOBRESALIENTE */}
      <div className="relative">
        <NavLink
          to="/mis-certificaciones"
          aria-label="Certificaciones"
          className="absolute -top-7 left-1/2 flex -translate-x-1/2 flex-col items-center"
        >
          {({ isActive }) => (
            <>
              <span
                className={cn(
                  'flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-gold-500 text-navy-500 shadow-lg shadow-gold-500/40 transition-transform active:scale-95',
                  isActive && 'ring-2 ring-navy-500',
                )}
              >
                <Award className="h-7 w-7" strokeWidth={2} />
              </span>
              <span
                className={cn(
                  'mt-1 text-[10px] font-bold',
                  isActive ? 'text-navy-500' : 'text-navy-400',
                )}
              >
                Certif.
              </span>
            </>
          )}
        </NavLink>
      </div>

      {/* 4 · Pagos */}
      <NavLink to="/pagos" aria-label="Pagos" className={sideTabClass}>
        {({ isActive }) => (
          <>
            {isActive && <ActiveBar />}
            <CreditCard className="h-6 w-6" strokeWidth={isActive ? 2.25 : 1.75} />
            <span>Pagos</span>
          </>
        )}
      </NavLink>

      {/* 5 · Más → abre el drawer (Ayuda · Tutorial · Cerrar sesión) */}
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
