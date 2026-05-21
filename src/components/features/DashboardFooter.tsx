import { Link } from 'react-router-dom'
import { CheckCircle2, Mail, MessageCircle } from 'lucide-react'

export function DashboardFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-4 text-xs text-navy-300 md:px-8">
        <div className="flex flex-wrap items-center gap-4">
          <p>© {new Date().getFullYear()} Ancestral Seed</p>
          <span className="hidden h-3 w-px bg-neutral-300 md:block" />
          <span className="inline-flex items-center gap-1.5 font-medium text-success-300">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Plataforma operativa
          </span>
        </div>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-1">
          <a
            href="mailto:soporte@ancestralseed.org"
            className="inline-flex items-center gap-1 font-medium hover:text-navy-500"
            title="Escribinos por email"
          >
            <Mail className="h-3 w-3" />
            soporte@ancestralseed.org
          </a>
          <a
            href="https://wa.me/5491145678901"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium hover:text-navy-500"
            title="Escribinos por WhatsApp"
          >
            <MessageCircle className="h-3 w-3" />
            WhatsApp
          </a>
          <span className="hidden h-3 w-px bg-neutral-300 md:block" />
          <Link to="/ayuda" className="font-medium hover:text-navy-500">
            Ayuda
          </Link>
          <Link to="/legal/terminos" className="hover:text-navy-500">
            Términos
          </Link>
          <Link to="/legal/privacidad" className="hover:text-navy-500">
            Privacidad
          </Link>
          <Link to="/legal/cookies" className="hover:text-navy-500">
            Cookies
          </Link>
          <span className="rounded-full bg-neutral-200 px-2 py-0.5 font-medium text-navy-500">
            v1.0
          </span>
        </nav>
      </div>
    </footer>
  )
}
