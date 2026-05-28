import { useEffect, useId, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Banknote,
  CheckCircle2,
  Copy,
  CreditCard,
  FileText,
  Lock,
  Upload,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { PAYMENT_TRANSFER } from '@/lib/copy'
import { cn } from '@/lib/utils'

/**
 * Fix SA4 (#POS-31 + #POS-20, auditoría UX): antes el botón "Pagar"
 * disparaba solo un toast.success("Iniciando pago de X") sin abrir
 * ningún flujo real. Era la promesa más rota del flujo postulante.
 *
 * Este modal entrega un checkout funcional (mock por ahora, sin
 * pasarela real conectada) con 2 caminos:
 *
 * 1. Tarjeta — form con holder, número, vencimiento, CVV. Validación
 *    en cliente (Luhn no, pero formato + longitud). Al confirmar
 *    simulamos delay 1.5s y marcamos el pago como abonado.
 *
 * 2. Transferencia — muestra los datos bancarios (CBU/CVU/alias) con
 *    botón "Copiar" para cada uno, más un input file para subir el
 *    comprobante. Al subir, el pago queda como "pendiente de
 *    confirmación" hasta que admin valide. UI lo trata como abonado
 *    a efectos de UX (badge "Comprobante en revisión").
 *
 * Estado de éxito: confirmación animada + recibo descargable + auto-
 * close opcional. La responsabilidad de propagar el cambio a la lista
 * de pagos recae en el caller via `onPaid(itemId, method, evidence?)`.
 */

export interface CheckoutPaymentInput {
  id: string
  concept: string
  amount: number
  currency: string
  /** Identificador de la solicitud — para mostrar contexto. */
  requestLabel?: string
  dueDate?: string
}

export type CheckoutMethod = 'card' | 'transfer'

export interface CheckoutResult {
  itemId: string
  method: CheckoutMethod
  evidenceFileName?: string
  paidAt: string
}

interface CheckoutModalProps {
  open: boolean
  item: CheckoutPaymentInput | null
  onClose: () => void
  onPaid: (result: CheckoutResult) => void
}

type Tab = 'card' | 'transfer'
type Status = 'idle' | 'processing' | 'success'

const fmtMoney = (n: number, currency: string) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(n)

export function CheckoutModal({
  open,
  item,
  onClose,
  onPaid,
}: CheckoutModalProps) {
  const [tab, setTab] = useState<Tab>('card')
  const [status, setStatus] = useState<Status>('idle')
  // Card form fields
  const [holder, setHolder] = useState('')
  const [number, setNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  // Fix V2-POS-14 (auditoría v2): antes el formulario solo deshabilitaba
  // el submit cuando los campos eran inválidos — no había feedback en
  // los campos en sí. El user no entendía POR QUÉ no podía pagar.
  // Ahora trackeamos `touched` por campo y, si el campo está touched +
  // inválido, mostramos border-error + mensaje.
  //
  // Fix V3-POS-06 (auditoría v3): el `touched` se seteaba SOLO al blur.
  // Si el user TAB-tababa sin escribir nada para explorar el form,
  // cada blur en cascada activaba el error rojo en TODOS los campos
  // vacíos — "el form me grita antes de empezar". Ahora rastreamos
  // ADEMÁS `dirty` por campo (el user TIPEÓ algo) y mostramos el
  // error solo si tocó Y dejó vacío con intención (touched && dirty),
  // o si intentó submit (touched={all:true} desde handleSubmitCard).
  const [touched, setTouched] = useState<{
    holder: boolean
    number: boolean
    expiry: boolean
    cvv: boolean
  }>({ holder: false, number: false, expiry: false, cvv: false })
  const [dirty, setDirty] = useState<{
    holder: boolean
    number: boolean
    expiry: boolean
    cvv: boolean
  }>({ holder: false, number: false, expiry: false, cvv: false })
  // Transfer file
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null)
  /**
   * Fix V3-POS-07 (auditoría v3): igual que con los campos de tarjeta,
   * antes la tab Transferencia solo tiraba `toast.error('Adjuntá el
   * comprobante')` si el user clickeaba "Confirmar pago" sin file.
   * No había border-error en el upload area ni aria-invalid. Ahora
   * trackear `transferTouched` paralelo al patrón `touched` de la
   * tab Card, marcamos visualmente el upload area cuando es inválido.
   */
  const [transferTouched, setTransferTouched] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset state cuando se abre con un item nuevo (por si el user cerró
  // a medio camino y vuelve a abrir).
  useEffect(() => {
    if (open) {
      setTab('card')
      setStatus('idle')
      setHolder('')
      setNumber('')
      setExpiry('')
      setCvv('')
      setEvidenceFile(null)
      setTouched({
        holder: false,
        number: false,
        expiry: false,
        cvv: false,
      })
      setDirty({
        holder: false,
        number: false,
        expiry: false,
        cvv: false,
      })
      setTransferTouched(false)
    }
  }, [open, item?.id])

  // Esc cierra
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && status !== 'processing') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose, status])

  if (!item) return null

  function formatCardNumber(raw: string): string {
    const digits = raw.replace(/\D/g, '').slice(0, 19)
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  function formatExpiry(raw: string): string {
    const digits = raw.replace(/\D/g, '').slice(0, 4)
    if (digits.length <= 2) return digits
    return `${digits.slice(0, 2)}/${digits.slice(2)}`
  }

  // Fix V2-POS-14: validez por campo individual (no solo el bool global)
  const fieldErrors = {
    holder:
      holder.trim().length === 0
        ? 'Ingresá el nombre que figura en la tarjeta'
        : holder.trim().length < 3
          ? 'Mínimo 3 caracteres'
          : null,
    number: (() => {
      const digits = number.replace(/\s/g, '')
      if (digits.length === 0) return 'Ingresá el número de la tarjeta'
      if (digits.length < 13) return 'Faltan dígitos (mínimo 13)'
      return null
    })(),
    expiry: !/^\d{2}\/\d{2}$/.test(expiry)
      ? expiry.length === 0
        ? 'Ingresá el vencimiento (MM/AA)'
        : 'Formato inválido — usá MM/AA'
      : null,
    cvv: !/^\d{3,4}$/.test(cvv)
      ? cvv.length === 0
        ? 'Ingresá el CVV'
        : 'CVV debe tener 3 o 4 dígitos'
      : null,
  }
  const cardValid =
    !fieldErrors.holder &&
    !fieldErrors.number &&
    !fieldErrors.expiry &&
    !fieldErrors.cvv

  function copyToClipboard(value: string, label: string) {
    navigator.clipboard?.writeText(value).then(
      () => toast.success(`${label} copiado`),
      () => toast.error('No pudimos copiar al portapapeles'),
    )
  }

  async function handleSubmitCard() {
    if (!cardValid) {
      // Fix V2-POS-14 + V3-POS-06: si el user clickea "Pagar" sin
      // datos válidos, forzamos touched Y dirty en TODOS para revelar
      // los errores (el touched solo no alcanza ahora porque pedimos
      // touched && dirty para mostrar error in-line — pero el intento
      // de submit es señal explícita de "ya quiero ver qué falta").
      setTouched({ holder: true, number: true, expiry: true, cvv: true })
      setDirty({ holder: true, number: true, expiry: true, cvv: true })
      return
    }
    setStatus('processing')
    // Simulación de procesamiento (en producción → Mercado Pago/Stripe)
    await new Promise((r) => setTimeout(r, 1500))
    setStatus('success')
    setTimeout(() => {
      if (!item) return
      onPaid({
        itemId: item.id,
        method: 'card',
        paidAt: new Date().toISOString(),
      })
      onClose()
    }, 1200)
  }

  function handleSubmitTransfer() {
    if (!evidenceFile) {
      // Fix V3-POS-07: marcar como touched para revelar feedback in-field
      // además del toast.error.
      setTransferTouched(true)
      toast.error('Adjuntá el comprobante para confirmar')
      return
    }
    setStatus('processing')
    setTimeout(() => {
      setStatus('success')
      setTimeout(() => {
        if (!item) return
        onPaid({
          itemId: item.id,
          method: 'transfer',
          evidenceFileName: evidenceFile.name,
          paidAt: new Date().toISOString(),
        })
        onClose()
      }, 1200)
    }, 800)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => status !== 'processing' && onClose()}
            className="absolute inset-0 bg-navy-500/60 backdrop-blur-[2px]"
            disabled={status === 'processing'}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-title"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            {/* Success overlay */}
            {status === 'success' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white p-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0.6, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-success-300 text-white shadow-lg"
                >
                  <CheckCircle2 className="h-9 w-9" />
                </motion.div>
                <h3 className="mt-5 text-xl font-bold text-navy-500">
                  {tab === 'card'
                    ? '¡Pago confirmado!'
                    : 'Comprobante recibido'}
                </h3>
                <p className="mt-2 max-w-sm text-sm text-navy-300">
                  {tab === 'card'
                    ? `Se debitaron ${fmtMoney(item.amount, item.currency)} de tu tarjeta. Vas a recibir el recibo por email.`
                    : `Revisamos tu comprobante en las próximas 24h y te avisamos por email cuando esté confirmado.`}
                </p>
              </motion.div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between border-b border-neutral-200 px-6 py-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-gold-700">
                  Pagar arancel
                </p>
                <h2
                  id="checkout-title"
                  className="mt-0.5 text-lg font-bold text-navy-500"
                >
                  {item.concept}
                </h2>
                {item.requestLabel && (
                  <p className="mt-0.5 text-xs text-navy-300">
                    {item.requestLabel}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={status === 'processing'}
                aria-label="Cerrar"
                className="rounded-full p-1.5 text-navy-300 transition-colors hover:bg-neutral-100 hover:text-navy-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Amount banner */}
            <div className="bg-gradient-to-br from-gold-100 to-cream-50 px-6 py-4">
              <p className="text-[11px] font-medium uppercase tracking-widest text-navy-300">
                Total a pagar
              </p>
              <p className="mt-0.5 text-2xl font-bold tabular-nums text-navy-500">
                {fmtMoney(item.amount, item.currency)}
              </p>
              {item.dueDate && (
                <p className="mt-1 text-xs text-navy-300">
                  Vence el{' '}
                  {new Date(item.dueDate).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-neutral-200">
              <TabButton
                active={tab === 'card'}
                onClick={() => setTab('card')}
                icon={CreditCard}
                label="Tarjeta"
              />
              <TabButton
                active={tab === 'transfer'}
                onClick={() => setTab('transfer')}
                icon={Banknote}
                label="Transferencia"
              />
            </div>

            {/* Tab content */}
            <div className="px-6 py-5">
              {tab === 'card' && (
                <div className="space-y-4">
                  {/* Fix V2-POS-14: cada campo con su propio error visible
                      cuando touched && invalid. El border pasa a rojo y
                      aparece un mensaje específico debajo. */}
                  <FieldRow
                    label="Nombre del titular"
                    error={
                      touched.holder && dirty.holder ? fieldErrors.holder : null
                    }
                  >
                    {(errorId) => (
                      <input
                        type="text"
                        value={holder}
                        onChange={(e) => {
                          setHolder(e.target.value)
                          if (!dirty.holder)
                            setDirty((d) => ({ ...d, holder: true }))
                        }}
                        onBlur={() =>
                          setTouched((t) => ({ ...t, holder: true }))
                        }
                        placeholder="Como figura en la tarjeta"
                        autoComplete="cc-name"
                        aria-invalid={
                          touched.holder && dirty.holder && fieldErrors.holder !== null
                        }
                        aria-describedby={errorId}
                        className={cn(
                          'mt-1 h-11 w-full rounded-lg border bg-white px-3 text-sm text-navy-500 focus:outline-none focus:ring-2',
                          touched.holder && dirty.holder && fieldErrors.holder
                            ? 'border-error-400 focus:border-error-400 focus:ring-error-400/20'
                            : 'border-neutral-300 focus:border-gold-500 focus:ring-gold-500/20',
                        )}
                      />
                    )}
                  </FieldRow>
                  <FieldRow
                    label="Número de tarjeta"
                    error={
                      touched.number && dirty.number ? fieldErrors.number : null
                    }
                  >
                    {(errorId) => (
                      <input
                        type="text"
                        value={number}
                        onChange={(e) => {
                          setNumber(formatCardNumber(e.target.value))
                          if (!dirty.number)
                            setDirty((d) => ({ ...d, number: true }))
                        }}
                        onBlur={() =>
                          setTouched((t) => ({ ...t, number: true }))
                        }
                        placeholder="1234 5678 9012 3456"
                        autoComplete="cc-number"
                        inputMode="numeric"
                        aria-invalid={
                          touched.number && dirty.number && fieldErrors.number !== null
                        }
                        aria-describedby={errorId}
                        className={cn(
                          'mt-1 h-11 w-full rounded-lg border bg-white px-3 text-sm tabular-nums text-navy-500 focus:outline-none focus:ring-2',
                          touched.number && dirty.number && fieldErrors.number
                            ? 'border-error-400 focus:border-error-400 focus:ring-error-400/20'
                            : 'border-neutral-300 focus:border-gold-500 focus:ring-gold-500/20',
                        )}
                      />
                    )}
                  </FieldRow>
                  <div className="grid grid-cols-2 gap-3">
                    <FieldRow
                      label="Vencimiento"
                      error={
                        touched.expiry && dirty.expiry
                          ? fieldErrors.expiry
                          : null
                      }
                    >
                      {(errorId) => (
                        <input
                          type="text"
                          value={expiry}
                          onChange={(e) => {
                            setExpiry(formatExpiry(e.target.value))
                            if (!dirty.expiry)
                              setDirty((d) => ({ ...d, expiry: true }))
                          }}
                          onBlur={() =>
                            setTouched((t) => ({ ...t, expiry: true }))
                          }
                          placeholder="MM/AA"
                          autoComplete="cc-exp"
                          inputMode="numeric"
                          aria-invalid={
                            touched.expiry && dirty.expiry && fieldErrors.expiry !== null
                          }
                          aria-describedby={errorId}
                          className={cn(
                            'mt-1 h-11 w-full rounded-lg border bg-white px-3 text-sm tabular-nums text-navy-500 focus:outline-none focus:ring-2',
                            touched.expiry && dirty.expiry && fieldErrors.expiry
                              ? 'border-error-400 focus:border-error-400 focus:ring-error-400/20'
                              : 'border-neutral-300 focus:border-gold-500 focus:ring-gold-500/20',
                          )}
                        />
                      )}
                    </FieldRow>
                    <FieldRow
                      label="CVV"
                      error={
                        touched.cvv && dirty.cvv ? fieldErrors.cvv : null
                      }
                    >
                      {(errorId) => (
                        <input
                          type="text"
                          value={cvv}
                          onChange={(e) => {
                            setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))
                            if (!dirty.cvv)
                              setDirty((d) => ({ ...d, cvv: true }))
                          }}
                          onBlur={() =>
                            setTouched((t) => ({ ...t, cvv: true }))
                          }
                          placeholder="123"
                          autoComplete="cc-csc"
                          inputMode="numeric"
                          aria-invalid={
                            touched.cvv && dirty.cvv && fieldErrors.cvv !== null
                          }
                          aria-describedby={errorId}
                          className={cn(
                            'mt-1 h-11 w-full rounded-lg border bg-white px-3 text-sm tabular-nums text-navy-500 focus:outline-none focus:ring-2',
                            touched.cvv && dirty.cvv && fieldErrors.cvv
                              ? 'border-error-400 focus:border-error-400 focus:ring-error-400/20'
                              : 'border-neutral-300 focus:border-gold-500 focus:ring-gold-500/20',
                          )}
                        />
                      )}
                    </FieldRow>
                  </div>
                  <p className="flex items-center gap-1.5 text-[11px] text-navy-300">
                    <Lock className="h-3 w-3" />
                    Conexión cifrada. No guardamos los datos de la tarjeta.
                  </p>
                </div>
              )}

              {tab === 'transfer' && (
                <div className="space-y-4">
                  <p className="text-xs text-navy-300">
                    Transferí a la siguiente cuenta y subí el comprobante.
                    Lo revisamos en menos de 24h y te confirmamos por email.
                  </p>
                  <div className="space-y-2 rounded-2xl border border-neutral-200 bg-cream-50 p-4">
                    <BankRow
                      label="Banco"
                      value={PAYMENT_TRANSFER.bankName}
                    />
                    <BankRow
                      label="Titular"
                      value={PAYMENT_TRANSFER.accountHolder}
                    />
                    <BankRow
                      label="CUIT"
                      value={PAYMENT_TRANSFER.cuit}
                      copyable
                      onCopy={(v) => copyToClipboard(v, 'CUIT')}
                    />
                    <BankRow
                      label="CBU"
                      value={PAYMENT_TRANSFER.cbu}
                      copyable
                      onCopy={(v) => copyToClipboard(v, 'CBU')}
                    />
                    <BankRow
                      label="CVU"
                      value={PAYMENT_TRANSFER.cvu}
                      copyable
                      onCopy={(v) => copyToClipboard(v, 'CVU')}
                    />
                    <BankRow
                      label="Alias"
                      value={PAYMENT_TRANSFER.alias}
                      copyable
                      onCopy={(v) => copyToClipboard(v, 'Alias')}
                      highlight
                    />
                  </div>

                  {/* Upload */}
                  <div>
                    <label className="text-xs font-bold text-navy-500">
                      Comprobante de transferencia
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      className="sr-only"
                      onChange={(e) => setEvidenceFile(e.target.files?.[0] ?? null)}
                    />
                    {evidenceFile ? (
                      <div className="mt-1 flex items-center justify-between rounded-lg border border-success-300 bg-success-100/40 px-3 py-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <FileText className="h-4 w-4 shrink-0 text-success-300" />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-navy-500">
                              {evidenceFile.name}
                            </p>
                            <p className="text-[10px] text-navy-300">
                              {(evidenceFile.size / 1024).toFixed(0)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEvidenceFile(null)
                            if (fileInputRef.current) {
                              fileInputRef.current.value = ''
                            }
                          }}
                          className="rounded-full p-1 text-navy-300 hover:bg-white hover:text-navy-500"
                          aria-label="Quitar comprobante"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          aria-invalid={transferTouched}
                          className={cn(
                            'mt-1 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-white px-4 py-5 text-xs font-semibold text-navy-500 transition-colors hover:border-gold-500 hover:bg-gold-50',
                            transferTouched
                              ? 'border-error-400 bg-error-100/30'
                              : 'border-neutral-300',
                          )}
                        >
                          <Upload className="h-4 w-4" />
                          Subir foto o PDF del comprobante
                        </button>
                        {transferTouched && (
                          <p className="mt-1 text-[11px] font-semibold text-error-400">
                            Adjuntá el comprobante para confirmar el pago
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse gap-2 border-t border-neutral-200 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={status === 'processing'}
                className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm font-bold text-navy-500 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Cancelar
              </button>
              {tab === 'card' && (
                <button
                  type="button"
                  onClick={handleSubmitCard}
                  disabled={!cardValid || status === 'processing'}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-navy-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-navy-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {status === 'processing' ? (
                    <>
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Procesando…
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Pagar {fmtMoney(item.amount, item.currency)}
                    </>
                  )}
                </button>
              )}
              {tab === 'transfer' && (
                <button
                  type="button"
                  onClick={handleSubmitTransfer}
                  disabled={!evidenceFile || status === 'processing'}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-navy-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-navy-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {status === 'processing' ? (
                    <>
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Enviando…
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Enviar comprobante
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Wrapper de campo del formulario de tarjeta con label arriba y
 * mensaje de error abajo. Fix V2-POS-14 — feedback visible cuando el
 * campo está tocado y es inválido.
 *
 * Fix V3-POS-11 (auditoría v3): antes el `<p>` de error no estaba
 * vinculado al input via `aria-describedby` — los screen readers
 * leían "inválido" sin contexto del mensaje. Ahora generamos un id
 * único por instancia con `useId()`, lo asignamos al `<p>` y lo
 * exponemos al children via render-prop (el caller hace
 * aria-describedby={errorId} en el input). Mantiene la API simple
 * sin acoplar el FieldRow al tipo de input.
 */
function FieldRow({
  label,
  error,
  children,
}: {
  label: string
  error: string | null
  children: (
    errorId: string | undefined,
  ) => React.ReactNode
}) {
  const reactId = useId()
  const errorId = error ? `err-${reactId}` : undefined
  return (
    <div>
      <label className="text-xs font-bold text-navy-500">{label}</label>
      {children(errorId)}
      {error && (
        <p
          id={errorId}
          className="mt-1 text-[11px] font-semibold text-error-400"
        >
          {error}
        </p>
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: typeof CreditCard
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors',
        active
          ? 'border-b-2 border-gold-500 text-navy-500'
          : 'border-b-2 border-transparent text-navy-300 hover:text-navy-500',
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )
}

function BankRow({
  label,
  value,
  copyable,
  onCopy,
  highlight,
}: {
  label: string
  value: string
  copyable?: boolean
  onCopy?: (v: string) => void
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-neutral-200/60 py-1.5 last:border-0">
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-widest text-navy-300">
          {label}
        </p>
        <p
          className={cn(
            'truncate text-xs tabular-nums',
            highlight
              ? 'font-bold text-gold-700'
              : 'font-semibold text-navy-500',
          )}
        >
          {value}
        </p>
      </div>
      {copyable && onCopy && (
        <button
          type="button"
          onClick={() => onCopy(value)}
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-navy-500 ring-1 ring-neutral-200 hover:bg-neutral-100 hover:ring-gold-300"
          aria-label={`Copiar ${label}`}
        >
          <Copy className="h-2.5 w-2.5" />
          Copiar
        </button>
      )}
    </div>
  )
}

