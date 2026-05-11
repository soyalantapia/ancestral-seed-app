import { useState } from 'react'
import { Headphones, Search } from 'lucide-react'
import { toast } from 'sonner'

const topics = [
  {
    title: '¿Cómo inicio una certificación?',
    body: 'Conocé los pasos para iniciar tu solicitud, qué documentación necesitás y cuáles son los tiempos estimados del proceso.',
    cta: 'Ver guía',
  },
  {
    title: 'Documentación requerida',
    body: 'Lista detallada de documentos, evidencias y referencias que pedimos para auditar tu producto, servicio o práctica.',
    cta: 'Ver checklist',
  },
  {
    title: 'Auditoría y entrevista',
    body: 'Cómo funciona la auditoría con el tutor cultural, qué temas vamos a conversar y cómo prepararte para la videollamada.',
    cta: 'Prepararme',
  },
  {
    title: 'Reprogramar reuniones',
    body: 'Si no podés en la fecha propuesta, podés enviar una solicitud de reprogramación con una fecha alternativa.',
    cta: 'Aprender más',
  },
  {
    title: 'Estados de tu solicitud',
    body: 'Significado de cada estado: Prediagnóstico, Inicio del proceso, Diagnóstico, Auditoría, Evaluación y Certificación.',
    cta: 'Leer detalle',
  },
  {
    title: 'Tu ficha pública',
    body: 'Una vez certificado, tu pieza aparece en el directorio público con hash blockchain y trazabilidad completa.',
    cta: 'Ver ejemplo',
  },
]

export default function Help() {
  const [query, setQuery] = useState('')
  const filtered = query
    ? topics.filter(
        (t) =>
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          t.body.toLowerCase().includes(query.toLowerCase()),
      )
    : topics

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-8 md:px-10 md:py-10">
      {/* Search panel */}
      <section className="mt-6 rounded-3xl bg-info-100 px-6 py-10 text-center md:px-10 md:py-12">
        <h1 className="text-2xl font-bold text-navy-500 md:text-[28px]">
          ¿Necesitás ayuda?
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-navy-300">
          Encontrá respuestas rápidas o contactanos para asistencia personalizada.
        </p>
        <div className="relative mx-auto mt-6 max-w-3xl">
          <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-navy-300" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por tema o palabra clave..."
            className="h-14 w-full rounded-full border border-neutral-300 bg-white pl-14 pr-5 text-sm text-navy-500 placeholder:text-navy-300 focus:border-gold-500 focus:outline-none"
          />
        </div>
      </section>

      {/* Topic cards */}
      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-sm text-navy-300">
          No encontramos artículos para "{query}".
        </p>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <li
              key={t.title}
              className="flex flex-col rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-base font-bold text-navy-500">{t.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-navy-300">
                {t.body}
              </p>
              <button
                type="button"
                onClick={() => toast.info(`Abriendo "${t.title}"…`)}
                className="mt-5 inline-flex items-center rounded-full bg-navy-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-navy-400 self-start"
              >
                {t.cta}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Footer support */}
      <div className="mt-10 text-center">
        <p className="text-sm text-navy-500">
          ¿No encontrás lo que buscas? Nuestro equipo puede ayudarte
        </p>
        <button
          type="button"
          onClick={() => toast.success('Te contactamos en menos de 24hs hábiles')}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-500 shadow-sm transition-colors hover:bg-gold-400"
        >
          Contactar soporte
          <Headphones className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
