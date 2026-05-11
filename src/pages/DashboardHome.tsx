import { Link } from 'react-router-dom'
import { Info, Plus, X } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { useUiStore } from '@/store/ui'
import { mockCertificationRequests } from '@/services/mocks/data'
import { StagePipeline, StageStatusBadge } from '@/components/features/StagePipeline'

export default function DashboardHome() {
  const user = useAuthStore((s) => s.user)
  const dismissed = useUiStore((s) => s.dismissedBanners['welcome-info'])
  const dismissBanner = useUiStore((s) => s.dismissBanner)
  const request = mockCertificationRequests[0]
  const name = user?.name?.split(' ')[0] ?? 'Camila'

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-8 md:px-10 md:py-10">
      {/* Breadcrumb */}
      <p className="text-sm text-navy-300">Inicio</p>

      <h1 className="mt-4 text-2xl font-bold text-navy-500 md:text-[28px]">
        Inicio
      </h1>
      <p className="mt-2 max-w-3xl text-sm text-navy-300 md:text-base">
        Bienvenido {name}. Desde aquí podrás ver el avance de tus certificaciones,
        armar tu perfil público y administrar tu información.
      </p>

      {!dismissed && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl bg-info-100 px-5 py-4 text-sm text-navy-500 ring-1 ring-info-200">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-info-400" />
          <div className="flex-1">
            <p className="font-bold">Mantente atento a tus notificaciones</p>
            <p className="mt-1 text-navy-300">
              Podríamos solicitar información adicional o nuevas evidencias para
              continuar con la revisión. Te avisaremos por correo y dentro de la
              plataforma.
            </p>
          </div>
          <button
            type="button"
            onClick={() => dismissBanner('welcome-info')}
            className="text-navy-300 hover:text-navy-500"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tu certificación en proceso */}
      <section className="mt-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-navy-500">
              Tu certificación en proceso
            </h2>
            <p className="mt-1 text-sm text-navy-300">{request.productName}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-navy-300">
            Estado actual:
            <StageStatusBadge status="Preadiagnóstico" />
          </div>
        </div>

        <div className="mt-6">
          <StagePipeline stages={request.stages} />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            to={`/mis-certificaciones/${request.id}`}
            className="inline-flex items-center rounded-full bg-navy-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-navy-400"
          >
            Ver detalles del seguimiento
          </Link>
          <Link
            to={`/mis-certificaciones/${request.id}?tab=evidencias`}
            className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-500 shadow-sm transition-colors hover:bg-gold-400"
          >
            <Plus className="h-4 w-4" />
            Añadir evidencias
          </Link>
        </div>
      </section>

      {/* Próximas reuniones */}
      <section className="mt-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
        <h3 className="text-lg font-bold text-navy-500">Próximas reuniones</h3>
        <div className="mt-4 border-t border-neutral-200 pt-6 text-center text-sm text-navy-300">
          No tienes reuniones programadas por el momento
        </div>
      </section>
    </div>
  )
}
