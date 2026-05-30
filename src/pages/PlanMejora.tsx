import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Sparkles, CheckCircle2, Circle, ArrowRight, Lightbulb, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Breadcrumbs } from '@/components/features/Breadcrumbs'

/**
 * Fix #FEAT-08 (análisis proyecto): visualización del Plan de Mejora
 * para postulantes con cert en categoría 2 (Tradicional con raíces) o
 * 3 (Inspiración cultural) o con score <70. El tipo `ImprovementPlan`
 * existía en `src/types/index.ts` con responsables (solicitante /
 * tutor / comunidad) y `reEvaluationAt` — pero NUNCA se renderizaba.
 *
 * El demo muestra un plan típico de Camila: 4 acciones distribuidas
 * entre solicitante y tutor para "subir" a la siguiente categoría en
 * la próxima renovación.
 */
interface PlanAction {
  id: string
  title: string
  detail: string
  responsable: 'solicitante' | 'tutor' | 'comunidad'
  done: boolean
}

const DEMO_ACTIONS: PlanAction[] = [
  {
    id: 'a-1',
    title: 'Documentar el aprendizaje con la comunidad Kogi',
    detail: 'Carta o video de validación del referente comunitario sobre la transmisión del saber.',
    responsable: 'comunidad',
    done: true,
  },
  {
    id: 'a-2',
    title: 'Sumar 3 evidencias del proceso completo en territorio',
    detail: 'Material gráfico que muestre el lugar de origen y el ciclo productivo entero.',
    responsable: 'solicitante',
    done: false,
  },
  {
    id: 'a-3',
    title: 'Capacitación en estándares de orfebrería ancestral',
    detail: 'Curso del INAP o equivalente (8hs) — el tutor te conecta con la próxima cohorte.',
    responsable: 'tutor',
    done: false,
  },
  {
    id: 'a-4',
    title: 'Inscripción al directorio de oficios ancestrales',
    detail: 'Trámite externo del Ministerio de Cultura — el tutor cubre el asesoramiento.',
    responsable: 'solicitante',
    done: false,
  },
]

const RESPONSABLE_META: Record<
  PlanAction['responsable'],
  { label: string; color: string }
> = {
  solicitante: { label: 'Tu acción', color: 'bg-gold-100 text-gold-700' },
  tutor: { label: 'Acción del tutor', color: 'bg-info-100 text-info-400' },
  comunidad: { label: 'Acción comunitaria', color: 'bg-success-100 text-success-300' },
}

export default function PlanMejora() {
  const { id } = useParams()
  const [actions, setActions] = useState(DEMO_ACTIONS)
  const done = actions.filter((a) => a.done).length
  const pct = Math.round((done / actions.length) * 100)
  const reEvalAt = new Date()
  reEvalAt.setMonth(reEvalAt.getMonth() + 6)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <Breadcrumbs
        items={[
          { label: 'Mis certificaciones', to: '/mis-certificaciones' },
          { label: id ?? '—', to: `/mis-certificaciones/${id}` },
          { label: 'Plan de mejora' },
        ]}
      />

      <header className="mt-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-gold-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gold-700">
          <Sparkles className="h-3 w-3" />
          Plan de mejora · próxima renovación
        </div>
        <h1 className="mt-3 text-2xl font-bold text-navy-500 md:text-3xl">
          Acciones para subir de categoría
        </h1>
        <p className="mt-2 max-w-xl text-sm text-navy-300">
          Tu certificación está en <strong>Categoría 2 · Tradicional
          con raíces ancestrales</strong>. El equipo (tutor + auditor +
          antropólogo) propuso este plan para que en la próxima
          renovación puedas postularte a <strong>Categoría 1 ·
          Ancestral Auténtico</strong>.
        </p>
      </header>

      <section className="mt-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-navy-300">
              Progreso global
            </p>
            <p className="mt-1 text-3xl font-bold text-navy-500">
              {done}/{actions.length}{' '}
              <span className="text-base font-medium text-navy-300">
                acciones completadas
              </span>
            </p>
          </div>
          <p className="text-3xl font-bold text-gold-500 tabular-nums">{pct}%</p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-200">
          <div
            className="h-full bg-gold-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-navy-300">
          Re-evaluación prevista:{' '}
          <strong className="text-navy-500">
            {reEvalAt.toLocaleDateString('es-AR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </strong>
        </p>
      </section>

      <ul className="mt-6 space-y-3">
        {actions.map((a) => {
          const meta = RESPONSABLE_META[a.responsable]
          return (
            <li
              key={a.id}
              className={`rounded-2xl border bg-white p-4 transition-colors ${a.done ? 'border-success-300 bg-success-100/20' : 'border-neutral-200'}`}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setActions((prev) =>
                      prev.map((x) =>
                        x.id === a.id ? { ...x, done: !x.done } : x,
                      ),
                    )
                  }
                  aria-label={a.done ? 'Marcar pendiente' : 'Marcar hecha'}
                  className="mt-0.5 shrink-0"
                >
                  {a.done ? (
                    <CheckCircle2 className="h-5 w-5 text-success-300" />
                  ) : (
                    <Circle className="h-5 w-5 text-navy-300" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={`text-sm font-bold ${a.done ? 'text-navy-300 line-through' : 'text-navy-500'}`}
                    >
                      {a.title}
                    </p>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${meta.color}`}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-navy-300">
                    {a.detail}
                  </p>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="mt-6 flex items-start gap-2 rounded-2xl border border-info-200 bg-info-100/40 p-4">
        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-info-400" />
        <p className="text-xs leading-relaxed text-navy-500">
          Las acciones marcadas como{' '}
          <strong className="text-navy-500">Acción comunitaria</strong>{' '}
          dependen de la disponibilidad del referente. Coordiná con tu{' '}
          <Link
            to={`/mis-certificaciones/${id}?tab=mensajes`}
            className="font-bold text-gold-700 hover:underline"
          >
            tutor
          </Link>{' '}
          si necesitás ayuda con el contacto.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() =>
            toast.success(
              'Recordatorio configurado · te avisamos 30 días antes de la re-evaluación',
            )
          }
          className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-bold text-navy-500 shadow-sm hover:bg-gold-400"
        >
          Recordarme antes de re-evaluar
          <ArrowRight className="h-4 w-4" />
        </button>
        <Link
          to={`/mis-certificaciones/${id}?tab=mensajes`}
          className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-navy-500 hover:bg-neutral-100"
        >
          <Users className="h-4 w-4" />
          Hablar con mi tutor
        </Link>
      </div>
    </div>
  )
}
