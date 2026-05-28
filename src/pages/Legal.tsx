import { useParams, Navigate, Link } from 'react-router-dom'
import { ChevronLeft, FileText, Lock, Cookie } from 'lucide-react'
import { PageMeta } from '@/components/features/PageMeta'

type LegalSection = 'terminos' | 'privacidad' | 'cookies'

const SECTION_META: Record<
  LegalSection,
  { title: string; icon: typeof FileText; intro: string }
> = {
  terminos: {
    title: 'Términos y Condiciones',
    icon: FileText,
    intro:
      'Estos términos regulan el uso de la plataforma Ancestral Seed y los servicios de certificación cultural.',
  },
  privacidad: {
    title: 'Política de Privacidad',
    icon: Lock,
    intro:
      'Cómo recolectamos, usamos y protegemos los datos personales y de comunidad que nos confías.',
  },
  cookies: {
    title: 'Política de Cookies',
    icon: Cookie,
    intro:
      'Qué cookies y tecnologías similares usamos, para qué, y cómo podés gestionarlas.',
  },
}

/**
 * Página legal placeholder con copy provisorio.
 *
 * Antes existían links a /terminos /privacidad /cookies que iban a "/" (Home).
 * Esta página los recibe con un copy honesto que indica que el documento
 * final está en revisión legal y cómo contactar para dudas.
 */
export default function Legal() {
  const { section } = useParams<{ section: string }>()
  const key = section as LegalSection
  if (!key || !SECTION_META[key]) {
    return <Navigate to="/" replace />
  }
  const { title, icon: Icon, intro } = SECTION_META[key]

  return (
    <>
      <PageMeta title={`${title} · Ancestral Seed`} description={intro} />
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 md:px-8 md:py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-300 transition-colors hover:text-navy-500"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Volver al inicio
        </Link>

        <header className="mt-6 flex items-start gap-4 border-b border-neutral-200 pb-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold-100 text-gold-700">
            <Icon className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-navy-500 md:text-[28px]">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-navy-300 md:text-base">
              {intro}
            </p>
          </div>
        </header>

        <section className="mt-8 space-y-6 text-sm leading-relaxed text-navy-500">
          {/* Fix SM1 (#PUB-29, auditoría UX): el banner amarillo
              "Documento en revisión legal" minaba la confianza del
              visitante que venía a aceptar términos. Mantenemos la
              transparencia (el texto no es definitivo) pero como
              microcopy discreto, no como warning prominente. */}
          <p className="text-[11px] text-navy-300">
            Texto preliminar — la versión definitiva está en revisión por
            el equipo legal. Consultas a{' '}
            <a
              href="mailto:legal@ancestralseed.org"
              className="font-semibold text-gold-700 hover:underline"
            >
              legal@ancestralseed.org
            </a>
            .
          </p>

          {key === 'terminos' && <TerminosBody />}
          {key === 'privacidad' && <PrivacidadBody />}
          {key === 'cookies' && <CookiesBody />}
        </section>

        <footer className="mt-12 grid grid-cols-1 gap-3 border-t border-neutral-200 pt-6 sm:grid-cols-3">
          {(Object.keys(SECTION_META) as LegalSection[])
            .filter((k) => k !== key)
            .map((k) => {
              const meta = SECTION_META[k]
              const Ic = meta.icon
              return (
                <Link
                  key={k}
                  to={`/legal/${k}`}
                  className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition-colors hover:border-gold-300 hover:bg-gold-100/30"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-navy-500">
                    <Ic className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-bold text-navy-500">
                    {meta.title}
                  </span>
                </Link>
              )
            })}
        </footer>
      </article>
    </>
  )
}

function TerminosBody() {
  return (
    <>
      <h2 className="mt-4 text-lg font-bold text-navy-500">1. Aceptación</h2>
      <p>
        Al usar Ancestral Seed aceptás estos Términos y Condiciones. Si no
        estás de acuerdo, te pedimos que no uses la plataforma.
      </p>

      <h2 className="mt-4 text-lg font-bold text-navy-500">2. Uso de la plataforma</h2>
      <p>
        La plataforma valida la autenticidad de productos, servicios y saberes
        ancestrales mediante un sistema de certificación cultural, auditoría y
        tecnología blockchain. Los certificados emitidos quedan registrados de
        manera pública y permanente en la red.
      </p>

      <h2 className="mt-4 text-lg font-bold text-navy-500">3. Comunidades y consentimiento</h2>
      <p>
        Toda certificación requiere el consentimiento expreso de la comunidad
        de origen, documentado mediante acta firmada por sus referentes. Sin
        ese consentimiento, la certificación no avanza.
      </p>

      <h2 className="mt-4 text-lg font-bold text-navy-500">4. Limitación de responsabilidad</h2>
      <p>
        Ancestral Seed valida culturalmente la información presentada por el
        postulante. La responsabilidad por la veracidad última de los
        documentos y testimonios aportados recae en quien los presenta.
      </p>
    </>
  )
}

function PrivacidadBody() {
  return (
    <>
      <h2 className="mt-4 text-lg font-bold text-navy-500">1. Qué datos recolectamos</h2>
      <ul className="list-disc pl-5">
        <li>Datos personales: nombre, DNI/pasaporte/CUIT, email, teléfono.</li>
        <li>
          Datos de comunidad: nombre, territorio, rol declarado, evidencias.
        </li>
        <li>
          Datos de uso: páginas visitadas, acciones, dispositivo (para mejorar
          la plataforma).
        </li>
      </ul>

      <h2 className="mt-4 text-lg font-bold text-navy-500">2. Cómo los usamos</h2>
      <p>
        Para procesar tu solicitud de certificación, coordinar la auditoría
        cultural, emitir el certificado y mantener un canal de contacto con
        vos.
      </p>

      <h2 className="mt-4 text-lg font-bold text-navy-500">3. Con quién los compartimos</h2>
      <p>
        Compartimos los datos necesarios con los auditores asignados a tu
        caso. La certificación emitida se publica en la red blockchain con la
        información que vos autorizaste hacer pública.
      </p>

      <h2 className="mt-4 text-lg font-bold text-navy-500">4. Tus derechos</h2>
      <p>
        Podés acceder, rectificar o eliminar tus datos personales en cualquier
        momento desde Configuración o escribiéndonos a{' '}
        <a
          href="mailto:soporte@ancestralseed.org"
          className="font-bold text-gold-700 hover:underline"
        >
          soporte@ancestralseed.org
        </a>
        .
      </p>
    </>
  )
}

function CookiesBody() {
  return (
    <>
      <h2 className="mt-4 text-lg font-bold text-navy-500">1. Qué son las cookies</h2>
      <p>
        Pequeños archivos que se guardan en tu dispositivo para que la
        plataforma recuerde tus preferencias y te ofrezca una experiencia
        consistente.
      </p>

      <h2 className="mt-4 text-lg font-bold text-navy-500">2. Tipos de cookies que usamos</h2>
      <ul className="list-disc pl-5">
        <li>
          <strong>Esenciales:</strong> mantienen tu sesión iniciada y tus
          preferencias (tema, idioma).
        </li>
        <li>
          <strong>Funcionalidad:</strong> recuerdan filtros del directorio,
          últimas búsquedas y estado del onboarding.
        </li>
        <li>
          <strong>Analíticas (futuras):</strong> nos ayudarían a entender qué
          partes de la plataforma se usan más. Aún no las tenemos activas.
        </li>
      </ul>

      <h2 className="mt-4 text-lg font-bold text-navy-500">3. Cómo gestionarlas</h2>
      <p>
        Podés limpiar las cookies en cualquier momento desde la configuración
        de tu navegador (en Chrome: DevTools → Application → Storage). Tené en
        cuenta que algunas funcionalidades pueden no funcionar sin las cookies
        esenciales.
      </p>
    </>
  )
}
