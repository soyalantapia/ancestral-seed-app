import type {
  ApprovalSignature,
  Author,
  CertExpedienteEvidence,
  CertExpedienteNote,
  Certification,
  CertificationRequest,
  ChecklistCategory,
  ImprovementPlan,
  InternalNote,
  IssuedCertification,
  MessageTemplate,
  Notification,
  ScoringCriterionDef,
  ScoringValue,
  TutorAgendaItem,
  TutorCase,
  TutorMetrics,
  TutorNotification,
  TutorTask,
} from '@/types'

const PLACEHOLDER = '__placeholder__'

/**
 * Fix V4-TUT-05 (auditoría v4): la identidad del tutor estaba
 * literalmente hardcoded ("Lic. Juan Pérez" / "Juan Pérez") en 25+
 * lugares del módulo. V3-TUT-10 había centralizado vía `tutorIdentity`
 * pero solo migró 2 callsites externos — el grueso de los mocks
 * seguía con strings literales. Si alguien cambiaba `mockTutor.name`
 * los mensajes mock divergían del avatar/header.
 *
 * Ahora declaramos las constantes UNA VEZ al inicio del módulo,
 * antes de cualquier mock que las necesite. Cambiar la identidad =
 * cambiar 2 strings. El `mockTutor` y `tutorIdentity` derivan de
 * estos. Los strings narrativos en mensajes históricos también
 * los usan vía template literal.
 */
const TUTOR_NAME = 'Lic. Juan Pérez'
const TUTOR_SHORT_NAME = 'Juan Pérez'
const TUTOR_INITIALS = 'JP'

/**
 * Fix V2-POS-01 (auditoría v2): el mock estático tenía history.at
 * fijos en febrero–abril 2026, lo que hacía que el bloque
 * "Lo nuevo desde tu última visita" del DashboardHome se vea VACÍO
 * en cualquier demo posterior a esas fechas. Estos helpers generan
 * timestamps relativos a `Date.now()`.
 *
 * Fix V3-POS-15 (auditoría v3): antes los helpers se llamaban
 * INLINE en el array de history → se evaluaban UNA SOLA VEZ al
 * cargar el módulo. Si el reviewer abría el demo lunes y volvía
 * miércoles sin recargar la pestaña, h-008 seguía diciendo "hace 8h"
 * cuando eran 56h. Ahora los exponemos como `daysAgo`/`hoursAgo` PERO
 * el array de history usa el patrón `get at()` (getter) — cada
 * lectura recalcula el timestamp contra el `Date.now()` actual.
 */
// Helpers internos para el `relativeEvent` de abajo. Se mantienen
// como funciones nombradas (no inline) porque el módulo los puede
// reusar si futuro mock necesita un timestamp ISO una sola vez al
// cargar (en vez de evaluarse en cada lectura como el `relativeEvent`).
function _hoursAgo(h: number): string {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString()
}
function _daysAgo(d: number): string {
  return new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString()
}
void _hoursAgo
void _daysAgo

/**
 * Helper para definir un history event "relativo" cuya propiedad `at`
 * se recalcula en cada lectura. Pensado para los 3 events más recientes
 * del mock — el resto sigue con strings ISO fijos porque representan
 * eventos históricos reales del demo (creación, prediagnóstico, etc).
 */
function relativeEvent<T extends { id: string; kind: string }>(
  base: T & { title: string; description?: string; actor: string },
  offset: { days?: number; hours?: number },
): T & { title: string; description?: string; actor: string; readonly at: string } {
  return {
    ...base,
    get at(): string {
      const ms =
        (offset.days ?? 0) * 24 * 60 * 60 * 1000 +
        (offset.hours ?? 0) * 60 * 60 * 1000
      return new Date(Date.now() - ms).toISOString()
    },
  }
}

// `community` y `languages` son AUTODECLARADOS por cada autor en
// coordinación con su comunidad — NO inferimos por keyword (la
// identidad cultural es soberanía comunitaria). Cuando el dato no está
// confirmado por la persona, lo dejamos vacío y la UI lo señala como
// "Por confirmar con la comunidad".
export const mockAuthors: Author[] = [
  {
    id: 'a-camila',
    slug: 'camila-montes',
    name: 'Camila Montes',
    title: 'Directora creativa de Alunawa · Filigrana · San Juan de Pasto',
    bio: 'Soy Camila Montes, directora creativa de Alunawa, nuestra joyería en el centro de San Juan de Pasto (Nariño). Trabajo la filigrana ancestral, una técnica de orfebrería heredada y desarrollada en mi familia, en restauraciones, réplicas, diseños personalizados, alianzas matrimoniales y anillos de compromiso. Mi obra reinterpreta los saberes tradicionales de los Andes de Nariño en piezas de joyería contemporánea.',
    avatarUrl: '/authors/camila-montes.jpg',
    location: 'Colombia',
    email: 'camila.montes@ancestralseed.com',
    certificationsCount: 12,
    joinedAt: '2024-03-12',
    // Trabaja "en diálogo con" — referencia ancestral, no constituida.
    // En el formulario marcaría categoría "tradicional", pero no se
    // autoidentifica como miembro de los pueblos de Nariño.
    community: 'En diálogo con pueblos Pastos · Quillasingas',
    languages: ['Español'],
  },
  {
    id: 'a-belen',
    slug: 'maria-belen-baulo',
    name: 'María Belén Bauló',
    title: 'Autora · Sabores cósmicos',
    bio: 'Investigadora y escritora cordobesa dedicada a la alimentación consciente y su vínculo con los ciclos naturales. En Sabores Cósmicos reúne su estudio sobre cosmología, astromedicina y nutrición para proponer una relación más equilibrada entre el cuerpo, la comida y los ritmos del cosmos.',
    avatarUrl: '/authors/maria-belen-baulo.webp',
    location: 'Argentina · Córdoba',
    email: 'maria.baulo@ancestralseed.io',
    certificationsCount: 1,
    joinedAt: '2025-08-01',
    // Investigadora sin afiliación comunitaria declarada — categoría
    // "Inspiración cultural" del Reglamento 2.1.1.
    community: undefined,
    languages: ['Español'],
  },
  {
    id: 'a-flor',
    slug: 'flor-imbacuan-pantoja',
    name: 'Flor Imbacuán Pantoja',
    title: 'Tejedora del Pueblo de los Pastos',
    bio: 'Tejedora y diseñadora del Pueblo de los Pastos, en el Resguardo de Carlosama (Cuaspud), Nariño. Trabaja la guanga, el telar vertical ancestral, que aprendió de su madre, y fundó la marca de etnomoda Hajsú, donde teje junto a otras mujeres del territorio.',
    avatarUrl: '/authors/flor-imbacuan.jpg',
    location: 'Colombia · Nariño · Resguardo de Carlosama (Cuaspud)',
    email: 'flor.imbacuan@ancestralseed.io',
    certificationsCount: 1,
    joinedAt: '2024-11-15',
    // Pueblo de los Pastos — comunidad constituida y autoidentificada.
    // Lengua originaria (idioma pasto) hoy extinta; la comunidad habla español.
    // NOTA: "Awapít" (antes listado acá) es lengua del pueblo Awá, NO de los Pastos.
    community: 'Pueblo de los Pastos',
    languages: ['Español'],
  },
  {
    id: 'a-eco',
    slug: 'helida-leon',
    name: 'Helida León',
    title: 'Fundadora de Ecodestinos · Turismo regenerativo',
    bio: 'Fundadora y directora de Ecodestinos, operador colombiano de turismo regenerativo con más de 20 años de trayectoria. Desde Bogotá impulsa viajes responsables por toda Colombia, tejiendo alianzas con comunidades indígenas y locales para que el turismo sea una herramienta de conservación, empoderamiento y reconocimiento de los saberes ancestrales.',
    avatarUrl: 'https://i.pravatar.cc/300?img=44',
    location: 'Colombia · Bogotá',
    email: 'info@ecodestinos.com.co',
    certificationsCount: 1,
    joinedAt: '2024-05-02',
    // Ecodestinos (ecodestinos.com.co): operador de turismo de naturaleza,
    // sede en Bogotá. Trabaja con 50+ comunidades aliadas de Colombia
    // (Misak, Amazonía, etc.). Idiomas: español, inglés, francés.
    community: 'En alianza con comunidades de Colombia (Misak, Amazonía y más)',
    languages: ['Español', 'Inglés', 'Francés'],
  },
  {
    id: 'a-rosa',
    slug: 'rosa-villalba',
    name: 'Rosa Elena Villalba',
    title: 'Orfebre filigranista · Santa Cruz de Mompox',
    bio: 'Orfebre de Santa Cruz de Mompox, Bolívar, dedicada a la filigrana en plata. Aprendió el oficio de niña en el taller familiar, viendo a su madre y a su abuela trenzar el hilo de plata, y hoy lo transmite a las nuevas generaciones de su barrio. Sus piezas, flores, hojas y aretes, nacen de una tradición momposina que se conserva viva desde la época colonial.',
    avatarUrl: 'https://i.pravatar.cc/300?img=32',
    location: 'Colombia · Bolívar',
    email: 'rosa.villalba@ancestralseed.com',
    certificationsCount: 1,
    joinedAt: '2025-09-10',
    // Filigrana momposina: tradición orfebre mestiza de raíz colonial
    // (herencia andalusí adaptada en el Caribe colombiano). No es
    // comunidad indígena → categoría "tradicional" del Reglamento.
    community: 'Tradición filigranera de Santa Cruz de Mompox',
    languages: ['Español'],
  },
  {
    id: 'a-efrain',
    slug: 'efrain-jojoa',
    name: 'Segundo Efraín Jojoa',
    title: 'Caficultor del pueblo Quillacinga · Nariño',
    bio: 'Caficultor del pueblo indígena Quillacinga, en las montañas de Nariño. Cultiva café de altura bajo sombra en la chagra familiar, cosecha la cereza a mano y la seca al sol como le enseñaron sus mayores. Su trabajo sostiene la economía y la cultura de su comunidad, arraigada al territorio en torno a la Laguna de La Cocha.',
    avatarUrl: 'https://i.pravatar.cc/300?img=13',
    location: 'Colombia · Nariño',
    email: 'efrain.jojoa@ancestralseed.com',
    certificationsCount: 1,
    joinedAt: '2025-10-01',
    // Pueblo Quillacinga (Quillasinga) — comunidad indígena de Nariño,
    // en torno a la Laguna de La Cocha / El Encano. Lengua originaria
    // extinta; hoy hablan español → categoría "auténtico" del Reglamento.
    community: 'Pueblo Quillacinga',
    languages: ['Español'],
  },
  {
    id: 'a-jobando',
    slug: 'jose-obando',
    name: 'José Antonio Obando',
    title: 'Maestro barnizador · Barniz de Pasto',
    bio: 'Maestro del Barniz de Pasto, o Mopa-Mopa, en San Juan de Pasto, Nariño. Aprendió el oficio de niño en el taller de su familia y lleva más de treinta años estirando la resina de mopa-mopa con las manos y los dientes para vestir de color la madera. Sus piezas continúan una tradición que la UNESCO reconoció como Patrimonio de la Humanidad.',
    avatarUrl: 'https://i.pravatar.cc/300?img=51',
    location: 'Colombia · Nariño',
    email: 'jose.obando@ancestralseed.com',
    certificationsCount: 1,
    joinedAt: '2025-11-05',
    // Barniz de Pasto (Mopa-Mopa): oficio artesanal de raíz prehispánica
    // desarrollado por familias barnizadoras de Pasto. Patrimonio UNESCO 2020.
    community: 'Maestros del Barniz de Pasto (Mopa-Mopa)',
    languages: ['Español'],
  },
  {
    id: 'a-aurora',
    slug: 'aurora-bustos',
    name: 'Aurora Bustos',
    title: 'Hierbatera de las Sierras de Córdoba',
    bio: 'Hierbatera y sahumadora de las Sierras de Córdoba. Recorre el monte recolectando hierbas nativas —peperina, marcela, cedrón— que combina con rosas, caléndula y lavanda de su jardín. Aprendió el oficio de su abuela y compone blends para sahumar, infusionar y acompañar rituales de limpieza y bienestar.',
    avatarUrl: 'https://i.pravatar.cc/300?img=49',
    location: 'Argentina · Córdoba',
    email: 'aurora.bustos@ancestralseed.com',
    certificationsCount: 1,
    joinedAt: '2025-12-01',
    // Tradición herbolaria serrana de raíz comechingona y criolla.
    // Saber de las hierbas del monte cordobés → categoría "tradicional".
    community: 'Tradición herbolaria de las Sierras de Córdoba',
    languages: ['Español'],
  },
  {
    id: 'a-aida',
    slug: 'aida-domico',
    name: 'Aída Domicó',
    title: 'Artesana Embera · Chaquira',
    bio: 'Artesana del pueblo Embera dedicada al arte de la chaquira. Teje okamas —anchas pecheras de cuentas— y collares ceremoniales enhebrando miles de mostacillas cuenta por cuenta, siguiendo diseños que aprendió de las mujeres de su comunidad. Su trabajo mantiene viva una práctica ancestral que expresa la identidad, la cosmovisión y el territorio del pueblo Embera.',
    avatarUrl: 'https://i.pravatar.cc/300?img=47',
    location: 'Colombia · Chocó',
    email: 'aida.domico@ancestralseed.com',
    certificationsCount: 1,
    joinedAt: '2025-08-20',
    // Pueblo Embera — comunidad indígena de Colombia (Chocó/Antioquia/
    // Risaralda). Arte de la chaquira (mostacilla). Categoría "auténtico".
    community: 'Pueblo Embera',
    languages: ['Español', 'Emberá'],
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
    authorAvatarUrl: '/authors/camila-montes.jpg',
    issuedBy: 'Ancestral Seed Foundation',
    issuedAt: '2026-02-14',
    expiresAt: '2028-02-14',
    status: 'verified',
    category: 'Nariño',
    description:
      'Filigrana elaborada por Alunawa, la joyería de Camila Montes en San Juan de Pasto (Nariño). Una técnica de orfebrería heredada y desarrollada en su familia: hilos de metal extremadamente finos enrollados, trenzados y soldados a mano, sin procesos industriales. Restauraciones, réplicas, diseños personalizados, alianzas y anillos de compromiso, reinterpretando los saberes de los Andes de Nariño en joyería contemporánea.',
    coverUrl: '/gallery/alunawa/portada.jpg',
    hash: '0xA3F9C2D81E47B5106F3C2A99D8E1F4B7C0D5A2E69B8F1C4D3E2A1B0F9C8E7D6',
    officialCategory: 'tradicional',
    licenseStatus: 'vigente',
    licenseValidUntil: '2028-02-14',
    licenseNumber: 'AS-2026-001',
    location: 'Colombia · Nariño',
    mapQuery: 'San Juan de Pasto, Nariño, Colombia',
    contextParagraphs: [
      'Esta técnica mantiene un vínculo ancestral con los Andes de Nariño, transmitido a través de herencias familiares de comunidades del territorio en torno a San Juan de Pasto.',
      'Tiene raíces milenarias, con hallazgos en civilizaciones antiguas como Egipto y Grecia, y se desarrolló ampliamente en distintas regiones de América Latina, como Colombia, México y Perú, y Europa, especialmente en Portugal y España.',
    ],
    techniqueParagraphs: [
      'A lo largo del tiempo, la práctica se mantuvo viva gracias a la transmisión oral y a la práctica familiar, conservando su valor cultural y simbólico como una forma de expresión ligada a la paciencia, la precisión y el trabajo manual.',
      'La pieza es elaborada mediante trabajo manual, utilizando la técnica de enrollado y trenzado de hilos metálicos extremadamente finos. Cada elemento se construye y se une mediante soldadura artesanal, sin intervención de procesos industriales.',
    ],
    galleryUrls: [
      '/gallery/alunawa/01.jpg',
      '/gallery/alunawa/02.jpg',
      '/gallery/alunawa/03.jpg',
      '/gallery/alunawa/04.jpg',
      '/gallery/alunawa/05.jpg',
      '/gallery/alunawa/06.jpg',
      '/gallery/alunawa/07.jpg',
      '/gallery/alunawa/08.jpg',
    ],
    contact: {
      catalogUrl: '/docs/catalogo-alunawa-2022.pdf',
      catalogLabel: '2022',
      whatsappLabel: '+57 300 501 3477',
      whatsappUrl:
        'https://wa.me/573005013477?text=Hola%20Alunawa%2C%20vi%20su%20ficha%20en%20Ancestral%20Seed%20y%20quiero%20hacer%20una%20consulta.',
      facebookUrl: 'https://www.facebook.com/alunawa.accesorios',
      addressLine: 'Cra. 25 #13-52, centro de San Juan de Pasto',
      notes: ['Atención únicamente con agenda', 'Envíos a todo el país'],
    },
  },
  {
    id: 'c-sabores',
    slug: 'libro-sabores-cosmicos',
    title: 'Libro: Sabores cósmicos',
    authorId: 'a-belen',
    authorSlug: 'maria-belen-baulo',
    authorName: 'María Belén Bauló',
    authorAvatarUrl: '/authors/maria-belen-baulo.webp',
    issuedBy: 'Ancestral Seed Foundation',
    issuedAt: '2025-11-20',
    expiresAt: '2027-11-20',
    status: 'verified',
    category: 'Córdoba',
    description:
      '«La conexión de la alimentación con tu energía vital». Sabores Cósmicos es una obra de investigación y reflexión que reúne conocimientos vinculados a la alimentación consciente, los ciclos naturales y las tradiciones cosmológicas presentes en diversas culturas. El libro recupera prácticas como la observación de las fases lunares, las dietas asociadas a estos ciclos y algunos principios vinculados a la astromedicina, una disciplina antigua que estudiaba la relación entre los movimientos celestes y el funcionamiento del cuerpo humano.',
    coverUrl: '/cards/card-sabores-cosmicos.webp',
    hash: '0xC8D3B2A1F4E5D6C7B8A9F1E2D3C4B5A6F7E8D9C0B1A2F3E4D5C6B7A8F9E0D1C2',
    officialCategory: 'inspiracion',
    licenseStatus: 'vigente',
    licenseValidUntil: '2027-11-20',
    licenseNumber: 'AS-2025-002',
    location: 'Argentina · Córdoba',
    mapQuery: 'Córdoba, Argentina',
    contextParagraphs: [
      'El trabajo de investigación desarrollado en Sabores Cósmicos dialoga con tradiciones culturales que históricamente observaron los ciclos lunares y los ritmos naturales como guías para la vida cotidiana.',
      'A lo largo del tiempo, distintas civilizaciones desarrollaron calendarios y sistemas de conocimiento basados en los movimientos de los astros. Estas prácticas influían en aspectos fundamentales de la vida como la agricultura, la salud y la alimentación, integrando la observación del cielo con la comprensión del funcionamiento del cuerpo humano.',
      'Aunque muchos de estos saberes fueron desplazados por modelos modernos de vida y nutrición, continúan siendo parte de tradiciones culturales que conciben la alimentación y el bienestar como procesos vinculados a los ciclos naturales.',
    ],
    techniqueParagraphs: [
      'A través de una mirada contemporánea, la obra propone comprender el sentido cultural y energético que estas prácticas tenían dentro de las sociedades tradicionales, explorando cómo pueden reinterpretarse en el contexto actual para recuperar una relación más equilibrada entre la alimentación, el cuerpo y los ritmos de la naturaleza.',
      'El libro combina fundamentos teóricos con propuestas prácticas: calendarios lunares, agrupaciones de alimentos según su energía y recetas de estación, para que cada lectora y lector pueda llevar estos principios a su mesa cotidiana.',
    ],
    galleryUrls: [
      '/cards/card-sabores-cosmicos.webp',
      '/gallery/sabores-cosmicos/01-arte.webp',
      '/gallery/sabores-cosmicos/02-banner.webp',
      '/gallery/sabores-cosmicos/03-promo.webp',
      '/gallery/sabores-cosmicos/04-chef-whisk.webp',
      '/gallery/sabores-cosmicos/06-cafe.webp',
    ],
  },
  {
    id: 'c-tejido',
    slug: 'tejido-textil-tradicional',
    title: 'Tejido y diseño textil tradicional',
    authorId: 'a-flor',
    authorSlug: 'flor-imbacuan-pantoja',
    authorName: 'Flor Imbacuán Pantoja',
    authorAvatarUrl: '/authors/flor-imbacuan.jpg',
    issuedBy: 'Ancestral Seed Foundation',
    issuedAt: '2026-01-30',
    expiresAt: '2028-01-30',
    status: 'verified',
    category: 'Nariño',
    description:
      'Tradición textil del Pueblo de los Pastos, en el sur de Nariño, encarnada por Flor Imbacuán Pantoja, tejedora del Resguardo de Carlosama (municipio de Cuaspud). Las prendas se elaboran en guanga, el telar vertical precolombino con el que las mujeres del territorio transforman lana de oveja, hilada y teñida a mano, en ruanas, bufandas y diseños contemporáneos. Es un oficio que Flor heredó de su madre y que hoy comparte con otras tejedoras a través de su marca de etnomoda, Hajsú. En cada pieza el tejido conserva la iconografía y la cosmovisión andina del pueblo Pasto, transmitida de madres a hijas como un saber a la vez técnico, espiritual y comunitario.',
    coverUrl: '/gallery/flor/portada.jpg',
    hash: '0xB7E2A1F08C5D3E94B1A6F2C8D7E5A1B3F0C4D9E8A2B7C1D6F5E3A0B4C9D1E7F2',
    officialCategory: 'autentico',
    licenseStatus: 'vigente',
    licenseValidUntil: '2028-01-30',
    licenseNumber: 'AS-2026-003',
    location: 'Colombia · Nariño · Resguardo de Carlosama (Cuaspud)',
    mapQuery: 'Carlosama, Cuaspud, Nariño, Colombia',
    contextParagraphs: [
      'El tejido en guanga es uno de los saberes centrales del Pueblo de los Pastos, en los Andes del sur de Nariño. La guanga es un telar vertical de origen precolombino, en el que se tensan y entrelazan a mano los hilos hasta dar forma a ruanas, cobijas, bufandas, fajas y mochilas en lana de oveja. El oficio se transmite de madres a hijas y forma parte de la identidad y el patrimonio del territorio.',
      'Más allá de la prenda, el textil es para los Pastos una forma de escritura. En sus diseños recurren motivos de la cosmovisión andina, como el sol de los Pastos, el churo cósmico o espiral, y las escaleras, que ordenan el pensamiento, el tiempo y la relación con la naturaleza. Tejer es también una manera de recordar y de enseñar.',
      'La lengua originaria del Pueblo de los Pastos, el idioma pasto, se considera hoy extinta, y la comunidad se comunica en español, conservando topónimos y vocablos propios. (El awapít, que antes figuraba en esta ficha, no es lengua de los Pastos sino del vecino pueblo Awá.)',
    ],
    techniqueParagraphs: [
      'El proceso es enteramente manual y empieza mucho antes del telar: esquila de la oveja, cardado, hilado y torcido de la lana, lavado y secado de las madejas, y el teñido, que tradicionalmente se realiza con pigmentos naturales. Recién entonces se urde y se teje en la guanga, y al final se carda la prenda terminada. Cada etapa exige tiempo, paciencia y un conocimiento que no está escrito.',
      'Sobre esa base ancestral, Flor Imbacuán Pantoja trabaja como tejedora y diseñadora: aprendió la guanga de su madre desde la infancia y desarrolló la marca de etnomoda Hajsú, donde teje junto a otras mujeres del Resguardo de Carlosama. Allí el saber heredado se traduce en colecciones contemporáneas: ruanas y prendas en lana de oveja tejidas en guanga, que se han comercializado dentro y fuera de Colombia, manteniendo viva la técnica y el sustento de las familias tejedoras.',
    ],
    galleryUrls: ['/gallery/flor/01.jpg', '/gallery/flor/02.jpg'],
    contact: {
      whatsappLabel: '+57 321 721 2545',
      whatsappUrl:
        'https://wa.me/573217212545?text=Hola%20Hajs%C3%BA%2C%20vi%20la%20ficha%20de%20Flor%20en%20Ancestral%20Seed%20y%20quiero%20hacer%20una%20consulta.',
      instagramUrl: 'https://www.instagram.com/hajsu_etnomoda/',
      facebookUrl: 'https://www.facebook.com/hajsuetnomoda/',
      websiteUrl: 'https://www.hajsu.com.co',
      addressLine:
        'Hajsú Etnomoda · Barrio Tomás Cipriano, Cra. 1B #2-24, Carlosama (Cuaspud), Nariño',
      notes: [
        'Tejido en guanga, lana de oveja',
        'Envíos nacionales e internacionales',
      ],
    },
  },
  {
    id: 'c-ecodestinos',
    slug: 'ecodestinos-turismo-ancestral',
    title: 'Ecodestinos · Turismo regenerativo',
    authorId: 'a-eco',
    authorSlug: 'helida-leon',
    authorName: 'Helida León',
    authorAvatarUrl: 'https://i.pravatar.cc/300?img=44',
    issuedBy: 'Ancestral Seed Foundation',
    issuedAt: '2026-03-12',
    expiresAt: '2028-03-12',
    status: 'verified',
    category: 'Colombia',
    description:
      'Ecodestinos es un operador de turismo de naturaleza y experiencias culturales, con más de 20 años creando viajes regenerativos y responsables por Colombia. Bajo el lema «Viajes que inspiran sonrisas», diseña cada itinerario de la mano de comunidades locales, sabedores e intérpretes, para conectar a los viajeros con los territorios, sus ecosistemas y sus saberes ancestrales.',
    coverUrl: '/cards/card-ecodestinos-v2.webp',
    hash: '0xD9E4C3B2A1F0E5D6C7B8A9F1E2D3C4B5A6F7E8D9C0B1A2F3E4D5C6B7A8F9E0D1',
    officialCategory: 'tradicional',
    entityType: 'servicio',
    licenseStatus: 'vigente',
    licenseValidUntil: '2028-03-12',
    licenseNumber: 'AS-2026-004',
    location: 'Colombia · Bogotá',
    mapQuery: 'Bogotá, Colombia',
    contact: {
      catalogUrl: '/docs/catalogo-ecodestinos-2025.pdf',
      catalogLabel: 'Colombia 2025',
    },
    contextParagraphs: [
      'Con sede en Bogotá, Ecodestinos opera en 13 regiones de Colombia junto a más de 50 comunidades aliadas: desde Puerto Nariño y el río Amazonas hasta Caño Cristales (Meta), la comunidad Misak (Cauca), el Santuario de Las Lajas (Nariño), la Cascada Fin del Mundo (Putumayo) y los Cerros de Mavicure (Guainía).',
      'Su modelo es el turismo regenerativo: cada destino cuenta con la autorización de las comunidades locales, impulsa el empoderamiento comunitario, apoya más de 100 emprendimientos del territorio y promueve la conservación del entorno. «Pequeñas acciones provocan grandes cambios».',
    ],
    techniqueParagraphs: [
      'Cada experiencia se diseña de la mano de sabedores, intérpretes y prestadores locales, garantizando el reconocimiento de los saberes ancestrales y el consentimiento de las comunidades. Ecodestinos participa en espacios como la Cumbre de Turismo Indígena de las Américas.',
      'Los viajes se ofrecen como multidestinos, viajes temáticos, experiencias de bienestar y aventura, o itinerarios a la medida, siempre bajo estándares de sostenibilidad y bioseguridad, con atención en español, inglés y francés.',
    ],
    galleryUrls: [
      '/gallery/ecodestinos/01-mavicure.webp',
      '/gallery/ecodestinos/02-amazonas.webp',
      '/gallery/ecodestinos/03-san-agustin.webp',
      '/gallery/ecodestinos/04-rafting-sangil.webp',
      '/gallery/ecodestinos/05-cumbre-indigena.webp',
    ],
  },
  {
    id: 'c-joyeria',
    slug: 'joyeria-filigrana-tradicional',
    title: 'Joyería en filigrana momposina',
    authorId: 'a-rosa',
    authorSlug: 'rosa-villalba',
    authorName: 'Rosa Elena Villalba',
    authorAvatarUrl: 'https://i.pravatar.cc/300?img=32',
    issuedBy: 'Ancestral Seed Foundation',
    issuedAt: '2026-01-15',
    expiresAt: '2028-01-15',
    status: 'verified',
    category: 'Caribe colombiano',
    description:
      'Aretes, flores y hojas trabajados en filigrana de plata, una técnica de orfebrería que consiste en trenzar y soldar finísimos hilos de metal hasta formar encajes calados. En Santa Cruz de Mompox esta tradición se conserva viva desde la época colonial y se transmite de generación en generación dentro de los talleres familiares.',
    coverUrl: '/cards/card-joyeria-momposina.webp',
    hash: '0xE0F5D4C3B2A1F0E5D6C7B8A9F1E2D3C4B5A6F7E8D9C0B1A2F3E4D5C6B7A8F9E0',
    officialCategory: 'tradicional',
    entityType: 'producto',
    licenseStatus: 'vigente',
    licenseValidUntil: '2028-01-15',
    licenseNumber: 'AS-2026-005',
    location: 'Colombia · Bolívar',
    mapQuery: 'Santa Cruz de Mompox, Bolívar, Colombia',
    contextParagraphs: [
      'La filigrana momposina es una de las expresiones orfebres más reconocidas de Colombia. Llegó al Caribe con la tradición andalusí durante la Colonia y encontró en Santa Cruz de Mompox, puerto sobre el río Magdalena, un territorio donde florecer y volverse identidad.',
      'Durante siglos, las familias momposinas convirtieron el oficio en herencia: los saberes pasan de madres a hijas en talleres de barrio, y las piezas acompañan celebraciones, dotes y las procesiones de la Semana Santa momposina.',
    ],
    techniqueParagraphs: [
      'La filigrana parte de la plata ley 0.950 estirada en hilos finísimos. El orfebre los tuerce de a dos formando el «cordón», y con pinzas los enrolla y dobla para armar volutas, mallas y pétalos que rellenan el contorno de cada figura.',
      'Todo se une con soldadura de plata a la llama, sin moldes ni piezas industriales: cada flor, hoja o arete es único y se realiza enteramente a mano. El brillo final se logra con un blanqueado tradicional que resalta el encaje de metal.',
    ],
    galleryUrls: [
      '/cards/card-joyeria-momposina.webp',
      '/gallery/joyeria-filigrana/01-coleccion.webp',
      '/gallery/joyeria-filigrana/02-aros-caja.webp',
      '/gallery/joyeria-filigrana/03-flor-amatista.webp',
    ],
  },
  {
    id: 'c-mopa',
    slug: 'tecnica-mopa-mopa',
    title: 'Barniz de Pasto (Mopa-Mopa)',
    authorId: 'a-jobando',
    authorSlug: 'jose-obando',
    authorName: 'José Antonio Obando',
    authorAvatarUrl: 'https://i.pravatar.cc/300?img=51',
    issuedBy: 'Ancestral Seed Foundation',
    issuedAt: '2026-02-10',
    expiresAt: '2028-02-10',
    status: 'verified',
    category: 'Nariño',
    description:
      'Objetos de madera decorados con la técnica del Barniz de Pasto, o Mopa-Mopa: una resina vegetal que se estira a mano hasta formar láminas finísimas, se tiñe con colores intensos y se aplica sobre la superficie tallada. Es uno de los oficios más emblemáticos de San Juan de Pasto, reconocido por la UNESCO como Patrimonio Cultural Inmaterial de la Humanidad.',
    coverUrl: '/cards/card-mopa-pasto.webp',
    hash: '0xF1A6E5D4C3B2A1F0E5D6C7B8A9F1E2D3C4B5A6F7E8D9C0B1A2F3E4D5C6B7A8F9',
    officialCategory: 'tradicional',
    entityType: 'producto',
    licenseStatus: 'vigente',
    licenseValidUntil: '2028-02-10',
    licenseNumber: 'AS-2026-006',
    location: 'Colombia · Nariño',
    mapQuery: 'San Juan de Pasto, Nariño, Colombia',
    contextParagraphs: [
      'El Barniz de Pasto hunde sus raíces en tiempos prehispánicos: los pueblos del sur andino ya usaban la resina de mopa-mopa para embellecer y proteger sus objetos. En la Colonia, los talleres de Pasto llevaron la técnica a su máxima expresión, combinando motivos indígenas, europeos y propios.',
      'En 2020, la UNESCO inscribió los saberes y técnicas del Barniz de Pasto Mopa-Mopa en la Lista Representativa del Patrimonio Cultural Inmaterial de la Humanidad, reconociendo un oficio que se transmite de maestros a aprendices dentro de las familias barnizadoras.',
    ],
    techniqueParagraphs: [
      'La resina se extrae de los brotes del arbusto de mopa-mopa (Elaeagia pastoensis), que crece en la selva del Putumayo. Los maestros la limpian, la calientan y la estiran con las manos y los dientes hasta obtener láminas traslúcidas y elásticas como un velo.',
      'Cada lámina se tiñe con pigmentos, se recorta en figuras y se adhiere sobre la madera con el calor, capa sobre capa. El resultado es una superficie brillante y de colores profundos, con diseños geométricos y florales que ningún proceso industrial puede imitar.',
    ],
    galleryUrls: [
      '/cards/card-mopa-pasto.webp',
      '/gallery/mopa-mopa/01-vasija-greca.webp',
      '/gallery/mopa-mopa/02-taller.webp',
      '/gallery/mopa-mopa/03-coleccion.webp',
      '/gallery/mopa-mopa/04-pulseras.webp',
    ],
  },
  {
    id: 'c-chaquira',
    slug: 'tecnica-chaquira-ceremonial',
    title: 'Chaquira ceremonial indígena',
    authorId: 'a-aida',
    authorSlug: 'aida-domico',
    authorName: 'Aída Domicó',
    authorAvatarUrl: 'https://i.pravatar.cc/300?img=47',
    issuedBy: 'Ancestral Seed Foundation',
    issuedAt: '2026-02-18',
    expiresAt: '2028-02-18',
    status: 'verified',
    category: 'Colombia',
    description:
      'Collares, pecheras y okamas tejidos en chaquira (mostacilla) por artesanas del pueblo Embera. Cuenta por cuenta se enhebran miles de chaquiras hasta formar diseños geométricos y figuras de la cosmovisión indígena. Cada pieza es ceremonial y ornamental a la vez, y expresa la identidad del territorio.',
    coverUrl: '/cards/card-chaquira-embera.webp',
    hash: '0xA2B7C1D6F5E3A0B4C9D1E7F2B7E2A1F08C5D3E94B1A6F2C8D7E5A1B3F0C4D9E8',
    officialCategory: 'autentico',
    entityType: 'producto',
    licenseStatus: 'vigente',
    licenseValidUntil: '2028-02-18',
    licenseNumber: 'AS-2026-007',
    location: 'Colombia · Chocó',
    mapQuery: 'Chocó, Colombia',
    contextParagraphs: [
      'La chaquira es el arte del abalorio entre los pueblos indígenas de Colombia. Para el pueblo Embera, tejer con mostacilla es una práctica ancestral y femenina: las okamas —anchas pecheras de cuentas— y los collares acompañan celebraciones, rituales y la vida cotidiana como símbolo de identidad y protección.',
      'Los colores y las figuras —rombos, flores, aves, montañas— no son sólo decorativos: narran la relación del pueblo con la selva, el río y el cosmos. El saber se transmite de madres a hijas, sentadas juntas frente al tejido de cuentas.',
    ],
    techniqueParagraphs: [
      'La artesana enhebra miles de chaquiras diminutas en hilo o nylon, cuenta por cuenta, siguiendo patrones que lleva en la memoria. Sin moldes ni máquinas: la geometría se arma con la tensión precisa de cada hilera.',
      'Una okama puede llevar semanas de trabajo y decenas de miles de cuentas. El resultado es una pieza flexible y luminosa, de colores intensos, única e imposible de reproducir de forma industrial.',
    ],
    galleryUrls: [
      '/cards/card-chaquira-embera.webp',
      '/gallery/chaquira-embera/01-detalle.webp',
      '/gallery/chaquira-embera/02-mostacilla.webp',
      '/gallery/chaquira-embera/03-tejiendo.webp',
      '/gallery/chaquira-embera/04-manos.webp',
    ],
  },
  {
    id: 'c-sahumerio',
    slug: 'sahumerio-limpieza-espiritual',
    title: 'Blend Herbal Ancestral',
    authorId: 'a-aurora',
    authorSlug: 'aurora-bustos',
    authorName: 'Aurora Bustos',
    authorAvatarUrl: 'https://i.pravatar.cc/300?img=49',
    issuedBy: 'Ancestral Seed Foundation',
    issuedAt: '2026-02-14',
    expiresAt: '2028-02-14',
    status: 'verified',
    category: 'Córdoba',
    description:
      'Blend de hierbas y flores secas —rosas, caléndula, lavanda y aromáticas de las sierras— compuesto de forma artesanal para sahumar, infusionar y acompañar rituales de limpieza y bienestar. Cada mezcla nace de un saber herbolario transmitido por generaciones en las Sierras de Córdoba.',
    coverUrl: '/cards/card-blend-herbal.webp',
    hash: '0xB1A2F3E4D5C6B7A8F9E0D1C2C8D3B2A1F4E5D6C7B8A9F1E2D3C4B5A6F7E8D9C0',
    officialCategory: 'tradicional',
    entityType: 'producto',
    licenseStatus: 'vigente',
    licenseValidUntil: '2028-02-14',
    licenseNumber: 'AS-2026-008',
    location: 'Argentina · Córdoba',
    mapQuery: 'Sierras de Córdoba, Argentina',
    contextParagraphs: [
      'Las Sierras de Córdoba guardan una honda tradición herbolaria de raíz comechingona y criolla. Desde tiempos ancestrales, sus pobladores conocen las hierbas del monte —peperina, poleo, cedrón, marcela— y su uso para el cuerpo, el hogar y el espíritu.',
      'El sahumar —quemar hierbas para limpiar y armonizar los espacios— es una práctica viva que combina el saber de los pueblos originarios con las plantas del jardín y del campo. El blend continúa ese diálogo entre lo nativo y lo cultivado.',
    ],
    techniqueParagraphs: [
      'Las hierbas se recolectan a mano en el momento justo de cada planta, se secan a la sombra para conservar sus aromas y sus principios, y se separan hoja por hoja antes de mezclarse.',
      'La composición se arma en pequeñas tandas, equilibrando hierbas verdes, flores y pétalos —rosa, caléndula, lavanda— para lograr un blend aromático y armónico. Nada se muele industrialmente: la mezcla conserva la textura y el color de cada planta.',
    ],
    galleryUrls: [
      '/cards/card-blend-herbal.webp',
      '/gallery/blend-herbal/01-bowl-cobre.webp',
      '/gallery/blend-herbal/02-canela.webp',
      '/gallery/blend-herbal/03-bowl-madera.webp',
      '/gallery/blend-herbal/04-mezcla.webp',
    ],
  },
  {
    id: 'c-cafe',
    slug: 'cafe-artesanal-de-montana',
    title: 'Café ancestral Quillacinga',
    authorId: 'a-efrain',
    authorSlug: 'efrain-jojoa',
    authorName: 'Segundo Efraín Jojoa',
    authorAvatarUrl: 'https://i.pravatar.cc/300?img=13',
    issuedBy: 'Ancestral Seed Foundation',
    issuedAt: '2026-02-01',
    expiresAt: '2028-02-01',
    status: 'verified',
    category: 'Nariño',
    description:
      'Café de altura cultivado y procesado por familias del pueblo indígena Quillacinga en las montañas de Nariño. Los granos se cosechan a mano, cereza por cereza, y se secan al sol siguiendo prácticas transmitidas por generaciones, en armonía con los ciclos de la tierra y el territorio ancestral.',
    coverUrl: '/cards/card-cafe-quillacinga.webp',
    hash: '0xC7B8A9F1E2D3C4B5A6F7E8D9C0B1A2F3E4D5C6B7A8F9E0D1A2F3E4D5C6B7A8F9',
    officialCategory: 'autentico',
    entityType: 'producto',
    licenseStatus: 'vigente',
    licenseValidUntil: '2028-02-01',
    licenseNumber: 'AS-2026-009',
    location: 'Colombia · Nariño',
    mapQuery: 'Buesaco, Nariño, Colombia',
    contextParagraphs: [
      'El pueblo Quillacinga habita desde tiempos precolombinos el altiplano de Nariño, en torno a la Laguna de La Cocha y las montañas del sur de Colombia. Su relación con la tierra, el agua, la chagra y la montaña, es el centro de su identidad y de su forma de producir.',
      'En estas laderas de gran altitud, las familias cultivan un café de origen bajo sombra, integrado al bosque y a la huerta tradicional. Cada cosecha es un trabajo comunitario que sostiene la economía y la cultura del territorio.',
    ],
    techniqueParagraphs: [
      'El café crece entre 1.800 y 2.100 metros sobre el nivel del mar, bajo sombra de árboles nativos que protegen el suelo y la biodiversidad. La cereza se recolecta a mano, seleccionando sólo los frutos maduros.',
      'El beneficio es artesanal: despulpado, fermentación controlada y secado al sol, sin maquinaria industrial. El resultado es un café de taza limpia y dulce, con la acidez brillante característica de las montañas de Nariño.',
    ],
    galleryUrls: [
      '/cards/card-cafe-quillacinga.webp',
      '/gallery/cafe-quillacinga/01-grano-verde.webp',
      '/gallery/cafe-quillacinga/02-secado.webp',
      '/gallery/cafe-quillacinga/03-tostado.webp',
    ],
  },
]

export const mockCategories = [
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
  // Postulante + tutor (multi-rol): puede entrar a /tutor sin perder el panel de solicitante.
  role: 'postulante' as const,
  roles: ['postulante', 'tutor'] as const,
}

export const PLACEHOLDER_TOKEN = PLACEHOLDER

// ─── Dashboard mocks ─────────────────────────────────────────────────────────

export const mockCertificationRequests: CertificationRequest[] = [
  // Demo enfocado: UNA sola certificación, en curso (pendiente). Toda la
  // experiencia —lista, pagos, seguimiento, tutorial— gira en torno a ésta.
  {
    id: 'req-001',
    number: '#001',
    productName: 'Filigrana ancestral',
    createdAt: '2026-02-01',
    currentStage: 'prediagnostico',
    status: 'En curso',
    progressLabel: 'Revisión inicial por tutor',
    diagnosticDeadline: '15/03',
    diagnosticCompleted: false,
    pendingItems: ['Diagnóstico inicial', 'Auditoría pendiente'],
    stages: [
      {
        stage: 'prediagnostico',
        label: 'Prediagnóstico',
        status: 'in_progress',
        date: '05/02/2026',
        description: 'El tutor está revisando tu documentación inicial.',
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
        auditorName: TUTOR_NAME,
        type: 'Videollamada',
        scheduledAt: '2026-02-12T10:00:00-03:00',
        timezone: 'GMT-3',
        message:
          'Hola Camila, te propongo una primera reunión para revisar la documentación que enviaste. Confirmame si te queda cómodo el horario.',
        status: 'pending',
      },
    ],
    scheduledMeetings: [],
    // Evidencias = las mismas fotos de la ficha pública (galería Alunawa),
    // así el material del expediente coincide con lo que se ve certificado.
    evidences: [
      { id: 'e-001', name: 'filigrana-pieza-frente.jpg', kind: 'image', sizeKb: 404, uploadedAt: '2026-02-02T10:15:00-03:00', thumbUrl: '/gallery/alunawa/01.jpg' },
      { id: 'e-002', name: 'filigrana-detalle.jpg', kind: 'image', sizeKb: 453, uploadedAt: '2026-02-02T10:16:00-03:00', thumbUrl: '/gallery/alunawa/02.jpg' },
      { id: 'e-003', name: 'proceso-hilado.jpg', kind: 'image', sizeKb: 348, uploadedAt: '2026-02-02T10:18:00-03:00', thumbUrl: '/gallery/alunawa/03.jpg' },
      { id: 'e-004', name: 'soldadura-artesanal.jpg', kind: 'image', sizeKb: 389, uploadedAt: '2026-02-02T10:19:00-03:00', thumbUrl: '/gallery/alunawa/04.jpg' },
      { id: 'e-005', name: 'pieza-terminada.jpg', kind: 'image', sizeKb: 193, uploadedAt: '2026-02-02T10:20:00-03:00', thumbUrl: '/gallery/alunawa/05.jpg' },
      { id: 'e-006', name: 'anillo-filigrana.jpg', kind: 'image', sizeKb: 207, uploadedAt: '2026-02-02T10:21:00-03:00', thumbUrl: '/gallery/alunawa/06.jpg' },
      { id: 'e-007', name: 'coleccion-alunawa.jpg', kind: 'image', sizeKb: 297, uploadedAt: '2026-02-02T10:22:00-03:00', thumbUrl: '/gallery/alunawa/07.jpg' },
      { id: 'e-008', name: 'taller-detalle.jpg', kind: 'image', sizeKb: 355, uploadedAt: '2026-02-02T10:23:00-03:00', thumbUrl: '/gallery/alunawa/08.jpg' },
      { id: 'e-009', name: 'video-proceso.mp4', kind: 'video', sizeKb: 18200, uploadedAt: '2026-02-02T10:24:00-03:00' },
      { id: 'e-010', name: 'aval-comunidad.pdf', kind: 'document', sizeKb: 320, uploadedAt: '2026-02-03T16:42:00-03:00' },
    ],
    payments: [
      {
        id: 'p-001',
        concept: 'Inicio de proceso de certificación',
        amount: 45000,
        currency: 'ARS',
        status: 'pending',
        // Primer arancel: pendiente pero NO vencido (no es una deuda, es el
        // paso para arrancar). Fecha holgada a futuro para no alarmar.
        dueDate: '2026-06-30',
      },
    ],
    history: [
      { id: 'h-001', kind: 'request_created', title: 'Solicitud creada', actor: 'Tú', at: '2026-02-01T18:30:00-03:00' },
      { id: 'h-002', kind: 'evidence_uploaded', title: 'Evidencias iniciales', description: '4 fotos + 1 video', actor: 'Tú', at: '2026-02-02T10:18:00-03:00' },
      { id: 'h-003', kind: 'document_uploaded', title: 'Aval de la comunidad', description: 'aval-comunidad.pdf', actor: 'Tú', at: '2026-02-03T16:42:00-03:00' },
      { id: 'h-004', kind: 'stage_changed', title: 'Etapa Prediagnóstico iniciada', description: `Auditoría asignada a ${TUTOR_NAME}`, actor: 'Sistema', at: '2026-02-05T09:00:00-03:00' },
      { id: 'h-005', kind: 'audit_proposed', title: 'Propuesta de reunión', description: '12/02 a las 10:00 GMT-3', actor: 'Tutor', at: '2026-02-06T11:30:00-03:00' },
      // Fix V2-POS-01: eventos relativos a "hoy" para que el bloque
      // "Lo nuevo desde tu última visita" del DashboardHome SIEMPRE
      // tenga algo que mostrar en demo, sin importar la fecha.
      //
      // Fix V3-POS-15 (auditoría v3): usamos `relativeEvent` con
      // getter — el `at` se recalcula en cada lectura contra el
      // `Date.now()` actual, no contra el momento de carga del módulo.
      // Soporta sesiones largas del demo sin reload.
      relativeEvent({ id: 'h-006', kind: 'message_sent', title: 'Mensaje del tutor', description: `${TUTOR_NAME} te respondió sobre los hilos de plata`, actor: 'Tutor' }, { days: 3 }),
      relativeEvent({ id: 'h-007', kind: 'evidence_uploaded', title: 'Foto adicional del proceso', description: 'detalle-soldadura.jpg', actor: 'Tú' }, { days: 1 }),
      relativeEvent({ id: 'h-008', kind: 'message_sent', title: 'Recordatorio del tutor', description: 'Quedan 2 evidencias pendientes para cerrar el slot', actor: 'Tutor' }, { hours: 8 }),
    ],
    threads: {
      'm-001': [
        { id: 'msg-001', author: 'tutor', authorName: TUTOR_NAME, body: 'Hola Camila, te propongo una primera reunión para revisar la documentación que enviaste. Confirmame si te queda cómodo el horario.', at: '2026-02-06T11:30:00-03:00' },
      ],
    },
    submittedData: {
      applicantName: 'Camila Montes',
      email: 'camila@ancestralseed.org',
      phone: '+57 300 501 3477',
      country: 'Colombia',
      region: 'Nariño',
      community: 'San Juan de Pasto, Nariño',
      inspirationCommunity: 'Pueblos Pastos y Quillasingas',
      productType: 'Producto físico',
      productSector: 'Joyería y orfebrería',
      productSubcategory: 'Filigrana',
      processDescription: 'Trabajo manual con hilos extremadamente finos de plata, mediante la técnica de enrollado y trenzado, soldadura artesanal y terminación a mano.',
      producerType: 'Yo misma · con apoyo familiar',
    },
  },
  // Certificación EMITIDA — habilita en la UI los flujos "Renovar" y "Plan
  // de mejora" (antes inalcanzables: ningún request estaba en estado final).
  {
    id: 'req-002',
    number: '#002',
    productName: 'Tejido en telar tradicional',
    createdAt: '2025-09-10',
    currentStage: 'certificacion',
    status: 'Certificado',
    progressLabel: 'Certificación emitida',
    diagnosticCompleted: true,
    pendingItems: [],
    stages: [
      { stage: 'prediagnostico', label: 'Prediagnóstico', status: 'completed', date: '12/09/2025', description: 'Documentación inicial revisada por el tutor.' },
      { stage: 'inicio', label: 'Inicio del proceso', status: 'completed' },
      { stage: 'diagnostico', label: 'Diagnóstico', status: 'completed' },
      { stage: 'auditoria', label: 'Auditoría', status: 'completed' },
      { stage: 'evaluacion', label: 'Evaluación', status: 'completed' },
      { stage: 'certificacion', label: 'Certificación', status: 'completed', date: '20/11/2025', description: 'Certificado emitido y publicado en el directorio.' },
    ],
    meetings: [],
    scheduledMeetings: [],
    evidences: [],
    payments: [],
    history: [
      { id: 'h2-001', kind: 'request_created', title: 'Solicitud creada', actor: 'Tú', at: '2025-09-10T10:00:00-03:00' },
      { id: 'h2-002', kind: 'stage_changed', title: 'Certificación emitida', description: 'Tu producto quedó certificado y publicado.', actor: 'Sistema', at: '2025-11-20T16:00:00-03:00' },
    ],
    threads: {},
    submittedData: {
      applicantName: 'Camila Montes',
      email: 'camila@ancestralseed.org',
      phone: '+57 2345-6789',
      country: 'Colombia',
      region: 'Nariño',
      community: 'Pastos · Quillasingas',
      productType: 'Producto físico',
      productSector: 'Tejidos y textiles',
      productSubcategory: 'Telar',
      processDescription: 'Tejido en telar de pedal con fibras naturales teñidas con tintes vegetales, siguiendo patrones tradicionales de Nariño.',
      producerType: 'Yo misma · con apoyo de la comunidad',
    },
  },
  // Solicitud DENEGADA — habilita el flujo "Apelar" (la apelación existe
  // justamente porque una certificación puede denegarse; framing procedural).
  {
    id: 'req-003',
    number: '#003',
    productName: 'Cerámica esmaltada',
    createdAt: '2025-06-15',
    currentStage: 'evaluacion',
    status: 'Denegada',
    progressLabel: 'Solicitud denegada — podés apelar',
    diagnosticCompleted: true,
    pendingItems: [],
    stages: [
      { stage: 'prediagnostico', label: 'Prediagnóstico', status: 'completed' },
      { stage: 'inicio', label: 'Inicio del proceso', status: 'completed' },
      { stage: 'diagnostico', label: 'Diagnóstico', status: 'completed' },
      { stage: 'auditoria', label: 'Auditoría', status: 'completed' },
      { stage: 'evaluacion', label: 'Evaluación', status: 'completed', date: '08/08/2025', description: 'El comité no encontró evidencia documental suficiente del origen ancestral declarado. Podés apelar aportando documentación adicional.' },
      { stage: 'certificacion', label: 'Certificación', status: 'pending' },
    ],
    meetings: [],
    scheduledMeetings: [],
    evidences: [],
    payments: [],
    history: [
      { id: 'h3-001', kind: 'request_created', title: 'Solicitud creada', actor: 'Tú', at: '2025-06-15T09:00:00-03:00' },
      { id: 'h3-002', kind: 'stage_changed', title: 'Solicitud denegada', description: 'El comité solicitó documentación adicional.', actor: 'Sistema', at: '2025-08-08T15:00:00-03:00' },
    ],
    threads: {},
    submittedData: {
      applicantName: 'Camila Montes',
      email: 'camila@ancestralseed.org',
      phone: '+57 2345-6789',
      country: 'Colombia',
      region: 'Nariño',
      community: 'Pastos · Quillasingas',
      productType: 'Producto físico',
      productSector: 'Cerámica',
      productSubcategory: 'Esmaltada',
      processDescription: 'Cerámica modelada y esmaltada a mano con técnicas tradicionales.',
      producerType: 'Yo misma',
    },
  },
]

export const mockNotifications: Notification[] = [
  {
    id: 'n-001',
    kind: 'audit_proposed',
    title: 'Nueva propuesta de auditoría',
    body: `${TUTOR_NAME} propuso una videollamada el 12/02 a las 10:00 (GMT-3) para Filigrana ancestral.`,
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
  name: TUTOR_NAME,
  email: 'juan.perez@ancestralseed.io',
  avatarUrl: 'https://i.pravatar.cc/200?img=15',
}

/**
 * Fix V3-TUT-10 + V4-TUT-03 + V4-TUT-05 (auditoría v3+v4):
 *
 * V3-TUT-10: la identidad estaba duplicada en múltiples lugares.
 * V4-TUT-03: el regex `^Lic\.\s+` no cubría otros honoríficos
 * (Dra, Mtra, Antrop, etc.). Si el mock cambiaba al "Dra. María
 * Quispe", `shortName` quedaba con el "Dra." pegado.
 * V4-TUT-05: los strings narrativos del mock seguían hardcoded.
 *
 * Ahora derivamos de las constantes TUTOR_* declaradas al inicio
 * del módulo. Cambiar la identidad = cambiar 3 constantes y todos
 * los mocks/UI se actualizan en cascada. El regex se amplió para
 * incluir los honoríficos comunes de auditoría cultural.
 */
const HONORIFIC_PREFIX_REGEX =
  /^(Lic|Dr|Dra|Mtra|Mtro|Antrop|Ing|Prof|Mg|Mgtr)\.\s+/

export const tutorIdentity = {
  id: mockTutor.id,
  name: TUTOR_NAME,
  /** El nombre "corto" sin la titulación (para iniciales y firmas). */
  shortName: TUTOR_SHORT_NAME,
  initials: TUTOR_INITIALS,
} as const

// Re-export del regex por si futuras identidades se necesitan
// derivar dinámicamente desde un nombre con honorífico desconocido.
export const stripHonorific = (name: string): string =>
  name.replace(HONORIFIC_PREFIX_REGEX, '')

export const mockTutorCases: TutorCase[] = [
  // Postulados (sin tutor asignado)
  {
    id: 'CE-101',
    productName: 'Barniz de Pasto (Mopa-Mopa)',
    applicantName: 'José Antonio Obando',
    applicantAvatarUrl: 'https://i.pravatar.cc/200?img=51',
    scoringIA: 93,
    risk: 'bajo',
    pendingItems: [],
    stage: 'postulado',
    category: 'Arte y artesanía',
    country: 'Colombia',
    region: 'Nariño',
    createdAt: '2026-05-09T10:00:00-03:00',
  },
  {
    id: 'CE-102',
    productName: 'Blend Herbal Ancestral',
    applicantName: 'Aurora Bustos',
    applicantAvatarUrl: 'https://i.pravatar.cc/200?img=49',
    scoringIA: 80,
    risk: 'medio',
    pendingItems: [],
    stage: 'postulado',
    category: 'Medicina ancestral',
    country: 'Argentina',
    region: 'Córdoba',
    createdAt: '2026-05-08T11:30:00-03:00',
  },
  // Revisión inicial
  {
    id: 'CE-103',
    productName: 'Café ancestral Quillacinga',
    applicantName: 'Segundo Efraín Jojoa',
    applicantAvatarUrl: 'https://i.pravatar.cc/200?img=13',
    scoringIA: 88,
    risk: 'bajo',
    pendingItems: [],
    stage: 'revision-inicial',
    tutorId: 't-001',
    tutorName: TUTOR_SHORT_NAME,
    tutorAvatarUrl: 'https://i.pravatar.cc/200?img=15',
    category: 'Productos agroecológicos',
    country: 'Colombia',
    region: 'Nariño',
    createdAt: '2026-05-05T09:15:00-03:00',
  },
  // Elegible
  {
    id: 'CE-104',
    productName: 'Ecodestinos · Turismo regenerativo',
    applicantName: 'Helida León',
    applicantAvatarUrl: 'https://i.pravatar.cc/200?img=44',
    scoringIA: 90,
    risk: 'bajo',
    pendingItems: ['Evidencias'],
    stage: 'elegible',
    tutorId: 't-001',
    tutorName: TUTOR_SHORT_NAME,
    tutorAvatarUrl: 'https://i.pravatar.cc/200?img=15',
    category: 'Turismo regenerativo',
    country: 'Colombia',
    region: 'Bogotá',
    createdAt: '2026-04-22T14:00:00-03:00',
  },
  {
    id: 'CE-105',
    productName: 'Joyería en filigrana momposina',
    applicantName: 'Rosa Elena Villalba',
    applicantAvatarUrl: 'https://i.pravatar.cc/200?img=32',
    scoringIA: 95,
    risk: 'bajo',
    pendingItems: [],
    stage: 'elegible',
    tutorId: 't-001',
    tutorName: TUTOR_SHORT_NAME,
    tutorAvatarUrl: 'https://i.pravatar.cc/200?img=15',
    category: 'Joyería y orfebrería',
    country: 'Colombia',
    region: 'Bolívar',
    createdAt: '2026-04-18T10:00:00-03:00',
  },
  // Diagnóstico
  {
    id: 'CE-106',
    productName: 'Tejido y diseño textil tradicional',
    applicantName: 'Flor Imbacuán Pantoja',
    applicantAvatarUrl: '/authors/flor-imbacuan.jpg',
    scoringIA: 92,
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
    id: 'CE-107',
    productName: 'Técnica ancestral: Filigrana',
    applicantName: 'Camila Montes',
    applicantAvatarUrl: '/authors/camila-montes.jpg',
    scoringIA: 96,
    risk: 'bajo',
    pendingItems: [],
    stage: 'auditoria',
    tutorId: 't-001',
    tutorName: TUTOR_SHORT_NAME,
    tutorAvatarUrl: 'https://i.pravatar.cc/200?img=15',
    category: 'Joyería y orfebrería',
    country: 'Colombia',
    region: 'Nariño',
    createdAt: '2026-03-10T08:00:00-03:00',
  },
  // Evaluación
  {
    id: 'CE-108',
    productName: 'Libro: Sabores cósmicos',
    applicantName: 'María Belén Bauló',
    applicantAvatarUrl: '/authors/maria-belen-baulo.webp',
    scoringIA: 91,
    risk: 'bajo',
    pendingItems: ['Firma de evaluación'],
    stage: 'evaluacion',
    tutorId: 't-002',
    tutorName: 'Sofía Quispe',
    tutorAvatarUrl: 'https://i.pravatar.cc/200?img=20',
    category: 'Editorial',
    country: 'Argentina',
    region: 'Córdoba',
    createdAt: '2026-02-28T11:00:00-03:00',
  },
  // Certificación (esperan firma del tutor)
  {
    id: 'CE-109',
    productName: 'Anillos de compromiso en filigrana',
    applicantName: 'Camila Montes',
    applicantAvatarUrl: '/authors/camila-montes.jpg',
    scoringIA: 98,
    risk: 'bajo',
    pendingItems: [],
    stage: 'certificacion',
    tutorId: 't-001',
    tutorName: TUTOR_SHORT_NAME,
    tutorAvatarUrl: 'https://i.pravatar.cc/200?img=15',
    category: 'Joyería y orfebrería',
    country: 'Colombia',
    region: 'Nariño',
    createdAt: '2026-02-15T10:00:00-03:00',
  },
  {
    id: 'CE-110',
    productName: 'Ruana ceremonial en guanga',
    applicantName: 'Flor Imbacuán Pantoja',
    applicantAvatarUrl: '/authors/flor-imbacuan.jpg',
    scoringIA: 94,
    risk: 'bajo',
    pendingItems: [],
    stage: 'certificacion',
    tutorId: 't-001',
    tutorName: TUTOR_SHORT_NAME,
    tutorAvatarUrl: 'https://i.pravatar.cc/200?img=15',
    category: 'Tejidos y textiles',
    country: 'Colombia',
    region: 'Nariño',
    createdAt: '2026-01-30T10:00:00-03:00',
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

    // Seeds PAREADOS: producto ↔ autor ↔ región ↔ avatar siempre consistentes
    // (alineados con las fichas públicas reales). Se ciclan para los 18 certs.
    const seeds = [
      { name: 'Técnica ancestral: Filigrana', author: 'Camila Montes', img: '/authors/camila-montes.jpg', cat: 'Joyería y orfebrería', country: 'Colombia', region: 'Nariño' },
      { name: 'Libro: Sabores cósmicos', author: 'María Belén Bauló', img: '/authors/maria-belen-baulo.webp', cat: 'Editorial', country: 'Argentina', region: 'Córdoba' },
      { name: 'Tejido y diseño textil tradicional', author: 'Flor Imbacuán Pantoja', img: '/authors/flor-imbacuan.jpg', cat: 'Tejidos y textiles', country: 'Colombia', region: 'Nariño' },
      { name: 'Ecodestinos · Turismo regenerativo', author: 'Helida León', img: 'https://i.pravatar.cc/100?img=44', cat: 'Turismo regenerativo', country: 'Colombia', region: 'Bogotá' },
      { name: 'Joyería en filigrana momposina', author: 'Rosa Elena Villalba', img: 'https://i.pravatar.cc/100?img=32', cat: 'Joyería y orfebrería', country: 'Colombia', region: 'Bolívar' },
      { name: 'Barniz de Pasto (Mopa-Mopa)', author: 'José Antonio Obando', img: 'https://i.pravatar.cc/100?img=51', cat: 'Arte y artesanía', country: 'Colombia', region: 'Nariño' },
      { name: 'Blend Herbal Ancestral', author: 'Aurora Bustos', img: 'https://i.pravatar.cc/100?img=49', cat: 'Medicina ancestral', country: 'Argentina', region: 'Córdoba' },
      { name: 'Café ancestral Quillacinga', author: 'Segundo Efraín Jojoa', img: 'https://i.pravatar.cc/100?img=13', cat: 'Productos agroecológicos', country: 'Colombia', region: 'Nariño' },
    ]
    const s = seeds[i % seeds.length]
    const issuedYear = 2025
    const issuedMonth = ((i * 2) % 11) + 1
    const issuedDay = ((i * 3) % 27) + 1
    return {
      id: `CE-${String(i + 1).padStart(3, '0')}`,
      productName: s.name,
      authorName: s.author,
      authorAvatarUrl: s.img,
      scoreLabel: `${85 + (i % 15)}/100`,
      status,
      issuedAt: `${String(issuedDay).padStart(2, '0')}/${String(issuedMonth).padStart(2, '0')}/${String(issuedYear).slice(-2)}`,
      expiresAt: `${String(issuedDay).padStart(2, '0')}/${String(issuedMonth).padStart(2, '0')}/${String(issuedYear + 2).slice(-2)}`,
      category: s.cat,
      country: s.country,
      region: s.region,
    }
  }),
]

export const mockTutorAgenda: TutorAgendaItem[] = [
  {
    id: 'ag-001',
    caseId: 'CE-104',
    caseName: 'Ecodestinos · Turismo regenerativo',
    applicantName: 'Helida León',
    kind: 'kickoff',
    scheduledAt: '2026-05-15T10:00:00-03:00',
    durationMin: 45,
  },
  {
    id: 'ag-002',
    caseId: 'CE-108',
    caseName: 'Libro: Sabores cósmicos',
    applicantName: 'María Belén Bauló',
    kind: 'evaluacion',
    scheduledAt: '2026-05-18T14:00:00-03:00',
    durationMin: 60,
  },
  {
    id: 'ag-003',
    caseId: 'CE-105',
    caseName: 'Joyería en filigrana momposina',
    applicantName: 'Rosa Elena Villalba',
    kind: 'kickoff',
    scheduledAt: '2026-05-18T11:00:00-03:00',
    durationMin: 30,
  },
  {
    id: 'ag-004',
    caseId: 'CE-109',
    caseName: 'Anillos de compromiso en filigrana',
    applicantName: 'Camila Montes',
    kind: 'cierre',
    scheduledAt: '2026-05-19T15:30:00-03:00',
    durationMin: 60,
  },
  {
    id: 'ag-005',
    caseId: 'CE-110',
    caseName: 'Ruana ceremonial en guanga',
    applicantName: 'Flor Imbacuán Pantoja',
    kind: 'cierre',
    scheduledAt: '2026-05-22T10:00:00-03:00',
    durationMin: 30,
  },
]

// ─── Tutor scoring criteria definitions ──────────────────────────────────────

/**
 * Variables de evaluación del Tutor, definidas por el antropólogo del
 * proyecto (Variables Finales.xlsx, 2026-05).
 *
 * Estructura:
 *   - 14 variables agrupadas en 5 dimensiones
 *   - Pesos individuales que suman exactamente 100
 *   - Cada variable incluye sub-ítems observables y medios de verificación
 *
 * Dimensiones y pesos:
 *   Cultural (37%): transmision 10 + simbolos 12 + practicas 15
 *   Sociales y Comunitaria (14%): organizacion 8 + beneficio 6
 *   Ambiental (18%): territorio 6 + biodiversidad 6 + agua 6
 *   Ética y Cosmovisión (12%): cosmovision 8 + apropiacion 4
 *   Gestión y técnica (19%): tecnicas 8 + reconocimiento 3 + asociatividad
 *     4 + consentimiento 4
 *
 * Ranges interpretativos del antropólogo (último renglón del Excel):
 *   - 100 / 80–100 → Producto/Servicio Ancestral Auténtico (Categoría 1)
 *   - 60 – 80      → Producto/Servicio Tradicional con Raíces Ancestrales (2)
 *   - 40 – 60      → Producto/Servicio de Inspiración Cultural (3)
 */
export const SCORING_CRITERIA: ScoringCriterionDef[] = [
  // ─── Dimensión Cultural (37%) ──────────────────────────────────────────
  {
    id: 'transmision',
    dimension: 'cultural',
    label: 'Transmisión intergeneracional de conocimientos',
    description:
      'Enseñanza formal o informal de prácticas y conocimientos ancestrales. Guardianes del conocimiento.',
    weight: 10,
    subitems: [
      'Talleres y material pedagógico',
      'Entrevistas y testimonios orales',
      'Conservación o adaptación del conocimiento',
    ],
    verification:
      'Material pedagógico, entrevistas, fotos, testimonios, experiencias de conservación.',
  },
  {
    id: 'simbolos',
    dimension: 'cultural',
    label: 'Símbolos y rituales',
    description:
      'Símbolos tangibles e intangibles, rituales o ceremonias ancestrales.',
    weight: 12,
    subitems: [
      'Patrimonio material',
      'Patrimonio inmaterial',
      'Rituales y ceremonias activas',
    ],
    verification:
      'Observación en campo, testimonios o evidencias de patrimonio material e inmaterial.',
  },
  {
    id: 'practicas',
    dimension: 'cultural',
    label: 'Prácticas ancestrales',
    description:
      'Formas de parentesco, asentamiento, supervivencia, intercambio y lenguaje propios.',
    weight: 15,
    subitems: [
      'Formas de parentesco',
      'Patrón de asentamiento',
      'Estrategias de supervivencia',
      'Formas alternativas de intercambio económico',
      'Lenguaje propio',
    ],
    verification:
      'Árbol genealógico, cartografía social, observación de campo, testimonios locales, evidencias orales o escritas.',
  },

  // ─── Dimensión Sociales y Comunitaria (14%) ────────────────────────────
  {
    id: 'organizacion',
    dimension: 'social',
    label: 'Organización comunitaria',
    description:
      'Participación equilibrada de mujeres, hombres, ancianos en la vida cotidiana y política.',
    weight: 8,
    subitems: [
      'Estrategias locales de organización social y política',
      'Estatutos internos de la comunidad',
      'Participación abierta en reuniones',
    ],
    verification:
      'Actas de reuniones, fotografías, testimonios, estatutos internos.',
  },
  {
    id: 'beneficio',
    dimension: 'social',
    label: 'Beneficio colectivo',
    description:
      'Distribución justa de beneficios económicos y trabajo colectivo.',
    weight: 6,
    subitems: [
      'Distribución justa de beneficios económicos',
      'Trabajo colectivo en el territorio',
    ],
    verification:
      'Estados financieros, convenios internos, observación de campo, testimonios.',
  },

  // ─── Dimensión Ambiental (18%) ─────────────────────────────────────────
  {
    id: 'territorio',
    dimension: 'ambiental',
    label: 'Uso sostenible del territorio',
    description:
      'Extracción y producción sin degradación + estímulo al uso sostenible.',
    weight: 6,
    subitems: [
      'Extracción y producción sin degradación',
      'Estímulo comunitario al uso sostenible',
    ],
    verification:
      'Cartografía social, informes técnicos, fotos, observación de campo.',
  },
  {
    id: 'biodiversidad',
    dimension: 'ambiental',
    label: 'Protección de biodiversidad',
    description:
      'Uso de semillas o materiales locales y protección de bosque y plantas sagradas.',
    weight: 6,
    subitems: [
      'Uso de semillas/materiales locales',
      'Preservación de especies',
      'Protección de bosque y plantas sagradas',
    ],
    verification:
      'Inventarios, registros de origen, cartografía social, estrategias de conservación.',
  },
  {
    id: 'agua',
    dimension: 'ambiental',
    label: 'Cuidado del agua',
    description:
      'Uso responsable y estrategias locales para la gestión de fuentes de agua.',
    weight: 6,
    subitems: [
      'Uso responsable del agua',
      'Estrategias locales de gestión de ríos y manantiales',
    ],
    verification:
      'Cartografía social, testimonios, observación de campo, material testimonial de estrategias.',
  },

  // ─── Dimensión Ética y Cosmovisión (12%) ───────────────────────────────
  {
    id: 'cosmovision',
    dimension: 'etica',
    label: 'Cosmovisión',
    description:
      'Promoción de valores culturales y espirituales ancestrales.',
    weight: 8,
    subitems: [
      'Valores culturales presentes en la práctica',
      'Valores espirituales y ceremoniales',
      'Articulación con la identidad colectiva',
    ],
    verification: 'Entrevistas, observación directa, testimonios.',
  },
  {
    id: 'apropiacion',
    dimension: 'etica',
    label: 'No apropiación material e inmaterial',
    description:
      'Reconocimiento y retribución a la comunidad de origen.',
    weight: 4,
    subitems: [
      'Reconocimiento explícito de la comunidad de origen',
      'Retribución pactada con la comunidad',
    ],
    verification: 'Contratos, acuerdos comunitarios.',
  },

  // ─── Dimensión Gestión y técnica (19%) ─────────────────────────────────
  {
    id: 'tecnicas',
    dimension: 'gestion',
    label: 'Uso de técnicas y herramientas tradicionales',
    description:
      'Registro completo del proceso e impacto, con técnicas heredadas.',
    weight: 8,
    subitems: [
      'Registro del proceso productivo',
      'Uso de herramientas tradicionales',
      'Documentación del impacto',
    ],
    verification: 'Manuales, registros, cuadernos, memorias o testimonios.',
  },
  {
    id: 'reconocimiento',
    dimension: 'gestion',
    label: 'Reconocimiento institucional',
    description:
      'Reconocimiento de diferentes actores nacionales o internacionales.',
    weight: 3,
    subitems: [
      'Diplomas o menciones',
      'Reconocimiento de pares y referentes',
    ],
    verification: 'Testimonios, fotos, reconocimientos (diplomas, menciones).',
  },
  {
    id: 'asociatividad',
    dimension: 'gestion',
    label: 'Asociatividad e interculturalidad',
    description:
      'Trabajos cooperativos con comunidades ancestrales, rurales o urbanas vecinas.',
    weight: 4,
    subitems: [
      'Talleres y actividades cooperativas',
      'Convenios interculturales',
      'Impacto territorial',
    ],
    verification:
      'Listas de asistencia, fotos de talleres, actas, testimonios.',
  },
  {
    id: 'consentimiento',
    dimension: 'gestion',
    label: 'Consentimiento informado',
    description:
      'Autorización de la comunidad para difusión o comercialización.',
    weight: 4,
    subitems: [
      'Actas de consentimiento firmadas',
      'Grabaciones de aprobación oral',
      'Acuerdos vigentes y revisables',
    ],
    verification: 'Actas de consentimiento, grabaciones, testimonios.',
  },
]

// Sanity check en runtime: si alguien edita los pesos y se rompe el 100%,
// el dev console lo va a marcar. No es bloqueante.
if (
  typeof window !== 'undefined' &&
  SCORING_CRITERIA.reduce((s, c) => s + c.weight, 0) !== 100
) {
   
  console.warn(
    '[Ancestral Seed] SCORING_CRITERIA pesos no suman 100:',
    SCORING_CRITERIA.reduce((s, c) => s + c.weight, 0),
  )
}

/**
 * Categoría cultural derivada del score ponderado.
 * Rangos definidos por el antropólogo (último renglón del Excel).
 */
export function categoryFromScore(score: number): {
  num: 1 | 2 | 3 | null
  label: string
} {
  if (score >= 80) return { num: 1, label: 'Producto Ancestral auténtico' }
  if (score >= 60)
    return {
      num: 2,
      label: 'Producto Tradicional con raíces ancestrales',
    }
  if (score >= 40)
    return { num: 3, label: 'Producto de Inspiración Cultural' }
  return { num: null, label: 'Sin categoría asignada' }
}

// ─── Evaluaciones por caso (scoring + evidencias + notas) ────────────────────

export const mockScoringByCase: Record<string, ScoringValue[]> = {
  // CE-104: caso muy bien evaluado (rangos cercanos a Categoría 1: Ancestral
  // auténtico). Scores 7-10.
  'CE-104': [
    { criterionId: 'transmision', score: 9, comment: 'Transmisión oral activa entre tres generaciones.' },
    { criterionId: 'simbolos', score: 9, comment: 'Rituales documentados y vigentes.' },
    { criterionId: 'practicas', score: 8 },
    { criterionId: 'organizacion', score: 8 },
    { criterionId: 'beneficio', score: 7 },
    { criterionId: 'territorio', score: 9, comment: 'Sin agroquímicos ni degradación.' },
    { criterionId: 'biodiversidad', score: 8 },
    { criterionId: 'agua', score: 8 },
    { criterionId: 'cosmovision', score: 10, comment: 'Articulación espiritual sólida.' },
    { criterionId: 'apropiacion', score: 9 },
    { criterionId: 'tecnicas', score: 9, comment: 'Herramientas heredadas en uso.' },
    { criterionId: 'reconocimiento', score: 7 },
    { criterionId: 'asociatividad', score: 7 },
    { criterionId: 'consentimiento', score: 9 },
  ],
  // CE-108: caso intermedio (rango Categoría 2: Tradicional con raíces).
  // Scores 6-8 con algunos huecos a completar.
  'CE-108': [
    { criterionId: 'transmision', score: 7 },
    { criterionId: 'simbolos', score: 8 },
    { criterionId: 'practicas', score: 7 },
    { criterionId: 'organizacion', score: 6 },
    { criterionId: 'beneficio', score: 6 },
    { criterionId: 'territorio', score: 9, comment: 'Sin agroquímicos.' },
    { criterionId: 'biodiversidad', score: 7 },
    { criterionId: 'agua', score: 7 },
    { criterionId: 'cosmovision', score: 8 },
    { criterionId: 'apropiacion', score: 7 },
    { criterionId: 'tecnicas', score: 8 },
    { criterionId: 'reconocimiento', score: 5 },
    { criterionId: 'asociatividad', score: 6 },
    { criterionId: 'consentimiento', score: 7, comment: 'Falta acta firmada actualizada.' },
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
    author: TUTOR_SHORT_NAME,
    authorRole: 'tutor',
    body: 'Camila viene con muy buen track de la comunidad. Validar aval con la Mtra. Quispe antes de cerrar diagnóstico.',
    at: '2026-04-25T14:30:00-03:00',
    pinned: true,
  },
  {
    id: 'note-002',
    caseId: 'CE-104',
    author: TUTOR_SHORT_NAME,
    authorRole: 'tutor',
    body: 'Falta validar la fecha de la foto de proceso. Pedí aclaración en evidencia e-003.',
    at: '2026-04-28T09:00:00-03:00',
  },
  {
    id: 'note-003',
    caseId: 'CE-108',
    author: TUTOR_SHORT_NAME,
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
    caseName: 'Ecodestinos · Turismo regenerativo',
    applicantName: 'Helida León',
    priority: 'urgent',
    dueAt: '2026-05-14',
    done: false,
  },
  {
    id: 'task-002',
    kind: 'audit_meeting',
    title: 'Reunión inicial — preparar checklist',
    caseId: 'CE-105',
    caseName: 'Joyería en filigrana momposina',
    applicantName: 'Rosa Elena Villalba',
    priority: 'today',
    dueAt: '2026-05-18',
    done: false,
  },
  {
    id: 'task-003',
    kind: 'sign_evaluation',
    title: 'Firmar evaluación final',
    caseId: 'CE-109',
    caseName: 'Anillos de compromiso en filigrana',
    applicantName: 'Camila Montes',
    priority: 'today',
    dueAt: '2026-05-14',
    done: false,
  },
  {
    id: 'task-004',
    kind: 'call_applicant',
    title: 'Llamar para confirmar fechas',
    caseId: 'CE-108',
    caseName: 'Libro: Sabores cósmicos',
    applicantName: 'María Belén Bauló',
    priority: 'this_week',
    dueAt: '2026-05-16',
    done: false,
  },
  {
    id: 'task-005',
    kind: 'verify_documentation',
    title: 'Verificar aval comunitario',
    caseId: 'CE-106',
    caseName: 'Tejido y diseño textil tradicional',
    applicantName: 'Flor Imbacuán Pantoja',
    priority: 'this_week',
    done: false,
  },
  {
    id: 'task-006',
    kind: 'send_message',
    title: 'Responder mensaje pendiente',
    caseId: 'CE-107',
    caseName: 'Técnica ancestral: Filigrana',
    applicantName: 'Camila Montes',
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

// ─── Sprint 2: firmas, notifs, métricas ──────────────────────────────────────

export const mockPendingSignatures: ApprovalSignature[] = [
  {
    id: 'sig-001',
    caseId: 'CE-109',
    caseName: 'Anillos de compromiso en filigrana',
    applicantName: 'Camila Montes',
    role: 'tutor',
    signerName: TUTOR_NAME,
    status: 'pending',
    requestedAt: '2026-05-12T10:00:00-03:00',
  },
  {
    id: 'sig-002',
    caseId: 'CE-110',
    caseName: 'Ruana ceremonial en guanga',
    applicantName: 'Flor Imbacuán Pantoja',
    role: 'tutor',
    signerName: TUTOR_NAME,
    status: 'pending',
    requestedAt: '2026-05-13T08:30:00-03:00',
  },
  {
    id: 'sig-003',
    caseId: 'CE-108',
    caseName: 'Libro: Sabores cósmicos',
    applicantName: 'María Belén Bauló',
    role: 'tutor',
    signerName: TUTOR_NAME,
    status: 'pending',
    requestedAt: '2026-05-13T14:00:00-03:00',
  },
]

export const mockTutorNotifications: TutorNotification[] = [
  {
    id: 'tn-001',
    kind: 'evidence_uploaded',
    title: 'Helida subió 3 evidencias nuevas',
    body: 'Para Ecodestinos · Turismo regenerativo · revisá el material.',
    caseId: 'CE-104',
    caseName: 'Ecodestinos · Turismo regenerativo',
    at: '2026-05-14T09:30:00-03:00',
    read: false,
    link: '/tutor/casos/CE-104',
  },
  {
    id: 'tn-002',
    kind: 'sla_breach',
    title: 'SLA en alerta',
    body: 'Sabores cósmicos lleva 12 días en Evaluación (SLA 10d).',
    caseId: 'CE-108',
    caseName: 'Libro: Sabores cósmicos',
    at: '2026-05-14T08:00:00-03:00',
    read: false,
    link: '/tutor/casos/CE-108',
  },
  {
    id: 'tn-003',
    kind: 'applicant_replied',
    title: 'Camila respondió tu mensaje',
    body: 'Necesita reagendar la auditoría del 18/05.',
    caseId: 'CE-107',
    caseName: 'Técnica ancestral: Filigrana',
    at: '2026-05-13T18:45:00-03:00',
    read: false,
    link: '/tutor/casos/CE-107',
  },
  {
    id: 'tn-004',
    kind: 'signature_pending',
    title: 'Firma pendiente',
    body: 'Camila Montes espera tu firma de la certificación.',
    caseId: 'CE-109',
    caseName: 'Anillos de compromiso en filigrana',
    at: '2026-05-13T14:00:00-03:00',
    read: false,
    link: '/tutor/casos/CE-109',
  },
  {
    id: 'tn-005',
    kind: 'meeting_reminder',
    title: 'Reunión en 1h',
    body: 'Reunión inicial con Rosa Elena Villalba a las 11:00.',
    caseId: 'CE-105',
    caseName: 'Joyería en filigrana momposina',
    at: '2026-05-14T10:00:00-03:00',
    read: true,
    link: '/tutor/casos/CE-105',
  },
  {
    id: 'tn-006',
    kind: 'new_case_assigned',
    title: 'Nuevo caso asignado',
    body: 'Te asignaron Blend Herbal Ancestral.',
    caseId: 'CE-102',
    caseName: 'Blend Herbal Ancestral',
    at: '2026-05-12T11:00:00-03:00',
    read: true,
    link: '/tutor/casos/CE-102',
  },
  {
    id: 'tn-007',
    kind: 'stage_changed',
    title: 'Avance de etapa',
    body: 'Tejido y diseño textil tradicional pasó de Diagnóstico a Auditoría.',
    caseId: 'CE-106',
    caseName: 'Tejido y diseño textil tradicional',
    at: '2026-05-11T16:20:00-03:00',
    read: true,
    link: '/tutor/casos/CE-106',
  },
]

export const mockTutorMetrics: TutorMetrics = {
  approvalRate: 86,
  approvalRateDelta: 4,
  avgDaysPerCase: 32,
  avgDaysDelta: -3,        // mejoró 3 días
  overdueCases: 2,
  responseTimeHours: 6.5,
  responseTimeDelta: -1.2,
  satisfactionScore: 4.6,
  totalCertified: 12,
  totalRejected: 1,
}

export const mockImprovementPlans: Record<string, ImprovementPlan> = {
  'CE-102': {
    id: 'plan-001',
    caseId: 'CE-102',
    createdAt: '2026-05-09T10:00:00-03:00',
    createdBy: TUTOR_NAME,
    reEvaluationAt: '2026-07-09',
    actions: [
      {
        id: 'a-1',
        title: 'Documentar proceso completo con video',
        detail: '5-7 minutos mostrando hornado, modelado y quemado.',
        criterionId: 'tecnicas',
        dueDate: '20/06',
        responsible: 'solicitante',
        status: 'pending',
      },
      {
        id: 'a-2',
        title: 'Aval firmado por 2 referentes comunitarios',
        criterionId: 'organizacion',
        dueDate: '15/06',
        responsible: 'solicitante',
        status: 'in_progress',
      },
      {
        id: 'a-3',
        title: 'Cartografía social del territorio',
        criterionId: 'territorio',
        dueDate: '01/07',
        responsible: 'solicitante',
        status: 'pending',
      },
    ],
  },
}

// ─── Expediente extendido por cert ───────────────────────────────────────────

/**
 * Helper: enriquece un IssuedCertification con datos del expediente.
 * Para CE-001 y CE-002 devuelve data específica; para el resto usa fallbacks
 * razonables derivados del id.
 */
export function getExpedienteData(certId: string) {
  if (certId === 'CE-001') {
    return {
      authorPhone: '+57 300 501 3477',
      authorEmail: 'camila.montes@gmail.com',
      authorRole: 'Artesana · Alunawa',
      community: 'San Juan de Pasto, Nariño',
      productType: 'Producto físico',
      productSector: 'Joyería y orfebrería',
      productSubcategory: 'Filigrana',
      productionDescription:
        'Trabajo manual con hilos extremadamente finos de plata, mediante la técnica de enrollado y trenzado, soldadura artesanal y terminación a mano. Proceso completo desde el hilado hasta el acabado, sin intervención industrial.',
      productionResponsible: 'Yo misma · con apoyo familiar',
      productionCapacity: 'Pequeña escala · 8 piezas/mes',
      productionMode: 'Por encargo y stock propio',
      batchIdentifier: 'Por fecha y nombre de pieza',
      renewalCycleMonths: 24,
      lastRenewalAt: '14/02/24',
      nextRenewalAt: '14/02/26',
    }
  }
  if (certId === 'CE-002') {
    return {
      authorPhone: '+54 351 234-5678',
      authorEmail: 'maria.baulo@ancestralseed.io',
      authorRole: 'Autora · Investigadora',
      community: 'Córdoba ancestral',
      productType: 'Editorial',
      productSector: 'Editorial',
      productSubcategory: 'Libro',
      productionDescription:
        'Obra de investigación que reúne saberes ancestrales sobre alimentación consciente, ciclos lunares y astromedicina. Texto original con bibliografía verificable y consulta a referentes culturales.',
      productionResponsible: 'Autora principal · 2 editoras',
      productionCapacity: 'Tirada limitada · 500 ejemplares',
      productionMode: 'Impreso + e-book',
      batchIdentifier: 'ISBN por edición',
      renewalCycleMonths: 24,
      lastRenewalAt: '20/11/23',
      nextRenewalAt: '20/11/25',
    }
  }
  // Fallback razonable
  return {
    authorPhone: '—',
    authorEmail: '—',
    authorRole: 'Artesano/a',
    community: '—',
    productType: 'Producto ancestral',
    productSector: '—',
    productSubcategory: '—',
    productionDescription:
      'Detalle del proceso productivo en revisión por el equipo de tutoría.',
    productionResponsible: 'Solicitante',
    productionCapacity: 'Pequeña escala',
    productionMode: 'Por encargo',
    batchIdentifier: 'Por fecha',
    renewalCycleMonths: 24,
    lastRenewalAt: '—',
    nextRenewalAt: '—',
  }
}

export function getEvidenciasByCert(certId: string): CertExpedienteEvidence[] {
  // Default 3 imágenes + 1 video + 1 documento (matchea el Figma)
  return [
    { id: `${certId}-img-1`, kind: 'image', name: 'pieza-frente.jpg', sizeKb: 1240, thumbUrl: '/cards/card-filigrana-v2.webp' },
    { id: `${certId}-img-2`, kind: 'image', name: 'pieza-reverso.jpg', sizeKb: 980 },
    { id: `${certId}-img-3`, kind: 'image', name: 'proceso-detalle.jpg', sizeKb: 2100 },
    { id: `${certId}-vid-1`, kind: 'video', name: 'proceso-completo.mp4', sizeKb: 18_200 },
    { id: `${certId}-doc-1`, kind: 'document', name: 'aval-comunidad.pdf', sizeKb: 320 },
  ]
}

export function getInitialNotesByCert(certId: string): CertExpedienteNote[] {
  if (certId === 'CE-001') {
    return [
      {
        id: 'n-001',
        authorName: 'Ana Belén',
        authorInitials: 'AB',
        body: 'Camila viene con muy buen track de la comunidad. Validar aval con la Mtra. Quispe antes de cerrar el ciclo de renovación. La autoría comunitaria está bien documentada.',
        at: '2026-02-12T10:00:00-03:00',
      },
      {
        id: 'n-002',
        authorName: TUTOR_SHORT_NAME,
        authorInitials: 'JP',
        body: 'Coordinar entrega de avales actualizados para la renovación del próximo año.',
        at: '2026-02-12T10:00:00-03:00',
      },
      {
        id: 'n-003',
        authorName: TUTOR_SHORT_NAME,
        authorInitials: 'JP',
        body: 'Sub-criterio normativo: pendiente verificar nueva normativa local de orfebrería. Pedí documentación adicional al solicitante para cerrar el ciclo de renovación con todo en regla.',
        at: '2026-02-12T10:00:00-03:00',
      },
    ]
  }
  return [
    {
      id: 'n-default-001',
      authorName: TUTOR_SHORT_NAME,
      authorInitials: 'JP',
      body: 'Caso en seguimiento estándar. Sin observaciones particulares al cierre del ciclo.',
      at: new Date().toISOString(),
    },
  ]
}

export function getChecklistByCert(certId: string): ChecklistCategory[] {
  // Diccionario de checklist final por categoría (matchea Figma)
  void certId
  return [
    {
      id: 'tecnico',
      name: 'Conocimiento técnico',
      items: [
        { id: 't-1', label: 'Dominio del oficio verificado', checked: true },
        { id: 't-2', label: 'Calidad del proceso productivo', checked: true },
        { id: 't-3', label: 'Reproducibilidad documentada', checked: true },
        { id: 't-4', label: 'Materias primas verificadas', checked: true },
        { id: 't-5', label: 'Trazabilidad lote a lote', checked: true },
      ],
      comment:
        'Excelente dominio técnico. La trazabilidad de cada pieza está documentada con foto+ficha de proceso.',
    },
    {
      id: 'cultural',
      name: 'Conocimiento cultural y ancestral',
      items: [
        { id: 'c-1', label: 'Vínculo con comunidad de origen', checked: true },
        { id: 'c-2', label: 'Aval comunitario firmado', checked: true },
        { id: 'c-3', label: 'Continuidad generacional declarada', checked: true },
        { id: 'c-4', label: 'Referencias culturales verificables', checked: true },
        { id: 'c-5', label: 'Respeto a protocolos comunitarios', checked: true },
      ],
    },
    {
      id: 'ambiental',
      name: 'Conocimiento ambiental',
      items: [
        { id: 'a-1', label: 'Origen sustentable de materiales', checked: true },
        { id: 'a-2', label: 'Bajo impacto del proceso', checked: true },
        { id: 'a-3', label: 'Gestión de residuos declarada', checked: true },
        { id: 'a-4', label: 'Sin uso de sustancias prohibidas', checked: true },
        { id: 'a-5', label: 'Trazabilidad ambiental del recurso', checked: true },
      ],
    },
    {
      id: 'normativo',
      name: 'Conocimiento normativo',
      items: [
        { id: 'n-1', label: 'Documentación legal vigente', checked: true },
        { id: 'n-2', label: 'Marco normativo local cumplido', checked: true },
        { id: 'n-3', label: 'Habilitación comercial activa', checked: true },
        { id: 'n-4', label: 'Estándar interno cumplido', checked: true },
        { id: 'n-5', label: 'Sin observaciones de auditoría externa', checked: true },
      ],
    },
  ]
}
