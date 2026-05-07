import { Link } from 'react-router-dom'
import { MapPin, Star, User } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Certification } from '@/types'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CertificationCardProps {
  certification: Certification
}

export function CertificationCard({
  certification: c,
}: CertificationCardProps) {
  const region = inferRegion(c)
  const score = inferScore(c)

  return (
    <motion.article
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="group flex flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
    >
      <Link
        to={`/certificado/${c.slug}`}
        className="relative aspect-[4/3] overflow-hidden"
      >
        <img
          src={c.coverUrl}
          alt={c.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <StatusBadge status={c.status} className="absolute right-3 top-3" />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <Link to={`/certificado/${c.slug}`}>
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-navy-500 transition-colors hover:text-gold-700">
            {c.title}
          </h3>
        </Link>
        <ul className="mt-3 flex flex-col gap-1.5 text-xs text-navy-300">
          <li className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-navy-300" />
            <span>{region}</span>
          </li>
          <li className="flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-navy-300" />
            <span>{c.authorName}</span>
          </li>
          <li className="flex items-center gap-2">
            <Star className="h-3.5 w-3.5 text-navy-300" />
            <span>{score}/100</span>
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

function StatusBadge({
  status,
  className,
}: {
  status: Certification['status']
  className?: string
}) {
  const config: Record<
    Certification['status'],
    { label: string; variant: 'success' | 'warning' | 'danger' | 'muted' }
  > = {
    verified: { label: 'Activo', variant: 'success' },
    pending: { label: 'En revisión', variant: 'warning' },
    expired: { label: 'Vencido', variant: 'danger' },
    revoked: { label: 'Revocado', variant: 'danger' },
  }
  const c = config[status]
  return (
    <Badge variant={c.variant} className={className}>
      {c.label}
    </Badge>
  )
}

function inferRegion(c: Certification): string {
  // Mock: derive region from category and author for visual variety.
  const map: Record<string, string> = {
    'Cereales andinos': 'Argentina · Quebrada de Humahuaca',
    'Pseudocereales': 'Argentina · NOA',
    'Tubérculos': 'Argentina · Jujuy',
    'Frutos del monte': 'Argentina · Chaco árido',
    Hortalizas: 'Argentina · Valle de Uco',
    Aromáticas: 'Argentina · Sierras de Córdoba',
  }
  return map[c.category] ?? 'Argentina · NOA'
}

function inferScore(c: Certification): number {
  // Mock score 75–100 based on slug hash for stability.
  const hash = c.slug
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return 75 + (hash % 26)
}
