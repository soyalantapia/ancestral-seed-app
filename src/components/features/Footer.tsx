import { Link } from 'react-router-dom'
import { ChevronDown, Search } from 'lucide-react'
import { Logo } from './Logo'
import { Input } from '@/components/ui/input'

export function Footer() {
  return (
    <footer className="bg-pattern-aztec text-white">
      <div className="mx-auto max-w-[1320px] px-4 py-16 md:px-8 md:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-3">
            <Logo variant="light" layout="vertical" className="items-start text-left" markClassName="h-32 w-32" />
            <div className="mt-7 flex gap-3">
              <span className="block h-7 w-7 rounded-full bg-gold-500" aria-hidden />
              <span className="block h-7 w-7 rounded-full bg-gold-500" aria-hidden />
              <span className="block h-7 w-7 rounded-full bg-gold-500" aria-hidden />
              <span className="block h-7 w-7 rounded-full bg-gold-500" aria-hidden />
            </div>
          </div>

          <div className="md:col-span-3">
            <p className="text-base leading-relaxed text-white">
              Validamos la autenticidad de productos y saberes originarios
              mediante un sistema de certificación cultural, auditoría y
              tecnología blockchain.
            </p>
          </div>

          <div className="md:col-span-3">
            <ul className="flex flex-col gap-4 text-base text-white">
              <li>
                <Link to="/" className="transition-colors hover:text-gold-400">
                  Beneficios
                </Link>
              </li>
              <li>
                <Link to="/" className="transition-colors hover:text-gold-400">
                  ¿Cómo funciona?
                </Link>
              </li>
              <li>
                <Link
                  to="/directorio"
                  className="transition-colors hover:text-gold-400"
                >
                  Certificados
                </Link>
              </li>
              <li>
                <Link to="/" className="transition-colors hover:text-gold-400">
                  Q&amp;A
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <ul className="flex flex-col gap-4 text-base text-white">
              <li>
                <a
                  href="mailto:ancestralseed@email.com"
                  className="transition-colors hover:text-gold-400"
                >
                  ancestralseed@email.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+11243-5678"
                  className="transition-colors hover:text-gold-400"
                >
                  +1 1243-5678
                </a>
              </li>
            </ul>
            <div className="mt-6">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
                <Input
                  placeholder="Buscar"
                  className="h-12 rounded-full border-0 bg-white pl-11 pr-11 text-sm text-navy-500 placeholder:text-navy-300 focus-visible:ring-2 focus-visible:ring-gold-500/40"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-navy-300/40 pt-5 text-xs text-neutral-400 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Ancestral Seeds — Todos los derechos reservados</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link to="/" className="hover:text-gold-400">
              Términos y condiciones
            </Link>
            <Link to="/" className="hover:text-gold-400">
              Políticas y privacidad
            </Link>
            <Link to="/" className="hover:text-gold-400">
              Políticas de Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

