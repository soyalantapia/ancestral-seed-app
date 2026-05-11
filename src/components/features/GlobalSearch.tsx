import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Bell,
  FileText,
  HelpCircle,
  Search,
  Settings,
  UserRound,
  X,
} from 'lucide-react'
import { mockCertificationRequests } from '@/services/mocks/data'
import { useNotificationsStore } from '@/store/notifications'
import { cn } from '@/lib/utils'

type ResultKind = 'cert' | 'notif' | 'page'

interface Result {
  id: string
  kind: ResultKind
  title: string
  subtitle?: string
  to: string
  icon: typeof Search
}

const staticPages: Result[] = [
  { id: 'p-inicio', kind: 'page', title: 'Inicio', subtitle: 'Panel principal', to: '/inicio', icon: UserRound },
  { id: 'p-certs', kind: 'page', title: 'Mis certificaciones', subtitle: 'Solicitudes y estados', to: '/mis-certificaciones', icon: FileText },
  { id: 'p-notif', kind: 'page', title: 'Notificaciones', to: '/notificaciones', icon: Bell },
  { id: 'p-profile', kind: 'page', title: 'Mi perfil', subtitle: 'Datos personales y comunidad', to: '/mi-perfil', icon: UserRound },
  { id: 'p-settings', kind: 'page', title: 'Configuración', subtitle: 'Seguridad, privacidad, pagos', to: '/configuracion', icon: Settings },
  { id: 'p-help', kind: 'page', title: 'Ayuda', to: '/ayuda', icon: HelpCircle },
  { id: 'p-cert', kind: 'page', title: 'Iniciar nueva certificación', subtitle: 'Comenzar formulario', to: '/certificar', icon: FileText },
]

export function GlobalSearch({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const notifications = useNotificationsStore((s) => s.items)

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      // small delay so it's focusable after mount
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const results: Result[] = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      return staticPages.slice(0, 5)
    }
    const out: Result[] = []
    // pages
    for (const p of staticPages) {
      if (p.title.toLowerCase().includes(q) || p.subtitle?.toLowerCase().includes(q)) {
        out.push(p)
      }
    }
    // certifications
    for (const r of mockCertificationRequests) {
      if (
        r.productName.toLowerCase().includes(q) ||
        r.number.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
      ) {
        out.push({
          id: r.id,
          kind: 'cert',
          title: r.productName,
          subtitle: `Solicitud ${r.number} · ${r.status}`,
          to: `/mis-certificaciones/${r.id}`,
          icon: FileText,
        })
      }
    }
    // notifications
    for (const n of notifications.slice(0, 10)) {
      if (n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)) {
        out.push({
          id: n.id,
          kind: 'notif',
          title: n.title,
          subtitle: n.body.slice(0, 60),
          to: n.link ?? '/notificaciones',
          icon: Bell,
        })
      }
    }
    return out.slice(0, 8)
  }, [query, notifications])

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0)
  }, [results.length])

  const handleSelect = (r: Result) => {
    navigate(r.to)
    onClose()
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(results.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const r = results[activeIndex]
      if (r) handleSelect(r)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[60] flex items-start justify-center bg-navy-500/40 px-4 pt-20 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -16, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -16, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-xl overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKey}
          >
            <div className="flex items-center gap-3 border-b border-neutral-200 px-5 py-4">
              <Search className="h-5 w-5 shrink-0 text-navy-300" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar certificaciones, páginas, notificaciones…"
                className="flex-1 bg-transparent text-sm text-navy-500 placeholder:text-navy-300 focus:outline-none"
              />
              <kbd className="hidden rounded border border-neutral-300 bg-neutral-100 px-2 py-0.5 text-[10px] font-bold text-navy-300 md:inline">
                ESC
              </kbd>
              <button
                type="button"
                onClick={onClose}
                className="md:hidden text-navy-300 hover:text-navy-500"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {results.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <Search className="mx-auto h-7 w-7 text-navy-300" strokeWidth={1.5} />
                <p className="mt-3 text-sm font-semibold text-navy-500">
                  Sin resultados para "{query}"
                </p>
                <p className="mt-1 text-xs text-navy-300">
                  Probá con otra palabra o navegá desde el menú lateral.
                </p>
              </div>
            ) : (
              <ul className="max-h-[60vh] overflow-y-auto py-2">
                {!query && (
                  <li className="px-4 pb-2 pt-1 text-[10px] font-bold uppercase tracking-widest text-navy-300">
                    Accesos rápidos
                  </li>
                )}
                {results.map((r, i) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(r)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={cn(
                        'flex w-full items-center gap-3 px-5 py-3 text-left transition-colors',
                        i === activeIndex ? 'bg-gold-100' : 'hover:bg-neutral-100',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                          r.kind === 'cert' && 'bg-info-100 text-info-400',
                          r.kind === 'notif' && 'bg-warning-100 text-warning-400',
                          r.kind === 'page' && 'bg-neutral-200 text-navy-500',
                        )}
                      >
                        <r.icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-navy-500">{r.title}</p>
                        {r.subtitle && (
                          <p className="mt-0.5 truncate text-xs text-navy-300">{r.subtitle}</p>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 text-navy-300" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex items-center justify-between gap-3 border-t border-neutral-200 bg-neutral-100 px-5 py-3 text-[10px] text-navy-300">
              <div className="flex items-center gap-3">
                <span>
                  <kbd className="rounded border border-neutral-300 bg-white px-1.5 py-0.5 font-bold">↑↓</kbd>{' '}
                  navegar
                </span>
                <span>
                  <kbd className="rounded border border-neutral-300 bg-white px-1.5 py-0.5 font-bold">↵</kbd>{' '}
                  abrir
                </span>
              </div>
              <Link
                to="/ayuda"
                onClick={onClose}
                className="font-semibold text-gold-700 hover:underline"
              >
                ¿No encontrás algo?
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
