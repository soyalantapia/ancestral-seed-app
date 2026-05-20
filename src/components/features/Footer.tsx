import { Link } from 'react-router-dom'
import { Facebook, Globe, Instagram, Linkedin, Twitter } from 'lucide-react'
import { Logo } from './Logo'

const socials = [
  { label: 'Instagram', href: 'https://instagram.com', icon: Instagram },
  { label: 'Facebook', href: 'https://facebook.com', icon: Facebook },
  { label: 'X (Twitter)', href: 'https://x.com', icon: Twitter },
  { label: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin },
]

export function Footer() {
  return (
    <footer className="bg-pattern-aztec text-white">
      <div className="mx-auto max-w-[1320px] px-4 py-16 md:px-8 md:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-3">
            <Logo variant="light" layout="vertical" className="items-start text-left" markClassName="h-32 w-32" />
            <div className="mt-7 flex gap-2.5">
              {socials.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 text-navy-500 transition-colors hover:bg-gold-400"
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            <p className="text-base leading-relaxed text-white">
              Validamos la autenticidad de productos, servicios y saberes
              ancestrales, mediante un sistema de certificación cultural,
              auditoría y tecnología blockchain.
            </p>
          </div>

          <div className="md:col-span-3">
            <ul className="flex flex-col gap-4 text-base text-white">
              <li>
                <Link to="/nosotros" className="transition-colors hover:text-gold-400">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link to="/#beneficios" className="transition-colors hover:text-gold-400">
                  Beneficios
                </Link>
              </li>
              <li>
                <Link to="/#como-funciona" className="transition-colors hover:text-gold-400">
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
                <Link to="/ayuda" className="transition-colors hover:text-gold-400">
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
              <label htmlFor="lang-select" className="sr-only">
                Elegir idioma
              </label>
              <div className="relative">
                <Globe className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
                <select
                  id="lang-select"
                  defaultValue="es-AR"
                  className="h-12 w-full appearance-none rounded-full border-0 bg-white pl-11 pr-10 text-sm font-medium text-navy-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/40 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23334060%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><polyline points=%226 9 12 15 18 9%22/></svg>')] bg-[length:12px_12px] bg-[position:right_16px_center] bg-no-repeat"
                >
                  <option value="es-AR">Español (Argentina)</option>
                  <option value="es-LA">Español (Latam)</option>
                  <option value="en">English</option>
                  <option value="pt-BR">Português (BR)</option>
                </select>
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

