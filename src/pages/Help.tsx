import { useState } from 'react'
import {
  Compass,
  Headphones,
  Mail,
  Phone,
  RefreshCw,
  Search,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { useOnboardingStore } from '@/store/onboarding'
import { useAuthStore } from '@/store/auth'
import {
  REGLAMENTO_GLOSSARY,
  REGLAMENTO_DEADLINES,
  OFFICIAL_DOCS,
} from '@/lib/copy'

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
  /**
   * Fix SM1 (#PUB-26 / #PUB-28, auditoría UX): Tours antes visibles
   * para CUALQUIER visitante público — incluso sin logueo. Si tocaban
   * "Tour tutor" sin ser tutor, toast confuso y nada visible. Ahora
   * solo se muestran si hay sesión iniciada.
   */
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = Boolean(user)
  // Filtro extra: si el rol del user incluye tutor, mostrar tour tutor;
  // si es solo postulante, solo tour solicitante.
  const showTutorTour =
    isAuthenticated &&
    (user?.role === 'tutor' || user?.roles?.includes('tutor'))
  const [advancedOpen, setAdvancedOpen] = useState(false)

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

      {/* Re-iniciar tours — solo si auth (SM1 fix #PUB-26 + #PUB-28) */}
      {isAuthenticated && (
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
              {/* Tour tutor solo si el user tiene rol tutor (#PUB-28) */}
              {showTutorTour && (
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
              )}
            </div>
          </div>
        </section>
      )}

      {/* Limpiar caché — herramienta avanzada para usuarios con
          problemas técnicos. Fix SM1 (#PUB-27): antes estaba siempre
          visible y generaba ansiedad ("¿hay algo roto?"). Ahora va en
          un disclosure cerrado por default. */}
      <details
        className="mt-4 rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm"
        open={advancedOpen}
        onToggle={(e) => setAdvancedOpen((e.target as HTMLDetailsElement).open)}
      >
        <summary className="cursor-pointer list-none text-xs font-bold text-navy-300 hover:text-navy-500">
          ¿Tenés problemas técnicos? Herramientas avanzadas
        </summary>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-info-100 text-info-300">
              <RefreshCw className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-navy-500">
                Limpiar caché y recargar
              </p>
              <p className="mt-0.5 text-xs text-navy-300">
                Si la app no responde o ves errores raros, el navegador
                puede haber cacheado una versión vieja. Esta acción
                limpia caché + service workers y recarga.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={async () => {
              const t = toast.loading('Limpiando caché y service workers...')
              try {
                // 1) Unregister TODOS los SWs (PWA y MSW)
                if ('serviceWorker' in navigator) {
                  const regs = await navigator.serviceWorker.getRegistrations()
                  await Promise.all(regs.map((r) => r.unregister()))
                }
                // 2) Borrar TODOS los caches (Workbox, MSW, etc.)
                if ('caches' in window) {
                  const keys = await caches.keys()
                  await Promise.all(keys.map((k) => caches.delete(k)))
                }
                // 3) Storage local (zustand persist) — solo el zustand de
                //    onboarding/UI, no auth ni form drafts
                try {
                  localStorage.removeItem('ancestral-ui')
                } catch {
                  // no-op
                }
                toast.success('Caché limpiado · recargando...', { id: t })
                setTimeout(() => window.location.reload(), 600)
              } catch (e) {
                toast.error(
                  `No pudimos limpiar el caché: ${(e as Error).message}`,
                  { id: t },
                )
              }
            }}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-navy-500 px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-navy-400"
          >
            <RefreshCw className="h-4 w-4" />
            Limpiar caché y recargar
          </button>
        </div>
      </details>

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

      {/* Glosario del Reglamento — SM6 fix.
          Términos formales del Reglamento de Marca (cláusula 1.3) que
          el postulante puede necesitar al leer comunicaciones formales
          de AS. Va antes del Footer support para que esté en la
          jerarquía visual correcta.

          Fix V2-PUB-05 (auditoría v2): con 8+ términos, encontrar uno
          específico era tedioso (no había búsqueda). Ahora un input
          arriba filtra por término o por contenido. Tipear "auditoría"
          deja solo las cards que matchean. */}
      <GlossarySection />

      {/* Plazos del Reglamento — SM6 fix (movido a su propia sección abajo) */}

      {/* Plazos clave del Reglamento — SM6 fix */}
      <section className="mt-10 rounded-3xl border border-gold-300/50 bg-gradient-to-br from-gold-100/40 to-white p-6 shadow-sm md:p-8">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gold-700">
          Plazos importantes
        </p>
        <h2 className="mt-1 text-xl font-bold text-navy-500 md:text-2xl">
          Tiempos que debés tener presentes
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-navy-300">
          Estos plazos están definidos por el Reglamento y se aplican
          automáticamente. Te avisamos antes de cada vencimiento.
        </p>
        <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          {[
            {
              k: REGLAMENTO_DEADLINES.minimumScoreToIssueLicense,
              suffix: '%',
              label: 'Puntaje mínimo para emitir la Licencia',
              source: 'Cláusula 1.5',
            },
            {
              k: REGLAMENTO_DEADLINES.inactivityDaysToCloseCase,
              suffix: 'd',
              label: 'Sin actividad antes de cierre por inactividad',
              source: 'Cláusula 1.5',
            },
            {
              k: REGLAMENTO_DEADLINES.daysToFixNonConformity,
              suffix: 'd',
              label: 'Para subsanar una no conformidad',
              source: 'Cláusula 4.6',
            },
            {
              k: REGLAMENTO_DEADLINES.daysToAppealSanction,
              suffix: 'd',
              label: 'Para apelar una sanción (hábiles)',
              source: 'Cláusulas 5.6 y 8',
            },
          ].map((p) => (
            <div
              key={p.label}
              className="rounded-2xl border border-neutral-200 bg-white p-4"
            >
              <p className="text-3xl font-bold text-navy-500">
                {p.k}
                <span className="text-base text-navy-300">{p.suffix}</span>
              </p>
              <p className="mt-1 text-xs leading-snug text-navy-500">
                {p.label}
              </p>
              {/* Fix V2-PUB-06 (auditoría v2): antes "Cláusula 1.5" era
                  texto plano — el postulante que quería leer el contexto
                  formal tenía que ir al footer, descargar el PDF y
                  buscar manualmente. Ahora cada cláusula abre el PDF
                  directo en pestaña nueva.

                  Fix V3-PUB-01 (auditoría v3): el href era `/${path}`
                  que en gh-pages resolvía a /docs/... → 404. El sitio
                  vive bajo /ancestral-seed-app/ así que necesita
                  BASE_URL. Footer.tsx y CertificationDetail.tsx ya lo
                  hacían bien — solo este lugar se olvidó. */}
              <a
                href={`${import.meta.env.BASE_URL}${OFFICIAL_DOCS.reglamentoMarca.path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-[10px] font-medium uppercase tracking-widest text-navy-300 underline-offset-2 hover:text-gold-700 hover:underline"
              >
                {p.source} ↗
              </a>
            </div>
          ))}
        </dl>
      </section>

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

/**
 * Fix V2-PUB-05 (auditoría v2): glosario buscable.
 *
 * Antes: 8 cards en grid; el visitante buscando "auditoría" tenía
 * que scrollear hasta encontrarla. Ahora un input de filtro arriba
 * matchea por término o por cuerpo (case-insensitive). Si no hay
 * matches, mensaje suave en vez de cards vacías.
 */
function GlossarySection() {
  const [query, setQuery] = useState('')
  /**
   * Fix V3-PUB-06 (auditoría v3): antes el filter no normalizaba
   * acentos — buscar "auditoria" (sin tilde) NO matcheaba "auditoría"
   * (con tilde) que aparece en varios términos. Fatal en un glosario
   * en español, donde tipear sin acentos es lo más común en mobile.
   * Ahora normalizamos ambos lados con NFD + strip de diacríticos
   * antes de comparar.
   */
  /**
   * Fix V4-PUB-06 (auditoría v4): antes el regex codificaba el rango
   * U+0300–U+036F como caracteres LITERALES no-imprimibles. Si alguien
   * formateaba el archivo con normalización NFD→NFC o un linter
   * "limpiaba" diacríticos, el regex se rompía silenciosamente y la
   * búsqueda perdía la normalización. Ahora usamos escapes Unicode
   * explícitos `̀-ͯ` — equivalente funcional, robusto a
   * transformaciones del source.
   */
  const stripAccents = (s: string): string =>
    s
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
  const normalized = stripAccents(query.trim())
  const filtered = normalized
    ? REGLAMENTO_GLOSSARY.filter(
        (g) =>
          stripAccents(g.term).includes(normalized) ||
          stripAccents(g.body).includes(normalized),
      )
    : REGLAMENTO_GLOSSARY
  return (
    <section className="mt-12">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gold-700">
            Vocabulario formal
          </p>
          <h2 className="mt-1 text-xl font-bold text-navy-500 md:text-2xl">
            Glosario del Reglamento
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-navy-300">
            Términos que usamos en comunicaciones formales y en el
            Reglamento de Marca. Coinciden con el documento oficial
            descargable desde el footer.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar en el glosario…"
            aria-label="Buscar en el glosario del Reglamento"
            className="h-10 w-full rounded-full border border-neutral-300 bg-white pl-9 pr-9 text-sm text-navy-500 placeholder:text-navy-300 focus:border-gold-500 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Limpiar búsqueda"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-navy-300 hover:bg-neutral-200 hover:text-navy-500"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </header>
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center">
          <p className="text-sm font-bold text-navy-500">
            Sin resultados para "{query}"
          </p>
          <p className="mt-1 text-xs text-navy-300">
            Probá con otro término o consultá el Reglamento completo.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((g) => (
            <li
              key={g.term}
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-bold text-navy-500">{g.term}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-navy-300">
                {g.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
