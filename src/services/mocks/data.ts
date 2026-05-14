import type {
  Author,
  Certification,
  CertificationRequest,
  InternalNote,
  IssuedCertification,
  MessageTemplate,
  Notification,
  ScoringCriterionDef,
  ScoringValue,
  TutorAgendaItem,
  TutorCase,
  TutorTask,
} from '@/types'

const PLACEHOLDER = '__placeholder__'

export const mockAuthors: Author[] = [
  {
    id: 'a-camila',
    slug: 'camila-montes',
    name: 'Camila Montes',
    title: 'Artesana · Sierra Nevada de Santa Marta',
    bio: 'Trabaja la filigrana ancestral, una técnica de orfebrería que aprendió y desarrolló a partir de una herencia cultural transmitida en mi familia. Mi obra es el fruto de un vínculo ancestral con la Sierra Nevada de Santa Marta, reinterpretando saberes tradicionales en piezas de joyería contemporánea.',
    avatarUrl: 'https://i.pravatar.cc/300?img=47',
    location: 'Colombia · Caribe colombiano',
    email: 'camila.montes@ancestralseed.io',
    certificationsCount: 12,
    joinedAt: '2024-03-12',
  },
  {
    id: 'a-belen',
    slug: 'maria-belen-baulo',
    name: 'María Belén Bauló',
    title: 'Autora · Sabores cósmicos',
    bio: 'Investigadora y escritora sobre alimentación ancestral.',
    avatarUrl: 'https://i.pravatar.cc/300?img=45',
    location: 'Argentina · Córdoba',
    email: 'maria.baulo@ancestralseed.io',
    certificationsCount: 1,
    joinedAt: '2025-08-01',
  },
  {
    id: 'a-flor',
    slug: 'flor-imbacuan-pantoja',
    name: 'Flor Imbacuán Pantoja',
    title: 'Tejedora ancestral',
    bio: 'Tejedora de la comunidad Pasto, Nariño.',
    avatarUrl: 'https://i.pravatar.cc/300?img=49',
    location: 'Colombia · Nariño',
    email: 'flor.imbacuan@ancestralseed.io',
    certificationsCount: 1,
    joinedAt: '2024-11-15',
  },
  {
    id: 'a-eco',
    slug: 'ecodestinos',
    name: 'Ecodestinos',
    title: 'Turismo ancestral',
    bio: 'Operador de turismo ancestral en territorios originarios de Colombia.',
    avatarUrl: 'https://i.pravatar.cc/300?img=12',
    location: 'Colombia · Colombia',
    email: 'contacto@ecodestinos.co',
    certificationsCount: 1,
    joinedAt: '2024-05-02',
  },
]

export const mockCertifications: Certification[] = [
  {
    id: 'c-filigrana',
    slug: 'tecnica-ancestral-filigrana',
    title: 'Técnica ancestral: Filigrana',
    authorId: 'a-camila',
    authorSlug: 'camila-montes',
    authorName: 'Camila Montes',
    authorAvatarUrl: 'https://i.pravatar.cc/300?img=47',
    issuedBy: 'Ancestral Seed Foundation',
    issuedAt: '2026-02-14',
    expiresAt: '2028-02-14',
    status: 'verified',
    category: 'Caribe colombiano',
    description:
      'Filigrana, una técnica de orfebrería que aprendió y desarrolló a partir de una herencia cultural transmitida en su familia. Mi obra es el fruto de un vínculo ancestral con la Sierra Nevada de Santa Marta, reinterpretando saberes tradicionales en piezas de joyería contemporánea.',
    coverUrl: '/cards/card-filigrana.png',
    hash: '0xA3F9C2D81E47B5106F3C2A99D8E1F4B7C0D5A2E69B8F1C4D3E2A1B0F9C8E7D6',
    location: 'Colombia · Caribe colombiano',
    mapQuery: 'Sierra Nevada de Santa Marta, Colombia',
    contextParagraphs: [
      'Esta técnica mantiene un vínculo ancestral con la Sierra Nevada de Santa Marta, transmitido a través de herencias familiares de comunidades indígenas del territorio.',
      'Tiene raíces milenarias, con hallazgos en civilizaciones antiguas como Egipto y Grecia, y se desarrolló ampliamente en distintas regiones de América Latina —como Colombia, México y Perú— y Europa, especialmente en Portugal y España.',
    ],
    techniqueParagraphs: [
      'A lo largo del tiempo, la práctica se mantuvo viva gracias a la transmisión oral y a la práctica familiar, conservando su valor cultural y simbólico como una forma de expresión ligada a la paciencia, la precisión y el trabajo manual.',
      'La pieza es elaborada mediante trabajo manual, utilizando la técnica de enrollado y trenzado de hilos metálicos extremadamente finos. Cada elemento se construye y se une mediante soldadura artesanal, sin intervención de procesos industriales.',
    ],
  },
  {
    id: 'c-sabores',
    slug: 'libro-sabores-cosmicos',
    title: 'Libro: Sabores cósmicos',
    authorId: 'a-belen',
    authorSlug: 'maria-belen-baulo',
    authorName: 'María Belén Bauló',
    authorAvatarUrl: 'https://i.pravatar.cc/300?img=45',
    issuedBy: 'Ancestral Seed Foundation',
    issuedAt: '2025-11-20',
    expiresAt: '2027-11-20',
    status: 'verified',
    category: 'Córdoba',
    description:
      'Sabores Cósmicos es una obra de investigación y reflexión que reúne conocimientos vinculados a la alimentación consciente, los ciclos naturales y las tradiciones cosmológicas presentes en diversas culturas. El libro recupera prácticas como la observación de las fases lunares, las dietas asociadas a estos ciclos y algunos principios vinculados a la astromedicina, una disciplina antigua que estudiaba la relación entre los movimientos celestes y el funcionamiento del cuerpo humano.',
    coverUrl: '/cards/card-sabores.png',
    hash: '0xC8D3B2A1F4E5D6C7B8A9F1E2D3C4B5A6F7E8D9C0B1A2F3E4D5C6B7A8F9E0D1C2',
    location: 'Argentina · Córdoba',
    mapQuery: 'Córdoba, Argentina',
    contextParagraphs: [
      'El trabajo de investigación desarrollado en Sabores Cósmicos dialoga con tradiciones culturales que históricamente observaron los ciclos lunares y los ritmos naturales como guías para la vida cotidiana.',
      'A lo largo del tiempo, distintas civilizaciones desarrollaron calendarios y sistemas de conocimiento basados en los movimientos de los astros. Estas prácticas influían en aspectos fundamentales de la vida como la agricultura, la salud y la alimentación, integrando la observación del cielo con la comprensión del funcionamiento del cuerpo humano.',
      'Aunque muchos de estos saberes fueron desplazados por modelos modernos de vida y nutrición, continúan siendo parte de tradiciones culturales que conciben la alimentación y el bienestar como procesos vinculados a los ciclos naturales.',
    ],
    techniqueParagraphs: [
      'A través de una mirada contemporánea, la obra propone comprender el sentido cultural y energético que estas prácticas tenían dentro de las sociedades tradicionales, explorando cómo pueden reinterpretarse en el contexto actual para recuperar una relación más equilibrada entre la alimentación, el cuerpo y los ritmos de la naturaleza.',
    ],
  },
  {
    id: 'c-tejido',
    slug: 'tejido-textil-tradicional',
    title: 'Tejido y diseño textil tradicional',
    authorId: 'a-flor',
    authorSlug: 'flor-imbacuan-pantoja',
    authorName: 'Flor Imbacuán Pantoja',
    authorAvatarUrl: 'https://i.pravatar.cc/300?img=49',
    issuedBy: 'Ancestral Seed Foundation',
    issuedAt: '2026-01-30',
    expiresAt: '2028-01-30',
    status: 'verified',
    category: 'Nariño',
    description:
      'Tradición textil del pueblo Pasto, con motivos y técnicas heredadas de la familia y la comunidad.',
    coverUrl: '/cards/card-tejido.png',
    hash: '0xB7E2A1F08C5D3E94B1A6F2C8D7E5A1B3F0C4D9E8A2B7C1D6F5E3A0B4C9D1E7F2',
    location: 'Colombia · Nariño',
    mapQuery: 'Nariño, Colombia',
  },
  {
    id: 'c-ecodestinos',
    slug: 'ecodestinos-turismo-ancestral',
    title: 'Ecodestinos: Turismo ancestral',
    authorId: 'a-eco',
    authorSlug: 'ecodestinos',
    authorName: 'Ecodestinos',
    authorAvatarUrl: 'https://i.pravatar.cc/300?img=12',
    issuedBy: 'Ancestral Seed Foundation',
    issuedAt: '2026-03-12',
    expiresAt: '2028-03-12',
    status: 'verified',
    category: 'Colombia',
    description:
      'Operador de turismo ancestral certificado, con experiencias diseñadas en alianza con comunidades originarias del territorio.',
    coverUrl: '/cards/card-ecodestinos.png',
    hash: '0xD9E4C3B2A1F0E5D6C7B8A9F1E2D3C4B5A6F7E8D9C0B1A2F3E4D5C6B7A8F9E0D1',
    location: 'Colombia',
    mapQuery: 'Colombia',
  },
  {
    id: 'c-joyeria',
    slug: 'joyeria-filigrana-tradicional',
    title: 'Joyería Filigrana tradicional',
    authorId: PLACEHOLDER,
    authorName: PLACEHOLDER,
    authorAvatarUrl: '',
    issuedBy: PLACEHOLDER,
    issuedAt: '2026-01-01',
    status: 'verified',
    category: PLACEHOLDER,
    description:
      'Joyería elaborada con la técnica de filigrana, herencia cultural de orfebres tradicionales.',
    coverUrl: '/cards/card-joyeria.png',
    hash: '0xE0F5D4C3B2A1F0E5D6C7B8A9F1E2D3C4B5A6F7E8D9C0B1A2F3E4D5C6B7A8F9E0',
  },
  {
    id: 'c-mopa',
    slug: 'tecnica-mopa-mopa',
    title: 'Técnica Mopa-Mopa',
    authorId: PLACEHOLDER,
    authorName: PLACEHOLDER,
    authorAvatarUrl: '',
    issuedBy: PLACEHOLDER,
    issuedAt: '2026-01-01',
    status: 'verified',
    category: PLACEHOLDER,
    description:
      'Técnica artesanal del barniz de Pasto, originaria del territorio andino, declarada patrimonio cultural inmaterial.',
    coverUrl: '/cards/card-mopa.png',
    hash: '0xF1A6E5D4C3B2A1F0E5D6C7B8A9F1E2D3C4B5A6F7E8D9C0B1A2F3E4D5C6B7A8F9',
  },
  {
    id: 'c-chaquira',
    slug: 'tecnica-chaquira-ceremonial',
    title: 'Técnica: Chaquira ceremonial indígena',
    authorId: PLACEHOLDER,
    authorName: PLACEHOLDER,
    authorAvatarUrl: '',
    issuedBy: PLACEHOLDER,
    issuedAt: '2026-01-01',
    status: 'verified',
    category: PLACEHOLDER,
    description:
      'Tejido en chaquira ceremonial, con simbolismo y cosmovisión propios de comunidades indígenas.',
    coverUrl: '/cards/card-chaquira.png',
    hash: '0xA2B7C1D6F5E3A0B4C9D1E7F2B7E2A1F08C5D3E94B1A6F2C8D7E5A1B3F0C4D9E8',
  },
  {
    id: 'c-sahumerio',
    slug: 'sahumerio-limpieza-espiritual',
    title: 'Sahumerio de limpieza espiritual',
    authorId: PLACEHOLDER,
    authorName: PLACEHOLDER,
    authorAvatarUrl: '',
    issuedBy: PLACEHOLDER,
    issuedAt: '2026-01-01',
    status: 'verified',
    category: PLACEHOLDER,
    description:
      'Sahumerio elaborado con hierbas y resinas tradicionales utilizadas en rituales de limpieza espiritual.',
    coverUrl: '/cards/card-sahumerio.png',
    hash: '0xB1A2F3E4D5C6B7A8F9E0D1C2C8D3B2A1F4E5D6C7B8A9F1E2D3C4B5A6F7E8D9C0',
  },
  {
    id: 'c-cafe',
    slug: 'cafe-artesanal-de-montana',
    title: 'Café artesanal de montaña',
    authorId: PLACEHOLDER,
    authorName: PLACEHOLDER,
    authorAvatarUrl: '',
    issuedBy: PLACEHOLDER,
    issuedAt: '2026-01-01',
    status: 'verified',
    category: PLACEHOLDER,
    description:
      'Café cultivado y procesado de forma artesanal en montañas de origen, con trazabilidad completa.',
    coverUrl: '/cards/card-cafe.png',
    hash: '0xC7B8A9F1E2D3C4B5A6F7E8D9C0B1A2F3E4D5C6B7A8F9E0D1A2F3E4D5C6B7A8F9',
  },
]

export const mockCategories = [
  'Caribe colombiano',
  'Córdoba',
  'Nariño',
  'Colombia',
] as const

export const mockUser = {
  id: 'u-001',
  email: 'camila@ancestralseed.org',
  name: 'Camila Montes',
  avatarUrl: 'https://i.pravatar.cc/300?img=47',
  authorSlug: 'camila-montes',
}

export const PLACEHOLDER_TOKEN = PLACEHOLDER

// ─── Dashboard mocks ─────────────────────────────────────────────────────────

export const mockCertificationRequests: CertificationRequest[] = [
  {
    id: 'req-001',
    number: '#001',
    productName: 'Filigrana ancestral',
    createdAt: '2026-02-01',
    currentStage: 'prediagnostico',
    status: 'En curso',
    progressLabel: 'Revisión inicial por auditor',
    diagnosticDeadline: '15/03',
    diagnosticCompleted: false,
    pendingItems: ['Diagnóstico inicial', 'Auditoría pendiente'],
    stages: [
      {
        stage: 'prediagnostico',
        label: 'Prediagnóstico',
        status: 'in_progress',
        date: 'Fecha - Hora',
        description: 'Descripcion breve',
      },
      { stage: 'inicio', label: 'Inicio del proceso', status: 'pending' },
      { stage: 'diagnostico', label: 'Diagnóstico', status: 'pending' },
      { stage: 'auditoria', label: 'Auditoría', status: 'pending' },
      { stage: 'evaluacion', label: 'Evaluación', status: 'pending' },
      { stage: 'certificacion', label: 'Certificación', status: 'pending' },
    ],
    meetings: [
      {
        id: 'm-001',
        auditorName: 'Lic. Juan Pérez',
        type: 'Videollamada',
        scheduledAt: '2026-02-12T10:00:00-03:00',
        timezone: 'GMT-3',
        message:
          'Hola Camila, te propongo una primera reunión para revisar la documentación que enviaste. Confirmame si te queda cómodo el horario.',
        status: 'pending',
      },
    ],
    scheduledMeetings: [],
    evidences: [
      { id: 'e-001', name: 'pieza-frente.jpg', kind: 'image', sizeKb: 1240, uploadedAt: '2026-02-02T10:15:00-03:00', thumbUrl: '/cards/card-filigrana.png' },
      { id: 'e-002', name: 'pieza-reverso.jpg', kind: 'image', sizeKb: 980, uploadedAt: '2026-02-02T10:16:00-03:00' },
      { id: 'e-003', name: 'proceso-hilado.jpg', kind: 'image', sizeKb: 2100, uploadedAt: '2026-02-02T10:18:00-03:00' },
      { id: 'e-004', name: 'video-proceso.mp4', kind: 'video', sizeKb: 18200, uploadedAt: '2026-02-02T10:20:00-03:00' },
      { id: 'e-005', name: 'aval-comunidad.pdf', kind: 'document', sizeKb: 320, uploadedAt: '2026-02-03T16:42:00-03:00' },
    ],
    payments: [
      {
        id: 'p-001',
        concept: 'Inicio de proceso de certificación',
        amount: 45000,
        currency: 'ARS',
        status: 'pending',
        dueDate: '2026-02-28',
      },
    ],
    history: [
      { id: 'h-001', kind: 'request_created', title: 'Solicitud creada', actor: 'Tú', at: '2026-02-01T18:30:00-03:00' },
      { id: 'h-002', kind: 'evidence_uploaded', title: 'Evidencias iniciales', description: '4 fotos + 1 video', actor: 'Tú', at: '2026-02-02T10:18:00-03:00' },
      { id: 'h-003', kind: 'document_uploaded', title: 'Aval de la comunidad', description: 'aval-comunidad.pdf', actor: 'Tú', at: '2026-02-03T16:42:00-03:00' },
      { id: 'h-004', kind: 'stage_changed', title: 'Etapa Prediagnóstico iniciada', description: 'Auditoría asignada a Lic. Juan Pérez', actor: 'Sistema', at: '2026-02-05T09:00:00-03:00' },
      { id: 'h-005', kind: 'audit_proposed', title: 'Propuesta de reunión', description: '12/02 a las 10:00 GMT-3', actor: 'Auditor', at: '2026-02-06T11:30:00-03:00' },
    ],
    threads: {
      'm-001': [
        { id: 'msg-001', author: 'tutor', authorName: 'Lic. Juan Pérez', body: 'Hola Camila, te propongo una primera reunión para revisar la documentación que enviaste. Confirmame si te queda cómodo el horario.', at: '2026-02-06T11:30:00-03:00' },
      ],
    },
    submittedData: {
      applicantName: 'Camila Montes',
      email: 'camila@ancestralseed.org',
      phone: '+57 2345-6789',
      country: 'Colombia',
      region: 'Caribe colombiano',
      community: 'Sierra Nevada de Santa Marta',
      inspirationCommunity: 'Comunidad Kogi',
      productType: 'Producto físico',
      productSector: 'Joyería y orfebrería',
      productSubcategory: 'Filigrana',
      processDescription: 'Trabajo manual con hilos extremadamente finos de plata, mediante la técnica de enrollado y trenzado, soldadura artesanal y terminación a mano.',
      producerType: 'Yo misma · con apoyo familiar',
    },
  },
  {
    id: 'req-002',
    number: '#002',
    productName: 'Tejido en telar ancestral',
    createdAt: '2025-11-08',
    currentStage: 'evaluacion',
    status: 'En emisión',
    progressLabel: 'Revisión final · firma del hash blockchain',
    diagnosticDeadline: undefined,
    diagnosticCompleted: true,
    pendingItems: ['Firma del hash'],
    stages: [
      { stage: 'prediagnostico', label: 'Prediagnóstico', status: 'completed', date: '08/11/2025' },
      { stage: 'inicio', label: 'Inicio del proceso', status: 'completed', date: '15/11/2025' },
      { stage: 'diagnostico', label: 'Diagnóstico', status: 'completed', date: '02/12/2025' },
      { stage: 'auditoria', label: 'Auditoría', status: 'completed', date: '18/01/2026' },
      { stage: 'evaluacion', label: 'Evaluación', status: 'in_progress', date: 'En curso' },
      { stage: 'certificacion', label: 'Certificación', status: 'pending' },
    ],
    meetings: [],
    scheduledMeetings: [
      {
        id: 'm-002',
        auditorName: 'Mtra. Sofía Quispe',
        type: 'Videollamada',
        scheduledAt: '2026-05-20T14:00:00-03:00',
        timezone: 'GMT-3',
        message: 'Cierre de evaluación y revisión final.',
        status: 'accepted',
      },
    ],
    evidences: [
      { id: 'e-101', name: 'manto-completo.jpg', kind: 'image', sizeKb: 1500, uploadedAt: '2025-11-09T12:00:00-03:00', thumbUrl: '/cards/card-tejido.png' },
      { id: 'e-102', name: 'detalle-telar.jpg', kind: 'image', sizeKb: 1100, uploadedAt: '2025-11-09T12:05:00-03:00' },
    ],
    payments: [
      { id: 'p-101', concept: 'Inicio de proceso de certificación', amount: 45000, currency: 'ARS', status: 'paid', dueDate: '2025-11-30', paidAt: '2025-11-15', invoiceUrl: '#' },
      { id: 'p-102', concept: 'Auditoría en territorio', amount: 60000, currency: 'ARS', status: 'paid', dueDate: '2026-01-31', paidAt: '2026-01-12', invoiceUrl: '#' },
      { id: 'p-103', concept: 'Emisión del certificado en blockchain', amount: 15000, currency: 'ARS', status: 'pending', dueDate: '2026-05-25' },
    ],
    history: [
      { id: 'h-101', kind: 'request_created', title: 'Solicitud creada', actor: 'Tú', at: '2025-11-08T10:00:00-03:00' },
      { id: 'h-102', kind: 'stage_changed', title: 'Inicio del proceso', actor: 'Sistema', at: '2025-11-15T09:00:00-03:00' },
      { id: 'h-103', kind: 'payment_received', title: 'Pago confirmado', description: 'Inicio de proceso · $45.000', actor: 'Sistema', at: '2025-11-15T11:23:00-03:00' },
      { id: 'h-104', kind: 'stage_changed', title: 'Diagnóstico completado', actor: 'Sistema', at: '2025-12-02T14:00:00-03:00' },
      { id: 'h-105', kind: 'stage_changed', title: 'Auditoría completada', actor: 'Auditor', at: '2026-01-18T17:00:00-03:00' },
      { id: 'h-106', kind: 'stage_changed', title: 'Evaluación en curso', actor: 'Sistema', at: '2026-04-28T09:15:00-03:00' },
      { id: 'h-107', kind: 'audit_accepted', title: 'Reunión de cierre confirmada', description: '20/05 14:00 GMT-3 · Mtra. Sofía Quispe', actor: 'Tú', at: '2026-04-22T18:42:00-03:00' },
    ],
    threads: {
      'm-002': [
        { id: 'msg-101', author: 'tutor', authorName: 'Mtra. Sofía Quispe', body: 'Hola Camila, te confirmo la reunión del cierre de evaluación para el 20/05.', at: '2026-04-22T18:42:00-03:00' },
      ],
    },
    submittedData: {
      applicantName: 'Camila Montes',
      email: 'camila@ancestralseed.org',
      phone: '+57 2345-6789',
      country: 'Colombia',
      region: 'Caribe colombiano',
      community: 'Sierra Nevada de Santa Marta',
      productType: 'Producto físico',
      productSector: 'Tejidos y textiles',
      productSubcategory: 'Tejido en telar',
      processDescription: 'Tejido manual en telar vertical con lana hilada a mano, teñida con tintes naturales. Proceso completo desde el hilado hasta el acabado, sin intervención industrial.',
      producerType: 'Mi familia',
    },
  },
]

export const mockNotifications: Notification[] = [
  {
    id: 'n-001',
    kind: 'audit_proposed',
    title: 'Nueva propuesta de auditoría',
    body: 'Lic. Juan Pérez propuso una videollamada el 12/02 a las 10:00 (GMT-3) para Filigrana ancestral.',
    createdAt: '2026-05-10T15:30:00-03:00',
    read: false,
    link: '/mis-certificaciones/req-001?tab=evaluacion',
  },
  {
    id: 'n-002',
    kind: 'evidence_request',
    title: 'Pedido de evidencias adicionales',
    body: 'Para avanzar con el diagnóstico necesitamos 2 fotos más del proceso de hilado.',
    createdAt: '2026-05-09T11:00:00-03:00',
    read: false,
    link: '/mis-certificaciones/req-001?tab=evidencias',
  },
  {
    id: 'n-003',
    kind: 'stage_changed',
    title: 'Cambio de etapa',
    body: 'Tejido en telar ancestral pasó a la etapa Evaluación.',
    createdAt: '2026-04-28T09:15:00-03:00',
    read: true,
    link: '/mis-certificaciones/req-002',
  },
  {
    id: 'n-004',
    kind: 'message_received',
    title: 'Mensaje de Mtra. Sofía Quispe',
    body: 'Hola Camila, te confirmo la reunión del cierre de evaluación para el 20/05.',
    createdAt: '2026-04-22T18:42:00-03:00',
    read: true,
    link: '/mis-certificaciones/req-002',
  },
  {
    id: 'n-005',
    kind: 'document_uploaded',
    title: 'Documento subido correctamente',
    body: 'Recibimos el archivo Aval-comunidad.pdf y lo asociamos a tu solicitud #001.',
    createdAt: '2026-04-18T10:00:00-03:00',
    read: true,
  },
]

// ─── Tutor panel mocks ───────────────────────────────────────────────────────

export const mockTutor = {
  id: 't-001',
  name: 'Lic. Juan Pérez',
  email: 'juan.perez@ancestralseed.io',
  avatarUrl: 'https://i.pravatar.cc/200?img=15',
}

export const mockTutorCases: TutorCase[] = [
  // Postulados (sin tutor asignado)
  {
    id: 'CE-101',
    productName: 'Tejido en telar Kogi',
    applicantName: 'María Belén Bauló',
    applicantAvatarUrl: 'https://i.pravatar.cc/200?img=45',
    scoringIA: 95,
    risk: 'bajo',
    pendingItems: [],
    stage: 'postulado',
    category: 'Tejidos y textiles',
    country: 'Argentina',
    region: 'Córdoba',
    createdAt: '2026-05-08T10:00:00-03:00',
  },
  {
    id: 'CE-102',
    productName: 'Cerámica negra de Catamarca',
    applicantName: 'Ana Quispe',
    applicantAvatarUrl: 'https://i.pravatar.cc/200?img=32',
    scoringIA: 62,
    risk: 'alto',
    pendingItems: [],
    stage: 'postulado',
    category: 'Cerámica',
    country: 'Argentina',
    region: 'Catamarca',
    createdAt: '2026-05-09T11:30:00-03:00',
  },
  // Revisión inicial
  {
    id: 'CE-103',
    productName: 'Mate ancestral con virola',
    applicantName: 'Rodrigo Salinas',
    applicantAvatarUrl: 'https://i.pravatar.cc/200?img=12',
    scoringIA: 88,
    risk: 'bajo',
    pendingItems: [],
    stage: 'revision-inicial',
    tutorId: 't-001',
    tutorName: 'Juan Pérez',
    tutorAvatarUrl: 'https://i.pravatar.cc/200?img=15',
    category: 'Joyería y orfebrería',
    country: 'Argentina',
    region: 'Salta',
    createdAt: '2026-05-05T09:15:00-03:00',
  },
  // Elegible
  {
    id: 'CE-104',
    productName: 'Tejido Wayúu',
    applicantName: 'Camila Montes',
    applicantAvatarUrl: 'https://i.pravatar.cc/200?img=47',
    scoringIA: 92,
    risk: 'bajo',
    pendingItems: ['Evidencias'],
    stage: 'elegible',
    tutorId: 't-001',
    tutorName: 'Juan Pérez',
    tutorAvatarUrl: 'https://i.pravatar.cc/200?img=15',
    category: 'Tejidos y textiles',
    country: 'Colombia',
    region: 'Caribe colombiano',
    createdAt: '2026-04-22T14:00:00-03:00',
  },
  {
    id: 'CE-105',
    productName: 'Filigrana ancestral',
    applicantName: 'Luna Espinoza',
    applicantAvatarUrl: 'https://i.pravatar.cc/200?img=23',
    scoringIA: 96,
    risk: 'bajo',
    pendingItems: [],
    stage: 'elegible',
    tutorId: 't-001',
    tutorName: 'Juan Pérez',
    tutorAvatarUrl: 'https://i.pravatar.cc/200?img=15',
    category: 'Joyería y orfebrería',
    country: 'Colombia',
    region: 'Mompox',
    createdAt: '2026-04-18T10:00:00-03:00',
  },
  {
    id: 'CE-106',
    productName: 'Cocina ancestral del NOA',
    applicantName: 'Mario Tolaba',
    applicantAvatarUrl: 'https://i.pravatar.cc/200?img=8',
    scoringIA: 84,
    risk: 'medio',
    pendingItems: ['Evidencias'],
    stage: 'elegible',
    tutorId: 't-001',
    tutorName: 'Juan Pérez',
    tutorAvatarUrl: 'https://i.pravatar.cc/200?img=15',
    category: 'Cocina ancestral',
    country: 'Argentina',
    region: 'Jujuy',
    createdAt: '2026-04-15T09:00:00-03:00',
  },
  // Diagnóstico
  {
    id: 'CE-107',
    productName: 'Tejido en telar Pasto',
    applicantName: 'Flor Imbacuán Pantoja',
    applicantAvatarUrl: 'https://i.pravatar.cc/200?img=49',
    scoringIA: 90,
    risk: 'bajo',
    pendingItems: ['Auditoría'],
    stage: 'diagnostico',
    tutorId: 't-002',
    tutorName: 'Sofía Quispe',
    tutorAvatarUrl: 'https://i.pravatar.cc/200?img=20',
    category: 'Tejidos y textiles',
    country: 'Colombia',
    region: 'Nariño',
    createdAt: '2026-03-20T10:00:00-03:00',
  },
  // Auditoría
  {
    id: 'CE-108',
    productName: 'Café artesanal de montaña',
    applicantName: 'Pedro Huilca',
    applicantAvatarUrl: 'https://i.pravatar.cc/200?img=11',
    scoringIA: 78,
    risk: 'medio',
    pendingItems: [],
    stage: 'auditoria',
    tutorId: 't-001',
    tutorName: 'Juan Pérez',
    tutorAvatarUrl: 'https://i.pravatar.cc/200?img=15',
    category: 'Productos agroecológicos',
    country: 'Perú',
    region: 'Cusco',
    createdAt: '2026-03-10T08:00:00-03:00',
  },
  // Evaluación
  {
    id: 'CE-109',
    productName: 'Sahumerio ceremonial',
    applicantName: 'Inés Curaca',
    applicantAvatarUrl: 'https://i.pravatar.cc/200?img=44',
    scoringIA: 87,
    risk: 'bajo',
    pendingItems: ['Firma de evaluación'],
    stage: 'evaluacion',
    tutorId: 't-001',
    tutorName: 'Juan Pérez',
    tutorAvatarUrl: 'https://i.pravatar.cc/200?img=15',
    category: 'Medicina ancestral',
    country: 'Bolivia',
    region: 'La Paz',
    createdAt: '2026-02-28T11:00:00-03:00',
  },
  // Certificación
  {
    id: 'CE-110',
    productName: 'Joyería filigrana tradicional',
    applicantName: 'Beatriz Salazar',
    applicantAvatarUrl: 'https://i.pravatar.cc/200?img=29',
    scoringIA: 99,
    risk: 'bajo',
    pendingItems: [],
    stage: 'certificacion',
    tutorId: 't-001',
    tutorName: 'Juan Pérez',
    tutorAvatarUrl: 'https://i.pravatar.cc/200?img=15',
    category: 'Joyería y orfebrería',
    country: 'Colombia',
    region: 'Mompox',
    createdAt: '2026-02-15T10:00:00-03:00',
  },
  {
    id: 'CE-111',
    productName: 'Tejido en telar tradicional',
    applicantName: 'Flor Imbacuán Pantoja',
    applicantAvatarUrl: 'https://i.pravatar.cc/200?img=49',
    scoringIA: 94,
    risk: 'bajo',
    pendingItems: [],
    stage: 'certificacion',
    tutorId: 't-001',
    tutorName: 'Juan Pérez',
    tutorAvatarUrl: 'https://i.pravatar.cc/200?img=15',
    category: 'Tejidos y textiles',
    country: 'Colombia',
    region: 'Nariño',
    createdAt: '2026-01-30T10:00:00-03:00',
  },
  {
    id: 'CE-112',
    productName: 'Libro: Sabores cósmicos',
    applicantName: 'María Belén Bauló',
    applicantAvatarUrl: 'https://i.pravatar.cc/200?img=45',
    scoringIA: 91,
    risk: 'bajo',
    pendingItems: [],
    stage: 'certificacion',
    tutorId: 't-002',
    tutorName: 'Sofía Quispe',
    tutorAvatarUrl: 'https://i.pravatar.cc/200?img=20',
    category: 'Editorial',
    country: 'Argentina',
    region: 'Córdoba',
    createdAt: '2025-11-20T10:00:00-03:00',
  },
]

export const mockIssuedCertifications: IssuedCertification[] = [
  // 18 certs con estados variados
  ...Array.from({ length: 18 }, (_, i) => {
    // Distribución determinística: 10 vigentes, 2 renovación, 4 vencidos, 2 denegados
    let status: 'vigente' | 'renovacion' | 'vencido' | 'denegado'
    if (i < 10) status = 'vigente'
    else if (i < 12) status = 'renovacion'
    else if (i < 16) status = 'vencido'
    else status = 'denegado'

    const products = [
      { name: 'Filigrana ancestral', cat: 'Joyería y orfebrería', country: 'Colombia', region: 'Mompox' },
      { name: 'Tejido en telar Wayúu', cat: 'Tejidos y textiles', country: 'Colombia', region: 'La Guajira' },
      { name: 'Cerámica negra', cat: 'Cerámica', country: 'Argentina', region: 'Catamarca' },
      { name: 'Mate con virola', cat: 'Joyería y orfebrería', country: 'Argentina', region: 'Salta' },
      { name: 'Sahumerio Andino', cat: 'Medicina ancestral', country: 'Bolivia', region: 'La Paz' },
      { name: 'Café de montaña', cat: 'Productos agroecológicos', country: 'Perú', region: 'Cusco' },
      { name: 'Libro Sabores Cósmicos', cat: 'Editorial', country: 'Argentina', region: 'Córdoba' },
      { name: 'Tejido Pasto', cat: 'Tejidos y textiles', country: 'Colombia', region: 'Nariño' },
      { name: 'Cocina ancestral NOA', cat: 'Cocina ancestral', country: 'Argentina', region: 'Jujuy' },
    ]
    const p = products[i % products.length]
    const authors = [
      'María Belén Bauló', 'Camila Montes', 'Flor Imbacuán Pantoja',
      'Beatriz Salazar', 'Pedro Huilca', 'Inés Curaca', 'Mario Tolaba',
      'Luna Espinoza', 'Rodrigo Salinas',
    ]
    const issuedYear = 2025
    const issuedMonth = ((i * 2) % 11) + 1
    const issuedDay = ((i * 3) % 27) + 1
    return {
      id: `CE-${String(i + 1).padStart(3, '0')}`,
      productName: p.name,
      authorName: authors[i % authors.length],
      authorAvatarUrl: `https://i.pravatar.cc/100?img=${20 + (i % 30)}`,
      scoreLabel: `${85 + (i % 15)}/100`,
      status,
      issuedAt: `${String(issuedDay).padStart(2, '0')}/${String(issuedMonth).padStart(2, '0')}/${String(issuedYear).slice(-2)}`,
      expiresAt: `${String(issuedDay).padStart(2, '0')}/${String(issuedMonth).padStart(2, '0')}/${String(issuedYear + 2).slice(-2)}`,
      category: p.cat,
      country: p.country,
      region: p.region,
    }
  }),
]

export const mockTutorAgenda: TutorAgendaItem[] = [
  {
    id: 'ag-001',
    caseId: 'CE-104',
    caseName: 'Tejido Wayúu',
    applicantName: 'Camila Montes',
    kind: 'kickoff',
    scheduledAt: '2026-05-15T10:00:00-03:00',
    durationMin: 45,
  },
  {
    id: 'ag-002',
    caseId: 'CE-108',
    caseName: 'Café artesanal de montaña',
    applicantName: 'Pedro Huilca',
    kind: 'auditoria',
    scheduledAt: '2026-05-18T14:00:00-03:00',
    durationMin: 60,
  },
  {
    id: 'ag-003',
    caseId: 'CE-105',
    caseName: 'Filigrana ancestral',
    applicantName: 'Luna Espinoza',
    kind: 'kickoff',
    scheduledAt: '2026-05-18T11:00:00-03:00',
    durationMin: 30,
  },
  {
    id: 'ag-004',
    caseId: 'CE-109',
    caseName: 'Sahumerio ceremonial',
    applicantName: 'Inés Curaca',
    kind: 'evaluacion',
    scheduledAt: '2026-05-19T15:30:00-03:00',
    durationMin: 60,
  },
  {
    id: 'ag-005',
    caseId: 'CE-110',
    caseName: 'Joyería filigrana tradicional',
    applicantName: 'Beatriz Salazar',
    kind: 'cierre',
    scheduledAt: '2026-05-22T10:00:00-03:00',
    durationMin: 30,
  },
]

// ─── Tutor scoring criteria definitions ──────────────────────────────────────

export const SCORING_CRITERIA: ScoringCriterionDef[] = [
  {
    id: 'tecnico',
    label: 'Conocimiento técnico',
    description:
      'Capacidad de evaluar productos y servicios bajo estándares de calidad, eficiencia y sostenibilidad ancestral.',
    weight: 18,
    subitems: [
      'Dominio del oficio y la técnica',
      'Calidad del proceso productivo',
      'Reproducibilidad del proceso',
    ],
  },
  {
    id: 'ambiental',
    label: 'Conocimiento ambiental',
    description:
      'Gestión responsable de los recursos naturales y prácticas sustentables.',
    weight: 14,
    subitems: [
      'Origen de materias primas',
      'Impacto ambiental del proceso',
      'Trazabilidad del recurso',
    ],
  },
  {
    id: 'cultural',
    label: 'Conocimiento cultural y ancestral',
    description:
      'Valoración y preservación de saberes tradicionales como parte fundamental de la identidad.',
    weight: 20,
    subitems: [
      'Vínculo con la comunidad de origen',
      'Continuidad generacional del saber',
      'Aval de referentes culturales',
    ],
  },
  {
    id: 'tecnologico',
    label: 'Conocimiento tecnológico',
    description:
      'Aplicación de herramientas innovadoras, digitalización y trazabilidad.',
    weight: 10,
    subitems: [
      'Trazabilidad digital del producto',
      'Adopción de tecnología sin perder identidad',
    ],
  },
  {
    id: 'social',
    label: 'Conocimiento social y territorial',
    description:
      'Dinámicas comunitarias, impacto social y arraigo territorial.',
    weight: 14,
    subitems: [
      'Impacto social del proyecto',
      'Vínculo territorial declarado',
      'Participación de la comunidad',
    ],
  },
  {
    id: 'estrategico',
    label: 'Conocimiento estratégico y empresarial',
    description:
      'Planificación, liderazgo, integración comercial y posicionamiento.',
    weight: 12,
    subitems: [
      'Plan de comercialización',
      'Sustentabilidad económica',
    ],
  },
  {
    id: 'normativo',
    label: 'Conocimiento normativo y de certificación',
    description:
      'Manejo de estándares, regulaciones y marcos de cumplimiento.',
    weight: 12,
    subitems: [
      'Documentación legal',
      'Cumplimiento de marco normativo local',
    ],
  },
]

// ─── Evaluaciones por caso (scoring + evidencias + notas) ────────────────────

export const mockScoringByCase: Record<string, ScoringValue[]> = {
  'CE-104': [
    { criterionId: 'tecnico', score: 9, comment: 'Dominio técnico excelente.' },
    { criterionId: 'ambiental', score: 8, comment: 'Buen uso de fibra natural.' },
    { criterionId: 'cultural', score: 10, comment: 'Aval comunitario sólido.' },
    { criterionId: 'tecnologico', score: 6 },
    { criterionId: 'social', score: 9, comment: 'Fuerte vínculo territorial.' },
    { criterionId: 'estrategico', score: 7 },
    { criterionId: 'normativo', score: 8 },
  ],
  'CE-108': [
    { criterionId: 'tecnico', score: 7 },
    { criterionId: 'ambiental', score: 9, comment: 'Sin agroquímicos.' },
    { criterionId: 'cultural', score: 8 },
    { criterionId: 'tecnologico', score: 5 },
    { criterionId: 'social', score: 7 },
    { criterionId: 'estrategico', score: 8 },
    { criterionId: 'normativo', score: 6, comment: 'Falta documentación tributaria.' },
  ],
}

export const mockEvidenceEvaluations: Record<
  string,
  Array<{ evidenceId: string; verdict: 'pending' | 'approved' | 'rejected' | 'clarify'; comment?: string }>
> = {
  'CE-104': [
    { evidenceId: 'e-001', verdict: 'approved', comment: 'Foto clara, fecha visible.' },
    { evidenceId: 'e-002', verdict: 'approved' },
    { evidenceId: 'e-003', verdict: 'clarify', comment: 'Necesito ver el proceso completo.' },
  ],
}

export const mockInternalNotes: InternalNote[] = [
  {
    id: 'note-001',
    caseId: 'CE-104',
    author: 'Juan Pérez',
    authorRole: 'tutor',
    body: 'Camila viene con muy buen track de la comunidad. Validar aval con la Mtra. Quispe antes de cerrar diagnóstico.',
    at: '2026-04-25T14:30:00-03:00',
    pinned: true,
  },
  {
    id: 'note-002',
    caseId: 'CE-104',
    author: 'Juan Pérez',
    authorRole: 'tutor',
    body: 'Falta validar la fecha de la foto de proceso. Pedí aclaración en evidencia e-003.',
    at: '2026-04-28T09:00:00-03:00',
  },
  {
    id: 'note-003',
    caseId: 'CE-108',
    author: 'Juan Pérez',
    authorRole: 'tutor',
    body: 'Pedro va bien, pero la documentación tributaria es un blocker para certificación final.',
    at: '2026-04-20T11:00:00-03:00',
  },
]

// ─── Bandeja de tareas del tutor ─────────────────────────────────────────────

export const mockTutorTasks: TutorTask[] = [
  {
    id: 'task-001',
    kind: 'review_evidence',
    title: 'Revisar 3 evidencias subidas',
    caseId: 'CE-104',
    caseName: 'Tejido Wayúu',
    applicantName: 'Camila Montes',
    priority: 'urgent',
    dueAt: '2026-05-14',
    done: false,
  },
  {
    id: 'task-002',
    kind: 'audit_meeting',
    title: 'Reunión inicial — preparar checklist',
    caseId: 'CE-105',
    caseName: 'Filigrana ancestral',
    applicantName: 'Luna Espinoza',
    priority: 'today',
    dueAt: '2026-05-18',
    done: false,
  },
  {
    id: 'task-003',
    kind: 'sign_evaluation',
    title: 'Firmar evaluación final',
    caseId: 'CE-109',
    caseName: 'Sahumerio ceremonial',
    applicantName: 'Inés Curaca',
    priority: 'today',
    dueAt: '2026-05-14',
    done: false,
  },
  {
    id: 'task-004',
    kind: 'call_applicant',
    title: 'Llamar para confirmar fechas',
    caseId: 'CE-108',
    caseName: 'Café artesanal de montaña',
    applicantName: 'Pedro Huilca',
    priority: 'this_week',
    dueAt: '2026-05-16',
    done: false,
  },
  {
    id: 'task-005',
    kind: 'verify_documentation',
    title: 'Verificar aval comunitario',
    caseId: 'CE-107',
    caseName: 'Tejido en telar Pasto',
    applicantName: 'Flor Imbacuán Pantoja',
    priority: 'this_week',
    done: false,
  },
  {
    id: 'task-006',
    kind: 'send_message',
    title: 'Responder mensaje pendiente',
    caseId: 'CE-106',
    caseName: 'Cocina ancestral del NOA',
    applicantName: 'Mario Tolaba',
    priority: 'urgent',
    dueAt: '2026-05-14',
    done: false,
  },
]

// ─── Plantillas de mensajes ──────────────────────────────────────────────────

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: 'tpl-evidence',
    kind: 'request_evidence',
    title: 'Pedir evidencias adicionales',
    body: 'Hola {nombre}, para avanzar con el diagnóstico necesito que subas:\n\n• 3 fotos claras del proceso completo\n• 1 video corto (1–2 min) del oficio en acción\n• Aval firmado por un referente de la comunidad\n\nGracias!',
  },
  {
    id: 'tpl-meeting',
    kind: 'schedule_meeting',
    title: 'Proponer reunión',
    body: 'Hola {nombre}, te propongo una videollamada el {fecha} a las {hora} para revisar tu solicitud. Confirmame si te queda cómodo el horario.',
  },
  {
    id: 'tpl-approve',
    kind: 'approve_stage',
    title: 'Aprobar etapa',
    body: '¡Excelente {nombre}! Aprobamos la etapa actual y avanzamos a la siguiente. Te llegará una notificación con los próximos pasos.',
  },
  {
    id: 'tpl-clarify',
    kind: 'request_clarification',
    title: 'Pedir aclaración',
    body: 'Hola {nombre}, necesito una aclaración sobre {detalle}. ¿Podés contarme un poco más?',
  },
  {
    id: 'tpl-reminder',
    kind: 'reminder',
    title: 'Recordatorio',
    body: 'Hola {nombre}, te recuerdo que tenés pendiente: {pendiente}. Si necesitás ayuda, avisame.',
  },
  {
    id: 'tpl-closing',
    kind: 'closing',
    title: 'Cierre del proceso',
    body: '¡Felicitaciones {nombre}! Completaste todas las etapas. Tu certificado se está firmando en blockchain y te llegará por email en las próximas horas.',
  },
]

// ─── SLA (días máximos por etapa) ────────────────────────────────────────────

export const STAGE_SLA_DAYS: Record<string, number> = {
  postulado: 3,
  'revision-inicial': 5,
  elegible: 7,
  diagnostico: 14,
  auditoria: 21,
  evaluacion: 10,
  certificacion: 7,
}
