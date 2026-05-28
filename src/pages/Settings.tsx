import { useMemo, useState, type ComponentType, type ReactNode } from 'react'
import {
  AlertTriangle,
  ChevronDown,
  CreditCard,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Pause,
  Search,
  Trash2,
  UserCog,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { useSettingsStore } from '@/store/settings'
import { ThemeToggle } from '@/components/features/ThemeToggle'
import { mockCertificationRequests } from '@/services/mocks/data'
import { cn } from '@/lib/utils'

// ─── Tab schema (extensible) ─────────────────────────────────────────────────

interface Tab {
  id: string
  label: string
  icon: ComponentType<{ className?: string }>
  description: string
  keywords: string[]
  badge?: 'warning' | 'info'
}

const TABS: Tab[] = [
  {
    id: 'account',
    label: 'Cuenta',
    icon: UserCog,
    description: 'Email, contraseña y datos de acceso.',
    keywords: ['email', 'contraseña', 'password', 'eliminar', 'desactivar'],
  },
  {
    id: 'billing',
    label: 'Método de pago',
    icon: CreditCard,
    description: 'Métodos de pago, historial y datos fiscales.',
    keywords: ['pago', 'factura', 'cuit', 'fiscal', 'cobranza'],
  },
]

export default function Settings() {
  const [active, setActive] = useState<string>('account')
  const [search, setSearch] = useState('')
  const [tabsOpen, setTabsOpen] = useState(false)

  const filteredTabs = useMemo(() => {
    if (!search.trim()) return TABS
    const q = search.toLowerCase()
    return TABS.filter(
      (t) =>
        t.label.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.keywords.some((k) => k.includes(q)),
    )
  }, [search])

  const currentTab = TABS.find((t) => t.id === active) ?? TABS[0]

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-navy-500 md:text-[28px]">
          Configuración
        </h1>
        <p className="mt-1 text-sm text-navy-300 md:text-base">
          Gestioná tus preferencias, seguridad y métodos de pago.
        </p>
      </header>

      <CriticalBanners onJumpTab={setActive} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]">
        {/* ─── Sidebar ─── */}
        <aside>
          {/* Mobile: dropdown */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setTabsOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-bold text-navy-500 shadow-sm"
            >
              <span className="flex items-center gap-2">
                <currentTab.icon className="h-4 w-4 text-gold-700" />
                {currentTab.label}
              </span>
              <ChevronDown className={cn('h-4 w-4 transition-transform', tabsOpen && 'rotate-180')} />
            </button>
            {tabsOpen && (
              <div className="mt-2 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-md">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setActive(t.id)
                      setTabsOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors',
                      active === t.id
                        ? 'bg-gold-100 font-bold text-gold-700'
                        : 'text-navy-500 hover:bg-neutral-100',
                    )}
                  >
                    <t.icon className="h-4 w-4" />
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop: sidebar */}
          <div className="sticky top-24 hidden md:block">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar configuración"
                className="h-10 w-full rounded-full border border-neutral-300 bg-white pl-9 pr-3 text-xs text-navy-500 placeholder:text-navy-300 focus:border-gold-500 focus:outline-none"
              />
            </div>

            <ul className="mt-4 space-y-1">
              {filteredTabs.map((t) => {
                const isActive = active === t.id
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => setActive(t.id)}
                      className={cn(
                        'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                        isActive
                          ? 'bg-gold-100 text-gold-700 ring-1 ring-gold-300/40'
                          : 'text-navy-500 hover:bg-neutral-100',
                      )}
                    >
                      <t.icon
                        className={cn('h-4 w-4 shrink-0', isActive ? 'text-gold-700' : 'text-navy-300')}
                      />
                      <span className="flex-1 text-left">{t.label}</span>
                      {t.badge === 'warning' && (
                        <span className="h-2 w-2 rounded-full bg-warning-400" />
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>

            {filteredTabs.length === 0 && (
              <p className="px-3 py-4 text-xs text-navy-300">
                Sin resultados para "{search}"
              </p>
            )}
          </div>
        </aside>

        {/* ─── Content ─── */}
        <section className="min-w-0 rounded-3xl border border-neutral-200 bg-white shadow-sm">
          <header className="border-b border-neutral-200 px-6 py-5 md:px-8">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                <currentTab.icon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-navy-500">{currentTab.label}</h2>
                <p className="mt-0.5 text-xs text-navy-300">{currentTab.description}</p>
              </div>
            </div>
          </header>

          <div className="px-6 py-6 md:px-8 md:py-8">
            {active === 'account' && <AccountSection />}
            {active === 'billing' && <BillingSection />}
          </div>
        </section>
      </div>
    </div>
  )
}

// ─── Critical banners ────────────────────────────────────────────────────────

function CriticalBanners({ onJumpTab }: { onJumpTab: (id: string) => void }) {
  const { emailVerified } = useSettingsStore()
  if (emailVerified) return null

  return (
    <div className="mb-6">
      <div className="flex items-start gap-3 rounded-2xl bg-warning-100 px-4 py-3 ring-1 ring-warning-300/40">
        <Mail className="mt-0.5 h-5 w-5 shrink-0 text-warning-400" />
        <div className="flex-1">
          <p className="text-sm font-bold text-navy-500">Verificá tu email</p>
          <p className="mt-0.5 text-xs text-navy-300">
            Confirmá tu correo para activar las notificaciones críticas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onJumpTab('account')}
          className="whitespace-nowrap rounded-full bg-navy-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-navy-400"
        >
          Reenviar email
        </button>
      </div>
    </div>
  )
}

// ─── Section components ─────────────────────────────────────────────────────

function AccountSection() {
  const { email, emailVerified, update } = useSettingsStore()
  const [draftEmail, setDraftEmail] = useState(email)
  const [show1, setShow1] = useState(false)
  const [show2, setShow2] = useState(false)
  const [show3, setShow3] = useState(false)
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [repeat, setRepeat] = useState('')
  const [deactivateOpen, setDeactivateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <div className="space-y-10">
      {/* Email */}
      <Group title="Email" hint="Usá un email donde podamos contactarte.">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <Label>Email actual</Label>
            <div className="relative mt-2">
              <input
                value={draftEmail}
                onChange={(e) => setDraftEmail(e.target.value)}
                className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-4 pr-28 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
              />
              <span
                className={cn(
                  'absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-2.5 py-1 text-[10px] font-bold',
                  emailVerified
                    ? 'bg-success-100 text-success-300 ring-1 ring-success-300/30'
                    : 'bg-warning-100 text-warning-400 ring-1 ring-warning-300/30',
                )}
              >
                {emailVerified ? 'Verificado' : 'Sin verificar'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              update({ email: draftEmail })
              toast.success('Email actualizado · Te enviamos un mail de confirmación')
            }}
            disabled={draftEmail === email}
            className="inline-flex h-11 items-center rounded-full bg-gold-500 px-5 text-sm font-bold text-navy-500 transition-colors hover:bg-gold-400 disabled:opacity-50"
          >
            Actualizar
          </button>
        </div>

        {!emailVerified && (
          <button
            type="button"
            onClick={() => {
              update({ emailVerified: true })
              toast.success('Email verificado (demo)')
            }}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-gold-700 hover:underline"
          >
            <Mail className="h-3.5 w-3.5" />
            Reenviar email de verificación
          </button>
        )}
      </Group>

      {/* Password */}
      <Group title="Contraseña" hint="Mínimo 8 caracteres. Recomendamos cambiarla cada 90 días.">
        <div className="space-y-4">
          <Password label="Contraseña actual" value={current} onChange={setCurrent} show={show1} toggle={() => setShow1((v) => !v)} />
          <Password label="Nueva contraseña" value={next} onChange={setNext} show={show2} toggle={() => setShow2((v) => !v)} />
          <Password label="Repetir nueva contraseña" value={repeat} onChange={setRepeat} show={show3} toggle={() => setShow3((v) => !v)} />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (!current || !next) return toast.error('Completá todos los campos')
                if (next !== repeat) return toast.error('Las contraseñas no coinciden')
                if (next.length < 8) return toast.error('Mínimo 8 caracteres')
                toast.success('Contraseña actualizada')
                setCurrent(''); setNext(''); setRepeat('')
              }}
              className="inline-flex h-11 items-center rounded-full bg-navy-500 px-5 text-sm font-bold text-white transition-colors hover:bg-navy-400"
            >
              Guardar contraseña
            </button>
          </div>
        </div>
      </Group>

      {/* Apariencia */}
      <Group title="Apariencia" hint="Elegí el tema. Sistema usa la preferencia de tu dispositivo.">
        <ThemeToggle variant="segmented" />
      </Group>

      {/* Danger */}
      <Group title="Zona de peligro" hint="Desactivá temporalmente o eliminá la cuenta permanentemente.">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setDeactivateOpen(true)}
            className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-navy-500 transition-colors hover:bg-neutral-100"
          >
            Desactivar cuenta
          </button>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-error-400 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-error-300"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar cuenta
          </button>
        </div>
      </Group>

      {deactivateOpen && (
        <DeactivateModal onClose={() => setDeactivateOpen(false)} />
      )}
      {deleteOpen && (
        <DeleteAccountModal
          email={email}
          onClose={() => setDeleteOpen(false)}
        />
      )}
    </div>
  )
}

interface SavedPaymentMethod {
  id: string
  brand: 'visa' | 'mastercard' | 'amex' | 'otra'
  last4: string
  holder: string
  expiry: string
}

function BillingSection() {
  const s = useSettingsStore()
  const [methods, setMethods] = useState<SavedPaymentMethod[]>([])
  const [addOpen, setAddOpen] = useState(false)

  const handleAddMethod = (pm: Omit<SavedPaymentMethod, 'id'>) => {
    const id = `pm-${Date.now()}`
    setMethods((prev) => [{ ...pm, id }, ...prev])
    setAddOpen(false)
    toast.success(`Tarjeta ${pm.brand.toUpperCase()} •••• ${pm.last4} agregada`)
  }

  return (
    <div className="space-y-8">
      <Group title="Métodos de pago" hint="Tarjetas y cuentas guardadas para futuras facturas.">
        {methods.length > 0 && (
          <ul className="mb-4 space-y-2">
            {methods.map((m) => (
              <li
                key={m.id}
                className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm"
              >
                <span className="flex h-10 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-navy-500 to-navy-400 text-[10px] font-bold uppercase tracking-widest text-white">
                  {m.brand}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-navy-500">
                    •••• •••• •••• {m.last4}
                  </p>
                  <p className="text-xs text-navy-300">
                    {m.holder} · vence {m.expiry}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMethods((prev) => prev.filter((x) => x.id !== m.id))
                    toast.success('Tarjeta eliminada')
                  }}
                  className="rounded-full p-2 text-navy-300 hover:bg-error-100 hover:text-error-400"
                  aria-label="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {methods.length === 0 && (
          <div className="rounded-2xl border border-dashed border-neutral-300 p-6 text-center">
            <CreditCard className="mx-auto h-7 w-7 text-navy-300" />
            <p className="mt-2 text-sm font-semibold text-navy-500">No tenés métodos de pago</p>
            <p className="text-xs text-navy-300">Agregá uno para próximas facturas</p>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="mt-3 inline-flex items-center rounded-full bg-gold-500 px-4 py-2 text-xs font-bold text-navy-500 hover:bg-gold-400"
            >
              Agregar método
            </button>
          </div>
        )}
        {methods.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 px-4 py-2 text-xs font-bold text-navy-500 hover:bg-gold-400"
            >
              <CreditCard className="h-3.5 w-3.5" />
              Agregar otra tarjeta
            </button>
          </div>
        )}
      </Group>

      {addOpen && (
        <AddPaymentModal
          onClose={() => setAddOpen(false)}
          onAdd={handleAddMethod}
        />
      )}

      <Group title="Moneda preferida" hint="Mostramos los importes en esta moneda.">
        <select
          value={s.defaultCurrency}
          onChange={(e) => { s.update({ defaultCurrency: e.target.value as typeof s.defaultCurrency }); toast.success('Moneda actualizada') }}
          className="h-11 w-full max-w-xs rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
        >
          <option value="ARS">ARS · Peso argentino</option>
          <option value="USD">USD · Dólar estadounidense</option>
          <option value="COP">COP · Peso colombiano</option>
          <option value="EUR">EUR · Euro</option>
        </select>
      </Group>

      <Group title="Datos fiscales" hint="Para emitir facturas a tu nombre.">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Razón social" value={s.fiscalName} onChange={(v) => s.update({ fiscalName: v })} />
          <TextField label="CUIT / NIT / Tax ID" value={s.fiscalId} onChange={(v) => s.update({ fiscalId: v })} />
          <div className="md:col-span-2">
            <TextField label="Dirección de facturación" value={s.fiscalAddress} onChange={(v) => s.update({ fiscalAddress: v })} />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => toast.success('Datos fiscales guardados')}
            className="inline-flex items-center rounded-full bg-gold-500 px-5 py-2 text-sm font-bold text-navy-500 hover:bg-gold-400"
          >
            Guardar datos fiscales
          </button>
        </div>
      </Group>

      <Group title="Historial de facturas" hint="Descargá tus facturas en PDF.">
        <p className="rounded-2xl border border-dashed border-neutral-300 p-6 text-center text-sm text-navy-300">
          Aún no hay facturas emitidas. Cuando recibas una, va a aparecer acá.
        </p>
      </Group>
    </div>
  )
}


function Group({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: ReactNode
}) {
  return (
    <section>
      <header>
        <h3 className="text-sm font-bold text-navy-500">{title}</h3>
        {hint && <p className="mt-1 text-xs text-navy-300">{hint}</p>}
      </header>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-bold text-navy-500">{children}</label>
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
      />
    </div>
  )
}

function Password({
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
      <Label>{label}</Label>
      <div className="relative mt-2">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full rounded-lg border border-neutral-300 bg-white pl-4 pr-12 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-navy-500 hover:bg-neutral-200"
          aria-label={show ? 'Ocultar' : 'Mostrar'}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

// ─── Deactivate modal ────────────────────────────────────────────────────────

function DeactivateModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-500/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-warning-100 text-warning-400">
              <Pause className="h-5 w-5" />
            </span>
            <h3 className="text-lg font-bold text-navy-500">
              Desactivar cuenta
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-navy-300 hover:bg-neutral-100"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-3 text-sm text-navy-500">
          Vamos a pausar tu cuenta. Mientras esté desactivada:
        </p>
        <ul className="mt-3 space-y-1.5 text-xs text-navy-500">
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-warning-400" />
            No vas a recibir notificaciones por email ni in-app.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-warning-400" />
            Tu perfil público dejará de ser visible.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-warning-400" />
            Los procesos en curso quedan en pausa hasta que reactivés.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-success-300" />
            Podés reactivarla iniciando sesión nuevamente.
          </li>
        </ul>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm font-bold text-navy-500 hover:bg-neutral-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              toast.success('Cuenta desactivada · te enviamos un email con los pasos para reactivarla')
              onClose()
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-warning-400 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-warning-300"
          >
            <Pause className="h-4 w-4" />
            Desactivar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Delete account modal ────────────────────────────────────────────────────

function DeleteAccountModal({
  email,
  onClose,
}: {
  email: string
  onClose: () => void
}) {
  const [typed, setTyped] = useState('')
  const canDelete = typed.trim().toLowerCase() === email.trim().toLowerCase()

  /**
   * Fix QW-D2 (auditoría UX): antes el modal listaba abstractamente
   * "vas a eliminar tu cuenta, certificaciones, evidencias…". El user
   * con $45K abonados a una auditoría en curso no veía esa pérdida
   * concreta. Ahora computamos el summary real (solicitudes activas,
   * pagos abonados, evidencias subidas) y lo mostramos antes del
   * input de confirmación.
   *
   * Si el monto está pagado y la solicitud no es definitiva, esto
   * funciona como freno cognitivo (cae el dedo sobre Cancelar).
   */
  const summary = useMemo(() => {
    const activeRequests = mockCertificationRequests.filter(
      (r) => r.status === 'En curso' || r.status === 'En emisión',
    )
    const paidSum = mockCertificationRequests
      .flatMap((r) => r.payments ?? [])
      .filter((p) => p.status === 'paid')
      .reduce((acc, p) => acc + p.amount, 0)
    const evidencesCount = mockCertificationRequests
      .flatMap((r) => r.evidences ?? [])
      .length
    return { activeRequests, paidSum, evidencesCount }
  }, [])

  const fmtARS = (n: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(n)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-500/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-error-100 text-error-400">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <h3 className="text-lg font-bold text-navy-500">
              Eliminar cuenta
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-navy-300 hover:bg-neutral-100"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 rounded-2xl border border-error-300/60 bg-error-100/40 p-3">
          <p className="text-xs font-bold uppercase tracking-widest text-error-400">
            Acción irreversible
          </p>
          <p className="mt-1 text-xs text-navy-500">
            Vas a eliminar permanentemente tu cuenta, certificaciones, evidencias
            y métodos de pago. <strong>No se puede deshacer.</strong>
          </p>
          {/* Summary concreto de lo que el user pierde — pega más fuerte
              que la lista genérica. */}
          {(summary.activeRequests.length > 0 ||
            summary.paidSum > 0 ||
            summary.evidencesCount > 0) && (
            <ul className="mt-3 space-y-1 text-xs text-navy-500">
              {summary.activeRequests.length > 0 && (
                <li className="flex items-start gap-1.5">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-error-400" />
                  <span>
                    <strong className="tabular-nums">
                      {summary.activeRequests.length}
                    </strong>{' '}
                    solicitud
                    {summary.activeRequests.length === 1 ? '' : 'es'} en curso
                    se {summary.activeRequests.length === 1 ? 'pierde' : 'pierden'}
                  </span>
                </li>
              )}
              {summary.paidSum > 0 && (
                <li className="flex items-start gap-1.5">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-error-400" />
                  <span>
                    <strong className="tabular-nums">
                      {fmtARS(summary.paidSum)}
                    </strong>{' '}
                    ya abonados no son reembolsables
                  </span>
                </li>
              )}
              {summary.evidencesCount > 0 && (
                <li className="flex items-start gap-1.5">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-error-400" />
                  <span>
                    <strong className="tabular-nums">
                      {summary.evidencesCount}
                    </strong>{' '}
                    evidencia
                    {summary.evidencesCount === 1 ? '' : 's'} (fotos,
                    videos, documentos) se borr
                    {summary.evidencesCount === 1 ? 'a' : 'an'}
                  </span>
                </li>
              )}
            </ul>
          )}
          {summary.activeRequests.length > 0 && (
            <p className="mt-3 rounded-lg bg-white/60 p-2 text-[11px] text-navy-500">
              💡 Si solo querés tomarte un descanso, podés{' '}
              <strong>desactivar la cuenta</strong> en lugar de eliminarla —
              tus solicitudes en curso quedan congeladas y volvés cuando
              quieras.
            </p>
          )}
        </div>
        <div className="mt-4">
          <label className="text-xs font-bold text-navy-500">
            Para confirmar, escribí tu email <strong>{email}</strong>
          </label>
          <input
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={email}
            autoFocus
            className="mt-1 h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-error-400 focus:outline-none"
          />
        </div>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm font-bold text-navy-500 hover:bg-neutral-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!canDelete}
            onClick={() => {
              toast.success('Solicitud de eliminación enviada — vas a recibir un email para confirmarla')
              onClose()
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-error-400 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-error-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar para siempre
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Add payment method modal ────────────────────────────────────────────────

function detectBrand(num: string): SavedPaymentMethod['brand'] {
  const n = num.replace(/\s/g, '')
  if (/^4/.test(n)) return 'visa'
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'mastercard'
  if (/^3[47]/.test(n)) return 'amex'
  return 'otra'
}

function AddPaymentModal({
  onClose,
  onAdd,
}: {
  onClose: () => void
  onAdd: (pm: Omit<SavedPaymentMethod, 'id'>) => void
}) {
  const [holder, setHolder] = useState('')
  const [number, setNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')

  const digits = number.replace(/\D/g, '')
  const brand = detectBrand(number)
  const last4 = digits.slice(-4)
  const expiryOk = /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)
  const cvvOk = /^\d{3,4}$/.test(cvv)
  const canSubmit =
    holder.trim().length > 2 && digits.length >= 13 && expiryOk && cvvOk

  const formatNumber = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 19)
    return d.match(/.{1,4}/g)?.join(' ') ?? d
  }

  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4)
    if (d.length <= 2) return d
    return `${d.slice(0, 2)}/${d.slice(2)}`
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-500/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-500 text-white">
              <CreditCard className="h-5 w-5" />
            </span>
            <h3 className="text-lg font-bold text-navy-500">
              Agregar método de pago
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-navy-300 hover:bg-neutral-100"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Card preview */}
        <div className="mt-5 rounded-2xl bg-gradient-to-br from-navy-500 to-navy-400 p-5 text-white shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
              {brand}
            </span>
            <CreditCard className="h-5 w-5 opacity-80" />
          </div>
          <p className="mt-6 font-mono text-base tracking-widest">
            {number.padEnd(19, '•').replace(/\d{4}/g, '$& ').slice(0, 23) ||
              '•••• •••• •••• ••••'}
          </p>
          <div className="mt-4 flex items-center justify-between text-[11px]">
            <span className="uppercase opacity-80">
              {holder || 'NOMBRE Y APELLIDO'}
            </span>
            <span className="font-mono">{expiry || 'MM/AA'}</span>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <label className="block">
            <span className="text-xs font-bold text-navy-500">
              Titular de la tarjeta
            </span>
            <input
              type="text"
              value={holder}
              onChange={(e) => setHolder(e.target.value.toUpperCase())}
              placeholder="NOMBRE Y APELLIDO"
              className="mt-1 h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm uppercase text-navy-500 focus:border-gold-500 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-navy-500">
              Número de tarjeta
            </span>
            <input
              type="text"
              value={number}
              inputMode="numeric"
              onChange={(e) => setNumber(formatNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              className="mt-1 h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 font-mono text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-bold text-navy-500">
                Vencimiento
              </span>
              <input
                type="text"
                value={expiry}
                inputMode="numeric"
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/AA"
                className="mt-1 h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 font-mono text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-navy-500">CVV</span>
              <input
                type="password"
                value={cvv}
                inputMode="numeric"
                maxLength={4}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                placeholder="•••"
                className="mt-1 h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 font-mono text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
              />
            </label>
          </div>
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-navy-300">
          <Lock className="h-3 w-3" />
          Tus datos viajan cifrados. No los guardamos en texto plano.
        </p>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm font-bold text-navy-500 hover:bg-neutral-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() =>
              onAdd({
                brand,
                last4,
                holder: holder.trim(),
                expiry,
              })
            }
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-bold text-navy-500 shadow-sm hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CreditCard className="h-4 w-4" />
            Guardar tarjeta
          </button>
        </div>
      </div>
    </div>
  )
}

