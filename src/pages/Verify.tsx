import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Camera,
  FileCheck2,
  KeyRound,
  QrCode,
  ScanLine,
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

export default function Verify() {
  const [mode, setMode] = useState<Mode>(null)
  const [result, setResult] = useState<
    | { state: 'idle' }
    | { state: 'loading' }
    | { state: 'invalid' }
    | { state: 'valid'; cert: Certification }
  >({ state: 'idle' })

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
        {mode === 'qr' && <QrModal onClose={() => setMode(null)} />}
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
  result: any
  setResult: (r: any) => void
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
          Escribe o pega el código único del certificado.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="hashOrCode" className="sr-only">
            Hash o código
          </Label>
          <Input
            id="hashOrCode"
            placeholder="ID/Hash"
            {...register('hashOrCode')}
          />
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
        <div className="mt-5 rounded-2xl border border-error-300 bg-error-100 p-4 text-center">
          <p className="font-bold text-error-400">Certificado no válido</p>
          <p className="mt-1 text-xs text-error-400/80">
            No encontramos coincidencias o el certificado fue revocado.
          </p>
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

function QrModal({ onClose }: { onClose: () => void }) {
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
          Usá tu cámara para leer el QR
        </p>
      </div>

      <div className="mt-6 flex aspect-square items-center justify-center rounded-3xl border-2 border-dashed border-neutral-300 bg-neutral-100">
        <ScanLine className="h-12 w-12 text-navy-300" />
      </div>

      <ul className="mt-6 space-y-3 text-sm">
        <Step
          title="Activá la cámara"
          desc="Permití que el navegador use la cámara para escanear el código."
        />
        <Step
          title="Escaneá el QR"
          desc="Enfocá el código dentro del marco hasta que lo reconozcamos."
        />
        <Step
          title="¡Listo!"
          desc="Redirección automática al certificado."
        />
      </ul>
    </ModalShell>
  )
}

function Step({ title, desc }: { title: string; desc: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-navy-300">
        <ArrowRight className="h-4 w-4" />
      </span>
      <div>
        <p className="font-bold text-navy-500">{title}</p>
        <p className="text-xs text-navy-300">{desc}</p>
      </div>
    </li>
  )
}

function ModalShell({
  children,
  onClose,
}: {
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-500/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
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
