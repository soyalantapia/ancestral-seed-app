import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  CheckCheck,
  ChevronDown,
  ExternalLink,
  Eye,
  FileText,
  LogIn,
  LogOut,
  Menu,
  Settings as SettingsIcon,
  UserRound,
  X,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Logo } from './Logo'
import { Button, buttonVariants } from '@/components/ui/button'
import { useEscape } from '@/hooks/useEscape'
import { useUiStore } from '@/store/ui'
import { useAuthStore } from '@/store/auth'
import { useNotificationsStore } from '@/store/notifications'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/#beneficios', label: 'Beneficios' },
  { to: '/#como-funciona', label: '¿Cómo funciona?' },
  { to: '/directorio', label: 'Certificados' },
]

export function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const isMobileMenuOpen = useUiStore((s) => s.isMobileMenuOpen)
  const toggleMobileMenu = useUiStore((s) => s.toggleMobileMenu)
  const closeMobileMenu = useUiStore((s) => s.closeMobileMenu)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const clearSession = useAuthStore((s) => s.clearSession)
  const notifs = useNotificationsStore((s) => s.items)
  const markRead = useNotificationsStore((s) => s.markRead)
  const markAllRead = useNotificationsStore((s) => s.markAllRead)
  const unread = notifs.filter((n) => !n.read).length

  const [menuOpen, setMenuOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const bellRef = useRef<HTMLDivElement>(null)

  // Detect if user is on a dashboard route
  const isDashboardRoute =
    isAuthenticated &&
    /^\/(inicio|notificaciones|mis-certificaciones|mi-perfil|configuracion|ayuda)/.test(
      location.pathname,
    )

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false)
      }
    }
    if (menuOpen || bellOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen, bellOpen])

  // Close dropdown on route change
  useEffect(() => {
    setMenuOpen(false)
    setBellOpen(false)
  }, [location.pathname])

  useEscape(menuOpen || bellOpen, () => {
    setMenuOpen(false)
    setBellOpen(false)
  })

  const handleLogout = () => {
    // Cerrar overlays ANTES para que ningún children quede con user=null
    // y modal abierto. Navegar antes del clearSession evita race con
    // el Navigate de RequireAuth.
    setMenuOpen(false)
    setBellOpen(false)
    navigate('/login', { replace: true })
    clearSession()
    toast.success('Sesión cerrada')
  }

  const homeLink = isAuthenticated ? '/inicio' : '/'

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="flex h-16 w-full items-center gap-4 px-4 md:h-20 md:gap-6 md:px-6">
        <Link to={homeLink} className="shrink-0">
          <Logo />
        </Link>

        {isDashboardRoute && (
          <Link
            to="/"
            className="hidden items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-navy-300 transition-colors hover:bg-neutral-100 hover:text-navy-500 lg:inline-flex"
            title="Ver sitio público"
          >
            <ExternalLink className="h-3 w-3" />
            Ver sitio público
          </Link>
        )}

        {!isAuthenticated && (
          <nav className="hidden flex-1 items-center gap-7 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                end={false}
                className={({ isActive }) =>
                  cn(
                    'text-sm font-medium transition-colors',
                    isActive ? 'text-navy-500' : 'text-navy-300 hover:text-navy-500',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}


        <div className={cn('hidden items-center gap-2 lg:flex', !isDashboardRoute && 'ml-auto')}>
          {!isAuthenticated && (
            <>
              <Button variant="gold" size="md" onClick={() => navigate('/certificar')}>
                Certificar Producto
              </Button>
              <Button variant="navy" size="md" onClick={() => navigate('/verificar')}>
                Verificar Certificado
              </Button>
              <Button variant="outlineNavy" size="md" onClick={() => navigate('/login')}>
                <LogIn className="h-4 w-4" />
                Acceder
              </Button>
            </>
          )}

          {isAuthenticated && user?.authorSlug && (
            <Link
              to={`/perfil/${user.authorSlug}`}
              title="Ver mi perfil público"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-neutral-300 bg-white text-navy-500 transition-all hover:border-navy-500 hover:bg-neutral-100"
              aria-label="Ver perfil público"
            >
              <Eye className="h-4 w-4" />
            </Link>
          )}

          {isAuthenticated && (
            <div ref={bellRef} className="relative">
              <button
                type="button"
                onClick={() => setBellOpen((v) => !v)}
                className={cn(
                  'relative inline-flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                  bellOpen
                    ? 'border-navy-500 bg-navy-500 text-white'
                    : 'border-neutral-300 bg-white text-navy-500 hover:border-navy-500',
                )}
                aria-label="Notificaciones"
                aria-expanded={bellOpen}
              >
                <Bell className="h-4 w-4" />
                {unread > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-navy-500 ring-2 ring-white">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {bellOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-96 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl"
                  >
                    <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
                      <p className="text-sm font-bold text-navy-500">Notificaciones</p>
                      {unread > 0 && (
                        <button
                          type="button"
                          onClick={() => markAllRead()}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700 hover:underline"
                        >
                          <CheckCheck className="h-3.5 w-3.5" />
                          Marcar todas
                        </button>
                      )}
                    </div>
                    {notifs.length === 0 ? (
                      <p className="px-4 py-8 text-center text-sm text-navy-300">
                        No tenés notificaciones
                      </p>
                    ) : (
                      <ul className="max-h-96 overflow-y-auto">
                        {notifs.slice(0, 5).map((n) => (
                          <li key={n.id}>
                            <Link
                              to={n.link ?? '/notificaciones'}
                              onClick={() => markRead(n.id)}
                              className={cn(
                                'flex items-start gap-3 border-b border-neutral-100 px-4 py-3 text-sm transition-colors hover:bg-neutral-100',
                                !n.read && 'bg-gold-100/30',
                              )}
                            >
                              <span
                                className={cn(
                                  'mt-1 h-2 w-2 shrink-0 rounded-full',
                                  n.read ? 'bg-transparent' : 'bg-gold-500',
                                )}
                              />
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-navy-500">{n.title}</p>
                                <p className="mt-0.5 line-clamp-2 text-xs text-navy-300">{n.body}</p>
                                <p className="mt-1 text-[10px] text-navy-300">
                                  {formatRelativeShort(n.createdAt)}
                                </p>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                    <Link
                      to="/notificaciones"
                      onClick={() => setBellOpen(false)}
                      className="flex items-center justify-center gap-1 border-t border-neutral-200 px-4 py-3 text-xs font-semibold text-gold-700 hover:bg-neutral-100"
                    >
                      Ver todas →
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {isAuthenticated && (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-sm font-semibold transition-all',
                  menuOpen
                    ? 'border-navy-500 bg-navy-500 text-white'
                    : 'border-navy-500 bg-white text-navy-500 hover:bg-neutral-100',
                )}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                <img
                  src={user?.avatarUrl ?? 'https://i.pravatar.cc/100?img=47'}
                  alt={user?.name ?? 'Avatar'}
                  className="h-7 w-7 rounded-full border-2 border-white object-cover"
                />
                <span className="max-w-[140px] truncate">
                  {user?.name?.split(' ')[0] ?? 'Mi cuenta'}
                </span>
                <ChevronDown className={cn('h-4 w-4 transition-transform', menuOpen && 'rotate-180')} />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl"
                    role="menu"
                  >
                    {/* Identity header */}
                    <div className="flex items-center gap-3 border-b border-neutral-200 px-4 py-4">
                      <img
                        src={user?.avatarUrl ?? 'https://i.pravatar.cc/100?img=47'}
                        alt={user?.name ?? 'Avatar'}
                        className="h-11 w-11 rounded-full object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-navy-500">
                          {user?.name ?? 'Camila Montes'}
                        </p>
                        <p className="truncate text-xs text-navy-300">
                          {user?.email ?? 'usuario@email.com'}
                        </p>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="py-2">
                      <MenuItem to="/inicio" icon={UserRound} label="Mi cuenta" />
                      <MenuItem to="/mis-certificaciones" icon={FileText} label="Mis certificaciones" />
                      <MenuItem to="/configuracion" icon={SettingsIcon} label="Configuración" />
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 border-t border-neutral-200 px-4 py-3 text-sm font-semibold text-error-400 transition-colors hover:bg-error-100"
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar sesión
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={toggleMobileMenu}
          className="ml-auto flex h-10 w-10 items-center justify-center rounded-full text-navy-500 transition-colors hover:bg-neutral-200 lg:hidden"
          aria-label="Abrir menú"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-30 bg-navy-500/40 backdrop-blur-sm lg:hidden"
            style={{ height: 'calc(100vh - 64px)' }}
            onClick={closeMobileMenu}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[calc(100vh-64px)] overflow-y-auto rounded-b-3xl border-t border-neutral-200 bg-white shadow-2xl"
            >
              <div className="flex flex-col gap-1 p-5">
                {isAuthenticated && user && (
                  <div className="mb-2 flex items-center gap-3 rounded-2xl bg-neutral-200 px-4 py-3">
                    <img src={user.avatarUrl ?? 'https://i.pravatar.cc/100?img=47'} alt="" className="h-10 w-10 rounded-full object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-navy-500">{user.name}</p>
                      <p className="truncate text-xs text-navy-300">{user.email}</p>
                    </div>
                  </div>
                )}

                {!isAuthenticated && navItems.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    end={false}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-medium transition-colors',
                        isActive ? 'bg-gold-100 text-navy-500' : 'text-navy-300 hover:bg-neutral-100',
                      )
                    }
                  >
                    {item.label}
                    <span className="text-navy-300">→</span>
                  </NavLink>
                ))}

                {isAuthenticated && (
                  <>
                    <MobileNavLink to="/inicio" icon={UserRound} label="Inicio" onClose={closeMobileMenu} />
                    <MobileNavLink to="/mis-certificaciones" icon={FileText} label="Mis certificaciones" onClose={closeMobileMenu} />
                    <MobileNavLink to="/mi-perfil" icon={UserRound} label="Mi perfil" onClose={closeMobileMenu} />
                    <MobileNavLink to="/configuracion" icon={SettingsIcon} label="Configuración" onClose={closeMobileMenu} />
                  </>
                )}

                <div className="mt-4 flex flex-col gap-2 border-t border-neutral-200 pt-4">
                  {!isAuthenticated && (
                    <>
                      <Link
                        to="/login"
                        onClick={closeMobileMenu}
                        className={cn(buttonVariants({ variant: 'outlineNavy', size: 'lg' }), 'w-full')}
                      >
                        <LogIn className="h-4 w-4" />
                        Acceder
                      </Link>
                      <Link
                        to="/certificar"
                        onClick={closeMobileMenu}
                        className={cn(buttonVariants({ variant: 'gold', size: 'lg' }), 'w-full')}
                      >
                        Certificar Producto
                      </Link>
                      <Link
                        to="/verificar"
                        onClick={closeMobileMenu}
                        className={cn(buttonVariants({ variant: 'navy', size: 'lg' }), 'w-full')}
                      >
                        Verificar Certificado
                      </Link>
                    </>
                  )}
                  {isAuthenticated && (
                    <button
                      type="button"
                      onClick={() => {
                        closeMobileMenu()
                        navigate('/login', { replace: true })
                        clearSession()
                        toast.success('Sesión cerrada')
                      }}
                      className="flex items-center justify-center gap-2 rounded-full bg-error-100 px-5 py-3 text-sm font-semibold text-error-400 transition-colors hover:bg-error-200"
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar sesión
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  )
}

function MenuItem({ to, icon: Icon, label }: { to: string; icon: typeof UserRound; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-navy-500 transition-colors hover:bg-neutral-100"
      role="menuitem"
    >
      <Icon className="h-4 w-4 text-navy-300" />
      {label}
    </Link>
  )
}

function formatRelativeShort(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'recién'
  if (mins < 60) return `hace ${mins}min`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `hace ${hrs}h`
  const days = Math.round(hrs / 24)
  return `hace ${days}d`
}

function MobileNavLink({
  to,
  icon: Icon,
  label,
  onClose,
}: {
  to: string
  icon: typeof UserRound
  label: string
  onClose: () => void
}) {
  return (
    <NavLink
      to={to}
      onClick={onClose}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium transition-colors',
          isActive ? 'bg-gold-100 text-navy-500' : 'text-navy-300 hover:bg-neutral-100',
        )
      }
    >
      <Icon className="h-5 w-5" />
      {label}
    </NavLink>
  )
}
