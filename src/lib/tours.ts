import type { TourId } from '@/store/onboarding'

export type TourPlacement = 'top' | 'bottom' | 'left' | 'right' | 'center'

export interface TourStep {
  /** ID único del step para debugging. */
  id: string
  /** Encabezado del tooltip — corto, accionable. */
  title: string
  /** Cuerpo principal — 1 frase corta. Menos texto = menos saturación. */
  body: string
  /** Pro tip opcional (línea amarilla con 💡). Usar con moderación. */
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
  /** Si está, el botón primario navega a esta ruta y cierra el tour (en vez
   *  de avanzar al siguiente step). Para el paso final que "lanza" la acción
   *  —abrir el formulario de certificación— sin que el tour quede encima de
   *  los diálogos del formulario (retomar borrador / empezar de nuevo). */
  ctaTo?: string
}

interface TourDefinition {
  id: TourId
  /** Título mostrado en el header del tooltip. */
  label: string
  steps: TourStep[]
}

/**
 * Recorrido del postulante — "Cómo funciona".
 *
 * Rediseño 2026-06 (estrategia de producto): un ÚNICO recorrido guiado que
 * cruza el viaje completo —Mis certificaciones (la página principal) →
 * detalle de la certificación → formulario— y termina lanzando el formulario.
 *
 * Principios:
 *   - Orientado al objetivo (activar la 1ª certificación), no a mostrar
 *     botones sueltos de la interfaz.
 *   - Mobile-first REAL: cada ancla existe y se ve tanto en celular como en
 *     desktop. Se eliminaron los pasos que rompían en mobile (menú lateral
 *     oculto, atajo Cmd+K, "ver sitio público" del header).
 *   - Una frase corta por paso, lenguaje digno y neutro.
 *   - Termina lanzando la acción: el último paso navega a /certificar
 *     (TourStep.ctaTo) y cierra el tour, parado en el formulario.
 *
 * Se dispara desde la pestaña "Tutorial" del sidebar (acción directa, no una
 * ruta). El reglón welcome navega a /mis-certificaciones si hace falta.
 */
export const solicitanteTour: TourDefinition = {
  id: 'solicitante',
  label: 'Cómo funciona',
  steps: [
    {
      id: 'welcome',
      title: 'Te acompañamos a certificar',
      body:
        'Validamos que tu producto, servicio u oficio ancestral es auténtico y te damos un certificado digital, con un perfil que cualquiera puede verificar por QR.',
      placement: 'center',
      route: '/mis-certificaciones',
      nextLabel: 'Mostrame el camino',
    },
    {
      id: 'list',
      title: 'Tu certificación, de un vistazo',
      body: 'Acá ves tu certificación y en qué etapa está. Todo tu proceso, en un solo lugar.',
      target: '[data-tour="solicitudes-list"]',
      placement: 'top',
      route: '/mis-certificaciones',
    },
    {
      id: 'start-here',
      title: 'Empezás una nueva acá',
      body: 'Cada certificación arranca con un formulario de 7 pasos cortos que se guarda solo: salí y volvé cuando quieras.',
      target: '[data-tour="cta-nueva-cert"]',
      placement: 'bottom',
      route: '/mis-certificaciones',
    },
    {
      id: 'seguimiento',
      title: 'Adentro, seguís tu proceso',
      body: 'Al abrir una certificación ves sus etapas, las evidencias que subiste y los pagos, todo en un lugar.',
      target: '[data-tour="seguimiento"]',
      placement: 'bottom',
      route: '/mis-certificaciones/req-001',
      scrollIntoView: true,
    },
    {
      id: 'help',
      title: 'Nunca estás solo/a',
      body: 'Tocá el botón de ayuda cuando tengas una duda. Te damos una mano.',
      target: '[data-tour="help-fab"]',
      placement: 'top',
    },
    {
      id: 'launch',
      title: '¿Arrancamos?',
      body: 'Ya conocés el camino. Cuando quieras, empezá tu primera certificación: te guiamos en cada paso.',
      placement: 'center',
      nextLabel: 'Empezar mi certificación',
      ctaTo: '/certificar',
    },
  ],
}

/**
 * Tour del tutor.
 *
 * Mismo principio: una frase por paso, lenguaje neutro, resaltando cada
 * sección de a poco.
 */
export const tutorTour: TourDefinition = {
  id: 'tutor',
  label: 'Tour del tutor',
  steps: [
    {
      id: 'welcome',
      title: 'Tu panel de tutor',
      body:
        'Gestioná tus casos, evaluá evidencias y firmá certificados desde un solo lugar.',
      placement: 'center',
      route: '/tutor/dashboard',
      nextLabel: 'Ver el flujo',
    },
    {
      id: 'kpis',
      title: 'Métricas en vivo',
      body: 'Casos asignados, en curso, atrasados y emitidos de un vistazo.',
      target: '[data-tour="tutor-kpis"]',
      placement: 'bottom',
    },
    {
      id: 'tareas',
      title: 'Tareas de hoy',
      body: 'Ordenadas por urgencia. Cada una te lleva directo al caso.',
      target: '[data-tour="tutor-tareas"]',
      placement: 'right',
    },
    {
      id: 'agenda',
      title: 'Tu agenda',
      body: 'Tus próximas reuniones. Tocá una para ver el detalle.',
      target: '[data-tour="tutor-agenda"]',
      placement: 'left',
    },
    {
      id: 'kanban',
      title: 'Kanban de casos',
      body: 'Cada columna es una etapa. Arrastrá una tarjeta para avanzar el caso.',
      target: '[data-tour="kanban-board"]',
      placement: 'top',
      route: '/tutor/casos',
      scrollIntoView: true,
    },
    {
      id: 'caso-detail',
      title: 'El expediente',
      body: 'Resumen, evidencias, evaluación, notas, mensajes e historial, en pestañas.',
      target: '[data-tour="case-tabs"]',
      placement: 'bottom',
      route: '/tutor/casos/CE-101',
      scrollIntoView: true,
    },
    {
      id: 'ia-summary',
      title: 'Resumen con IA',
      body: 'Un resumen del caso con riesgos y próximos pasos sugeridos.',
      target: '[data-tour="ia-summary"]',
      placement: 'left',
    },
    {
      id: 'certificaciones',
      title: 'Certificados emitidos',
      body: 'Tu historial: vigentes, en renovación, vencidos y denegados.',
      target: '[data-tour="certs-table"]',
      placement: 'top',
      route: '/tutor/certificaciones',
      nextLabel: 'Empezar',
    },
  ],
}

/**
 * Tour del formulario de certificación.
 *
 * 4 pasos cortos al entrar a /certificar. No invasivo.
 */
export const certifyFormTour: TourDefinition = {
  id: 'certifyForm',
  label: 'Tour del formulario',
  steps: [
    {
      id: 'welcome',
      title: 'Empecemos',
      body:
        'Te pedimos datos tuyos, de tu comunidad y del producto, servicio u oficio a certificar. Son 7 pasos cortos.',
      placement: 'center',
      route: '/certificar',
      nextLabel: 'Mostrame',
    },
    {
      id: 'progress',
      title: 'Se autoguarda',
      body: 'Salí y volvé cuando quieras: no perdés lo que cargaste.',
      target: 'form',
      placement: 'top',
      scrollIntoView: false,
    },
    {
      id: 'postergar',
      title: 'Postergar',
      body: 'Guarda todo de forma segura y lo retomás desde tu panel.',
      target: 'button',
      placement: 'bottom',
      scrollIntoView: false,
    },
    {
      id: 'help',
      title: '¿Te trabás?',
      body: 'Tocá “Necesito ayuda” y te damos una mano.',
      placement: 'center',
      nextLabel: 'Empezar',
    },
  ],
}

export const TOURS: Record<TourId, TourDefinition> = {
  solicitante: solicitanteTour,
  tutor: tutorTour,
  certifyForm: certifyFormTour,
}
