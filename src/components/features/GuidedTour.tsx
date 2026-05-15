import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Lightbulb, Sparkles, X } from 'lucide-react'
import { useOnboardingStore } from '@/store/onboarding'
import { TOURS, type TourStep } from '@/lib/tours'
import { cn } from '@/lib/utils'

/**
 * GuidedTour — sistema de onboarding con spotlight + tooltip contextual.
 *
 * Comportamiento:
 *   1. Lee `activeTour` y `step` del store. Si no hay tour activo, renderea null.
 *   2. Por cada step:
 *      a. Si tiene `route` y la ruta actual difiere, navega.
 *      b. Espera a que el target aparezca en el DOM (poll 50ms, hasta 2s).
 *      c. Si hay target → spotlight (4 overlays oscuros con un agujero) +
 *         tooltip posicionado al lado.
 *      d. Si no hay target o no se encontró → modal centrado.
 *   3. Updatea bounding rect en scroll/resize.
 *   4. Navega entre steps con prev/next del store.
 *
 * Decisiones:
 *   - Sin librerías (floating-ui, popperjs): el cálculo de placement es
 *     simple porque solo soportamos 4 lados + center, no auto-flip.
 *   - El target NO es interactivo durante el tour — el "agujero" del overlay
 *     no captura clicks, así que el target queda visible pero NO clickeable.
 *     Esto evita que el user dispare side-effects mientras lo guiamos.
 *   - Para "Cmd+K abrí en este step" se podría agregar `cta` callbacks
 *     pero por ahora el body texto-only alcanza.
 */

const POLL_INTERVAL_MS = 60
const POLL_TIMEOUT_MS = 2000
const VIEWPORT_MARGIN = 16
const ARROW_SIZE = 8

interface TargetRect {
  top: number
  left: number
  width: number
  height: number
}

export function GuidedTour() {
  const activeTour = useOnboardingStore((s) => s.activeTour)
  const step = useOnboardingStore((s) => s.step)
  const next = useOnboardingStore((s) => s.next)
  const prev = useOnboardingStore((s) => s.prev)
  const pause = useOnboardingStore((s) => s.pause)
  const finish = useOnboardingStore((s) => s.finish)

  const navigate = useNavigate()
  const location = useLocation()

  const tour = activeTour ? TOURS[activeTour] : null
  const currentStep: TourStep | undefined = tour?.steps[step]
  const totalSteps = tour?.steps.length ?? 0
  const isLast = totalSteps > 0 && step === totalSteps - 1
  const isFirst = step === 0

  const [targetRect, setTargetRect] = useState<TargetRect | null>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [tooltipPos, setTooltipPos] = useState<{
    top: number
    left: number
    arrow?: { side: 'top' | 'bottom' | 'left' | 'right'; offset: number }
  } | null>(null)

  /* ─── Navegación entre rutas ─────────────────────────────────────────── */

  useEffect(() => {
    if (!currentStep?.route) return
    if (location.pathname === currentStep.route) return
    navigate(currentStep.route)
  }, [currentStep?.route, location.pathname, navigate])

  /* ─── Polling para esperar al target ─────────────────────────────────── */

  const measure = useCallback((selector: string): TargetRect | null => {
    const el = document.querySelector(selector)
    if (!el) return null
    const r = el.getBoundingClientRect()
    if (r.width === 0 && r.height === 0) return null
    return { top: r.top, left: r.left, width: r.width, height: r.height }
  }, [])

  useLayoutEffect(() => {
    if (!currentStep) {
      setTargetRect(null)
      return
    }

    if (!currentStep.target) {
      // Step centrado, sin target. Aún esperamos si tiene route, hasta que
      // location coincida con la route esperada (manejado por el effect de
      // navegación arriba; este effect re-corre cuando location cambia).
      setTargetRect(null)
      return
    }

    // Si tiene route y todavía no coincide, no medimos.
    if (currentStep.route && location.pathname !== currentStep.route) {
      setTargetRect(null)
      return
    }

    // Poll hasta encontrar el target o timeout
    let elapsed = 0
    let cancelled = false
    const tryMeasure = () => {
      if (cancelled) return
      const rect = measure(currentStep.target!)
      if (rect) {
        if (currentStep.scrollIntoView !== false) {
          const el = document.querySelector(currentStep.target!)
          if (el && 'scrollIntoView' in el) {
            ;(el as HTMLElement).scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'nearest',
            })
            // Re-medir después del scroll
            setTimeout(() => {
              if (!cancelled) {
                const r2 = measure(currentStep.target!)
                if (r2) setTargetRect(r2)
              }
            }, 350)
            return
          }
        }
        setTargetRect(rect)
        return
      }
      elapsed += POLL_INTERVAL_MS
      if (elapsed >= POLL_TIMEOUT_MS) {
        // Timeout — caemos a modal centrado
        setTargetRect(null)
        return
      }
      setTimeout(tryMeasure, POLL_INTERVAL_MS)
    }
    tryMeasure()
    return () => {
      cancelled = true
    }
  }, [currentStep, location.pathname, measure])

  /* ─── Re-medir target en scroll/resize ───────────────────────────────── */

  useEffect(() => {
    if (!currentStep?.target || !targetRect) return
    const onChange = () => {
      const r = measure(currentStep.target!)
      if (r) setTargetRect(r)
    }
    window.addEventListener('scroll', onChange, { passive: true, capture: true })
    window.addEventListener('resize', onChange)
    return () => {
      window.removeEventListener('scroll', onChange, true)
      window.removeEventListener('resize', onChange)
    }
  }, [currentStep, measure, targetRect])

  /* ─── Posicionar tooltip respecto al target ──────────────────────────── */

  useLayoutEffect(() => {
    if (!currentStep) {
      setTooltipPos(null)
      return
    }
    const placement = currentStep.placement ?? 'bottom'

    if (!targetRect || placement === 'center') {
      // Centrar en viewport
      setTooltipPos(null)
      return
    }

    const tt = tooltipRef.current
    if (!tt) return

    const ttRect = tt.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const PAD = currentStep.spotlightPadding ?? 8
    const GAP = 12 + ARROW_SIZE

    let top = 0
    let left = 0
    let side: 'top' | 'bottom' | 'left' | 'right' = 'bottom'

    if (placement === 'top') {
      top = targetRect.top - PAD - GAP - ttRect.height
      left = targetRect.left + targetRect.width / 2 - ttRect.width / 2
      side = 'bottom'
      // Si no entra arriba, flip a bottom
      if (top < VIEWPORT_MARGIN) {
        top = targetRect.top + targetRect.height + PAD + GAP
        side = 'top'
      }
    } else if (placement === 'bottom') {
      top = targetRect.top + targetRect.height + PAD + GAP
      left = targetRect.left + targetRect.width / 2 - ttRect.width / 2
      side = 'top'
      if (top + ttRect.height > vh - VIEWPORT_MARGIN) {
        top = targetRect.top - PAD - GAP - ttRect.height
        side = 'bottom'
      }
    } else if (placement === 'left') {
      top = targetRect.top + targetRect.height / 2 - ttRect.height / 2
      left = targetRect.left - PAD - GAP - ttRect.width
      side = 'right'
      if (left < VIEWPORT_MARGIN) {
        left = targetRect.left + targetRect.width + PAD + GAP
        side = 'left'
      }
    } else if (placement === 'right') {
      top = targetRect.top + targetRect.height / 2 - ttRect.height / 2
      left = targetRect.left + targetRect.width + PAD + GAP
      side = 'left'
      if (left + ttRect.width > vw - VIEWPORT_MARGIN) {
        left = targetRect.left - PAD - GAP - ttRect.width
        side = 'right'
      }
    }

    // Clamp a viewport
    left = Math.max(VIEWPORT_MARGIN, Math.min(left, vw - ttRect.width - VIEWPORT_MARGIN))
    top = Math.max(VIEWPORT_MARGIN, Math.min(top, vh - ttRect.height - VIEWPORT_MARGIN))

    // Calcular offset de la flecha (alinea con centro del target)
    const targetCenterX = targetRect.left + targetRect.width / 2
    const targetCenterY = targetRect.top + targetRect.height / 2
    let arrowOffset = 0
    if (side === 'top' || side === 'bottom') {
      arrowOffset = Math.max(16, Math.min(ttRect.width - 16, targetCenterX - left))
    } else {
      arrowOffset = Math.max(16, Math.min(ttRect.height - 16, targetCenterY - top))
    }

    setTooltipPos({ top, left, arrow: { side, offset: arrowOffset } })
  }, [currentStep, targetRect, step])

  /* ─── Teclado: Esc cierra, ← → navegan ───────────────────────────────── */

  useEffect(() => {
    if (!activeTour) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        pause()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        if (isLast) finish()
        else next()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (!isFirst) prev()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeTour, isFirst, isLast, next, prev, pause, finish])

  if (!tour || !currentStep) return null

  const hasSpotlight = !!targetRect && currentStep.placement !== 'center'
  const PAD = currentStep.spotlightPadding ?? 8

  return (
    <AnimatePresence>
      <motion.div
        key={`${tour.id}-${step}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[70]"
        aria-live="polite"
        aria-label={`${tour.label}: paso ${step + 1} de ${totalSteps}`}
      >
        {/* Overlays oscuros (4 paneles que dejan un agujero sobre el target) */}
        {hasSpotlight ? (
          <SpotlightCutout rect={targetRect!} padding={PAD} onClick={pause} />
        ) : (
          <div
            className="absolute inset-0 bg-navy-500/60 backdrop-blur-sm"
            onClick={pause}
          />
        )}

        {/* Borde dorado alrededor del target */}
        {hasSpotlight && targetRect && (
          <motion.div
            key={`border-${step}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-none absolute rounded-2xl border-2 border-gold-500 shadow-[0_0_0_4px_rgba(199,168,0,0.25)]"
            style={{
              top: targetRect.top - PAD,
              left: targetRect.left - PAD,
              width: targetRect.width + PAD * 2,
              height: targetRect.height + PAD * 2,
            }}
          />
        )}

        {/* Tooltip */}
        <motion.div
          ref={tooltipRef}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className={cn(
            'absolute w-[min(90vw,420px)] rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-navy-500/10',
            !tooltipPos &&
              'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
          )}
          style={
            tooltipPos
              ? { top: tooltipPos.top, left: tooltipPos.left }
              : undefined
          }
          onClick={(e) => e.stopPropagation()}
        >
          {/* Arrow */}
          {tooltipPos?.arrow && (
            <span
              aria-hidden
              className="absolute block h-3 w-3 rotate-45 bg-white ring-1 ring-navy-500/10"
              style={arrowStyle(tooltipPos.arrow)}
            />
          )}

          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-500 text-navy-500">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gold-700">
                  {tour.label} · {step + 1}/{totalSteps}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={pause}
              aria-label="Cerrar tour"
              className="rounded-full p-1.5 text-navy-300 hover:bg-neutral-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Title + body */}
          <h3 className="mt-3 text-base font-bold leading-snug text-navy-500">
            {currentStep.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-navy-500">
            {currentStep.body}
          </p>

          {currentStep.tip && (
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-gold-100/60 px-3 py-2 ring-1 ring-gold-300/40">
              <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-700" />
              <p className="text-xs leading-relaxed text-navy-500">{currentStep.tip}</p>
            </div>
          )}

          {/* Progress dots */}
          <div className="mt-4 flex gap-1.5">
            {tour.steps.map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-1 flex-1 rounded-full transition-colors',
                  i < step
                    ? 'bg-gold-500'
                    : i === step
                      ? 'bg-gold-500'
                      : 'bg-neutral-200',
                )}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => finish()}
              className="text-xs font-semibold text-navy-300 hover:text-navy-500"
            >
              Saltar tour
            </button>
            <div className="flex items-center gap-2">
              {!isFirst && (
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Paso anterior"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 bg-white text-navy-500 hover:bg-neutral-100"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => (isLast ? finish() : next())}
                className="inline-flex items-center gap-2 rounded-full bg-navy-500 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-navy-400"
              >
                {isLast ? '¡Listo!' : currentStep.nextLabel ?? 'Continuar'}
                {!isLast && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ─── Subcomponente: 4 overlays con agujero ───────────────────────────── */

function SpotlightCutout({
  rect,
  padding,
  onClick,
}: {
  rect: TargetRect
  padding: number
  onClick: () => void
}) {
  const top = Math.max(0, rect.top - padding)
  const left = Math.max(0, rect.left - padding)
  const right = rect.left + rect.width + padding
  const bottom = rect.top + rect.height + padding

  const base =
    'absolute bg-navy-500/60 backdrop-blur-sm transition-opacity'

  return (
    <>
      {/* Top */}
      <div
        className={base}
        style={{ top: 0, left: 0, right: 0, height: top }}
        onClick={onClick}
      />
      {/* Bottom */}
      <div
        className={base}
        style={{ top: bottom, left: 0, right: 0, bottom: 0 }}
        onClick={onClick}
      />
      {/* Left */}
      <div
        className={base}
        style={{ top, left: 0, width: left, height: bottom - top }}
        onClick={onClick}
      />
      {/* Right */}
      <div
        className={base}
        style={{ top, left: right, right: 0, height: bottom - top }}
        onClick={onClick}
      />
    </>
  )
}

/* ─── Helper: estilos de la flecha del tooltip ────────────────────────── */

function arrowStyle(arrow: {
  side: 'top' | 'bottom' | 'left' | 'right'
  offset: number
}): React.CSSProperties {
  const SIZE = 12
  switch (arrow.side) {
    case 'top':
      return { top: -SIZE / 2, left: arrow.offset - SIZE / 2 }
    case 'bottom':
      return { bottom: -SIZE / 2, left: arrow.offset - SIZE / 2 }
    case 'left':
      return { top: arrow.offset - SIZE / 2, left: -SIZE / 2 }
    case 'right':
      return { top: arrow.offset - SIZE / 2, right: -SIZE / 2 }
  }
}
