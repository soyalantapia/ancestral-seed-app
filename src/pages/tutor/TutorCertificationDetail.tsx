import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  Calendar,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  Pencil,
  Plus,
  Square,
  StickyNote,
  Trash2,
  Video,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  getChecklistByCert,
  getEvidenciasByCert,
  getExpedienteData,
  getInitialNotesByCert,
  mockIssuedCertifications,
} from '@/services/mocks/data'
import type {
  CertExpedienteEvidence,
  CertExpedienteNote,
  ChecklistCategory,
  IssuedCertStatus,
} from '@/types'
import { useEscape } from '@/hooks/useEscape'
import { cn } from '@/lib/utils'

// ─── Status meta ──────────────────────────────────────────────────────────────

const STATUS_META: Record<
  IssuedCertStatus,
  { label: string; cls: string }
> = {
  vigente: {
    label: 'Vigente',
    cls: 'bg-success-100 text-success-300 ring-success-300/30',
  },
  renovacion: {
    label: 'En renovación',
    cls: 'bg-warning-100 text-warning-400 ring-warning-300/40',
  },
  vencido: {
    label: 'Vencido',
    cls: 'bg-info-100 text-info-400 ring-info-300/40',
  },
  denegado: {
    label: 'Denegado',
    cls: 'bg-error-100 text-error-400 ring-error-300/40',
  },
}

type Tab = 'info' | 'blockchain'
type Drawer = null | 'checklist' | 'notes' | 'pretask' | 'incident'

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TutorCertificationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
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

  return (
    <div
      className={cn(
        'relative transition-all',
        drawer && 'lg:pr-[640px]',
      )}
    >
      <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 md:px-8 md:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm">
          <button
            type="button"
            onClick={() => navigate('/tutor/certificaciones')}
            className="text-navy-300 transition-colors hover:text-navy-500"
          >
            Certificados
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-navy-300" />
          <span className="font-bold text-navy-500">{cert.id}</span>
        </nav>

        {/* Header */}
        <header className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold leading-tight text-navy-500 md:text-[28px]">
              {cert.id} — Expediente de certificación
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-navy-300">
              <span className="inline-flex items-center gap-1.5">
                Estado:
                <span
                  className={cn(
                    'inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1',
                    meta.cls,
                  )}
                >
                  {meta.label}
                </span>
              </span>
              <DotSep />
              <span>
                <span className="font-medium">Puntaje:</span> {cert.scoreLabel}
              </span>
              <DotSep />
              <span>
                <span className="font-medium">Emisión:</span> {cert.issuedAt}
              </span>
              <DotSep />
              <span>
                <span className="font-medium">Vencimiento:</span> {cert.expiresAt}
              </span>
            </div>
          </div>

          {/* Primary CTA */}
          <button
            type="button"
            onClick={() => toast.success('Descargando acta de certificación…')}
            className="inline-flex h-11 items-center gap-2 self-start rounded-full bg-gold-500 px-5 text-sm font-bold text-navy-500 shadow-sm transition-colors hover:bg-gold-400"
          >
            <Download className="h-4 w-4" />
            Descargar Acta
          </button>
        </header>

        {/* Tabs + secondary actions */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <TabPill
              active={tab === 'info'}
              onClick={() => setTab('info')}
              label="Información"
            />
            <TabPill
              active={tab === 'blockchain'}
              onClick={() => setTab('blockchain')}
              label="Blockchain"
            />
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <SecondaryAction
              icon={ClipboardCheck}
              label="Checklist"
              onClick={() => setDrawer('checklist')}
            />
            <SecondaryAction
              icon={StickyNote}
              label="Notas del Tutor"
              onClick={() => setDrawer('notes')}
            />
            <SecondaryAction
              icon={Eye}
              label="Ver Ficha Pública"
              onClick={() => toast.info('Abriendo ficha pública…')}
            />
            <SecondaryAction
              icon={AlertTriangle}
              label="Marcar Incidencia"
              onClick={() => setDrawer('incident')}
            />
          </div>
        </div>

        {/* Tab content */}
        <div className="mt-6">
          {tab === 'info' ? (
            <InfoTab
              cert={cert}
              extra={extra}
              onCreatePreTask={() => setDrawer('pretask')}
            />
          ) : (
            <BlockchainTab cert={cert} />
          )}
        </div>
      </div>

      {/* Drawers */}
      <AnimatePresence>
        {drawer === 'checklist' && (
          <ChecklistDrawer
            categories={getChecklistByCert(cert.id)}
            onClose={() => setDrawer(null)}
          />
        )}
        {drawer === 'notes' && (
          <NotesDrawer
            certId={cert.id}
            onClose={() => setDrawer(null)}
          />
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
          <IncidentModal
            certId={cert.id}
            onClose={() => setDrawer(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function DotSep() {
  return (
    <span className="inline-block h-1 w-1 rounded-full bg-gold-500" aria-hidden />
  )
}

function TabPill({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-9 items-center rounded-full px-5 text-sm font-bold transition-colors',
        active
          ? 'bg-gold-500 text-navy-500'
          : 'border border-neutral-300 bg-white text-navy-500 hover:bg-neutral-100',
      )}
    >
      {label}
    </button>
  )
}

function SecondaryAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Pencil
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 items-center gap-2 rounded-full border border-neutral-300 bg-white px-3 text-xs font-bold text-navy-500 transition-colors hover:bg-neutral-100"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}

// ─── Tab Información ──────────────────────────────────────────────────────────

function InfoTab({
  cert,
  extra,
  onCreatePreTask,
}: {
  cert: ReturnType<typeof getCert>
  extra: ReturnType<typeof getExpedienteData>
  onCreatePreTask: () => void
}) {
  return (
    <div className="space-y-8">
      {/* Información del autor */}
      <section>
        <h2 className="text-lg font-bold text-navy-500">Información del autor</h2>
        <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 text-sm md:grid-cols-3">
          <Field label="Solicitante" value={cert.authorName} />
          <Field label="Teléfono" value={extra.authorPhone ?? '—'} />
          <Field label="Comunidad" value={extra.community ?? '—'} />
          <Field label="Email" value={extra.authorEmail ?? '—'} />
          <Field label="Rol" value={extra.authorRole ?? '—'} />
          <Field
            label="País y región"
            value={`${cert.country} · ${cert.region}`}
          />
        </dl>
        <hr className="mt-6 border-neutral-200" />
      </section>

      {/* Información del producto */}
      <section>
        <h2 className="text-lg font-bold text-navy-500">
          Información del producto o servicio
        </h2>
        <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 text-sm md:grid-cols-3">
          <Field label="Nombre" value={cert.productName} />
          <Field label="Tipo" value={extra.productType ?? '—'} />
          <Field label="Sector" value={extra.productSector ?? '—'} />
          <Field label="Categoría" value={cert.category} />
          <Field label="Subcategoría" value={extra.productSubcategory ?? '—'} />
        </dl>

        <div className="mt-6">
          <p className="text-sm font-bold text-navy-500">Producción</p>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-navy-500/90">
            {extra.productionDescription}
          </p>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 text-sm md:grid-cols-2">
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
        <hr className="mt-6 border-neutral-200" />
      </section>

      {/* Evidencias */}
      <EvidenciasSection evidences={getEvidenciasByCert(cert.id)} />

      {/* Renovación */}
      <section>
        <h2 className="text-lg font-bold text-navy-500">Renovación</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <Inline label="Próxima renovación" value={extra.nextRenewalAt ?? '—'} />
          <Inline
            label="Ciclo"
            value={`Cada ${extra.renewalCycleMonths ?? '—'} meses`}
          />
          <Inline label="Estado" value="Vigente" />
          <Inline
            label="Última renovación"
            value={`${extra.lastRenewalAt ?? '—'} — Completada`}
          />
        </dl>
        <button
          type="button"
          onClick={onCreatePreTask}
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-navy-500 px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-navy-400"
        >
          <Plus className="h-4 w-4" />
          Crear pre-tarea de renovación
        </button>
      </section>
    </div>
  )
}

function getCert(_id: string) {
  return mockIssuedCertifications[0]
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-bold text-navy-500">{label}:</dt>
      <dd className="mt-0.5 text-sm text-navy-500/80">{value}</dd>
    </div>
  )
}

function Inline({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline gap-1.5">
      <span className="text-sm font-bold text-navy-500">{label}:</span>
      <span className="text-sm text-navy-500/90">{value}</span>
    </div>
  )
}

// ─── Evidencias section (accordion) ───────────────────────────────────────────

function EvidenciasSection({
  evidences,
}: {
  evidences: CertExpedienteEvidence[]
}) {
  const images = evidences.filter((e) => e.kind === 'image')
  const videos = evidences.filter((e) => e.kind === 'video')
  const docs = evidences.filter((e) => e.kind === 'document')

  return (
    <section>
      <h2 className="text-lg font-bold text-navy-500">Evidencias</h2>
      <div className="mt-4 space-y-1">
        <EvidenceGroup icon={ImageIcon} label="Imágenes" items={images} />
        <EvidenceGroup icon={Video} label="Videos" items={videos} />
        <EvidenceGroup icon={FileText} label="Documentos" items={docs} />
      </div>
      <hr className="mt-6 border-neutral-200" />
    </section>
  )
}

function EvidenceGroup({
  icon: Icon,
  label,
  items,
}: {
  icon: typeof ImageIcon
  label: string
  items: CertExpedienteEvidence[]
}) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left transition-colors hover:bg-neutral-100"
      >
        <ChevronDown
          className={cn(
            'h-4 w-4 text-navy-500 transition-transform',
            !open && '-rotate-90',
          )}
        />
        <Icon className="h-4 w-4 text-navy-500" />
        <span className="text-sm font-bold text-navy-500">
          {label} ({items.length})
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="mt-1 grid grid-cols-1 gap-2 px-8 pb-2 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-100 text-gold-700">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-navy-500">
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
                    onClick={() => toast.success(`Descargando ${e.name}`)}
                    aria-label="Descargar"
                    className="text-navy-300 transition-colors hover:text-navy-500"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </div>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Tab Blockchain ──────────────────────────────────────────────────────────

function BlockchainTab({
  cert,
}: {
  cert: ReturnType<typeof getCert>
}) {
  const hash = `0x${cert.id.toLowerCase().repeat(8).slice(0, 60)}`
  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-widest text-navy-300">
          Registro en blockchain
        </h3>
        <p className="mt-2 text-sm text-navy-500/90">
          Polygon Mainnet · Bloque #{52_000_000 + (parseInt(cert.id.slice(3)) || 0)} ·
          Sellado el {cert.issuedAt}
        </p>
        <div className="mt-4">
          <p className="text-xs font-bold text-navy-500">Hash de transacción</p>
          <div className="mt-1 flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-100 px-3 py-2">
            <code className="flex-1 truncate text-[10px] font-medium text-navy-500">
              {hash}
            </code>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(hash)
                toast.success('Hash copiado')
              }}
              className="inline-flex items-center gap-1 rounded-full bg-gold-500 px-3 py-1 text-xs font-semibold text-navy-500 transition-colors hover:bg-gold-400"
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
          className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-gold-700 hover:underline"
        >
          <ExternalLink className="h-3 w-3" />
          Abrir en explorador
        </a>
      </section>

      <section className="rounded-2xl bg-info-100 p-4 ring-1 ring-info-200">
        <p className="text-sm leading-relaxed text-navy-500">
          La transacción en blockchain es <strong>inmutable</strong>. Cualquier
          modificación del expediente requiere una nueva firma (renovación o
          re-emisión) que queda registrada con su propio hash.
        </p>
      </section>
    </div>
  )
}

// ─── Drawer: Notas del tutor ──────────────────────────────────────────────────

function NotesDrawer({
  certId,
  onClose,
}: {
  certId: string
  onClose: () => void
}) {
  const [notes, setNotes] = useState<CertExpedienteNote[]>(() =>
    getInitialNotesByCert(certId),
  )
  const [editing, setEditing] = useState<string | null>(null)
  const [draftBody, setDraftBody] = useState('')
  const [composing, setComposing] = useState(false)
  useEscape(true, onClose)

  const startEdit = (n: CertExpedienteNote) => {
    setEditing(n.id)
    setDraftBody(n.body)
    setComposing(false)
  }

  const saveEdit = () => {
    if (!editing) return
    setNotes((prev) =>
      prev.map((n) => (n.id === editing ? { ...n, body: draftBody } : n)),
    )
    setEditing(null)
    setDraftBody('')
    toast.success('Nota actualizada')
  }

  const removeNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id))
    toast.success('Nota eliminada')
  }

  const addNote = () => {
    if (!draftBody.trim()) return
    setNotes((prev) => [
      ...prev,
      {
        id: `n-${Date.now()}`,
        authorName: 'Juan Pérez',
        authorInitials: 'JP',
        body: draftBody.trim(),
        at: new Date().toISOString(),
      },
    ])
    setDraftBody('')
    setComposing(false)
    toast.success('Nota agregada')
  }

  return (
    <DrawerShell title="Notas internas del tutor" onClose={onClose}>
      <ul className="space-y-4">
        {notes.map((n, i) => (
          <li
            key={n.id}
            className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-bold text-navy-500">
                Nota {i + 1}
              </p>
              <p className="text-xs text-navy-300">
                {new Date(n.at).toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: '2-digit',
                })}{' '}
                —{' '}
                {new Date(n.at).toLocaleTimeString('es-AR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            {editing === n.id ? (
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
                      setEditing(null)
                      setDraftBody('')
                    }}
                    className="text-xs font-bold text-navy-300 hover:text-navy-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={saveEdit}
                    className="inline-flex h-8 items-center rounded-full bg-navy-500 px-3 text-xs font-bold text-white hover:bg-navy-400"
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

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {editing !== n.id && (
                  <>
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
                      className="inline-flex items-center gap-1 text-xs font-bold text-gold-700 hover:underline"
                    >
                      <Trash2 className="h-3 w-3" />
                      Eliminar
                    </button>
                  </>
                )}
              </div>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-neutral-200 text-[10px] font-bold text-navy-500">
                {n.authorInitials}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {/* Composer */}
      {composing ? (
        <div className="mt-4 rounded-2xl border border-gold-500 bg-white p-4 shadow-sm">
          <textarea
            value={draftBody}
            onChange={(e) => setDraftBody(e.target.value)}
            rows={4}
            placeholder="Escribí la nota interna…"
            className="w-full resize-none rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
            autoFocus
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setComposing(false)
                setDraftBody('')
              }}
              className="text-xs font-bold text-navy-300 hover:text-navy-500"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={addNote}
              disabled={!draftBody.trim()}
              className="inline-flex h-8 items-center rounded-full bg-navy-500 px-3 text-xs font-bold text-white hover:bg-navy-400 disabled:opacity-40"
            >
              Guardar
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setComposing(true)
              setDraftBody('')
            }}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-navy-500 px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-navy-400"
          >
            <Plus className="h-4 w-4" />
            Añadir nueva nota
          </button>
        </div>
      )}
    </DrawerShell>
  )
}

// ─── Drawer: Checklist final ──────────────────────────────────────────────────

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

  const totalCategories = categories.length
  const evaluatedCategories = categories.filter((c) =>
    c.items.every((i) => i.checked),
  ).length

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
    <DrawerShell title="Checklist final: Evaluación manual" onClose={onClose}>
      <p className="text-sm text-navy-500">
        Criterios evaluados:{' '}
        <strong className="text-navy-500">
          {evaluatedCategories}/{totalCategories}
        </strong>
      </p>

      <ul className="mt-5 space-y-3">
        {categories.map((cat) => (
          <CategoryItem
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

function CategoryItem({
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
  return (
    <li className="rounded-2xl">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-1 py-2 text-left"
      >
        <span className="text-sm font-bold text-navy-500">{category.name}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-navy-300 transition-transform',
            !open && '-rotate-90',
          )}
        />
      </button>
      <div className="px-1">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-navy-500">{pct} %</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200">
            <div
              className="h-full rounded-full bg-navy-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <ul className="mt-3 space-y-2 px-1">
              {category.items.map((i) => (
                <li key={i.id}>
                  <button
                    type="button"
                    onClick={() => onToggleItem(i.id)}
                    className="flex w-full items-center gap-3 text-left"
                  >
                    {i.checked ? (
                      <CheckSquare className="h-4 w-4 text-navy-500" strokeWidth={2.5} />
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

            {/* Comment block */}
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
                        className="inline-flex items-center gap-1 text-xs font-bold text-gold-700 hover:underline"
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
          </motion.div>
        )}
      </AnimatePresence>
      <hr className="mt-4 border-neutral-200" />
    </li>
  )
}

// ─── Modal: Crear pre-tarea de renovación ─────────────────────────────────────

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
      subtitle={`${certId} — ${applicantName}`}
      onClose={onClose}
    >
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="space-y-5">
          <Labeled label="Título de la pre-tarea">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Subir avales actualizados"
              className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 placeholder:text-navy-300 focus:border-gold-500 focus:outline-none"
            />
          </Labeled>

          <Labeled label="Descripción">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Detalle de lo que el solicitante debe entregar para la renovación."
              className="w-full resize-none rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-navy-500 placeholder:text-navy-300 focus:border-gold-500 focus:outline-none"
            />
          </Labeled>

          <Labeled label="Tipo de evidencia solicitada">
            <div className="flex flex-wrap gap-4">
              {(['image', 'video', 'document'] as const).map((t) => {
                const active = types.includes(t)
                const label =
                  t === 'image' ? 'Imágen' : t === 'video' ? 'Video' : 'Documento'
                return (
                  <label
                    key={t}
                    className="inline-flex cursor-pointer items-center gap-2 text-sm text-navy-500"
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleType(t)}
                      className="h-4 w-4 rounded border-neutral-400 text-gold-500 focus:ring-gold-500"
                    />
                    {label}
                  </label>
                )
              })}
            </div>
          </Labeled>

          <Labeled label="Fecha límite">
            <input
              type="date"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 placeholder:text-navy-300 focus:border-gold-500 focus:outline-none sm:w-56"
            />
          </Labeled>

          <Labeled
            label="Nota interna"
            hint="solo visible para tutores · opcional"
          >
            <textarea
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              rows={3}
              placeholder="Notas internas para coordinar con el equipo."
              className="w-full resize-none rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-navy-500 placeholder:text-navy-300 focus:border-gold-500 focus:outline-none"
            />
          </Labeled>
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
    </DrawerShell>
  )
}

function Labeled({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-navy-500">
        {label}{' '}
        {hint && (
          <span className="text-[11px] font-normal italic text-navy-300">
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
    <DrawerShell title="Marcar incidencia" subtitle={certId} onClose={onClose}>
      <div className="space-y-4">
        <Labeled label="Motivo">
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
          >
            <option value="">Seleccioná un motivo…</option>
            <option value="dato">Dato erróneo</option>
            <option value="autoria">Autoría incorrecta</option>
            <option value="fraude">Sospecha de fraude</option>
            <option value="otro">Otro</option>
          </select>
        </Labeled>
        <Labeled label="Descripción">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full resize-none rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
          />
        </Labeled>
      </div>
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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
    </DrawerShell>
  )
}

// ─── Drawer shell (overlay desde la derecha) ─────────────────────────────────

function DrawerShell({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string
  subtitle?: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <>
      {/* Mobile backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
        className="fixed inset-0 z-30 bg-navy-500/30 backdrop-blur-[1px] lg:hidden"
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
          <div>
            <h2 id="drawer-title" className="text-lg font-bold text-navy-500">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 text-xs text-navy-300">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-full text-navy-500 hover:bg-neutral-100"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </motion.aside>
    </>
  )
}
