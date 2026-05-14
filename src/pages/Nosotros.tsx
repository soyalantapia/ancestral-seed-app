import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  Award,
  Briefcase,
  CheckCircle2,
  Cpu,
  Eye,
  FileCheck2,
  Leaf,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wrench,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const knowledgeAreas = [
  {
    icon: Wrench,
    title: 'Conocimiento técnico',
    body: 'Capacidad para evaluar productos y servicios bajo estándares de calidad, eficiencia y sostenibilidad ancestral.',
  },
  {
    icon: Leaf,
    title: 'Conocimiento ambiental',
    body: 'Comprensión integral de la gestión responsable de los recursos naturales, promoviendo prácticas sustentables y de bajo impacto.',
  },
  {
    icon: Sparkles,
    title: 'Conocimiento cultural y ancestral',
    body: 'Valoración y preservación de saberes tradicionales como parte fundamental de la identidad, la producción y el desarrollo comunitario.',
  },
  {
    icon: Cpu,
    title: 'Conocimiento tecnológico',
    body: 'Aplicación de herramientas innovadoras, digitalización y sistemas orientados a la trazabilidad, transparencia y mejora continua.',
  },
  {
    icon: Users,
    title: 'Conocimiento social y territorial',
    body: 'Entendimiento de las dinámicas comunitarias, el impacto social y la importancia del arraigo territorial en los procesos de desarrollo sostenible.',
  },
  {
    icon: Briefcase,
    title: 'Conocimiento estratégico y empresarial',
    body: 'Desarrollo de capacidades de planificación, liderazgo, integración comercial y posicionamiento internacional.',
  },
  {
    icon: FileCheck2,
    title: 'Conocimiento normativo y de certificación',
    body: 'Manejo de estándares, regulaciones y marcos de cumplimiento necesarios para garantizar transparencia, confianza y reconocimiento institucional.',
  },
]

const objectives = [
  'Valorar y proteger el conocimiento ancestral.',
  'Promover prácticas sostenibles y responsables.',
  'Generar confianza y transparencia en los procesos certificados.',
  'Fortalecer el desarrollo social y económico de las comunidades.',
  'Integrar tecnología e innovación sin perder la identidad cultural.',
  'Crear conciencia sobre la importancia del patrimonio cultural y ambiental.',
  'Posicionar productos y proyectos con impacto humano y sostenible.',
]

const impacts = [
  {
    icon: ShieldCheck,
    title: 'Mayor credibilidad y confianza',
    body: 'La certificación garantiza productos y servicios ancestrales en Latinoamérica con estándares de calidad, sostenibilidad y responsabilidad.',
  },
  {
    icon: TrendingUp,
    title: 'Mejora de procesos y eficiencia',
    body: 'Permite optimizar procedimientos técnicos y organizativos, generando mayor orden, control y productividad.',
  },
  {
    icon: ArrowUpRight,
    title: 'Acceso a nuevas oportunidades',
    body: 'Facilita alianzas estratégicas, expansión comercial internacional y posibilidades de ingresar a nuevos mercados y proyectos.',
  },
  {
    icon: Lightbulb,
    title: 'Compromiso con la sostenibilidad y la innovación',
    body: 'Refuerza una visión moderna y responsable, integrando tecnología, mejora continua y respeto por las comunidades, preservando la identidad cultural.',
  },
]

export default function Nosotros() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-pattern-gold pb-16 pt-10 md:pb-24 md:pt-16">
        <div className="mx-auto max-w-[1320px] px-4 md:px-8">
          <div className="rounded-[32px] bg-white p-8 shadow-md md:p-14">
            <span className="inline-flex items-center gap-2 rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gold-700">
              <Sparkles className="h-3.5 w-3.5" />
              Quiénes somos
            </span>
            <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-[1.1] tracking-tight text-navy-500 md:text-5xl">
              Dignificamos el saber ancestral con certificación, tecnología y
              comunidad.
            </h1>
            <p className="mt-6 max-w-3xl text-sm leading-relaxed text-navy-300 md:text-base">
              Ancestral Seed nace con el propósito de{' '}
              <strong className="text-navy-500">
                reconocer, preservar y proyectar
              </strong>{' '}
              el valor cultural, humano y sostenible de las prácticas transmitidas
              de generación en generación al mundo.
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-navy-300 md:text-base">
              Nuestra estructura se fortalece a partir de un liderazgo
              estratégico orientado al desarrollo institucional y social,
              acompañado por una dirección tecnológica enfocada en la
              innovación, la trazabilidad y la transformación digital de los
              procesos.
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-navy-300 md:text-base">
              Somos un equipo interdisciplinario de profesionales comprometidos
              con la construcción de modelos sostenibles, transparentes y con
              proyección futura, integrando herramientas tecnológicas con una
              mirada responsable sobre el territorio, las comunidades y los
              saberes ancestrales.
            </p>
          </div>
        </div>
      </section>

      {/* ÁREAS DE CONOCIMIENTO */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1320px] px-4 py-16 md:px-8 md:py-20">
          <div className="text-center">
            <p className="inline-flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-navy-300">
              <Award className="h-3.5 w-3.5 text-gold-500" />
              Áreas de conocimiento estratégico
            </p>
            <h2 className="mt-2 text-2xl font-bold text-navy-500 md:text-[32px] md:leading-tight">
              7 dimensiones que dan respaldo a cada certificación
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-navy-300 md:text-base">
              Combinamos miradas técnicas, culturales y sociales para que cada
              proceso refleje el origen, la calidad y la proyección de quien
              certificamos.
            </p>
          </div>
          <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {knowledgeAreas.map(({ icon: Icon, title, body }) => (
              <li
                key={title}
                className="flex flex-col rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-100 text-gold-700">
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 text-base font-bold text-navy-500">
                  {title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-300">
                  {body}
                </p>
              </li>
            ))}
          </ul>

          {/* Pull quote */}
          <figure className="relative mx-auto mt-14 max-w-3xl">
            <span
              aria-hidden
              className="absolute -left-3 -top-3 font-serif text-7xl leading-none text-gold-500/40 md:-left-6 md:text-[120px]"
            >
              “
            </span>
            <blockquote className="rounded-3xl bg-gold-100 px-6 py-7 text-center text-sm leading-relaxed text-navy-500 md:px-12 md:py-10 md:text-base">
              La certificación se sustenta en una visión interdisciplinaria que
              integra conocimiento técnico, innovación, sostenibilidad y
              valorización cultural, promoviendo modelos de desarrollo con
              impacto positivo y proyección futura.
            </blockquote>
          </figure>
        </div>
      </section>

      {/* MISIÓN + VISIÓN */}
      <section className="bg-pattern-gold">
        <div className="mx-auto grid max-w-[1320px] gap-6 px-4 py-16 md:grid-cols-2 md:gap-8 md:px-8 md:py-20">
          <article className="rounded-3xl bg-white p-8 shadow-sm md:p-10">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500 text-navy-500">
              <Target className="h-6 w-6" strokeWidth={1.75} />
            </span>
            <h3 className="mt-5 text-2xl font-bold text-navy-500 md:text-[28px]">
              Misión
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-navy-300 md:text-base">
              Impulsar una certificación que reconozca, preserve y dignifique los
              saberes ancestrales, integrándolos con innovación, sostenibilidad y
              compromiso social para generar impacto positivo en las comunidades
              ancestrales en Latinoamérica.
            </p>
          </article>
          <article className="rounded-3xl bg-navy-500 p-8 text-white shadow-sm md:p-10">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500 text-navy-500">
              <Eye className="h-6 w-6" strokeWidth={1.75} />
            </span>
            <h3 className="mt-5 text-2xl font-bold md:text-[28px]">Visión</h3>
            <p className="mt-3 text-sm leading-relaxed text-neutral-300 md:text-base">
              Convertirse en una certificación referente en América Latina, capaz
              de unir tradición, identidad cultural y desarrollo sostenible,
              promoviendo modelos de producción responsables con las personas, la
              tierra y el futuro con alcance global.
            </p>
          </article>
        </div>
      </section>

      {/* OBJETIVOS */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1320px] px-4 py-16 md:px-8 md:py-20">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-navy-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-gold-500" />
                Objetivos
              </p>
              <h2 className="mt-2 text-2xl font-bold leading-tight text-navy-500 md:text-[32px]">
                Hacia dónde apuntamos con cada certificación
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-navy-300 md:text-base">
                Trabajamos a largo plazo, con foco en las comunidades,
                el ambiente y el futuro de los oficios ancestrales.
              </p>
            </div>
            <ul className="space-y-3 lg:col-span-7">
              {objectives.map((o, i) => (
                <li
                  key={o}
                  className="flex items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-5 transition-colors hover:bg-gold-100/40"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-500 text-sm font-bold text-navy-500">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-sm leading-relaxed text-navy-500 md:text-base">
                    {o}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* IMPACTOS */}
      <section className="bg-neutral-100">
        <div className="mx-auto max-w-[1320px] px-4 py-16 md:px-8 md:py-20">
          <div className="text-center">
            <p className="inline-flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-navy-300">
              <Sparkles className="h-3.5 w-3.5 text-gold-500" />
              Impactos de la certificación
            </p>
            <h2 className="mt-2 text-2xl font-bold text-navy-500 md:text-[32px] md:leading-tight">
              Qué cambia cuando un proceso queda certificado
            </h2>
          </div>
          <ul className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
            {impacts.map(({ icon: Icon, title, body }) => (
              <li
                key={title}
                className="flex gap-4 rounded-3xl bg-white p-6 shadow-sm md:p-7"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-navy-500 text-gold-500">
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-navy-500">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-navy-300">
                    {body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-16 md:px-8 md:pb-20">
        <div className="relative mx-auto max-w-[1320px] overflow-hidden rounded-3xl shadow-xl">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('${import.meta.env.BASE_URL}methodology-bg.jpg')`,
            }}
          />
          <div className="absolute inset-0 bg-navy-500/80" />
          <div className="relative z-10 flex flex-col items-center px-6 py-14 text-center text-white md:px-12 md:py-20">
            <h3 className="text-2xl font-bold md:text-3xl lg:text-[32px]">
              Sumá tu saber a la red de certificación ancestral
            </h3>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-200 md:text-base">
              Te acompañamos en cada paso del proceso, con auditoría humana,
              validación comunitaria y blockchain.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/certificar"
                className={cn(
                  buttonVariants({ variant: 'gold', size: 'lg' }),
                  'shadow-lg shadow-black/30',
                )}
              >
                Certificar Producto
              </Link>
              <Link
                to="/directorio"
                className={cn(
                  buttonVariants({ variant: 'outlineGold', size: 'lg' }),
                  'text-white hover:bg-white/10',
                )}
              >
                Ver directorio
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
