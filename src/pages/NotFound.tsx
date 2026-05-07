import { Link } from 'react-router-dom'
import { Sprout } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-pattern-gold px-6 text-center">
      <div className="rounded-3xl border border-neutral-200 bg-white px-8 py-12 shadow-xl md:px-16 md:py-16">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-100 text-gold-700">
          <Sprout className="h-8 w-8" />
        </div>
        <p className="mt-6 text-sm uppercase tracking-[0.32em] text-gold-700">
          404
        </p>
        <h1 className="mt-3 text-3xl font-bold text-navy-500 md:text-4xl">
          Esta semilla no germinó
        </h1>
        <p className="mt-3 max-w-md text-sm text-navy-300">
          La página que buscás no existe o se movió. Volvé al directorio para
          seguir explorando saberes ancestrales.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className={cn(buttonVariants({ variant: 'gold', size: 'lg' }))}
          >
            Volver al inicio
          </Link>
          <Link
            to="/directorio"
            className={cn(
              buttonVariants({ variant: 'outlineNavy', size: 'lg' }),
            )}
          >
            Ver directorio
          </Link>
        </div>
      </div>
    </main>
  )
}
