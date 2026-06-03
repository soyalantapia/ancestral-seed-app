import { useState } from 'react'
import { CreditCard, Lock, X } from 'lucide-react'
import { useEscape } from '@/hooks/useEscape'

/**
 * Método de pago guardado. Antes vivía en Configuración → "Método de pago";
 * al eliminar Configuración, la gestión de tarjetas se movió a Pagos (el
 * centro financiero único). Este modal es compartido.
 */
export interface SavedPaymentMethod {
  id: string
  brand: 'visa' | 'mastercard' | 'amex' | 'otra'
  last4: string
  holder: string
  expiry: string
}

function detectBrand(num: string): SavedPaymentMethod['brand'] {
  const n = num.replace(/\s/g, '')
  if (/^4/.test(n)) return 'visa'
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'mastercard'
  if (/^3[47]/.test(n)) return 'amex'
  return 'otra'
}

export function AddPaymentModal({
  onClose,
  onAdd,
}: {
  onClose: () => void
  onAdd: (pm: Omit<SavedPaymentMethod, 'id'>) => void
}) {
  const [holder, setHolder] = useState('')
  const [number, setNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  useEscape(true, onClose)

  const digits = number.replace(/\D/g, '')
  const brand = detectBrand(number)
  const last4 = digits.slice(-4)
  const expiryOk = /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)
  const cvvOk = /^\d{3,4}$/.test(cvv)
  const canSubmit =
    holder.trim().length > 2 && digits.length >= 13 && expiryOk && cvvOk

  const formatNumber = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 19)
    return d.match(/.{1,4}/g)?.join(' ') ?? d
  }

  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4)
    if (d.length <= 2) return d
    return `${d.slice(0, 2)}/${d.slice(2)}`
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
        aria-label="Agregar método de pago"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-500 text-white">
              <CreditCard className="h-5 w-5" />
            </span>
            <h3 className="text-lg font-bold text-navy-500">
              Agregar método de pago
            </h3>
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

        {/* Card preview */}
        <div className="mt-5 rounded-2xl bg-gradient-to-br from-navy-500 to-navy-400 p-5 text-white shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
              {brand}
            </span>
            <CreditCard className="h-5 w-5 opacity-80" />
          </div>
          <p className="mt-6 font-mono text-base tracking-widest">
            {number.padEnd(19, '•').replace(/\d{4}/g, '$& ').slice(0, 23) ||
              '•••• •••• •••• ••••'}
          </p>
          <div className="mt-4 flex items-center justify-between text-[11px]">
            <span className="uppercase opacity-80">
              {holder || 'NOMBRE Y APELLIDO'}
            </span>
            <span className="font-mono">{expiry || 'MM/AA'}</span>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <label className="block">
            <span className="text-xs font-bold text-navy-500">
              Titular de la tarjeta
            </span>
            <input
              type="text"
              value={holder}
              onChange={(e) => setHolder(e.target.value.toUpperCase())}
              placeholder="NOMBRE Y APELLIDO"
              className="mt-1 h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm uppercase text-navy-500 focus:border-gold-500 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-navy-500">
              Número de tarjeta
            </span>
            <input
              type="text"
              value={number}
              inputMode="numeric"
              onChange={(e) => setNumber(formatNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              className="mt-1 h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 font-mono text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-bold text-navy-500">
                Vencimiento
              </span>
              <input
                type="text"
                value={expiry}
                inputMode="numeric"
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/AA"
                className="mt-1 h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 font-mono text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-navy-500">CVV</span>
              <input
                type="password"
                value={cvv}
                inputMode="numeric"
                maxLength={4}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                placeholder="•••"
                className="mt-1 h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 font-mono text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
              />
            </label>
          </div>
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-navy-300">
          <Lock className="h-3 w-3" />
          Tus datos viajan cifrados. No los guardamos en texto plano.
        </p>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm font-bold text-navy-500 hover:bg-neutral-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() =>
              onAdd({ brand, last4, holder: holder.trim(), expiry })
            }
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-bold text-navy-500 shadow-sm hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CreditCard className="h-4 w-4" />
            Guardar tarjeta
          </button>
        </div>
      </div>
    </div>
  )
}
