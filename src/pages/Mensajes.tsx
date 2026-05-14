import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ExternalLink,
  Filter,
  Inbox,
  Search,
  Send,
} from 'lucide-react'
import { toast } from 'sonner'
import { mockCertificationRequests } from '@/services/mocks/data'
import type { CertificationRequest, TutorMessage } from '@/types'
import { cn } from '@/lib/utils'

type Thread = {
  id: string // meeting id
  req: CertificationRequest
  tutorName: string
  messages: TutorMessage[]
  lastAt: string
  unread: number
  preview: string
}

function buildThreads(): Thread[] {
  const out: Thread[] = []
  for (const r of mockCertificationRequests) {
    const threads = r.threads ?? {}
    for (const [meetingId, list] of Object.entries(threads)) {
      const tutor = list.find((m) => m.author === 'tutor')
      if (list.length === 0) continue
      // last message
      const sorted = list
        .slice()
        .sort(
          (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
        )
      const lastMsg = sorted[sorted.length - 1]
      // Mock "unread" — primer mensaje del tutor cuenta como no leído si hay
      const unread = list.filter((m) => m.author === 'tutor').length
      out.push({
        id: meetingId,
        req: r,
        tutorName: tutor?.authorName ?? 'Tutor',
        messages: sorted,
        lastAt: lastMsg.at,
        unread,
        preview: lastMsg.body.slice(0, 90),
      })
    }
  }
  return out
    .sort(
      (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime(),
    )
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.round(diff / 60_000)
  if (mins < 1) return 'recién'
  if (mins < 60) return `hace ${mins}min`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `hace ${hrs}h`
  const days = Math.round(hrs / 24)
  if (days < 7) return `hace ${days}d`
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
  })
}

function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function Mensajes() {
  const initialThreads = useMemo(() => buildThreads(), [])
  const [threads, setThreads] = useState<Thread[]>(initialThreads)
  const [activeId, setActiveId] = useState<string | null>(
    initialThreads[0]?.id ?? null,
  )
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [draft, setDraft] = useState('')

  const active = threads.find((t) => t.id === activeId)

  // Filter threads
  const filteredThreads = useMemo(() => {
    let list = threads
    if (filter === 'unread') list = list.filter((t) => t.unread > 0)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (t) =>
          t.tutorName.toLowerCase().includes(q) ||
          t.preview.toLowerCase().includes(q) ||
          t.req.productName.toLowerCase().includes(q),
      )
    }
    return list
  }, [threads, filter, query])

  // Marcar como leído al abrir
  useEffect(() => {
    if (!activeId) return
    setThreads((prev) =>
      prev.map((t) => (t.id === activeId ? { ...t, unread: 0 } : t)),
    )
  }, [activeId])

  const handleSend = () => {
    if (!draft.trim() || !active) return
    const newMsg: TutorMessage = {
      id: `msg-${Date.now()}`,
      author: 'tu',
      authorName: 'Yo',
      body: draft.trim(),
      at: new Date().toISOString(),
    }
    setThreads((prev) =>
      prev.map((t) =>
        t.id === active.id
          ? {
              ...t,
              messages: [...t.messages, newMsg],
              lastAt: newMsg.at,
              preview: newMsg.body.slice(0, 90),
            }
          : t,
      ),
    )
    setDraft('')
    toast.success('Mensaje enviado')
  }

  const totalUnread = threads.reduce((a, t) => a + t.unread, 0)

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 md:px-10 md:py-10">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-500 md:text-[28px]">
            Mensajes
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-navy-300 md:text-base">
            Conversaciones con tutores, curadores y auditores de tus
            certificaciones.
            {totalUnread > 0 && (
              <span className="ml-1 font-bold text-navy-500">
                Tenés {totalUnread} mensaje{totalUnread === 1 ? '' : 's'} sin
                leer.
              </span>
            )}
          </p>
        </div>
      </header>

      {threads.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-neutral-300 p-12 text-center">
          <Inbox className="mx-auto h-10 w-10 text-navy-300" />
          <p className="mt-4 text-sm font-bold text-navy-500">
            No tenés mensajes todavía
          </p>
          <p className="mt-1 text-sm text-navy-300">
            Cuando un tutor te escriba, vas a verlo acá.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 rounded-3xl border border-neutral-200 bg-white shadow-sm md:grid-cols-12 md:gap-0">
          {/* LISTA THREADS */}
          <aside
            className={cn(
              'flex flex-col border-neutral-200 md:col-span-5 md:border-r lg:col-span-4',
              // En mobile, ocultar lista cuando hay thread activo
              active && 'hidden md:flex',
            )}
          >
            <div className="border-b border-neutral-200 p-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar mensajes..."
                  className="h-10 w-full rounded-full border border-neutral-300 bg-white pl-11 pr-4 text-sm text-navy-500 placeholder:text-navy-300 focus:border-gold-500 focus:outline-none"
                />
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-navy-300" />
                {(['all', 'unread'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-colors',
                      filter === f
                        ? 'bg-navy-500 text-white'
                        : 'border border-neutral-300 bg-white text-navy-500 hover:bg-neutral-100',
                    )}
                  >
                    {f === 'all' ? 'Todos' : 'No leídos'}
                    {f === 'unread' && totalUnread > 0 && (
                      <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-navy-500">
                        {totalUnread}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <ul className="flex max-h-[70vh] flex-col overflow-y-auto divide-y divide-neutral-200">
              {filteredThreads.length === 0 ? (
                <li className="p-6 text-center text-sm text-navy-300">
                  No hay conversaciones que coincidan.
                </li>
              ) : (
                filteredThreads.map((t) => {
                  const isActive = t.id === activeId
                  return (
                    <li key={t.id}>
                      <button
                        type="button"
                        onClick={() => setActiveId(t.id)}
                        className={cn(
                          'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors',
                          isActive
                            ? 'bg-gold-100'
                            : 'hover:bg-neutral-100',
                        )}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-500 text-xs font-bold text-white">
                          {initials(t.tutorName)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-bold text-navy-500">
                              {t.tutorName}
                            </p>
                            <span className="shrink-0 text-[10px] text-navy-300">
                              {formatRelative(t.lastAt)}
                            </span>
                          </div>
                          <p className="mt-0.5 truncate text-xs text-navy-300">
                            {t.req.number} · {t.req.productName}
                          </p>
                          <p className="mt-1 line-clamp-1 text-xs text-navy-500/80">
                            {t.preview}
                          </p>
                        </div>
                        {t.unread > 0 && (
                          <span className="mt-1 inline-flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-gold-500 px-1.5 text-[10px] font-bold text-navy-500">
                            {t.unread}
                          </span>
                        )}
                      </button>
                    </li>
                  )
                })
              )}
            </ul>
          </aside>

          {/* THREAD ACTIVO */}
          <section
            className={cn(
              'flex flex-col md:col-span-7 lg:col-span-8',
              // En mobile, ocultar si no hay thread activo
              !active && 'hidden md:flex',
            )}
          >
            {active ? (
              <ThreadView
                thread={active}
                draft={draft}
                setDraft={setDraft}
                onSend={handleSend}
                onBack={() => setActiveId(null)}
              />
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
                <Inbox className="h-10 w-10 text-navy-300" />
                <p className="mt-4 text-sm font-bold text-navy-500">
                  Elegí una conversación
                </p>
                <p className="mt-1 text-xs text-navy-300">
                  Mostramos los mensajes de la conversación seleccionada.
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

function ThreadView({
  thread,
  draft,
  setDraft,
  onSend,
  onBack,
}: {
  thread: Thread
  draft: string
  setDraft: (v: string) => void
  onSend: () => void
  onBack: () => void
}) {
  return (
    <div className="flex h-full max-h-[80vh] flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3 md:px-6 md:py-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Volver"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-navy-500 hover:bg-neutral-100 md:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy-500 text-xs font-bold text-white">
          {initials(thread.tutorName)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-navy-500">
            {thread.tutorName}
          </p>
          <p className="truncate text-xs text-navy-300">
            {thread.req.number} · {thread.req.productName}
          </p>
        </div>
        <Link
          to={`/mis-certificaciones/${thread.req.id}?tab=evaluacion`}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 text-xs font-bold text-navy-500 transition-colors hover:bg-neutral-100"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Ver solicitud</span>
        </Link>
      </header>

      {/* Mensajes */}
      <div className="flex-1 space-y-3 overflow-y-auto bg-neutral-100/50 p-4 md:p-6">
        {thread.messages.map((m) => {
          const mine = m.author === 'tu'
          return (
            <div
              key={m.id}
              className={cn(
                'flex',
                mine ? 'justify-end' : 'justify-start',
              )}
            >
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm',
                  mine
                    ? 'rounded-br-sm bg-navy-500 text-white'
                    : 'rounded-bl-sm bg-white text-navy-500',
                )}
              >
                {!mine && (
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gold-700">
                    {m.authorName}
                  </p>
                )}
                <p
                  className={cn(
                    'whitespace-pre-line text-sm leading-relaxed',
                    !mine && 'mt-0.5',
                  )}
                >
                  {m.body}
                </p>
                <p
                  className={cn(
                    'mt-1 text-[10px]',
                    mine ? 'text-white/70' : 'text-navy-300',
                  )}
                >
                  {formatRelative(m.at)}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Input */}
      <div className="border-t border-neutral-200 p-3 md:p-4">
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                onSend()
              }
            }}
            rows={2}
            placeholder="Escribí tu mensaje… (Cmd/Ctrl + Enter para enviar)"
            className="flex-1 resize-none rounded-2xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-navy-500 placeholder:text-navy-300 focus:border-gold-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={onSend}
            disabled={!draft.trim()}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-navy-500 px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-navy-400 disabled:cursor-not-allowed disabled:opacity-40 sm:px-5"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </div>
      </div>
    </div>
  )
}
