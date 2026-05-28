import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera,
  FileCheck2,
  Flag,
  KeyRound,
  QrCode,
  ScanLine,
  Search as SearchIcon,
  ShieldCheck,
  X,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/services/api'
import { useEscape } from '@/hooks/useEscape'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { cn } from '@/lib/utils'
import type { Certification } from '@/types'

const schema = z.object({
  hashOrCode: z
    .string()
    .min(4, 'Mínimo 4 caracteres')
    .max(80, 'Máximo 80 caracteres'),
})

type FormData = z.infer<typeof schema>
type Mode = null | 'hash' | 'qr'

type VerifyResult =
  | { state: 'idle' }
  | { state: 'loading' }
  | { state: 'invalid' }
  | { state: 'valid'; cert: Certification }

export default function Verify() {
  const [mode, setMode] = useState<Mode>(null)
  const [result, setResult] = useState<VerifyResult>({ state: 'idle' })

  return (
    <>
      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto max-w-[1100px] px-4 md:px-8">
          <div className="rounded-3xl bg-pattern-aztec p-8 text-center text-white shadow-xl md:p-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-600 text-gold-400">
              <FileCheck2 className="h-6 w-6" />
            </div>
            <h1 className="mt-5 text-2xl font-bold md:text-3xl">
              Verificar certificado
            </h1>
            <p className="mt-2 text-sm text-neutral-300 md:text-base">
              Mediante ID/Hash o a través del escaneo del código QR.
            </p>

            <div className="mx-auto mt-8 max-w-2xl rounded-3xl bg-white p-6 text-navy-500 md:p-8">
              <p className="text-sm leading-relaxed text-navy-300">
                Estas opciones garantizan un acceso seguro y preciso a los
                datos oficiales de la ficha pública del certificado.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <Button
                  variant="gold"
                  size="md"
                  onClick={() => setMode('qr')}
                >
                  <Camera className="h-4 w-4" /> Escanear QR
                </Button>
                <Button
                  variant="navy"
                  size="md"
                  onClick={() => setMode('hash')}
                >
                  <KeyRound className="h-4 w-4" /> Ingresar Hash
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ProcessSteps />

      <AnimatePresence>
        {mode === 'hash' && (
          <HashModal
            onClose={() => setMode(null)}
            result={result}
            setResult={setResult}
          />
        )}
        {mode === 'qr' && (
          <QrModal
            onClose={() => setMode(null)}
            setResult={setResult}
            onSwitchToHash={() => setMode('hash')}
          />
        )}
      </AnimatePresence>
    </>
  )
}

function HashModal({
  onClose,
  result,
  setResult,
}: {
  onClose: () => void
  result: VerifyResult
  setResult: (r: VerifyResult) => void
}) {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async ({ hashOrCode }: FormData) => {
    setResult({ state: 'loading' })
    try {
      const res = await api.verifyCertificate(hashOrCode)
      if (res.valid && res.certification) {
        setResult({ state: 'valid', cert: res.certification })
        toast.success('Certificado verificado correctamente')
      } else {
        setResult({ state: 'invalid' })
        toast.error('No pudimos verificar ese certificado')
      }
    } catch (e) {
      setResult({ state: 'invalid' })
      toast.error((e as Error).message)
    }
  }

  return (
    <ModalShell onClose={onClose}>
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-100 text-gold-700">
          <KeyRound className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-navy-500">
          Ingresa el ID o Hash
        </h2>
        <p className="mt-1 text-sm text-navy-300">
          Escribí o pegá el código único del certificado.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="hashOrCode" className="sr-only">
            Hash o código
          </Label>
          <Input
            id="hashOrCode"
            placeholder="Ej.: tecnica-ancestral-filigrana o 0xB7E2A1F0..."
            {...register('hashOrCode')}
          />
          <p className="mt-2 text-xs text-navy-300">
            Aceptamos el slug del certificado o su hash en blockchain.
          </p>
          {errors.hashOrCode && (
            <p className="mt-1 text-xs font-medium text-error-400">
              {errors.hashOrCode.message}
            </p>
          )}
        </div>
        <Button
          type="submit"
          variant="gold"
          size="lg"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Verificando…' : 'Verificar'}
        </Button>
      </form>

      {result.state === 'loading' && (
        <div className="mt-5 space-y-2 rounded-2xl border border-neutral-200 bg-neutral-100 p-4">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      )}

      {result.state === 'invalid' && (
        <div className="mt-5 rounded-2xl border border-error-300 bg-error-100 p-4">
          <div className="text-center">
            <p className="font-bold text-error-400">Certificado no válido</p>
            <p className="mt-1 text-xs text-error-400/80">
              No encontramos coincidencias o el certificado fue revocado.
            </p>
          </div>
          {/* Fix QW-B3 (auditoría UX): antes "invalid" era dead-end. Ahora
              ofrecemos 2 caminos: buscar por nombre en el directorio (caso
              "me pasaron un hash mal copiado") y reportar sospecha de
              falsificación (caso "esto huele a fraude"). */}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Link
              to="/directorio"
              onClick={onClose}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-navy-500 ring-1 ring-navy-200 transition-colors hover:bg-navy-50 hover:ring-navy-300"
            >
              <SearchIcon className="h-3.5 w-3.5" />
              Buscar en el directorio
            </Link>
            <a
              href={
                'mailto:soporte@ancestralseed.com' +
                '?subject=Sospecha%20de%20falsificaci%C3%B3n%20de%20certificado' +
                '&body=Hola%2C%20intent%C3%A9%20verificar%20un%20certificado%20y%20no%20fue%20v%C3%A1lido.%20Detalles%3A%0A%0A'
              }
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-error-400 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-error-300"
            >
              <Flag className="h-3.5 w-3.5" />
              Reportar sospecha
            </a>
          </div>
        </div>
      )}

      {result.state === 'valid' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="relative mt-5 overflow-hidden rounded-3xl border border-success-400/40 bg-gradient-to-br from-success-200 via-white to-gold-100 p-5 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-400 text-white shadow-lg"
          >
            <ShieldCheck className="h-8 w-8" />
          </motion.div>
          <p className="mt-3 text-base font-bold text-success-400">
            ¡Certificado verificado!
          </p>
          <p className="mt-1 text-xs text-navy-300">
            Esta certificación es auténtica y está registrada en blockchain.
          </p>
          <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-3 text-left">
            <p className="text-[10px] uppercase tracking-widest text-navy-300">
              {result.cert.category}
            </p>
            <p className="mt-1 text-sm font-bold text-navy-500">
              {result.cert.title}
            </p>
            <p className="text-xs text-navy-300">
              Por {result.cert.authorName}
            </p>
          </div>
          <button
            onClick={() => navigate(`/certificado/${result.cert.slug}`)}
            className={cn(
              buttonVariants({ variant: 'navy', size: 'md' }),
              'mt-4 w-full',
            )}
          >
            Ver ficha pública
          </button>
        </motion.div>
      )}
    </ModalShell>
  )
}

/**
 * Tipos mínimos de la BarcodeDetector API (Chrome/Edge/Opera 83+).
 * No están en lib.dom.d.ts de TypeScript todavía.
 *
 * @see https://developer.mozilla.org/docs/Web/API/Barcode_Detection_API
 */
interface BarcodeDetectorResult {
  rawValue: string
  format: string
  boundingBox: DOMRectReadOnly
}
interface BarcodeDetectorInstance {
  detect: (
    image: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement | ImageBitmap,
  ) => Promise<BarcodeDetectorResult[]>
}
interface BarcodeDetectorConstructor {
  new (opts?: { formats?: string[] }): BarcodeDetectorInstance
}
declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor
  }
}

type QrState =
  | { kind: 'init' }
  | { kind: 'requesting-permission' }
  | { kind: 'scanning' }
  | { kind: 'denied' }
  | { kind: 'unsupported' }
  | { kind: 'error'; message: string }
  | { kind: 'verifying'; value: string }

/**
 * Fix #PUB-23 (auditoría UX): el modal anterior era placeholder
 * decorativo — no había cámara, no había escaneo, no había nada.
 * La promesa más rota del flujo público.
 *
 * Ahora usa la BarcodeDetector API nativa (Chrome 83+, Edge, Opera)
 * + getUserMedia para una cámara real. El frame se decodifica cada
 * ~300ms para no saturar el thread. Al detectar un QR válido, parseamos
 * el contenido (acepta slug, hash o URL completa del certificado) y
 * disparamos la verificación a través del mismo endpoint que usa el
 * HashModal.
 *
 * Browsers sin soporte (Safari < 17, Firefox): mensaje claro + opción
 * "Subir foto del QR" (que también usa BarcodeDetector sobre la imagen
 * cargada — pero ahí el fallback es más simple) + invitación a usar
 * "Ingresar Hash" como alternativa garantizada.
 */
function QrModal({
  onClose,
  setResult,
  onSwitchToHash,
}: {
  onClose: () => void
  setResult: (r: VerifyResult) => void
  onSwitchToHash: () => void
}) {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const detectorRef = useRef<BarcodeDetectorInstance | null>(null)
  const [state, setState] = useState<QrState>({ kind: 'init' })

  const isSupported = typeof window !== 'undefined' && !!window.BarcodeDetector

  /**
   * Parser robusto: lo que viene en un QR válido puede ser un slug,
   * un hash 0x..., o una URL completa
   * (https://soyalantapia.github.io/ancestral-seed-app/certificado/[slug]).
   * Extraemos lo verificable.
   */
  function extractToken(raw: string): string {
    const trimmed = raw.trim()
    // URL → buscar /certificado/[slug] al final
    const urlMatch = trimmed.match(/\/certificado\/([^/?#]+)/i)
    if (urlMatch) return urlMatch[1]
    return trimmed
  }

  function cleanup() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }

  async function verify(token: string) {
    setState({ kind: 'verifying', value: token })
    cleanup()
    try {
      const res = await api.verifyCertificate(token)
      if (res.valid && res.certification) {
        setResult({ state: 'valid', cert: res.certification })
        toast.success('Certificado verificado correctamente')
        onClose()
        // Llevamos al user directo a la ficha — es la acción que viene
        // a hacer después de escanear.
        navigate(`/certificado/${res.certification.slug}`)
      } else {
        setResult({ state: 'invalid' })
        toast.error('El QR escaneado no corresponde a un certificado válido')
        onClose()
      }
    } catch (e) {
      setResult({ state: 'invalid' })
      toast.error((e as Error).message)
      onClose()
    }
  }

  async function startScanning() {
    if (!isSupported) {
      setState({ kind: 'unsupported' })
      return
    }
    setState({ kind: 'requesting-permission' })
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      })
      streamRef.current = stream
      const video = videoRef.current
      if (!video) return
      video.srcObject = stream
      await video.play()
      detectorRef.current = new window.BarcodeDetector!({ formats: ['qr_code'] })
      setState({ kind: 'scanning' })

      // Loop de detección — ~3 frames/s es suficiente para QR estáticos.
      let lastDetectionAt = 0
      const tick = async (ts: number) => {
        if (ts - lastDetectionAt > 300 && detectorRef.current && video.readyState >= 2) {
          lastDetectionAt = ts
          try {
            const results = await detectorRef.current.detect(video)
            if (results.length > 0) {
              const token = extractToken(results[0].rawValue)
              await verify(token)
              return
            }
          } catch {
            /* frame no decodificable, intentar el siguiente */
          }
        }
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    } catch (err) {
      const e = err as DOMException
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setState({ kind: 'denied' })
      } else {
        setState({
          kind: 'error',
          message: e.message || 'No pudimos acceder a la cámara',
        })
      }
    }
  }

  // Fallback: subir foto del QR (también requiere BarcodeDetector
  // pero ahí solo hay que decodificar una imagen, no un video stream).
  async function handleFileUpload(file: File) {
    if (!isSupported) {
      toast.error(
        'Tu navegador no soporta lectura de QR. Probá Chrome o Edge, o ingresá el hash a mano.',
      )
      return
    }
    try {
      const bitmap = await createImageBitmap(file)
      const detector = new window.BarcodeDetector!({ formats: ['qr_code'] })
      const results = await detector.detect(bitmap)
      if (results.length === 0) {
        toast.error('No encontramos un QR en esa imagen')
        return
      }
      await verify(extractToken(results[0].rawValue))
    } catch (e) {
      toast.error('No pudimos leer la imagen: ' + (e as Error).message)
    }
  }

  // Auto-start al abrir el modal (si está soportado)
  useEffect(() => {
    if (isSupported) {
      void startScanning()
    } else {
      setState({ kind: 'unsupported' })
    }
    return cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ModalShell onClose={onClose}>
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-100 text-gold-700">
          <QrCode className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-navy-500">
          Escaneá el código QR
        </h2>
        <p className="mt-1 text-sm text-navy-300">
          {state.kind === 'scanning'
            ? 'Acercá el QR del certificado al marco'
            : state.kind === 'verifying'
              ? 'Verificando…'
              : 'Usá tu cámara para leer el QR'}
        </p>
      </div>

      {/* Container del video con marco superpuesto. Aspecto cuadrado
          como el placeholder anterior, pero ahora con feed real. */}
      <div className="relative mt-6 aspect-square overflow-hidden rounded-3xl bg-black">
        <video
          ref={videoRef}
          playsInline
          muted
          className={cn(
            'h-full w-full object-cover transition-opacity',
            state.kind === 'scanning' ? 'opacity-100' : 'opacity-0',
          )}
        />
        {/* Marco de escaneo + scanline animada cuando hay feed activo */}
        {state.kind === 'scanning' && (
          <>
            <div className="pointer-events-none absolute inset-6 rounded-2xl border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-x-6 h-0.5 bg-gold-400 shadow-[0_0_8px_rgba(212,175,55,0.8)]"
              initial={{ top: 24 }}
              animate={{ top: 'calc(100% - 24px - 2px)' }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
            />
          </>
        )}

        {/* Estados sin feed activo */}
        {state.kind !== 'scanning' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-100 p-6 text-center">
            {state.kind === 'init' && (
              <ScanLine className="h-12 w-12 text-navy-300" />
            )}
            {state.kind === 'requesting-permission' && (
              <>
                <Camera className="h-12 w-12 animate-pulse text-navy-300" />
                <p className="mt-3 text-sm text-navy-300">
                  Esperando permiso de cámara…
                </p>
              </>
            )}
            {state.kind === 'verifying' && (
              <>
                <Skeleton className="h-12 w-12 rounded-full" />
                <p className="mt-3 text-sm font-bold text-navy-500">
                  Verificando el QR…
                </p>
                <p className="mt-1 text-xs text-navy-300 break-all">
                  {state.value}
                </p>
              </>
            )}
            {state.kind === 'denied' && (
              <>
                <Camera className="h-10 w-10 text-error-400" />
                <p className="mt-3 text-sm font-bold text-navy-500">
                  Permiso de cámara denegado
                </p>
                <p className="mt-1 text-xs leading-relaxed text-navy-300">
                  Activá el acceso desde la configuración del navegador y
                  volvé a tocar el botón, o subí una foto del QR.
                </p>
              </>
            )}
            {state.kind === 'unsupported' && (
              <>
                <ScanLine className="h-10 w-10 text-navy-300" />
                <p className="mt-3 text-sm font-bold text-navy-500">
                  Tu navegador no escanea QR
                </p>
                {/* Fix V2-PUB-02 (auditoría v2): antes el copy sugería
                    "Subir foto del QR" como alternativa, pero esa
                    función TAMBIÉN usa BarcodeDetector y falla con el
                    mismo error. En Safari iOS quedaba en loop de
                    frustración. Ahora damos la única salida que SÍ
                    funciona (hash a mano) + tip específico para iOS. */}
                <p className="mt-1 text-xs leading-relaxed text-navy-300">
                  La lectura de QR requiere Chrome, Edge u Opera 83+.
                  Como tampoco vas a poder subir foto, ingresá el hash
                  del certificado a mano (lo encontrás bajo el QR).
                </p>
                {/^iPhone|iPad|iPod/.test(
                  typeof navigator !== 'undefined' ? navigator.platform : '',
                ) && (
                  <p className="mt-2 inline-flex max-w-[20rem] items-start gap-1.5 rounded-lg bg-info-100 px-2.5 py-1.5 text-[11px] leading-relaxed text-info-400">
                    Tip iOS: instalá Chrome desde la App Store y reabrí
                    este link — el escaneo funciona ahí.
                  </p>
                )}
              </>
            )}
            {state.kind === 'error' && (
              <>
                <ScanLine className="h-10 w-10 text-error-400" />
                <p className="mt-3 text-sm font-bold text-navy-500">
                  No pudimos abrir la cámara
                </p>
                <p className="mt-1 text-xs leading-relaxed text-navy-300">
                  {state.message}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Acciones siempre disponibles. La opción de subir foto es el
          fallback más útil porque sirve tanto para sin-cámara como
          para QR impreso que el user ya tiene en una foto.

          Fix V2-PUB-02 (auditoría v2): cuando el browser no soporta
          BarcodeDetector, la opción "Subir foto del QR" tampoco funciona
          (usa la misma API). Ocultarla evita el loop de frustración. */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        {state.kind !== 'unsupported' && (
          <label
            className={cn(
              buttonVariants({ variant: 'outlineNavy', size: 'md' }),
              'flex-1 cursor-pointer',
            )}
          >
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void handleFileUpload(f)
              }}
            />
            Subir foto del QR
          </label>
        )}
        {(state.kind === 'denied' ||
          state.kind === 'unsupported' ||
          state.kind === 'error') && (
          <Button
            variant="gold"
            size="md"
            onClick={onSwitchToHash}
            className="flex-1"
          >
            Ingresar hash a mano
          </Button>
        )}
        {state.kind === 'denied' && (
          <Button
            variant="navy"
            size="md"
            onClick={() => void startScanning()}
            className="flex-1"
          >
            Reintentar permiso
          </Button>
        )}
      </div>

      {state.kind === 'scanning' && (
        <p className="mt-3 text-center text-[11px] text-navy-300">
          Detección automática · si no responde, probá con buena luz o subí
          una foto.
        </p>
      )}
    </ModalShell>
  )
}


function ModalShell({
  children,
  onClose,
}: {
  children: React.ReactNode
  onClose: () => void
}) {
  useEscape(true, onClose)
  // Focus trap: el Tab queda atrapado dentro del modal, devolviendo el
  // foco al elemento previo al cerrarlo. UX estándar a11y.
  const trapRef = useFocusTrap<HTMLDivElement>(true)
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-500/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        ref={trapRef}
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl md:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-navy-300 transition-colors hover:bg-neutral-100 hover:text-navy-500"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </motion.div>
    </motion.div>
  )
}

function ProcessSteps() {
  const steps = [
    {
      num: '01',
      title: 'Elegí un método',
      copy: 'Escaneá el código QR o ingresá el ID/Hash para acceder al certificado.',
    },
    {
      num: '02',
      title: 'Validamos la información',
      copy: 'Confirmamos que los datos coincidan con los registros oficiales.',
    },
    {
      num: '03',
      title: 'Accedé al certificado',
      copy: 'Te mostramos la ficha pública del certificado en segundos.',
    },
  ]
  return (
    <section className="bg-white pb-16 md:pb-24">
      <div className="mx-auto max-w-[1100px] px-4 md:px-8">
        <p className="text-center text-xs uppercase tracking-[0.18em] text-navy-300">
          Paso a paso
        </p>
        <h2 className="mt-2 text-center text-2xl font-bold text-navy-500 md:text-[32px] md:leading-tight">
          Proceso de verificación
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-2">
          {steps.map((s, i) => (
            <div
              key={s.num}
              className="flex flex-col items-center text-center"
            >
              <div className="flex w-full items-center gap-3">
                <div className="hidden flex-1 md:block">
                  {i > 0 && (
                    <span className="block h-px w-full bg-gold-500" />
                  )}
                </div>
                <span className="text-3xl font-bold text-navy-500 leading-none">
                  {s.num}.
                </span>
                <div className="hidden flex-1 md:block">
                  {i < steps.length - 1 && (
                    <span className="block h-px w-full bg-gold-500" />
                  )}
                </div>
              </div>
              <p className="mt-4 font-bold text-navy-500">{s.title}</p>
              <p className="mt-1 max-w-[26ch] text-xs text-navy-300">{s.copy}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Link
            to="/directorio"
            className={cn(buttonVariants({ variant: 'outlineNavy', size: 'md' }))}
          >
            Volver al directorio
          </Link>
        </div>
      </div>
    </section>
  )
}
