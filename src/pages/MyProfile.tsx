import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEscape } from '@/hooks/useEscape'
import {
  ArrowRight,
  BookOpen,
  Camera,
  CheckCircle2,
  Circle,
  Eye,
  FileText,
  Filter,
  MapPin,
  MoreVertical,
  Paperclip,
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
import { ConfirmDialog } from '@/components/features/ConfirmDialog'
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

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Normaliza las URLs blob: para que el dirty check no se confunda.
 * Si el campo es un blob: URL lo colapsamos a un placeholder estable.
 * Ver fix V2-POS-19.
 */
function normalizeForDirty(p: ProfileData): ProfileData {
  return {
    ...p,
    coverUrl: p.coverUrl.startsWith('blob:') ? '<<blob>>' : p.coverUrl,
    avatarUrl: p.avatarUrl.startsWith('blob:') ? '<<blob>>' : p.avatarUrl,
  }
}

function isProfileDirty(data: ProfileData, initial: ProfileData): boolean {
  return (
    JSON.stringify(normalizeForDirty(data)) !==
    JSON.stringify(normalizeForDirty(initial))
  )
}

export default function MyProfile() {
  const [tab, setTab] = useState<Tab>('Mi perfil')
  // Fix V2-POS-12: parking del destino de tab mientras esperamos la
  // confirmación del ConfirmDialog (reemplazo del window.confirm).
  const [pendingTab, setPendingTab] = useState<Tab | null>(null)
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

  // Refs de cada sección — para que "Completar perfil" lleve al usuario
  // directo a lo que falta (scroll + activar el control correspondiente).
  const heroRef = useRef<HTMLElement>(null)
  const personalRef = useRef<HTMLElement>(null)
  const bioRef = useRef<HTMLElement>(null)
  const bioTextareaRef = useRef<HTMLTextAreaElement>(null)
  const communityRef = useRef<HTMLElement>(null)
  const historiaTextareaRef = useRef<HTMLTextAreaElement>(null)

  /**
   * Fix V2-POS-19 (auditoría v2): antes el dirty check era un
   * `JSON.stringify(data) !== JSON.stringify(initial)` puro. Eso
   * generaba un falso positivo cuando el user "Cambiar avatar" y
   * elegía el MISMO archivo — `URL.createObjectURL(file)` devuelve
   * un blob: distinto cada vez, así que `data.avatarUrl` siempre
   * cambiaba aunque la foto fuera la misma. El "Guardar" rojo y el
   * warning de salida aparecían sin razón visible para el user.
   *
   * Ahora normalizamos los blob: URLs antes de comparar. Si ambos
   * lados tienen blob:, los tratamos como "iguales" — el cambio real
   * solo se considera cuando se pasa de "sin foto" a "con foto" o
   * viceversa (cosa que sí impacta el perfil persistido).
   */
  const dirty = isProfileDirty(data, initial)

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

  /**
   * Fix V3-POS-09 + V4-POS-04 (auditoría v3+v4): el `useState`
   * lazy initializer corre UNA VEZ al mount. Si `useAuthStore`
   * carga al user async, el data queda con valores stale. Antes
   * un effect sincronizaba data + initial con el user actual,
   * SIEMPRE que no hubiera dirty.
   *
   * Edge V4-POS-04: si el user llegaba DURANTE dirty=true, el
   * effect NO actualizaba (bien — preserva edits). Pero el `initial`
   * quedaba con los valores VIEJOS pre-user — al hacer "Cancelar"
   * el form se reseteaba al estado pre-user, inconsistente con el
   * auth actual. Ahora cuando llega un user nuevo durante dirty=true
   * lo "encolamos" en `pendingUserSync` y lo aplicamos en cuanto
   * dirty vuelve a false (typical: user descarta o guarda).
   */
  const [pendingUserSync, setPendingUserSync] = useState<{
    name: string
    email: string
    avatarUrl: string
  } | null>(null)

  useEffect(() => {
    if (!user) return
    const sync = {
      name: user.name ?? data.name,
      email: user.email ?? data.email,
      avatarUrl: user.avatarUrl ?? data.avatarUrl,
    }
    if (dirty) {
      // Hay edits sin guardar; encolar para aplicar después.
      setPendingUserSync(sync)
      return
    }
    // No hay dirty — aplicar el sync inmediatamente.
    setData((d) => ({ ...d, ...sync }))
    setInitial((d) => ({ ...d, ...sync }))
    setPendingUserSync(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Aplicar el sync encolado cuando dirty vuelve a false.
  useEffect(() => {
    if (dirty || !pendingUserSync) return
    setData((d) => ({ ...d, ...pendingUserSync }))
    setInitial((d) => ({ ...d, ...pendingUserSync }))
    setPendingUserSync(null)
  }, [dirty, pendingUserSync])

  const update = (patch: Partial<ProfileData>) => setData((d) => ({ ...d, ...patch }))

  /**
   * Lleva al usuario al control de un ítem faltante del perfil: scrollea a
   * su sección y la "activa" (abre el editor / enfoca el campo / abre el
   * selector de foto). Así "Completar perfil" no solo dice qué falta — te
   * lleva a hacerlo, uno por uno.
   */
  const goToField = (label: string) => {
    const scroll = (ref: React.RefObject<HTMLElement | null>) =>
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    switch (label) {
      case 'Nombre completo':
      case 'Email':
      case 'Teléfono':
      case 'País y región':
        setEditingPersonal(true)
        setTimeout(() => scroll(personalRef), 60)
        break
      case 'Biografía':
        scroll(bioRef)
        setTimeout(() => bioTextareaRef.current?.focus(), 360)
        break
      case 'Comunidad y rol':
        scroll(communityRef)
        break
      case 'Historia':
        scroll(communityRef)
        setTimeout(() => historiaTextareaRef.current?.focus(), 360)
        break
      case 'Foto de portada':
        scroll(heroRef)
        coverInputRef.current?.click()
        break
      case 'Avatar personalizado':
        scroll(heroRef)
        avatarInputRef.current?.click()
        break
    }
  }

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
    <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 md:px-10 md:py-10">
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
          <div className="mt-4">
            {/* CTA principal: te lleva a la primera cosa que falta y te
                va guiando (al completarla, apunta a la siguiente). */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const next = fields.find(([, ok]) => !ok)
                  if (next) goToField(next[0])
                }}
                className="inline-flex items-center gap-2 rounded-full bg-navy-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-navy-400"
              >
                Completar perfil
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="text-xs text-navy-300 md:text-sm">
                Te llevamos a cada cosa que falta, una por una.
              </p>
            </div>

            {/* Chips: tocá uno para ir directo a ese ítem. */}
            <div className="mt-3 flex flex-wrap gap-2">
              {fields
                .filter(([, ok]) => !ok)
                .map(([label]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => goToField(label)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gold-300 bg-white px-3 py-1 text-xs font-semibold text-navy-500 transition-colors hover:border-gold-500 hover:bg-gold-100"
                  >
                    <Circle className="h-3 w-3 text-gold-700" />
                    {label}
                  </button>
                ))}
            </div>

            <details className="mt-3 text-xs md:text-sm">
              <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-xs font-semibold text-navy-400 underline-offset-2 hover:text-navy-500 hover:underline">
                Ver todo el checklist
              </summary>
              <ul className="mt-2 grid grid-cols-1 gap-1.5 text-xs md:grid-cols-3">
                {fields.map(([label, ok]) =>
                  ok ? (
                    <li key={label} className="flex items-center gap-2 px-1 py-0.5">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success-300" />
                      <span className="text-navy-500">{label}</span>
                    </li>
                  ) : (
                    <li key={label}>
                      <button
                        type="button"
                        onClick={() => goToField(label)}
                        className="flex w-full items-center gap-2 rounded-md px-1 py-0.5 text-left transition-colors hover:bg-gold-100"
                      >
                        <Circle className="h-3.5 w-3.5 shrink-0 text-navy-300" />
                        <span className="text-navy-400 underline-offset-2 hover:underline">
                          {label}
                        </span>
                      </button>
                    </li>
                  ),
                )}
              </ul>
            </details>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <TabButton
              key={t}
              active={tab === t}
              onClick={() => {
                // Fix SM5 (#POS-29, auditoría UX): si hay cambios sin
                // guardar en "Mi perfil", confirmar antes de cambiar
                // de tab. Antes silenciosamente el state se mantenía
                // pero el user no sabía si los datos seguían ahí.
                //
                // Fix V2-POS-12/V2-TUT-18 (auditoría v2): migrado
                // de window.confirm() a ConfirmDialog. El state
                // `pendingTab` parquea el destino mientras esperamos
                // la confirmación.
                if (dirty && tab === 'Mi perfil' && t !== 'Mi perfil') {
                  setPendingTab(t)
                  return
                }
                setTab(t)
              }}
            >
              {t}
            </TabButton>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            const slug = user?.authorSlug ?? slugify(data.name || 'mi-perfil')
            // Vista previa = abrir el perfil público en otra pestaña: no perdés
            // el editor y carga fresca (confiable). BASE_URL cubre el basename
            // del deploy (/ancestral-seed-app/ en producción).
            window.open(
              `${import.meta.env.BASE_URL}perfil/${slug}`,
              '_blank',
              'noopener',
            )
          }}
          className="inline-flex items-center gap-2 rounded-full bg-neutral-200 px-4 py-2 text-sm font-semibold text-navy-500 transition-colors hover:bg-neutral-300"
        >
          Ver vista previa
          <Eye className="h-4 w-4" />
        </button>
      </div>

      {tab === 'Mi perfil' && (
        <div className="mt-8 space-y-6">
          {/* Identity hero card — cover + avatar + name + role */}
          <section
            ref={heroRef}
            className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm"
          >
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
          <section
            ref={personalRef}
            className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8"
          >
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
          <section
            ref={bioRef}
            className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8"
          >
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
              ref={bioTextareaRef}
              rows={7}
              className="mt-3 w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm leading-relaxed text-navy-500 focus:border-gold-500 focus:outline-none"
              value={data.bio}
              onChange={(e) => update({ bio: e.target.value })}
            />
            <p className="mt-1 text-right text-[11px] text-navy-300">{data.bio.length} caracteres</p>
          </section>

          {/* Datos de comunidad */}
          <section
            ref={communityRef}
            className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8"
          >
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
              ref={historiaTextareaRef}
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

      {/* Fix V2-POS-12: confirm de "tab con cambios sin guardar" */}
      <ConfirmDialog
        open={pendingTab !== null}
        title="Cambios sin guardar"
        description={
          'Tenés cambios sin guardar en tu perfil.\n\n' +
          'Los cambios siguen disponibles cuando vuelvas a esta tab. ¿Cambiar igual?'
        }
        confirmLabel="Cambiar de tab"
        cancelLabel="Seguir editando"
        onConfirm={() => {
          if (pendingTab) setTab(pendingTab)
          setPendingTab(null)
        }}
        onCancel={() => setPendingTab(null)}
      />
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
  /** Nombre del PDF adjunto (ej. ficha técnica, catálogo). Opcional. */
  pdfName?: string
}

const highlightTabs = ['Todas', 'Publicadas', 'Borradores'] as const
type HighlightTab = (typeof highlightTabs)[number]

type HighlightSort = 'recientes' | 'antiguos' | 'alfabetico' | 'estado'

function Highlights() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<HighlightTab>('Todas')
  const [menuFor, setMenuFor] = useState<string | null>(null)
  const [sortOpen, setSortOpen] = useState(false)
  const [sort, setSort] = useState<HighlightSort>('recientes')
  const [editing, setEditing] = useState<HighlightItem | null>(null)
  const sortRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEscape(Boolean(menuFor) || sortOpen || !!editing, () => {
    setMenuFor(null)
    setSortOpen(false)
    setEditing(null)
  })

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

  const filtered = items
    .filter((it) => {
      if (tab === 'Todas') return true
      if (tab === 'Publicadas') return it.status === 'Publicada'
      return it.status === 'Borrador'
    })
    .slice()
    .sort((a, b) => {
      if (sort === 'alfabetico') return a.title.localeCompare(b.title)
      if (sort === 'estado') return a.status.localeCompare(b.status)
      if (sort === 'antiguos') return a.date.localeCompare(b.date)
      // recientes (default): preservar orden inverso de creación
      return b.date.localeCompare(a.date)
    })

  const sortLabel: Record<HighlightSort, string> = {
    recientes: 'Más recientes',
    antiguos: 'Más antiguos',
    alfabetico: 'A → Z',
    estado: 'Estado',
  }

  useEffect(() => {
    if (!sortOpen) return
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [sortOpen])

  const handleSaveEdit = (patch: HighlightItem) => {
    setItems((prev) => prev.map((p) => (p.id === patch.id ? patch : p)))
    setEditing(null)
    toast.success('Destacado actualizado')
  }

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
          <div className="relative" ref={sortRef}>
            <button
              type="button"
              onClick={() => setSortOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-navy-500 transition-colors hover:bg-neutral-100"
            >
              {sortLabel[sort]}
              <Filter className="h-4 w-4" />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-12 z-20 w-48 overflow-hidden rounded-2xl border border-neutral-200 bg-white py-2 shadow-lg">
                {(Object.keys(sortLabel) as HighlightSort[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => {
                      setSort(k)
                      setSortOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-sm hover:bg-neutral-100',
                      sort === k ? 'font-bold text-navy-500' : 'text-navy-500',
                    )}
                  >
                    {sortLabel[k]}
                    {sort === k && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-success-300" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
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
                {it.pdfName && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full bg-info-100 px-2 py-0.5 font-semibold text-info-400 ring-1 ring-info-200"
                    title={it.pdfName}
                  >
                    <FileText className="h-3 w-3" /> PDF
                  </span>
                )}
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
                  <MenuButton
                    icon={Pencil}
                    label="Editar"
                    onClick={() => {
                      setEditing(it)
                      setMenuFor(null)
                    }}
                  />
                  <MenuButton
                    icon={Eye}
                    label="Vista previa"
                    onClick={() => {
                      setMenuFor(null)
                      // El destacado guarda el id de la certificación (no el
                      // slug); buscamos el cert para abrir su ficha pública.
                      const cert = mockCertifications.find((c) => c.id === it.id)
                      if (cert) navigate(`/certificado/${cert.slug}`)
                      else toast.error('Esta pieza todavía no tiene ficha pública')
                    }}
                  />
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

      {editing && (
        <EditHighlightModal
          item={editing}
          onClose={() => setEditing(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  )
}

function EditHighlightModal({
  item,
  onClose,
  onSave,
}: {
  item: HighlightItem
  onClose: () => void
  onSave: (patch: HighlightItem) => void
}) {
  const [title, setTitle] = useState(item.title)
  const [subtitle, setSubtitle] = useState(item.subtitle)
  const [status, setStatus] = useState<HighlightStatus>(item.status)
  const [pdfName, setPdfName] = useState(item.pdfName ?? '')

  const canSave = title.trim().length > 0

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
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-500 text-navy-500">
              <Pencil className="h-5 w-5" />
            </span>
            <h3 className="text-lg font-bold text-navy-500">
              Editar destacado
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-navy-300 hover:bg-neutral-100"
            aria-label="Cerrar"
          >
            <Plus className="h-4 w-4 rotate-45" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="text-xs font-bold text-navy-500">Título</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-navy-500">Descripción</span>
            <textarea
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              rows={3}
              className="mt-1 w-full resize-y rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-navy-500">Estado</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as HighlightStatus)}
              className="mt-1 h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
            >
              <option value="Publicada">Publicada</option>
              <option value="Borrador">Borrador</option>
            </select>
          </label>
          <div>
            <span className="text-xs font-bold text-navy-500">
              Documento adjunto (PDF)
            </span>
            {pdfName ? (
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-neutral-300 bg-neutral-100/60 px-3 py-2">
                <FileText className="h-4 w-4 shrink-0 text-gold-700" />
                <span className="min-w-0 flex-1 truncate text-sm text-navy-500">
                  {pdfName}
                </span>
                <button
                  type="button"
                  onClick={() => setPdfName('')}
                  className="shrink-0 text-xs font-semibold text-error-400 hover:underline"
                >
                  Quitar
                </button>
              </div>
            ) : (
              <label className="mt-1 flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 bg-white px-3 py-3 text-sm font-semibold text-navy-500 transition-colors hover:border-gold-400 hover:bg-gold-50">
                <Paperclip className="h-4 w-4" />
                Colgar un PDF
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) setPdfName(f.name)
                  }}
                />
              </label>
            )}
            <p className="mt-1 text-[11px] text-navy-300">
              Ej. ficha técnica, catálogo o certificado de origen.
            </p>
          </div>
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
            disabled={!canSave}
            onClick={() =>
              onSave({
                ...item,
                title: title.trim(),
                subtitle: subtitle.trim(),
                status,
                pdfName: pdfName || undefined,
              })
            }
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-bold text-navy-500 shadow-sm hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Save className="h-4 w-4" />
            Guardar cambios
          </button>
        </div>
      </div>
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
