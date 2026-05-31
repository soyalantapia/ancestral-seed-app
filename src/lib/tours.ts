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
 * Lo muestra de a poco: una frase corta por paso, resaltando el elemento
 * en pantalla. Lenguaje neutro, sin saturar de texto.
 */
export const solicitanteTour: TourDefinition = {
  id: 'solicitante',
  label: 'Tour del solicitante',
  steps: [
    {
      id: 'welcome',
      title: 'Te damos la bienvenida',
      body:
        'Validamos la autenticidad de tu producto, servicio u oficio ancestral y emitimos un certificado digital verificable.',
      placement: 'center',
      route: '/inicio',
      nextLabel: 'Mostrame',
    },
    {
      id: 'pipeline',
      title: 'Tu progreso',
      body: 'Acá ves en qué etapa está cada certificación.',
      target: '[data-tour="solicitudes-list"]',
      placement: 'top',
      route: '/inicio',
    },
    {
      id: 'quick-actions',
      title: 'Atajos rápidos',
      body: 'Iniciar una certificación, subir evidencias o verificar, de un toque.',
      target: '[data-tour="quick-actions"]',
      placement: 'bottom',
    },
    {
      id: 'sidebar-nav',
      title: 'Menú lateral',
      body: 'Certificaciones, calendario, pagos, documentos y perfil, siempre a mano.',
      target: '[data-tour="sidebar"]',
      placement: 'right',
    },
    {
      id: 'public-profile',
      title: 'Tu perfil público',
      body: 'Así te ve quien escanea el QR de tu producto certificado.',
      target: '[data-tour="public-site"]',
      placement: 'bottom',
    },
    {
      id: 'certificar',
      title: 'Nueva certificación',
      body: 'Un formulario de 7 pasos que se autoguarda. Empezá cuando quieras.',
      target: '[data-tour="cta-nueva-cert"]',
      placement: 'bottom',
      nextLabel: 'Entiendo',
    },
    {
      id: 'cmdk',
      title: 'Atajo de teclado',
      body: 'Apretá Cmd+K (o Ctrl+K) para saltar a cualquier sección al instante.',
      placement: 'center',
    },
    {
      id: 'help',
      title: '¿Dudas?',
      body: 'En Ayuda tenés guías paso a paso y soporte directo.',
      target: '[data-tour="help-link"]',
      placement: 'right',
      nextLabel: 'Empezar',
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
