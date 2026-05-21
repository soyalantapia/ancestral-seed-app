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
      <LatamAlMundo />
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
 * Muestra un mapa estilizado de Latinoamérica con arcos que se proyectan
 * hacia afuera (al resto del mundo), enmarcando el mensaje de proyección
 * global de las certificaciones ancestrales. Va entre Pillars y
 * AncestralVision para hacer el puente entre principios y "sobre nosotros".
 */
function LatamAlMundo() {
  const stats = [
    {
      icon: MapPin,
      value: '12+',
      label: 'países representados',
    },
    {
      icon: Users,
      value: '85+',
      label: 'comunidades originarias',
    },
    {
      icon: Globe2,
      value: '40+',
      label: 'destinos de exportación',
    },
    {
      icon: Languages,
      value: '6',
      label: 'lenguas habladas',
    },
  ]

  return (
    <section
      id="latam-al-mundo"
      className="scroll-mt-24 bg-gradient-to-br from-navy-500 via-navy-500 to-navy-400 text-white"
    >
      <div className="mx-auto max-w-[1320px] px-4 py-16 md:px-8 md:py-24">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Columna izquierda: copy */}
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-400 backdrop-blur">
              <Globe2 className="h-3.5 w-3.5" />
              Proyección global
            </p>
            <h2 className="mt-4 text-2xl font-bold leading-tight md:text-[34px] md:leading-[1.15]">
              La autenticidad ancestral de
              <br className="hidden md:block" />{' '}
              <span className="bg-gradient-to-r from-gold-400 to-gold-500 bg-clip-text text-transparent">
                Latinoamérica al mundo
              </span>
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-neutral-300 md:text-base">
              Cada certificación es un puente: nace en una comunidad originaria
              de Latinoamérica y viaja —con su historia, su técnica y su
              territorio— hacia mercados, museos y consumidores del mundo entero.
              Acompañamos esa proyección sin desconectar el producto de su
              origen.
            </p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-neutral-300 md:text-base">
              La trazabilidad blockchain permite que un comprador en Tokio,
              Madrid o Berlín pueda verificar, en segundos, que lo que llevó a
              casa fue tejido, sahumado o tallado por las manos correctas, en
              el territorio correcto, con el consentimiento de su pueblo.
            </p>

            {/* Stats */}
            <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((s) => {
                const Icon = s.icon
                return (
                  <div
                    key={s.label}
                    className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/10 backdrop-blur"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500/15 text-gold-400">
                      <Icon className="h-4 w-4" />
                    </div>
                    <dt className="mt-2 text-xl font-bold text-white md:text-2xl">
                      {s.value}
                    </dt>
                    <dd className="mt-0.5 text-[11px] leading-snug text-neutral-300">
                      {s.label}
                    </dd>
                  </div>
                )
              })}
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/directorio"
                className={cn(
                  buttonVariants({ variant: 'gold', size: 'lg' }),
                  'shadow-lg shadow-gold-500/20',
                )}
              >
                Explorar el directorio
              </Link>
              <Link
                to="/nosotros"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 bg-transparent px-5 text-sm font-bold text-white transition-colors hover:bg-white/10"
              >
                Conocé el proyecto
              </Link>
            </div>
          </div>

          {/* Columna derecha: mapa */}
          <div className="relative">
            <LatamWorldMap />
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * SVG decorativo: silueta estilizada de Sudamérica con arcos curvos que
 * salen del corazón del continente hacia los cuatro extremos del mundo.
 * Los puntos representan ciudades/comunidades activas. NO es un mapa
 * cartográficamente preciso — es una representación de proyección global.
 */
function LatamWorldMap() {
  // Coordenadas aproximadas (en el viewBox 800x800) de ciudades con
  // certificaciones activas: usadas como "puntos de origen".
  const cities = [
    { x: 410, y: 220, label: 'Colombia' },
    { x: 365, y: 290, label: 'Ecuador' },
    { x: 380, y: 380, label: 'Perú' },
    { x: 440, y: 310, label: 'Brasil' },
    { x: 410, y: 460, label: 'Bolivia' },
    { x: 380, y: 560, label: 'Argentina' },
    { x: 330, y: 270, label: 'Centroamérica' },
  ]

  return (
    <div className="relative aspect-square w-full max-w-[560px] mx-auto">
      {/* Glow de fondo */}
      <div
        aria-hidden
        className="absolute inset-0 -m-12 rounded-full bg-gold-500/10 blur-3xl"
      />

      <svg
        viewBox="0 0 800 800"
        className="relative h-full w-full"
        role="img"
        aria-label="Mapa estilizado de Latinoamérica con conexiones globales"
      >
        <defs>
          {/* Gradiente del continente */}
          <linearGradient id="latam-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#D2A958" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#A8842F" stopOpacity="0.85" />
          </linearGradient>
          {/* Gradiente para los arcos hacia el mundo */}
          <linearGradient id="arc-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#E5C36C" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#E5C36C" stopOpacity="0" />
          </linearGradient>
          {/* Pulse animation para los puntos */}
          <radialGradient id="dot-glow">
            <stop offset="0%" stopColor="#FFD97A" stopOpacity="1" />
            <stop offset="60%" stopColor="#E5C36C" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#E5C36C" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Círculo "mundo" — meridianos */}
        <g
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
          aria-hidden
        >
          <circle cx="400" cy="400" r="380" />
          <circle cx="400" cy="400" r="300" />
          <circle cx="400" cy="400" r="220" />
          <circle cx="400" cy="400" r="140" />
          {/* Cruz cardinal */}
          <line x1="20" y1="400" x2="780" y2="400" />
          <line x1="400" y1="20" x2="400" y2="780" />
        </g>

        {/* Silueta estilizada de Latinoamérica (path simplificado).
            No es geográficamente exacta, es una abstracción reconocible. */}
        <path
          fill="url(#latam-grad)"
          stroke="rgba(255,217,122,0.3)"
          strokeWidth="1.5"
          d="
            M 330 165
            C 340 158, 355 158, 365 165
            L 380 175
            C 395 178, 410 175, 420 178
            C 432 182, 440 195, 442 210
            L 445 230
            C 448 245, 460 252, 465 268
            C 470 285, 462 300, 458 318
            C 455 338, 463 358, 460 378
            C 456 400, 445 418, 432 432
            C 422 446, 410 458, 405 478
            C 400 502, 410 525, 405 548
            C 400 568, 388 585, 380 605
            C 372 625, 368 645, 358 658
            C 348 668, 335 670, 325 660
            C 318 650, 320 635, 322 622
            C 325 605, 332 590, 332 572
            C 332 555, 322 540, 320 522
            C 318 502, 328 482, 328 462
            C 328 442, 318 424, 318 405
            C 318 388, 328 372, 328 355
            C 328 338, 318 322, 318 305
            C 318 290, 322 275, 318 260
            C 314 245, 305 232, 308 218
            C 312 200, 322 185, 330 165
            Z
          "
        />

        {/* Pequeños "anexos" (Centroamérica + Caribe + Norte) */}
        <g fill="url(#latam-grad)" stroke="rgba(255,217,122,0.3)" strokeWidth="1">
          {/* Centroamérica */}
          <path d="M 295 200 C 285 195, 270 200, 265 215 C 260 230, 270 248, 285 248 C 300 248, 312 235, 312 220 C 312 208, 305 202, 295 200 Z" />
          {/* Caribe puntos */}
          <circle cx="340" cy="195" r="6" />
          <circle cx="362" cy="190" r="5" />
          <circle cx="382" cy="195" r="4" />
        </g>

        {/* Arcos hacia el mundo (4 direcciones cardinales) */}
        <g fill="none" strokeWidth="2.5" strokeLinecap="round">
          {/* Hacia el NORTE (Norteamérica / Europa) */}
          <path
            d="M 390 320 Q 250 200, 130 80"
            stroke="url(#arc-grad)"
            strokeDasharray="0"
          />
          {/* Hacia el ESTE (Europa / África) */}
          <path
            d="M 440 360 Q 600 340, 760 290"
            stroke="url(#arc-grad)"
          />
          {/* Hacia el OESTE (Pacífico / Asia) */}
          <path
            d="M 360 360 Q 200 360, 40 380"
            stroke="url(#arc-grad)"
          />
          {/* Hacia el SUR (Antártida / Oceanía) */}
          <path
            d="M 390 600 Q 500 700, 660 740"
            stroke="url(#arc-grad)"
          />
          {/* Arc adicional Asia */}
          <path
            d="M 430 400 Q 650 450, 770 520"
            stroke="url(#arc-grad)"
            opacity="0.6"
          />
          {/* Arc adicional Norte-Este */}
          <path
            d="M 410 280 Q 580 180, 720 130"
            stroke="url(#arc-grad)"
            opacity="0.7"
          />
        </g>

        {/* Puntos destino (ciudades del mundo) */}
        <g>
          {[
            { x: 130, y: 80, label: 'Nueva York' },
            { x: 760, y: 290, label: 'Madrid' },
            { x: 40, y: 380, label: 'Tokio' },
            { x: 660, y: 740, label: 'Sydney' },
            { x: 770, y: 520, label: 'Estambul' },
            { x: 720, y: 130, label: 'Berlín' },
          ].map((d) => (
            <g key={d.label}>
              <circle
                cx={d.x}
                cy={d.y}
                r="12"
                fill="url(#dot-glow)"
                opacity="0.7"
              />
              <circle
                cx={d.x}
                cy={d.y}
                r="3.5"
                fill="#FFD97A"
              />
            </g>
          ))}
        </g>

        {/* Puntos de origen (ciudades de Latam con certificaciones) */}
        <g>
          {cities.map((c) => (
            <g key={c.label}>
              <circle
                cx={c.x}
                cy={c.y}
                r="14"
                fill="url(#dot-glow)"
                opacity="0.85"
              >
                <animate
                  attributeName="r"
                  values="10;18;10"
                  dur="2.4s"
                  repeatCount="indefinite"
                  begin={`${cities.indexOf(c) * 0.3}s`}
                />
                <animate
                  attributeName="opacity"
                  values="0.85;0.2;0.85"
                  dur="2.4s"
                  repeatCount="indefinite"
                  begin={`${cities.indexOf(c) * 0.3}s`}
                />
              </circle>
              <circle
                cx={c.x}
                cy={c.y}
                r="4"
                fill="#fff"
                stroke="#FFD97A"
                strokeWidth="1.5"
              />
            </g>
          ))}
        </g>

        {/* Etiqueta del corazón del continente */}
        <g transform="translate(370, 410)">
          <rect
            x="-58"
            y="-14"
            width="116"
            height="28"
            rx="14"
            fill="rgba(255,255,255,0.95)"
          />
          <text
            x="0"
            y="5"
            textAnchor="middle"
            fontSize="14"
            fontWeight="700"
            fill="#0E1B3A"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            LATAM
          </text>
        </g>
      </svg>

      {/* Caption decorativa abajo del mapa */}
      <p className="mt-3 text-center text-[11px] uppercase tracking-[0.18em] text-neutral-400">
        Trazabilidad blockchain · verificable globalmente
      </p>
    </div>
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
    <section className="bg-white">
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
