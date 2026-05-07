import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
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
      navigate(`/perfil/${res.user.authorSlug ?? ''}`)
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <section className="relative min-h-[80vh] overflow-hidden bg-pattern-gold py-12">
      <div className="relative mx-auto grid max-w-[1100px] grid-cols-1 gap-8 px-4 md:px-8 lg:grid-cols-12 lg:items-center">
        <motion.aside
          initial={false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden flex-col justify-center gap-6 lg:col-span-5 lg:flex"
        >
          <Logo />
          <h2 className="text-3xl font-extrabold leading-tight text-navy-500">
            Tu panel para gestionar certificaciones ancestrales
          </h2>
          <ul className="space-y-3 text-sm text-navy-300">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gold-500" />
              Visualizá el estado de cada certificado.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gold-500" />
              Compartí enlaces y QR auténticos.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gold-500" />
              Cargá nuevas solicitudes de certificación.
            </li>
          </ul>
        </motion.aside>

        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-xl md:p-12 lg:col-span-7"
        >
          <div className="text-center">
            <div className="mx-auto lg:hidden">
              <Logo />
            </div>
            <h1 className="mt-4 text-2xl font-extrabold text-navy-500 md:text-3xl">
              Iniciar sesión
            </h1>
            <p className="mt-2 text-sm text-navy-300">
              Ingresá a tu cuenta para gestionar tu perfil público y seguir el
              estado de tus certificaciones.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
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
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-navy-300 hover:bg-neutral-200"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs font-medium text-error-400">
                  {errors.password.message}
                </p>
              )}
              <Link
                to="/"
                className="mt-2 block text-right text-xs font-semibold text-gold-700 hover:underline"
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

          <p className="mt-6 text-center text-xs text-navy-300">
            ¿Todavía no tenés cuenta?{' '}
            <Link to="/" className="font-semibold text-gold-700 hover:underline">
              Solicitá una invitación
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
