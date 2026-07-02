import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, Clock, FileUp, Send, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { Breadcrumbs } from '@/components/features/Breadcrumbs'
import { mockCertificationRequests } from '@/services/mocks/data'

/**
 * Fix #FEAT-03 (análisis proyecto): flujo de APELACIÓN para el
 * postulante cuando un cert sale `denegado`. Antes "Apelación" solo
 * estaba en el glosario del Reglamento (cláusula 5.6 + 8 = 5 días
 * hábiles para apelar, 15 días para resolver) sin UI.
 *
 * Este componente:
 *  - countdown de 5 días hábiles desde la denegación
 *  - formulario con motivo + nueva evidencia + textarea fundamentación
 *  - confirmación con tracking ID
 *
 * El backend real va a:
 *  - validar plazo
 *  - crear ticket al Comité de Certificación con SLA 15 días
 *  - notificar al tutor cultural y antropólogo
 */
export default function Apelar() {
  const { id } = useParams()
  const navigate = useNavigate()
  const request = mockCertificationRequests.find((r) => r.id === id)
  const [motivo, setMotivo] = useState('')
  const [fundamentacion, setFundamentacion] = useState('')
  const [sent, setSent] = useState(false)
  const [trackingId] = useState(
    () => `AP-${Date.now().toString(36).toUpperCase().slice(-6)}`,
  )

  // Countdown de 5 días hábiles desde "ahora" para el demo (en prod
  // se calcula desde `denegadoAt` del cert).
  const deadline = useMemo(() => {
    const d = new Date()
    let added = 0
    while (added < 5) {
      d.setDate(d.getDate() + 1)
      const dow = d.getDay()
      if (dow !== 0 && dow !== 6) added++
    }
    return d
  }, [])

  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(t)
  }, [])
  const msLeft = deadline.getTime() - now
  const daysLeft = Math.max(0, Math.floor(msLeft / 86_400_000))
  const hoursLeft = Math.max(
    0,
    Math.floor((msLeft % 86_400_000) / 3_600_000),
  )

  const canSubmit = motivo.length >= 10 && fundamentacion.length >= 50 && !sent

  // Guard DESPUÉS de los hooks (rules-of-hooks): si el id no existe, no
  // seguir renderizando con request undefined.
  if (!request) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <p className="text-sm font-bold text-navy-500">
          Solicitud no encontrada
        </p>
        <button
          type="button"
          onClick={() => navigate('/mis-certificaciones')}
          className="mt-4 inline-flex items-center gap-2 text-sm text-gold-700 hover:underline"
        >
          Volver a mis certificaciones
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:py-12">
      <Breadcrumbs
        items={[
          { label: 'Mis certificaciones', to: '/mis-certificaciones' },
          {
            label: request?.productName ?? 'Solicitud',
            to: `/mis-certificaciones/${id}`,
          },
          { label: 'Apelar denegación' },
        ]}
      />

      <header className="mt-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-error-400">
          Apelación al Comité de Certificación
        </p>
        <h1 className="mt-1 text-2xl font-bold text-navy-500 md:text-3xl">
          Apelar la denegación de la certificación
        </h1>
        <p className="mt-2 text-sm text-navy-300">
          Reglamento art. 5.6 — Tenés 5 días hábiles desde la
          notificación para presentar una apelación. El Comité de
          Certificación responde en máximo 15 días.
        </p>
      </header>

      {!sent && (
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-warning-300 bg-warning-100/40 p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-warning-400" />
            <div>
              <p className="text-xs font-bold text-navy-500">
                Plazo restante para apelar
              </p>
              <p className="text-[11px] text-navy-300">
                Vence el{' '}
                {deadline.toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
          <p className="text-2xl font-bold text-warning-400 tabular-nums">
            {daysLeft}d {hoursLeft}h
          </p>
        </div>
      )}

      {!sent ? (
        <section className="mt-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-navy-500">
            ¿Por qué considerás incorrecta la denegación?
          </h2>

          <div className="mt-4">
            <label
              htmlFor="motivo"
              className="text-xs font-bold text-navy-500"
            >
              Motivo (resumen — mínimo 10 caracteres)
            </label>
            <input
              id="motivo"
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: Documentación adicional ya disponible"
              className="mt-1 h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
            />
          </div>

          <div className="mt-4">
            <label
              htmlFor="fundamentacion"
              className="text-xs font-bold text-navy-500"
            >
              Fundamentación detallada (mínimo 50 caracteres)
            </label>
            <textarea
              id="fundamentacion"
              value={fundamentacion}
              onChange={(e) => setFundamentacion(e.target.value)}
              rows={6}
              placeholder="Detallá los puntos específicos del dictamen con los que estás en desacuerdo, las evidencias que aportás como nuevas y la solicitud concreta al Comité."
              className="mt-1 w-full resize-y rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-navy-300">
              {fundamentacion.length}/50 mínimos
            </p>
          </div>

          <div className="mt-4">
            <p className="text-xs font-bold text-navy-500">
              Nueva evidencia
            </p>
            <button
              type="button"
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-neutral-300 bg-white px-4 py-5 text-xs font-semibold text-navy-500 hover:border-gold-500"
            >
              <FileUp className="h-4 w-4" />
              Adjuntar PDF, foto o video
            </button>
            <p className="mt-1 text-[11px] text-navy-300">
              Opcional pero recomendado — el Comité valora mucho la
              evidencia nueva.
            </p>
          </div>

          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => {
              toast.success(
                `Apelación ${trackingId} enviada al Comité de Certificación`,
              )
              setSent(true)
            }}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy-500 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-navy-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
            Presentar apelación al Comité
          </button>
        </section>
      ) : (
        <section className="mt-6 rounded-3xl border border-success-300 bg-success-100/30 p-6 text-center shadow-sm">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-300 text-white">
            <CheckCircle2 className="h-7 w-7" />
          </span>
          <h2 className="mt-4 text-xl font-bold text-navy-500">
            Apelación recibida
          </h2>
          <p className="mt-2 text-sm text-navy-300">
            Tracking ID:{' '}
            <code className="rounded bg-white px-2 py-0.5 font-mono text-navy-500">
              {trackingId}
            </code>
          </p>
          <p className="mt-2 max-w-md text-sm text-navy-500">
            El Comité de Certificación (tutor cultural + antropólogo +
            coordinador) revisa la apelación. Plazo máximo de
            resolución: 15 días corridos. Te notificamos por email +
            in-app.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => navigate('/mis-certificaciones')}
              className="rounded-full bg-navy-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-navy-400"
            >
              Volver
            </button>
            <Link
              to={`/mis-certificaciones/${id}`}
              className="rounded-full border border-neutral-300 bg-white px-6 py-2.5 text-sm font-semibold text-navy-500 hover:bg-neutral-100"
            >
              Ver expediente
            </Link>
          </div>
        </section>
      )}

      {!sent && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-info-200 bg-info-100/40 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-info-400" />
          <p className="text-[11px] leading-relaxed text-navy-500">
            <strong>Antes de apelar:</strong> revisá el dictamen
            completo y los criterios que el tutor marcó como no
            cumplidos. Si entendés el motivo pero querés trabajar en él
            antes de re-postular, mejor abrir un caso de
            re-consideración con tu tutor.
          </p>
        </div>
      )}
    </div>
  )
}
