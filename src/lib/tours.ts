import type { TourId } from '@/store/onboarding'

export type TourPlacement = 'top' | 'bottom' | 'left' | 'right' | 'center'

export interface TourStep {
  /** ID único del step para debugging. */
  id: string
  /** Encabezado del tooltip — corto, accionable. */
  title: string
  /** Cuerpo principal — 1-3 frases que enseñen el "para qué". */
  body: string
  /** Pro tip opcional (línea amarilla con 💡). */
  tip?: string
  /**
   * Selector CSS del elemento a destacar.
   *
   * - Si está y el elemento existe → spotlight + tooltip pegado al target.
   * - Si no está o el elemento no se encuentra → modal centrado.
   *
   * Conviene usar `[data-tour="X"]` para no acoplarse a classnames internos.
   */
  target?: string
  /**
   * Ruta a navegar ANTES de mostrar este step. El tour espera a que el
   * target aparezca en el DOM (con retry corto) antes de mostrar el spotlight.
   */
  route?: string
  /** Lado del tooltip respecto al target. Default: bottom. */
  placement?: TourPlacement
  /** Padding alrededor del spotlight (px). Default: 8. */
  spotlightPadding?: number
  /**
   * Si está, scrollea el target hasta verse antes de mostrar el step.
   * Útil cuando el target está fuera de viewport. Default: true.
   */
  scrollIntoView?: boolean
  /** Label custom del botón siguiente. Default: 'Continuar'. */
  nextLabel?: string
}

interface TourDefinition {
  id: TourId
  /** Título mostrado en el header del tooltip. */
  label: string
  steps: TourStep[]
}

/**
 * Tour del solicitante.
 *
 * Objetivo: en 8 pasos, que el usuario entienda QUÉ HACE la plataforma,
 * QUÉ PUEDE HACER él, y CUÁNDO usar cada sección. No "esto es X" sino
 * "esto te sirve para Y, cuando pasa Z".
 */
export const solicitanteTour: TourDefinition = {
  id: 'solicitante',
  label: 'Tour del solicitante',
  steps: [
    {
      id: 'welcome',
      title: '¡Bienvenida! Te acompañamos en tu certificación',
      body:
        'Ancestral Seed valida la autenticidad de tu producto u oficio ancestral con auditoría cultural y blockchain. En 30-45 días tu pieza tiene un certificado digital verificable que cualquier comprador puede consultar.',
      tip:
        'Podés saltar el tour en cualquier momento. Para volver a verlo, andá a Ayuda → "Ver tour".',
      placement: 'center',
      route: '/inicio',
      nextLabel: 'Mostrame cómo',
    },
    {
      id: 'pipeline',
      title: 'Tu progreso visible',
      body:
        'Acá ves dónde está cada solicitud que abriste. Cada certificación pasa por 7 etapas — desde "Postulado" hasta "Certificación". El tutor avanza la etapa cuando se cumplen los requisitos.',
      target: '[data-tour="solicitudes-list"]',
      placement: 'top',
      route: '/inicio',
    },
    {
      id: 'quick-actions',
      title: 'Atajos al alcance de un click',
      body:
        'Empezar una nueva certificación, subir evidencias de una en curso, verificar un certificado externo o pedir ayuda — todo desde acá, sin entrar a buscar.',
      target: '[data-tour="quick-actions"]',
      placement: 'bottom',
    },
    {
      id: 'sidebar-nav',
      title: 'Tu menú lateral',
      body:
        'Mis certificaciones (lista y detalle), Calendario (reuniones con tu tutor), Pagos (facturas y vencimientos), Documentos (PDFs, avales, evidencias), Mi perfil (lo que ve el público) y Notificaciones (todo lo nuevo).',
      target: '[data-tour="sidebar"]',
      placement: 'right',
    },
    {
      id: 'public-profile',
      title: 'Tu cara pública',
      body:
        'Tocá "Ver sitio público" para entrar a tu perfil como lo ve cualquier persona externa. Es la página que aparece cuando alguien escanea el QR de tu producto certificado.',
      target: '[data-tour="public-site"]',
      placement: 'bottom',
    },
    {
      id: 'certificar',
      title: 'Iniciá una nueva certificación',
      body:
        'Es un formulario de 7 pasos: datos personales, producto, técnica, evidencias (fotos/video), aval comunitario y revisión. Se autoguarda — podés cerrar y volver cuando quieras.',
      target: '[data-tour="cta-nueva-cert"]',
      placement: 'bottom',
      nextLabel: 'Entiendo',
    },
    {
      id: 'cmdk',
      title: 'Atajo de teclado: ⌘K (Ctrl+K en Windows)',
      body:
        'Apretá Cmd+K en cualquier momento para abrir la paleta de comandos. Te lleva a cualquier sección en segundos sin tocar el menú.',
      tip:
        'También funciona con "/" si no estás escribiendo en un campo. Probalo: cerrá este tour y apretá Cmd+K.',
      placement: 'center',
    },
    {
      id: 'help',
      title: '¿Te queda alguna duda?',
      body:
        'En "Ayuda" tenés guías paso a paso de cada etapa, FAQs y un botón para contactar soporte por WhatsApp o email. Tu tutor también te escribe directo cuando hay novedades.',
      target: '[data-tour="help-link"]',
      placement: 'right',
      nextLabel: 'Empezar',
    },
  ],
}

/**
 * Tour del tutor.
 *
 * Objetivo: que un tutor cultural entienda el workflow operativo en 8 steps
 * y sepa qué decisión tomar en cada pantalla. Termina mostrando el moat
 * (Resumen IA) que diferencia la plataforma.
 */
export const tutorTour: TourDefinition = {
  id: 'tutor',
  label: 'Tour del tutor',
  steps: [
    {
      id: 'welcome',
      title: 'Tu panel de tutor cultural',
      body:
        'Desde acá gestionás todos los casos a tu cargo, evaluás evidencias, firmás certificados y coordinás reuniones con los postulantes. Te toma ~30s entender cómo está cada caso.',
      placement: 'center',
      route: '/tutor/dashboard',
      nextLabel: 'Mostrame el workflow',
    },
    {
      id: 'kpis',
      title: 'Tus métricas en vivo',
      body:
        'Casos asignados, en curso, atrasados (SLA excedido) y emitidos. Si "Atrasados" sube, es prioridad: significa que hay casos pasando los días permitidos por etapa.',
      target: '[data-tour="tutor-kpis"]',
      placement: 'bottom',
    },
    {
      id: 'tareas',
      title: 'Tareas de hoy ordenadas por urgencia',
      body:
        'Lo que tenés que hacer hoy, priorizado por SLA. Cada tarea es clickable y te lleva directo al tab correspondiente del caso. No tenés que recordar qué pendiente era en qué caso.',
      target: '[data-tour="tutor-tareas"]',
      placement: 'right',
    },
    {
      id: 'agenda',
      title: 'Tu agenda al alcance',
      body:
        'Las próximas reuniones con postulantes. Click en una para ver detalle, abrir el caso o reprogramar. Si necesitás una vista completa, andá a Agenda en el menú.',
      target: '[data-tour="tutor-agenda"]',
      placement: 'left',
    },
    {
      id: 'kanban',
      title: 'Kanban de casos: el workflow visual',
      body:
        'Cada columna es una etapa. Arrastrá una tarjeta para mover el caso (con motivo). Las cards con borde rojo tienen SLA excedido. El filtro "Ver casos en alerta" te muestra solo lo crítico.',
      target: '[data-tour="kanban-board"]',
      placement: 'top',
      route: '/tutor/casos',
      scrollIntoView: true,
    },
    {
      id: 'caso-detail',
      title: 'El expediente completo del caso',
      body:
        '6 tabs: Resumen, Evidencias (aprobar/rechazar/pedir aclaración), Evaluación (scoring por criterio), Notas internas, Mensajes y Historial inmutable. Todo lo importante en una sola pantalla.',
      target: '[data-tour="case-tabs"]',
      placement: 'bottom',
      route: '/tutor/casos/CE-101',
      scrollIntoView: true,
    },
    {
      id: 'ia-summary',
      title: 'Resumen IA — tu copiloto',
      body:
        'Genera un resumen ejecutivo del caso con riesgos detectados, score IA vs score tutor, próximos pasos sugeridos y tiempo estimado de cierre. Te ahorra leer 50 evidencias para tomar una decisión.',
      tip:
        'Próximamente: chat lateral conectado a OpenAI que responde preguntas sobre el expediente.',
      target: '[data-tour="ia-summary"]',
      placement: 'left',
    },
    {
      id: 'certificaciones',
      title: 'Historial de certificaciones emitidas',
      body:
        'Tu portafolio: todas las certs vigentes, en renovación, vencidas o denegadas que firmaste. Desde acá iniciás renovaciones, reportás incidencias y exportás CSV.',
      target: '[data-tour="certs-table"]',
      placement: 'top',
      route: '/tutor/certificaciones',
      nextLabel: 'Empezar a trabajar',
    },
  ],
}

export const TOURS: Record<TourId, TourDefinition> = {
  solicitante: solicitanteTour,
  tutor: tutorTour,
}
