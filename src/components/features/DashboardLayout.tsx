import { useState, type ReactNode } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  CreditCard,
  FileText,
  HelpCircle,
  LogOut,
  Menu,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Header } from './Header'
import { HelpBubble } from './HelpBubble'
import { ErrorBoundary } from './ErrorBoundary'
import { SkipToContent } from './SkipToContent'
import { CommandPalette } from './CommandPalette'
import { GuidedTour } from './GuidedTour'
import { PageMeta } from './PageMeta'
import { useEscape } from '@/hooks/useEscape'
import { useAuthStore } from '@/store/auth'
import { useOnboardingStore } from '@/store/onboarding'
import { resetDemoStores } from '@/store/resetDemo'
import { deriveActionAlerts } from '@/lib/alerts'
import { mockCertificationRequests } from '@/services/mocks/data'
import { cn } from '@/lib/utils'

// Cantidad de alertas accionables → badge de la pestaña Notificaciones.
const ALERT_COUNT = deriveActionAlerts(mockCertificationRequests).length

// Navegación del postulante — demo enfocado. "Notificaciones" centraliza las
// alertas accionables (antes vivían como banner dentro de cada detalle).
// "Tutorial" no es una ruta: dispara el recorrido guiado (ver abajo).
const navItems: Array<{
  to: string
  icon: typeof FileText
  label: string
  badge?: number
}> = [
  { to: '/mis-certificaciones', icon: FileText, label: 'Certificaciones' },
  {
    to: '/notificaciones',
    icon: Bell,
    label: 'Notificaciones',
    badge: ALERT_COUNT,
  },
  { to: '/pagos', icon: CreditCard, label: 'Pagos' },
  { to: '/mi-perfil', icon: UserRound, label: 'Perfil' },
  { to: '/ayuda', icon: HelpCircle, label: 'Ayuda' },
]

export function DashboardLayout({ children }: { children?: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const clearSession = useAuthStore((s) => s.clearSession)
  // "Tutorial" dispara el recorrido guiado (reset = arranca desde el paso 0).
  const startTour = useOnboardingStore((s) => s.reset)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)

  const handleLogout = () => {
    // Cerrar UI overlays ANTES de tocar la sesión para evitar que algún
    // children con user=null se renderice con el modal/drawer abierto.
    setDrawerOpen(false)
    setConfirmLogout(false)
    // Navegar primero (replace evita stacking con el Navigate de RequireAuth).
    navigate('/login', { replace: true })
    // Fix V3-POS-05 (auditoría v3): limpiar TODOS los stores del demo
    // antes del clearSession para evitar cross-account leaks en
    // navegadores compartidos (kioskos, equipos de pruebas). El flag
    // forLogout también limpia el draft del CertifyForm y las notifs.
    resetDemoStores({ forLogout: true })
    // Limpiar sesión al final.
    clearSession()
    toast.success('Sesión cerrada')
  }

  useEscape(confirmLogout, () => setConfirmLogout(false))
  useEscape(drawerOpen, () => setDrawerOpen(false))

  // Close drawer on route change
  const closeOnNav = () => setDrawerOpen(false)
  if (drawerOpen) {
    // Effect-less: we'll close manually via NavLink onClick
  }
  void location

  const SidebarBody = (
    <>
      {/* User card */}
      <div className="border-b border-navy-400 px-4 py-5">
        <div className="flex items-center gap-3">
          <img
            src={user?.avatarUrl ?? 'https://i.pravatar.cc/100?img=47'}
            alt={user?.name ?? 'Avatar'}
            className="h-11 w-11 rounded-full object-cover ring-2 ring-gold-500"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">
              {user?.name ?? 'Camila Montes'}
            </p>
            <p className="truncate text-xs text-neutral-400">
              {user?.email ?? 'usuario@email.com'}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-6">
        {navItems.map((item) => (
          <SidebarLink
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            badge={item.badge}
            onClose={closeOnNav}
          />
        ))}

        {/* Tutorial: no es una ruta — arranca el recorrido guiado. */}
        <button
          type="button"
          onClick={() => {
            closeOnNav()
            startTour('solicitante')
          }}
          className="mt-1 inline-flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-neutral-300 transition-colors hover:bg-navy-400/60 hover:text-white"
        >
          <Sparkles className="h-5 w-5" strokeWidth={1.75} />
          <span className="flex-1 text-left">Tutorial</span>
        </button>
      </nav>
      <button
        type="button"
        onClick={() => setConfirmLogout(true)}
        className="m-4 inline-flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-neutral-300 transition-colors hover:bg-navy-400 hover:text-white"
      >
        <LogOut className="h-5 w-5" />
        Cerrar sesión
      </button>
    </>
  )

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/*
        Fix V3-PUB-02 (auditoría v3): el `noindex` prop de PageMeta era
        DEAD CODE — ningún callsite lo pasaba. V2-PUB-07 había
        agregado el wiring (omitir og:image, JSON-LD, etc. cuando
        noindex=true) pero nadie lo invocaba. Ahora el dashboard del
        postulante aplica `noindex` por default desde el Layout — TODAS
        las subrutas privadas (/inicio, /mis-certificaciones,
        /calendario, /pagos, /perfil, /ayuda, /settings,
        /notificaciones) heredan el meta robots noindex,nofollow.

        Si una subruta específica necesita ser indexable, puede
        sobreescribir con su propio <PageMeta noindex={false} ... />
        más abajo en el árbol.
      */}
      <PageMeta noindex />
      <SkipToContent />
      <Header />

      {/* Mobile toolbar */}
      <div className="flex items-center gap-3 border-b border-neutral-200 bg-white px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-navy-500 hover:bg-neutral-100"
          aria-label="Abrir menú lateral"
        >
          <Menu className="h-4 w-4" />
          Menú
        </button>
        <span className="text-xs text-navy-300">Tu panel</span>
      </div>

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside
          data-tour="sidebar"
          className="hidden w-64 shrink-0 flex-col bg-navy-500 text-white md:flex"
        >
          {SidebarBody}
        </aside>

        {/* Mobile drawer */}
        <AnimatePresence>
          {drawerOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/50 md:hidden"
              onClick={() => setDrawerOpen(false)}
            >
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ duration: 0.25 }}
                onClick={(e) => e.stopPropagation()}
                className="flex h-full w-72 flex-col bg-navy-500 text-white shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-navy-400 px-4 py-3">
                  <p className="text-sm font-bold uppercase tracking-widest text-neutral-400">
                    Tu panel
                  </p>
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(false)}
                    className="text-white hover:text-neutral-300"
                    aria-label="Cerrar menú"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {SidebarBody}
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex min-w-0 flex-1 flex-col bg-white focus:outline-none"
        >
          {/* pb-24: deja aire al pie para que el botón flotante de Ayuda
              (HelpBubble, fixed bottom-right) no tape el último CTA. */}
          <div className="flex-1 pb-24">
            <ErrorBoundary key={location.pathname}>
              {children ?? <Outlet />}
            </ErrorBoundary>
          </div>
        </main>
      </div>

      <HelpBubble />
      <CommandPalette />
      <GuidedTour />

      {/* Logout confirm */}
      <AnimatePresence>
        {confirmLogout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-500/40 p-4 backdrop-blur-sm"
            onClick={() => setConfirmLogout(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning-100 text-warning-400">
                <LogOut className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-navy-500">
                ¿Cerrar sesión?
              </h3>
              <p className="mt-2 text-sm text-navy-300">
                Vas a salir de tu cuenta. Tus cambios sin guardar se van a perder.
              </p>
              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setConfirmLogout(false)}
                  className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-navy-500 transition-colors hover:bg-neutral-100"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-navy-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-400"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SidebarLink({
  to,
  icon: Icon,
  label,
  badge,
  onClose,
}: {
  to: string
  icon: typeof FileText
  label: string
  badge?: number
  onClose?: () => void
}) {
  return (
    <NavLink
      to={to}
      onClick={onClose}
      // Sin `end`: "Certificaciones" (/mis-certificaciones) debe seguir
      // activo en su subruta de detalle (/mis-certificaciones/:id).
      className={({ isActive }) =>
        cn(
          'inline-flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors',
          isActive
            ? 'bg-navy-400 text-white shadow-sm'
            : 'text-neutral-300 hover:bg-navy-400/60 hover:text-white',
        )
      }
    >
      <Icon className="h-5 w-5" strokeWidth={1.75} />
      <span className="flex-1">{label}</span>
      {badge ? (
        <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gold-500 px-1.5 text-xs font-bold text-navy-500">
          {badge > 9 ? '9+' : badge}
        </span>
      ) : null}
    </NavLink>
  )
}
