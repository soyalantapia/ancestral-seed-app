import { Link } from 'react-router-dom'
import { MapPin, Star, User } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Certification, CertificationStatus } from '@/types'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PLACEHOLDER_TOKEN } from '@/services/mocks/data'
import { CategoryBadge } from '@/components/features/CategoryBadge'

interface CertificationCardProps {
  certification: Certification
  /** When true, replaces text labels with the Figma placeholder copy
   * but keeps the cover image. Used in the Home featured grid. */
  placeholderText?: boolean
}

const isPlaceholder = (v: string) => v === PLACEHOLDER_TOKEN || !v

type StatusVariant = 'success' | 'warning' | 'muted' | 'danger'

const STATUS_MAP: Record<
  CertificationStatus,
  { label: string; variant: StatusVariant }
> = {
  verified: { label: 'Vigente', variant: 'success' },
  pending: { label: 'En revisión', variant: 'warning' },
  expired: { label: 'Vencido', variant: 'muted' },
  revoked: { label: 'Revocado', variant: 'danger' },
}

export function CertificationCard({
  certification: c,
  placeholderText = false,
}: CertificationCardProps) {
  // Prefer location ("Argentina · Córdoba") over just category
  const realRegion = c.location ?? (isPlaceholder(c.category) ? '' : c.category)
  const region = placeholderText
    ? 'País - Región'
    : realRegion || 'País - Región'
  const author = placeholderText
    ? 'Autor'
    : isPlaceholder(c.authorName)
      ? 'Autor'
      : c.authorName
  const score = placeholderText ? 'Puntaje' : '100/100'
  const title = placeholderText ? 'Título producto/servicio' : c.title
  const status = STATUS_MAP[c.status] ?? STATUS_MAP.verified

  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
    >
      <Link
        to={`/certificado/${c.slug}`}
        className="relative aspect-[4/3] overflow-hidden bg-neutral-100"
      >
        {c.coverUrl && (
          <img
            src={
              c.coverUrl.startsWith('http')
                ? c.coverUrl
                : `${import.meta.env.BASE_URL}${c.coverUrl.replace(/^\//, '')}`
            }
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <Badge
          variant={placeholderText ? 'success' : status.variant}
          className="absolute right-3 top-3 shadow-sm"
        >
          {placeholderText ? 'Estado' : status.label}
        </Badge>
        {/* Categoría oficial del Reglamento 2.1.1 — solo si está definida
            (compat con certs viejos). Va a la izquierda en compact mode. */}
        {!placeholderText && c.officialCategory && (
          <CategoryBadge
            category={c.officialCategory}
            compact
            className="absolute left-3 top-3 shadow-sm"
          />
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <Link to={`/certificado/${c.slug}`}>
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-navy-500 transition-colors hover:text-gold-700">
            {title}
          </h3>
        </Link>
        <ul className="mt-3 flex flex-col gap-1.5 text-xs text-navy-300">
          <li className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-navy-300" />
            <span>{region}</span>
          </li>
          <li className="flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-navy-300" />
            <span>{author}</span>
          </li>
          <li className="flex items-center gap-2">
            <Star className="h-3.5 w-3.5 text-navy-300" />
            <span>{score}</span>
          </li>
        </ul>
        <Link
          to={`/certificado/${c.slug}`}
          className={cn(
            buttonVariants({ variant: 'navy', size: 'sm' }),
            'mt-5 w-fit',
          )}
        >
          Ver certificado
        </Link>
      </div>
    </motion.article>
  )
}
