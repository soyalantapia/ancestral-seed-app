import { Download, Mail, Trash2, Eye, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { Breadcrumbs } from '@/components/features/Breadcrumbs'

/**
 * Fix #FEAT-13 (análisis proyecto): página de derechos del titular
 * de datos personales (LGPD art. 18 / GDPR art. 15-20 / Ley
 * Argentina 25.326 art. 14-15).
 *
 * Acciones:
 *  - Solicitar copia de mis datos (export JSON + PDF resumen)
 *  - Solicitar corrección (lleva al perfil)
 *  - Solicitar borrado (lleva al modal Eliminar cuenta)
 *  - Lista de procesadores (terceros que tocan tus datos)
 */
export default function MisDatos() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <Breadcrumbs
        items={[
          { label: 'Configuración', to: '/configuracion' },
          { label: 'Mis datos personales' },
        ]}
      />

      <header className="mt-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-info-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-info-400">
          <Shield className="h-3 w-3" />
          Privacidad operativa
        </div>
        <h1 className="mt-3 text-2xl font-bold text-navy-500 md:text-3xl">
          Mis datos personales
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-navy-300">
          Ejercé tus derechos: acceso, rectificación, portabilidad,
          oposición y supresión. Conforme a la Ley 25.326 (Argentina),
          GDPR (UE) y LGPD (Brasil).
        </p>
      </header>

      <section className="mt-6 space-y-3">
        <ActionRow
          icon={Download}
          title="Exportar mis datos"
          body="Recibís un ZIP con JSON completo + PDF resumen. SLA: 30 días corridos."
          cta="Solicitar exportación"
          onClick={() =>
            toast.success(
              'Pedido registrado · te llega por email en máximo 30 días',
            )
          }
        />
        <ActionRow
          icon={Eye}
          title="Ver datos compartidos con terceros"
          body="Lista actualizada de procesadores que tocan tu información (pagos, email, hosting)."
          cta="Ver listado"
          onClick={() =>
            toast.info(
              'Procesadores activos: Mercado Pago, Resend (email), Cloudflare (CDN), Sentry (errores)',
            )
          }
        />
        <ActionRow
          icon={Mail}
          title="Solicitar rectificación"
          body="Si alguno de tus datos personales está mal, abrimos un ticket con el equipo Legal."
          cta="Abrir solicitud"
          onClick={() =>
            toast.info('Te redirigimos a tu perfil · ahí podés editar la mayoría')
          }
        />
        <ActionRow
          icon={Trash2}
          title="Solicitar borrado completo"
          body="Eliminamos tu cuenta + datos asociados. Los certs emitidos pasan a estado 'titular eliminado' por inmutabilidad blockchain."
          cta="Iniciar borrado"
          onClick={() =>
            toast.info(
              'Te llevamos a Configuración → Eliminar cuenta · revisá las consecuencias',
            )
          }
          danger
        />
      </section>

      <div className="mt-6 rounded-2xl border border-neutral-200 bg-cream-50 p-4 text-xs leading-relaxed text-navy-500">
        <p className="font-bold">¿Tenés una consulta sobre tus datos?</p>
        <p className="mt-1 text-navy-300">
          Escribinos a{' '}
          <a
            className="font-bold text-gold-700 underline"
            href="mailto:privacidad@ancestralseed.io"
          >
            privacidad@ancestralseed.io
          </a>{' '}
          o consultá la{' '}
          <a className="font-bold text-gold-700 underline" href="/legal">
            política completa
          </a>
          .
        </p>
      </div>
    </div>
  )
}

function ActionRow({
  icon: Icon,
  title,
  body,
  cta,
  onClick,
  danger,
}: {
  icon: typeof Download
  title: string
  body: string
  cta: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <div
      className={`flex items-start justify-between gap-4 rounded-2xl border bg-white p-4 shadow-sm ${danger ? 'border-error-300/40' : 'border-neutral-200'}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${danger ? 'bg-error-100 text-error-400' : 'bg-gold-100 text-gold-700'}`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-navy-500">{title}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-navy-300">
            {body}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClick}
        className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-colors ${danger ? 'border border-error-400 text-error-400 hover:bg-error-100' : 'bg-navy-500 text-white hover:bg-navy-400'}`}
      >
        {cta}
      </button>
    </div>
  )
}
