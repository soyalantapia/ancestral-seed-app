import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Logo } from './Logo'
import { Input } from '@/components/ui/input'

export function Footer() {
  return (
    <footer className="bg-pattern-aztec text-white">
      <div className="mx-auto max-w-[1320px] px-4 py-12 md:px-8 md:py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4">
            <Logo variant="light" layout="vertical" />
            <div className="mt-6 flex justify-start gap-3 md:justify-center">
              <SocialLink label="Facebook" path="M22 12a10 10 0 10-11.6 9.9V14.9H8v-3h2.4v-2.3c0-2.4 1.4-3.7 3.6-3.7 1 0 2 .2 2 .2v2.3h-1.2c-1.2 0-1.6.8-1.6 1.5v1.9H16l-.4 3h-2.2V22A10 10 0 0022 12z" />
              <SocialLink label="Instagram" path="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.6 15.6 2.6 15.2 2.6 12s0-3.5.1-4.7c.1-1.1.2-1.7.4-2.1.2-.5.4-.9.8-1.3.4-.4.8-.6 1.3-.8.4-.2 1-.3 2.1-.4 1.2-.1 1.5-.1 4.7-.1zm0 5.2a4.6 4.6 0 100 9.2 4.6 4.6 0 000-9.2zm0 7.6a3 3 0 110-6 3 3 0 010 6zm5.9-7.8a1.1 1.1 0 11-2.2 0 1.1 1.1 0 012.2 0z" />
              <SocialLink label="LinkedIn" path="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5V9h3v10zM6.5 7.5a1.7 1.7 0 110-3.4 1.7 1.7 0 010 3.4zM19 19h-3v-5.5c0-1.4-.5-2.3-1.7-2.3-1 0-1.5.6-1.8 1.3-.1.2-.1.5-.1.8V19h-3V9h3v1.4c.4-.6 1.1-1.6 2.7-1.6 2 0 3.4 1.3 3.4 4V19z" />
              <SocialLink label="YouTube" path="M21.6 7.2a2.5 2.5 0 00-1.7-1.8C18.4 5 12 5 12 5s-6.4 0-7.9.4A2.5 2.5 0 002.4 7.2 26 26 0 002 12a26 26 0 00.4 4.8 2.5 2.5 0 001.7 1.8c1.5.4 7.9.4 7.9.4s6.4 0 7.9-.4a2.5 2.5 0 001.7-1.8A26 26 0 0022 12a26 26 0 00-.4-4.8zM10 15V9l5.2 3-5.2 3z" />
            </div>
          </div>

          <div className="md:col-span-3">
            <p className="text-sm leading-relaxed text-neutral-400">
              Validamos la autenticidad de productos y saberes originarios
              mediante un sistema de certificación cultural, auditoría y
              tecnología blockchain.
            </p>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-sm font-semibold text-white">Beneficios</h4>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm text-neutral-400">
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
            <ul className="flex flex-col gap-2 text-sm text-neutral-300">
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
            <div className="mt-4 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <Input
                  placeholder="Buscar"
                  className="h-10 border-navy-300 bg-navy-700/60 pl-9 text-sm text-white placeholder:text-neutral-400 focus-visible:border-gold-500"
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

function SocialLink({ label, path }: { label: string; path: string }) {
  return (
    <a
      href="#"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 text-navy-500 transition-all hover:scale-110 hover:bg-gold-400"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
        <path d={path} />
      </svg>
    </a>
  )
}
