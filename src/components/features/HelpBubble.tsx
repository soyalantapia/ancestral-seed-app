import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, BookOpen, Headphones, HelpCircle, Mail, MessageSquare, X } from 'lucide-react'
import { useEscape } from '@/hooks/useEscape'

export function HelpBubble() {
  const [open, setOpen] = useState(false)
  useEscape(open, () => setOpen(false))

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-navy-500 text-white shadow-lg shadow-navy-500/30 transition-all hover:scale-105 hover:bg-navy-400"
        aria-label="Ayuda"
      >
        {open ? <X className="h-5 w-5" /> : <HelpCircle className="h-5 w-5" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-40 w-80 overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl"
          >
            <div className="bg-pattern-aztec px-5 py-5 text-white">
              <p className="text-xs font-bold uppercase tracking-widest text-gold-400">
                Necesitás ayuda
              </p>
              <h3 className="mt-1 text-lg font-bold">Estamos para ayudarte</h3>
              <p className="mt-1 text-xs text-neutral-300">
                Tiempo de respuesta promedio: 2-4 horas hábiles
              </p>
            </div>

            <ul className="p-2">
              <HelpItem
                icon={BookOpen}
                to="/ayuda"
                title="Centro de ayuda"
                subtitle="Guías paso a paso y FAQ"
                onClick={() => setOpen(false)}
              />
              {/* Fix #FEAT-17 (análisis proyecto): el item "Chat con
                  soporte" mentía — linkeaba a /ayuda sin chat real.
                  Cambiado a "Centro de ayuda" honest. Cuando se
                  integre un widget de chat (Crisp/Intercom),
                  reactivar con copy "Chat en vivo". */}
              <HelpItem
                icon={MessageSquare}
                to="/ayuda"
                title="FAQ y guías"
                subtitle="Buscá tu duda en el glosario y los plazos"
                onClick={() => setOpen(false)}
              />
              <HelpItem
                icon={Mail}
                to="mailto:ancestralseed@email.com"
                external
                title="Mandanos un email"
                subtitle="ancestralseed@email.com"
                onClick={() => setOpen(false)}
              />
              <HelpItem
                icon={Headphones}
                to="/mis-certificaciones"
                title="Hablar con mi tutor"
                subtitle="Reuniones programadas"
                onClick={() => setOpen(false)}
              />
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function HelpItem({
  icon: Icon,
  title,
  subtitle,
  to,
  external,
  onClick,
}: {
  icon: typeof HelpCircle
  title: string
  subtitle: string
  to: string
  external?: boolean
  onClick?: () => void
}) {
  const content = (
    <>
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-100 text-gold-700">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-navy-500">{title}</p>
        <p className="mt-0.5 text-xs text-navy-300">{subtitle}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-navy-300" />
    </>
  )
  const className =
    'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-neutral-100'

  if (external) {
    return (
      <li>
        <a href={to} onClick={onClick} className={className}>
          {content}
        </a>
      </li>
    )
  }
  return (
    <li>
      <Link to={to} onClick={onClick} className={className}>
        {content}
      </Link>
    </li>
  )
}
