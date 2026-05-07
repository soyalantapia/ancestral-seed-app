import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Award,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Share2,
  Sparkles,
} from 'lucide-react'
import {
  useAuthor,
  useAuthorCertifications,
} from '@/hooks/useCertifications'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CertificationCard } from '@/components/features/CertificationCard'
import { cn } from '@/lib/utils'

const tabs = [
  { id: 'certificaciones' as const, label: 'Certificaciones' },
  { id: 'informacion' as const, label: 'Información' },
  { id: 'destacados' as const, label: 'Destacados' },
]

type TabId = (typeof tabs)[number]['id']

export default function AuthorProfile() {
  const { slug } = useParams()
  const { data: author, isLoading: loadingAuthor } = useAuthor(slug)
  const { data: certs, isLoading: loadingCerts } = useAuthorCertifications(slug)
  const [activeTab, setActiveTab] = useState<TabId>('certificaciones')

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

  return (
    <>
      <div className="relative h-56 overflow-hidden md:h-72">
        <img
          src={`${import.meta.env.BASE_URL}perfil-cover.png`}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-500/40 via-navy-500/10 to-transparent" />
      </div>

      <section className="bg-white">
        <div className="mx-auto max-w-[1320px] px-4 md:px-8">
          <div className="-mt-20 rounded-3xl border border-neutral-200 bg-white p-6 shadow-lg md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center">
              <img
                src={author.avatarUrl}
                alt={author.name}
                className="h-24 w-24 shrink-0 rounded-full border-4 border-white object-cover shadow-md md:h-32 md:w-32"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-navy-500 md:text-[32px] md:leading-tight">
                    {author.name}
                  </h1>
                  <CheckCircle2 className="h-5 w-5 text-gold-500" />
                </div>
                <p className="mt-1 text-sm text-navy-300 md:text-base">
                  {author.title}
                </p>
                {author.location && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-navy-300">
                    <MapPin className="h-3.5 w-3.5" />
                    {author.location}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="navy" size="md">
                  <Mail className="h-4 w-4" /> Contactar
                </Button>
                <Button variant="ghost" size="icon" aria-label="Compartir">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="mt-5 max-w-3xl text-sm leading-relaxed text-navy-300">
              {author.bio}
            </p>

            <div className="mt-6 border-t border-neutral-200" />

            <div className="mt-4 flex flex-wrap gap-1 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'relative px-4 py-3 text-sm font-semibold transition-colors',
                    activeTab === tab.id
                      ? 'text-navy-500'
                      : 'text-navy-300 hover:text-navy-500',
                  )}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.span
                      layoutId="tab-underline"
                      className="absolute inset-x-0 bottom-0 h-0.5 bg-gold-500"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="py-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={false}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {activeTab === 'certificaciones' && (
                  <CertificationsTab
                    certs={certs ?? []}
                    isLoading={loadingCerts}
                  />
                )}
                {activeTab === 'informacion' && (
                  <InfoTab author={author} />
                )}
                {activeTab === 'destacados' && (
                  <DestacadosTab certs={certs ?? []} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>
    </>
  )
}

function CertificationsTab({
  certs,
  isLoading,
}: {
  certs: import('@/types').Certification[]
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[4/3] w-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>
        ))}
      </div>
    )
  }
  if (certs.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-neutral-300 bg-gold-100/30 p-12 text-center">
        <Award className="mx-auto h-10 w-10 text-gold-700" />
        <p className="mt-3 font-bold text-navy-500">
          Este autor todavía no tiene certificaciones publicadas.
        </p>
      </div>
    )
  }
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {certs.map((c) => (
        <CertificationCard key={c.id} certification={c} />
      ))}
    </div>
  )
}

function InfoTab({ author }: { author: import('@/types').Author }) {
  return (
    <div className="max-w-4xl space-y-10">
      <section>
        <h2 className="text-lg font-bold text-navy-500">Sobre mí</h2>
        <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-navy-300">
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-navy-300" />
            <span className="font-semibold text-navy-500">
              {author.name}
            </span>
            <span>· {author.location}</span>
          </span>
          <span className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-navy-300" />
            email_usuario@email.com
          </span>
          <span className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-navy-300" /> +56 1234 5678
          </span>
        </div>
        <div className="mt-5 space-y-3 text-sm leading-relaxed text-navy-300">
          <p>{author.bio}</p>
          <p>
            A través de mi trabajo ancestral, desarrollo piezas realizadas a
            mano con hilos de plata, explorando la filigrana como un lenguaje
            que conecta memoria, territorio e identidad. Cada creación es el
            resultado de un proceso paciente y consciente, donde la
            práctica busca honrar la tradición mientras la reinterpreta con
            sensibilidad contemporánea.
          </p>
          <p>
            En la transmisión de mi conocimiento que ha perdurado por
            generaciones, he sabido buscar la manera de seguir la herencia
            ancestral, manteniendo viva en mí la presencia de saberes con su
            esencia.
          </p>
        </div>
      </section>

      <hr className="border-neutral-200" />

      <section>
        <h2 className="text-lg font-bold text-navy-500">Comunidad</h2>
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span className="flex items-center gap-2 text-navy-300">
            <MapPin className="h-4 w-4 text-navy-300" />
            <span className="font-semibold text-navy-500">
              Sierra Nevada de Santa Marta
            </span>
          </span>
          <span className="flex items-center gap-2 text-navy-300">
            <span className="text-navy-300">·</span> Artesana
          </span>
        </div>
        <div className="mt-5 space-y-3 text-sm leading-relaxed text-navy-300">
          <p>
            Mi práctica artesanal se enmarca en una herencia cultural familiar
            de largo trayecto, conectada con territorios y tradiciones de la
            Sierra Nevada de Santa Marta. Es bien mi vínculo de descendencia
            indígena lo que ha mantenido la genuinidad en generación en
            generación, con respeto por el oficio y la valoración del trabajo
            manual.
          </p>
          <p>
            La filigrana, como técnica ancestral, representa para mí un puente
            entre el pasado y el presente, a través del cual mantengo viva un
            legado que pierde a paciencia, la precisión y un sentido simbólico
            de cada pieza, manteniendo viva una tradición que forma parte de
            la identidad cultural del territorio.
          </p>
        </div>
      </section>
    </div>
  )
}

function DestacadosTab({
  certs,
}: {
  certs: import('@/types').Certification[]
}) {
  const featured = certs.slice(0, 2)
  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-pattern-aztec p-6 text-white md:p-10">
        <div className="flex items-center gap-2 text-gold-400">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-widest">
            Destacados
          </span>
        </div>
        <h2 className="mt-3 text-xl font-bold md:text-2xl">
          Las certificaciones más visitadas de este autor
        </h2>
      </div>

      {featured.length === 0 ? (
        <p className="text-sm text-navy-300">
          Todavía no hay destacados para mostrar.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {featured.map((c) => (
            <CertificationCard
              key={c.id}
              certification={c}
              layout="wide"
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div>
      <Skeleton className="h-56 w-full rounded-none md:h-72" />
      <div className="mx-auto -mt-20 max-w-[1320px] px-4 md:px-8">
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-lg">
          <div className="flex gap-5">
            <Skeleton className="h-24 w-24 rounded-full md:h-32 md:w-32" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
