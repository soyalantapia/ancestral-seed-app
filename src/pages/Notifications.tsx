import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Award,
  Bell,
  Calendar,
  CheckCheck,
  FileUp,
  Image as ImageIcon,
  Inbox,
  MessageSquare,
  Search,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useNotificationsStore } from '@/store/notifications'
import { deriveActionAlerts } from '@/lib/alerts'
import { mockCertificationRequests } from '@/services/mocks/data'
import type { NotificationKind } from '@/types'
import { cn } from '@/lib/utils'

// Fila unificada de filtros: tipo + estado (no leídas).
// "unread" no es un kind, es un toggle aparte que usamos al filtrar.
const typeFilters: Array<{
  id: string
  label: string
  kinds: NotificationKind[]
  unreadOnly?: boolean
}> = [
  // Fix UX (revisión postulante): 6 filtros sobre-segmentaban ~5 notifs.
  // Dejamos solo Todas / No leídas — el resto era ruido. El tipo ya se ve
  // en el tag de cada item.
  { id: 'all', label: 'Todas', kinds: [] },
  { id: 'unread', label: 'No leídas', kinds: [], unreadOnly: true },
]

const iconMap: Record<NotificationKind, typeof Bell> = {
  audit_proposed: Calendar,
  audit_accepted: CheckCheck,
  evidence_request: ImageIcon,
  stage_changed: Award,
  message_received: MessageSquare,
  document_uploaded: FileUp,
  cert_published: Award,
}

/**
 * Fix V2-POS-20 (auditoría v2): el filtro "Avances" agrupaba
 * `stage_changed` + `cert_published`, pero los badges decían
 * respectivamente "Estado" y "Certificación" — taxonomía
 * inconsistente que confundía al user.
 *
 * Fix V3-POS-17 (auditoría v3): la primera iteración unificó AMBOS
 * a "Avance" diferenciando solo por color — pero eso violaba WCAG
 * (info-por-color) y el screen reader leía "Avance" dos veces sin
 * distinguir. Ahora cada uno tiene su propio sub-label específico
 * ("Avance · Etapa" para cambios de etapa, "Avance · Publicado" para
 * cuando el cert se publica). El prefijo "Avance" mantiene la
 * coherencia con el filtro tab; el sufijo aporta la distinción
 * semántica que el color no podía cargar solo.
 */
const labelMap: Record<NotificationKind, { color: string; tag: string }> = {
  audit_proposed: { color: 'bg-info-100 text-info-400', tag: 'Auditoría' },
  audit_accepted: { color: 'bg-success-100 text-success-300', tag: 'Auditoría' },
  evidence_request: { color: 'bg-warning-100 text-warning-400', tag: 'Evidencias' },
  stage_changed: { color: 'bg-gold-100 text-gold-700', tag: 'Avance · Etapa' },
  message_received: { color: 'bg-info-100 text-info-400', tag: 'Mensaje' },
  document_uploaded: { color: 'bg-neutral-200 text-navy-500', tag: 'Documento' },
  cert_published: { color: 'bg-success-100 text-success-300', tag: 'Avance · Publicado' },
}

export default function Notifications() {
  const items = useNotificationsStore((s) => s.items)
  const markRead = useNotificationsStore((s) => s.markRead)
  const markAllRead = useNotificationsStore((s) => s.markAllRead)
  const remove = useNotificationsStore((s) => s.remove)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [query, setQuery] = useState('')

  // Alertas accionables (pagos, propuestas del tutor, diagnóstico, apelar):
  // antes eran un banner dentro del detalle de cada certificación; ahora se
  // centralizan acá, arriba del log de novedades.
  const alerts = deriveActionAlerts(mockCertificationRequests)

  const selectedFilter = typeFilters.find((f) => f.id === typeFilter)
  let filtered = items
  if (selectedFilter?.unreadOnly) {
    filtered = filtered.filter((n) => !n.read)
  }
  if (selectedFilter && selectedFilter.kinds.length > 0) {
    filtered = filtered.filter((n) => selectedFilter.kinds.includes(n.kind))
  }
  if (query.trim()) {
    const q = query.toLowerCase()
    filtered = filtered.filter(
      (n) =>
        n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q),
    )
  }
  const unreadCount = items.filter((n) => !n.read).length

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 md:px-10 md:py-10">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-navy-500 md:text-[28px]">
            Notificaciones
          </h1>
          <p className="mt-1 text-sm text-navy-300 md:text-base">
            {unreadCount > 0
              ? `Tenés ${unreadCount} ${unreadCount === 1 ? 'novedad sin leer' : 'novedades sin leer'}.`
              : 'Estás al día.'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => {
              markAllRead()
              toast.success('Notificaciones marcadas como leídas')
            }}
            aria-label="Marcar todas como leídas"
            title="Marcar todas como leídas"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-neutral-300 bg-white p-2.5 text-sm font-semibold text-navy-500 transition-colors hover:bg-neutral-100 lg:px-4 lg:py-2"
          >
            <CheckCheck className="h-4 w-4" />
            {/* Icon-only hasta lg: en mobile y en tablet (donde el sidebar aprieta
                el contenido) queda solo el ✓✓ a la derecha del título para no
                pisarse; el texto completo vuelve en ≥lg, donde hay lugar. */}
            <span className="hidden lg:inline">Marcar todas como leídas</span>
          </button>
        )}
      </div>

      {/* Necesitan tu acción — alertas accionables centralizadas */}
      {alerts.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-navy-300">
            Necesitan tu acción
          </h2>
          <ul className="mt-3 space-y-3">
            {alerts.map((a) => {
              const Icon = a.icon
              return (
                <li
                  key={a.id}
                  className={cn(
                    'overflow-hidden rounded-2xl border shadow-sm',
                    a.urgent
                      ? 'border-error-300/60 bg-gradient-to-br from-error-100/60 to-white'
                      : 'border-gold-300/60 bg-gradient-to-br from-gold-100/40 to-white',
                  )}
                >
                  <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
                    {/* Ícono + texto agrupados: en mobile van juntos en una fila
                        arriba, el botón cae full-width abajo. En ≥sm, todo en línea. */}
                    <div className="flex min-w-0 flex-1 items-start gap-4 sm:items-center">
                      <div
                        className={cn(
                          'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
                        a.urgent
                          ? 'bg-error-400 text-white shadow-sm'
                          : 'bg-gold-500 text-navy-500 shadow-sm',
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          'text-[11px] font-bold uppercase tracking-widest',
                          a.urgent ? 'text-error-400' : 'text-gold-700',
                        )}
                      >
                        {a.urgent ? 'Acción urgente' : 'Para hacer'}
                      </p>
                      <p className="mt-0.5 text-base font-bold text-navy-500">
                        {a.title}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-navy-300">
                        {a.body}
                      </p>
                    </div>
                    </div>
                    <Link
                      to={a.cta.to}
                      className={cn(
                        'inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors sm:w-auto sm:justify-start',
                        a.urgent
                          ? 'bg-error-400 hover:bg-error-300'
                          : 'bg-navy-500 hover:bg-navy-400',
                      )}
                    >
                      {a.cta.label}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {/* Novedades — el log de notificaciones */}
      {alerts.length > 0 && (
        <h2 className="mt-8 text-xs font-bold uppercase tracking-wider text-navy-300">
          Novedades
        </h2>
      )}

      {/* Search bar */}
      <div className="mt-6 relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar notificación por título o contenido…"
          className="h-11 w-full rounded-full border border-neutral-300 bg-white pl-11 pr-4 text-sm text-navy-500 placeholder:text-navy-300 focus:border-gold-500 focus:outline-none"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {typeFilters.map((f) => {
          const active = typeFilter === f.id
          const showBadge = f.id === 'unread' && unreadCount > 0
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setTypeFilter(f.id)}
              className={cn(
                'inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold transition-colors',
                active
                  ? 'border-navy-500 bg-navy-500 text-white'
                  : 'border-neutral-300 bg-white text-navy-400 hover:bg-neutral-100',
              )}
            >
              {f.label}
              {showBadge && (
                <span
                  className={cn(
                    'inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold',
                    active
                      ? 'bg-gold-500 text-navy-500'
                      : 'bg-gold-500 text-navy-500',
                  )}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-neutral-300 p-12 text-center">
          <Inbox className="mx-auto h-10 w-10 text-navy-300" strokeWidth={1.5} />
          <p className="mt-4 text-sm font-semibold text-navy-500">
            {selectedFilter?.unreadOnly
              ? 'No hay notificaciones sin leer'
              : 'No tenés notificaciones'}
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-navy-300">
            Cuando un tutor revise tu solicitud o haya novedades, vas a verlo acá.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {filtered.map((n) => {
            const Icon = iconMap[n.kind]
            const meta = labelMap[n.kind]
            return (
              <li
                key={n.id}
                className={cn(
                  'group relative flex items-start gap-4 rounded-2xl border bg-white p-5 shadow-sm transition-colors',
                  n.read ? 'border-neutral-200' : 'border-gold-300 bg-gold-100/30',
                )}
              >
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', meta.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-navy-500">{n.title}</p>
                    {/* Fix V4-POS-08 (auditoría v4): tags como "AVANCE · ETAPA"
                        rompían en mobile angosto cortando el `·` al inicio de
                        línea sin contexto. `whitespace-nowrap` mantiene el
                        tag entero en una línea. */}
                    <span className={cn('whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider', meta.color)}>
                      {meta.tag}
                    </span>
                    {!n.read && (
                      <span className="h-2 w-2 rounded-full bg-gold-500" aria-label="Sin leer" />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-navy-300">{n.body}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-navy-300">
                    <span>{formatRelative(n.createdAt)}</span>
                    {n.link && (
                      <Link
                        to={n.link}
                        onClick={() => markRead(n.id)}
                        className="font-semibold text-gold-700 hover:underline"
                      >
                        Ver detalle →
                      </Link>
                    )}
                    {!n.read && (
                      <button
                        type="button"
                        onClick={() => markRead(n.id)}
                        className="font-semibold text-navy-500 hover:underline"
                      >
                        Marcar como leída
                      </button>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    /**
                     * Fix V3-POS-14 (auditoría v3): antes el delete
                     * era directo + toast plano. Un tap accidental
                     * (mobile sin opacity-0 que oculta el botón)
                     * destruía la notificación sin recurso. Ahora
                     * aplicamos el mismo patrón que la eliminación
                     * de evidencias (QW-D1 del v1): toast.success
                     * con acción "Deshacer" durante 6s que restaura
                     * el item al store.
                     */
                    const removed = n
                    remove(n.id)
                    toast.success('Notificación eliminada', {
                      duration: 6000,
                      action: {
                        label: 'Deshacer',
                        onClick: () => {
                          /**
                           * Fix V4-POS-09 (auditoría v4): antes el
                           * Deshacer hacía prepend, lo que ponía la
                           * notif restaurada en TOPE aunque hubiera
                           * sido la 5ta más vieja. El comentario
                           * asumía que la UI re-ordenaría por `at`
                           * — pero no hay sort. Ahora reinsertamos
                           * en la posición correcta según el ISO
                           * timestamp `at` (mismo orden DESC que el
                           * resto de items).
                           */
                          useNotificationsStore.setState((s) => {
                            const next = [...s.items]
                            const insertAt = next.findIndex(
                              (item) => item.createdAt < removed.createdAt,
                            )
                            if (insertAt === -1) next.push(removed)
                            else next.splice(insertAt, 0, removed)
                            return { items: next }
                          })
                        },
                      },
                    })
                  }}
                  /*
                    Fix V3-POS-18 (auditoría v3): antes
                    `md:opacity-0 md:group-hover:opacity-100` dejaba
                    el botón siempre visible en mobile sin opacity
                    reducida → tap accidental constante. Ahora en
                    mobile tiene opacity-60 base y opacity-100 al
                    active/focus para reducir taps fantasma.
                  */
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-navy-300 opacity-60 transition-all hover:bg-error-100 hover:text-error-400 hover:opacity-100 focus-visible:bg-error-100 focus-visible:text-error-400 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error-300 active:opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
                  aria-label="Eliminar notificación"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function formatRelative(iso: string): string {
  const now = new Date()
  const date = new Date(iso)
  const diffMs = now.getTime() - date.getTime()
  const mins = Math.round(diffMs / 60000)
  if (mins < 1) return 'recién'
  if (mins < 60) return `hace ${mins}min`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `hace ${hrs}h`
  const days = Math.round(hrs / 24)
  if (days < 7) return `hace ${days}d`
  const weeks = Math.round(days / 7)
  if (weeks < 4) return `hace ${weeks}sem`
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}
