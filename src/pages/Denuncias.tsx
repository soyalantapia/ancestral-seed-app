import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Shield, Search, Send, CheckCircle2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { Footer } from '@/components/features/Footer'
import { Header } from '@/components/features/Header'

/**
 * Fix #FEAT-06 (análisis proyecto): página pública de DENUNCIAS de
 * uso indebido del sello Ancestral Seed.
 *
 * El Reglamento art. 5/6 prevé sanciones por uso indebido pero la
 * única vía existente era el sheet "Reportar incidencia" del cert
 * público — un mailto sin tracking.
 *
 * Esta página permite:
 *  - denunciar un producto SIN cert que use el sello (falsificación)
 *  - denunciar un titular que use el sello fuera de las condiciones
 *  - consultar el estado de una denuncia anterior con tracking ID
 *
 * Sin login (visitante anónimo puede denunciar). Tracking ID para
 * seguimiento posterior. Backend real genera ticket al equipo de
 * Legal + suspende el cert preventivamente si el caso lo amerita.
 */
type Mode = 'submit' | 'check'
type ReportType = 'falsificacion' | 'mal-uso' | 'datos-falsos' | 'otro'

export default function Denuncias() {
  const [mode, setMode] = useState<Mode>('submit')
  const [reportType, setReportType] = useState<ReportType>('falsificacion')
  const [productUrl, setProductUrl] = useState('')
  const [description, setDescription] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [trackingId, setTrackingId] = useState<string | null>(null)
  const [lookupId, setLookupId] = useState('')

  const canSubmit =
    description.length >= 30 && contactEmail.includes('@') && !trackingId

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 md:px-8 md:py-16">
        <header>
          <div className="inline-flex items-center gap-2 rounded-full bg-warning-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-warning-400">
            <Shield className="h-3 w-3" />
            Canal abierto
          </div>
          <h1 className="mt-4 text-3xl font-bold text-navy-500 md:text-4xl">
            Denunciá uso indebido del Sello
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-navy-300 md:text-base">
            Si encontrás un producto que usa el Sello Ancestral Seed
            SIN tener certificación vigente, o que muestra información
            distinta a la que el titular declaró, este es el canal
            oficial. El equipo de Legal revisa cada caso y aplica las
            sanciones del Reglamento (art. 5 y 6).
          </p>
        </header>

        <div className="mt-8 flex gap-2 border-b border-neutral-200">
          <button
            type="button"
            onClick={() => setMode('submit')}
            className={`border-b-2 px-4 pb-2 text-sm font-bold transition-colors ${
              mode === 'submit'
                ? 'border-navy-500 text-navy-500'
                : 'border-transparent text-navy-300 hover:text-navy-500'
            }`}
          >
            Nueva denuncia
          </button>
          <button
            type="button"
            onClick={() => setMode('check')}
            className={`border-b-2 px-4 pb-2 text-sm font-bold transition-colors ${
              mode === 'check'
                ? 'border-navy-500 text-navy-500'
                : 'border-transparent text-navy-300 hover:text-navy-500'
            }`}
          >
            Consultar estado
          </button>
        </div>

        {mode === 'submit' && !trackingId && (
          <section className="mt-6 space-y-5 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
            <div>
              <label className="text-xs font-bold text-navy-500">
                Tipo de denuncia
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as ReportType)}
                className="mt-1 h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
              >
                <option value="falsificacion">
                  Falsificación · usa el sello sin certificarse
                </option>
                <option value="mal-uso">
                  Mal uso · titular fuera de las condiciones
                </option>
                <option value="datos-falsos">
                  Datos falsos · información declarada no real
                </option>
                <option value="otro">Otro motivo</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-navy-500">
                URL del producto o tienda (opcional pero ayuda)
              </label>
              <input
                type="url"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="https://..."
                className="mt-1 h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-navy-500">
                Descripción detallada (mínimo 30 caracteres)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Contanos qué viste, dónde y cuándo. Mientras más detalles, mejor podemos investigar."
                className="mt-1 w-full resize-y rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-navy-300">
                {description.length}/30 mínimos
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-navy-500">
                Tu email · para seguimiento
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="vos@ejemplo.com"
                className="mt-1 h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-navy-300">
                Lo usamos solo para informarte la resolución. No lo
                compartimos.
              </p>
            </div>

            <button
              type="button"
              disabled={!canSubmit}
              onClick={() => {
                const id = `DEN-${Date.now().toString(36).toUpperCase().slice(-7)}`
                setTrackingId(id)
                toast.success(`Denuncia ${id} recibida — revisamos en 5 días hábiles`)
                // eslint-disable-next-line no-console
                console.info('[denuncias] nueva', {
                  id,
                  reportType,
                  productUrl,
                  contactEmail,
                })
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy-500 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-navy-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
              Enviar denuncia
            </button>

            <p className="text-center text-[11px] text-navy-300">
              Al enviar aceptás que tu denuncia será compartida con el
              equipo Legal de Ancestral Seed. No se publica tu identidad.
            </p>
          </section>
        )}

        {trackingId && mode === 'submit' && (
          <section className="mt-6 rounded-3xl border border-success-300 bg-success-100/30 p-8 text-center shadow-sm">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-300 text-white">
              <CheckCircle2 className="h-8 w-8" />
            </span>
            <h2 className="mt-4 text-2xl font-bold text-navy-500">
              Denuncia recibida
            </h2>
            <p className="mt-2 text-sm text-navy-500">
              Guardá este tracking ID para consultar el estado más adelante:
            </p>
            <p className="mt-3 inline-block rounded-xl bg-white px-4 py-2 font-mono text-base font-bold text-navy-500 ring-1 ring-neutral-200">
              {trackingId}
            </p>
            <p className="mx-auto mt-4 max-w-md text-sm text-navy-300">
              El equipo Legal revisa cada denuncia en máximo 5 días
              hábiles. Si la denuncia procede, el cert involucrado se
              suspende preventivamente y se aplica el procedimiento
              del Reglamento art. 6 (resolución en 30 días).
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-6 py-2.5 text-sm font-semibold text-navy-500 hover:bg-neutral-100"
            >
              Volver al inicio
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        )}

        {mode === 'check' && (
          <section className="mt-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-lg font-bold text-navy-500">
              Consultar estado de una denuncia
            </h2>
            <p className="mt-2 text-sm text-navy-300">
              Ingresá el tracking ID que recibiste al enviar.
            </p>
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={lookupId}
                onChange={(e) => setLookupId(e.target.value.toUpperCase())}
                placeholder="DEN-XXXXXXX"
                className="h-11 flex-1 rounded-lg border border-neutral-300 bg-white px-3 text-sm tabular-nums text-navy-500 focus:border-gold-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (!lookupId) return
                  toast.info(
                    `Tracking ID ${lookupId} — en cola de revisión (mock)`,
                  )
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-navy-500 px-5 text-sm font-bold text-white hover:bg-navy-400"
              >
                <Search className="h-4 w-4" />
                Consultar
              </button>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
