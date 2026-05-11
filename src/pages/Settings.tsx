import { useMemo, useState, type ComponentType } from 'react'
import {
  ChevronDown,
  CreditCard,
  Eye,
  EyeOff,
  Mail,
  Search,
  Trash2,
  UserCog,
} from 'lucide-react'
import { toast } from 'sonner'
import { useSettingsStore } from '@/store/settings'
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

      {/* Danger */}
      <Group title="Zona de peligro" hint="Desactivá temporalmente o eliminá la cuenta permanentemente.">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => toast.info('Cuenta desactivada temporalmente')}
            className="inline-flex items-center rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-navy-500 transition-colors hover:bg-neutral-100"
          >
            Desactivar cuenta
          </button>
          <button
            type="button"
            onClick={() => toast.error('Acción crítica — confirmación por email requerida')}
            className="inline-flex items-center gap-2 rounded-full bg-error-400 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-error-300"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar cuenta
          </button>
        </div>
      </Group>
    </div>
  )
}

function BillingSection() {
  const s = useSettingsStore()
  return (
    <div className="space-y-8">
      <Group title="Métodos de pago" hint="Tarjetas y cuentas guardadas para futuras facturas.">
        <div className="rounded-2xl border border-dashed border-neutral-300 p-6 text-center">
          <CreditCard className="mx-auto h-7 w-7 text-navy-300" />
          <p className="mt-2 text-sm font-semibold text-navy-500">No tenés métodos de pago</p>
          <p className="text-xs text-navy-300">Agregá uno para próximas facturas</p>
          <button
            type="button"
            onClick={() => toast.info('Integración de pagos próximamente')}
            className="mt-3 inline-flex items-center rounded-full bg-gold-500 px-4 py-2 text-xs font-bold text-navy-500 hover:bg-gold-400"
          >
            Agregar método
          </button>
        </div>
      </Group>

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
  children: React.ReactNode
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

