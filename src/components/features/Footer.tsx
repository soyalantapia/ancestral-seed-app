import { Link } from 'react-router-dom'
import { Facebook, FileText, Globe, Instagram, Linkedin, Twitter } from 'lucide-react'
import { Logo } from './Logo'
import { LEGAL_ENTITY, OFFICIAL_DOCS } from '@/lib/copy'

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
                {/* Fix SM2 (#PUB-31): "Q&A" rompía el tono — el resto
                    usa "Ayuda" (y la ruta es /ayuda). */}
                <Link to="/ayuda" className="transition-colors hover:text-gold-400">
                  Ayuda
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <ul className="flex flex-col gap-4 text-base text-white">
              <li>
                <a
                  href={`mailto:${LEGAL_ENTITY.email}?subject=Consulta%20desde%20la%20web`}
                  className="transition-colors hover:text-gold-400"
                >
                  {LEGAL_ENTITY.email}
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/5491100000000?text=Hola%20Ancestral%20Seed"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-gold-400"
                >
                  WhatsApp soporte
                </a>
              </li>
              {/* Documentación oficial — Reglamento 1.4 obliga a que esté
                  disponible electrónicamente para los usuarios. */}
              <li>
                <a
                  href={`${import.meta.env.BASE_URL}${OFFICIAL_DOCS.reglamentoMarca.path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition-colors hover:text-gold-400"
                >
                  <FileText className="h-4 w-4" strokeWidth={1.85} />
                  {OFFICIAL_DOCS.reglamentoMarca.title}
                </a>
              </li>
            </ul>
            {/* Fix QW-C1 (auditoría UX): el selector de idioma estaba
                visible y sin onChange — cambiar la opción no hacía
                nada (affordance falso). Lo reemplazamos por un chip
                informativo "Disponible en español · Multilingüe próximo"
                que respeta la realidad sin perder la señal de que el
                producto piensa Latam-wide. Cuando entre i18n real, va
                de vuelta el select con onChange y router localizado. */}
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs text-white/85 ring-1 ring-white/20">
              <Globe className="h-3.5 w-3.5 text-gold-400" aria-hidden />
              <span>
                Disponible en español ·{' '}
                <span className="text-white/60">multilingüe próximo</span>
              </span>
            </div>
          </div>
        </div>

        {/* Datos del Organismo de Certificación según Reglamento 1.2 —
            obligatorios a estar disponibles para los usuarios. */}
        <div className="mt-10 border-t border-navy-300/40 pt-5 text-xs text-neutral-400">
          <p className="leading-relaxed">
            Organismo de Certificación · <span className="font-semibold text-white">{LEGAL_ENTITY.name}</span>{' '}
            · {LEGAL_ENTITY.address} · <a href={`tel:${LEGAL_ENTITY.phone.replace(/\s/g, '')}`} className="hover:text-gold-400">{LEGAL_ENTITY.phone}</a>
          </p>
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} Ancestral Seed — Todos los derechos reservados</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <Link to="/legal/legislacion" className="hover:text-gold-400">
                Legislación
              </Link>
              <Link to="/legal/terminos" className="hover:text-gold-400">
                Términos y condiciones
              </Link>
              <Link to="/legal/privacidad" className="hover:text-gold-400">
                Políticas y privacidad
              </Link>
              <Link to="/legal/cookies" className="hover:text-gold-400">
                Políticas de Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

