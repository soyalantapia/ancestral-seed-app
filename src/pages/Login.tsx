import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/features/Logo'
import { api } from '@/services/api'
import { useAuthStore } from '@/store/auth'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type FormData = z.infer<typeof schema>

export default function Login() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.login(data)
      setSession(res.user, res.token)
      toast.success('¡Bienvenida de vuelta!')
      navigate('/inicio')
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <section className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-pattern-gold">
      <div className="relative mx-auto flex min-h-[calc(100vh-80px)] max-w-[1100px] items-center px-4 py-12 md:px-8">
        <div className="grid w-full grid-cols-1 overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">
          <aside className="relative hidden flex-col items-center justify-center overflow-hidden bg-pattern-aztec p-10 text-center md:flex">
            <Logo variant="light" layout="vertical" markClassName="h-24 w-24" />
          </aside>

          <div className="p-8 md:p-12">
            <div className="md:hidden">
              <Logo layout="vertical" markClassName="h-16 w-16" className="mx-auto" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-navy-500 md:mt-0 md:text-3xl">
              Iniciar sesión
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-navy-300">
              Ingresa a tu cuenta para gestionar tu perfil público y seguir el
              estado de tus certificaciones.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder=""
                  className="mt-2"
                  autoComplete="email"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="mt-1 text-xs font-medium text-error-400">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative mt-2">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder=""
                    autoComplete="current-password"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-navy-300 hover:bg-neutral-200"
                    aria-label={
                      showPassword
                        ? 'Ocultar contraseña'
                        : 'Mostrar contraseña'
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs font-medium text-error-400">
                    {errors.password.message}
                  </p>
                )}
                <Link
                  to="/recuperar"
                  className="mt-2 block text-right text-xs text-navy-300 hover:text-gold-700"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Button
                type="submit"
                variant="navy"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Ingresando…' : 'Iniciar sesión'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-navy-300">
              ¿No tenés cuenta?{' '}
              <Link
                to="/registro"
                className="font-semibold text-gold-700 hover:underline"
              >
                Crear cuenta
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="mx-auto grid max-w-[1320px] grid-cols-2 gap-8 px-4 py-10 md:grid-cols-4 md:px-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="text-xs leading-relaxed text-navy-300">
              <p className="font-semibold text-navy-500">Lorem ipsum</p>
              <p className="mt-2">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
