import { STAGE_SLA_DAYS } from '@/services/mocks/data'
import type { TutorCase } from '@/types'

/**
 * Lógica de SLA de casos del tutor, compartida entre el kanban
 * (TutorCases) y el dashboard (TutorDashboard) para que el "vencido"
 * sea UNA sola definición. Antes el KPI "Casos atrasados" del dashboard
 * usaba un criterio distinto (pendingItems + risk) al "rojo por SLA" del
 * kanban, mostrando un número incoherente entre las dos vistas.
 */

/** Días transcurridos desde que el caso entró a su etapa actual. */
export function daysInStageFromCase(c: TutorCase): number {
  return Math.floor((Date.now() - new Date(c.createdAt).getTime()) / 86_400_000)
}

/** Tono de SLA: rojo = vencido, amarillo = por vencer (>70%), verde = ok. */
export function slaToneForCase(c: TutorCase): 'red' | 'yellow' | 'green' {
  const sla = STAGE_SLA_DAYS[c.stage] ?? 14
  const days = daysInStageFromCase(c)
  if (days > sla) return 'red'
  if (days > sla * 0.7) return 'yellow'
  return 'green'
}
