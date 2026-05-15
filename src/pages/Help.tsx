import { useState } from 'react'
import { Compass, Headphones, Mail, Phone, Search, X } from 'lucide-react'
import { toast } from 'sonner'
import { useOnboardingStore } from '@/store/onboarding'

interface Topic {
  id: string
  title: string
  body: string
  cta: string
  content: { heading: string; paragraphs: string[]; bullets?: string[] }
}

const topics: Topic[] = [
  {
    id: 'iniciar',
    title: '¿Cómo inicio una certificación?',
    body: 'Conocé los pasos para iniciar tu solicitud, qué documentación necesitás y cuáles son los tiempos estimados del proceso.',
    cta: 'Ver guía',
    content: {
      heading: 'Inicio de tu primera certificación',
      paragraphs: [
        'Para iniciar tu certificación necesitás completar el formulario de postulación con tus datos personales, los del producto u oficio, y un breve relato de la tradición o linaje cultural que estás representando.',
        'Una vez enviada la postulación, un coordinador verifica los datos y te asigna un tutor cultural en un plazo aproximado de 3 a 5 días hábiles. El tutor se encarga de guiarte durante todo el proceso.',
      ],
      bullets: [
        'Tiempo estimado total: 30–45 días desde postulación a certificación.',
        'Etapas: Postulado → Revisión inicial → Elegible → Diagnóstico → Auditoría → Evaluación → Certificación.',
        'Costo: gratuito para postulantes de pueblos originarios y comunidades reconocidas.',
      ],
    },
  },
  {
    id: 'documentacion',
    title: 'Documentación requerida',
    body: 'Lista detallada de documentos, evidencias y referencias que pedimos para auditar tu producto, servicio o práctica.',
    cta: 'Ver checklist',
    content: {
      heading: 'Documentación y evidencias',
      paragraphs: [
        'A lo largo del proceso vamos a pedirte distintos tipos de evidencias para validar la autenticidad, la unicidad y el origen de tu práctica.',
      ],
      bullets: [
        'Identidad: DNI o documento equivalente.',
        '3 a 6 fotos del producto u oficio en alta resolución.',
        '1 a 2 videos cortos (1–3 min) mostrando el proceso.',
        'Aval firmado de un referente de tu comunidad.',
        'Relato escrito del linaje o historia de la práctica.',
        'Opcional: artículos, premios o publicaciones que respalden tu trabajo.',
      ],
    },
  },
  {
    id: 'auditoria',
    title: 'Auditoría y entrevista',
    body: 'Cómo funciona la auditoría con el tutor cultural, qué temas vamos a conversar y cómo prepararte para la videollamada.',
    cta: 'Prepararme',
    content: {
      heading: 'Auditoría con tu tutor',
      paragraphs: [
        'La auditoría es una videollamada de 45 a 60 minutos con tu tutor cultural. El objetivo es profundizar en tu historia, validar la documentación y resolver dudas.',
        'Antes de la reunión, tu tutor te envía una agenda preliminar con los temas a tratar. Te recomendamos preparar ejemplos concretos y testimonios de tu comunidad.',
      ],
      bullets: [
        'Conexión estable y buena iluminación.',
        'Tener cerca las piezas u objetos relevantes.',
        'Si es posible, sumá a un referente de la comunidad.',
      ],
    },
  },
  {
    id: 'reprogramar',
    title: 'Reprogramar reuniones',
    body: 'Si no podés en la fecha propuesta, podés enviar una solicitud de reprogramación con una fecha alternativa.',
    cta: 'Aprender más',
    content: {
      heading: 'Cómo reprogramar una reunión',
      paragraphs: [
        'Si surge un imprevisto, podés cancelar o reprogramar la reunión hasta 24 horas antes sin penalización. Para hacerlo, abrí la notificación de la reunión en tu calendario y elegí "Reprogramar".',
        'Si necesitás reprogramar con menos de 24 horas, escribile directamente a tu tutor por WhatsApp.',
      ],
    },
  },
  {
    id: 'estados',
    title: 'Estados de tu solicitud',
    body: 'Significado de cada estado: Prediagnóstico, Inicio del proceso, Diagnóstico, Auditoría, Evaluación y Certificación.',
    cta: 'Leer detalle',
    content: {
      heading: 'Qué significa cada estado',
      paragraphs: [
        'Tu solicitud avanza por una serie de estados hasta convertirse en una certificación oficial. Cada uno tiene un objetivo distinto y un plazo aproximado.',
      ],
      bullets: [
        'Postulado (3 días): completaste el formulario inicial.',
        'Revisión inicial (5 días): validación de datos y asignación de tutor.',
        'Elegible (7 días): tu caso cumple los requisitos formales.',
        'Diagnóstico (14 días): construcción del expediente.',
        'Auditoría (21 días): revisión cultural y entrevista en profundidad.',
        'Evaluación (10 días): scoring final y firma del tutor.',
        'Certificación (7 días): emisión del certificado en blockchain.',
      ],
    },
  },
  {
    id: 'ficha',
    title: 'Tu ficha pública',
    body: 'Una vez certificado, tu pieza aparece en el directorio público con hash blockchain y trazabilidad completa.',
    cta: 'Ver ejemplo',
    content: {
      heading: 'Tu ficha pública en el directorio',
      paragraphs: [
        'Cada producto certificado tiene una ficha pública en el directorio Ancestral Seed. Incluye fotos, video, relato, ubicación geográfica, hash blockchain único y un QR para verificarla en cualquier momento.',
        'La ficha es indexable por buscadores y se puede compartir por redes sociales. Vos podés editar las imágenes y el relato desde tu perfil cuando quieras.',
      ],
    },
  },
]

const SUPPORT_EMAIL = 'soporte@ancestralseed.org'
const SUPPORT_PHONE = '+5491145678901'

export default function Help() {
  const [query, setQuery] = useState('')
  const [topic, setTopic] = useState<Topic | null>(null)
  const [contactOpen, setContactOpen] = useState(false)
  const resetTour = useOnboardingStore((s) => s.reset)

  const filtered = query
    ? topics.filter(
        (t) =>
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          t.body.toLowerCase().includes(query.toLowerCase()),
      )
    : topics

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 md:px-10 md:py-10">
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

      {/* Re-iniciar tours */}
      <section className="mt-6 rounded-3xl border border-gold-300/50 bg-gradient-to-br from-gold-100/40 to-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-500 text-navy-500">
              <Compass className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-navy-500">
                ¿Te perdiste? Volvé al tour guiado
              </p>
              <p className="mt-0.5 text-xs text-navy-300">
                8 pasos con spotlight que te muestran qué hace cada sección.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                resetTour('solicitante')
                toast.success('Tour del solicitante iniciado')
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-navy-500 px-4 text-xs font-bold text-white shadow-sm hover:bg-navy-400"
            >
              <Compass className="h-3.5 w-3.5" />
              Tour solicitante
            </button>
            <button
              type="button"
              onClick={() => {
                resetTour('tutor')
                toast.success('Tour del tutor iniciado')
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-4 text-xs font-bold text-navy-500 hover:bg-neutral-100"
            >
              <Compass className="h-3.5 w-3.5" />
              Tour tutor
            </button>
          </div>
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
              key={t.id}
              className="flex flex-col rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-base font-bold text-navy-500">{t.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-navy-300">
                {t.body}
              </p>
              <button
                type="button"
                onClick={() => setTopic(t)}
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
          onClick={() => setContactOpen(true)}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-500 shadow-sm transition-colors hover:bg-gold-400"
        >
          Contactar soporte
          <Headphones className="h-4 w-4" />
        </button>
      </div>

      {topic && (
        <TopicModal topic={topic} onClose={() => setTopic(null)} />
      )}
      {contactOpen && (
        <ContactSupportModal onClose={() => setContactOpen(false)} />
      )}
    </div>
  )
}

function TopicModal({ topic, onClose }: { topic: Topic; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-500/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gold-700">
              Guía
            </p>
            <h3 className="mt-1 text-xl font-bold text-navy-500">
              {topic.content.heading}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-navy-300 hover:bg-neutral-100"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {topic.content.paragraphs.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-navy-500">
              {p}
            </p>
          ))}
        </div>

        {topic.content.bullets && topic.content.bullets.length > 0 && (
          <ul className="mt-4 space-y-2 rounded-2xl bg-info-100/40 p-4">
            {topic.content.bullets.map((b, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-navy-500"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                {b}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-navy-300">
            ¿Te quedó alguna duda? Escribinos a {SUPPORT_EMAIL}.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full bg-navy-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-400"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  )
}

function ContactSupportModal({ onClose }: { onClose: () => void }) {
  const [subject, setSubject] = useState('Necesito ayuda con mi certificación')
  const [body, setBody] = useState(
    'Hola equipo de Ancestral Seed,\n\nTengo una consulta sobre …\n\nGracias!',
  )

  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  const waUrl = `https://wa.me/${SUPPORT_PHONE.replace(/\D/g, '')}?text=${encodeURIComponent(`${subject}\n\n${body}`)}`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-500/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-500 text-navy-500">
              <Headphones className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-navy-500">
                Contactar soporte
              </h3>
              <p className="text-xs text-navy-300">
                Respondemos en menos de 24hs hábiles.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-navy-300 hover:bg-neutral-100"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="text-xs font-bold text-navy-500">Asunto</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-navy-500">Mensaje</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="mt-1 w-full resize-y rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-navy-500 focus:border-gold-500 focus:outline-none"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-white px-4 py-2.5 text-sm font-bold text-navy-500 hover:bg-neutral-100"
          >
            Cancelar
          </button>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              setTimeout(() => {
                toast.success('Abriendo WhatsApp…')
                onClose()
              }, 200)
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-success-300 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-success-400"
          >
            <Phone className="h-4 w-4" />
            WhatsApp
          </a>
          <a
            href={mailto}
            onClick={() => {
              setTimeout(() => {
                toast.success(`Email a ${SUPPORT_EMAIL} preparado`)
                onClose()
              }, 200)
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-navy-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-navy-400"
          >
            <Mail className="h-4 w-4" />
            Enviar por email
          </a>
        </div>
      </div>
    </div>
  )
}
