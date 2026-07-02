import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Globe2,
  Languages,
  Leaf,
  Mail,
  MapPin,
  Shield,
  Share2,
  Sparkles,
  User2,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from 'react-simple-maps'
import {
  useAuthor,
  useAuthorCertifications,
} from '@/hooks/useCertifications'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CertificationCard } from '@/components/features/CertificationCard'
import { cn, imgFallback } from '@/lib/utils'

// Misma lista que usamos en el mapa LATAM del Home
const LATAM_ISO_IDS = new Set([
  '484', '320', '084', '340', '222', '558', '188', '591',
  '192', '214', '332', '388', '630',
  '170', '862', '328', '740', '254',
  '218', '604', '068', '076', '600', '858', '032', '152',
])

// Aproximación de coords [lng, lat] de comunidades / territorios para
// pintar un dot en el mini-mapa. Si no matchea, dejamos sin dot.
const TERRITORY_COORDS: Record<string, [number, number]> = {
  // por país (fallback)
  Colombia: [-74, 5],
  Argentina: [-65, -33],
  México: [-99, 22],
  Mexico: [-99, 22],
  Perú: [-77, -10],
  Peru: [-77, -10],
  Ecuador: [-78, -1],
  Bolivia: [-65, -17],
  Brasil: [-53, -10],
  Chile: [-71, -33],
  Paraguay: [-58, -25],
  Uruguay: [-56, -33],
  Venezuela: [-66, 7],
  Guatemala: [-90, 15],
  // por región conocida
  'Sierra Nevada de Santa Marta': [-73.7, 10.8],
  Nariño: [-77.3, 1.2],
  Caribe: [-75, 11],
  'Caribe colombiano': [-75, 11],
  Salta: [-65.4, -24.8],
  Jujuy: [-65.3, -24.2],
  Cusco: [-72, -13.5],
  Oaxaca: [-96.7, 17],
}

/**
 * Tabs del perfil de autor.
 *
 * Decisión UX (mayo 2026): pasamos de underline plano a "pills" con
 * ícono porque (a) el underline 2px era muy discreto vs el resto del
 * perfil que tiene paleta navy/gold rica, (b) cada label sola
 * ("Sobre", "Trayectoria") no comunicaba bien el contenido, (c) bajo
 * affordance — no se sentía clickable más allá del hover.
 *
 * Las pills tienen:
 * - Ícono semántico (User2 = persona, Award = logros, MapPin = lugar,
 *   Sparkles = recorrido) que ancla rápido la lectura.
 * - Active state con bg-navy sólido + dot dorado pulsante para
 *   reforzar la jerarquía.
 * - Badge counter en Certificaciones (la única tab con cardinalidad
 *   variable y relevante).
 * - Animación slide del fondo activo via framer-motion `layoutId`.
 */
const tabs: Array<{ id: TabKey; label: string; icon: LucideIcon }> = [
  { id: 'sobre', label: 'Sobre', icon: User2 },
  { id: 'certificaciones', label: 'Certificaciones', icon: Award },
  { id: 'territorio', label: 'Territorio', icon: MapPin },
  { id: 'trayectoria', label: 'Trayectoria', icon: Sparkles },
]

type TabKey = 'sobre' | 'certificaciones' | 'territorio' | 'trayectoria'
type TabId = TabKey

export default function AuthorProfile() {
  const { slug } = useParams()
  const { data: author, isLoading: loadingAuthor } = useAuthor(slug)
  const { data: certs, isLoading: loadingCerts } = useAuthorCertifications(slug)
  const [searchParams, setSearchParams] = useSearchParams()

  // Tab activa via URL search param (?tab=sobre, certificaciones, territorio, trayectoria)
  const rawTab = searchParams.get('tab')
  const activeTab: TabId = (tabs.find((t) => t.id === rawTab)?.id ?? 'sobre')

  const onChangeTab = (id: TabId) => {
    // Mantener el resto de search params, solo cambiar tab
    const next = new URLSearchParams(searchParams)
    if (id === 'sobre') next.delete('tab')
    else next.set('tab', id)
    setSearchParams(next, { replace: false })
    // Scroll al inicio del contenido al cambiar de tab
    window.requestAnimationFrame(() => {
      const navEl = document.getElementById('profile-tabs-nav')
      if (navEl) {
        const top = navEl.getBoundingClientRect().top + window.scrollY - 80
        window.scrollTo({ top, behavior: 'smooth' })
      }
    })
  }

  if (loadingAuthor) return <ProfileSkeleton />

  if (!author) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-navy-500">
          Autor no encontrado
        </h1>
        <Link
          to="/directorio"
          className={cn(buttonVariants({ variant: 'gold' }), 'mt-6')}
        >
          Volver al directorio
        </Link>
      </div>
    )
  }

  const country = author.location?.split('·')[0]?.trim()
  const region = author.location?.split('·').pop()?.trim()

  // Cover image: usar la portada del primer certificado del autor, o un
  // fallback default. Esto le da identidad visual a cada perfil.
  const coverUrl =
    certs?.[0]?.coverUrl ||
    `${import.meta.env.BASE_URL}perfil-cover.webp`

  return (
    <div className="bg-white">
      <ProfileHero author={author} coverUrl={coverUrl} />
      <ProfileStats author={author} certCount={certs?.length ?? 0} />
      <ProfileTabsNav
        active={activeTab}
        onChange={onChangeTab}
        certCount={certs?.length ?? 0}
      />

      {/* Solo renderizamos la sección activa — cada tab es una "vista" */}
      {activeTab === 'sobre' && <SobreSection author={author} />}
      {activeTab === 'certificaciones' && (
        <div className="bg-neutral-100/50">
          <CertsSection certs={certs ?? []} isLoading={loadingCerts} />
        </div>
      )}
      {activeTab === 'territorio' && (
        <TerritorioSection
          country={country}
          region={region}
          author={author}
        />
      )}
      {activeTab === 'trayectoria' && (
        <div className="bg-neutral-100/50">
          <TrayectoriaSection author={author} certs={certs ?? []} />
        </div>
      )}

      <ProfileCTA author={author} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────────────────────────────────────

function ProfileHero({
  author,
  coverUrl,
}: {
  author: import('@/types').Author
  coverUrl: string
}) {
  return (
    <section className="relative overflow-hidden pb-10 pt-12 md:pb-16 md:pt-20">
      {/* Cover image como background */}
      <div aria-hidden className="absolute inset-0 z-0">
        <img
          src={coverUrl}
          alt=""
          onError={imgFallback(
            `${import.meta.env.BASE_URL}cards/card-filigrana-v2.webp`,
          )}
          className="h-full w-full object-cover object-center"
        />
        {/* Tint navy + degradado para legibilidad del texto */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-500/85 via-navy-500/75 to-navy-400/65" />
        {/* Pattern sutil encima del tint para textura ancestral */}
        <div className="absolute inset-0 bg-pattern-aztec opacity-20" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1240px] px-4 md:px-8">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Avatar */}
          <div className="lg:col-span-4">
            <div className="relative mx-auto w-fit lg:mx-0">
              {/* Glow dorado decorativo */}
              <div
                aria-hidden
                className="absolute -inset-3 rounded-[2rem] bg-gold-500/30 blur-2xl"
              />
              <div className="relative h-44 w-44 overflow-hidden rounded-[2rem] border-4 border-white bg-white shadow-2xl md:h-56 md:w-56">
                <img
                  src={author.avatarUrl}
                  alt={author.name}
                  onError={imgFallback('https://i.pravatar.cc/200?img=47')}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Identidad */}
          <div className="lg:col-span-8 text-white">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">
              <Sparkles className="h-3.5 w-3.5" />
              Perfil verificado
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-[1.1] tracking-tight md:text-[44px] md:leading-[1.05]">
              {author.name}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success-300/20 px-3 py-1 text-xs font-bold text-success-100 ring-1 ring-success-100/30 backdrop-blur">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Verificado por auditoría cultural
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-500/20 px-3 py-1 text-xs font-bold text-gold-300 ring-1 ring-gold-300/30 backdrop-blur">
                <Award className="h-3.5 w-3.5" />
                {author.title}
              </span>
            </div>

            {author.location && (
              <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-neutral-200">
                <MapPin className="h-4 w-4 text-gold-400" />
                {author.location}
              </p>
            )}

            {/* Bio teaser */}
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-neutral-200 md:text-lg">
              {author.bio}
            </p>

            {/* CTAs — Fix SB15 (#PUB-20, auditoría UX): si el autor no
                tiene email público, antes el botón mostraba toast inocuo.
                Ahora abrimos un mailto a soporte de Ancestral Seed con
                preset que media el contacto, en vez de un dead-end. */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={
                  author.email
                    ? `mailto:${author.email}?subject=${encodeURIComponent(`Hola ${author.name}`)}`
                    : `mailto:contacto@ancestralseed.com?subject=${encodeURIComponent(`Solicitud de contacto con ${author.name}`)}&body=${encodeURIComponent(`Hola, me gustaría contactar a ${author.name} para conversar sobre su trabajo. ¿Me ayudan a mediar el contacto?\n\nGracias.`)}`
                }
                className={cn(buttonVariants({ variant: 'gold', size: 'lg' }))}
              >
                <Mail className="h-4 w-4" />
                {author.email ? 'Contactar' : 'Solicitar contacto'}
              </a>
              <Button
                variant="ghost"
                size="lg"
                className="border border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20"
                onClick={async () => {
                  const url =
                    typeof window !== 'undefined' ? window.location.href : ''
                  const shareData = {
                    title: `${author.name} en Ancestral Seed`,
                    text: `Mirá el perfil de ${author.name} — ${author.title}`,
                    url,
                  }
                  try {
                    if (navigator.share) {
                      await navigator.share(shareData)
                    } else {
                      await navigator.clipboard?.writeText(url)
                      toast.success('Link del perfil copiado')
                    }
                  } catch {
                    // user canceled
                  }
                }}
              >
                <Share2 className="h-4 w-4" />
                Compartir perfil
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// STATS BANNER
// ─────────────────────────────────────────────────────────────────────────────

function ProfileStats({
  author,
  certCount,
}: {
  author: import('@/types').Author
  certCount: number
}) {
  const stats = [
    {
      icon: Award,
      value: String(certCount || author.certificationsCount),
      label: 'Certificaciones',
    },
    {
      icon: Calendar,
      value: formatJoined(author.joinedAt),
      label: 'En la plataforma',
    },
    {
      icon: MapPin,
      value: author.location?.split('·').pop()?.trim() ?? '—',
      label: 'Territorio',
    },
    {
      icon: Shield,
      value: '100%',
      label: 'Trazabilidad blockchain',
    },
  ]

  return (
    <div className="border-y border-neutral-200 bg-white">
      <div className="mx-auto max-w-[1240px] px-4 md:px-8">
        <dl className="grid grid-cols-2 divide-neutral-200 md:grid-cols-4 md:divide-x">
          {stats.map((s) => {
            const Icon = s.icon
            return (
              <div
                key={s.label}
                className="flex items-center gap-3 px-4 py-5 md:px-6 md:py-7"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <dt className="text-[10px] font-medium uppercase tracking-widest text-navy-300">
                    {s.label}
                  </dt>
                  {/* Fix SM2 (#PUB-21): antes truncate cortaba "Sierra
                      Nevada de Santa Marta" → ahora line-clamp-2 + texto
                      más compacto para que se lea completo. */}
                  <dd className="mt-0.5 line-clamp-2 text-sm font-bold text-navy-500 md:text-base">
                    {s.value}
                  </dd>
                </div>
              </div>
            )
          })}
        </dl>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TABS NAV (sticky scrollspy)
// ─────────────────────────────────────────────────────────────────────────────

function ProfileTabsNav({
  active,
  onChange,
  certCount,
}: {
  active: TabId
  onChange: (id: TabId) => void
  certCount: number
}) {
  return (
    <div
      id="profile-tabs-nav"
      className="sticky top-16 z-20 border-b border-neutral-200/70 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 md:top-20"
    >
      {/* Container: en mobile scrolea horizontal con snap (para que entren
          las 4 pills sin truncar). En md+ el overflow desaparece porque el
          ul pasa a grid de 4 columnas exactas — cada pill ocupa 25% del
          ancho y se ve uniformemente distribuida. */}
      <div className="mx-auto max-w-[1240px] overflow-x-auto px-4 py-3 md:overflow-visible md:px-8 md:py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul
          role="tablist"
          aria-label="Secciones del perfil"
          className="flex snap-x snap-mandatory items-center gap-2 md:grid md:grid-cols-4 md:gap-3 md:snap-none"
        >
          {tabs.map((t) => {
            const isActive = t.id === active
            const Icon = t.icon
            // Solo Certificaciones tiene cardinalidad relevante. Las
            // otras tabs son contenido único, no listas.
            const count = t.id === 'certificaciones' ? certCount : undefined
            return (
              <li key={t.id} className="shrink-0 snap-start md:w-full">
                <button
                  type="button"
                  role="tab"
                  onClick={() => onChange(t.id)}
                  aria-selected={isActive}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    // Mobile: pills auto-width con scroll. md+: ancho completo
                    // de la celda del grid y contenido centrado.
                    'relative inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2.5 text-sm transition-all md:flex md:w-full md:justify-center md:px-4 md:py-3',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2',
                    isActive
                      ? 'text-white'
                      : 'bg-white text-navy-500 ring-1 ring-navy-200 hover:bg-gold-50 hover:ring-gold-300 hover:text-gold-700',
                  )}
                >
                  {/* Background activo que se desliza fluido entre tabs
                      con layoutId — patrón clásico de framer-motion. */}
                  {isActive && (
                    <motion.span
                      layoutId="profile-tab-active-bg"
                      aria-hidden
                      className="absolute inset-0 -z-0 rounded-full bg-navy-500 shadow-md ring-1 ring-navy-400/30"
                      transition={{
                        type: 'spring',
                        stiffness: 420,
                        damping: 34,
                      }}
                    />
                  )}
                  {/* Contenido en una capa por encima del bg animado */}
                  <span className="relative z-10 inline-flex items-center gap-2">
                    {isActive ? (
                      <span
                        aria-hidden
                        className="h-2 w-2 rounded-full bg-gold-400 shadow-[0_0_10px_rgba(212,175,55,0.7)]"
                      />
                    ) : (
                      <Icon
                        className="h-4 w-4 opacity-75"
                        strokeWidth={1.85}
                        aria-hidden
                      />
                    )}
                    <span
                      className={cn(
                        'font-semibold',
                        isActive && 'font-bold tracking-tight',
                      )}
                    >
                      {t.label}
                    </span>
                    {typeof count === 'number' && count > 0 && (
                      <span
                        className={cn(
                          'ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none tabular-nums',
                          isActive
                            ? 'bg-gold-500/25 text-gold-100 ring-1 ring-gold-400/30'
                            : 'bg-gold-500/15 text-gold-700',
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SOBRE SECTION
// ─────────────────────────────────────────────────────────────────────────────

function SobreSection({ author }: { author: import('@/types').Author }) {
  const values = [
    {
      icon: Leaf,
      title: 'Saber heredado',
      copy: 'Técnicas y oficios aprendidos de generación en generación dentro de su comunidad.',
    },
    {
      icon: Shield,
      title: 'Origen verificado',
      copy: 'Cada certificación valida territorio, técnica y consentimiento del pueblo originario.',
    },
    {
      icon: Globe2,
      title: 'Proyección global',
      copy: 'Su trabajo viaja con su historia intacta hacia mercados, museos y consumidores del mundo.',
    },
  ]

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-16 md:px-8 md:py-24">
      <SectionHeader
        kicker="Sobre"
        title={`Quién es ${author.name.split(' ')[0]}`}
      />

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <p className="text-base leading-relaxed text-navy-500 md:text-lg">
            {author.bio}
          </p>
          <p className="mt-5 text-base leading-relaxed text-navy-300">
            Su práctica nace de un linaje familiar y comunitario que sostiene
            tradiciones, lenguas y saberes propios. Ancestral Seed acompaña
            la documentación, validación y proyección de su trabajo para que
            su origen quede registrado de forma pública, permanente y
            verificable.
          </p>

          {/* Valores cards */}
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {values.map((v) => {
              const Icon = v.icon
              return (
                <div
                  key={v.title}
                  className="rounded-2xl border border-neutral-200 bg-white p-4 transition-colors hover:border-gold-300"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-3 text-sm font-bold text-navy-500">
                    {v.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-navy-300">
                    {v.copy}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quote / Statement */}
        <aside className="lg:col-span-5">
          <div className="rounded-3xl bg-pattern-aztec p-6 text-white md:p-8">
            <Sparkles className="h-5 w-5 text-gold-400" />
            <p className="mt-4 text-lg font-medium leading-relaxed md:text-xl">
              «La autenticidad no se reclama, se hereda y se demuestra. Cada
              certificación es la voz de mi comunidad amplificada en
              blockchain.»
            </p>
            <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
              <img
                src={author.avatarUrl}
                alt=""
                onError={imgFallback('https://i.pravatar.cc/200?img=47')}
                className="h-10 w-10 rounded-full border-2 border-white/20 object-cover"
              />
              <div>
                <p className="text-sm font-bold">{author.name}</p>
                <p className="text-xs text-neutral-300">{author.title}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CERTIFICACIONES SECTION
// ─────────────────────────────────────────────────────────────────────────────

function CertsSection({
  certs,
  isLoading,
}: {
  certs: import('@/types').Certification[]
  isLoading: boolean
}) {
  const [selectedCat, setSelectedCat] = useState<string | null>(null)
  const categories = useMemo(() => {
    const set = new Set<string>()
    certs.forEach((c) => c.category && set.add(c.category))
    return Array.from(set)
  }, [certs])

  const filtered = useMemo(() => {
    if (!selectedCat) return certs
    return certs.filter((c) => c.category === selectedCat)
  }, [certs, selectedCat])

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-16 md:px-8 md:py-24">
      <SectionHeader
        kicker="Certificaciones"
        title="Trabajos auditados y certificados"
        action={
          <Link
            to="/directorio"
            className="inline-flex items-center gap-1 text-sm font-semibold text-navy-500 transition-colors hover:text-gold-700"
          >
            Ver directorio completo
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      {/* Filtros */}
      {categories.length > 1 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedCat(null)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
              selectedCat === null
                ? 'bg-navy-500 text-white'
                : 'bg-white text-navy-500 ring-1 ring-neutral-200 hover:ring-gold-300',
            )}
          >
            Todas ({certs.length})
          </button>
          {categories.map((cat) => {
            const count = certs.filter((c) => c.category === cat).length
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCat(cat)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                  selectedCat === cat
                    ? 'bg-navy-500 text-white'
                    : 'bg-white text-navy-500 ring-1 ring-neutral-200 hover:ring-gold-300',
                )}
              >
                {cat} ({count})
              </button>
            )
          })}
        </div>
      )}

      {/* Grid de cards */}
      <div className="mt-8">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
                <Skeleton className="h-5 w-3/4" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-12 text-center">
            <Award className="mx-auto h-10 w-10 text-gold-700" />
            <p className="mt-3 font-bold text-navy-500">
              {selectedCat
                ? `Sin certificaciones en "${selectedCat}".`
                : 'Este autor todavía no tiene certificaciones publicadas.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <CertificationCard key={c.id} certification={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TERRITORIO SECTION — con mini-mapa
// ─────────────────────────────────────────────────────────────────────────────

function TerritorioSection({
  country,
  region,
  author,
}: {
  country?: string
  region?: string
  author: import('@/types').Author
}) {
  // Encontrar coordinates: primero por región, luego por país
  const coords =
    (region && TERRITORY_COORDS[region]) ||
    (country && TERRITORY_COORDS[country]) ||
    null

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-16 md:px-8 md:py-24">
      <SectionHeader
        kicker="Territorio"
        title="De dónde viene su saber"
      />

      <div className="mt-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16">
        {/* Mapa */}
        <div className="lg:col-span-7">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-neutral-200 bg-pattern-gold p-4 md:p-6">
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ scale: 380, center: [-72, -16] }}
              width={800}
              height={600}
              style={{ width: '100%', height: '100%' }}
            >
              <defs>
                <linearGradient id="latam-soft" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#E5C36C" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#A8842F" stopOpacity="0.5" />
                </linearGradient>
                <linearGradient id="latam-active" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#D2A958" stopOpacity="1" />
                  <stop offset="100%" stopColor="#A8842F" stopOpacity="1" />
                </linearGradient>
                <radialGradient id="terr-halo">
                  <stop offset="0%" stopColor="#A8842F" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#A8842F" stopOpacity="0" />
                </radialGradient>
              </defs>

              <Geographies
                geography={`${import.meta.env.BASE_URL}countries-110m.json`}
              >
                {({ geographies }: { geographies: Array<{ id?: string; rsmKey: string; properties?: { name?: string } }> }) =>
                  geographies
                    .filter((d) => (d.id ? LATAM_ISO_IDS.has(d.id) : false))
                    .map((geo) => {
                      const isAuthorCountry =
                        country && geo.properties?.name === country
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={
                            isAuthorCountry
                              ? 'url(#latam-active)'
                              : 'url(#latam-soft)'
                          }
                          stroke="#fff"
                          strokeWidth={0.5}
                          style={{
                            default: { outline: 'none' },
                            hover: { outline: 'none' },
                            pressed: { outline: 'none' },
                          }}
                        />
                      )
                    })
                }
              </Geographies>

              {coords && (
                <Marker coordinates={coords}>
                  <circle r={18} fill="url(#terr-halo)">
                    <animate
                      attributeName="r"
                      values="12;24;12"
                      dur="2.4s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.7;0.15;0.7"
                      dur="2.4s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle r={6} fill="#fff" stroke="#A8842F" strokeWidth={2.5} />
                </Marker>
              )}
            </ComposableMap>

            {/* Pin etiqueta */}
            {coords && (
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/95 px-4 py-3 shadow-md backdrop-blur md:left-6 md:right-auto md:max-w-xs">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gold-700">
                  Origen del trabajo
                </p>
                <p className="mt-0.5 text-base font-bold text-navy-500">
                  {region || country}
                </p>
                <p className="text-xs text-navy-300">{author.location}</p>
              </div>
            )}
          </div>
        </div>

        {/* Detalles del territorio */}
        <div className="lg:col-span-5">
          <div className="space-y-5">
            <TerritorioDataRow
              icon={MapPin}
              label="Comunidad"
              value={region || country || 'Sin especificar'}
            />
            {/* Fix SA2 (#PUB-19, auditoría UX): antes estos dos campos
                venían de inferPueblo / inferLenguas que adivinaban por
                substring de location. La identidad cultural es soberanía
                comunitaria, no algoritmo. Ahora SOLO se muestra lo que
                viene declarado en el modelo Author. Si falta, el copy es
                explícito en vez de inventar un valor.

                Fix V2-PUB-03 (auditoría v2): "Por confirmar con la
                comunidad" sonaba a "dato faltante" (mitad de los autores
                lo tienen vacío en el demo). Ahora el copy aclara la
                decisión consciente: este autor trabaja desde Inspiración
                cultural, no representando una comunidad específica.
                Eso es legítimo dentro del Reglamento (categoría 2). */}
            <TerritorioDataRow
              icon={Users}
              label="Pueblo originario"
              value={
                author.community ?? 'Trabajo desde inspiración cultural'
              }
              pending={!author.community}
            />
            <TerritorioDataRow
              icon={Languages}
              label="Lenguas vinculadas"
              value={
                author.languages && author.languages.length > 0
                  ? author.languages.join(' · ')
                  : 'No vinculado a una lengua específica'
              }
              pending={!author.languages || author.languages.length === 0}
            />
            <TerritorioDataRow
              icon={Globe2}
              label="País"
              value={country || '—'}
            />
          </div>

          <div className="mt-8 rounded-2xl bg-gold-100/60 p-5 ring-1 ring-gold-200">
            <p className="text-sm leading-relaxed text-navy-500">
              <span className="font-bold">Trazabilidad cultural:</span> cada
              certificación de {author.name.split(' ')[0]} incluye el
              territorio de origen, el linaje del saber y el consentimiento
              comunitario. Esa información viaja con el producto y queda
              registrada en blockchain.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function TerritorioDataRow({
  icon: Icon,
  label,
  value,
  pending = false,
}: {
  icon: typeof MapPin
  label: string
  value: string
  /**
   * Si el dato falta en el modelo Author, marcamos visualmente la
   * fila como "pendiente" (italic + color suave) para que el visitante
   * entienda que es info por confirmar, no un valor real.
   */
  pending?: boolean
}) {
  return (
    <div className="flex items-start gap-3 border-b border-neutral-200 pb-4 last:border-0 last:pb-0">
      <span
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
          pending
            ? 'bg-neutral-200 text-navy-300'
            : 'bg-gold-100 text-gold-700',
        )}
      >
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-navy-300">
          {label}
        </p>
        <p
          className={cn(
            'mt-0.5 text-base',
            pending
              ? 'font-medium italic text-navy-300'
              : 'font-bold text-navy-500',
          )}
        >
          {value}
        </p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TRAYECTORIA SECTION
// ─────────────────────────────────────────────────────────────────────────────

function TrayectoriaSection({
  author,
  certs,
}: {
  author: import('@/types').Author
  certs: import('@/types').Certification[]
}) {
  // Construir hitos a partir de joinedAt + cada certificación
  const milestones = useMemo(() => {
    const items: Array<{ date: string; title: string; subtitle: string; icon: typeof Award }> = []
    items.push({
      date: author.joinedAt,
      title: 'Ingreso a la plataforma',
      subtitle: 'Inicio del proceso de documentación y certificación cultural',
      icon: Sparkles,
    })
    certs
      .slice()
      .sort((a, b) => (a.issuedAt < b.issuedAt ? -1 : 1))
      .forEach((c) => {
        items.push({
          date: c.issuedAt,
          title: c.title,
          subtitle: `Certificación emitida · ${c.category ?? 'General'}`,
          icon: Award,
        })
      })
    return items.sort((a, b) => (a.date < b.date ? 1 : -1))
  }, [author.joinedAt, certs])

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-16 md:px-8 md:py-24">
      <SectionHeader
        kicker="Trayectoria"
        title="Hitos verificados en Ancestral Seed"
      />

      <ol className="relative mt-10 max-w-3xl border-l border-gold-300/50 pl-6 md:pl-8">
        {milestones.length === 0 && (
          <p className="text-sm text-navy-300">Aún no hay hitos para mostrar.</p>
        )}
        {milestones.map((m, i) => {
          const Icon = m.icon
          return (
            <li key={i} className="mb-8 last:mb-0">
              <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-gold-500 text-white ring-4 ring-white md:-left-4 md:h-8 md:w-8">
                <Icon className="h-3 w-3 md:h-4 md:w-4" />
              </span>
              <p className="text-[11px] font-medium uppercase tracking-widest text-gold-700">
                {formatDate(m.date)}
              </p>
              <h3 className="mt-1 text-base font-bold text-navy-500 md:text-lg">
                {m.title}
              </h3>
              <p className="mt-1 text-sm text-navy-300">{m.subtitle}</p>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CTA FINAL
// ─────────────────────────────────────────────────────────────────────────────

function ProfileCTA({ author }: { author: import('@/types').Author }) {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-[1240px] px-4 md:px-8">
        <div className="overflow-hidden rounded-3xl bg-pattern-aztec p-8 text-white md:p-12 lg:p-16">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-8">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">
                <Sparkles className="h-3.5 w-3.5" />
                Conectar
              </p>
              <h2 className="mt-3 text-2xl font-bold leading-tight md:text-[34px]">
                ¿Querés conocer el trabajo de {author.name.split(' ')[0]}?
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-300 md:text-base">
                Escribile directamente para coordinar pedidos, visitas o
                colaboraciones. Cada interacción respeta el consentimiento
                comunitario y la trazabilidad cultural.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 lg:col-span-4 lg:justify-end">
              <a
                href={
                  author.email
                    ? `mailto:${author.email}?subject=${encodeURIComponent(`Hola ${author.name}`)}`
                    : `mailto:contacto@ancestralseed.com?subject=${encodeURIComponent(`Solicitud de contacto con ${author.name}`)}&body=${encodeURIComponent(`Hola, me gustaría contactar a ${author.name} para conversar sobre su trabajo. ¿Me ayudan a mediar el contacto?\n\nGracias.`)}`
                }
                className={cn(buttonVariants({ variant: 'gold', size: 'lg' }))}
              >
                <Mail className="h-4 w-4" />
                {author.email ? 'Contactar' : 'Solicitar contacto'}
              </a>
              <Link
                to="/directorio"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 bg-transparent px-5 text-sm font-bold text-white transition-colors hover:bg-white/10"
              >
                Ver más autores
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function SectionHeader({
  kicker,
  title,
  action,
}: {
  kicker: string
  title: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-navy-300">
          <Sparkles className="h-3.5 w-3.5 text-gold-500" />
          {kicker}
        </p>
        <h2 className="mt-2 text-2xl font-bold leading-tight text-navy-500 md:text-[32px]">
          {title}
        </h2>
      </div>
      {action}
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div>
      <div className="bg-pattern-gold py-12 md:py-20">
        <div className="mx-auto max-w-[1240px] px-4 md:px-8">
          <div className="grid gap-8 lg:grid-cols-12">
            <Skeleton className="mx-auto h-44 w-44 rounded-[2rem] md:h-56 md:w-56 lg:col-span-4" />
            <div className="space-y-3 lg:col-span-8">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-16 w-full" />
              <div className="flex gap-3 pt-2">
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-12 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatJoined(iso: string): string {
  const d = new Date(iso)
  const diffMs = Date.now() - d.getTime()
  const months = Math.round(diffMs / (1000 * 60 * 60 * 24 * 30))
  if (months < 1) return 'Reciente'
  if (months < 12) return `${months} mes${months === 1 ? '' : 'es'}`
  const years = Math.floor(months / 12)
  return `${years} año${years === 1 ? '' : 's'}`
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('es-AR', { year: 'numeric', month: 'long' })
  } catch {
    return iso
  }
}
