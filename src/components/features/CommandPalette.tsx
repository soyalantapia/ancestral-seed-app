import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Bell,
  Briefcase,
  Calendar,
  CreditCard,
  FileBadge2,
  FileText,
  HelpCircle,
  Home,
  LayoutDashboard,
  LogOut,
  Moon,
  Search,
  Settings as SettingsIcon,
  ShieldCheck,
  Sun,
  Users,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { useSettingsStore } from '@/store/settings'
import { cn } from '@/lib/utils'

/**
 * Paleta de comandos global tipo Cmd+K (Linear / Raycast / Notion).
 *
 * Atajos:
 *  - Cmd/Ctrl+K — abrir/cerrar
 *  - Esc — cerrar
 *  - ↑/↓ — navegar
 *  - Enter — ejecutar
 *
 * Items:
 *  - Navegación (rutas)
 *  - Acciones (toggle dark, logout, etc.)
 *  - Filtrado fuzzy simple (substring + score por posición)
 *
 * Diseño:
 *  - Lista plana (no agrupada visualmente; agrupada por section label).
 *  - Ítems dependen del rol: si no es tutor, no muestra /tutor/*.
 *  - Modal overlay con backdrop blur. Mobile: full screen.
 */
interface CommandItem {
  id: string
  label: string
  hint?: string
  group: 'Navegación' | 'Tutor' | 'Cuenta' | 'Acciones'
  icon: typeof Search
  keywords?: string[]
  action: () => void
  // Si el item requiere autenticación o rol específico
  requiresAuth?: boolean
  requiresTutor?: boolean
}

export function CommandPalette() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const isAuth = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const clearSession = useAuthStore((s) => s.clearSession)
  const theme = useSettingsStore((s) => s.theme)
  const updateSettings = useSettingsStore((s) => s.update)

  const isTutor =
    user?.role === 'tutor' ||
    user?.role === 'admin' ||
    user?.roles?.includes('tutor') === true ||
    user?.roles?.includes('admin') === true

  // Toggle con Cmd+K / Ctrl+K (también permite "/" cuando no hay foco en input)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey
      if (isMod && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
      if (e.key === 'Escape' && open) {
        e.preventDefault()
        setOpen(false)
      }
      if (
        e.key === '/' &&
        !open &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  // Auto-focus al abrir + reset
  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIdx(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const items = useMemo<CommandItem[]>(() => {
    const close = () => setOpen(false)
    const go = (to: string) => () => {
      navigate(to)
      close()
    }
    const all: CommandItem[] = [
      // Navegación pública
      { id: 'home', label: 'Inicio (landing)', group: 'Navegación', icon: Home, action: go('/'), keywords: ['home', 'landing', 'portada', 'principal'] },
      { id: 'dir', label: 'Directorio público', group: 'Navegación', icon: Search, action: go('/directorio'), keywords: ['certificados', 'productos', 'buscar', 'encontrar'] },
      { id: 'verify', label: 'Verificar certificado', group: 'Navegación', icon: ShieldCheck, action: go('/verificar'), keywords: ['verificar', 'verificador', 'validar', 'hash', 'qr', 'blockchain', 'comprobar'] },
      { id: 'about', label: 'Nosotros', group: 'Navegación', icon: Users, action: go('/nosotros'), keywords: ['equipo', 'misión', 'about'] },
      { id: 'certify', label: 'Certificar producto', group: 'Navegación', icon: FileBadge2, action: go('/certificar'), keywords: ['nuevo', 'crear', 'iniciar', 'formulario', 'solicitar', 'postular'] },

      // Solicitante
      { id: 'dashboard', label: 'Mi panel', group: 'Cuenta', icon: LayoutDashboard, action: go('/inicio'), requiresAuth: true, keywords: ['dashboard', 'panel', 'inicio', 'home'] },
      { id: 'my-certs', label: 'Mis certificaciones', group: 'Cuenta', icon: FileBadge2, action: go('/mis-certificaciones'), requiresAuth: true, keywords: ['certificar', 'solicitudes', 'requests'] },
      { id: 'docs', label: 'Documentos', group: 'Cuenta', icon: FileText, action: go('/documentos'), requiresAuth: true, keywords: ['pdf', 'evidencias', 'facturas', 'archivos'] },
      { id: 'pagos', label: 'Pagos y facturas', group: 'Cuenta', icon: CreditCard, action: go('/pagos'), requiresAuth: true, keywords: ['cobros', 'facturación', 'billing'] },
      { id: 'cal', label: 'Calendario', group: 'Cuenta', icon: Calendar, action: go('/calendario'), requiresAuth: true, keywords: ['agenda', 'reuniones', 'meetings'] },
      { id: 'notifs', label: 'Notificaciones', group: 'Cuenta', icon: Bell, action: go('/notificaciones'), requiresAuth: true, keywords: ['avisos', 'alertas'] },
      { id: 'profile', label: 'Mi perfil', group: 'Cuenta', icon: Users, action: go('/mi-perfil'), requiresAuth: true, keywords: ['cuenta', 'datos', 'usuario'] },
      { id: 'settings', label: 'Configuración', group: 'Cuenta', icon: SettingsIcon, action: go('/configuracion'), requiresAuth: true, keywords: ['ajustes', 'preferencias', 'settings'] },
      { id: 'help', label: 'Ayuda', group: 'Cuenta', icon: HelpCircle, action: go('/ayuda'), requiresAuth: true, keywords: ['soporte', 'faq', 'preguntas'] },

      // Tutor
      { id: 't-dash', label: 'Tutor — Dashboard', group: 'Tutor', icon: LayoutDashboard, action: go('/tutor/dashboard'), requiresAuth: true, requiresTutor: true },
      { id: 't-casos', label: 'Tutor — Casos (kanban)', group: 'Tutor', icon: Briefcase, action: go('/tutor/casos'), requiresAuth: true, requiresTutor: true },
      { id: 't-tareas', label: 'Tutor — Mis tareas', group: 'Tutor', icon: Calendar, action: go('/tutor/tareas'), requiresAuth: true, requiresTutor: true },
      { id: 't-agenda', label: 'Tutor — Agenda', group: 'Tutor', icon: Calendar, action: go('/tutor/agenda'), requiresAuth: true, requiresTutor: true },
      { id: 't-certs', label: 'Tutor — Certificaciones', group: 'Tutor', icon: FileBadge2, action: go('/tutor/certificaciones'), requiresAuth: true, requiresTutor: true },

      // Acciones
      {
        id: 'toggle-theme',
        label: theme === 'dark' ? 'Cambiar a tema claro' : theme === 'light' ? 'Cambiar a tema oscuro' : 'Tema del sistema',
        hint: theme.toUpperCase(),
        group: 'Acciones',
        icon: theme === 'dark' ? Sun : Moon,
        keywords: ['theme', 'dark', 'light', 'modo'],
        action: () => {
          const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
          updateSettings({ theme: nextTheme })
          close()
        },
      },
      ...(isAuth
        ? [
            {
              id: 'logout',
              label: 'Cerrar sesión',
              group: 'Acciones' as const,
              icon: LogOut,
              action: () => {
                clearSession()
                navigate('/login', { replace: true })
                close()
              },
            },
          ]
        : []),
    ]
    return all.filter((i) => {
      if (i.requiresAuth && !isAuth) return false
      if (i.requiresTutor && !isTutor) return false
      return true
    })
  }, [navigate, isAuth, isTutor, theme, updateSettings, clearSession])

  const filtered = useMemo(() => {
    if (!query.trim()) return items
    const q = query.toLowerCase()
    return items
      .map((i) => {
        const hay = `${i.label} ${i.group} ${(i.keywords ?? []).join(' ')}`.toLowerCase()
        const idx = hay.indexOf(q)
        return { item: i, score: idx === -1 ? Infinity : idx }
      })
      .filter((x) => x.score !== Infinity)
      .sort((a, b) => a.score - b.score)
      .map((x) => x.item)
  }, [items, query])

  // Reset active index al filtrar
  useEffect(() => {
    setActiveIdx(0)
  }, [query])

  if (!open) return null

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      filtered[activeIdx]?.action()
    }
  }

  // Agrupar para el render
  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    acc[item.group] = acc[item.group] ?? []
    acc[item.group].push(item)
    return acc
  }, {})

  return (
    <div
      role="dialog"
      aria-label="Paleta de comandos"
      aria-modal
      className="fixed inset-0 z-[60] flex items-start justify-center bg-navy-500/40 px-4 pt-[10vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-neutral-200 px-4 py-3">
          <Search className="h-4 w-4 text-navy-300" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Buscar acciones, páginas, comandos…"
            className="flex-1 bg-transparent text-sm text-navy-500 placeholder:text-navy-300 focus:outline-none"
          />
          <kbd className="rounded border border-neutral-300 bg-neutral-100 px-1.5 py-0.5 text-[10px] font-bold text-navy-500">
            ESC
          </kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-navy-300">
              Sin resultados para "{query}".
            </p>
          ) : (
            Object.entries(grouped).map(([group, list]) => (
              <div key={group}>
                <p className="px-4 pb-1 pt-3 text-[10px] font-bold uppercase tracking-widest text-navy-300">
                  {group}
                </p>
                {list.map((item) => {
                  const globalIdx = filtered.indexOf(item)
                  const active = globalIdx === activeIdx
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => item.action()}
                      onMouseEnter={() => setActiveIdx(globalIdx)}
                      className={cn(
                        'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                        active
                          ? 'bg-gold-100 text-navy-500'
                          : 'text-navy-500 hover:bg-neutral-100',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                          active ? 'bg-gold-500 text-navy-500' : 'bg-neutral-100 text-navy-500',
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="flex-1 font-semibold">{item.label}</span>
                      {item.hint && (
                        <span className="text-[10px] font-bold text-navy-300">
                          {item.hint}
                        </span>
                      )}
                      <ArrowRight className="h-3.5 w-3.5 text-navy-300" />
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-neutral-200 bg-neutral-100/40 px-4 py-2 text-[10px] text-navy-300">
          <span>
            <kbd className="rounded border border-neutral-300 bg-white px-1 font-bold text-navy-500">↑↓</kbd>{' '}
            navegar
            <span className="mx-2">·</span>
            <kbd className="rounded border border-neutral-300 bg-white px-1 font-bold text-navy-500">↵</kbd>{' '}
            elegir
          </span>
          <span>
            <kbd className="rounded border border-neutral-300 bg-white px-1 font-bold text-navy-500">⌘K</kbd>{' '}
            abrir
          </span>
        </div>
      </div>
    </div>
  )
}
