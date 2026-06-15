import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Award,
  Bell,
  Calendar,
  CalendarClock,
  CheckCheck,
  ChevronDown,
  FileCheck2,
  Kanban,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  User as UserIcon,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Logo } from './Logo'
import { ErrorBoundary } from './ErrorBoundary'
import { SkipToContent } from './SkipToContent'
import { CommandPalette } from './CommandPalette'
import { GuidedTour } from './GuidedTour'
import { PageMeta } from './PageMeta'
import { useEscape } from '@/hooks/useEscape'
import { useAuthStore } from '@/store/auth'
import { resetDemoStores } from '@/store/resetDemo'
import {
  mockIssuedCertifications,
  mockTutor,
  mockTutorCases,
  mockTutorNotifications,
} from '@/services/mocks/data'
import type { TutorNotificationKind } from '@/types'
import { cn } from '@/lib/utils'

const operationsItems = [
  { to: '/tutor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tutor/casos', icon: Kanban, label: 'Casos' },
  { to: '/tutor/tareas', icon: ListChecks, label: 'Mis tareas' },
  { to: '/tutor/agenda', icon: Calendar, label: 'Agenda' },
]

const managementItems = [
  { to: '/tutor/certificaciones', icon: Award, label: 'Certificaciones' },
]

export function TutorLayout() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const clearSession = useAuthStore((s) => s.clearSession)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [notifications, setNotifications] = useState(mockTutorNotifications)
  const unread = notifications.filter((n) => !n.read).length

  // Cierro dropdowns al click outside
  useEffect(() => {
    if (!bellOpen && !searchFocused) return
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-bell]')) setBellOpen(false)
      if (!target.closest('[data-search]')) setSearchFocused(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [bellOpen, searchFocused])

  // Datos del tutor (fallback al mock)
  const tutorName = user?.name ?? mockTutor.name
  const tutorEmail = user?.email ?? mockTutor.email
  const tutorAvatar = user?.avatarUrl ?? mockTutor.avatarUrl

  useEscape(confirmLogout, () => setConfirmLogout(false))
  useEscape(drawerOpen, () => setDrawerOpen(false))
  useEscape(menuOpen, () => setMenuOpen(false))
  useEscape(bellOpen, () => setBellOpen(false))
  useEscape(searchFocused, () => setSearchFocused(false))

  // Resultados de búsqueda global (mock — casos + certs por id/nombre/solicitante)
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (q.length < 2) return { cases: [], certs: [] }
    const cases = mockTutorCases
      .filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.productName.toLowerCase().includes(q) ||
          c.applicantName.toLowerCase().includes(q),
      )
      .slice(0, 5)
    const certs = mockIssuedCertifications
      .filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.productName.toLowerCase().includes(q) ||
          c.authorName.toLowerCase().includes(q),
      )
      .slice(0, 4)
    return { cases, certs }
  }, [searchQuery])

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    toast.success('Todas marcadas como leídas')
  }
  const markOneRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
  }

  const closeOnNav = () => setDrawerOpen(false)

  const handleLogout = () => {
    setMenuOpen(false)
    setDrawerOpen(false)
    setConfirmLogout(false)
    navigate('/login', { replace: true })
    // Fix V3-POS-05 (auditoría v3): mismo cleanup que DashboardLayout
    // — limpiar los stores del demo antes del clearSession para evitar
    // cross-account leaks.
    resetDemoStores({ forLogout: true })
    clearSession()
    toast.success('Sesión cerrada')
  }

  const Sidebar = (
    <>
      {/* Logo */}
      <div className="border-b border-white/10 px-6 py-5">
        <Logo variant="light" markClassName="h-8 w-8" />
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-6">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
          Operaciones
        </p>
        {operationsItems.map((item) => (
          <SidebarLink key={item.to} {...item} onClose={closeOnNav} />
        ))}
        <p className="mt-6 px-3 pb-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
          Gestión
        </p>
        {managementItems.map((item) => (
          <SidebarLink key={item.to} {...item} onClose={closeOnNav} />
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <NavLink
          to="/mis-certificaciones"
          onClick={closeOnNav}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-neutral-300 transition-colors hover:bg-navy-400 hover:text-white"
        >
          <UserRound className="h-4 w-4" />
          Volver al panel de solicitante
        </NavLink>
        <button
          type="button"
          onClick={() => setConfirmLogout(true)}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-neutral-300 transition-colors hover:bg-navy-400 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-white">
      {/* Fix V3-PUB-02 (auditoría v3): igual que en DashboardLayout,
          el panel del tutor es 100% privado. Aplicamos noindex desde
          el Layout para que TODAS las subrutas (/tutor/dashboard,
          /tutor/casos, /tutor/certificaciones, /tutor/tareas,
          /tutor/agenda) hereden el meta robots. */}
      <PageMeta noindex />
      <SkipToContent />
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col bg-navy-500 text-white md:flex">
        {Sidebar}
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
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <p className="text-sm font-bold uppercase tracking-widest text-neutral-400">
                  Panel de tutor
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
              {Sidebar}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-neutral-200 bg-white px-3 sm:gap-4 sm:px-6">
          {/* Mobile burger */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menú"
            className="flex h-10 w-10 items-center justify-center rounded-full text-navy-500 hover:bg-neutral-100 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search global */}
          <div data-search className="relative max-w-xl flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              placeholder="Buscar caso, solicitante, certificación…"
              className="h-10 w-full rounded-full border border-neutral-200 bg-neutral-100 pl-11 pr-4 text-sm text-navy-500 placeholder:text-navy-300 focus:border-gold-500 focus:bg-white focus:outline-none"
            />
            {/* Search dropdown */}
            <AnimatePresence>
              {searchFocused && searchQuery.trim().length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute left-0 right-0 top-12 z-40 max-h-[420px] overflow-y-auto rounded-2xl border border-neutral-200 bg-white shadow-2xl"
                >
                  {searchResults.cases.length === 0 &&
                  searchResults.certs.length === 0 ? (
                    <div className="p-6 text-center text-sm text-navy-300">
                      Sin resultados para "{searchQuery}".
                    </div>
                  ) : (
                    <>
                      {searchResults.cases.length > 0 && (
                        <div>
                          <p className="px-4 pb-1 pt-3 text-[10px] font-bold uppercase tracking-widest text-navy-300">
                            Casos
                          </p>
                          <ul>
                            {searchResults.cases.map((c) => (
                              <li key={c.id}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigate(`/tutor/casos/${c.id}`)
                                    setSearchFocused(false)
                                    setSearchQuery('')
                                  }}
                                  className="flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-neutral-100"
                                >
                                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-100 text-gold-700">
                                    <Kanban className="h-3.5 w-3.5" />
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-bold text-navy-500">
                                      {c.productName}
                                    </p>
                                    <p className="truncate text-[11px] text-navy-300">
                                      {c.id} · {c.applicantName}
                                    </p>
                                  </div>
                                  <span className="shrink-0 rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-bold text-navy-500">
                                    {c.stage}
                                  </span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {searchResults.certs.length > 0 && (
                        <div className="border-t border-neutral-200">
                          <p className="px-4 pb-1 pt-3 text-[10px] font-bold uppercase tracking-widest text-navy-300">
                            Certificaciones emitidas
                          </p>
                          <ul>
                            {searchResults.certs.map((c) => (
                              <li key={c.id}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigate(`/tutor/certificaciones`)
                                    setSearchFocused(false)
                                    setSearchQuery('')
                                  }}
                                  className="flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-neutral-100"
                                >
                                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success-100 text-success-300">
                                    <Award className="h-3.5 w-3.5" />
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-bold text-navy-500">
                                      {c.productName}
                                    </p>
                                    <p className="truncate text-[11px] text-navy-300">
                                      {c.id} · {c.authorName}
                                    </p>
                                  </div>
                                  <span className="shrink-0 rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-bold text-navy-500">
                                    {c.status}
                                  </span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bell + avatar */}
          <div className="ml-auto flex items-center gap-2">
            <div data-bell className="relative">
              <button
                type="button"
                onClick={() => setBellOpen((v) => !v)}
                className={cn(
                  'relative flex h-10 w-10 items-center justify-center rounded-full transition-colors',
                  bellOpen
                    ? 'bg-navy-500 text-white'
                    : 'bg-neutral-100 text-navy-500 hover:bg-neutral-200',
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
                    className="absolute right-0 mt-2 w-[360px] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl"
                  >
                    <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
                      <p className="text-sm font-bold text-navy-500">
                        Notificaciones
                      </p>
                      {unread > 0 && (
                        <button
                          type="button"
                          onClick={markAllRead}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700 hover:underline"
                        >
                          <CheckCheck className="h-3.5 w-3.5" />
                          Marcar todas
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <p className="px-4 py-8 text-center text-sm text-navy-300">
                        No tenés notificaciones
                      </p>
                    ) : (
                      <ul className="max-h-96 overflow-y-auto">
                        {notifications.slice(0, 8).map((n) => (
                          <li key={n.id}>
                            <Link
                              to={n.link ?? '/tutor/dashboard'}
                              onClick={() => {
                                markOneRead(n.id)
                                setBellOpen(false)
                              }}
                              className={cn(
                                'flex items-start gap-3 border-b border-neutral-100 px-4 py-3 text-sm transition-colors hover:bg-neutral-100',
                                !n.read && 'bg-gold-100/30',
                              )}
                            >
                              <NotifKindIcon kind={n.kind} />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-navy-500">
                                  {n.title}
                                </p>
                                <p className="mt-0.5 line-clamp-2 text-xs text-navy-300">
                                  {n.body}
                                </p>
                                <p className="mt-1 text-[10px] text-navy-300">
                                  {formatRel(n.at)}
                                </p>
                              </div>
                              {!n.read && (
                                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gold-500" />
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white py-1 pl-1 pr-3 text-sm font-semibold text-navy-500 transition-colors hover:bg-neutral-100"
                aria-expanded={menuOpen}
                aria-label={`Menú de ${tutorName}`}
              >
                <img
                  src={tutorAvatar}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="hidden max-w-[120px] truncate sm:inline">
                  {tutorName}
                </span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform',
                    menuOpen && 'rotate-180',
                  )}
                />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl"
                  >
                    <div className="border-b border-neutral-200 px-4 py-3">
                      <p className="truncate text-sm font-bold text-navy-500">
                        {tutorName}
                      </p>
                      <p className="truncate text-xs text-navy-300">
                        {tutorEmail}
                      </p>
                    </div>
                    <NavLink
                      to="/mis-certificaciones"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-navy-500 transition-colors hover:bg-neutral-100"
                    >
                      <UserIcon className="h-4 w-4 text-navy-300" />
                      Cambiar a solicitante
                    </NavLink>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false)
                        setConfirmLogout(true)
                      }}
                      className="flex w-full items-center gap-2 border-t border-neutral-200 px-4 py-3 text-sm font-semibold text-error-400 transition-colors hover:bg-error-100"
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar sesión
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 focus:outline-none"
        >
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

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
                Vas a salir del panel de tutor.
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

function formatRel(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diff / 60_000)
  if (mins < 1) return 'recién'
  if (mins < 60) return `hace ${mins}min`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `hace ${hrs}h`
  const days = Math.round(hrs / 24)
  if (days < 7) return `hace ${days}d`
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
  })
}

const NOTIF_ICON_META: Record<
  TutorNotificationKind,
  { Icon: typeof Bell; cls: string }
> = {
  new_case_assigned: { Icon: Users, cls: 'bg-info-100 text-info-400' },
  evidence_uploaded: { Icon: FileCheck2, cls: 'bg-gold-100 text-gold-700' },
  applicant_replied: { Icon: MessageSquare, cls: 'bg-success-100 text-success-300' },
  sla_breach: { Icon: TriangleAlert, cls: 'bg-error-100 text-error-400' },
  meeting_reminder: { Icon: CalendarClock, cls: 'bg-info-100 text-info-400' },
  signature_pending: { Icon: ShieldCheck, cls: 'bg-warning-100 text-warning-400' },
  stage_changed: { Icon: Sparkles, cls: 'bg-gold-100 text-gold-700' },
}

function NotifKindIcon({ kind }: { kind: TutorNotificationKind }) {
  const meta = NOTIF_ICON_META[kind]
  const Icon = meta.Icon
  return (
    <span
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
        meta.cls,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
    </span>
  )
}

function SidebarLink({
  to,
  icon: Icon,
  label,
  onClose,
}: {
  to: string
  icon: typeof LayoutDashboard
  label: string
  onClose?: () => void
}) {
  return (
    <NavLink
      to={to}
      onClick={onClose}
      end={false}
      className={({ isActive }) =>
        cn(
          'inline-flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
          isActive
            ? 'bg-white text-navy-500 shadow-sm'
            : 'text-neutral-300 hover:bg-navy-400/60 hover:text-white',
        )
      }
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
      <span className="flex-1">{label}</span>
    </NavLink>
  )
}
