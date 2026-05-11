import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Award,
  Bell,
  Calendar,
  CheckCheck,
  FileUp,
  Image as ImageIcon,
  Inbox,
  MessageSquare,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useNotificationsStore } from '@/store/notifications'
import type { NotificationKind } from '@/types'
import { cn } from '@/lib/utils'

const tabs = ['Todas', 'No leídas'] as const
type Tab = (typeof tabs)[number]

const iconMap: Record<NotificationKind, typeof Bell> = {
  audit_proposed: Calendar,
  audit_accepted: CheckCheck,
  evidence_request: ImageIcon,
  stage_changed: Award,
  message_received: MessageSquare,
  document_uploaded: FileUp,
  cert_published: Award,
}

const labelMap: Record<NotificationKind, { color: string; tag: string }> = {
  audit_proposed: { color: 'bg-info-100 text-info-400', tag: 'Auditoría' },
  audit_accepted: { color: 'bg-success-100 text-success-300', tag: 'Auditoría' },
  evidence_request: { color: 'bg-warning-100 text-warning-400', tag: 'Evidencias' },
  stage_changed: { color: 'bg-gold-100 text-gold-700', tag: 'Estado' },
  message_received: { color: 'bg-info-100 text-info-400', tag: 'Mensaje' },
  document_uploaded: { color: 'bg-neutral-200 text-navy-500', tag: 'Documento' },
  cert_published: { color: 'bg-success-100 text-success-300', tag: 'Certificación' },
}

export default function Notifications() {
  const items = useNotificationsStore((s) => s.items)
  const markRead = useNotificationsStore((s) => s.markRead)
  const markAllRead = useNotificationsStore((s) => s.markAllRead)
  const remove = useNotificationsStore((s) => s.remove)
  const [tab, setTab] = useState<Tab>('Todas')

  const filtered = tab === 'No leídas' ? items.filter((n) => !n.read) : items
  const unreadCount = items.filter((n) => !n.read).length

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-8 md:px-10 md:py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
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
            className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-navy-500 transition-colors hover:bg-neutral-100"
          >
            <CheckCheck className="h-4 w-4" />
            Marcar todas como leídas
          </button>
        )}
      </div>

      <div className="mt-6 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'rounded-full px-5 py-2 text-sm font-bold transition-colors',
              tab === t
                ? 'bg-gold-100 text-gold-700 ring-1 ring-gold-300'
                : 'text-navy-300 hover:bg-neutral-100 hover:text-navy-500',
            )}
          >
            {t}
            {t === 'No leídas' && unreadCount > 0 && (
              <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gold-500 px-1.5 text-xs font-bold text-navy-500">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-neutral-300 p-12 text-center">
          <Inbox className="mx-auto h-10 w-10 text-navy-300" strokeWidth={1.5} />
          <p className="mt-4 text-sm font-semibold text-navy-500">
            {tab === 'No leídas' ? 'No hay notificaciones sin leer' : 'No tenés notificaciones'}
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
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider', meta.color)}>
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
                    remove(n.id)
                    toast.success('Notificación eliminada')
                  }}
                  className="opacity-0 transition-opacity hover:text-error-400 group-hover:opacity-100"
                  aria-label="Eliminar"
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
