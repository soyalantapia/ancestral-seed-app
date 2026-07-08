import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  ExternalLink,
  Globe,
  Info,
  Landmark,
  Scale,
  ShieldCheck,
} from 'lucide-react'
import { PageMeta } from '@/components/features/PageMeta'
import { Accordion, type AccordionItem } from '@/components/ui/accordion'
import {
  JURISDICCIONES,
  MARCO_INTERNACIONAL,
  type LegalInstrument,
} from '@/data/legislacion'

const INTRO =
  'El marco legal que respalda la certificación cultural: los derechos de los pueblos indígenas y el principio de consulta previa, con enlaces a las fuentes oficiales de cada país.'

/** Chip de tipo de instrumento (Ley, Decreto, Sentencia, etc.). */
function TipoChip({ tipo, anio }: { tipo: string; anio?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-semibold text-navy-300">
      {tipo}
      {anio && <span className="text-navy-300/70">· {anio}</span>}
    </span>
  )
}

/** Lista de instrumentos legales con link a la fuente oficial. */
function InstrumentList({ instrumentos }: { instrumentos: LegalInstrument[] }) {
  return (
    <ul className="mt-4 flex flex-col gap-3">
      {instrumentos.map((inst) => (
        <li
          key={inst.nombre}
          className="rounded-2xl border border-neutral-200 bg-white p-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            <TipoChip tipo={inst.tipo} anio={inst.anio} />
          </div>
          <a
            href={inst.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-2 inline-flex items-start gap-1.5 text-sm font-bold text-navy-500 transition-colors hover:text-gold-700"
          >
            <span>{inst.nombre}</span>
            <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-500 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
          <p className="mt-1.5 text-sm leading-relaxed text-navy-300">
            {inst.descripcion}
          </p>
        </li>
      ))}
    </ul>
  )
}

const accordionItems: AccordionItem[] = JURISDICCIONES.map((j) => ({
  id: j.id,
  question: `${j.bandera}  ${j.pais}`,
  answer: (
    <div>
      <p className="text-sm leading-relaxed text-navy-300">{j.resumen}</p>
      <p className="mt-3 flex items-start gap-2 rounded-xl bg-gold-100/50 px-3 py-2 text-xs text-navy-500">
        <Landmark className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-700" />
        <span>
          <strong className="font-bold">Autoridad competente:</strong>{' '}
          {j.autoridad}
        </span>
      </p>
      <InstrumentList instrumentos={j.instrumentos} />
    </div>
  ),
}))

/** Aviso legal reutilizable (arriba y al pie). */
function Disclaimer() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-100 px-4 py-3.5 text-xs leading-relaxed text-navy-300 md:text-sm">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-navy-300" />
      <p>
        Este apartado reúne <strong className="text-navy-500">ejemplos ilustrativos y no exhaustivos</strong> del
        marco legal de cada país. No constituye asesoría legal ni reemplaza el
        trámite de consulta previa ante cada Estado. La fuente oficial siempre
        prevalece y la decisión final es de cada comunidad.
      </p>
    </div>
  )
}

export default function Legislacion() {
  return (
    <>
      <PageMeta title="Legislación" description={INTRO} />

      {/* HERO */}
      <section className="relative overflow-hidden bg-pattern-gold pb-14 pt-10 md:pb-20 md:pt-16">
        <div className="mx-auto max-w-[1320px] px-4 md:px-8">
          <div className="rounded-3xl bg-white p-6 shadow-md sm:p-8 md:rounded-[32px] md:p-14">
            <span className="inline-flex items-center gap-2 rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gold-700">
              <Scale className="h-3.5 w-3.5" />
              Legislación
            </span>
            <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-[1.1] tracking-tight text-navy-500 md:text-5xl">
              El paraguas legal que protege a las comunidades.
            </h1>
            <p className="mt-6 max-w-3xl text-sm leading-relaxed text-navy-300 md:text-base">
              La certificación de Ancestral Seed se alinea con el marco legal de
              cada país sobre los derechos de los pueblos indígenas. El eje es la{' '}
              <strong className="text-navy-500">consulta previa</strong> —también
              llamada Consentimiento Libre, Previo e Informado (FPIC)—: el
              mecanismo por el cual el Estado garantiza que ningún tercero use la
              cultura, los saberes o el territorio de una comunidad sin su
              consentimiento.
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-navy-300 md:text-base">
              Es la base jurídica de lo que ya exige nuestra plataforma: toda
              certificación requiere el{' '}
              <Link
                to="/legal/terminos"
                className="font-semibold text-gold-700 hover:underline"
              >
                consentimiento expreso de la comunidad de origen
              </Link>
              , documentado mediante acta firmada por sus referentes.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 pb-20 sm:px-6 md:px-8">
        <div className="mt-2">
          <Disclaimer />
        </div>

        {/* MARCO INTERNACIONAL */}
        <section className="mt-12">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-navy-300">
            <Globe className="h-3.5 w-3.5 text-gold-500" />
            Marco internacional
          </p>
          <h2 className="mt-2 text-2xl font-bold leading-tight text-navy-500 md:text-[28px]">
            Los tres pilares que sostienen la consulta previa
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-navy-300 md:text-base">
            Toda la legislación de la región se apoya en tres instrumentos
            internacionales, que van desde el único tratado vinculante sobre
            pueblos indígenas hasta el más reciente tratado global contra la
            apropiación de saberes tradicionales.
          </p>
          <div className="mt-6">
            <InstrumentList instrumentos={MARCO_INTERNACIONAL} />
          </div>
        </section>

        {/* LEGISLACIÓN POR PAÍS */}
        <section className="mt-14">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-navy-300">
            <ShieldCheck className="h-3.5 w-3.5 text-gold-500" />
            Legislación por país
          </p>
          <h2 className="mt-2 text-2xl font-bold leading-tight text-navy-500 md:text-[28px]">
            El marco legal de cada territorio
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-navy-300 md:text-base">
            La autoridad competente y las normas clave de cada país, con enlace
            a la fuente oficial. Tocá cada país para ver el detalle.
          </p>
          <div className="mt-6">
            <Accordion items={accordionItems} />
          </div>
        </section>

        {/* CIERRE */}
        <section className="mt-14">
          <Disclaimer />
          <div className="mt-8 flex flex-col items-start gap-4 rounded-3xl bg-navy-500 p-7 text-white md:flex-row md:items-center md:justify-between md:p-9">
            <div>
              <h3 className="text-lg font-bold md:text-xl">
                ¿Cómo funciona nuestra certificación?
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-300">
                Conocé cómo validamos cada saber con auditoría cultural,
                validación comunitaria y blockchain.
              </p>
            </div>
            <Link
              to="/nosotros"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-bold text-navy-500 transition-colors hover:bg-gold-400"
            >
              Sobre nosotros
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
