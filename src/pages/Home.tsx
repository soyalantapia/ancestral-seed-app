import { Link, useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  Eye,
  FileText,
  Leaf,
  Sparkles,
  Users,
} from 'lucide-react'
import { useFeaturedCertifications } from '@/hooks/useCertifications'
import { CertificationCard } from '@/components/features/CertificationCard'
import { PageMeta } from '@/components/features/PageMeta'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Accordion, type AccordionItem } from '@/components/ui/accordion'
import { cn } from '@/lib/utils'

export default function Home() {
  return (
    <>
      <PageMeta
        description="Validamos la autenticidad de productos y saberes originarios mediante certificación cultural, auditoría y tecnología blockchain. Encontrá artesanos y comunidades certificados en Latinoamérica."
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Ancestral Seed',
          description:
            'Plataforma de certificación digital de productos y saberes ancestrales.',
          url: 'https://soyalantapia.github.io/ancestral-seed-app/',
        }}
      />
      <Hero />
      <Pillars />
      <AncestralVision />
      <BlockchainSection />
      <ProcessSection />
      <FeaturedCertifications />
      <CTASection />
    </>
  )
}

function Hero() {
  const navigate = useNavigate()
  return (
    <section className="relative overflow-hidden bg-pattern-gold pb-16 pt-10 md:pb-24 md:pt-16">
      <div className="mx-auto max-w-[1320px] px-4 md:px-8">
        <div className="grid grid-cols-1 items-center gap-6 rounded-3xl bg-white p-6 shadow-md sm:p-8 md:min-h-[480px] md:gap-8 md:rounded-[32px] md:p-14 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full bg-gold-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-700 md:text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              Certificación cultural blockchain
            </span>
            <h1 className="mt-4 text-[28px] font-bold leading-[1.1] tracking-tight text-navy-500 sm:text-4xl md:mt-5 md:text-5xl lg:text-[56px]">
              Autenticidad ancestral,<br className="hidden md:inline" />{' '}
              certificada digitalmente
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-navy-300 sm:text-base md:mt-6 md:text-lg">
              Validamos la autenticidad de productos y saberes originarios
              mediante un sistema de certificación cultural, auditoría y
              tecnología blockchain.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:mt-8">
              <Button
                variant="gold"
                size="lg"
                onClick={() => navigate('/certificar')}
                className="w-full shadow-lg shadow-gold-500/30 sm:w-auto"
              >
                Certificar Producto
              </Button>
              <Button
                variant="outlineNavy"
                size="lg"
                onClick={() => navigate('/verificar')}
                className="w-full sm:w-auto"
              >
                Verificar Certificado
              </Button>
            </div>
          </div>
          <div className="flex justify-center lg:col-span-5">
            <img
              src={`${import.meta.env.BASE_URL}logo-large.webp`}
              alt="Ancestral Seed"
              className="h-44 w-44 object-contain sm:h-56 sm:w-56 md:h-80 md:w-80 lg:h-96 lg:w-96"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function Pillars() {
  const pillars = [
    {
      icon: Leaf,
      title: 'Saber ancestral',
      copy: 'Documentamos técnicas y oficios transmitidos por generaciones.',
    },
    {
      icon: CheckCircle2,
      title: 'Auditoría cultural',
      copy: 'Validamos con curadores expertos en cada territorio.',
    },
    {
      icon: Eye,
      title: 'Transparencia total',
      copy: 'Certificados públicos con trazabilidad completa.',
    },
    {
      icon: Users,
      title: 'Comunidad protegida',
      copy: 'Reconocimiento y defensa frente al fraude cultural.',
    },
  ]
  return (
    <section id="beneficios" className="scroll-mt-24 bg-white">
      <div className="mx-auto grid max-w-[1320px] grid-cols-2 gap-6 px-4 py-12 sm:gap-8 md:grid-cols-4 md:px-8 md:py-16">
        {pillars.map((p, i) => (
          <div key={i} className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-100">
              <p.icon className="h-6 w-6 text-gold-700" strokeWidth={1.75} />
            </div>
            <h3 className="mt-4 text-base font-bold text-navy-500">{p.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-navy-300 md:text-sm">
              {p.copy}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

function AncestralVision() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1320px] px-4 pb-16 md:px-8 md:pb-20">
        <div className="text-center">
          <p className="inline-flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-navy-300">
            <Sparkles className="h-3.5 w-3.5 text-gold-500" />
            Sobre nosotros
          </p>
          <h2 className="mt-2 text-2xl font-bold text-navy-500 md:text-[32px] md:leading-tight">
            La mirada ancestral que nos guía
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="overflow-hidden rounded-3xl">
            <img
              src={`${import.meta.env.BASE_URL}hero-image.webp`}
              alt="Ceremonia ancestral"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="rounded-3xl bg-pattern-aztec p-6 text-white sm:p-8 md:p-10">
            <p className="text-sm leading-relaxed text-neutral-300 md:text-base">
              Durante siglos, los saberes de nuestras comunidades originarias
              se transmitieron de generación en generación sin un registro que
              los protegiera frente al fraude, la apropiación o el olvido.
            </p>
            <p className="mt-5 text-sm leading-relaxed text-neutral-300 md:text-base">
              Ancestral Seed nace de una mirada compartida: documentar,
              validar y proteger el origen de los productos y prácticas
              ancestrales, devolviendo a sus creadores el reconocimiento que
              les corresponde.
            </p>
            <p className="mt-5 text-sm leading-relaxed text-neutral-300 md:text-base">
              Trabajamos junto a curadores, auditores y referentes
              territoriales para que cada certificación cuente con el respaldo
              de la comunidad y la transparencia de la blockchain.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function BlockchainSection() {
  const items: AccordionItem[] = [
    {
      id: 'q1',
      question: '¿Qué es la blockchain? (explicado con un cuaderno)',
      answer: (
        <>
          <p>
            Imaginá un <strong>cuaderno gigante</strong> que se copia y comparte
            entre miles de computadoras alrededor del mundo, al mismo tiempo.
            Cuando alguien escribe algo en él —por ejemplo,{' '}
            <em>"este tejido es de la comunidad Pasto"</em>— todos los
            cuadernos lo registran a la vez.
          </p>
          <p className="mt-3">
            Si después alguien quisiera cambiar lo escrito, los demás cuadernos
            no aceptan el cambio porque no coinciden. Por eso, lo que queda
            anotado ahí <strong>no se puede borrar, mover ni modificar</strong>
            , ni siquiera por nosotros.
          </p>
          <p className="mt-3 rounded-2xl bg-gold-100/60 px-4 py-3 text-xs text-navy-500 md:text-sm">
            💡 En resumen: es como un libro de actas público, escrito a fuego,
            que está en miles de lugares a la vez.
          </p>
        </>
      ),
    },
    {
      id: 'q2',
      question: '¿Y qué tiene que ver con tu certificación?',
      answer: (
        <>
          <p>
            Cuando una comunidad o un autor recibe su certificado de Ancestral
            Seed, <strong>nosotros dejamos una huella en ese cuaderno mundial</strong>.
            En esa huella queda escrito:
          </p>
          <ul className="mt-3 space-y-2">
            <li className="flex gap-2">
              <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
              <span>Quién hizo el producto, saber o práctica</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
              <span>De qué comunidad y región viene</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
              <span>La fecha exacta en que se certificó</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
              <span>
                Un código único —como una matrícula— imposible de copiar
              </span>
            </li>
          </ul>
          <p className="mt-3">
            Cualquier persona, en cualquier parte del mundo, puede revisar esa
            huella y confirmar que el certificado es de verdad.
          </p>
        </>
      ),
    },
    {
      id: 'q3',
      question: '¿Por qué esto es tan importante?',
      answer: (
        <>
          <p>Porque te da cuatro cosas que antes eran imposibles:</p>
          <ul className="mt-3 space-y-3">
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-navy-500">
                1
              </span>
              <span>
                <strong className="text-navy-500">Nadie puede falsificarlo.</strong>{' '}
                Ni la competencia, ni un revendedor, ni siquiera nosotros.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-navy-500">
                2
              </span>
              <span>
                <strong className="text-navy-500">Cualquiera puede verificarlo.</strong>{' '}
                Sin pedir permiso, sin pagar y sin tener cuenta en nuestra
                plataforma.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-navy-500">
                3
              </span>
              <span>
                <strong className="text-navy-500">No depende de nosotros.</strong>{' '}
                Aunque mañana Ancestral Seed dejara de existir, tu certificado
                sigue vivo en la red.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-navy-500">
                4
              </span>
              <span>
                <strong className="text-navy-500">Queda para siempre.</strong>{' '}
                No hay forma de borrarlo, perderlo, ni "que se caiga el
                sistema".
              </span>
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'q4',
      question: '¿Y qué cambia esto para las comunidades?',
      answer: (
        <>
          <p>
            Durante siglos, los saberes y oficios ancestrales fueron copiados,
            vendidos sin permiso o atribuidos a otros. Sin una prueba pública,
            era muy difícil reclamar autoría.
          </p>
          <p className="mt-3">
            Con un certificado en blockchain, tu comunidad tiene{' '}
            <strong>una prueba pública e imborrable</strong> de que ese saber,
            ese producto o esa práctica son tuyos. Y eso abre la puerta a:
          </p>
          <ul className="mt-3 space-y-2">
            <li className="flex gap-2">
              <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
              <span>Defender tu autoría frente a copias o plagios</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
              <span>Vender en mercados que exigen origen verificado</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
              <span>Ponerle valor justo a tu trabajo y tradición</span>
            </li>
          </ul>
          <p className="mt-3 rounded-2xl bg-gold-100/60 px-4 py-3 text-xs italic text-navy-500 md:text-sm">
            Es como tener tu firma escrita a fuego en un libro que todo el
            mundo puede leer, pero nadie puede arrancar.
          </p>
        </>
      ),
    },
  ]
  return (
    <section id="como-funciona" className="scroll-mt-24 bg-white">
      <div className="mx-auto max-w-[1320px] px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-navy-300">
            <Sparkles className="h-3.5 w-3.5 text-gold-500" />
            Blockchain explicada simple
          </p>
          <h2 className="mt-2 text-2xl font-bold text-navy-500 md:text-[32px] md:leading-tight">
            Cómo protegemos lo que es tuyo, para que nadie pueda copiarlo
          </h2>
          <p className="mx-auto mt-4 text-sm leading-relaxed text-navy-300 md:text-base">
            Usamos una tecnología llamada <strong>blockchain</strong> para que
            tu certificado quede registrado de forma pública y permanente. Te
            la explicamos sin tecnicismos.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <Accordion items={items} />
          <div className="relative h-[420px] hidden lg:block">
            <div className="absolute left-0 top-0 h-64 w-80 overflow-hidden rounded-3xl shadow-xl">
              <img
                src={`${import.meta.env.BASE_URL}blockchain-1.webp`}
                alt="Comunidad ancestral compartiendo saberes"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute right-4 bottom-0 h-56 w-72 overflow-hidden rounded-3xl border-4 border-white shadow-2xl">
              <img
                src={`${import.meta.env.BASE_URL}blockchain-2.webp`}
                alt="Producto ancestral certificado"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:hidden">
            <img
              src={`${import.meta.env.BASE_URL}blockchain-1.webp`}
              alt=""
              className="aspect-square rounded-2xl object-cover"
            />
            <img
              src={`${import.meta.env.BASE_URL}blockchain-2.webp`}
              alt=""
              className="aspect-square rounded-2xl object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function ProcessSection() {
  const steps = [
    {
      num: '1',
      title: 'Elegí un método',
      copy: 'Escaneá el código QR o ingresá el ID/Hash para acceder al certificado.',
    },
    {
      num: '2',
      title: 'Validamos la información',
      copy: 'Confirmamos que los datos coincidan con los registros oficiales.',
    },
    {
      num: '3',
      title: 'Accedé al certificado',
      copy: 'Te mostramos la ficha pública del certificado en segundos.',
    },
  ]
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1320px] px-4 pb-16 md:px-8 md:pb-20">
        <div className="text-center">
          <p className="inline-flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-navy-300">
            <Sparkles className="h-3.5 w-3.5 text-gold-500" />
            ¿Cómo funciona?
          </p>
          <h2 className="mt-2 text-2xl font-bold text-navy-500 md:text-[32px] md:leading-tight">
            Proceso de Verificación
          </h2>
        </div>
        <div className="mt-10 rounded-3xl bg-pattern-aztec p-6 md:p-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-4">
            {steps.map((s, i) => (
              <div
                key={s.num}
                className={cn(
                  'flex flex-col items-center text-center md:items-start md:text-left md:px-4',
                  i > 0 && 'md:border-l md:border-navy-300/40',
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-500 text-base font-bold text-navy-500">
                  {s.num}
                </div>
                <p className="mt-4 text-base font-bold text-white">
                  {s.title}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-neutral-400 md:text-sm">
                  {s.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturedCertifications() {
  const { data, isLoading, error } = useFeaturedCertifications()
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1320px] px-4 pb-16 md:px-8 md:pb-20">
        <div className="text-center">
          <p className="inline-flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-navy-300">
            <FileText className="h-3.5 w-3.5 text-gold-500" />
            Directorio de Certificaciones
          </p>
          <h2 className="mt-2 text-2xl font-bold text-navy-500 md:text-[32px] md:leading-tight">
            Productos y servicios certificados
          </h2>
        </div>

        {isLoading && (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/3] w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-9 w-32" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-10 rounded-2xl border border-error-300 bg-error-100 p-6 text-center text-error-400">
            <p className="font-semibold">No pudimos cargar los certificados</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        )}

        {data && (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {data.map((c) => (
              <CertificationCard key={c.id} certification={c} />
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Link
            to="/directorio"
            className={cn(buttonVariants({ variant: 'gold', size: 'md' }))}
          >
            Ver todos los certificados
          </Link>
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="px-4 pb-16 md:px-8 md:pb-20">
      <div className="relative mx-auto max-w-[1320px] overflow-hidden rounded-3xl shadow-xl">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${import.meta.env.BASE_URL}methodology-bg.webp')`,
          }}
        />
        <div className="absolute inset-0 bg-navy-500/70" />
        <div className="relative z-10 flex flex-col items-center px-6 py-14 text-center text-white md:px-12 md:py-20">
          <h3 className="text-2xl font-bold md:text-3xl lg:text-[32px]">
            Comienza tu certificación ancestral
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-200 md:text-base">
            Te acompañamos en todo el proceso con guías, videos y soporte
            personalizado.
          </p>
          <Link
            to="/certificar"
            className={cn(
              buttonVariants({ variant: 'gold', size: 'lg' }),
              'mt-7 shadow-lg shadow-black/30',
            )}
          >
            Certificar Producto
          </Link>
        </div>
      </div>
    </section>
  )
}
