import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CalendarClock,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  Image as ImageIcon,
  Mail,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  ShieldCheck,
  Square,
  StickyNote,
  Trash2,
  Users,
  Video,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Breadcrumbs } from '@/components/features/Breadcrumbs'
import {
  SCORING_CRITERIA,
  getChecklistByCert,
  getEvidenciasByCert,
  getExpedienteData,
  getInitialNotesByCert,
  mockIssuedCertifications,
  mockScoringByCase,
} from '@/services/mocks/data'
import type {
  CertExpedienteEvidence,
  ChecklistCategory,
  IssuedCertStatus,
} from '@/types'
import { useEscape } from '@/hooks/useEscape'
import { cn, downloadBlob } from '@/lib/utils'
import { useInternalNotesStore } from '@/store/internalNotes'
import { certEntityKey } from '@/components/features/InternalNotesPanel'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_META: Record<
  IssuedCertStatus,
  { label: string; cls: string; dot: string }
> = {
  vigente: {
    label: 'Vigente',
    cls: 'bg-success-100 text-success-300 ring-success-300/30',
    dot: 'bg-success-300',
  },
  renovacion: {
    label: 'En renovación',
    cls: 'bg-warning-100 text-warning-400 ring-warning-300/40',
    dot: 'bg-warning-400',
  },
  vencido: {
    label: 'Vencido',
    cls: 'bg-info-100 text-info-400 ring-info-300/40',
    dot: 'bg-info-400',
  },
  denegado: {
    label: 'Denegado',
    cls: 'bg-error-100 text-error-400 ring-error-300/40',
    dot: 'bg-error-400',
  },
}

const COVER_BY_CERT: Record<string, string> = {
  'CE-001': '/cards/card-filigrana.webp',
  'CE-002': '/cards/card-sabores.webp',
  'CE-003': '/cards/card-tejido.webp',
  'CE-004': '/cards/card-ecodestinos.webp',
}

type Tab = 'info' | 'blockchain'
type Drawer = null | 'checklist' | 'notes' | 'pretask' | 'incident' | 'more'

function parseScoreNum(label: string): number {
  const n = parseInt(label.split('/')[0] ?? '0', 10)
  return Number.isNaN(n) ? 0 : n
}

function parseDDMMYY(d: string): Date | null {
  const parts = d.split('/').map((p) => parseInt(p, 10))
  if (parts.length !== 3) return null
  const [day, month, yy] = parts
  if (!day || !month || !yy) return null
  return new Date(2000 + yy, month - 1, day)
}

function daysUntil(d: string): number | null {
  const parsed = parseDDMMYY(d)
  if (!parsed) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  parsed.setHours(0, 0, 0, 0)
  return Math.round((parsed.getTime() - today.getTime()) / 86_400_000)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TutorCertificationDetail() {
  const { id } = useParams()
  // navigate removido — el nav manual fue reemplazado por Breadcrumbs
  // en SM4 (#TUT-27). Si vuelve a hacer falta, importar useNavigate.
  const cert = mockIssuedCertifications.find((c) => c.id === id)
  const [tab, setTab] = useState<Tab>('info')
  const [drawer, setDrawer] = useState<Drawer>(null)

  if (!cert) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <p className="text-sm font-bold text-navy-500">
          Certificación no encontrada
        </p>
        <Link
          to="/tutor/certificaciones"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-navy-500 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Volver al listado
        </Link>
      </div>
    )
  }

  const extra = getExpedienteData(cert.id)
  const meta = STATUS_META[cert.status]
  const cover = COVER_BY_CERT[cert.id] ?? '/cards/card-filigrana.webp'
  const score = parseScoreNum(cert.scoreLabel)
  const daysToExpiry = daysUntil(cert.expiresAt)
  const checklistData = getChecklistByCert(cert.id)
  const checklistTotal = checklistData.reduce((a, c) => a + c.items.length, 0)
  const checklistDone = checklistData.reduce(
    (a, c) => a + c.items.filter((i) => i.checked).length,
    0,
  )
  const notesCount = getInitialNotesByCert(cert.id).length

  return (
    <div className={cn('relative', drawer && 'lg:pr-[640px]')}>
      <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 md:px-8 md:py-8">
        {/* Breadcrumb */}
        {/* Fix SM4 (#TUT-27, auditoría UX): antes el nav manual decía
            "Certificados › CE-001" — inconsistente con el caso activo
            que usa "Tutor › Casos › CE-101". Ahora usamos el componente
            Breadcrumbs estándar con jerarquía completa. */}
        <Breadcrumbs
          items={[
            { label: 'Tutor', to: '/tutor/dashboard' },
            { label: 'Certificaciones', to: '/tutor/certificaciones' },
            { label: cert.id },
          ]}
        />

        {/* Header simple */}
        <header className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-gold-700">
              <span className="rounded-full bg-gold-100 px-2 py-0.5">
                {cert.id}
              </span>
              Expediente de certificación
            </p>
            <h1 className="mt-3 text-2xl font-bold leading-tight text-navy-500 md:text-[32px]">
              {cert.productName}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setDrawer('more')}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 text-sm font-bold text-navy-500 transition-colors hover:bg-neutral-100"
            >
              <MoreHorizontal className="h-4 w-4" />
              Más acciones
            </button>
            <button
              type="button"
              onClick={() => {
                downloadActa(cert, extra)
                toast.success(`acta-${cert.id}.pdf descargada`)
              }}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-gold-500 px-5 text-sm font-bold text-navy-500 shadow-sm transition-colors hover:bg-gold-400"
            >
              <Download className="h-4 w-4" />
              Descargar Acta
            </button>
          </div>
        </header>

        {/* Layout principal: main + sidebar */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {/* MAIN */}
          <div className="space-y-6 lg:col-span-8">
            {/* Tabs underline */}
            <div className="flex items-center gap-1 border-b border-neutral-200">
              <TabButton
                active={tab === 'info'}
                onClick={() => setTab('info')}
                icon={FileText}
                label="Información"
              />
              <TabButton
                active={tab === 'blockchain'}
                onClick={() => setTab('blockchain')}
                icon={ShieldCheck}
                label="Blockchain"
              />
            </div>

            {tab === 'info' ? (
              <InfoTab
                cert={cert}
                cover={cover}
                extra={extra}
                onCreatePreTask={() => setDrawer('pretask')}
              />
            ) : (
              <BlockchainTab cert={cert} />
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="space-y-4 lg:col-span-4">
            <SidebarStatus
              status={cert.status}
              meta={meta}
              score={score}
              issuedAt={cert.issuedAt}
              expiresAt={cert.expiresAt}
              daysToExpiry={daysToExpiry}
            />
            <SidebarAutor cert={cert} extra={extra} />
            <SidebarActions
              checklistDone={checklistDone}
              checklistTotal={checklistTotal}
              notesCount={notesCount}
              onChecklist={() => setDrawer('checklist')}
              onNotes={() => setDrawer('notes')}
              onPreTask={() => setDrawer('pretask')}
              onIncident={() => setDrawer('incident')}
            />
          </aside>
        </div>
      </div>

      {/* Drawers */}
      <AnimatePresence>
        {drawer === 'checklist' && (
          <ChecklistDrawer
            categories={checklistData}
            onClose={() => setDrawer(null)}
          />
        )}
        {drawer === 'notes' && (
          <NotesDrawer certId={cert.id} onClose={() => setDrawer(null)} />
        )}
        {drawer === 'pretask' && (
          <PreTaskModal
            certId={cert.id}
            applicantName={cert.authorName}
            onClose={() => setDrawer(null)}
            onCreate={() => {
              setDrawer(null)
              toast.success('Pre-tarea de renovación creada')
            }}
          />
        )}
        {drawer === 'incident' && (
          <IncidentModal certId={cert.id} onClose={() => setDrawer(null)} />
        )}
        {drawer === 'more' && (
          <MoreActionsDrawer
            cert={cert}
            onClose={() => setDrawer(null)}
            onIncident={() => setDrawer('incident')}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: typeof FileText
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        '-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-colors',
        active
          ? 'border-gold-500 text-navy-500'
          : 'border-transparent text-navy-300 hover:text-navy-500',
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )
}

// ─── Sidebar: estado de la certificación ──────────────────────────────────────

function SidebarStatus({
  status,
  meta,
  score,
  issuedAt,
  expiresAt,
  daysToExpiry,
}: {
  status: IssuedCertStatus
  meta: { label: string; cls: string; dot: string }
  score: number
  issuedAt: string
  expiresAt: string
  daysToExpiry: number | null
}) {
  // Score ring
  const size = 88
  const stroke = 8
  const radius = (size - stroke) / 2
  const circ = 2 * Math.PI * radius
  const dash = (score / 100) * circ
  const ringColor =
    score >= 85
      ? '#22C55E'
      : score >= 70
        ? '#C7A800'
        : score > 0
          ? '#F59E0B'
          : '#E5E7EB'

  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-widest text-navy-300">
        Estado actual
      </p>
      <div className="mt-3 flex items-center justify-between gap-4">
        <div>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ring-1',
              meta.cls,
            )}
          >
            <span className={cn('h-2 w-2 rounded-full', meta.dot)} />
            {meta.label}
          </span>
          {daysToExpiry !== null && status === 'vigente' && (
            <p className="mt-2 text-xs text-navy-300">
              {daysToExpiry > 0
                ? `Vence en ${daysToExpiry} día${daysToExpiry === 1 ? '' : 's'}`
                : daysToExpiry === 0
                  ? 'Vence hoy'
                  : `Venció hace ${Math.abs(daysToExpiry)}d`}
            </p>
          )}
        </div>

        {/* Score ring */}
        <div
          className="relative shrink-0"
          style={{ width: size, height: size }}
        >
          <svg width={size} height={size}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth={stroke}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={ringColor}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={circ / 4}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={{ transition: 'stroke-dasharray 600ms ease-out' }}
            />
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold leading-none text-navy-500">
              {score}
            </span>
            <span className="text-[10px] font-bold text-navy-300">/ 100</span>
          </div>
        </div>
      </div>

      {/* Fechas */}
      <dl className="mt-5 space-y-2 border-t border-neutral-200 pt-4 text-sm">
        <DateRow icon={Calendar} label="Emisión" value={issuedAt} />
        <DateRow
          icon={CalendarClock}
          label="Vencimiento"
          value={expiresAt}
          tone={
            daysToExpiry !== null && daysToExpiry < 60
              ? 'warning'
              : daysToExpiry !== null && daysToExpiry < 0
                ? 'error'
                : 'muted'
          }
        />
      </dl>
    </section>
  )
}

function DateRow({
  icon: Icon,
  label,
  value,
  tone = 'muted',
}: {
  icon: typeof Calendar
  label: string
  value: string
  tone?: 'muted' | 'warning' | 'error'
}) {
  const valueCls =
    tone === 'error'
      ? 'text-error-400'
      : tone === 'warning'
        ? 'text-warning-400'
        : 'text-navy-500'
  return (
    <div className="flex items-center justify-between">
      <dt className="inline-flex items-center gap-2 text-xs text-navy-300">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </dt>
      <dd className={cn('text-sm font-bold', valueCls)}>{value}</dd>
    </div>
  )
}

// ─── Sidebar: autor ───────────────────────────────────────────────────────────

function SidebarAutor({
  cert,
  extra,
}: {
  cert: (typeof mockIssuedCertifications)[number]
  extra: ReturnType<typeof getExpedienteData>
}) {
  const initials = cert.authorName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-widest text-navy-300">
        Autor
      </p>
      <div className="mt-3 flex items-start gap-3">
        {cert.authorAvatarUrl ? (
          <img
            src={cert.authorAvatarUrl}
            alt=""
            className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-gold-500/20"
          />
        ) : (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy-500 text-sm font-bold text-white">
            {initials}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-navy-500">
            {cert.authorName}
          </p>
          <p className="mt-0.5 truncate text-xs text-navy-300">
            {extra.authorRole}
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-2 text-xs">
        {extra.community && (
          <ContactRow icon={Users} value={extra.community} />
        )}
        <ContactRow
          icon={MapPin}
          value={`${cert.country} · ${cert.region}`}
        />
        {extra.authorPhone && (
          <ContactRow
            icon={Phone}
            value={extra.authorPhone}
            href={`tel:${extra.authorPhone}`}
          />
        )}
        {extra.authorEmail && (
          <ContactRow
            icon={Mail}
            value={extra.authorEmail}
            href={`mailto:${extra.authorEmail}`}
          />
        )}
      </ul>
    </section>
  )
}

function ContactRow({
  icon: Icon,
  value,
  href,
}: {
  icon: typeof Phone
  value: string
  href?: string
}) {
  const content = (
    <>
      <Icon className="h-3.5 w-3.5 shrink-0 text-navy-300" />
      <span className="truncate">{value}</span>
    </>
  )
  if (href) {
    return (
      <li>
        <a
          href={href}
          className="flex items-center gap-2 text-navy-500 transition-colors hover:text-gold-700"
        >
          {content}
        </a>
      </li>
    )
  }
  return <li className="flex items-center gap-2 text-navy-500">{content}</li>
}

// ─── Sidebar: acciones del expediente ─────────────────────────────────────────

function SidebarActions({
  checklistDone,
  checklistTotal,
  notesCount,
  onChecklist,
  onNotes,
  onPreTask,
  onIncident,
}: {
  checklistDone: number
  checklistTotal: number
  notesCount: number
  onChecklist: () => void
  onNotes: () => void
  onPreTask: () => void
  onIncident: () => void
}) {
  const pct = checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : 0
  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-widest text-navy-300">
        Gestión del expediente
      </p>

      <div className="mt-3 space-y-2">
        {/* Checklist con progress */}
        <button
          type="button"
          onClick={onChecklist}
          className="group flex w-full items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 text-left transition-all hover:border-gold-300 hover:shadow-sm"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
            <ClipboardCheck className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-navy-500">Checklist</p>
            <div className="mt-1 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200">
                <div
                  className="h-full rounded-full bg-success-300 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-navy-500">
                {checklistDone}/{checklistTotal}
              </span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-navy-300 transition-transform group-hover:translate-x-0.5" />
        </button>

        {/* Notas del tutor */}
        <button
          type="button"
          onClick={onNotes}
          className="group flex w-full items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 text-left transition-all hover:border-gold-300 hover:shadow-sm"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-info-100 text-info-400">
            <StickyNote className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-navy-500">Notas del tutor</p>
            <p className="mt-0.5 text-xs text-navy-300">
              {notesCount} {notesCount === 1 ? 'nota guardada' : 'notas guardadas'}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-navy-300 transition-transform group-hover:translate-x-0.5" />
        </button>

        {/* Crear pre-tarea */}
        <button
          type="button"
          onClick={onPreTask}
          className="group flex w-full items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 text-left transition-all hover:border-gold-300 hover:shadow-sm"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning-100 text-warning-400">
            <RefreshCw className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-navy-500">Pre-tarea de renovación</p>
            <p className="mt-0.5 text-xs text-navy-300">
              Pedir evidencias para renovar
            </p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-navy-300 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      <button
        type="button"
        onClick={onIncident}
        className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-error-300 bg-white py-2 text-xs font-bold text-error-400 transition-colors hover:bg-error-100"
      >
        <AlertTriangle className="h-3.5 w-3.5" />
        Marcar incidencia
      </button>
    </section>
  )
}

// ─── Tab: Información ─────────────────────────────────────────────────────────

function InfoTab({
  cert,
  cover,
  extra,
  onCreatePreTask,
}: {
  cert: (typeof mockIssuedCertifications)[number]
  cover: string
  extra: ReturnType<typeof getExpedienteData>
  onCreatePreTask: () => void
}) {
  return (
    <div className="space-y-6">
      {/* Hero del producto */}
      <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr]">
          <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-100 sm:aspect-square sm:w-44 md:w-56">
            <img
              src={`${import.meta.env.BASE_URL}${cover.replace(/^\//, '')}`}
              alt={cert.productName}
              className="h-full w-full object-cover"
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>
          <div className="flex flex-col justify-center gap-2 p-5 md:p-6">
            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-gold-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-gold-700">
              {cert.category}
            </span>
            <h2 className="text-xl font-bold leading-tight text-navy-500 md:text-2xl">
              {cert.productName}
            </h2>
            <p className="text-sm text-navy-300">
              Certificado a nombre de{' '}
              <strong className="text-navy-500">{cert.authorName}</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Fix SB7 (#TUT-26, auditoría UX): el expediente del cert
          emitido mostraba solo un score global numérico, sin desglose
          por dimensiones. El TutorCaseDetail (caso activo) sí mostraba
          las 5 dimensiones culturales — inconsistente. Ahora el cert
          emitido muestra el mismo desglose en read-only, con timestamp
          implícito "al momento de emisión". */}
      <DimensionsBreakdown caseId={cert.id} />

      {/* Información del producto */}
      <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
        <SectionHeader
          icon={FileText}
          title="Información del producto o servicio"
        />

        <dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 md:grid-cols-3">
          <Field label="Nombre" value={cert.productName} />
          <Field label="Tipo" value={extra.productType ?? '—'} />
          <Field label="Sector" value={extra.productSector ?? '—'} />
          <Field label="Categoría" value={cert.category} />
          <Field label="Subcategoría" value={extra.productSubcategory ?? '—'} />
        </dl>

        <div className="mt-6 rounded-2xl bg-neutral-100 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-navy-300">
            Producción
          </p>
          <p className="mt-2 text-sm leading-relaxed text-navy-500/90">
            {extra.productionDescription}
          </p>
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          <Field
            label="Responsable de producción"
            value={extra.productionResponsible ?? '—'}
          />
          <Field
            label="Capacidad productiva"
            value={extra.productionCapacity ?? '—'}
          />
          <Field
            label="Modalidad de producción"
            value={extra.productionMode ?? '—'}
          />
          <Field
            label="Identificación de lotes"
            value={extra.batchIdentifier ?? '—'}
          />
        </dl>
      </section>

      {/* Evidencias */}
      <EvidenciasSection evidences={getEvidenciasByCert(cert.id)} />

      {/* Renovación timeline */}
      <RenovacionSection
        certId={cert.id}
        lastRenewalAt={extra.lastRenewalAt}
        nextRenewalAt={extra.nextRenewalAt}
        cycleMonths={extra.renewalCycleMonths}
        status={STATUS_META[cert.status].label}
        onCreatePreTask={onCreatePreTask}
      />
    </div>
  )
}

/**
 * Score por dimensiones culturales — versión read-only del bloque del
 * TutorCaseDetail. Muestra las 5 dimensiones (cultural / social /
 * ambiental / ética / gestión) con score promedio + peso de la
 * dimensión sobre el total, con barra de progreso.
 *
 * Si no hay scoringValues registrados para este caseId, mostramos un
 * empty state explicando que el caso fue emitido sin scoring detallado
 * (puede pasar con certs heredados de pre-modelo).
 */
function DimensionsBreakdown({ caseId }: { caseId: string }) {
  const values = mockScoringByCase[caseId] ?? []

  // Agrupar por dimensión: promedio ponderado dentro de la dimensión
  // (cada criterio tiene su peso, pero acá nos interesa la nota promedio
  // expresada en escala 0-100 para que sea legible).
  const dimensions = SCORING_CRITERIA.reduce(
    (acc, def) => {
      if (!acc[def.dimension]) {
        acc[def.dimension] = {
          dimension: def.dimension,
          totalWeight: 0,
          weightedScore: 0,
          criteriaCount: 0,
          completedCount: 0,
        }
      }
      const value = values.find((v) => v.criterionId === def.id)
      acc[def.dimension].totalWeight += def.weight
      acc[def.dimension].criteriaCount += 1
      if (value) {
        acc[def.dimension].weightedScore += value.score * def.weight
        acc[def.dimension].completedCount += 1
      }
      return acc
    },
    {} as Record<
      string,
      {
        dimension: string
        totalWeight: number
        weightedScore: number
        criteriaCount: number
        completedCount: number
      }
    >,
  )

  const dimensionLabels: Record<string, string> = {
    cultural: 'Cultural',
    social: 'Sociales y Comunitaria',
    ambiental: 'Ambiental',
    etica: 'Ética y Cosmovisión',
    gestion: 'Gestión y técnica',
  }

  const list = Object.values(dimensions).filter((d) => d.criteriaCount > 0)

  if (values.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-neutral-300 bg-white p-6 text-center md:p-8">
        <p className="text-sm font-bold text-navy-500">
          Sin scoring por dimensiones registrado
        </p>
        <p className="mt-1 text-xs text-navy-300">
          Este certificado fue emitido antes de la evaluación con las
          14 variables del antropólogo. El score global del expediente
          es la única medida disponible.
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
      <SectionHeader
        icon={FileCheck2}
        title="Score por dimensiones culturales"
        sub="Desglose por las 5 dimensiones del modelo del antropólogo, al momento de emisión."
      />
      <ul className="mt-5 space-y-4">
        {list.map((d) => {
          const score = d.totalWeight === 0 ? 0 : Math.round((d.weightedScore / d.totalWeight) * 10)
          return (
            <li key={d.dimension}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-bold text-navy-500">
                  {dimensionLabels[d.dimension] ?? d.dimension}
                </span>
                <span className="font-bold tabular-nums text-navy-500">
                  {score}/100
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-neutral-200">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    score >= 80
                      ? 'bg-success-300'
                      : score >= 60
                        ? 'bg-gold-500'
                        : score >= 40
                          ? 'bg-warning-400'
                          : 'bg-error-400',
                  )}
                  style={{ width: `${score}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-navy-300">
                {d.completedCount} de {d.criteriaCount} criterios
                evaluados · peso de la dimensión: {d.totalWeight}%
              </p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function SectionHeader({
  icon: Icon,
  title,
  sub,
  right,
}: {
  icon: typeof FileText
  title: string
  sub?: string
  right?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-navy-500">{title}</h2>
          {sub && <p className="mt-0.5 text-xs text-navy-300">{sub}</p>}
        </div>
      </div>
      {right}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-bold uppercase tracking-widest text-navy-300">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-semibold text-navy-500">{value}</dd>
    </div>
  )
}

// ─── Evidencias: mini-tabs con grid ──────────────────────────────────────────

type EvidenceKind = 'image' | 'video' | 'document'

function EvidenciasSection({
  evidences,
}: {
  evidences: CertExpedienteEvidence[]
}) {
  const images = evidences.filter((e) => e.kind === 'image')
  const videos = evidences.filter((e) => e.kind === 'video')
  const docs = evidences.filter((e) => e.kind === 'document')

  const [active, setActive] = useState<EvidenceKind>('image')
  const current =
    active === 'image' ? images : active === 'video' ? videos : docs

  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
      <SectionHeader
        icon={FileCheck2}
        title="Evidencias"
        sub={`${evidences.length} archivos cargados al expediente`}
      />

      <div className="mt-5 flex flex-wrap gap-2">
        <EvidenceTab
          active={active === 'image'}
          onClick={() => setActive('image')}
          icon={ImageIcon}
          label="Imágenes"
          count={images.length}
        />
        <EvidenceTab
          active={active === 'video'}
          onClick={() => setActive('video')}
          icon={Video}
          label="Videos"
          count={videos.length}
        />
        <EvidenceTab
          active={active === 'document'}
          onClick={() => setActive('document')}
          icon={FileText}
          label="Documentos"
          count={docs.length}
        />
      </div>

      <div className="mt-5">
        {current.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 p-10 text-center">
            <p className="text-sm text-navy-300">
              Sin archivos de este tipo.
            </p>
          </div>
        ) : active === 'image' ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {current.map((e) => (
              <li
                key={e.id}
                className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-sm transition-all hover:shadow-md"
              >
                <div className="aspect-square w-full overflow-hidden">
                  {e.thumbUrl ? (
                    <img
                      src={`${import.meta.env.BASE_URL}${e.thumbUrl.replace(/^\//, '')}`}
                      alt={e.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      onError={(ev) => {
                        ;(ev.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-navy-300" />
                    </div>
                  )}
                </div>
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-navy-500/90 via-navy-500/30 to-transparent p-2.5">
                  <p className="line-clamp-1 text-[11px] font-bold text-white">
                    {e.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => { downloadBlob(`${e.name}.txt`, `Archivo: ${e.name}\nTipo: ${e.kind}\nTamaño: ${e.sizeKb ?? '—'} KB\n\n(Placeholder mock — en prod descarga el binario real)`); toast.success(`${e.name} descargado`) }}
                    aria-label="Descargar"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-navy-500 transition-colors hover:bg-white"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {current.map((e) => {
              const Icon = active === 'video' ? Video : FileText
              return (
                <li
                  key={e.id}
                  className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 transition-colors hover:bg-neutral-100"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-navy-500">
                      {e.name}
                    </p>
                    {e.sizeKb !== undefined && (
                      <p className="text-[11px] text-navy-300">
                        {(e.sizeKb / 1024).toFixed(1)} MB
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => { downloadBlob(`${e.name}.txt`, `Archivo: ${e.name}\nTipo: ${e.kind}\nTamaño: ${e.sizeKb ?? '—'} KB\n\n(Placeholder mock — en prod descarga el binario real)`); toast.success(`${e.name} descargado`) }}
                    aria-label="Descargar"
                    className="inline-flex h-8 items-center gap-1 rounded-full border border-neutral-300 bg-white px-3 text-xs font-bold text-navy-500 transition-colors hover:bg-neutral-100"
                  >
                    <Download className="h-3 w-3" />
                    PDF
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}

function EvidenceTab({
  active,
  onClick,
  icon: Icon,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  icon: typeof ImageIcon
  label: string
  count: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors',
        active
          ? 'border-navy-500 bg-navy-500 text-white'
          : 'border-neutral-300 bg-white text-navy-500 hover:bg-neutral-100',
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
      <span
        className={cn(
          'inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px]',
          active ? 'bg-gold-500 text-navy-500' : 'bg-neutral-200 text-navy-500',
        )}
      >
        {count}
      </span>
    </button>
  )
}

// ─── Renovación timeline ─────────────────────────────────────────────────────

function buildRenewalReminderIcs(certId: string, nextRenewalAt?: string): string {
  // dd/MM/yy → yyyy-MM-dd
  let dateStr: string
  if (nextRenewalAt && /^\d{2}\/\d{2}\/\d{2}$/.test(nextRenewalAt)) {
    const [d, m, yy] = nextRenewalAt.split('/')
    dateStr = `20${yy}${m}${d}`
  } else {
    const future = new Date()
    future.setDate(future.getDate() + 30)
    dateStr = future.toISOString().slice(0, 10).replace(/-/g, '')
  }
  const dtStamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ancestral Seed//Renovacion//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:renovacion-${certId}@ancestralseed.io`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART;VALUE=DATE:${dateStr}`,
    `DTEND;VALUE=DATE:${dateStr}`,
    `SUMMARY:Renovación certificado ${certId} — Ancestral Seed`,
    `DESCRIPTION:Recordatorio de renovación del expediente ${certId}. Coordiná con el solicitante para preparar las evidencias.`,
    'BEGIN:VALARM',
    'TRIGGER:-P7D',
    'ACTION:DISPLAY',
    `DESCRIPTION:Renovación ${certId} en 7 días`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

function RenovacionSection({
  certId,
  lastRenewalAt,
  nextRenewalAt,
  cycleMonths,
  status,
  onCreatePreTask,
}: {
  certId: string
  lastRenewalAt?: string
  nextRenewalAt?: string
  cycleMonths?: number
  status: string
  onCreatePreTask: () => void
}) {
  const daysToNext = nextRenewalAt ? daysUntil(nextRenewalAt) : null
  const tone =
    daysToNext === null
      ? 'muted'
      : daysToNext < 0
        ? 'error'
        : daysToNext < 60
          ? 'warning'
          : 'success'

  return (
    <section
      className={cn(
        'rounded-3xl border-2 p-5 shadow-sm md:p-6',
        tone === 'error'
          ? 'border-error-300/60 bg-error-100/30'
          : tone === 'warning'
            ? 'border-warning-300/60 bg-warning-100/30'
            : 'border-neutral-200 bg-white',
      )}
    >
      <SectionHeader
        icon={RefreshCw}
        title="Renovación"
        sub={
          daysToNext === null
            ? 'Sin próxima renovación programada'
            : daysToNext > 0
              ? `Faltan ${daysToNext} días para la próxima renovación`
              : daysToNext === 0
                ? 'La renovación vence hoy'
                : `La renovación venció hace ${Math.abs(daysToNext)}d`
        }
      />

      {/* Timeline */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <TimelineStep
          status="done"
          label="Última renovación"
          value={lastRenewalAt ?? '—'}
          sub="Completada"
        />
        <TimelineStep
          status="current"
          label="Estado actual"
          value={status}
          sub={
            cycleMonths
              ? `Ciclo de ${cycleMonths} meses`
              : 'Ciclo estándar'
          }
        />
        <TimelineStep
          status={tone === 'error' ? 'error' : tone === 'warning' ? 'warning' : 'upcoming'}
          label="Próxima renovación"
          value={nextRenewalAt ?? '—'}
          sub={
            daysToNext === null
              ? ''
              : daysToNext > 0
                ? `En ${daysToNext}d`
                : daysToNext === 0
                  ? 'Hoy'
                  : `Vencida hace ${Math.abs(daysToNext)}d`
          }
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            // Descargar ICS para agregar a Google/Outlook/Apple Calendar
            const ics = buildRenewalReminderIcs(certId, nextRenewalAt)
            downloadBlob(
              `recordatorio-renovacion-${certId}.ics`,
              ics,
              'text/calendar;charset=utf-8',
            )
            toast.success('Recordatorio descargado · agregalo a tu calendario')
          }}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 text-xs font-bold text-navy-500 transition-colors hover:bg-neutral-100"
        >
          <CalendarClock className="h-3.5 w-3.5" />
          Programar recordatorio
        </button>
        <button
          type="button"
          onClick={onCreatePreTask}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-navy-500 px-5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-navy-400"
        >
          <Plus className="h-3.5 w-3.5" />
          Crear pre-tarea de renovación
        </button>
      </div>
    </section>
  )
}

function TimelineStep({
  status,
  label,
  value,
  sub,
}: {
  status: 'done' | 'current' | 'upcoming' | 'warning' | 'error'
  label: string
  value: string
  sub?: string
}) {
  const dotCls =
    status === 'done'
      ? 'bg-success-300 text-white'
      : status === 'current'
        ? 'bg-gold-500 text-navy-500 ring-4 ring-gold-200'
        : status === 'warning'
          ? 'bg-warning-400 text-white'
          : status === 'error'
            ? 'bg-error-400 text-white'
            : 'bg-white border-2 border-neutral-300 text-navy-300'
  const Icon =
    status === 'done' ? Check : status === 'error' ? AlertTriangle : Calendar
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
            dotCls,
          )}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
        </span>
        <p className="text-[10px] font-bold uppercase tracking-widest text-navy-300">
          {label}
        </p>
      </div>
      <p className="mt-3 text-base font-bold text-navy-500">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-navy-300">{sub}</p>}
    </div>
  )
}

// ─── Tab Blockchain ───────────────────────────────────────────────────────────

function BlockchainTab({
  cert,
}: {
  cert: (typeof mockIssuedCertifications)[number]
}) {
  const hash = `0x${cert.id.toLowerCase().repeat(8).slice(0, 60)}`
  const block = 52_000_000 + (parseInt(cert.id.slice(3)) || 0)
  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-3xl border-2 border-gold-300/40 bg-gradient-to-br from-gold-100/50 via-white to-white shadow-sm">
        <div className="p-6 md:p-8">
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500 text-navy-500">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gold-700">
                Registro inmutable
              </p>
              <h2 className="mt-1 text-lg font-bold text-navy-500">
                Sellado en blockchain
              </h2>
              <p className="mt-1 text-sm text-navy-300">
                Polygon Mainnet · Bloque #{block.toLocaleString('es-AR')} · Sellado el {cert.issuedAt}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-navy-300">
              Hash de transacción
            </p>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2.5">
              <code className="flex-1 truncate text-xs font-medium text-navy-500">
                {hash}
              </code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(hash)
                  toast.success('Hash copiado al portapapeles')
                }}
                className="inline-flex h-9 items-center gap-1 rounded-full bg-gold-500 px-3 text-xs font-bold text-navy-500 transition-colors hover:bg-gold-400"
              >
                <Copy className="h-3 w-3" />
                Copiar
              </button>
            </div>
          </div>

          <a
            href={`https://polygonscan.com/search?q=${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-navy-500 px-5 text-xs font-bold text-white transition-colors hover:bg-navy-400"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Abrir en explorador
          </a>
        </div>
      </section>

      <section className="rounded-3xl bg-info-100 p-5 ring-1 ring-info-200 md:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-info-400 text-white">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <p className="text-sm leading-relaxed text-navy-500">
            La transacción es <strong>inmutable</strong>. Cualquier
            modificación del expediente requiere una nueva firma (renovación o
            re-emisión) que queda registrada con su propio hash, manteniendo el
            historial completo y auditable.
          </p>
        </div>
      </section>
    </div>
  )
}

// ─── Drawer: Notas internas (rediseño con timeline) ───────────────────────────

function NotesDrawer({
  certId,
  onClose,
}: {
  certId: string
  onClose: () => void
}) {
  // Fix V2-TUT-09 (auditoría v2): antes el state de las notas era
  // `useState<CertExpedienteNote[]>` local — refresh las perdía. La
  // promesa del fix SA5 (persistencia de notas) cubría solo el caso
  // ACTIVO; el cert emitido quedaba afuera. Inconsistencia conceptual:
  // las notas son más valiosas justo cuando hay que renovar/auditar
  // el cert emitido años después.
  //
  // Ahora usamos `useInternalNotesStore` (persist a localStorage),
  // mismo store que el caso activo, con entityKey distinto (cert-XXX).
  // La primera vez que se abre el drawer hidratamos con los seeds
  // de getInitialNotesByCert si todavía no hay notas para ese cert.
  const notes = useInternalNotesStore((s) =>
    s.notesFor(certEntityKey(certId)),
  )
  const addNoteToStore = useInternalNotesStore((s) => s.addNote)
  const updateNoteInStore = useInternalNotesStore((s) => s.updateNote)
  const removeNoteFromStore = useInternalNotesStore((s) => s.removeNote)

  useEffect(() => {
    // Seed hidratación una sola vez. Sin esto el cert emitido del demo
    // aparece sin las notas iniciales del antropólogo y el reviewer no
    // ve el flujo trabajado.
    if (notes.length === 0) {
      for (const seed of getInitialNotesByCert(certId)) {
        addNoteToStore({
          entityKey: certEntityKey(certId),
          body: seed.body,
          authorName: seed.authorName,
          authorInitials: seed.authorInitials,
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certId])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftBody, setDraftBody] = useState('')
  const [composing, setComposing] = useState(false)
  useEscape(true, onClose)

  const removeNote = (id: string) => {
    removeNoteFromStore(id)
    toast.success('Nota eliminada')
  }

  const startEdit = (n: { id: string; body: string }) => {
    setEditingId(n.id)
    setDraftBody(n.body)
    setComposing(false)
  }

  const saveEdit = () => {
    if (!editingId) return
    updateNoteInStore(editingId, draftBody)
    setEditingId(null)
    setDraftBody('')
    toast.success('Nota actualizada')
  }

  const addNote = () => {
    if (!draftBody.trim()) return
    addNoteToStore({
      entityKey: certEntityKey(certId),
      body: draftBody,
      authorName: 'Juan Pérez',
      authorInitials: 'JP',
    })
    setDraftBody('')
    setComposing(false)
    toast.success('Nota agregada')
  }

  return (
    <DrawerShell
      title="Notas internas"
      subtitle={`${notes.length} ${notes.length === 1 ? 'nota guardada' : 'notas guardadas'} · Solo visible para el equipo`}
      icon={StickyNote}
      onClose={onClose}
      footer={
        composing ? (
          <div className="space-y-2">
            <textarea
              value={draftBody}
              onChange={(e) => setDraftBody(e.target.value)}
              rows={3}
              placeholder="Escribí la nota interna…"
              className="w-full resize-none rounded-2xl border border-gold-500 bg-white px-4 py-3 text-sm text-navy-500 focus:outline-none"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setComposing(false)
                  setDraftBody('')
                }}
                className="inline-flex h-10 items-center justify-center rounded-full px-4 text-xs font-bold text-navy-500 hover:bg-neutral-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={addNote}
                disabled={!draftBody.trim()}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-navy-500 px-5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-navy-400 disabled:opacity-40"
              >
                <Check className="h-3.5 w-3.5" />
                Guardar nota
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setComposing(true)
              setDraftBody('')
              setEditingId(null)
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy-500 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-navy-400"
          >
            <Plus className="h-4 w-4" />
            Añadir nueva nota
          </button>
        )
      }
    >
      {notes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 p-10 text-center">
          <StickyNote className="mx-auto h-8 w-8 text-navy-300" />
          <p className="mt-3 text-sm font-bold text-navy-500">
            No hay notas todavía
          </p>
          <p className="mt-1 text-xs text-navy-300">
            Las notas son privadas del equipo tutor.
          </p>
        </div>
      ) : (
        <ol className="relative space-y-4 border-l-2 border-neutral-200 pl-5">
          {notes.map((n, i) => (
            <li key={n.id} className="relative">
              <span className="absolute -left-[27px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold text-navy-500 ring-4 ring-white">
                {i + 1}
              </span>
              <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-[10px] font-bold text-navy-500">
                      {n.authorInitials}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-navy-500">
                        {n.authorName}
                      </p>
                      <p className="text-[10px] text-navy-300">
                        {new Date(n.at).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: 'short',
                        })}{' '}
                        ·{' '}
                        {new Date(n.at).toLocaleTimeString('es-AR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {editingId === n.id ? (
                  <>
                    <textarea
                      value={draftBody}
                      onChange={(e) => setDraftBody(e.target.value)}
                      rows={4}
                      className="mt-3 w-full resize-none rounded-xl border border-gold-500 bg-white px-3 py-2 text-sm text-navy-500 focus:outline-none"
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null)
                          setDraftBody('')
                        }}
                        className="text-xs font-bold text-navy-300 hover:text-navy-500"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={saveEdit}
                        className="inline-flex h-7 items-center rounded-full bg-navy-500 px-3 text-xs font-bold text-white"
                      >
                        Guardar
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-navy-500/90">
                    {n.body}
                  </p>
                )}

                {editingId !== n.id && (
                  <div className="mt-3 flex items-center gap-3 border-t border-neutral-100 pt-3">
                    <button
                      type="button"
                      onClick={() => startEdit(n)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-gold-700 hover:underline"
                    >
                      <Pencil className="h-3 w-3" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => removeNote(n.id)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-error-400 hover:underline"
                    >
                      <Trash2 className="h-3 w-3" />
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </DrawerShell>
  )
}

// ─── Drawer: Checklist (rediseño con progress sticky) ─────────────────────────

function ChecklistDrawer({
  categories: initial,
  onClose,
}: {
  categories: ChecklistCategory[]
  onClose: () => void
}) {
  const [categories, setCategories] = useState<ChecklistCategory[]>(initial)
  const [editingCat, setEditingCat] = useState<string | null>(null)
  const [draftComment, setDraftComment] = useState('')
  useEscape(true, onClose)

  const totalCats = categories.length
  const evalCats = categories.filter((c) => c.items.every((i) => i.checked)).length
  const totalItems = categories.reduce((a, c) => a + c.items.length, 0)
  const doneItems = categories.reduce(
    (a, c) => a + c.items.filter((i) => i.checked).length,
    0,
  )
  const totalPct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0

  const toggleItem = (catId: string, itemId: string) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === catId
          ? {
              ...c,
              items: c.items.map((i) =>
                i.id === itemId ? { ...i, checked: !i.checked } : i,
              ),
            }
          : c,
      ),
    )
  }

  const saveComment = (catId: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, comment: draftComment } : c)),
    )
    setEditingCat(null)
    setDraftComment('')
    toast.success('Comentario guardado')
  }

  const removeComment = (catId: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, comment: undefined } : c)),
    )
    toast.success('Comentario eliminado')
  }

  return (
    <DrawerShell
      title="Checklist de evaluación"
      subtitle={`${evalCats}/${totalCats} criterios completos`}
      icon={ClipboardCheck}
      onClose={onClose}
    >
      {/* Progress hero */}
      <div className="mb-5 rounded-2xl border border-gold-300/40 bg-gradient-to-br from-gold-100/40 to-white p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gold-700">
              Avance total
            </p>
            <p className="mt-1 text-3xl font-bold text-navy-500">
              {totalPct}
              <span className="text-base font-medium text-navy-300">%</span>
            </p>
          </div>
          <p className="text-xs text-navy-300">
            {doneItems} de {totalItems} ítems
          </p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              totalPct === 100
                ? 'bg-success-300'
                : totalPct >= 60
                  ? 'bg-gold-500'
                  : 'bg-warning-400',
            )}
            style={{ width: `${totalPct}%` }}
          />
        </div>
      </div>

      <ul className="space-y-3">
        {categories.map((cat) => (
          <ChecklistCategoryCard
            key={cat.id}
            category={cat}
            onToggleItem={(itemId) => toggleItem(cat.id, itemId)}
            editing={editingCat === cat.id}
            draftComment={draftComment}
            setDraftComment={setDraftComment}
            startEdit={() => {
              setEditingCat(cat.id)
              setDraftComment(cat.comment ?? '')
            }}
            cancelEdit={() => {
              setEditingCat(null)
              setDraftComment('')
            }}
            saveEdit={() => saveComment(cat.id)}
            removeComment={() => removeComment(cat.id)}
          />
        ))}
      </ul>
    </DrawerShell>
  )
}

function ChecklistCategoryCard({
  category,
  onToggleItem,
  editing,
  draftComment,
  setDraftComment,
  startEdit,
  cancelEdit,
  saveEdit,
  removeComment,
}: {
  category: ChecklistCategory
  onToggleItem: (id: string) => void
  editing: boolean
  draftComment: string
  setDraftComment: (v: string) => void
  startEdit: () => void
  cancelEdit: () => void
  saveEdit: () => void
  removeComment: () => void
}) {
  const [open, setOpen] = useState(category.id === 'tecnico')
  const checkedCount = category.items.filter((i) => i.checked).length
  const total = category.items.length
  const pct = total > 0 ? Math.round((checkedCount / total) * 100) : 0
  const complete = pct === 100
  return (
    <li
      className={cn(
        'overflow-hidden rounded-2xl border bg-white shadow-sm transition-colors',
        complete ? 'border-success-300/40' : 'border-neutral-200',
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left"
      >
        <span
          className={cn(
            'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
            complete
              ? 'bg-success-300 text-white'
              : pct > 0
                ? 'bg-gold-100 text-gold-700'
                : 'border-2 border-neutral-300 bg-white text-navy-300',
          )}
        >
          {complete ? (
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          ) : (
            <span className="text-[10px] font-bold">
              {checkedCount}/{total}
            </span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-navy-500">{category.name}</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  complete ? 'bg-success-300' : 'bg-navy-500',
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-navy-500">{pct}%</span>
          </div>
        </div>
        <ChevronDown
          className={cn(
            'mt-1 h-4 w-4 shrink-0 text-navy-300 transition-transform',
            !open && '-rotate-90',
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="border-t border-neutral-200 px-4 py-3">
              <ul className="space-y-2">
                {category.items.map((i) => (
                  <li key={i.id}>
                    <button
                      type="button"
                      onClick={() => onToggleItem(i.id)}
                      className="flex w-full items-center gap-3 text-left"
                    >
                      {i.checked ? (
                        <CheckSquare
                          className="h-4 w-4 text-success-300"
                          strokeWidth={2.5}
                        />
                      ) : (
                        <Square className="h-4 w-4 text-navy-300" />
                      )}
                      <span
                        className={cn(
                          'text-sm',
                          i.checked
                            ? 'text-navy-500/60 line-through'
                            : 'text-navy-500',
                        )}
                      >
                        {i.label}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>

              {category.comment !== undefined || editing ? (
                <div className="mt-4 rounded-xl bg-neutral-100 p-3">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-navy-500" />
                    {editing ? (
                      <textarea
                        value={draftComment}
                        onChange={(e) => setDraftComment(e.target.value)}
                        rows={3}
                        className="flex-1 resize-none rounded-lg border border-gold-500 bg-white px-2 py-1.5 text-sm text-navy-500 focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <p className="flex-1 text-sm text-navy-500/90">
                        {category.comment}
                      </p>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    {editing ? (
                      <>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="text-xs font-bold text-navy-300 hover:text-navy-500"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={saveEdit}
                          className="inline-flex h-7 items-center rounded-full bg-navy-500 px-3 text-xs font-bold text-white"
                        >
                          Guardar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={startEdit}
                          className="inline-flex items-center gap-1 text-xs font-bold text-gold-700 hover:underline"
                        >
                          <Pencil className="h-3 w-3" />
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={removeComment}
                          className="inline-flex items-center gap-1 text-xs font-bold text-error-400 hover:underline"
                        >
                          <Trash2 className="h-3 w-3" />
                          Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={startEdit}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-gold-700 hover:underline"
                >
                  <Plus className="h-3 w-3" />
                  Agregar comentario
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

// ─── Modal: Crear pre-tarea ──────────────────────────────────────────────────

function PreTaskModal({
  certId,
  applicantName,
  onClose,
  onCreate,
}: {
  certId: string
  applicantName: string
  onClose: () => void
  onCreate: () => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [types, setTypes] = useState<Array<'image' | 'video' | 'document'>>([])
  const [dueAt, setDueAt] = useState('')
  const [internalNote, setInternalNote] = useState('')
  useEscape(true, onClose)

  const toggleType = (t: 'image' | 'video' | 'document') => {
    setTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    )
  }

  const canCreate = title.trim() && description.trim() && dueAt

  return (
    <DrawerShell
      title="Crear pre-tarea de renovación"
      subtitle={`${certId} · ${applicantName}`}
      icon={RefreshCw}
      onClose={onClose}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-full border border-neutral-300 bg-white px-5 text-sm font-bold text-navy-500 hover:bg-neutral-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onCreate}
            disabled={!canCreate}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-navy-500 px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-navy-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Calendar className="h-4 w-4" />
            Crear pre-tarea
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        <Labeled label="Título de la pre-tarea" required>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Subir avales actualizados"
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-navy-500 placeholder:text-navy-300 focus:border-gold-500 focus:outline-none"
          />
        </Labeled>

        <Labeled label="Descripción" required>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Detalle de lo que el solicitante debe entregar para la renovación."
            className="w-full resize-none rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-navy-500 placeholder:text-navy-300 focus:border-gold-500 focus:outline-none"
          />
        </Labeled>

        <Labeled label="Tipo de evidencia solicitada">
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: 'image', label: 'Imágen', icon: ImageIcon },
                { id: 'video', label: 'Video', icon: Video },
                { id: 'document', label: 'Documento', icon: FileText },
              ] as const
            ).map((t) => {
              const active = types.includes(t.id)
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleType(t.id)}
                  className={cn(
                    'inline-flex flex-col items-center gap-1.5 rounded-2xl border-2 px-3 py-3 text-xs font-bold transition-all',
                    active
                      ? 'border-gold-500 bg-gold-100/40 text-navy-500'
                      : 'border-neutral-200 bg-white text-navy-500 hover:border-neutral-300',
                  )}
                >
                  <t.icon className="h-5 w-5" />
                  {t.label}
                </button>
              )
            })}
          </div>
        </Labeled>

        <Labeled label="Fecha límite" required>
          <input
            type="date"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none sm:w-60"
          />
        </Labeled>

        <Labeled label="Nota interna" hint="solo visible para tutores · opcional">
          <textarea
            value={internalNote}
            onChange={(e) => setInternalNote(e.target.value)}
            rows={3}
            placeholder="Notas internas para coordinar con el equipo."
            className="w-full resize-none rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-navy-500 placeholder:text-navy-300 focus:border-gold-500 focus:outline-none"
          />
        </Labeled>
      </div>
    </DrawerShell>
  )
}

function Labeled({
  label,
  hint,
  required,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-navy-500">
        {label}
        {required && <span className="ml-0.5 text-error-400">*</span>}
        {hint && (
          <span className="ml-2 text-[11px] font-normal italic text-navy-300">
            ({hint})
          </span>
        )}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  )
}

// ─── Modal: Marcar incidencia ────────────────────────────────────────────────

function IncidentModal({
  certId,
  onClose,
}: {
  certId: string
  onClose: () => void
}) {
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  useEscape(true, onClose)

  return (
    <DrawerShell
      title="Marcar incidencia"
      subtitle={certId}
      icon={AlertTriangle}
      onClose={onClose}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-full border border-neutral-300 bg-white px-5 text-sm font-bold text-navy-500 hover:bg-neutral-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              toast.success('Incidencia registrada')
              onClose()
            }}
            disabled={!reason || !description.trim()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-error-400 px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-error-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <AlertTriangle className="h-4 w-4" />
            Reportar
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <Labeled label="Motivo" required>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
          >
            <option value="">Seleccioná un motivo…</option>
            <option value="dato">Dato erróneo</option>
            <option value="autoria">Autoría incorrecta</option>
            <option value="fraude">Sospecha de fraude</option>
            <option value="otro">Otro</option>
          </select>
        </Labeled>
        <Labeled label="Descripción" required>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Describí qué encontraste con detalle."
            className="w-full resize-none rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
          />
        </Labeled>
      </div>
    </DrawerShell>
  )
}

// ─── Drawer: Más acciones (menú) ──────────────────────────────────────────────

// ─── Acciones reales de "Más acciones" ────────────────────────────────────────

/** Mapea el ID del cert emitido al slug del cert público para la ficha. */
const CERT_PUBLIC_SLUG: Record<string, string> = {
  'CE-001': 'tecnica-ancestral-filigrana',
  'CE-002': 'libro-sabores-cosmicos',
  'CE-003': 'tejido-textil-tradicional',
  'CE-004': 'ecodestinos-turismo-ancestral',
}

function publicSlugFor(certId: string): string {
  return CERT_PUBLIC_SLUG[certId] ?? 'tecnica-ancestral-filigrana'
}

function publicCertUrl(certId: string): string {
  if (typeof window === 'undefined') return '#'
  const base = `${window.location.origin}${import.meta.env.BASE_URL || '/'}`.replace(/\/$/, '')
  return `${base}/certificado/${publicSlugFor(certId)}`
}

function blockchainHashFor(certId: string): string {
  return `0x${certId.toLowerCase().repeat(8).slice(0, 60)}`
}

/** Genera el contenido del acta en texto plano para descargar. */
// buildActaContent eliminado — reemplazado por buildActaPdf de
// @/lib/pdf que genera PDF real con jsPDF (SB9 / #TUT-28).

async function downloadActa(
  cert: (typeof mockIssuedCertifications)[number],
  extra: ReturnType<typeof getExpedienteData>,
) {
  // Fix SB9 (#TUT-28, auditoría UX): acta era .txt plano con
  // separadores ASCII — flojo para llevar a Trámites. Ahora PDF real
  // con jsPDF + sello + hash blockchain.
  const { buildActaPdf, downloadPdfBlob } = await import('@/lib/pdf')
  const blob = buildActaPdf({
    certId: cert.id,
    productName: cert.productName,
    authorName: cert.authorName,
    authorRole: extra.authorRole,
    community: extra.community,
    productType: extra.productType,
    productSector: extra.productSector,
    scoreLabel: cert.scoreLabel,
    status: cert.status,
    category: cert.category,
    country: cert.country,
    region: cert.region,
    issuedAt: cert.issuedAt,
    expiresAt: cert.expiresAt,
    // El cert blockchain hash vive en la ficha pública por slug. Para
    // el acta usamos un derived hash estable (mismo patrón que /verificar).
    hash: `0xAS-CERT-${cert.id.replace(/[^A-Z0-9]/gi, '').toUpperCase()}`,
  })
  downloadPdfBlob(`acta-${cert.id}.pdf`, blob)
}

function buildMailtoForAuthor(
  cert: (typeof mockIssuedCertifications)[number],
  extra: ReturnType<typeof getExpedienteData>,
): string {
  const to = extra.authorEmail ?? 'contacto@ancestralseed.io'
  const subject = `Ancestral Seed — Tu certificado ${cert.id} (${cert.productName})`
  const body = [
    `Hola ${cert.authorName.split(' ')[0]},`,
    '',
    `Te escribo desde el equipo de tutoría de Ancestral Seed por tu certificado:`,
    '',
    `· Expediente: ${cert.id}`,
    `· Producto: ${cert.productName}`,
    `· Estado: ${cert.status}`,
    `· Vencimiento: ${cert.expiresAt}`,
    '',
    `Ficha pública verificable: ${publicCertUrl(cert.id)}`,
    '',
    `Quedo atento para cualquier consulta.`,
    '',
    `Saludos,`,
    `Equipo Ancestral Seed`,
  ].join('\n')
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

function MoreActionsDrawer({
  cert,
  onClose,
  onIncident,
}: {
  cert: (typeof mockIssuedCertifications)[number]
  onClose: () => void
  onIncident: () => void
}) {
  useEscape(true, onClose)
  const extra = getExpedienteData(cert.id)
  const hash = blockchainHashFor(cert.id)
  const publicUrl = publicCertUrl(cert.id)

  const actions = [
    {
      icon: Eye,
      label: 'Ver ficha pública',
      sub: 'Cómo lo ve el público',
      onClick: () => {
        window.open(publicUrl, '_blank', 'noopener,noreferrer')
        toast.success('Ficha pública abierta en nueva pestaña')
        onClose()
      },
    },
    {
      icon: Download,
      label: 'Descargar acta',
      sub: 'Documento oficial · TXT',
      onClick: () => {
        downloadActa(cert, extra)
        toast.success(`acta-${cert.id}.pdf descargada`)
        onClose()
      },
    },
    {
      icon: ShieldCheck,
      label: 'Ver en explorador blockchain',
      sub: 'Polygon · transacción inmutable',
      onClick: () => {
        window.open(
          `https://polygonscan.com/search?q=${hash}`,
          '_blank',
          'noopener,noreferrer',
        )
        toast.success('Abriendo Polygonscan…')
        onClose()
      },
    },
    {
      icon: MessageSquare,
      label: 'Notificar al autor',
      sub: `Email a ${cert.authorName}`,
      onClick: () => {
        const mailto = buildMailtoForAuthor(cert, extra)
        window.location.href = mailto
        toast.success('Abriendo tu cliente de email…')
        onClose()
      },
    },
    {
      icon: ArrowRight,
      label: 'Compartir link de validación',
      sub: publicUrl.replace(/^https?:\/\//, ''),
      onClick: async () => {
        try {
          await navigator.clipboard.writeText(publicUrl)
          toast.success('Link copiado al portapapeles')
        } catch {
          toast.error('No se pudo copiar el link')
        }
        onClose()
      },
    },
  ]
  return (
    <DrawerShell
      title="Más acciones"
      subtitle={`${cert.id} · ${cert.productName}`}
      icon={MoreHorizontal}
      onClose={onClose}
    >
      <ul className="space-y-2">
        {actions.map((a) => (
          <li key={a.label}>
            <button
              type="button"
              onClick={a.onClick}
              className="group flex w-full items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 text-left transition-all hover:border-gold-300 hover:shadow-sm"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                <a.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-navy-500">{a.label}</p>
                <p className="mt-0.5 truncate text-xs text-navy-300">{a.sub}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-navy-300 transition-transform group-hover:translate-x-0.5" />
            </button>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={() => {
              onClose()
              onIncident()
            }}
            className="group flex w-full items-center gap-3 rounded-2xl border border-error-300 bg-white p-4 text-left transition-all hover:bg-error-100"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-error-100 text-error-400">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-error-400">
                Marcar incidencia
              </p>
              <p className="mt-0.5 text-xs text-navy-300">
                Reportar dato erróneo o fraude
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-navy-300 transition-transform group-hover:translate-x-0.5" />
          </button>
        </li>
      </ul>
    </DrawerShell>
  )
}

// ─── Drawer shell ─────────────────────────────────────────────────────────────

function DrawerShell({
  title,
  subtitle,
  icon: Icon,
  onClose,
  children,
  footer,
}: {
  title: string
  subtitle?: string
  icon?: typeof StickyNote
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
        className="fixed inset-0 z-30 bg-navy-500/30 backdrop-blur-[2px] lg:hidden"
      />
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 280 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="fixed inset-y-0 right-0 z-40 flex w-full max-w-[640px] flex-col bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-neutral-200 px-6 py-5">
          <div className="flex items-start gap-3">
            {Icon && (
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                <Icon className="h-5 w-5" />
              </span>
            )}
            <div>
              <h2 id="drawer-title" className="text-base font-bold text-navy-500">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-0.5 text-xs text-navy-300">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-navy-500 hover:bg-neutral-100"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="border-t border-neutral-200 bg-white px-6 py-4">
            {footer}
          </div>
        )}
      </motion.aside>
    </>
  )
}

