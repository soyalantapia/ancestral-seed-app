import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Award,
  Calendar,
  CheckCircle2,
  Copy,
  ExternalLink,
  Hash,
  Heart,
  MapPin,
  Share2,
  ShieldCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import { useCertification } from '@/hooks/useCertifications'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { cn, formatDate } from '@/lib/utils'

export default function CertificationDetail() {
  const { slug } = useParams()
  const { data: cert, isLoading, error } = useCertification(slug)

  if (isLoading) return <DetailSkeleton />
  if (error || !cert) return <DetailError message={error ?? 'No encontrado'} />

  return (
    <>
      <section className="bg-white">
        <div className="mx-auto max-w-[1320px] px-4 py-8 md:px-8 md:py-12">
          <Link
            to="/directorio"
            className="text-sm text-navy-300 transition-colors hover:text-navy-500"
          >
            ← Volver al directorio
          </Link>

          <div className="mt-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h1 className="text-2xl font-extrabold leading-tight text-navy-500 md:text-4xl">
              {cert.title}
            </h1>
            <div className="flex items-center gap-2">
              <Badge variant="gold">{cert.category}</Badge>
              <StatusPill status={cert.status} />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
            <motion.div
              initial={false}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-5"
            >
              <div className="overflow-hidden rounded-3xl border border-neutral-200">
                <img
                  src={cert.coverUrl}
                  alt={cert.title}
                  className="aspect-square w-full object-cover"
                />
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-square overflow-hidden rounded-xl border border-neutral-200 bg-gold-100/40"
                  >
                    <img
                      src={cert.coverUrl}
                      alt=""
                      className="h-full w-full object-cover opacity-80 transition-opacity hover:opacity-100"
                    />
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="space-y-6 lg:col-span-7">
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <img
                    src={cert.authorAvatarUrl}
                    alt={cert.authorName}
                    className="h-14 w-14 rounded-full border-2 border-gold-300 object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-widest text-navy-300">
                      Autoría
                    </p>
                    <Link
                      to={`/autor/${cert.authorName.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-base font-bold text-navy-500 hover:text-gold-700"
                    >
                      {cert.authorName}
                    </Link>
                  </div>
                  <Button variant="navy" size="sm">
                    Contactar
                  </Button>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 border-t border-neutral-200 pt-6 md:grid-cols-2">
                  <Stat
                    icon={Award}
                    label="Emisor"
                    value={cert.issuedBy}
                  />
                  <Stat
                    icon={Calendar}
                    label="Fecha de emisión"
                    value={formatDate(cert.issuedAt)}
                  />
                  <Stat
                    icon={ShieldCheck}
                    label="Estado"
                    value={
                      cert.status === 'verified'
                        ? 'Verificado en blockchain'
                        : cert.status === 'pending'
                          ? 'En revisión'
                          : 'Vencido'
                    }
                  />
                  <Stat
                    icon={Calendar}
                    label="Vigencia"
                    value={
                      cert.expiresAt ? formatDate(cert.expiresAt) : 'Indefinida'
                    }
                  />
                </div>

                <div className="mt-6 flex flex-wrap gap-2 border-t border-neutral-200 pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(cert.hash)
                      toast.success('Hash copiado al portapapeles')
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" /> Copiar hash
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href)
                      toast.success('Link copiado')
                    }}
                  >
                    <Share2 className="h-3.5 w-3.5" /> Compartir
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Heart className="h-3.5 w-3.5" /> Guardar
                  </Button>
                </div>
              </div>

              <div className="rounded-3xl border border-neutral-200 bg-gold-100/30 p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-gold-700">
                  Hash en blockchain
                </p>
                <div className="mt-2 flex items-start gap-2">
                  <Hash className="mt-0.5 h-4 w-4 shrink-0 text-navy-300" />
                  <code className="break-all text-xs text-navy-300">
                    {cert.hash}
                  </code>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12">
            <article className="prose-sm lg:col-span-8">
              <h2 className="text-xl font-extrabold text-navy-500">
                Sobre la certificación
              </h2>
              <p className="mt-3 leading-relaxed text-navy-300">
                {cert.description}
              </p>
              <p className="mt-3 leading-relaxed text-navy-300">
                Esta certificación documenta el origen, la trayectoria y las
                prácticas tradicionales involucradas en la producción del
                cultivo. Es resultado de un proceso conjunto entre la
                comunidad, curadores especialistas y el equipo técnico de
                Ancestral Seed.
              </p>

              <h3 className="mt-8 text-lg font-bold text-navy-500">
                Métodos y producción
              </h3>
              <p className="mt-2 leading-relaxed text-navy-300">
                La región se caracteriza por condiciones agroecológicas únicas
                y por el cuidado intergeneracional de las semillas. Las
                prácticas combinan rotación tradicional, manejo orgánico y
                preservación de variedades locales.
              </p>
            </article>

            <aside className="lg:col-span-4">
              <div className="overflow-hidden rounded-3xl border border-neutral-200">
                <div className="aspect-[4/3] bg-gold-100/40 grid place-items-center">
                  <MapPin className="h-12 w-12 text-gold-700" />
                </div>
                <div className="p-4">
                  <p className="text-xs uppercase tracking-widest text-navy-300">
                    Ubicación
                  </p>
                  <p className="mt-1 text-sm font-semibold text-navy-500">
                    Quebrada de Humahuaca, Argentina
                  </p>
                  <a
                    href="#"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-gold-700 hover:underline"
                  >
                    Ver en el mapa <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-pattern-aztec">
        <div className="mx-auto max-w-[1320px] px-4 py-12 text-center text-white md:px-8 md:py-16">
          <h2 className="text-2xl font-extrabold md:text-3xl">
            Nuestra metodología de certificación
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-neutral-400">
            Cuatro etapas que combinan curaduría cultural, validación técnica y
            registro inmutable.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {['Documentación', 'Curaduría', 'Auditoría', 'Blockchain'].map(
              (s, i) => (
                <div
                  key={s}
                  className="rounded-2xl border border-gold-500/40 bg-navy-600/40 p-4 text-sm font-semibold text-gold-400"
                >
                  <CheckCircle2 className="mx-auto mb-2 h-5 w-5" />
                  {s}
                </div>
              ),
            )}
          </div>
        </div>
      </section>
    </>
  )
}

function StatusPill({ status }: { status: 'verified' | 'pending' | 'expired' | 'revoked' }) {
  const map = {
    verified: { label: 'Verificado', variant: 'success' as const },
    pending: { label: 'En revisión', variant: 'warning' as const },
    expired: { label: 'Vencido', variant: 'danger' as const },
    revoked: { label: 'Revocado', variant: 'danger' as const },
  }
  const c = map[status]
  return <Badge variant={c.variant}>{c.label}</Badge>
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Award
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-widest text-navy-300">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-semibold text-navy-500">{value}</p>
      </div>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-[1320px] px-4 py-12 md:px-8">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-4 h-10 w-3/4" />
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <Skeleton className="aspect-square lg:col-span-5" />
        <div className="space-y-3 lg:col-span-7">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  )
}

function DetailError({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-2xl font-extrabold text-navy-500">
        Certificado no encontrado
      </h1>
      <p className="mt-2 text-sm text-navy-300">{message}</p>
      <Link
        to="/directorio"
        className={cn(buttonVariants({ variant: 'gold', size: 'md' }), 'mt-6')}
      >
        Volver al directorio
      </Link>
    </div>
  )
}
