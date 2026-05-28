import { Clock, Lock } from 'lucide-react'
import type { RequestStageItem } from '@/types'
import { cn } from '@/lib/utils'

export function StagePipeline({ stages }: { stages: RequestStageItem[] }) {
  // Show only top-level 5 stages for the pipeline (combine diagnostico+auditoria into one or pick first 5)
  // Figma shows: Prediagnóstico → Inicio del proceso → Diagnóstico → Evaluación → Certificación
  const display: RequestStageItem[] = [
    stages.find((s) => s.stage === 'prediagnostico')!,
    stages.find((s) => s.stage === 'inicio')!,
    stages.find((s) => s.stage === 'diagnostico')!,
    stages.find((s) => s.stage === 'evaluacion')!,
    stages.find((s) => s.stage === 'certificacion')!,
  ].filter(Boolean)

  return (
    <ol className="flex items-center gap-2">
      {display.map((s, i) => {
        const isActive = s.status === 'in_progress'
        const isDone = s.status === 'completed'
        return (
          <li key={s.stage} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                'flex h-[88px] flex-1 flex-col items-center justify-center gap-2 rounded-2xl border text-center transition-colors',
                isActive && 'border-navy-200 bg-info-100',
                isDone && 'border-navy-500 bg-navy-500 text-white',
                !isActive && !isDone && 'border-neutral-300 bg-white text-navy-300',
              )}
            >
              {isActive ? (
                <Clock className={cn('h-5 w-5 text-navy-500')} strokeWidth={1.75} />
              ) : isDone ? (
                <Clock className="h-5 w-5 text-white" strokeWidth={1.75} />
              ) : (
                <Lock className="h-5 w-5 text-navy-300" strokeWidth={1.75} />
              )}
              <span
                className={cn(
                  'px-2 text-sm font-semibold leading-tight',
                  isActive && 'text-navy-500',
                  isDone && 'text-white',
                  !isActive && !isDone && 'text-navy-300',
                )}
              >
                {s.label}
              </span>
            </div>
            {i < display.length - 1 && (
              <span className="block h-px w-3 shrink-0 bg-neutral-300" aria-hidden />
            )}
          </li>
        )
      })}
    </ol>
  )
}

/**
 * Badge tipado para el estado/etapa de una solicitud.
 *
 * Acepta cualquier string libre pero tiene paleta predefinida para los
 * labels del flujo RequestStage (Prediagnóstico, Inicio, Diagnóstico,
 * Auditoría, Evaluación, Certificación) y los meta-estados de UI
 * (En curso / En emisión / Vigente).
 *
 * Fix QW-A1 (auditoría UX): antes solo conocía 4 labels y por eso los
 * callers hardcoded `"Prediagnóstico"` aunque la solicitud estuviera en
 * otra etapa. Ahora el caller puede pasar el label real
 * (STAGES[currentStage].label de lib/copy) y el badge le da color
 * consistente con el progreso.
 */
export function StageStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    // Etapas tempranas — gold (todavía en preparación)
    Prediagnóstico: 'bg-gold-100 text-gold-700',
    'Inicio del proceso': 'bg-gold-100 text-gold-700',
    Diagnóstico: 'bg-gold-100 text-gold-700',
    // Etapas centrales — navy (en revisión activa)
    Auditoría: 'bg-navy-100 text-navy-500',
    Evaluación: 'bg-navy-100 text-navy-500',
    // Cierre — info azul claro
    Certificación: 'bg-info-100 text-info-400',
    // Meta-estados de UI
    'En curso': 'bg-gold-100 text-gold-700',
    'En emisión': 'bg-info-100 text-info-400',
    Vigente: 'bg-success-100 text-success-300 ring-1 ring-success-300/30',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
        styles[status] ?? 'bg-neutral-200 text-navy-500',
      )}
    >
      {status}
    </span>
  )
}
