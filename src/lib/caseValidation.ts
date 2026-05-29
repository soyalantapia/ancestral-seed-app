import type {
  CaseStage,
  EvidenceVerdict,
  ScoringValue,
  TutorCase,
} from '@/types'
import { SCORING_CRITERIA } from '@/services/mocks/data'

/**
 * Helpers compartidos para validar avance de etapa de un caso.
 *
 * Antes vivían inline en TutorCaseDetail.tsx, pero TutorCases (kanban
 * drag-and-drop) también necesita aplicarlos para no permitir saltar
 * la validación arrastrando — bug #TUT-08 de la auditoría UX, que
 * dejaba dos workflows incompatibles (formal con checklist + informal
 * con drag).
 */

export function computeWeightedScore(values: ScoringValue[]): number {
  if (values.length === 0) return 0
  let total = 0
  let weights = 0
  for (const v of values) {
    const def = SCORING_CRITERIA.find((c) => c.id === v.criterionId)
    if (!def) continue
    total += v.score * def.weight
    weights += def.weight
  }
  return weights === 0 ? 0 : Math.round((total / weights) * 10)
}

export interface AdvanceCheck {
  ok: boolean
  reason: string
  requirements: Array<{ label: string; done: boolean }>
}

/**
 * Reglas por etapa para avanzar a la siguiente del flujo. Centralizado
 * para que el botón "Avanzar etapa" del detalle y el drag-and-drop del
 * kanban apliquen exactamente los mismos checks.
 */
export function computeCanAdvance(
  caseData: TutorCase,
  evidenceEvals: Array<{ verdict: EvidenceVerdict }>,
  scoringValues: ScoringValue[],
): AdvanceCheck {
  const reqs: Array<{ label: string; done: boolean }> = []

  switch (caseData.stage) {
    case 'postulado':
      reqs.push({
        label: 'Tutor asignado al caso',
        done: !!caseData.tutorId,
      })
      reqs.push({
        label: 'Scoring IA disponible',
        done: caseData.scoringIA > 0,
      })
      break
    case 'revision-inicial':
      reqs.push({
        label: 'Riesgo evaluado',
        done: !!caseData.risk,
      })
      reqs.push({
        label: 'Pendientes resueltos',
        done: caseData.pendingItems.length === 0,
      })
      break
    case 'elegible':
      reqs.push({
        label: 'Al menos 1 evidencia subida',
        done: evidenceEvals.length > 0,
      })
      reqs.push({
        label: 'Pendientes resueltos',
        done: caseData.pendingItems.length === 0,
      })
      break
    case 'diagnostico':
      reqs.push({
        label: 'Evidencias aprobadas',
        done:
          evidenceEvals.length > 0 &&
          evidenceEvals.every((e) => e.verdict === 'approved'),
      })
      reqs.push({
        label: 'Sin evidencias rechazadas',
        done: !evidenceEvals.some((e) => e.verdict === 'rejected'),
      })
      break
    case 'auditoria':
      reqs.push({
        label: 'Auditoría documentada',
        done: true, // mock — en producción depende del informe
      })
      break
    case 'evaluacion':
      reqs.push({
        label: 'Scoring completo en 7 criterios',
        done: scoringValues.length >= 7,
      })
      reqs.push({
        label: 'Puntaje final ≥ 70',
        done: computeWeightedScore(scoringValues) >= 70,
      })
      break
    case 'certificacion':
      return {
        ok: false,
        reason: 'Caso ya certificado',
        requirements: [],
      }
  }

  const pending = reqs.filter((r) => !r.done)
  return {
    ok: pending.length === 0,
    reason: pending.length
      ? `Faltan ${pending.length} requisito${pending.length === 1 ? '' : 's'}`
      : '',
    requirements: reqs,
  }
}

/**
 * Wrapper para el kanban: lee los mocks por caseId y aplica
 * computeCanAdvance. Devuelve el check + (si falla) los labels de los
 * requirements pendientes para mostrar en un toast/dialog.
 *
 * @param target Etapa destino del drag. Si es retroceso (índice menor),
 *               siempre se permite sin validar (corrección de errores).
 */
/**
 * Fix V4-TUT-09 (auditoría v4): documenta explícitamente la
 * semántica del nombre `validateCaseAdvance`.
 *
 * Esta función valida si un caso puede AVANZAR HACIA `target` —
 * es decir, "puedo entrar a target". NO valida los requisitos
 * PROPIOS de target (los cuales se aplican una vez el caso ya
 * está EN target y quiere ir más allá).
 *
 * Ejemplo:
 * - Caso en `auditoria`, target = `evaluacion`.
 * - La función valida que `auditoria` esté completa para pasar
 *   (requisitos de auditoria → evaluacion).
 * - NO valida los requisitos de `evaluacion` (Scoring ≥ 7 criterios,
 *   etc.) — esos se evalúan cuando el caso ya está EN evaluacion y
 *   se pretende avanzar a `certificacion`.
 *
 * Esto es coherente con el botón "Avanzar etapa" del expediente:
 * primero hay que CUMPLIR los requisitos de salida de la etapa
 * actual; los de la siguiente se chequean cuando uno ya está ahí.
 *
 * Para saltos (target a varias etapas de distancia), simulamos
 * iterativamente cada salto intermedio.
 */
export function validateCaseAdvance(
  caseData: TutorCase,
  target: CaseStage,
  data: {
    evidenceEvals: Array<{ verdict: EvidenceVerdict }>
    scoringValues: ScoringValue[]
  },
): AdvanceCheck & { isBackwards: boolean; failedAt?: CaseStage } {
  const STAGE_ORDER: CaseStage[] = [
    'postulado',
    'revision-inicial',
    'elegible',
    'diagnostico',
    'auditoria',
    'evaluacion',
    'certificacion',
  ]
  const fromIdx = STAGE_ORDER.indexOf(caseData.stage)
  const toIdx = STAGE_ORDER.indexOf(target)
  const isBackwards = toIdx < fromIdx

  // Retroceso = corrección, siempre permitido sin validar requirements.
  if (isBackwards) {
    return { ok: true, reason: '', requirements: [], isBackwards: true }
  }

  /**
   * Fix V3-TUT-03 (auditoría v3): antes solo validábamos los
   * requirements de la PRÓXIMA etapa.
   *
   * Fix V4-TUT-08 (auditoría v4): la simulación heredaba
   * `pendingItems` del caso original. Si el caso estaba en
   * `postulado` con un pendingItem "Completar postulación", al
   * simular etapas posteriores (revision-inicial, elegible) los
   * checks "Pendientes resueltos" fallaban con el SAME pendingItem
   * — pero conceptualmente al avanzar la etapa los pendientes de la
   * etapa origen ya se resolvieron. Falso bloqueo con copy confuso.
   *
   * Ahora simulamos como si los `pendingItems` se VACIARAN al
   * avanzar a la primera etapa intermedia (interpretación: avanzar
   * implica resolver los pendientes de la etapa actual). Si la
   * etapa actual tiene pendingItems, validamos su resolución en la
   * primera iteración (etapa actual, paso i=fromIdx), y para las
   * etapas posteriores (i > fromIdx) trabajamos con array vacío.
   *
   * Esto es coherente con cómo el botón "Avanzar etapa" del
   * expediente lo maneja: el tutor NO puede avanzar sin resolver los
   * pendingItems propios de la etapa actual, pero al avanzar los
   * "vuelve" implícitamente a vacío para la siguiente.
   */
  for (let i = fromIdx; i < toIdx; i++) {
    const stepStage = STAGE_ORDER[i]
    const isOriginStage = i === fromIdx
    const simulated: TutorCase = {
      ...caseData,
      stage: stepStage,
      // Solo conservamos pendingItems para validar la etapa origen;
      // las intermedias se simulan con array vacío.
      pendingItems: isOriginStage ? caseData.pendingItems : [],
    }
    const check = computeCanAdvance(
      simulated,
      data.evidenceEvals,
      data.scoringValues,
    )
    if (!check.ok) {
      return { ...check, isBackwards: false, failedAt: stepStage }
    }
  }

  return {
    ok: true,
    reason: '',
    requirements: [],
    isBackwards: false,
  }
}
