import { useEffect, useRef, useState } from 'react'
import { Copy, Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Modal } from '@/components/ui/modal'
import { cn } from '@/lib/utils'
import {
  QR_SIZES,
  buildQrPngBlob,
  certPublicUrl,
  downloadBlob,
  renderQrCanvas,
  type QrStyle,
} from '@/lib/qr'

interface QrDownloadModalProps {
  open: boolean
  onClose: () => void
  slug: string
  title: string
}

const STYLES: { key: QrStyle; label: string; hint: string }[] = [
  { key: 'simple', label: 'Pelado B/N', hint: 'Máxima legibilidad. Imprime en una tinta.' },
  { key: 'marca', label: 'Con marca', hint: 'Logo Ancestral Seed al centro.' },
]

/**
 * Modal para descargar el código QR de un certificado, pensado para que
 * el dueño de la pieza lo imprima en la etiqueta. El QR apunta a la ficha
 * pública verificable. Ofrece 2 estilos (pelado B/N y con marca) en 3
 * tamaños listos para usar. Generación 100% local (sin servicio externo).
 */
export function QrDownloadModal({ open, onClose, slug, title }: QrDownloadModalProps) {
  const [style, setStyle] = useState<QrStyle>('simple')
  const [busy, setBusy] = useState<string | null>(null)
  const previewRef = useRef<HTMLCanvasElement>(null)

  const url = certPublicUrl(slug)

  // Preview en vivo: se re-dibuja al abrir o al cambiar de estilo.
  useEffect(() => {
    if (!open) return
    const canvas = previewRef.current
    if (!canvas) return
    renderQrCanvas({ text: url, size: 240, style, canvas }).catch(() => {})
  }, [open, style, url])

  const handleDownload = async (sizeKey: string, px: number) => {
    try {
      setBusy(sizeKey)
      const blob = await buildQrPngBlob({ text: url, size: px, style })
      downloadBlob(`${slug}-qr-${style}-${px}px.png`, blob)
      toast.success(`QR ${px}px descargado`)
    } catch {
      toast.error('No se pudo generar el QR')
    } finally {
      setBusy(null)
    }
  }

  return (
    <Modal isOpen={open} onClose={onClose} title="Descargar código QR" size="md">
      <p className="-mt-1 text-sm text-navy-300">
        Imprimilo en la etiqueta de{' '}
        <span className="font-semibold text-navy-500">{title}</span>. Al escanearlo abre la ficha
        pública verificable.
      </p>

      {/* Vista previa */}
      <div className="mt-5 flex justify-center">
        <div className="rounded-2xl border-2 border-neutral-200 bg-white p-3">
          <canvas
            ref={previewRef}
            width={240}
            height={240}
            role="img"
            aria-label={`Vista previa del código QR de ${title}`}
            className="h-44 w-44"
          />
        </div>
      </div>

      {/* Estilo */}
      <div className="mt-5">
        <p className="text-xs font-bold text-navy-500">Estilo</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {STYLES.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setStyle(s.key)}
              aria-pressed={style === s.key}
              className={cn(
                'rounded-xl border px-3 py-2 text-left transition-colors',
                style === s.key
                  ? 'border-gold-500 bg-gold-50 ring-1 ring-gold-500'
                  : 'border-neutral-200 bg-white hover:bg-neutral-100',
              )}
            >
              <span className="block text-sm font-semibold text-navy-500">{s.label}</span>
              <span className="mt-0.5 block text-[11px] leading-tight text-navy-300">{s.hint}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tamaños / descarga */}
      <div className="mt-5">
        <p className="text-xs font-bold text-navy-500">Descargar PNG</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {QR_SIZES.map((sz) => (
            <button
              key={sz.key}
              type="button"
              disabled={busy !== null}
              onClick={() => handleDownload(sz.key, sz.px)}
              className="flex flex-col items-center gap-1 rounded-xl border border-neutral-300 bg-white px-2 py-3 text-center transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy === sz.key ? (
                <Loader2 className="h-5 w-5 animate-spin text-gold-700" aria-hidden />
              ) : (
                <Download className="h-5 w-5 text-gold-700" aria-hidden />
              )}
              <span className="text-sm font-semibold text-navy-500">{sz.label}</span>
              <span className="text-[10px] leading-tight text-navy-300">
                {sz.px}px · {sz.hint}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Destino */}
      <div className="mt-5">
        <p className="text-xs font-bold text-navy-500">El QR apunta a</p>
        <div className="mt-1 flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-100 px-3 py-2">
          <input
            readOnly
            value={url}
            aria-label="URL de destino del código QR"
            className="flex-1 truncate bg-transparent text-xs text-navy-500 focus:outline-none"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(url)
              toast.success('Link copiado')
            }}
            aria-label="Copiar link"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-500 text-navy-500 transition-colors hover:bg-gold-400"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </Modal>
  )
}
