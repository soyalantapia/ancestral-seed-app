import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { RefreshCw, CheckCircle2, ArrowRight, Calendar, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { mockCertificationRequests } from '@/services/mocks/data'
import { Breadcrumbs } from '@/components/features/Breadcrumbs'

/**
 * Fix #FEAT-02 (análisis proyecto): flujo de RENOVACIÓN de la
 * licencia para el postulante. Antes solo existía el tipo
 * `IssuedCertStatus.renovacion` + el tutor podía "Pedir evidencias
 * para renovar" — pero el postulante no tenía UI para iniciar la
 * renovación.
 *
 * Este wizard reducido (3 pasos vs los 7 del CertifyForm original)
 * reutiliza el cert previo: el postulante confirma que sigue
 * vigente, sube evidencias actualizadas y firma la declaración de
 * continuidad de la práctica.
 */
type Step = 'confirmar' | 'evidencias' | 'declaracion' | 'confirmacion'

export default function Renovar() {
  const { id } = useParams()
  const navigate = useNavigate()
  const request = mockCertificationRequests.find((r) => r.id === id)
  const [step, setStep] = useState<Step>('confirmar')
  const [accepts, setAccepts] = useState(false)

  if (!request) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-sm font-bold text-navy-500">
          Solicitud no encontrada
        </p>
        <Link
          to="/mis-certificaciones"
          className="mt-4 inline-flex items-center gap-2 text-sm text-gold-700 hover:underline"
        >
          Volver a mis certificaciones
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <Breadcrumbs
        items={[
          { label: 'Mis certificaciones', to: '/mis-certificaciones' },
          { label: request.productName, to: `/mis-certificaciones/${id}` },
          { label: 'Renovar' },
        ]}
      />

      <header className="mt-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gold-700">
          Renovación de licencia
        </p>
        <h1 className="mt-1 text-2xl font-bold text-navy-500 md:text-3xl">
          Renovar "{request.productName}"
        </h1>
        <p className="mt-2 text-sm text-navy-300">
          Wizard reducido de 3 pasos. La renovación reutiliza tu
          expediente vigente — solo confirmás continuidad + subís
          evidencias actualizadas.
        </p>
      </header>

      <div className="mt-6 flex items-center gap-1">
        {(['confirmar', 'evidencias', 'declaracion'] as const).map((s, i) => {
          const isDone =
            step === 'confirmacion' ||
            (s === 'confirmar' && step !== 'confirmar') ||
            (s === 'evidencias' && step === 'declaracion')
          const isActive = s === step
          return (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full ${
                isDone
                  ? 'bg-navy-500'
                  : isActive
                    ? 'bg-gold-500'
                    : 'bg-neutral-200'
              }`}
              aria-label={`Paso ${i + 1} ${isActive ? 'actual' : isDone ? 'completo' : 'pendiente'}`}
            />
          )
        })}
      </div>

      <section className="mt-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        {step === 'confirmar' && (
          <>
            <h2 className="text-lg font-bold text-navy-500">
              Paso 1 · Confirmar continuidad
            </h2>
            <p className="mt-2 text-sm text-navy-300">
              ¿La práctica certificada sigue activa con las mismas
              características que cuando se emitió el cert original?
            </p>
            <ul className="mt-4 space-y-2 text-sm text-navy-500">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-300" />
                Mismo titular: {request.submittedData?.applicantName}
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-300" />
                Mismo territorio: {request.submittedData?.region}
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success-300" />
                Misma técnica documentada
              </li>
            </ul>
            <button
              type="button"
              onClick={() => setStep('evidencias')}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-navy-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-400"
            >
              Confirmo · Sigue igual
              <ArrowRight className="h-4 w-4" />
            </button>
          </>
        )}

        {step === 'evidencias' && (
          <>
            <h2 className="text-lg font-bold text-navy-500">
              Paso 2 · Evidencias actualizadas
            </h2>
            <p className="mt-2 text-sm text-navy-300">
              Subí al menos 2 fotos recientes (últimos 6 meses) que
              demuestren que la práctica continúa.
            </p>
            <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-300 bg-white p-8">
              <FileText className="h-8 w-8 text-navy-300" />
              <p className="text-sm font-bold text-navy-500">
                Click para seleccionar
              </p>
              <p className="text-xs text-navy-300">
                o arrastrá las fotos acá
              </p>
            </div>
            <p className="mt-3 text-[11px] text-navy-300">
              Mock — en producción el upload se conecta con el backend
              y dispara IA para detectar congruencia con el expediente.
            </p>
            <button
              type="button"
              onClick={() => setStep('declaracion')}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-navy-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-400"
            >
              Continuar
              <ArrowRight className="h-4 w-4" />
            </button>
          </>
        )}

        {step === 'declaracion' && (
          <>
            <h2 className="text-lg font-bold text-navy-500">
              Paso 3 · Declaración de continuidad
            </h2>
            <p className="mt-2 text-sm text-navy-300">
              Última firma para que el sistema procese la renovación.
            </p>
            <label className="mt-4 flex items-start gap-3 rounded-2xl border border-neutral-200 bg-cream-50 p-4">
              <input
                type="checkbox"
                checked={accepts}
                onChange={(e) => setAccepts(e.target.checked)}
                className="mt-1 h-4 w-4"
              />
              <span className="text-xs leading-relaxed text-navy-500">
                Declaro que la práctica certificada continúa con las
                mismas características que dieron origen a la
                certificación. Conozco que la información declarada en
                falso es causal de revocación según el Reglamento art. 5.6.
              </span>
            </label>
            <button
              type="button"
              disabled={!accepts}
              onClick={() => {
                toast.success(
                  'Renovación enviada · revisión en 5-7 días hábiles',
                )
                setStep('confirmacion')
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-bold text-navy-500 shadow-sm hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Firmar y enviar renovación
              <RefreshCw className="h-4 w-4" />
            </button>
          </>
        )}

        {step === 'confirmacion' && (
          <div className="text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-300 text-white">
              <CheckCircle2 className="h-8 w-8" />
            </span>
            <h2 className="mt-4 text-xl font-bold text-navy-500">
              Renovación recibida
            </h2>
            <p className="mt-2 max-w-md text-sm text-navy-300">
              Tu solicitud entró en cola. Tu tutor cultural va a
              revisar las nuevas evidencias y firmar la continuidad.
              Te notificamos cuando esté lista.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-info-100 px-4 py-2 text-xs font-semibold text-info-400">
              <Calendar className="h-3.5 w-3.5" />
              SLA estimado: 5-7 días hábiles
            </div>
            <div className="mt-8">
              <button
                type="button"
                onClick={() => navigate('/mis-certificaciones')}
                className="rounded-full bg-navy-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-navy-400"
              >
                Volver a mis certificaciones
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
