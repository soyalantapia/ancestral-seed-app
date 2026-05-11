import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Sparkles, X } from 'lucide-react'
import { useUiStore } from '@/store/ui'
import { useEscape } from '@/hooks/useEscape'

const STEPS = [
  {
    title: 'Bienvenida 👋',
    body: 'Este es tu panel personal. Acá vas a poder seguir el avance de tus certificaciones de cerca.',
  },
  {
    title: 'Pipeline visual',
    body: 'Cada solicitud pasa por 5 etapas: Prediagnóstico → Inicio → Diagnóstico → Evaluación → Certificación. Te avisamos cuando avance.',
  },
  {
    title: 'Tareas pendientes',
    body: 'Cuando el tutor te pida algo, va a aparecer acá como una tarea con CTA "Resolver" que te lleva directo al tab correcto.',
  },
  {
    title: 'Mensajes con tu tutor',
    body: 'Cada auditoría tiene un thread de conversación. Podés responder, adjuntar evidencias o reprogramar.',
  },
  {
    title: '¿Listo para arrancar?',
    body: 'Explorá el menú lateral. Si te perdés en algún momento, en la sección Ayuda tenés todas las guías.',
  },
]

export function OnboardingTour() {
  const seen = useUiStore((s) => s.dismissedBanners['onboarding-tour'])
  const dismiss = useUiStore((s) => s.dismissBanner)
  const [show, setShow] = useState(false)
  const [step, setStep] = useState(0)

  // Show on first mount if not seen
  useEffect(() => {
    if (!seen) {
      const t = setTimeout(() => setShow(true), 600)
      return () => clearTimeout(t)
    }
  }, [seen])

  const close = () => {
    dismiss('onboarding-tour')
    setShow(false)
  }

  useEscape(show, close)

  if (!show) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[55] flex items-end justify-center bg-navy-500/40 px-4 py-10 backdrop-blur-sm md:items-center"
        onClick={close}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
        >
          <div className="relative bg-pattern-aztec px-6 py-8 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-500 text-navy-500">
              <Sparkles className="h-5 w-5" />
            </div>
            <button
              type="button"
              onClick={close}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Cerrar tour"
            >
              <X className="h-4 w-4" />
            </button>
            <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-gold-400">
              Paso {step + 1} de {STEPS.length}
            </p>
            <h2 className="mt-1 text-xl font-bold">{current.title}</h2>
          </div>
          <div className="px-6 py-6">
            <p className="text-sm leading-relaxed text-navy-500">{current.body}</p>

            {/* Progress */}
            <div className="mt-6 flex gap-1.5">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={
                    'h-1 flex-1 rounded-full transition-colors ' +
                    (i <= step ? 'bg-gold-500' : 'bg-neutral-200')
                  }
                />
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={close}
                className="text-sm font-semibold text-navy-300 hover:text-navy-500"
              >
                Saltar
              </button>
              <button
                type="button"
                onClick={() => (isLast ? close() : setStep((s) => s + 1))}
                className="inline-flex items-center gap-2 rounded-full bg-navy-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-navy-400"
              >
                {isLast ? 'Empezar' : 'Siguiente'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
