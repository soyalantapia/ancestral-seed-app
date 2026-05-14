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
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Accordion, type AccordionItem } from '@/components/ui/accordion'
import { cn } from '@/lib/utils'

export default function Home() {
  return (
    <>
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
        <div className="grid grid-cols-1 items-center gap-8 rounded-[32px] bg-white p-8 shadow-md md:min-h-[480px] md:p-14 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gold-700">
              <Sparkles className="h-3.5 w-3.5" />
              Certificación cultural blockchain
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight text-navy-500 md:text-5xl lg:text-[56px]">
              Autenticidad ancestral,<br className="hidden md:inline" />{' '}
              certificada digitalmente
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-navy-300 md:text-lg">
              Validamos la autenticidad de productos y saberes originarios
              mediante un sistema de certificación cultural, auditoría y
              tecnología blockchain.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                variant="gold"
                size="lg"
                onClick={() => navigate('/certificar')}
                className="shadow-lg shadow-gold-500/30"
              >
                Certificar Producto
              </Button>
              <Button
                variant="outlineNavy"
                size="lg"
                onClick={() => navigate('/verificar')}
              >
                Verificar Certificado
              </Button>
            </div>
          </div>
          <div className="flex justify-center lg:col-span-5">
            <img
              src={`${import.meta.env.BASE_URL}logo-large.png`}
              alt="Ancestral Seed"
              className="h-64 w-64 object-contain md:h-80 md:w-80 lg:h-96 lg:w-96"
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
      <div className="mx-auto grid max-w-[1320px] grid-cols-2 gap-8 px-4 py-14 md:grid-cols-4 md:px-8 md:py-16">
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
              src={`${import.meta.env.BASE_URL}hero-image.png`}
              alt="Ceremonia ancestral"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="rounded-3xl bg-pattern-aztec p-8 text-white md:p-10">
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
      question: '¿Qué es la blockchain?',
      answer:
        'Un registro distribuido e inmutable que garantiza que la información del certificado no pueda alterarse después de emitida.',
    },
    {
      id: 'q2',
      question: '¿Qué rol cumple la blockchain en las certificaciones?',
      answer:
        'Cada certificado se firma digitalmente y se registra en la red, generando un hash único verificable por cualquiera.',
    },
    {
      id: 'q3',
      question: '¿Qué asegura esta tecnología?',
      answer:
        'Trazabilidad completa, transparencia y resistencia a la manipulación: lo que se publica queda público y verificable para siempre.',
    },
    {
      id: 'q4',
      question: '¿Qué significa esto para las comunidades?',
      answer:
        'Reconocimiento, protección frente al fraude y una herramienta para defender el origen y la autoría de su saber.',
    },
  ]
  return (
    <section id="como-funciona" className="scroll-mt-24 bg-white">
      <div className="mx-auto max-w-[1320px] px-4 py-16 md:px-8 md:py-20">
        <div className="text-center">
          <p className="inline-flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-navy-300">
            <Sparkles className="h-3.5 w-3.5 text-gold-500" />
            ¿Cómo cuidamos la autenticidad?
          </p>
          <h2 className="mt-2 text-2xl font-bold text-navy-500 md:text-[32px] md:leading-tight">
            Blockchain para certificaciones confiables y transparentes
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <Accordion items={items} />
          <div className="relative h-[420px] hidden lg:block">
            <div className="absolute left-0 top-0 h-64 w-80 overflow-hidden rounded-3xl shadow-xl">
              <img
                src={`${import.meta.env.BASE_URL}blockchain-1.png`}
                alt="Comunidad ancestral compartiendo saberes"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute right-4 bottom-0 h-56 w-72 overflow-hidden rounded-3xl border-4 border-white shadow-2xl">
              <img
                src={`${import.meta.env.BASE_URL}blockchain-2.png`}
                alt="Producto ancestral certificado"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:hidden">
            <img
              src={`${import.meta.env.BASE_URL}blockchain-1.png`}
              alt=""
              className="aspect-square rounded-2xl object-cover"
            />
            <img
              src={`${import.meta.env.BASE_URL}blockchain-2.png`}
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
            backgroundImage: `url('${import.meta.env.BASE_URL}methodology-bg.jpg')`,
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
