import { useMemo, useState, type ComponentType } from 'react'
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Database,
  Download,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Mail,
  Monitor,
  Palette,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Trash2,
  UserCog,
} from 'lucide-react'
import { toast } from 'sonner'
import { useSettingsStore, type NotificationChannel } from '@/store/settings'
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
    id: 'security',
    label: 'Seguridad',
    icon: Shield,
    description: 'Doble factor, sesiones activas y alertas de inicio.',
    keywords: ['2fa', 'doble', 'sesion', 'login', 'seguridad'],
  },
  {
    id: 'privacy',
    label: 'Privacidad',
    icon: Lock,
    description: 'Qué información mostrar en tu perfil y al directorio.',
    keywords: ['perfil', 'publico', 'directorio', 'visibilidad', 'contacto'],
  },
  {
    id: 'notifications',
    label: 'Notificaciones',
    icon: Bell,
    description: 'Cómo querés que te avisemos las novedades.',
    keywords: ['notificacion', 'email', 'push', 'sms', 'resumen'],
  },
  {
    id: 'billing',
    label: 'Pagos y facturación',
    icon: CreditCard,
    description: 'Métodos de pago, historial y datos fiscales.',
    keywords: ['pago', 'factura', 'cuit', 'fiscal', 'cobranza'],
  },
  {
    id: 'appearance',
    label: 'Apariencia',
    icon: Palette,
    description: 'Tema, densidad e idioma de la plataforma.',
    keywords: ['tema', 'dark', 'modo oscuro', 'idioma', 'language'],
  },
  {
    id: 'data',
    label: 'Datos',
    icon: Database,
    description: 'Exportá tu información o solicitá la eliminación.',
    keywords: ['exportar', 'descargar', 'eliminar cuenta', 'gdpr'],
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
            {active === 'security' && <SecuritySection />}
            {active === 'privacy' && <PrivacySection />}
            {active === 'notifications' && <NotificationsSection />}
            {active === 'billing' && <BillingSection />}
            {active === 'appearance' && <AppearanceSection />}
            {active === 'data' && <DataSection />}
          </div>
        </section>
      </div>
    </div>
  )
}

// ─── Critical banners ────────────────────────────────────────────────────────

function CriticalBanners({ onJumpTab }: { onJumpTab: (id: string) => void }) {
  const { emailVerified, twoFactor } = useSettingsStore()
  const banners = [
    !emailVerified && {
      id: 'email',
      tone: 'warning' as const,
      icon: Mail,
      title: 'Verificá tu email',
      body: 'Confirmá tu correo para activar las notificaciones críticas.',
      action: 'Reenviar email',
      tabId: 'account',
    },
    !twoFactor && {
      id: '2fa',
      tone: 'info' as const,
      icon: ShieldAlert,
      title: 'Activá el doble factor (2FA)',
      body: 'Aumentá la seguridad de tu cuenta con un código adicional al iniciar sesión.',
      action: 'Activar 2FA',
      tabId: 'security',
    },
  ].filter(Boolean) as Array<{
    id: string
    tone: 'warning' | 'info'
    icon: typeof Mail
    title: string
    body: string
    action: string
    tabId: string
  }>

  if (banners.length === 0) return null

  return (
    <div className="mb-6 grid gap-3 md:grid-cols-2">
      {banners.map((b) => (
        <div
          key={b.id}
          className={cn(
            'flex items-start gap-3 rounded-2xl px-4 py-3 ring-1',
            b.tone === 'warning' && 'bg-warning-100 ring-warning-300/40',
            b.tone === 'info' && 'bg-info-100 ring-info-200',
          )}
        >
          <b.icon
            className={cn(
              'mt-0.5 h-5 w-5 shrink-0',
              b.tone === 'warning' && 'text-warning-400',
              b.tone === 'info' && 'text-info-400',
            )}
          />
          <div className="flex-1">
            <p className="text-sm font-bold text-navy-500">{b.title}</p>
            <p className="mt-0.5 text-xs text-navy-300">{b.body}</p>
          </div>
          <button
            type="button"
            onClick={() => onJumpTab(b.tabId)}
            className="whitespace-nowrap rounded-full bg-navy-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-navy-400"
          >
            {b.action}
          </button>
        </div>
      ))}
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

function SecuritySection() {
  const { twoFactor, sessionTimeout, loginNotifications, update } = useSettingsStore()
  return (
    <div className="space-y-8">
      <Toggle
        title="Doble factor de autenticación (2FA)"
        hint="Te pediremos un código adicional cuando inicies sesión desde un dispositivo nuevo."
        icon={ShieldCheck}
        value={twoFactor}
        onChange={(v) => {
          update({ twoFactor: v })
          toast.success(v ? '2FA activado' : '2FA desactivado')
        }}
        highlighted={!twoFactor}
      />

      <Group title="Sesión" hint="Configurá cuándo cerramos automáticamente tu sesión.">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Cerrar sesión tras inactividad</Label>
            <select
              value={sessionTimeout}
              onChange={(e) => {
                update({ sessionTimeout: Number(e.target.value) })
                toast.success('Tiempo de sesión actualizado')
              }}
              className="mt-2 h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
            >
              <option value={15}>15 minutos</option>
              <option value={30}>30 minutos</option>
              <option value={60}>1 hora</option>
              <option value={240}>4 horas</option>
              <option value={1440}>24 horas</option>
            </select>
          </div>
        </div>
      </Group>

      <Toggle
        title="Notificarme cuando alguien inicie sesión"
        hint="Recibí un mail cada vez que se ingrese a tu cuenta desde un dispositivo nuevo."
        icon={Bell}
        value={loginNotifications}
        onChange={(v) => {
          update({ loginNotifications: v })
          toast.success(v ? 'Alertas activadas' : 'Alertas desactivadas')
        }}
      />

      <Group title="Sesiones activas" hint="Dispositivos que tienen acceso a tu cuenta.">
        <ul className="divide-y divide-neutral-200 rounded-2xl border border-neutral-200">
          <SessionRow
            current
            device="MacBook Air · Safari"
            location="Buenos Aires, Argentina"
            when="Ahora mismo"
          />
          <SessionRow
            device="iPhone 14 · App Ancestral Seed"
            location="Buenos Aires, Argentina"
            when="hace 3 horas"
          />
          <SessionRow
            device="Chrome · Windows 11"
            location="Bogotá, Colombia"
            when="hace 2 días"
          />
        </ul>
        <button
          type="button"
          onClick={() => toast.success('Sesiones cerradas en todos los dispositivos')}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-error-400 hover:underline"
        >
          <ShieldAlert className="h-3.5 w-3.5" />
          Cerrar todas las demás sesiones
        </button>
      </Group>
    </div>
  )
}

function SessionRow({
  device,
  location,
  when,
  current,
}: {
  device: string
  location: string
  when: string
  current?: boolean
}) {
  return (
    <li className="flex items-center justify-between gap-3 p-4">
      <div className="flex items-center gap-3">
        <Monitor className="h-5 w-5 text-navy-300" />
        <div>
          <p className="text-sm font-bold text-navy-500">{device}</p>
          <p className="mt-0.5 text-xs text-navy-300">{location} · {when}</p>
        </div>
      </div>
      {current ? (
        <span className="rounded-full bg-success-100 px-2.5 py-0.5 text-[10px] font-bold text-success-300 ring-1 ring-success-300/30">
          Esta sesión
        </span>
      ) : (
        <button
          type="button"
          onClick={() => toast.success('Sesión cerrada')}
          className="text-xs font-semibold text-error-400 hover:underline"
        >
          Cerrar
        </button>
      )}
    </li>
  )
}

function PrivacySection() {
  const s = useSettingsStore()
  return (
    <div className="space-y-4">
      <Toggle title="Perfil público visible en el directorio" hint="Tu perfil aparece en el directorio público de Ancestral Seed." value={s.profilePublic} onChange={(v) => { s.update({ profilePublic: v }); toast.success('Visibilidad actualizada') }} />
      <Toggle title="Mostrar mi ubicación" hint="País, región y comunidad visibles en el perfil público." value={s.showLocation} onChange={(v) => { s.update({ showLocation: v }); toast.success('Ubicación actualizada') }} />
      <Toggle title="Mostrar mis datos de contacto" hint="Permite que personas interesadas te contacten desde tu ficha." value={s.showContact} onChange={(v) => { s.update({ showContact: v }); toast.success('Contacto actualizado') }} />
      <Toggle title="Permitir indexación de motores de búsqueda" hint="Google y otros buscadores pueden listar tu perfil." value={s.allowSearchEngines} onChange={(v) => { s.update({ allowSearchEngines: v }); toast.success('Indexación actualizada') }} />
      <Toggle title="Mostrar hash blockchain en la ficha pública" hint="Los visitantes pueden ver y copiar el hash de verificación." value={s.publicHashVisible} onChange={(v) => { s.update({ publicHashVisible: v }); toast.success('Hash actualizado') }} />
    </div>
  )
}

function NotificationsSection() {
  const s = useSettingsStore()
  const rows: Array<{ key: keyof typeof s; title: string; hint: string }> = [
    { key: 'notifAuditUpdates', title: 'Avances de auditoría', hint: 'Cambios de etapa, nuevas auditorías agendadas.' },
    { key: 'notifEvidenceRequests', title: 'Pedidos de evidencias', hint: 'El tutor solicita fotos, videos o documentos adicionales.' },
    { key: 'notifMessages', title: 'Mensajes', hint: 'Conversaciones con auditores y curadores.' },
    { key: 'notifPayments', title: 'Pagos', hint: 'Vencimientos, confirmaciones y recibos.' },
    { key: 'notifMarketing', title: 'Novedades de Ancestral Seed', hint: 'Eventos, nuevos auditores, mejoras de la plataforma.' },
  ]
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-neutral-200">
        <header className="grid grid-cols-[1fr_70px_60px_50px] gap-2 border-b border-neutral-200 bg-neutral-100 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-navy-300">
          <span>Tipo</span>
          <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> Email</span>
          <span className="flex items-center gap-1"><Bell className="h-3 w-3" /> App</span>
          <span className="flex items-center gap-1"><Smartphone className="h-3 w-3" /> SMS</span>
        </header>
        <ul className="divide-y divide-neutral-200">
          {rows.map((r) => {
            const ch = s[r.key] as NotificationChannel
            return (
              <li key={r.key} className="grid grid-cols-[1fr_70px_60px_50px] gap-2 px-4 py-3 text-sm">
                <div>
                  <p className="font-bold text-navy-500">{r.title}</p>
                  <p className="mt-0.5 text-xs text-navy-300">{r.hint}</p>
                </div>
                <Tiny value={ch.email} onChange={(v) => s.update({ [r.key]: { ...ch, email: v } } as Partial<typeof s>)} />
                <Tiny value={ch.inApp} onChange={(v) => s.update({ [r.key]: { ...ch, inApp: v } } as Partial<typeof s>)} />
                <Tiny value={ch.sms} onChange={(v) => s.update({ [r.key]: { ...ch, sms: v } } as Partial<typeof s>)} />
              </li>
            )
          })}
        </ul>
      </div>

      <Toggle
        title="Resumen semanal"
        hint="Email cada lunes con todo lo que pasó la semana anterior."
        value={s.weeklyDigest}
        onChange={(v) => { s.update({ weeklyDigest: v }); toast.success(v ? 'Resumen activado' : 'Resumen desactivado') }}
      />
    </div>
  )
}

function Tiny({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={cn(
        'relative h-5 w-9 self-center rounded-full transition-colors',
        value ? 'bg-gold-500' : 'bg-neutral-300',
      )}
      role="switch"
      aria-checked={value}
    >
      <span
        className={cn(
          'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all',
          value ? 'left-[18px]' : 'left-0.5',
        )}
      />
    </button>
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

function AppearanceSection() {
  const s = useSettingsStore()
  return (
    <div className="space-y-8">
      <Group title="Tema" hint="Elegí cómo se ve la plataforma.">
        <div className="grid grid-cols-3 gap-3">
          {(['light', 'dark', 'system'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { s.update({ theme: t }); toast.success(`Tema "${t}" aplicado (demo)`) }}
              className={cn(
                'rounded-2xl border-2 p-4 text-left transition-colors',
                s.theme === t ? 'border-gold-500 bg-gold-100/40' : 'border-neutral-300 hover:border-gold-300',
              )}
            >
              <p className="text-sm font-bold capitalize text-navy-500">{t === 'system' ? 'Sistema' : t === 'light' ? 'Claro' : 'Oscuro'}</p>
              <p className="mt-1 text-xs text-navy-300">
                {t === 'light' && 'Fondo claro, alto contraste'}
                {t === 'dark' && 'Fondo navy, descansa la vista'}
                {t === 'system' && 'Sigue la configuración de tu OS'}
              </p>
            </button>
          ))}
        </div>
      </Group>

      <Group title="Densidad de la interfaz" hint="Más compacto para más información visible.">
        <div className="flex gap-2">
          {(['compact', 'normal', 'comfortable'] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => { s.update({ density: d }); toast.success('Densidad actualizada') }}
              className={cn(
                'rounded-full border px-4 py-2 text-xs font-bold transition-colors',
                s.density === d
                  ? 'border-gold-500 bg-gold-100 text-gold-700'
                  : 'border-neutral-300 bg-white text-navy-500 hover:border-gold-300',
              )}
            >
              {d === 'compact' && 'Compacto'}
              {d === 'normal' && 'Normal'}
              {d === 'comfortable' && 'Espacioso'}
            </button>
          ))}
        </div>
      </Group>

      <Group title="Idioma y región" hint="Cómo formateamos fechas, monedas y textos.">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Idioma</Label>
            <select
              value={s.language}
              onChange={(e) => { s.update({ language: e.target.value as typeof s.language }); toast.success('Idioma actualizado') }}
              className="mt-2 h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
            >
              <option value="es-AR">Español rioplatense (AR)</option>
              <option value="es-MX">Español neutro (MX)</option>
              <option value="es-CO">Español colombiano</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <Label>Zona horaria</Label>
            <select
              value={s.timezone}
              onChange={(e) => { s.update({ timezone: e.target.value }); toast.success('Zona horaria actualizada') }}
              className="mt-2 h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
            >
              <option value="America/Argentina/Buenos_Aires">Buenos Aires (GMT-3)</option>
              <option value="America/Bogota">Bogotá (GMT-5)</option>
              <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
              <option value="America/Lima">Lima (GMT-5)</option>
              <option value="Europe/Madrid">Madrid (GMT+1)</option>
            </select>
          </div>
          <div>
            <Label>Formato de fecha</Label>
            <select
              value={s.dateFormat}
              onChange={(e) => { s.update({ dateFormat: e.target.value as typeof s.dateFormat }); toast.success('Formato actualizado') }}
              className="mt-2 h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
            >
              <option value="DD/MM/YYYY">31/12/2026</option>
              <option value="MM/DD/YYYY">12/31/2026</option>
              <option value="YYYY-MM-DD">2026-12-31</option>
            </select>
          </div>
        </div>
      </Group>
    </div>
  )
}

function DataSection() {
  return (
    <div className="space-y-6">
      <Group title="Exportar tus datos" hint="Descargá una copia de toda tu información en la plataforma.">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold text-navy-500">Pedir exportación</p>
            <p className="mt-0.5 text-xs text-navy-300">
              Te enviamos un ZIP con perfil + certificaciones + evidencias + historial.
            </p>
          </div>
          <button
            type="button"
            onClick={() => toast.success('Solicitud enviada · Te mandamos el ZIP por email en 24-48hs')}
            className="inline-flex items-center gap-2 rounded-full bg-navy-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-400"
          >
            <Download className="h-4 w-4" />
            Solicitar exportación
          </button>
        </div>
      </Group>

      <Group title="Eliminación de cuenta" hint="Elimina permanentemente tu cuenta y todos los datos asociados (GDPR/Ley de protección de datos).">
        <div className="rounded-2xl bg-error-100 p-4 ring-1 ring-error-300/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-error-400" />
            <div>
              <p className="text-sm font-bold text-error-400">Esta acción es irreversible</p>
              <p className="mt-1 text-xs text-navy-500">
                Tus certificaciones publicadas en blockchain permanecen visibles
                (no se pueden borrar) pero tu cuenta, perfil, evidencias y datos
                personales se eliminan en forma permanente.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toast.error('Para eliminar tu cuenta enviá un email a privacy@ancestralseed.com')}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-error-400 px-5 py-2.5 text-sm font-bold text-white hover:bg-error-300"
          >
            <Trash2 className="h-4 w-4" />
            Solicitar eliminación
          </button>
        </div>
      </Group>
    </div>
  )
}

// ─── Reusable bits ───────────────────────────────────────────────────────────

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

function Toggle({
  title,
  hint,
  value,
  onChange,
  icon: Icon,
  highlighted,
}: {
  title: string
  hint?: string
  value: boolean
  onChange: (v: boolean) => void
  icon?: ComponentType<{ className?: string }>
  highlighted?: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-6 rounded-2xl border p-5 transition-colors',
        highlighted
          ? 'border-warning-300 bg-warning-100/40'
          : 'border-neutral-200 bg-white',
      )}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <span
            className={cn(
              'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
              highlighted
                ? 'bg-warning-100 text-warning-400'
                : value
                ? 'bg-success-100 text-success-300'
                : 'bg-neutral-200 text-navy-300',
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
        )}
        <div>
          <p className="text-sm font-bold text-navy-500">{title}</p>
          {hint && <p className="mt-1 text-sm text-navy-300">{hint}</p>}
          {highlighted && !value && (
            <p className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-warning-400">
              <AlertCircle className="h-3.5 w-3.5" /> Recomendado
            </p>
          )}
          {value && Icon && (
            <p className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-success-300">
              <CheckCircle2 className="h-3.5 w-3.5" /> Activado
            </p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
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

// Re-export icon for sidebar global icon
void Globe
