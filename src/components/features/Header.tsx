import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Logo } from './Logo'
import { Button, buttonVariants } from '@/components/ui/button'
import { useUiStore } from '@/store/ui'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Beneficios', match: '/' },
  { to: '/#como-funciona', label: '¿Cómo funciona?', match: '#como-funciona' },
  { to: '/directorio', label: 'Certificados', match: '/directorio' },
]

export function Header() {
  const navigate = useNavigate()
  const isMobileMenuOpen = useUiStore((s) => s.isMobileMenuOpen)
  const toggleMobileMenu = useUiStore((s) => s.toggleMobileMenu)
  const closeMobileMenu = useUiStore((s) => s.closeMobileMenu)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="mx-auto flex h-16 max-w-[1320px] items-center gap-6 px-4 md:h-20 md:px-8">
        <Link to="/" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden flex-1 items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'text-sm font-medium transition-colors',
                  isActive
                    ? 'text-navy-500'
                    : 'text-navy-300 hover:text-navy-500',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-3 lg:flex">
          <Button variant="gold" size="md" onClick={() => navigate('/certificar')}>
            Certificar Producto
          </Button>
          <Button
            variant="navy"
            size="md"
            onClick={() => navigate('/verificar')}
          >
            Verificar Certificado
          </Button>
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
              className="overflow-y-auto rounded-b-3xl border-t border-neutral-200 bg-white shadow-2xl"
            >
              <div className="flex flex-col gap-1 p-5">
                {navItems.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center justify-between rounded-xl px-4 py-3.5 text-base font-medium transition-colors',
                        isActive
                          ? 'bg-gold-100 text-navy-500'
                          : 'text-navy-300 hover:bg-neutral-100',
                      )
                    }
                  >
                    {item.label}
                    <span className="text-navy-300">→</span>
                  </NavLink>
                ))}
                <div className="mt-4 flex flex-col gap-2 border-t border-neutral-200 pt-4">
                  <Link
                    to="/certificar"
                    onClick={closeMobileMenu}
                    className={cn(
                      buttonVariants({ variant: 'gold', size: 'lg' }),
                      'w-full',
                    )}
                  >
                    Certificar Producto
                  </Link>
                  <Link
                    to="/verificar"
                    onClick={closeMobileMenu}
                    className={cn(
                      buttonVariants({ variant: 'navy', size: 'lg' }),
                      'w-full',
                    )}
                  >
                    Verificar Certificado
                  </Link>
                </div>
                <div className="mt-6 border-t border-neutral-200 pt-4 text-center">
                  <p className="text-xs text-navy-300">
                    ¿Tenés dudas?{' '}
                    <a
                      href="mailto:ancestralseed@email.com"
                      className="font-semibold text-gold-700 hover:underline"
                    >
                      Contactanos
                    </a>
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
