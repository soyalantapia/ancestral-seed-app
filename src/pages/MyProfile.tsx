import { useEffect, useRef, useState } from 'react'
import { useEscape } from '@/hooks/useEscape'
import {
  BookOpen,
  Camera,
  CheckCircle2,
  Circle,
  Eye,
  Filter,
  MapPin,
  MoreVertical,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Trash2,
  User as UserIcon,
  Users,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/auth'
import { mockCertifications } from '@/services/mocks/data'
import { cn } from '@/lib/utils'

const tabs = ['Mi perfil', 'Mis destacados', 'Mis certificados'] as const
type Tab = (typeof tabs)[number]

interface ProfileData {
  name: string
  email: string
  country: string
  region: string
  phone: string
  bio: string
  community: string
  role: string
  history: string
  coverUrl: string
  avatarUrl: string
}

const INITIAL: ProfileData = {
  name: 'Camila Montes',
  email: 'camila.montes@gmail.com',
  country: 'Colombia',
  region: 'Caribe colombiano',
  phone: '+57 2345-6789',
  bio: 'Soy artesana en filigrana ancestral, una técnica milenaria de orfebrería que trabajo como parte de una herencia cultural transmitida en mi familia. Mi práctica se basa en la réplica, preservación y continuidad de este saber ancestral, respetando sus procesos, tiempos y formas tradicionales.\n\nA través de mi trabajo en Alunawa, desarrollo piezas realizadas a mano con hilos finos de metal, explorando la filigrana como un lenguaje que conecta memoria, territorio e identidad.',
  community: 'Sierra Nevada de Santa Marta',
  role: 'Artesana',
  history:
    'Mi práctica artesanal se encuentra vinculada a una herencia cultural familiar de larga data, conectada con territorios y tradiciones de la Sierra Nevada de Santa Marta. Si bien mi vínculo es de descendencia lejana, estos saberes se han transmitido de generación en generación a través de la práctica, el respeto por el oficio y la valoración del trabajo manual.\n\nLa filigrana, como técnica ancestral, representa para mí un puente entre el pasado y mi presente. A través de ella, continúo un legado que prioriza la paciencia, la precisión y el sentido simbólico de cada pieza.',
  coverUrl: '',
  avatarUrl: '',
}

export default function MyProfile() {
  const [tab, setTab] = useState<Tab>('Mi perfil')
  const user = useAuthStore((s) => s.user)
  const [data, setData] = useState<ProfileData>({
    ...INITIAL,
    name: user?.name ?? INITIAL.name,
    email: user?.email ?? INITIAL.email,
    avatarUrl: user?.avatarUrl ?? '',
  })
  const [initial, setInitial] = useState<ProfileData>(data)
  const [editingPersonal, setEditingPersonal] = useState(false)

  const coverInputRef = useRef<HTMLInputElement>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const dirty = JSON.stringify(data) !== JSON.stringify(initial)

  // Block accidental leave
  useEffect(() => {
    if (!dirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  const update = (patch: Partial<ProfileData>) => setData((d) => ({ ...d, ...patch }))

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, key: 'coverUrl' | 'avatarUrl') => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    update({ [key]: url })
    toast.success(key === 'coverUrl' ? 'Portada actualizada · No olvides guardar' : 'Avatar actualizado · No olvides guardar')
  }

  const onSave = () => {
    setInitial(data)
    toast.success('Cambios guardados')
  }

  const onCancel = () => {
    setData(initial)
    setEditingPersonal(false)
    toast.info('Cambios descartados')
  }

  // Profile completion calculation
  const fields: Array<[string, boolean]> = [
    ['Nombre completo', Boolean(data.name)],
    ['Email', Boolean(data.email)],
    ['Teléfono', Boolean(data.phone)],
    ['País y región', Boolean(data.country && data.region)],
    ['Biografía', data.bio.length > 50],
    ['Comunidad y rol', Boolean(data.community && data.role)],
    ['Historia', data.history.length > 50],
    ['Foto de portada', Boolean(data.coverUrl)],
    ['Avatar personalizado', Boolean(data.avatarUrl)],
  ]
  const completedCount = fields.filter(([, ok]) => ok).length
  const completionPct = Math.round((completedCount / fields.length) * 100)

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-8 md:px-10 md:py-10">
      <h1 className="text-2xl font-bold text-navy-500 md:text-[28px]">Mi perfil</h1>
      <p className="mt-1 text-sm text-navy-300 md:text-base">
        Administrá tu perfil y tus destacados, y visualizá tus certificaciones públicas.
      </p>

      {/* Profile completion */}
      {completionPct < 100 && tab === 'Mi perfil' && (
        <div className="mt-6 overflow-hidden rounded-3xl border border-gold-300 bg-gold-100/50 p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-navy-500">
                Completá tu perfil para destacar tu trabajo
              </p>
              <p className="mt-1 text-xs text-navy-300 md:text-sm">
                {completedCount} de {fields.length} secciones completadas. Un
                perfil completo aumenta tus chances de ser destacado.
              </p>
            </div>
            <span className="rounded-full bg-gold-500 px-3 py-1 text-sm font-bold text-navy-500">
              {completionPct}%
            </span>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/60">
            <div
              className="h-full rounded-full bg-gold-500 transition-all"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <ul className="mt-4 grid grid-cols-1 gap-1.5 text-xs md:grid-cols-3">
            {fields.map(([label, ok]) => (
              <li key={label} className="flex items-center gap-2">
                {ok ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success-300" />
                ) : (
                  <Circle className="h-3.5 w-3.5 shrink-0 text-navy-300" />
                )}
                <span className={ok ? 'text-navy-500' : 'text-navy-300'}>{label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <TabButton key={t} active={tab === t} onClick={() => setTab(t)}>
              {t}
            </TabButton>
          ))}
        </div>
        <button
          type="button"
          onClick={() => toast.info('Vista previa pública del perfil')}
          className="inline-flex items-center gap-2 rounded-full bg-neutral-200 px-4 py-2 text-sm font-semibold text-navy-500 transition-colors hover:bg-neutral-300"
        >
          Ver vista previa
          <Eye className="h-4 w-4" />
        </button>
      </div>

      {tab === 'Mi perfil' && (
        <div className="mt-8 space-y-6">
          {/* Identity hero card — cover + avatar + name + role */}
          <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
            <div className="relative">
              {data.coverUrl ? (
                <img src={data.coverUrl} alt="Portada" className="aspect-[16/5] w-full object-cover md:aspect-[16/4]" />
              ) : (
                <div className="flex aspect-[16/5] w-full items-center justify-center bg-gradient-to-br from-neutral-300 via-gold-100 to-neutral-200 text-sm text-navy-500/60 md:aspect-[16/4]">
                  Sin portada
                </div>
              )}
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-navy-500 shadow-md backdrop-blur transition-colors hover:bg-white"
              >
                <Camera className="h-3.5 w-3.5" />
                Cambiar portada
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleFile(e, 'coverUrl')}
              />
            </div>

            <div className="flex flex-col gap-4 px-6 pb-6 md:flex-row md:items-end md:gap-6 md:px-8 md:pb-8">
              <div className="relative -mt-14 md:-mt-16">
                <img
                  src={data.avatarUrl || 'https://i.pravatar.cc/300?img=47'}
                  alt={data.name}
                  className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-md md:h-32 md:w-32"
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 text-navy-500 shadow-md transition-colors hover:bg-gold-400"
                  aria-label="Cambiar avatar"
                >
                  <Camera className="h-4 w-4" />
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => handleFile(e, 'avatarUrl')}
                />
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-navy-500 md:text-[26px]">
                  {data.name}
                </h2>
                <p className="mt-1 text-sm text-navy-300">
                  {data.role}
                  {data.community && (
                    <>
                      {' · '}
                      <span>{data.community}</span>
                    </>
                  )}
                </p>
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-navy-300">
                  <MapPin className="h-3.5 w-3.5" />
                  {data.country}
                  {data.region && ` · ${data.region}`}
                </p>
              </div>
            </div>

            {/* Stats row */}
            <dl className="grid grid-cols-3 divide-x divide-neutral-200 border-t border-neutral-200 bg-neutral-100/60 text-center">
              <div className="px-3 py-4">
                <dt className="text-[11px] font-medium uppercase tracking-widest text-navy-300">Perfil</dt>
                <dd className="mt-1 text-xl font-bold text-gold-700">{completionPct}%</dd>
              </div>
              <div className="px-3 py-4">
                <dt className="text-[11px] font-medium uppercase tracking-widest text-navy-300">Certificaciones</dt>
                <dd className="mt-1 text-xl font-bold text-navy-500">2</dd>
              </div>
              <div className="px-3 py-4">
                <dt className="text-[11px] font-medium uppercase tracking-widest text-navy-300">Antigüedad</dt>
                <dd className="mt-1 text-xl font-bold text-navy-500">8 meses</dd>
              </div>
            </dl>
          </section>

          {/* Datos personales */}
          <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-100 text-gold-700">
                  <UserIcon className="h-4 w-4" />
                </span>
                <h3 className="text-base font-bold text-navy-500">Datos personales</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingPersonal((v) => !v)}
                className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-navy-500 transition-colors hover:bg-neutral-200"
              >
                <Pencil className="h-3.5 w-3.5" />
                {editingPersonal ? 'Cerrar' : 'Editar'}
              </button>
            </div>

            {!editingPersonal ? (
              <dl className="mt-5 grid gap-x-6 gap-y-4 text-sm md:grid-cols-3 lg:grid-cols-5">
                <Stat label="Nombre completo" value={data.name} />
                <Stat label="Email" value={data.email} />
                <Stat label="País" value={data.country} />
                <Stat label="Región" value={data.region} />
                <Stat label="Teléfono" value={data.phone} />
              </dl>
            ) : (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Field label="Nombre completo" value={data.name} onChange={(v) => update({ name: v })} />
                <Field label="Email" value={data.email} onChange={(v) => update({ email: v })} />
                <Field label="País" value={data.country} onChange={(v) => update({ country: v })} />
                <Field label="Región" value={data.region} onChange={(v) => update({ region: v })} />
                <Field label="Teléfono" value={data.phone} onChange={(v) => update({ phone: v })} />
              </div>
            )}
          </section>

          {/* Sobre mí */}
          <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-100 text-gold-700">
                <BookOpen className="h-4 w-4" />
              </span>
              <h3 className="text-base font-bold text-navy-500">Sobre mí</h3>
            </div>
            <p className="mt-1 text-sm text-navy-300">
              Tu biografía personal. Aparece en tu perfil público y en el header de tus fichas.
            </p>
            <textarea
              rows={7}
              className="mt-3 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm leading-relaxed text-navy-500 focus:border-gold-500 focus:outline-none"
              value={data.bio}
              onChange={(e) => update({ bio: e.target.value })}
            />
            <p className="mt-1 text-right text-[11px] text-navy-300">{data.bio.length} caracteres</p>
          </section>

          {/* Datos de comunidad */}
          <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-100 text-gold-700">
                <Users className="h-4 w-4" />
              </span>
              <h3 className="text-base font-bold text-navy-500">Datos de comunidad</h3>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Comunidad" value={data.community} onChange={(v) => update({ community: v })} />
              <Field label="Rol" value={data.role} onChange={(v) => update({ role: v })} />
            </div>

            <div className="mt-6 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-100 text-gold-700">
                <Sparkles className="h-4 w-4" />
              </span>
              <h4 className="text-base font-bold text-navy-500">Historia</h4>
            </div>
            <p className="mt-1 text-sm text-navy-300">
              Podés compartir una breve historia sobre tu comunidad, su origen o lo que representa.
            </p>
            <textarea
              rows={7}
              className="mt-3 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm leading-relaxed text-navy-500 focus:border-gold-500 focus:outline-none"
              value={data.history}
              onChange={(e) => update({ history: e.target.value })}
            />
          </section>
        </div>
      )}

      {tab === 'Mis destacados' && <Highlights />}
      {tab === 'Mis certificados' && <CertificatesPlaceholder />}

      {/* Sticky save bar */}
      {dirty && tab === 'Mi perfil' && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full border border-neutral-200 bg-white px-3 py-2 shadow-2xl"
        >
          <div className="flex items-center gap-2 text-sm">
            <span className="px-2 font-medium text-navy-500">Tenés cambios sin guardar</span>
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center rounded-full px-3 py-1.5 font-semibold text-navy-300 hover:bg-neutral-100"
            >
              Descartar
            </button>
            <button
              type="button"
              onClick={onSave}
              className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 px-4 py-1.5 font-semibold text-navy-500 shadow-sm hover:bg-gold-400"
            >
              <Save className="h-4 w-4" />
              Guardar cambios
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-5 py-2 text-sm font-bold transition-colors',
        active
          ? 'bg-gold-100 text-gold-700 ring-1 ring-gold-300'
          : 'text-navy-300 hover:bg-neutral-100 hover:text-navy-500',
      )}
    >
      {children}
    </button>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold text-navy-500">{label}</dt>
      <dd className="mt-1 text-sm text-navy-300">{value}</dd>
    </div>
  )
}

function Field({
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
      <label className="text-xs font-bold text-navy-500">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
      />
    </div>
  )
}

// ─── Mis destacados ──────────────────────────────────────────────────────────

type HighlightStatus = 'Publicada' | 'Borrador'

interface HighlightItem {
  id: string
  title: string
  subtitle: string
  status: HighlightStatus
  date: string
  imageUrl: string
}

const highlightTabs = ['Todas', 'Publicadas', 'Borradores'] as const
type HighlightTab = (typeof highlightTabs)[number]

function Highlights() {
  const [tab, setTab] = useState<HighlightTab>('Todas')
  const [menuFor, setMenuFor] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEscape(Boolean(menuFor), () => setMenuFor(null))

  useEffect(() => {
    if (!menuFor) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuFor(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuFor])
  const [items, setItems] = useState<HighlightItem[]>(() =>
    mockCertifications.slice(0, 3).map((c, i) => ({
      id: c.id,
      title: c.title.split(' ')[0] + ' Tuberosum',
      subtitle: 'Carnaval de Negros y Blancos / Técnica ancestral "Filigrana"',
      status: i === 1 ? ('Borrador' as HighlightStatus) : ('Publicada' as HighlightStatus),
      date: '20 Ene, 2026',
      imageUrl: c.coverUrl,
    })),
  )

  const filtered = items.filter((it) => {
    if (tab === 'Todas') return true
    if (tab === 'Publicadas') return it.status === 'Publicada'
    return it.status === 'Borrador'
  })

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {highlightTabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                'rounded-full border px-5 py-2 text-sm font-semibold transition-colors',
                tab === t
                  ? 'border-navy-500 bg-info-100 text-navy-500'
                  : 'border-neutral-300 bg-white text-navy-500 hover:bg-neutral-100',
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => toast.info('Filtros de orden próximamente')}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-navy-500 transition-colors hover:bg-neutral-100"
          >
            Ordenar por
            <Filter className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              const newId = `h-${Date.now()}`
              setItems((prev) => [
                {
                  id: newId,
                  title: 'Nueva pieza',
                  subtitle: 'Editá los datos desde el menú',
                  status: 'Borrador',
                  date: new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }),
                  imageUrl: '',
                },
                ...prev,
              ])
              toast.success('Nueva pieza creada como borrador')
            }}
            className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-500 shadow-sm transition-colors hover:bg-gold-400"
          >
            <Plus className="h-4 w-4" />
            Agregar destacado
          </button>
        </div>
      </div>

      <ul className="mt-6 space-y-3">
        {filtered.map((it) => (
          <li
            key={it.id}
            className={cn(
              'relative flex items-center gap-4 rounded-2xl border bg-white p-3 shadow-sm transition-colors',
              it.status === 'Publicada' ? 'border-navy-500' : 'border-neutral-200',
            )}
          >
            <span
              className="text-navy-300 px-1 hover:text-navy-500 cursor-grab"
              aria-label="Arrastrar para reordenar"
              title="Arrastrar para reordenar (próximamente)"
            >
              ⋮⋮
            </span>
            {it.imageUrl ? (
              <img
                src={
                  it.imageUrl.startsWith('http')
                    ? it.imageUrl
                    : `${import.meta.env.BASE_URL}${it.imageUrl.replace(/^\//, '')}`
                }
                alt={it.title}
                className="h-20 w-20 shrink-0 rounded-xl object-cover"
                onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-neutral-200 text-xs text-navy-300">
                Sin imagen
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-navy-500">{it.title}</p>
              <p className="mt-1 truncate text-sm text-navy-300">{it.subtitle}</p>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 font-semibold',
                    it.status === 'Publicada'
                      ? 'bg-success-100 text-success-300 ring-1 ring-success-300/30'
                      : 'bg-gold-100 text-gold-700 ring-1 ring-gold-300/40',
                  )}
                >
                  {it.status}
                </span>
                <span className="text-navy-300">{it.date}</span>
              </div>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuFor(menuFor === it.id ? null : it.id)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200 text-navy-500 hover:bg-neutral-300"
                aria-label="Más opciones"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {menuFor === it.id && (
                <div
                  ref={menuRef}
                  className="absolute right-0 top-12 z-20 w-44 rounded-2xl border border-neutral-200 bg-white py-2 shadow-lg"
                >
                  <MenuButton icon={Pencil} label="Editar" onClick={() => { toast.info('Editar'); setMenuFor(null) }} />
                  <MenuButton icon={Eye} label="Vista previa" onClick={() => { toast.info('Vista previa'); setMenuFor(null) }} />
                  <MenuButton
                    icon={Trash2}
                    label="Eliminar"
                    danger
                    onClick={() => {
                      setItems((prev) => prev.filter((p) => p.id !== it.id))
                      setMenuFor(null)
                      toast.success('Pieza eliminada')
                    }}
                  />
                </div>
              )}
            </div>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="rounded-2xl border border-dashed border-neutral-300 p-10 text-center text-sm text-navy-300">
            No hay piezas en esta sección.
          </li>
        )}
      </ul>
    </div>
  )
}

function MenuButton({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: typeof Pencil
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-semibold transition-colors',
        danger ? 'text-error-400 hover:bg-error-100' : 'text-navy-500 hover:bg-neutral-100',
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )
}

function CertificatesPlaceholder() {
  return (
    <div className="mt-8 rounded-3xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
      <h3 className="text-lg font-bold text-navy-500">Mis certificados</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-navy-300">
        Vista pública de todos tus certificados emitidos. Una vez que tu primera
        certificación sea aprobada, va a aparecer acá con su hash blockchain.
      </p>
    </div>
  )
}
