import { Link } from 'react-router-dom'
import { Users, AlertTriangle, TrendingUp } from 'lucide-react'
import { Header } from '@/components/features/Header'
import { Footer } from '@/components/features/Footer'
import { PageMeta } from '@/components/features/PageMeta'

/**
 * Fix #FEAT-04 + #FEAT-11 (análisis proyecto): vista de gestión de
 * equipo de tutores. Stub funcional para mostrar el patrón
 * conceptual; el flujo real (reasignar, balancear, cobertura por
 * licencia) se cablea cuando entren los roles operativos en backend.
 */
interface TutorRow {
  id: string
  name: string
  activeCases: number
  slaRisk: number
  approvalRate: number
  utilizationPct: number
}

const DEMO_TUTORES: TutorRow[] = [
  { id: 't-001', name: 'Lic. Juan Pérez', activeCases: 12, slaRisk: 2, approvalRate: 82, utilizationPct: 86 },
  { id: 't-002', name: 'Lic. Patricia Vega', activeCases: 8, slaRisk: 0, approvalRate: 91, utilizationPct: 64 },
  { id: 't-003', name: 'Mtra. Sofía Quispe', activeCases: 14, slaRisk: 3, approvalRate: 88, utilizationPct: 94 },
  { id: 't-004', name: 'Dr. Eduardo Ríos', activeCases: 5, slaRisk: 0, approvalRate: 78, utilizationPct: 36 },
]

export default function CoordinadorEquipo() {
  const sum = DEMO_TUTORES.reduce(
    (a, t) => ({
      cases: a.cases + t.activeCases,
      slaRisk: a.slaRisk + t.slaRisk,
      avgApproval: a.avgApproval + t.approvalRate,
    }),
    { cases: 0, slaRisk: 0, avgApproval: 0 },
  )
  const avgApproval = Math.round(sum.avgApproval / DEMO_TUTORES.length)

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PageMeta
        title="Equipo de tutores · Coordinación"
        description="Vista de gestión de carga de trabajo y SLA del equipo de tutores culturales."
        noindex
      />
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 md:px-8 md:py-14">
        <div className="inline-flex items-center gap-2 rounded-full bg-info-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-info-400">
          <Users className="h-3 w-3" />
          Vista de coordinador
        </div>
        <h1 className="mt-3 text-3xl font-bold text-navy-500 md:text-4xl">
          Equipo de tutores culturales
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-navy-300">
          Distribución de casos, riesgo de SLA y aprobación promedio
          por tutor. Reasigná o llamá a cobertura cuando alguien
          supera el umbral.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Kpi label="Casos activos" value={sum.cases.toString()} />
          <Kpi label="SLA en riesgo" value={sum.slaRisk.toString()} tone="warning" />
          <Kpi label="Tutores activos" value={DEMO_TUTORES.length.toString()} />
          <Kpi label="Aprobación promedio" value={`${avgApproval}%`} tone="success" />
        </div>

        <section className="mt-8 overflow-x-auto rounded-3xl border border-neutral-200 bg-white shadow-sm">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="bg-neutral-100">
              <tr className="text-left text-[11px] font-bold uppercase tracking-widest text-navy-300">
                <th className="px-4 py-3">Tutor</th>
                <th className="px-4 py-3">Casos activos</th>
                <th className="px-4 py-3">SLA riesgo</th>
                <th className="px-4 py-3">Aprobación</th>
                <th className="px-4 py-3">Utilización</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {DEMO_TUTORES.map((t) => (
                <tr key={t.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <p className="font-bold text-navy-500">{t.name}</p>
                    <p className="text-[10px] text-navy-300">{t.id}</p>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-navy-500">
                    {t.activeCases}
                  </td>
                  <td className="px-4 py-3">
                    {t.slaRisk > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-warning-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-warning-400">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        {t.slaRisk}
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-success-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-success-300">
                        OK
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      {t.approvalRate}%
                      <TrendingUp className="h-3 w-3 text-success-300" />
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 overflow-hidden rounded-full bg-neutral-200">
                        <div
                          className={`h-full ${t.utilizationPct >= 90 ? 'bg-error-400' : t.utilizationPct >= 75 ? 'bg-warning-400' : 'bg-success-300'}`}
                          style={{ width: `${t.utilizationPct}%` }}
                        />
                      </div>
                      <span className="text-[11px] tabular-nums text-navy-500">
                        {t.utilizationPct}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <p className="mt-6 text-xs text-navy-300">
          Vista institucional (mock). El backend real expone esta data
          via <code>GET /api/v1/coordinador/team</code> con filtros por
          región / categoría / período. Las acciones de reasignar y
          cobertura están planificadas para próxima iteración —{' '}
          <Link
            to="/tutor/casos"
            className="font-bold text-gold-700 hover:underline"
          >
            por ahora se hacen desde el kanban
          </Link>
          .
        </p>
      </main>
      <Footer />
    </div>
  )
}

function Kpi({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: 'warning' | 'success'
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-widest text-navy-300">
        {label}
      </p>
      <p
        className={`mt-1 text-3xl font-bold tabular-nums ${tone === 'warning' ? 'text-warning-400' : tone === 'success' ? 'text-success-300' : 'text-navy-500'}`}
      >
        {value}
      </p>
    </div>
  )
}
