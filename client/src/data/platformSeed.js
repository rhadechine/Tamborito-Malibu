import { foundationImages } from './foundationContent';

export const seedUsers = [
  {
    id: 'usr-client-demo',
    name: 'Estudiante Tamborito',
    email: 'cliente@tamborito.org',
    password: 'cliente123',
    role: 'client',
    status: 'active',
    phone: '300 000 0000',
    city: 'Zambrano, Bolívar',
    bio: 'Estudiante vinculado a los procesos de formación cultural de Fundación Tamborito.',
    createdAt: '2026-05-12T09:30:00.000Z',
  },
  {
    id: 'usr-client-ana',
    name: 'Ana María Torres',
    email: 'ana.torres@example.com',
    password: 'cliente123',
    role: 'client',
    status: 'active',
    phone: '301 222 4455',
    city: 'Cartagena, Bolívar',
    bio: '',
    createdAt: '2026-05-18T14:20:00.000Z',
  },
  {
    id: 'usr-client-carlos',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@example.com',
    password: 'cliente123',
    role: 'client',
    status: 'inactive',
    phone: '302 778 9900',
    city: 'Zambrano, Bolívar',
    bio: '',
    createdAt: '2026-06-02T16:45:00.000Z',
  },
  {
    id: 'usr-client-laura',
    name: 'Laura Fernanda Ruiz',
    email: 'laura.ruiz@example.com',
    password: 'cliente123',
    role: 'client',
    status: 'active',
    phone: '310 555 7878',
    city: 'El Carmen de Bolívar',
    bio: '',
    createdAt: '2026-06-21T10:10:00.000Z',
  },
  {
    id: 'usr-admin-tamborito',
    name: 'Administrador Tamborito',
    email: 'admin@tamborito.org',
    password: 'admin123',
    role: 'admin',
    status: 'active',
    organization: 'foundation',
    phone: '',
    city: 'Zambrano, Bolívar',
    bio: '',
    createdAt: '2026-04-01T08:00:00.000Z',
  },
  {
    id: 'usr-admin-malibu',
    name: 'Administrador Malibú',
    email: 'admin@malibu.org',
    password: 'admin123',
    role: 'admin',
    status: 'active',
    organization: 'museum',
    phone: '',
    city: 'Zambrano, Bolívar',
    bio: '',
    createdAt: '2026-04-01T08:00:00.000Z',
  },
];

export const seedInstructors = [
  {
    id: 'ins-ramses',
    name: 'Ramses Javith Hadechine Alvarez',
    title: 'Licenciado en Música y fundador de Fundación Tamborito',
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80',
    bio:
      'Docente y gestor cultural orientado a la enseñanza de músicas tradicionales, percusión folklórica, gaitas y procesos de formación comunitaria.',
  },
  {
    id: 'ins-equipo',
    name: 'Equipo Pedagógico Tamborito',
    title: 'Formadores culturales',
    avatar:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=500&q=80',
    bio:
      'Equipo encargado de apoyar rutas de aprendizaje, acompañamiento estudiantil, recursos pedagógicos y actividades prácticas.',
  },
];

export const seedCourses = [
  {
    id: 'course-percusion',
    slug: 'percusion-folklorica-caribe',
    title: 'Percusión folklórica del Caribe colombiano',
    subtitle:
      'Aprende bases rítmicas, escucha colectiva y práctica instrumental desde la tradición.',
    description:
      'Curso introductorio para reconocer y practicar patrones básicos de percusión tradicional del Caribe colombiano. La ruta combina contexto cultural, técnica básica, ejercicios guiados, práctica individual y evidencia de avance.',
    category: 'Percusión tradicional',
    level: 'General',
    modality: 'Virtual',
    language: 'Español',
    durationLabel: '24 horas',
    price: 0,
    isFree: true,
    status: 'published',
    featured: true,
    certificate: true,
    cover: foundationImages.youthPercussion,
    instructorId: 'ins-ramses',
    studentsCount: 38,
    rating: 4.8,
    updatedAt: '2026-07-20T09:00:00.000Z',
    learningOutcomes: [
      'Reconocer el papel del tambor dentro de la música tradicional del Caribe.',
      'Identificar patrones rítmicos básicos y su relación con la práctica colectiva.',
      'Registrar evidencias de práctica para acompañar el progreso del estudiante.',
    ],
    requirements: [
      'Disposición para practicar de forma constante.',
      'Acceso a internet para consultar videos y materiales.',
      'Instrumento propio o superficie de práctica cuando sea posible.',
    ],
    audience: [
      'Niños, jóvenes y adultos interesados en música tradicional.',
      'Estudiantes vinculados a procesos culturales.',
      'Docentes o gestores que busquen material introductorio.',
    ],
    modules: [
      {
        id: 'module-percusion-1',
        title: 'Contexto y escucha',
        description:
          'Reconocimiento inicial del territorio sonoro, el papel del tambor y la importancia de la escucha colectiva.',
        lessons: [
          {
            id: 'lesson-percusion-1',
            title: 'El tambor como memoria viva',
            type: 'video',
            minutes: 14,
            preview: true,
            summary:
              'Introducción al valor cultural del tambor dentro de la tradición.',
            content:
              'En esta clase se presenta el tambor como instrumento de memoria, comunicación y encuentro comunitario. El estudiante debe observar cómo el ritmo se relaciona con la participación colectiva.',
            videoUrl: 'https://www.youtube.com/watch?v=demo-percusion-1',
            readingUrl: '',
            quizQuestions: '',
            assignmentInstructions: '',
            uploadEnabled: false,
            resources: [
              {
                id: 'res-percusion-1',
                name: 'Guía de escucha inicial',
                type: 'PDF',
                size: '1.2 MB',
                url: '',
              },
            ],
          },
          {
            id: 'lesson-percusion-2',
            title: 'Pulso, acento y coordinación',
            type: 'practice',
            minutes: 18,
            preview: false,
            summary:
              'Ejercicios básicos para sostener pulso y acento en práctica individual.',
            content:
              'El estudiante debe practicar patrones sencillos de pulso y acento, manteniendo regularidad y atención al movimiento de las manos.',
            videoUrl: '',
            readingUrl: '',
            quizQuestions: '',
            assignmentInstructions:
              'Graba una práctica breve de pulso y acento. El archivo puede ser audio o video.',
            uploadEnabled: true,
            resources: [
              {
                id: 'res-percusion-2',
                name: 'Ejercicios de coordinación',
                type: 'PDF',
                size: '900 KB',
                url: '',
              },
            ],
          },
        ],
      },
      {
        id: 'module-percusion-2',
        title: 'Patrones básicos',
        description:
          'Práctica de células rítmicas y construcción de secuencias sencillas.',
        lessons: [
          {
            id: 'lesson-percusion-3',
            title: 'Primer patrón rítmico',
            type: 'video',
            minutes: 20,
            preview: false,
            summary:
              'Demostración guiada de un patrón inicial de percusión.',
            content:
              'La clase muestra cómo dividir el patrón por partes, repetirlo lentamente y luego unirlo con continuidad.',
            videoUrl: 'https://www.youtube.com/watch?v=demo-percusion-2',
            readingUrl: '',
            quizQuestions: '',
            assignmentInstructions: '',
            uploadEnabled: false,
            resources: [],
          },
          {
            id: 'lesson-percusion-4',
            title: 'Evidencia de patrón básico',
            type: 'assignment',
            minutes: 25,
            preview: false,
            summary:
              'Entrega de una evidencia donde el estudiante aplique el patrón trabajado.',
            content:
              'El estudiante debe presentar una evidencia breve aplicando el patrón rítmico estudiado durante el módulo.',
            videoUrl: '',
            readingUrl: '',
            quizQuestions: '',
            assignmentInstructions:
              'Sube un video o audio de máximo tres minutos interpretando el patrón básico. Agrega una descripción breve de las dificultades encontradas.',
            uploadEnabled: true,
            resources: [],
          },
        ],
      },
      {
        id: 'module-percusion-3',
        title: 'Cierre y evaluación',
        description:
          'Evaluación de conceptos, revisión de avance y cierre de la ruta.',
        lessons: [
          {
            id: 'lesson-percusion-5',
            title: 'Evaluación de conceptos básicos',
            type: 'quiz',
            minutes: 15,
            preview: false,
            summary:
              'Preguntas de comprensión sobre pulso, acento, escucha y práctica colectiva.',
            content:
              'La evaluación permite verificar la comprensión de los conceptos trabajados durante el curso.',
            videoUrl: '',
            readingUrl: '',
            quizQuestions:
              '1. ¿Qué función cumple el pulso dentro de una interpretación colectiva?\n2. ¿Por qué es importante la escucha en un ensamble?\n3. Describe una dificultad de coordinación y cómo podrías mejorarla.',
            assignmentInstructions: '',
            uploadEnabled: false,
            resources: [],
          },
        ],
      },
    ],
  },
  {
    id: 'course-gaitas',
    slug: 'introduccion-gaitas-tradicionales',
    title: 'Introducción a las gaitas tradicionales',
    subtitle:
      'Reconoce el sonido, estructura y contexto cultural de las gaitas tradicionales.',
    description:
      'Ruta introductoria para comprender la importancia de las gaitas dentro de las músicas tradicionales, sus partes principales, principios de respiración, escucha y acompañamiento.',
    category: 'Gaitas',
    level: 'General',
    modality: 'Virtual',
    language: 'Español',
    durationLabel: '18 horas',
    price: 75000,
    isFree: false,
    status: 'published',
    featured: true,
    certificate: true,
    cover: foundationImages.childrenGaitas,
    instructorId: 'ins-ramses',
    studentsCount: 24,
    rating: 4.7,
    updatedAt: '2026-07-18T11:40:00.000Z',
    learningOutcomes: [
      'Identificar elementos básicos de las gaitas tradicionales.',
      'Comprender el papel melódico de la gaita dentro del conjunto.',
      'Desarrollar ejercicios iniciales de escucha, respiración y coordinación.',
    ],
    requirements: [
      'Interés por la música tradicional.',
      'Acceso a internet.',
      'Gaita o instrumento de práctica cuando esté disponible.',
    ],
    audience: [
      'Estudiantes nuevos de música tradicional.',
      'Integrantes de procesos culturales.',
      'Personas interesadas en gaitas y música de tradición oral.',
    ],
    modules: [
      {
        id: 'module-gaitas-1',
        title: 'Reconocimiento del instrumento',
        description:
          'Introducción al sonido, función y estructura de la gaita.',
        lessons: [
          {
            id: 'lesson-gaitas-1',
            title: 'La gaita en la tradición musical',
            type: 'video',
            minutes: 16,
            preview: true,
            summary:
              'Contexto cultural y sonoro de la gaita tradicional.',
            content:
              'La clase presenta la gaita como instrumento melódico y explica su relación con el conjunto tradicional.',
            videoUrl: 'https://www.youtube.com/watch?v=demo-gaitas-1',
            readingUrl: '',
            quizQuestions: '',
            assignmentInstructions: '',
            uploadEnabled: false,
            resources: [
              {
                id: 'res-gaitas-1',
                name: 'Ficha introductoria sobre gaitas',
                type: 'PDF',
                size: '1 MB',
                url: '',
              },
            ],
          },
          {
            id: 'lesson-gaitas-2',
            title: 'Partes y cuidado básico',
            type: 'reading',
            minutes: 12,
            preview: false,
            summary:
              'Lectura breve sobre partes principales y cuidado del instrumento.',
            content:
              'La lectura explica partes generales de la gaita, recomendaciones de cuidado y relación entre técnica e instrumento.',
            videoUrl: '',
            readingUrl: '',
            quizQuestions: '',
            assignmentInstructions: '',
            uploadEnabled: false,
            resources: [],
          },
        ],
      },
      {
        id: 'module-gaitas-2',
        title: 'Respiración y escucha',
        description:
          'Ejercicios iniciales de respiración, emisión y escucha del conjunto.',
        lessons: [
          {
            id: 'lesson-gaitas-3',
            title: 'Ejercicio inicial de respiración',
            type: 'practice',
            minutes: 22,
            preview: false,
            summary:
              'Práctica guiada para controlar aire y duración del sonido.',
            content:
              'El estudiante debe practicar respiración constante, atención al sonido y control básico del aire.',
            videoUrl: '',
            readingUrl: '',
            quizQuestions: '',
            assignmentInstructions:
              'Entrega una grabación breve aplicando el ejercicio de respiración propuesto.',
            uploadEnabled: true,
            resources: [],
          },
        ],
      },
    ],
  },
  {
    id: 'course-cantos',
    slug: 'cantos-de-pajarito-y-tradicion-oral',
    title: 'Cantos de pajarito y tradición oral',
    subtitle:
      'Explora repertorios, relatos y memoria sonora transmitida entre generaciones.',
    description:
      'Curso orientado a reconocer el valor de los cantos tradicionales, la oralidad y los repertorios comunitarios como parte de la memoria cultural del territorio.',
    category: 'Canto tradicional',
    level: 'General',
    modality: 'Virtual',
    language: 'Español',
    durationLabel: '16 horas',
    price: 60000,
    isFree: false,
    status: 'published',
    featured: false,
    certificate: true,
    cover: foundationImages.groupPortrait,
    instructorId: 'ins-equipo',
    studentsCount: 19,
    rating: 4.6,
    updatedAt: '2026-07-10T15:10:00.000Z',
    learningOutcomes: [
      'Reconocer el valor cultural del canto tradicional.',
      'Relacionar oralidad, memoria y práctica musical.',
      'Preparar una evidencia vocal o documental del repertorio trabajado.',
    ],
    requirements: [
      'Disposición para escuchar y practicar repertorios.',
      'Acceso a internet.',
    ],
    audience: [
      'Estudiantes interesados en canto tradicional.',
      'Personas vinculadas a procesos comunitarios.',
      'Docentes de cultura o música.',
    ],
    modules: [
      {
        id: 'module-cantos-1',
        title: 'Memoria oral y repertorio',
        description:
          'Aproximación al canto tradicional como práctica comunitaria.',
        lessons: [
          {
            id: 'lesson-cantos-1',
            title: 'La voz como memoria cultural',
            type: 'video',
            minutes: 13,
            preview: true,
            summary:
              'Introducción al canto tradicional y su relación con la memoria.',
            content:
              'La clase presenta el valor de la voz en la transmisión de memoria, relatos y prácticas comunitarias.',
            videoUrl: 'https://www.youtube.com/watch?v=demo-cantos-1',
            readingUrl: '',
            quizQuestions: '',
            assignmentInstructions: '',
            uploadEnabled: false,
            resources: [],
          },
          {
            id: 'lesson-cantos-2',
            title: 'Registro de repertorio',
            type: 'assignment',
            minutes: 24,
            preview: false,
            summary:
              'Actividad para documentar o interpretar un canto trabajado.',
            content:
              'El estudiante debe preparar una evidencia relacionada con un canto, relato o repertorio tradicional.',
            videoUrl: '',
            readingUrl: '',
            quizQuestions: '',
            assignmentInstructions:
              'Sube un audio, video o documento donde registres el repertorio trabajado y explica su contexto.',
            uploadEnabled: true,
            resources: [],
          },
        ],
      },
    ],
  },
  {
    id: 'course-neuroeducacion',
    slug: 'neuroeducacion-aplicada-a-procesos-culturales',
    title: 'Neuroeducación aplicada a procesos culturales',
    subtitle:
      'Herramientas para acompañar aprendizaje musical, atención y memoria desde la práctica pedagógica.',
    description:
      'Curso dirigido a formadores y gestores culturales que necesitan organizar actividades de aprendizaje musical con criterios de atención, memoria, motivación y seguimiento.',
    category: 'Pedagogía cultural',
    level: 'General',
    modality: 'Virtual',
    language: 'Español',
    durationLabel: '20 horas',
    price: 95000,
    isFree: false,
    status: 'draft',
    featured: false,
    certificate: true,
    cover: foundationImages.percussionClass,
    instructorId: 'ins-ramses',
    studentsCount: 0,
    rating: 0,
    updatedAt: '2026-07-05T18:00:00.000Z',
    learningOutcomes: [
      'Diseñar actividades de aprendizaje con instrucciones claras.',
      'Relacionar atención, repetición y memoria con práctica musical.',
      'Plantear estrategias de seguimiento del progreso estudiantil.',
    ],
    requirements: [
      'Experiencia básica en enseñanza o gestión cultural.',
      'Interés por procesos educativos.',
    ],
    audience: [
      'Docentes.',
      'Gestores culturales.',
      'Monitores de formación musical.',
    ],
    modules: [
      {
        id: 'module-neuro-1',
        title: 'Principios iniciales',
        description:
          'Conceptos básicos para aplicar neuroeducación en procesos culturales.',
        lessons: [
          {
            id: 'lesson-neuro-1',
            title: 'Atención y práctica cultural',
            type: 'reading',
            minutes: 15,
            preview: false,
            summary:
              'Lectura base sobre atención, motivación y aprendizaje.',
            content:
              'El aprendizaje cultural necesita rutinas claras, participación activa, repetición y retroalimentación.',
            videoUrl: '',
            readingUrl: '',
            quizQuestions: '',
            assignmentInstructions: '',
            uploadEnabled: false,
            resources: [],
          },
        ],
      },
    ],
  },
];

export const seedEnrollments = [
  {
    id: 'enr-demo-percusion',
    userId: 'usr-client-demo',
    courseId: 'course-percusion',
    status: 'active',
    enrolledAt: '2026-07-01T13:20:00.000Z',
    lastLessonId: 'lesson-percusion-3',
    completedLessons: [
      'lesson-percusion-1',
      'lesson-percusion-2',
    ],
    grade: null,
    source: 'free',
    evidence: [
      {
        id: 'evi-demo-1',
        lessonId: 'lesson-percusion-2',
        lessonTitle: 'Pulso, acento y coordinación',
        fileName: 'practica-pulso-estudiante.mp4',
        fileType: 'video/mp4',
        fileSize: 5242880,
        description:
          'Práctica de coordinación inicial con pulso sostenido.',
        submittedAt: '2026-07-04T18:45:00.000Z',
        status: 'submitted',
      },
    ],
  },
  {
    id: 'enr-demo-gaitas',
    userId: 'usr-client-demo',
    courseId: 'course-gaitas',
    status: 'active',
    enrolledAt: '2026-07-08T09:10:00.000Z',
    lastLessonId: 'lesson-gaitas-2',
    completedLessons: ['lesson-gaitas-1'],
    grade: null,
    source: 'purchase',
    orderId: 'ORD-100241',
    evidence: [],
  },
  {
    id: 'enr-ana-percusion',
    userId: 'usr-client-ana',
    courseId: 'course-percusion',
    status: 'completed',
    enrolledAt: '2026-06-18T12:00:00.000Z',
    completedAt: '2026-07-12T12:00:00.000Z',
    lastLessonId: 'lesson-percusion-5',
    completedLessons: [
      'lesson-percusion-1',
      'lesson-percusion-2',
      'lesson-percusion-3',
      'lesson-percusion-4',
      'lesson-percusion-5',
    ],
    grade: 94,
    source: 'free',
    evidence: [
      {
        id: 'evi-ana-1',
        lessonId: 'lesson-percusion-4',
        lessonTitle: 'Evidencia de patrón básico',
        fileName: 'patron-basico-ana.mp4',
        fileType: 'video/mp4',
        fileSize: 7300000,
        description:
          'Evidencia final de patrón básico trabajado durante el módulo.',
        submittedAt: '2026-07-10T17:20:00.000Z',
        status: 'submitted',
      },
    ],
  },
  {
    id: 'enr-laura-cantos',
    userId: 'usr-client-laura',
    courseId: 'course-cantos',
    status: 'active',
    enrolledAt: '2026-07-15T15:35:00.000Z',
    lastLessonId: 'lesson-cantos-1',
    completedLessons: [],
    grade: null,
    source: 'purchase',
    orderId: 'ORD-100312',
    evidence: [],
  },
];

export const seedOrders = [
  {
    id: 'ORD-100241',
    userId: 'usr-client-demo',
    items: [
      {
        courseId: 'course-gaitas',
        title: 'Introducción a las gaitas tradicionales',
        price: 75000,
      },
    ],
    subtotal: 75000,
    total: 75000,
    paymentMethod: 'PSE',
    paymentStatus: 'approved',
    orderStatus: 'completed',
    createdAt: '2026-07-08T09:05:00.000Z',
    transactionReference: 'PSE-7788123',
  },
  {
    id: 'ORD-100312',
    userId: 'usr-client-laura',
    items: [
      {
        courseId: 'course-cantos',
        title: 'Cantos de pajarito y tradición oral',
        price: 60000,
      },
    ],
    subtotal: 60000,
    total: 60000,
    paymentMethod: 'PSE',
    paymentStatus: 'approved',
    orderStatus: 'completed',
    createdAt: '2026-07-15T15:30:00.000Z',
    transactionReference: 'PSE-8844120',
  },
  {
    id: 'ORD-100180',
    userId: 'usr-client-carlos',
    items: [
      {
        courseId: 'course-gaitas',
        title: 'Introducción a las gaitas tradicionales',
        price: 75000,
      },
    ],
    subtotal: 75000,
    total: 75000,
    paymentMethod: 'PSE',
    paymentStatus: 'pending',
    orderStatus: 'pending',
    createdAt: '2026-06-28T11:10:00.000Z',
    transactionReference: 'PSE-6500210',
  },
];

export const seedCertificates = [
  {
    id: 'cert-ana-percusion',
    userId: 'usr-client-ana',
    courseId: 'course-percusion',
    code: 'FT-PER-2026-0001',
    issuedAt: '2026-07-12T12:30:00.000Z',
  },
];

export const seedNotifications = [
  {
    id: 'not-demo-1',
    userId: 'usr-client-demo',
    title: 'Inscripción confirmada',
    message:
      'Tu curso de Percusión folklórica del Caribe colombiano está disponible en el campus.',
    type: 'course',
    read: false,
    createdAt: '2026-07-01T13:21:00.000Z',
  },
  {
    id: 'not-demo-2',
    userId: 'usr-client-demo',
    title: 'Pago aprobado',
    message:
      'La compra ORD-100241 fue aprobada por PSE. El curso ya está disponible.',
    type: 'order',
    read: true,
    createdAt: '2026-07-08T09:08:00.000Z',
  },
  {
    id: 'not-demo-3',
    userId: 'usr-client-demo',
    title: 'Evidencia entregada',
    message:
      'Se registró la evidencia de Pulso, acento y coordinación.',
    type: 'course',
    read: false,
    createdAt: '2026-07-04T18:46:00.000Z',
  },
  {
    id: 'not-ana-1',
    userId: 'usr-client-ana',
    title: 'Certificado disponible',
    message:
      'Completaste Percusión folklórica del Caribe colombiano. Tu certificado ya está disponible.',
    type: 'certificate',
    read: false,
    createdAt: '2026-07-12T12:31:00.000Z',
  },
];

export const seedSettings = {
  supportEmail: 'soporte@fundaciontamborito.org',
  supportPhone: '+57 300 000 0000',
  businessHours: 'Lunes a viernes, 8:00 a.m. - 5:00 p.m.',
  evidenceEmail: 'academico@fundaciontamborito.org',
  currency: 'COP',
  defaultPaymentMethod: 'PSE',
  donationMessage:
    'Cada aporte fortalece los procesos de formación musical, memoria cultural y participación comunitaria.',
  privacyPolicyUrl: '/politicas-privacidad',
  publicRegistration: true,
  certificatesEnabled: true,
  maintenanceMode: false,
};