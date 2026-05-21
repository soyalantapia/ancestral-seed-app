import { Link, useLocation } from 'react-router-dom'
import {
  Compass,
  FileSearch,
  HelpCircle,
  Home,
  Search,
  ShieldCheck,
  Sprout,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Sugerencias de rutas según el "intent" detectado en el path roto.
 * Si el user buscó algo como /certificad/xxx → sugerimos directorio +
 * verify. Si fue /tutor/xxx → sugerimos tutor dashboard.
 */
function suggestionsFor(pathname: string) {
  const lower = pathname.toLowerCase()
  if (lower.includes('certificad') || lower.includes('cert/')) {
    return [
      { to: '/directorio', icon: FileSearch, label: 'Ver directorio público' },
      { to: '/verificar', icon: ShieldCheck, label: 'Verificar un certificado' },
    ]
  }
  if (lower.includes('tutor')) {
    return [
      { to: '/tutor/dashboard', icon: Compass, label: 'Panel del tutor' },
      { to: '/tutor/casos', icon: FileSearch, label: 'Mis casos' },
    ]
  }
  if (lower.includes('perfil') || lower.includes('autor')) {
    return [
      { to: '/directorio', icon: FileSearch, label: 'Ver directorio' },
      { to: '/inicio', icon: Home, label: 'Tu panel' },
    ]
  }
  return [
    { to: '/directorio', icon: FileSearch, label: 'Ver directorio' },
    { to: '/ayuda', icon: HelpCircle, label: 'Centro de ayuda' },
  ]
}

export default function NotFound() {
  const { pathname } = useLocation()
  const suggestions = suggestionsFor(pathname)
  return (
    <main className="flex min-h-screen items-center justify-center bg-pattern-gold px-6 py-10 text-center">
      <div className="w-full max-w-2xl rounded-3xl border border-neutral-200 bg-white px-8 py-12 shadow-xl md:px-16 md:py-16">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-100 text-gold-700">
          <Sprout className="h-8 w-8" />
        </div>
        <p className="mt-6 text-sm uppercase tracking-[0.32em] text-gold-700">
          404
        </p>
        <h1 className="mt-3 text-2xl font-bold text-navy-500 md:text-[32px]">
          Esta semilla no germinó
        </h1>
        <p className="mt-3 text-sm text-navy-300">
          La página que buscás no existe o fue movida.
        </p>
        {pathname && pathname !== '/' && (
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-[11px] text-navy-400">
            <Search className="h-3 w-3" />
            <span className="font-mono">{pathname}</span>
          </p>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className={cn(buttonVariants({ variant: 'gold', size: 'lg' }))}
          >
            Volver al inicio
          </Link>
          <a
            href="mailto:soporte@ancestralseed.org?subject=P%C3%A1gina%20no%20encontrada"
            className={cn(
              buttonVariants({ variant: 'outlineNavy', size: 'lg' }),
            )}
          >
            Reportar
          </a>
        </div>

        {/* Sugerencias contextuales según el path roto */}
        <div className="mt-10 border-t border-neutral-200 pt-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-navy-300">
            Quizás te interesa
          </p>
          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {suggestions.map((s) => {
              const Icon = s.icon
              return (
                <li key={s.to}>
                  <Link
                    to={s.to}
                    className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 text-left text-sm text-navy-500 shadow-sm transition-colors hover:border-gold-300 hover:bg-gold-100/30"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="font-bold">{s.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </main>
  )
}
