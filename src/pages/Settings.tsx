import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const tabs = [
  'Seguridad y acceso',
  'Privacidad y visibilidad',
  'Notificaciones',
  'Pagos y facturación',
] as const

type Tab = (typeof tabs)[number]

export default function Settings() {
  const [tab, setTab] = useState<Tab>('Seguridad y acceso')

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-8 md:px-10 md:py-10">
      <h1 className="text-2xl font-bold text-navy-500 md:text-[28px]">
        Configuración
      </h1>
      <p className="mt-1 text-sm text-navy-300 md:text-base">
        Gestioná tus preferencias, seguridad y métodos de pago.
      </p>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'rounded-full px-5 py-2 text-sm font-bold transition-colors',
              tab === t
                ? 'bg-gold-100 text-gold-700 ring-1 ring-gold-300'
                : 'text-navy-300 hover:bg-neutral-100 hover:text-navy-500',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === 'Seguridad y acceso' && <SecurityTab />}
        {tab === 'Privacidad y visibilidad' && <PrivacyTab />}
        {tab === 'Notificaciones' && <NotificationsTab />}
        {tab === 'Pagos y facturación' && <BillingTab />}
      </div>
    </div>
  )
}

// ─── Seguridad ──────────────────────────────────────────────────────────────

function SecurityTab() {
  const [email, setEmail] = useState('lorem.email@gmail.com')
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [repeat, setRepeat] = useState('')
  const [show1, setShow1] = useState(false)
  const [show2, setShow2] = useState(false)
  const [show3, setShow3] = useState(false)

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-lg font-bold text-navy-500">Seguridad y acceso</h2>
        <p className="mt-1 text-sm text-navy-300">
          Gestioná la seguridad de tu cuenta y actualizá tus datos de acceso.
        </p>
      </section>

      <section>
        <h3 className="text-base font-bold text-navy-500">Cambiar email</h3>
        <p className="mt-1 text-sm text-navy-300">
          Actualizá el correo que usás para iniciar sesión en la plataforma.
        </p>
        <div className="mt-5 max-w-xl">
          <label className="text-sm font-bold text-navy-500">
            Actualizar correo electrónico
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 h-12 w-full rounded-lg border border-neutral-300 bg-white px-4 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
          />
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() =>
                toast.success('Te enviamos un mail para confirmar el cambio')
              }
              className="inline-flex items-center rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-500 shadow-sm transition-colors hover:bg-gold-400"
            >
              Actualizar correo
            </button>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-base font-bold text-navy-500">Cambiar contraseña</h3>
        <p className="mt-1 text-sm text-navy-300">
          Actualizá tu contraseña y protegé el acceso a tu cuenta.
        </p>
        <div className="mt-5 max-w-xl space-y-4">
          <PasswordField
            label="Contraseña actual"
            value={current}
            onChange={setCurrent}
            show={show1}
            toggle={() => setShow1((s) => !s)}
          />
          <PasswordField
            label="Nueva contraseña"
            value={next}
            onChange={setNext}
            show={show2}
            toggle={() => setShow2((s) => !s)}
          />
          <PasswordField
            label="Repetir nueva contraseña"
            value={repeat}
            onChange={setRepeat}
            show={show3}
            toggle={() => setShow3((s) => !s)}
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (!current || !next) return toast.error('Completá los campos')
                if (next !== repeat) return toast.error('Las contraseñas no coinciden')
                toast.success('Contraseña actualizada')
                setCurrent(''); setNext(''); setRepeat('')
              }}
              className="inline-flex items-center rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-500 shadow-sm transition-colors hover:bg-gold-400"
            >
              Guardar cambios
            </button>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-base font-bold text-navy-500">
          Desactivar o eliminar cuenta
        </h3>
        <p className="mt-1 text-sm text-navy-300">
          Podés desactivar temporalmente tu cuenta o solicitar su eliminación
          permanente.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => toast.info('Cuenta desactivada temporalmente')}
            className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-navy-500 transition-colors hover:bg-neutral-100"
          >
            Desactivar cuenta
          </button>
          <button
            type="button"
            onClick={() => toast.error('Acción crítica — necesitamos confirmación por email')}
            className="inline-flex items-center rounded-full bg-navy-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-400"
          >
            Eliminar cuenta
          </button>
        </div>
      </section>
    </div>
  )
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  toggle,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  show: boolean
  toggle: () => void
}) {
  return (
    <div>
      <label className="text-sm font-bold text-navy-500">{label}</label>
      <div className="relative mt-2">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-full rounded-lg border border-neutral-300 bg-white pl-4 pr-12 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-navy-500 hover:bg-neutral-200"
          aria-label={show ? 'Ocultar' : 'Mostrar'}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

// ─── Privacidad ─────────────────────────────────────────────────────────────

function PrivacyTab() {
  const [profilePublic, setProfilePublic] = useState(true)
  const [showLocation, setShowLocation] = useState(false)
  const [showContact, setShowContact] = useState(true)
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-bold text-navy-500">Privacidad y visibilidad</h2>
        <p className="mt-1 text-sm text-navy-300">
          Controlá qué información querés mostrar en tu perfil público y en el
          directorio.
        </p>
      </section>
      <Toggle
        label="Perfil público visible en el directorio"
        hint="Cuando está activado, tu perfil aparece en el directorio público de Ancestral Seed."
        value={profilePublic}
        onChange={setProfilePublic}
      />
      <Toggle
        label="Mostrar mi ubicación"
        hint="Muestra país, región y comunidad en tu perfil público."
        value={showLocation}
        onChange={setShowLocation}
      />
      <Toggle
        label="Mostrar mis datos de contacto"
        hint="Permite que personas interesadas te contacten directamente desde tu ficha."
        value={showContact}
        onChange={setShowContact}
      />
    </div>
  )
}

function Toggle({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-6 rounded-2xl border border-neutral-200 bg-white p-5">
      <div>
        <p className="text-sm font-bold text-navy-500">{label}</p>
        <p className="mt-1 text-sm text-navy-300">{hint}</p>
      </div>
      <button
        type="button"
        onClick={() => {
          const next = !value
          onChange(next)
          toast.success(`${label} ${next ? 'activado' : 'desactivado'}`)
        }}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors',
          value ? 'bg-gold-500' : 'bg-neutral-300',
        )}
        role="switch"
        aria-checked={value}
      >
        <span
          className={cn(
            'absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all',
            value ? 'left-6' : 'left-1',
          )}
        />
      </button>
    </div>
  )
}

// ─── Notificaciones ────────────────────────────────────────────────────────

function NotificationsTab() {
  const [emailUpdates, setEmailUpdates] = useState(true)
  const [emailAudit, setEmailAudit] = useState(true)
  const [pushUpdates, setPushUpdates] = useState(true)
  const [weekly, setWeekly] = useState(false)
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-bold text-navy-500">Notificaciones</h2>
        <p className="mt-1 text-sm text-navy-300">
          Elegí qué eventos querés recibir por correo y dentro de la plataforma.
        </p>
      </section>
      <Toggle
        label="Avisos por correo de actualizaciones"
        hint="Cuando hay novedad en tu solicitud (estado, mensajes del tutor, etc.)."
        value={emailUpdates}
        onChange={setEmailUpdates}
      />
      <Toggle
        label="Avisos por correo de auditorías"
        hint="Cuando se programe, reprograme o complete una auditoría."
        value={emailAudit}
        onChange={setEmailAudit}
      />
      <Toggle
        label="Notificaciones dentro de la plataforma"
        hint="Avisos visibles en la campana del header."
        value={pushUpdates}
        onChange={setPushUpdates}
      />
      <Toggle
        label="Resumen semanal"
        hint="Un correo cada lunes con todo lo que pasó la semana anterior."
        value={weekly}
        onChange={setWeekly}
      />
    </div>
  )
}

// ─── Pagos ─────────────────────────────────────────────────────────────────

function BillingTab() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-bold text-navy-500">Pagos y facturación</h2>
        <p className="mt-1 text-sm text-navy-300">
          Tus métodos de pago, historial de facturas y datos fiscales.
        </p>
      </section>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-navy-500">Método de pago</p>
        <p className="mt-1 text-sm text-navy-300">
          No tenés métodos de pago guardados.
        </p>
        <button
          type="button"
          onClick={() => toast.info('Próximamente')}
          className="mt-4 inline-flex items-center rounded-full bg-gold-500 px-5 py-2.5 text-sm font-semibold text-navy-500 shadow-sm transition-colors hover:bg-gold-400"
        >
          Agregar método de pago
        </button>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-navy-500">Historial de facturas</p>
        <p className="mt-1 text-sm text-navy-300">
          Aún no hay facturas emitidas.
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-navy-500">Datos fiscales</p>
        <p className="mt-1 text-sm text-navy-300">
          Razón social, CUIT/NIT y dirección de facturación.
        </p>
        <button
          type="button"
          onClick={() => toast.info('Próximamente')}
          className="mt-4 inline-flex items-center rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-navy-500 transition-colors hover:bg-neutral-100"
        >
          Editar datos fiscales
        </button>
      </div>
    </div>
  )
}
