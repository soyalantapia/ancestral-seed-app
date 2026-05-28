import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check,
  EyeOff,
  Pencil,
  Pin,
  Plus,
  StickyNote,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  useInternalNotesStore,
  type InternalNote,
} from '@/store/internalNotes'
import { cn } from '@/lib/utils'

/**
 * Panel de notas internas — visible solo para el equipo (tutor /
 * coordinador / curador), nunca se mezcla con mensajes públicos al
 * postulante.
 *
 * Render-only — la lógica de CRUD vive en useInternalNotesStore.
 * Pasale el `entityKey` correspondiente:
 *   - `case-${caseId}` desde TutorCaseDetail (SA5 / #TUT-15)
 *   - `cert-${certId}` cuando lo conectemos en TutorCertificationDetail
 *
 * Cierra el bug crítico de la auditoría UX: el tutor durante revisión
 * activa no tenía memoria interna, y terminaba abriendo WhatsApp por
 * fuera (perdiendo trazabilidad).
 */
interface InternalNotesPanelProps {
  entityKey: string
  /** Datos del tutor logueado para autoría de notas nuevas. */
  currentUser: {
    name: string
    initials: string
  }
}

export function InternalNotesPanel({
  entityKey,
  currentUser,
}: InternalNotesPanelProps) {
  const notes = useInternalNotesStore((s) => s.notesFor(entityKey))
  const addNote = useInternalNotesStore((s) => s.addNote)
  const updateNote = useInternalNotesStore((s) => s.updateNote)
  const removeNote = useInternalNotesStore((s) => s.removeNote)
  const togglePinned = useInternalNotesStore((s) => s.togglePinned)

  const [composing, setComposing] = useState(false)
  const [draft, setDraft] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingBody, setEditingBody] = useState('')

  function handleAdd() {
    const trimmed = draft.trim()
    if (!trimmed) return
    addNote({
      entityKey,
      body: trimmed,
      authorName: currentUser.name,
      authorInitials: currentUser.initials,
    })
    setDraft('')
    setComposing(false)
    toast.success('Nota agregada')
  }

  function handleSaveEdit() {
    if (!editingId) return
    updateNote(editingId, editingBody)
    setEditingId(null)
    setEditingBody('')
    toast.success('Nota actualizada')
  }

  function handleRemove(note: InternalNote) {
    removeNote(note.id)
    toast.success('Nota eliminada', {
      action: {
        label: 'Deshacer',
        onClick: () => {
          // Re-agregar con el mismo body — Zustand le da un id nuevo
          // pero el efecto visual es indistinguible.
          addNote({
            entityKey: note.entityKey,
            body: note.body,
            authorName: note.authorName,
            authorInitials: note.authorInitials,
          })
        },
      },
    })
  }

  return (
    <div className="space-y-4">
      {/* Banner de privacidad — el tutor necesita ver una sola vez que
          ESTO no se comparte con el postulante para confiar plenamente
          en escribir lo que pasa por su cabeza. */}
      <div className="flex items-start gap-3 rounded-2xl border border-navy-200 bg-navy-50/60 p-4">
        <EyeOff className="mt-0.5 h-4 w-4 shrink-0 text-navy-500" />
        <div className="text-xs leading-relaxed text-navy-500">
          <p className="font-bold">
            Visible solo para tutores y coordinadores
          </p>
          <p className="mt-0.5 text-navy-300">
            Estas notas NO se comparten con el postulante. Usalas para
            registrar dudas, observaciones internas o coordinación con
            el equipo.
          </p>
        </div>
      </div>

      {/* Composer — botón compacto que se expande a textarea al click.
          Pattern de "nota rápida" más usable que un textarea siempre
          abierto. */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-4">
        {!composing ? (
          <button
            type="button"
            onClick={() => {
              setComposing(true)
              setDraft('')
            }}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-navy-500 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-navy-400"
          >
            <Plus className="h-4 w-4" />
            Añadir nota interna
          </button>
        ) : (
          <div className="space-y-3">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              placeholder="¿Qué querés dejar registrado?"
              autoFocus
              className="w-full resize-none rounded-2xl border border-gold-300 bg-white px-4 py-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
            />
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] text-navy-300">
                Como {currentUser.name}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setComposing(false)
                    setDraft('')
                  }}
                  className="inline-flex h-9 items-center justify-center rounded-full px-3 text-xs font-semibold text-navy-300 hover:bg-neutral-100 hover:text-navy-500"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!draft.trim()}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-navy-500 px-4 text-xs font-bold text-white shadow-sm transition-colors hover:bg-navy-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Check className="h-3.5 w-3.5" />
                  Guardar nota
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de notas */}
      {notes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 p-10 text-center">
          <StickyNote className="mx-auto h-8 w-8 text-navy-300" />
          <p className="mt-3 text-sm font-bold text-navy-500">
            Sin notas internas todavía
          </p>
          <p className="mt-1 text-xs text-navy-300">
            La primera nota interna sirve para registrar el contexto del
            caso para vos mismo en el próximo turno o para el resto del
            equipo.
          </p>
        </div>
      ) : (
        <ol className="space-y-3">
          <AnimatePresence initial={false}>
            {notes.map((note) => {
              const isEditing = editingId === note.id
              const date = new Date(note.at)
              return (
                <motion.li
                  key={note.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  className={cn(
                    'rounded-2xl border bg-white p-4 shadow-sm transition-colors',
                    note.pinned
                      ? 'border-gold-300/70 bg-gold-50/30'
                      : 'border-neutral-200',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-500 text-[10px] font-bold text-white">
                      {note.authorInitials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <p className="text-xs font-bold text-navy-500">
                          {note.authorName}
                        </p>
                        {note.pinned && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gold-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-gold-700">
                            <Pin className="h-2.5 w-2.5" />
                            Fijada
                          </span>
                        )}
                        <p className="text-[11px] text-navy-300">
                          {date.toLocaleDateString('es-AR', {
                            day: '2-digit',
                            month: 'short',
                          })}{' '}
                          ·{' '}
                          {date.toLocaleTimeString('es-AR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      {isEditing ? (
                        <div className="mt-2 space-y-2">
                          <textarea
                            value={editingBody}
                            onChange={(e) => setEditingBody(e.target.value)}
                            rows={3}
                            className="w-full resize-none rounded-xl border border-gold-300 bg-white px-3 py-2 text-sm text-navy-500 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                            autoFocus
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(null)
                                setEditingBody('')
                              }}
                              className="inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold text-navy-300 hover:bg-neutral-100 hover:text-navy-500"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveEdit}
                              disabled={!editingBody.trim()}
                              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-navy-500 px-3 text-xs font-bold text-white shadow-sm hover:bg-navy-400 disabled:opacity-40"
                            >
                              <Check className="h-3 w-3" />
                              Guardar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-navy-500">
                          {note.body}
                        </p>
                      )}
                    </div>
                    {!isEditing && (
                      // Toolbar siempre visible — el tutor con prisa no
                      // debería tener que hacer hover para encontrar
                      // editar/eliminar.
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => togglePinned(note.id)}
                          aria-label={note.pinned ? 'Desfijar' : 'Fijar arriba'}
                          title={note.pinned ? 'Desfijar' : 'Fijar arriba'}
                          className={cn(
                            'flex h-7 w-7 items-center justify-center rounded-full transition-colors',
                            note.pinned
                              ? 'bg-gold-500/20 text-gold-700 hover:bg-gold-500/30'
                              : 'text-navy-300 hover:bg-neutral-100 hover:text-navy-500',
                          )}
                        >
                          <Pin className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(note.id)
                            setEditingBody(note.body)
                          }}
                          aria-label="Editar nota"
                          title="Editar"
                          className="flex h-7 w-7 items-center justify-center rounded-full text-navy-300 hover:bg-neutral-100 hover:text-navy-500"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(note)}
                          aria-label="Eliminar nota"
                          title="Eliminar"
                          className="flex h-7 w-7 items-center justify-center rounded-full text-navy-300 hover:bg-error-100 hover:text-error-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ol>
      )}
    </div>
  )
}

/**
 * Util: arma el entityKey canónico para un caso. Centralizá acá la
 * construcción para que nadie invente otra forma en otra parte.
 */
export function caseEntityKey(caseId: string): string {
  return `case-${caseId}`
}

/**
 * Fix V2-TUT-09 (auditoría v2): mismo helper para certs emitidos.
 * Antes NotesDrawer del cert emitido usaba `useState` local — refresh
 * borraba todas las notas. Ahora el cert emitido también persiste a
 * través del mismo store que el caso activo.
 */
export function certEntityKey(certId: string): string {
  return `cert-${certId}`
}
