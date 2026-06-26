import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarClock,
  Check,
  ClipboardCheck,
  Download,
  FileCheck2,
  ListChecks,
  MessageSquare,
  Phone,
  Search,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react'
import { toast } from 'sonner'
import type { TutorTask, TutorTaskPriority } from '@/types'
import { useTutorTasksStore } from '@/store/tutorTasks'
import { cn, downloadBlob, objectsToCsv } from '@/lib/utils'

type SortKey = 'priority' | 'recent' | 'alphabetical'

const PRIORITY_META: Record<
  TutorTaskPriority,
  { label: string; cls: string }
> = {
  urgent: {
    label: 'Urgente',
    cls: 'bg-error-100 text-error-400 ring-1 ring-error-300/40',
  },
  today: {
    label: 'Hoy',
    cls: 'bg-warning-100 text-warning-400 ring-1 ring-warning-300/40',
  },
  this_week: {
    label: 'Esta semana',
    cls: 'bg-info-100 text-info-400 ring-1 ring-info-300/40',
  },
}

const KIND_META: Record<
  TutorTask['kind'],
  { label: string; icon: typeof FileCheck2 }
> = {
  review_evidence: { label: 'Revisar evidencias', icon: FileCheck2 },
  call_applicant: { label: 'Coordinar llamada', icon: Phone },
  sign_evaluation: { label: 'Firmar evaluación', icon: ShieldCheck },
  send_message: { label: 'Responder mensaje', icon: MessageSquare },
  audit_meeting: { label: 'Preparar auditoría', icon: CalendarClock },
  verify_documentation: { label: 'Validar documentación', icon: ClipboardCheck },
  review_case: { label: 'Revisar caso', icon: FileCheck2 },
}

/**
 * Página dedicada de tareas del tutor.
 *
 * Hoy las tareas viven dentro del Dashboard. Cuando el tutor tiene 20+ tareas
 * el dashboard se llena, este vista permite:
 *   - filtrar por prioridad (urgent/today/this_week) + estado (pending/done)
 *   - buscar por texto en título o caso
 *   - bulk actions: marcar varias como hechas o exportar CSV
 *   - ver claramente qué quedó por hacer
 */
export default function TutorTasks() {
  // SB11 fix (#TUT-29): tasks vienen del store compartido. Antes useState
  // local separado del TutorDashboard — marcar "hecha" en una vista NO
  // se reflejaba en la otra.
  const tasks = useTutorTasksStore((s) => s.tasks)
  const toggleTaskStore = useTutorTasksStore((s) => s.toggle)
  const markDoneStore = useTutorTasksStore((s) => s.markDone)
  // El filtro vive en el store (igual que TutorDashboard) para que persista
  // entre vistas y sesiones; antes era useState local y se reseteaba a 'all'
  // en cada navegación (#TUT-29 / V2-TUT-13).
  const filter = useTutorTasksStore((s) => s.filter)
  const setFilter = useTutorTasksStore((s) => s.setFilter)
  const [sort, setSort] = useState<SortKey>('priority')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const stats = useMemo(() => {
    const pending = tasks.filter((t) => !t.done)
    return {
      total: tasks.length,
      pending: pending.length,
      urgent: pending.filter((t) => t.priority === 'urgent').length,
      today: pending.filter((t) => t.priority === 'today').length,
      thisWeek: pending.filter((t) => t.priority === 'this_week').length,
      done: tasks.filter((t) => t.done).length,
    }
  }, [tasks])

  const filtered = useMemo(() => {
    let list = [...tasks]
    if (filter === 'pending') list = list.filter((t) => !t.done)
    else if (filter === 'done') list = list.filter((t) => t.done)
    else if (filter !== 'all') list = list.filter((t) => t.priority === filter)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.caseName.toLowerCase().includes(q) ||
          t.applicantName.toLowerCase().includes(q),
      )
    }
    const priorityRank: Record<TutorTaskPriority, number> = {
      urgent: 0,
      today: 1,
      this_week: 2,
    }
    list.sort((a, b) => {
      if (sort === 'priority') {
        const d = priorityRank[a.priority] - priorityRank[b.priority]
        if (d !== 0) return d
        return a.title.localeCompare(b.title)
      }
      if (sort === 'alphabetical') return a.title.localeCompare(b.title)
      // recent → orden inverso del array original
      return tasks.indexOf(b) - tasks.indexOf(a)
    })
    return list
  }, [tasks, filter, query, sort])

  const toggleTask = toggleTaskStore

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const selectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map((t) => t.id)))
  }

  const bulkMarkDone = () => {
    markDoneStore(Array.from(selected))
    toast.success(`${selected.size} tareas marcadas como hechas`)
    setSelected(new Set())
  }

  const exportCsv = () => {
    const rows = filtered.map((t) => ({
      id: t.id,
      titulo: t.title,
      tipo: KIND_META[t.kind]?.label ?? t.kind,
      prioridad: PRIORITY_META[t.priority].label,
      caso: t.caseId,
      producto: t.caseName,
      solicitante: t.applicantName,
      estado: t.done ? 'hecha' : 'pendiente',
      vence: t.dueAt ?? '',
    }))
    downloadBlob(
      `tareas-tutor-${new Date().toISOString().slice(0, 10)}.csv`,
      objectsToCsv(rows),
      'text/csv;charset=utf-8',
    )
    toast.success(`${rows.length} tareas exportadas a CSV`)
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy-500 md:text-[28px]">
            Mis tareas
          </h1>
          <p className="mt-1 text-sm text-navy-300">
            {/* Fix SM4 (#TUT-30, auditoría UX): concordancia singular/
                plural correcta. Antes "1 urgentes" rompía gramaticalmente. */}
            Tenés {stats.pending}{' '}
            {stats.pending === 1 ? 'pendiente' : 'pendientes'}
            {stats.urgent > 0 && (
              <>
                {', '}
                <strong className="text-error-400">
                  {stats.urgent}{' '}
                  {stats.urgent === 1 ? 'urgente' : 'urgentes'}
                </strong>
              </>
            )}
            . Filtrá por prioridad o usá la barra para buscar.
          </p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 text-xs font-bold text-navy-500 transition-colors hover:bg-neutral-100"
        >
          <Download className="h-3.5 w-3.5" />
          Exportar CSV
        </button>
      </header>

      {/* KPIs */}
      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi
          icon={TriangleAlert}
          label="Urgentes"
          value={stats.urgent}
          tone="red"
        />
        <Kpi icon={CalendarClock} label="Hoy" value={stats.today} tone="amber" />
        <Kpi
          icon={ListChecks}
          label="Esta semana"
          value={stats.thisWeek}
          tone="info"
        />
        <Kpi icon={Check} label="Completadas" value={stats.done} tone="green" />
      </section>

      {/* Filtros + búsqueda */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <FilterPill
          label="Todas"
          count={stats.total}
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        />
        <FilterPill
          label="Pendientes"
          count={stats.pending}
          active={filter === 'pending'}
          onClick={() => setFilter('pending')}
        />
        <FilterPill
          label="Urgentes"
          count={stats.urgent}
          active={filter === 'urgent'}
          onClick={() => setFilter('urgent')}
          tone="red"
        />
        <FilterPill
          label="Hoy"
          count={stats.today}
          active={filter === 'today'}
          onClick={() => setFilter('today')}
          tone="amber"
        />
        <FilterPill
          label="Esta semana"
          count={stats.thisWeek}
          active={filter === 'this_week'}
          onClick={() => setFilter('this_week')}
        />
        <FilterPill
          label="Completadas"
          count={stats.done}
          active={filter === 'done'}
          onClick={() => setFilter('done')}
        />
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar tarea, caso o solicitante…"
              className="h-9 w-64 rounded-full border border-neutral-300 bg-white pl-10 pr-3 text-xs text-navy-500 placeholder:text-navy-300 focus:border-gold-500 focus:outline-none"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-9 rounded-full border border-neutral-300 bg-white px-3 text-xs font-bold text-navy-500 focus:border-gold-500 focus:outline-none"
          >
            <option value="priority">Por prioridad</option>
            <option value="recent">Más recientes</option>
            <option value="alphabetical">A → Z</option>
          </select>
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-navy-500 px-4 py-3 text-white">
          <span className="text-xs font-bold">
            {selected.size} seleccionada{selected.size === 1 ? '' : 's'}
          </span>
          <button
            type="button"
            onClick={bulkMarkDone}
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-gold-500 px-3 text-[11px] font-bold text-navy-500 hover:bg-gold-400"
          >
            <Check className="h-3.5 w-3.5" />
            Marcar como hechas
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs font-semibold text-white/70 hover:text-white"
          >
            Limpiar selección
          </button>
        </div>
      )}

      {/* Lista */}
      <section className="mt-6 overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <ListChecks className="mx-auto h-8 w-8 text-navy-300" />
            <p className="mt-2 text-sm font-bold text-navy-500">
              No hay tareas que coincidan
            </p>
            <p className="mt-1 text-xs text-navy-300">
              Probá ajustar el filtro o la búsqueda.
            </p>
          </div>
        ) : (
          <>
            {/* Header row con select-all */}
            <div className="flex items-center gap-3 border-b border-neutral-200 bg-neutral-100/60 px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-navy-300">
              <input
                type="checkbox"
                checked={
                  selected.size > 0 && selected.size === filtered.length
                }
                onChange={selectAll}
                aria-label="Seleccionar todas"
                className="h-4 w-4 cursor-pointer accent-gold-500"
              />
              <span>Tarea ({filtered.length})</span>
            </div>
            <ul className="divide-y divide-neutral-200">
              {filtered.map((t) => {
                const Icon = KIND_META[t.kind]?.icon ?? FileCheck2
                const priorityMeta = PRIORITY_META[t.priority]
                const isSel = selected.has(t.id)
                return (
                  <li
                    key={t.id}
                    className={cn(
                      'flex flex-wrap items-start gap-3 px-4 py-3 transition-colors hover:bg-neutral-100/40',
                      t.done && 'bg-neutral-100/30',
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isSel}
                      onChange={() => toggleSelect(t.id)}
                      aria-label={`Seleccionar ${t.title}`}
                      className="mt-1.5 h-4 w-4 cursor-pointer accent-gold-500"
                    />
                    <button
                      type="button"
                      onClick={() => toggleTask(t.id)}
                      aria-label={t.done ? 'Reabrir' : 'Marcar hecha'}
                      className={cn(
                        'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors',
                        t.done
                          ? 'bg-success-300 text-white ring-1 ring-success-300'
                          : 'border-2 border-neutral-400 bg-white hover:border-success-300 hover:bg-success-100',
                      )}
                    >
                      {t.done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                    </button>
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p
                          className={cn(
                            'text-sm font-bold text-navy-500',
                            t.done && 'line-through text-navy-300',
                          )}
                        >
                          {t.title}
                        </p>
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[10px] font-bold',
                            priorityMeta.cls,
                          )}
                        >
                          {priorityMeta.label}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-navy-300">
                        {t.caseName}
                        {t.applicantName && ` · ${t.applicantName}`}
                        {t.dueAt && ` · Vence ${t.dueAt}`}
                      </p>
                    </div>
                    <Link
                      to={`/tutor/casos/${t.caseId}`}
                      className="inline-flex h-8 items-center gap-1 rounded-full border border-neutral-300 bg-white px-3 text-[11px] font-bold text-navy-500 hover:bg-neutral-100"
                    >
                      Abrir
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </section>
    </div>
  )
}

function Kpi({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof TriangleAlert
  label: string
  value: number
  tone: 'red' | 'amber' | 'info' | 'green'
}) {
  const styles = {
    red: 'bg-error-100 text-error-400',
    amber: 'bg-warning-100 text-warning-400',
    info: 'bg-info-100 text-info-400',
    green: 'bg-success-100 text-success-300',
  }[tone]
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-widest text-navy-300">
          {label}
        </p>
        <span
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full',
            styles,
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold text-navy-500">{value}</p>
    </div>
  )
}

function FilterPill({
  label,
  count,
  active,
  onClick,
  tone,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
  tone?: 'red' | 'amber'
}) {
  const accent =
    tone === 'red' ? 'text-error-400' : tone === 'amber' ? 'text-warning-400' : ''
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors',
        active
          ? 'border-navy-500 bg-navy-500 text-white'
          : 'border-neutral-300 bg-white text-navy-500 hover:bg-neutral-100',
      )}
    >
      <span className={cn(!active && accent)}>{label}</span>
      <span
        className={cn(
          'rounded-full px-1.5 text-[10px]',
          active ? 'bg-white/20' : 'bg-neutral-200',
        )}
      >
        {count}
      </span>
    </button>
  )
}
