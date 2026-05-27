import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  Eye,
  FileText,
  Globe2,
  Languages,
  Leaf,
  MapPin,
  Play,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react'

// Mapa LATAM lazy-loaded — react-simple-maps + d3-geo + topojson son
// ~265KB y están debajo del fold. Solo bajamos el chunk cuando el user
// scrollea cerca de la sección (IntersectionObserver).
const LatamWorldMap = lazy(
  () => import('@/components/features/LatamWorldMap'),
)
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
      <LandingNav />
      <Pillars />
      <LatamAlMundo />
      <AncestralVision />
      <BlockchainSection />
      <ProcessSection />
      <FeaturedCertifications />
      <CTASection />
    </>
  )
}

/**
 * Sub-nav sticky de la landing con scrollspy.
 * Se mantiene fijo debajo del header principal (top-16 mobile, top-20 desktop).
 * Las pestañas hacen smooth-scroll a las secciones y la activa se marca
 * con underline dorado vía IntersectionObserver.
 */
const LANDING_SECTIONS = [
  { id: 'beneficios', label: 'Beneficios' },
  { id: 'latam-al-mundo', label: 'LATAM al mundo' },
  { id: 'nosotros', label: 'Nosotros' },
  { id: 'como-funciona', label: 'Blockchain' },
  { id: 'proceso', label: 'Proceso' },
  { id: 'certificados', label: 'Certificados' },
] as const

function LandingNav() {
  const [active, setActive] = useState<string>('beneficios')

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    LANDING_SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id)
      if (!el) return
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setActive(s.id)
          })
        },
        // Section se considera "activa" cuando ocupa el tercio superior
        // del viewport (debajo del header sticky).
        { rootMargin: '-30% 0% -60% 0%', threshold: 0 },
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [])

  const handleClick = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    // Actualizar hash sin que el browser haga jump (scrollIntoView ya animó)
    history.replaceState(null, '', `#${id}`)
  }

  return (
    <div className="sticky top-16 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 md:hidden">
      <nav
        aria-label="Secciones de la portada"
        className="mx-auto max-w-[1320px] overflow-x-auto px-4 md:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <ul className="flex items-center gap-0">
          {LANDING_SECTIONS.map((s) => {
            const isActive = active === s.id
            return (
              <li key={s.id} className="shrink-0">
                <a
                  href={`#${s.id}`}
                  onClick={handleClick(s.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className={cn(
                    'relative inline-flex h-12 items-center whitespace-nowrap px-3 text-sm font-semibold transition-colors sm:px-4 md:h-14',
                    isActive
                      ? 'text-navy-500'
                      : 'text-navy-300 hover:text-navy-500',
                  )}
                >
                  {s.label}
                  <span
                    className={cn(
                      'absolute inset-x-3 bottom-0 h-0.5 bg-gold-500 transition-opacity sm:inset-x-4',
                      isActive ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
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
            <h1 className="mt-4 text-[28px] font-bold leading-[1.15] tracking-tight text-navy-500 sm:text-4xl md:mt-5 md:text-5xl lg:text-[56px]">
              <span className="block">Autenticidad Ancestral</span>
              <span className="block">Certificada Digitalmente</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-navy-300 sm:text-base md:mt-6 md:text-lg">
              Validamos la autenticidad de productos, servicios y saberes
              ancestrales, mediante un sistema de certificación cultural,
              auditoría y tecnología blockchain.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:mt-8">
              {/* Una sola CTA primaria — reduce decisión. Verificar queda
                  como link ghost para usuarios que vienen con un QR. */}
              <Button
                variant="gold"
                size="lg"
                onClick={() => navigate('/certificar')}
                className="w-full shadow-lg shadow-gold-500/30 sm:w-auto"
              >
                Certificar Producto
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => navigate('/verificar')}
                className="w-full text-navy-500 underline-offset-4 hover:bg-transparent hover:text-gold-700 hover:underline sm:w-auto"
              >
                o verificar un certificado existente
              </Button>
            </div>
          </div>
          <div className="flex justify-center lg:col-span-5">
            <HeroVideoPlaceholder />
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Hero del Home: card con logo chico arriba como anchor de marca + área grande
 * para el video institucional de 1 minuto. Mientras no haya video subido,
 * muestra un placeholder con poster del logo + botón Play centrado.
 *
 * Cuando se suba el video real, reemplazar el bloque <button> placeholder por
 * un <video> con poster y controls, o un wrapper con onClick que dispare un
 * modal/lightbox con el mp4.
 */
function HeroVideoPlaceholder() {
  return (
    <div className="flex w-full flex-col items-center gap-4 lg:gap-5">
      <button
        type="button"
        aria-label="Reproducir video institucional de 1 minuto"
        className="group relative aspect-video w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-br from-navy-500 to-navy-400 shadow-lg transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
        onClick={() => {
          // Placeholder: cuando esté el video, abrir modal con <video controls autoplay>
          // o reemplazar este botón por <video src="..." controls poster="..." />
        }}
      >
        {/* Pattern decorativo de fondo (aztec style) */}
        <div className="absolute inset-0 bg-pattern-aztec opacity-30" aria-hidden />
        {/* Overlay degradado para legibilidad del play button */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-500/60 to-transparent" aria-hidden />

        {/* Play button centrado */}
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-500 text-navy-500 shadow-xl transition-transform group-hover:scale-110 md:h-20 md:w-20">
            <Play className="h-7 w-7 translate-x-0.5 fill-current md:h-9 md:w-9" />
          </span>
          <span className="text-xs font-bold uppercase tracking-widest opacity-90 md:text-sm">
            Mirá el video · 1 min
          </span>
        </span>
      </button>
    </div>
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
      copy: 'Validamos con auditores expertos en cada territorio.',
    },
    {
      icon: Eye,
      title: 'Transparencia total',
      copy: 'Certificados públicos con trazabilidad completa.',
    },
    {
      icon: Users,
      title: 'Reconocimiento y Protección cultural',
      copy: 'Defensa frente al fraude y visibilidad del valor cultural.',
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

/**
 * Sección "La autenticidad ancestral de Latinoamérica al mundo".
 * Diseño: fondo blanco consistente con el resto del Home, jerarquía
 * tipográfica relajada, mapa SVG minimal (silueta + 4 arcos + dots),
 * stats como cinta inferior con divisor sutil. Mucho aire entre bloques.
 */
function LatamAlMundo() {
  const stats = [
    { icon: MapPin, value: '12+', label: 'Países representados' },
    { icon: Users, value: '85+', label: 'Comunidades originarias' },
    { icon: Globe2, value: '40+', label: 'Destinos de exportación' },
    { icon: Languages, value: '6', label: 'Lenguas habladas' },
  ]

  return (
    <section
      id="latam-al-mundo"
      className="scroll-mt-24 bg-white"
    >
      <div className="mx-auto max-w-[1240px] px-4 py-20 md:px-8 md:py-32">
        {/* Bloque principal: copy + mapa con MUCHO aire */}
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-20">
          {/* Copy */}
          <div className="lg:col-span-6">
            <p className="inline-flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-navy-300">
              <Sparkles className="h-3.5 w-3.5 text-gold-500" />
              Proyección global
            </p>
            <h2 className="mt-4 text-[28px] font-bold leading-[1.15] tracking-tight text-navy-500 md:text-[40px]">
              La autenticidad ancestral de{' '}
              <span className="text-gold-700">Latinoamérica</span>{' '}
              al mundo
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-navy-300">
              Cada certificación es un puente: nace en una comunidad originaria
              de Latinoamérica y viaja —con su historia, su técnica y su
              territorio— hacia mercados, museos y consumidores del mundo
              entero. Acompañamos esa proyección sin desconectar el producto
              de su origen.
            </p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-navy-300">
              La trazabilidad blockchain permite que un comprador en Tokio,
              Madrid o Berlín pueda verificar, en segundos, que lo que llevó
              a casa fue tejido, sahumado o tallado por las manos correctas,
              en el territorio correcto, con el consentimiento de su pueblo.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/directorio"
                className={cn(buttonVariants({ variant: 'gold', size: 'lg' }))}
              >
                Explorar el directorio
              </Link>
              <Link
                to="/nosotros"
                className={cn(
                  buttonVariants({ variant: 'outlineNavy', size: 'lg' }),
                )}
              >
                Conocé el proyecto
              </Link>
            </div>
          </div>

          {/* Mapa lazy-loaded — el chunk de react-simple-maps + topojson
              (265KB) solo se baja cuando el user scrollea cerca de la
              sección. Reservamos el espacio para evitar CLS. */}
          <div className="lg:col-span-6">
            <LatamWorldMapLazy />
          </div>
        </div>

        {/* Cinta de stats — separada con divisor sutil, centrada full-width */}
        <div className="mt-20 border-t border-neutral-200 pt-12 md:mt-28 md:pt-14">
          <dl className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
            {stats.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.label} className="text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-gold-100 text-gold-700">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <dt className="mt-3 text-3xl font-bold text-navy-500 md:text-4xl">
                    {s.value}
                  </dt>
                  <dd className="mt-1 text-xs font-medium uppercase tracking-wider text-navy-300">
                    {s.label}
                  </dd>
                </div>
              )
            })}
          </dl>
        </div>
      </div>
    </section>
  )
}

/**
 * Wrapper que defiere el mount de LatamWorldMap hasta que está cerca
 * del viewport (IntersectionObserver con rootMargin generoso de 400px
 * para empezar a bajar el chunk antes de que aparezca). Muestra un
 * skeleton mientras tanto para reservar espacio (evita CLS).
 */
function LatamWorldMapLazy() {
  const ref = useRef<HTMLDivElement>(null)
  const [shouldMount, setShouldMount] = useState(false)

  useEffect(() => {
    if (!ref.current || shouldMount) return
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldMount(true)
          obs.disconnect()
        }
      },
      { rootMargin: '400px 0px' },
    )
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [shouldMount])

  return (
    <div ref={ref} className="relative mx-auto aspect-[3/4] w-full max-w-[460px]">
      {shouldMount ? (
        <Suspense
          fallback={
            <div className="flex h-full w-full items-center justify-center">
              <div className="h-3/4 w-3/4 animate-pulse rounded-2xl bg-gold-100/50" />
            </div>
          }
        >
          <LatamWorldMap />
        </Suspense>
      ) : (
        // Placeholder vacío con el mismo aspect-ratio para no causar
        // layout shift cuando entra en viewport
        <div aria-hidden className="h-full w-full" />
      )}
    </div>
  )
}

function AncestralVision() {
  return (
    <section id="nosotros" className="scroll-mt-24 bg-white">
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
              Durante generaciones, los saberes de nuestras comunidades
              originarias viajaron de voz en voz, preservando una conexión
              profunda con la tierra, la identidad y la memoria colectiva.
            </p>
            <p className="mt-5 text-sm leading-relaxed text-neutral-300 md:text-base">
              Ancestral Seed nace con el propósito de honrar ese legado:
              registrar, validar y dar visibilidad al origen de productos y
              servicios ancestrales, reconociendo el valor cultural de
              quienes los mantienen vivos.
            </p>
            <p className="mt-5 text-sm leading-relaxed text-neutral-300 md:text-base">
              Junto a comunidades, especialistas y referentes territoriales,
              impulsamos certificaciones transparentes y trazables mediante
              tecnología blockchain, fortaleciendo la confianza, la
              autenticidad y el reconocimiento de cada historia compartida.
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
                Tu certificado sigue vivo en la red de manera inalterable en
                el tiempo.
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
        {/*
         * Feedback Mario/Raúl: las fotos blockchain-1 (cerveza) y blockchain-2
         * (meditación) no representan correctamente el oficio ancestral.
         * Reemplazadas temporalmente por productos certificados reales del
         * directorio (mopa + chaquira). Sustituir por fotos institucionales
         * cuando estén disponibles.
         */}
        <div className="mt-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <Accordion items={items} />
          <div className="relative h-[420px] hidden lg:block">
            <div className="absolute left-0 top-0 h-64 w-80 overflow-hidden rounded-3xl shadow-xl">
              <img
                src={`${import.meta.env.BASE_URL}cards/card-mopa.webp`}
                alt="Tejido en mopa, técnica ancestral certificada"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute right-4 bottom-0 h-56 w-72 overflow-hidden rounded-3xl border-4 border-white shadow-2xl">
              <img
                src={`${import.meta.env.BASE_URL}cards/card-chaquira.webp`}
                alt="Joyería en chaquira, oficio ancestral certificado"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:hidden">
            <img
              src={`${import.meta.env.BASE_URL}cards/card-mopa.webp`}
              alt=""
              className="aspect-square rounded-2xl object-cover"
            />
            <img
              src={`${import.meta.env.BASE_URL}cards/card-chaquira.webp`}
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
  /*
   * Feedback Mario/Raúl: el "Proceso de Verificación" (3 pasos del visitante
   * que verifica un certificado) era correcto pero no se entendía en la
   * landing como primer mensaje. Reemplazado por el "modelo completo" del
   * journey del postulante: 4 pasos de cómo se construye una certificación
   * Ancestral Seed. Cuando llegue el diagrama oficial gráfico, sustituir
   * este bloque por la SVG/imagen institucional.
   */
  const steps = [
    {
      num: '1',
      icon: FileText,
      title: 'Postulación',
      copy: 'Una comunidad, autor o artesano presenta su producto o servicio ancestral con su historia y evidencias.',
    },
    {
      num: '2',
      icon: Eye,
      title: 'Auditoría cultural',
      copy: 'Auditores y referentes territoriales validan el origen, la técnica y el vínculo con la comunidad.',
    },
    {
      num: '3',
      icon: Shield,
      title: 'Registro en blockchain',
      copy: 'La certificación se firma e inscribe de forma pública y permanente en una red descentralizada.',
    },
    {
      num: '4',
      icon: CheckCircle2,
      title: 'Ficha pública',
      copy: 'El certificado vive en una ficha verificable por QR o hash. Cualquiera puede comprobarlo.',
    },
  ]
  return (
    <section id="proceso" className="scroll-mt-24 bg-white">
      <div className="mx-auto max-w-[1320px] px-4 pb-16 md:px-8 md:pb-20">
        <div className="text-center">
          <p className="inline-flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-navy-300">
            <Sparkles className="h-3.5 w-3.5 text-gold-500" />
            ¿Cómo funciona?
          </p>
          <h2 className="mt-2 text-2xl font-bold text-navy-500 md:text-[32px] md:leading-tight">
            El camino de cada certificación
          </h2>
        </div>
        <div className="mt-10 rounded-3xl bg-pattern-aztec p-6 md:p-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
            {steps.map((s, i) => {
              const Icon = s.icon
              return (
                <div
                  key={s.num}
                  className={cn(
                    'flex flex-col items-center text-center md:items-start md:text-left md:px-4',
                    i > 0 && 'lg:border-l lg:border-navy-300/40',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-500 text-base font-bold text-navy-500">
                      {s.num}
                    </span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-400/30 text-gold-400">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <p className="mt-4 text-base font-bold text-white">
                    {s.title}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-neutral-400 md:text-sm">
                    {s.copy}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Etiquetas de tipología cultural mostradas arriba de cada card del
 * directorio en el orden curado del feedback (Mario/Raúl, 2026-05-16).
 * El orden viene fijo desde el handler MSW de /api/certifications/featured.
 */
const FEATURED_LABELS = [
  'Producto Ancestral auténtico',
  'Producto Tradicional con raíces ancestrales',
  'Producto de Inspiración Cultural',
  'Servicio Ancestral',
] as const

function FeaturedCertifications() {
  const { data, isLoading, error } = useFeaturedCertifications()
  return (
    <section id="certificados" className="scroll-mt-24 bg-white">
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
            {data.map((c, i) => (
              <div key={c.id} className="flex flex-col gap-2">
                {/* Etiqueta de tipología cultural por posición (feedback Mario/Raúl) */}
                <p className="text-center text-[11px] font-bold uppercase tracking-[0.14em] text-gold-700">
                  {FEATURED_LABELS[i] ?? ''}
                </p>
                <CertificationCard certification={c} />
              </div>
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
