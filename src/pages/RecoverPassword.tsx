import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, KeyRound, Mail, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/features/Logo'

const schema = z.object({ email: z.string().email('Email inválido') })
type FormData = z.infer<typeof schema>

export default function RecoverPassword() {
  const [sent, setSent] = useState(false)
  const [email, setEmail] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 500))
    setEmail(data.email)
    setSent(true)
  }

  return (
    <section className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-pattern-gold">
      <div className="relative mx-auto flex min-h-[calc(100vh-80px)] max-w-[1100px] items-center px-4 py-12 md:px-8">
        <div className="grid w-full grid-cols-1 overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">
          <aside className="relative hidden flex-col items-center justify-center overflow-hidden bg-pattern-aztec p-10 text-center md:flex">
            <Logo variant="light" layout="vertical" markClassName="h-24 w-24" />
            <p className="mt-6 text-sm leading-relaxed text-neutral-300">
              Te ayudamos a recuperar el acceso a tu cuenta de Ancestral Seed.
            </p>
          </aside>

          <div className="p-8 md:p-12">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-300 hover:text-navy-500"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al login
            </Link>

            {!sent ? (
              <>
                <div className="mt-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-100 text-gold-700">
                  <KeyRound className="h-6 w-6" />
                </div>
                <h1 className="mt-4 text-2xl font-bold text-navy-500 md:text-3xl">
                  Recuperar contraseña
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-navy-300">
                  Ingresá el email asociado a tu cuenta. Te enviamos un link para
                  restablecer tu contraseña.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
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
                  <Button
                    type="submit"
                    variant="navy"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    <Mail className="h-4 w-4" />
                    {isSubmitting ? 'Enviando…' : 'Enviar link de recuperación'}
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-navy-300">
                  ¿Recordaste tu contraseña?{' '}
                  <Link to="/login" className="font-semibold text-gold-700 hover:underline">
                    Iniciar sesión
                  </Link>
                </p>
              </>
            ) : (
              <div className="mt-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-300 text-white shadow-lg">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h1 className="mt-5 text-2xl font-bold text-navy-500 md:text-3xl">
                  Revisá tu casilla
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-navy-300">
                  Si <strong className="text-navy-500">{email}</strong> está
                  asociado a una cuenta, vas a recibir un email con instrucciones
                  para restablecer tu contraseña en los próximos minutos.
                </p>
                <div className="mt-6 rounded-2xl bg-info-100 px-4 py-3 text-left text-xs text-navy-500 ring-1 ring-info-200">
                  <p className="font-bold">¿No te llega?</p>
                  <ul className="mt-1.5 space-y-1 text-navy-300">
                    <li>· Revisá la carpeta de spam o correos no deseados</li>
                    <li>· Esperá unos minutos antes de reintentar</li>
                    <li>· Confirmá que el email esté bien escrito</li>
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="mt-6 text-sm font-semibold text-gold-700 hover:underline"
                >
                  Probar con otro email
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
