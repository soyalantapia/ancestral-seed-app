import { useState } from 'react'
import { Eye, EyeOff, Lock, X } from 'lucide-react'
import { toast } from 'sonner'
import { useEscape } from '@/hooks/useEscape'

/**
 * Cambiar contraseña — vive en el menú de usuario (antes estaba en
 * Configuración → Cuenta, que se eliminó). Mock: valida en cliente y
 * confirma con un toast.
 */
export function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [repeat, setRepeat] = useState('')
  const [show1, setShow1] = useState(false)
  const [show2, setShow2] = useState(false)
  const [show3, setShow3] = useState(false)
  useEscape(true, onClose)

  const submit = () => {
    if (!current || !next) return toast.error('Completá todos los campos')
    if (next.length < 8) return toast.error('Mínimo 8 caracteres')
    if (next !== repeat) return toast.error('Las contraseñas no coinciden')
    toast.success('Contraseña actualizada')
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-500/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Cambiar contraseña"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-500 text-white">
              <Lock className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-navy-500">
                Cambiar contraseña
              </h3>
              <p className="text-xs text-navy-300">Mínimo 8 caracteres.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-navy-300 hover:bg-neutral-100"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <Field
            label="Contraseña actual"
            value={current}
            onChange={setCurrent}
            show={show1}
            toggle={() => setShow1((v) => !v)}
          />
          <Field
            label="Nueva contraseña"
            value={next}
            onChange={setNext}
            show={show2}
            toggle={() => setShow2((v) => !v)}
          />
          <Field
            label="Repetir nueva contraseña"
            value={repeat}
            onChange={setRepeat}
            show={show3}
            toggle={() => setShow3((v) => !v)}
          />
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm font-bold text-navy-500 hover:bg-neutral-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            className="inline-flex items-center justify-center rounded-full bg-navy-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-navy-400"
          >
            Guardar contraseña
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  show,
  toggle,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  show: boolean
  toggle: () => void
}) {
  return (
    <div>
      <label className="text-xs font-bold text-navy-500">{label}</label>
      <div className="relative mt-2">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full rounded-lg border border-neutral-300 bg-white pl-4 pr-12 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-navy-500 hover:bg-neutral-200"
          aria-label={show ? 'Ocultar' : 'Mostrar'}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}
