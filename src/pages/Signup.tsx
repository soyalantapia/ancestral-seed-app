import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Check, Eye, EyeOff, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/features/Logo'
import { useAuthStore } from '@/store/auth'

const schema = z
  .object({
    name: z.string().min(2, 'Tu nombre completo'),
    email: z.string().email('Email inválido'),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Al menos una mayúscula')
      .regex(/\d/, 'Al menos un número'),
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, { message: 'Tenés que aceptar los términos' }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export default function Signup() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const [show, setShow] = useState(false)
  const [show2, setShow2] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema), mode: 'onChange' })

  const password = watch('password') ?? ''
  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    digit: /\d/.test(password),
  }

  const onSubmit = async (data: FormData) => {
    // Demo: simulate account creation + auto login
    await new Promise((r) => setTimeout(r, 600))
    setSession(
      {
        id: 'u-new',
        email: data.email,
        name: data.name,
        avatarUrl: undefined,
      },
      'demo-token',
    )
    toast.success('Cuenta creada · Bienvenida 👋')
    navigate('/inicio')
  }

  return (
    <section className="relative min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] overflow-hidden bg-pattern-gold">
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] max-w-[1100px] items-center px-4 py-12 md:px-8">
        <div className="grid w-full grid-cols-1 overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">
          <aside className="relative hidden flex-col items-center justify-center overflow-hidden bg-pattern-aztec p-10 text-center md:flex">
            <Logo variant="light" layout="vertical" markClassName="h-24 w-24" />
            <p className="mt-6 text-sm leading-relaxed text-neutral-300">
              Sumate a Ancestral Seed y certificá la autenticidad de tus saberes
              y productos ancestrales.
            </p>
          </aside>

          <div className="p-8 md:p-12">
            <div className="md:hidden">
              <Logo layout="vertical" markClassName="h-16 w-16" className="mx-auto" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-navy-500 md:mt-0 md:text-3xl">
              Crear cuenta
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-navy-300">
              Empezá a gestionar tus certificaciones, perfil público y trazabilidad.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="name">Nombre y apellido</Label>
                <Input
                  id="name"
                  placeholder="Ej. Camila Montes"
                  className="mt-2"
                  autoComplete="name"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="mt-1 text-xs font-medium text-error-400">{errors.name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  className="mt-2"
                  autoComplete="email"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="mt-1 text-xs font-medium text-error-400">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative mt-2">
                  <Input
                    id="password"
                    type={show ? 'text' : 'password'}
                    autoComplete="new-password"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-navy-300 hover:bg-neutral-200"
                    aria-label={show ? 'Ocultar' : 'Mostrar'}
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <ul className="mt-2 grid grid-cols-3 gap-1 text-[11px]">
                  <Check_ ok={checks.length} label="8+ caracteres" />
                  <Check_ ok={checks.upper} label="Una mayúscula" />
                  <Check_ ok={checks.digit} label="Un número" />
                </ul>
                {errors.password && (
                  <p className="mt-1 text-xs font-medium text-error-400">{errors.password.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Repetir contraseña</Label>
                <div className="relative mt-2">
                  <Input
                    id="confirmPassword"
                    type={show2 ? 'text' : 'password'}
                    autoComplete="new-password"
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShow2((s) => !s)}
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-navy-300 hover:bg-neutral-200"
                    aria-label={show2 ? 'Ocultar' : 'Mostrar'}
                  >
                    {show2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs font-medium text-error-400">{errors.confirmPassword.message}</p>
                )}
              </div>

              <label className="flex cursor-pointer items-start gap-2 rounded-2xl border border-neutral-200 bg-gold-100/30 p-3 text-xs text-navy-300">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-neutral-400 text-gold-500 focus:ring-gold-500"
                  {...register('acceptTerms')}
                />
                <span>
                  Acepto los{' '}
                  <Link to="/" className="font-semibold text-gold-700 hover:underline">
                    términos y condiciones
                  </Link>
                  {' '}y la{' '}
                  <Link to="/" className="font-semibold text-gold-700 hover:underline">
                    política de privacidad
                  </Link>.
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="text-xs font-medium text-error-400">{errors.acceptTerms.message}</p>
              )}

              <Button type="submit" variant="navy" size="lg" className="w-full" disabled={isSubmitting}>
                <Mail className="h-4 w-4" />
                {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-navy-300">
              ¿Ya tenés cuenta?{' '}
              <Link to="/login" className="font-semibold text-gold-700 hover:underline">
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function Check_({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li
      className={
        ok
          ? 'flex items-center gap-1 rounded-full bg-success-100 px-2 py-1 font-semibold text-success-300'
          : 'flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-1 text-navy-300'
      }
    >
      <Check className={ok ? 'h-3 w-3' : 'h-3 w-3 opacity-30'} />
      {label}
    </li>
  )
}
