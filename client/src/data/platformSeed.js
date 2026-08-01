import { foundationImages } from './foundationContent';

export const seedUsers = [
  {
    id: 'usr-client-demo',
    name: 'María José Martínez',
    email: 'cliente@tamborito.org',
    password: 'cliente123',
    role: 'client',
    status: 'active',
    phone: '300 555 0142',
    city: 'Zambrano, Bolívar',
    bio:
      'Estudiante interesada en percusión tradicional y memoria musical del Caribe.',
    createdAt: '2026-01-15T14:00:00.000Z',
  },
  {
    id: 'usr-admin-demo',
    name: 'Administrador Tamborito',
    email: 'admin@tamborito.org',
    password: 'admin123',
    role: 'admin',
    status: 'active',
    phone: '300 555 0100',
    city: 'Zambrano, Bolívar',
    bio:
      'Responsable de la administración de contenidos y procesos formativos.',
    createdAt: '2025-12-01T14:00:00.000Z',
  },
  {
    id: 'usr-client-002',
    name: 'Andrés Felipe Gómez',
    email: 'andres@example.com',
    password: 'demo123',
    role: 'client',
    status: 'active',
    phone: '301 555 0112',
    city: 'El Carmen de Bolívar',
    bio: '',
    createdAt: '2026-03-03T14:00:00.000Z',
  },
  {
    id: 'usr-client-003',
    name: 'Laura Sofía Pérez',
    email: 'laura@example.com',
    password: 'demo123',
    role: 'client',
    status: 'active',
    phone: '302 555 0188',
    city: 'Cartagena, Bolívar',
    bio: '',
    createdAt: '2026-04-10T14:00:00.000Z',
  },
  {
    id: 'usr-client-004',
    name: 'Carlos Eduardo Ruiz',
    email: 'carlos@example.com',
    password: 'demo123',
    role: 'client',
    status: 'inactive',
    phone: '310 555 0190',
    city: 'Zambrano, Bolívar',
    bio: '',
    createdAt: '2026-05-21T14:00:00.000Z',
  },
];

export const seedInstructors = [
  {
    id: 'ins-ramses',
    name: 'Ramses Javith Hadechine Alvarez',
    title: 'Licenciado en Música y fundador',
    avatar: foundationImages.heroTamborito,
    bio:
      'Director de procesos musicales, tradición oral y formación comunitaria de Fundación Tamborito.',
  },
  {
    id: 'ins-equipo',
    name: 'Equipo pedagógico Tamborito',
    title: 'Formadores culturales',
    avatar: foundationImages.groupPortrait,
    bio:
      'Equipo orientado al acompañamiento musical, evaluación práctica y trabajo con instituciones educativas.',
  },
];

function createLesson({
  id,
  title,
  type = 'video',
  minutes = 10,
  preview = false,
  summary = '',
  content = '',
  resources = [],
}) {
  return {
    id,
    title,
    type,
    minutes,
    preview,
    summary,
    content,
    resources,
  };
}

export const seedCourses = [
  {
    id: 'course-percusion',
    slug: 'percusion-folklorica-del-caribe',
    title: 'Percusión folklórica del Caribe',
    subtitle:
      'Aprende los fundamentos del tambor desde la tradición de Zambrano.',
    description:
      'Ruta formativa para reconocer, interpretar y combinar patrones de tambor alegre, llamador y tambora mediante práctica guiada, escucha colectiva y ejercicios de ensamble.',
    category: 'Música tradicional',
    level: 'Inicial',
    modality: 'Mixta',
    language: 'Español',
    durationLabel: '8 semanas',
    price: 0,
    isFree: true,
    status: 'published',
    featured: true,
    certificate: true,
    cover: foundationImages.youthPercussion,
    instructorId: 'ins-ramses',
    studentsCount: 86,
    rating: 4.9,
    updatedAt: '2026-07-15T14:00:00.000Z',
    learningOutcomes: [
      'Reconocer las funciones básicas de los tambores tradicionales.',
      'Interpretar patrones de llamada, base y respuesta.',
      'Participar en ejercicios de ensamble y escucha colectiva.',
      'Relacionar la práctica musical con la memoria cultural del territorio.',
    ],
    requirements: [
      'No requiere experiencia previa.',
      'Disposición para practicar de manera constante.',
    ],
    audience: [
      'Niños y jóvenes',
      'Familias',
      'Personas interesadas en música tradicional',
    ],
    modules: [
      {
        id: 'mod-perc-1',
        title: 'Bienvenida y contexto cultural',
        description:
          'Introducción a la fundación, el territorio y la función social de la música.',
        lessons: [
          createLesson({
            id: 'lesson-perc-1',
            title: 'Bienvenida a la ruta Tamborito',
            type: 'video',
            minutes: 8,
            preview: true,
            summary:
              'Conoce el propósito del curso y su metodología.',
            content:
              'En esta clase se presenta la ruta, la forma de registrar avances y la relación entre música, identidad y comunidad.',
          }),
          createLesson({
            id: 'lesson-perc-2',
            title:
              'La tradición musical de Zambrano',
            type: 'reading',
            minutes: 12,
            preview: true,
            summary:
              'Territorio, memoria y transmisión cultural.',
            content:
              'La tradición musical se mantiene viva cuando se aprende, se comparte y se practica en comunidad.',
            resources: [
              {
                id: 'res-contexto',
                name:
                  'Lectura de contexto cultural',
                type: 'PDF',
                size: '1.1 MB',
              },
            ],
          }),
          createLesson({
            id: 'lesson-perc-3',
            title: 'Diagnóstico inicial',
            type: 'quiz',
            minutes: 10,
            summary:
              'Reconoce conocimientos y experiencias previas.',
            content:
              'Responde una actividad corta para que el equipo pedagógico conozca tu punto de partida.',
          }),
        ],
      },
      {
        id: 'mod-perc-2',
        title: 'Pulso, postura y coordinación',
        description:
          'Bases corporales y auditivas para comenzar a tocar.',
        lessons: [
          createLesson({
            id: 'lesson-perc-4',
            title: 'Postura y cuidado corporal',
            minutes: 14,
            summary:
              'Ubicación del instrumento y movimientos seguros.',
            content:
              'Aprende una postura cómoda y sostenible para practicar sin tensión.',
          }),
          createLesson({
            id: 'lesson-perc-5',
            title: 'Ejercicios de pulso',
            type: 'practice',
            minutes: 22,
            summary:
              'Práctica gradual con palmas, voz y tambor.',
            content:
              'Realiza tres secuencias de pulso y registra una evidencia corta.',
            resources: [
              {
                id: 'res-pdf-ritmos',
                name:
                  'Guía de patrones rítmicos',
                type: 'PDF',
                size: '2.4 MB',
              },
              {
                id: 'res-audio-llamados',
                name:
                  'Audios de llamada y respuesta',
                type: 'Audio',
                size: '18 MB',
              },
            ],
          }),
          createLesson({
            id: 'lesson-perc-6',
            title:
              'Actividad de coordinación básica',
            type: 'assignment',
            minutes: 30,
            summary:
              'Entrega una evidencia en audio o video.',
            content:
              'Graba una secuencia de 45 segundos siguiendo el patrón propuesto.',
          }),
        ],
      },
      {
        id: 'mod-perc-3',
        title:
          'Tambor alegre y llamada-respuesta',
        description:
          'Patrones iniciales y comunicación dentro del ensamble.',
        lessons: [
          createLesson({
            id: 'lesson-perc-7',
            title:
              'Sonidos abiertos y cerrados',
            minutes: 18,
            summary:
              'Diferencia técnica y auditiva entre golpes básicos.',
            content:
              'Practica sonidos abiertos, secos y apoyados con control de intensidad.',
          }),
          createLesson({
            id: 'lesson-perc-8',
            title: 'Patrones de respuesta',
            type: 'practice',
            minutes: 26,
            summary:
              'Responde a una llamada rítmica.',
            content:
              'Escucha cada llamada y responde con el patrón indicado.',
          }),
          createLesson({
            id: 'lesson-perc-9',
            title: 'Evaluación del módulo',
            type: 'quiz',
            minutes: 15,
            summary:
              'Evaluación de técnica, escucha y contexto cultural.',
            content:
              'Completa la evaluación para desbloquear el módulo de ensamble.',
          }),
        ],
      },
      {
        id: 'mod-perc-4',
        title: 'Ensamble y muestra final',
        description:
          'Integración de aprendizajes y presentación de cierre.',
        lessons: [
          createLesson({
            id: 'lesson-perc-10',
            title: 'Cómo escuchar al grupo',
            minutes: 16,
            summary:
              'Roles, señales y balance dentro del ensamble.',
            content:
              'Aprende a sostener tu patrón mientras escuchas a los demás instrumentos.',
          }),
          createLesson({
            id: 'lesson-perc-11',
            title: 'Ensayo guiado',
            type: 'practice',
            minutes: 40,
            summary:
              'Práctica completa con repertorio de cierre.',
            content:
              'Sigue la guía de ensayo y registra los aspectos que debes mejorar.',
          }),
          createLesson({
            id: 'lesson-perc-12',
            title: 'Entrega final',
            type: 'assignment',
            minutes: 45,
            summary:
              'Evidencia final y reflexión sobre el proceso.',
            content:
              'Sube tu evidencia final y una reflexión breve sobre lo aprendido.',
          }),
        ],
      },
    ],
  },
  {
    id: 'course-gaitas',
    slug: 'gaitas-tradicionales',
    title: 'Gaitas tradicionales',
    subtitle:
      'Respiración, digitación, repertorio y ensamble comunitario.',
    description:
      'Curso de iniciación a la gaita tradicional que combina técnica instrumental, escucha, memoria sonora y comprensión del significado cultural de cada pieza.',
    category: 'Instrumentos de viento',
    level: 'Inicial',
    modality: 'Mixta',
    language: 'Español',
    durationLabel: '10 semanas',
    price: 0,
    isFree: true,
    status: 'published',
    featured: true,
    certificate: true,
    cover: foundationImages.childrenGaitas,
    instructorId: 'ins-equipo',
    studentsCount: 54,
    rating: 4.8,
    updatedAt: '2026-07-08T14:00:00.000Z',
    learningOutcomes: [
      'Aplicar ejercicios básicos de respiración y digitación.',
      'Interpretar melodías tradicionales de nivel inicial.',
      'Comprender el papel de la gaita dentro del conjunto musical.',
    ],
    requirements: [
      'Contar con una gaita o acceso a una durante las prácticas.',
    ],
    audience: [
      'Estudiantes principiantes',
      'Músicos comunitarios',
      'Docentes culturales',
    ],
    modules: [
      {
        id: 'mod-gaita-1',
        title: 'Conociendo la gaita',
        description:
          'Partes, cuidado e historia del instrumento.',
        lessons: [
          createLesson({
            id: 'lesson-gaita-1',
            title:
              'Historia y función cultural',
            minutes: 12,
            preview: true,
            summary:
              'Origen y presencia de la gaita.',
            content:
              'Introducción histórica y cultural al instrumento.',
          }),
          createLesson({
            id: 'lesson-gaita-2',
            title: 'Partes y cuidado',
            type: 'reading',
            minutes: 10,
            preview: true,
            summary:
              'Conoce la estructura del instrumento.',
            content:
              'Recomendaciones para manipulación y mantenimiento.',
          }),
        ],
      },
      {
        id: 'mod-gaita-2',
        title: 'Respiración y sonido',
        description:
          'Ejercicios iniciales para controlar el aire.',
        lessons: [
          createLesson({
            id: 'lesson-gaita-3',
            title:
              'Respiración diafragmática',
            minutes: 16,
            summary:
              'Práctica guiada de respiración.',
            content:
              'Aprende a controlar el aire de forma estable.',
          }),
          createLesson({
            id: 'lesson-gaita-4',
            title: 'Primeros sonidos',
            type: 'practice',
            minutes: 25,
            summary:
              'Emisión y estabilidad del sonido.',
            content:
              'Realiza ejercicios de sonido sostenido.',
          }),
          createLesson({
            id: 'lesson-gaita-5',
            title: 'Evidencia de sonido',
            type: 'assignment',
            minutes: 25,
            summary: 'Entrega práctica.',
            content:
              'Graba tres sonidos estables.',
          }),
        ],
      },
      {
        id: 'mod-gaita-3',
        title: 'Digitación y melodía',
        description:
          'Escalas y frases tradicionales.',
        lessons: [
          createLesson({
            id: 'lesson-gaita-6',
            title: 'Posiciones básicas',
            minutes: 18,
            summary: 'Digitación inicial.',
            content:
              'Práctica de posiciones y cambios.',
          }),
          createLesson({
            id: 'lesson-gaita-7',
            title: 'Frase melódica inicial',
            type: 'practice',
            minutes: 30,
            summary:
              'Aplicación de una melodía tradicional.',
            content:
              'Aprende una frase musical completa.',
          }),
          createLesson({
            id: 'lesson-gaita-8',
            title: 'Evaluación auditiva',
            type: 'quiz',
            minutes: 12,
            summary:
              'Reconocimiento de frases y posiciones.',
            content:
              'Identifica patrones y cambios de digitación.',
          }),
        ],
      },
      {
        id: 'mod-gaita-4',
        title: 'Ensamble final',
        description:
          'Integración con percusión y canto.',
        lessons: [
          createLesson({
            id: 'lesson-gaita-9',
            title: 'Escucha del ensamble',
            minutes: 14,
            summary:
              'Relación entre instrumentos.',
            content:
              'Comprende señales, entradas y cierres.',
          }),
          createLesson({
            id: 'lesson-gaita-10',
            title: 'Muestra final',
            type: 'assignment',
            minutes: 45,
            summary:
              'Presentación de cierre.',
            content:
              'Entrega una interpretación final.',
          }),
        ],
      },
    ],
  },
  {
    id: 'course-aprendizaje',
    slug: 'aprendizaje-sonoro',
    title: 'Aprendizaje sonoro',
    subtitle:
      'Música y neuroeducación para fortalecer atención, memoria y coordinación.',
    description:
      'Programa orientado a docentes, familias y formadores que desean aplicar experiencias musicales como mediadoras del aprendizaje y el desarrollo integral.',
    category: 'Neuroeducación',
    level: 'Formativo',
    modality: 'Virtual',
    language: 'Español',
    durationLabel: '12 semanas',
    price: 120000,
    isFree: false,
    status: 'published',
    featured: true,
    certificate: true,
    cover: foundationImages.schoolAlliance,
    instructorId: 'ins-ramses',
    studentsCount: 39,
    rating: 4.9,
    updatedAt: '2026-07-20T14:00:00.000Z',
    learningOutcomes: [
      'Diseñar ejercicios sonoros con propósito pedagógico.',
      'Aplicar estrategias para atención, memoria y coordinación.',
      'Documentar avances mediante actividades y evidencias.',
    ],
    requirements: [
      'Interés en educación, cultura o procesos comunitarios.',
    ],
    audience: [
      'Docentes',
      'Formadores culturales',
      'Familias',
      'Líderes comunitarios',
    ],
    modules: [
      {
        id: 'mod-apr-1',
        title:
          'Fundamentos de aprendizaje sonoro',
        description:
          'Conceptos y metodología general.',
        lessons: [
          createLesson({
            id: 'lesson-apr-1',
            title: 'Música como mediadora',
            minutes: 15,
            preview: true,
            summary:
              'Principios del enfoque.',
            content:
              'Presentación del aprendizaje sonoro y su aplicación.',
          }),
          createLesson({
            id: 'lesson-apr-2',
            title: 'Atención y escucha',
            type: 'reading',
            minutes: 14,
            preview: true,
            summary:
              'Escucha activa y concentración.',
            content:
              'Lectura introductoria con actividad de observación.',
          }),
          createLesson({
            id: 'lesson-apr-3',
            title: 'Actividad diagnóstica',
            type: 'quiz',
            minutes: 12,
            summary:
              'Punto de partida pedagógico.',
            content:
              'Diagnóstico de prácticas educativas.',
          }),
        ],
      },
      {
        id: 'mod-apr-2',
        title: 'Memoria auditiva',
        description:
          'Secuencias, repetición y evocación.',
        lessons: [
          createLesson({
            id: 'lesson-apr-4',
            title: 'Secuencias sonoras',
            minutes: 18,
            summary:
              'Diseño de secuencias.',
            content:
              'Ejemplos para diferentes edades.',
          }),
          createLesson({
            id: 'lesson-apr-5',
            title: 'Laboratorio de memoria',
            type: 'practice',
            minutes: 28,
            summary:
              'Actividad pedagógica aplicada.',
            content:
              'Construye y prueba una secuencia.',
          }),
          createLesson({
            id: 'lesson-apr-6',
            title: 'Evidencia pedagógica',
            type: 'assignment',
            minutes: 35,
            summary:
              'Registro de aplicación.',
            content:
              'Documenta una experiencia breve.',
          }),
        ],
      },
      {
        id: 'mod-apr-3',
        title: 'Coordinación y ritmo',
        description:
          'Cuerpo, pulso y organización motriz.',
        lessons: [
          createLesson({
            id: 'lesson-apr-7',
            title: 'Ritmo y movimiento',
            minutes: 20,
            summary:
              'Coordinación mediante pulso.',
            content:
              'Actividades de cuerpo y ritmo.',
          }),
          createLesson({
            id: 'lesson-apr-8',
            title: 'Diseño de una sesión',
            type: 'practice',
            minutes: 30,
            summary:
              'Planeación aplicada.',
            content:
              'Diseña una sesión de 20 minutos.',
          }),
          createLesson({
            id: 'lesson-apr-9',
            title: 'Evaluación del módulo',
            type: 'quiz',
            minutes: 15,
            summary:
              'Verificación conceptual.',
            content:
              'Cuestionario del módulo.',
          }),
        ],
      },
      {
        id: 'mod-apr-4',
        title: 'Proyecto final',
        description:
          'Aplicación completa y documentación.',
        lessons: [
          createLesson({
            id: 'lesson-apr-10',
            title:
              'Estructura del proyecto',
            minutes: 14,
            summary:
              'Criterios y entregables.',
            content:
              'Orientación para el proyecto final.',
          }),
          createLesson({
            id: 'lesson-apr-11',
            title: 'Acompañamiento',
            type: 'reading',
            minutes: 10,
            summary:
              'Lista de verificación.',
            content:
              'Revisa los criterios antes de entregar.',
          }),
          createLesson({
            id: 'lesson-apr-12',
            title: 'Entrega final',
            type: 'assignment',
            minutes: 60,
            summary:
              'Proyecto aplicado.',
            content:
              'Entrega el diseño y la evidencia de tu experiencia.',
          }),
        ],
      },
    ],
  },
  {
    id: 'course-cantos',
    slug:
      'cantos-de-pajarito-y-tradicion-oral',
    title:
      'Cantos de pajarito y tradición oral',
    subtitle:
      'Voz, memoria, repertorio y expresión colectiva.',
    description:
      'Explora una expresión musical autóctona mediante repertorio, escucha, tradición oral y ejercicios de creación colectiva.',
    category: 'Canto y memoria',
    level: 'Inicial',
    modality: 'Presencial',
    language: 'Español',
    durationLabel: '6 semanas',
    price: 0,
    isFree: true,
    status: 'published',
    featured: false,
    certificate: true,
    cover: foundationImages.fluteClass,
    instructorId: 'ins-equipo',
    studentsCount: 31,
    rating: 4.7,
    updatedAt: '2026-06-28T14:00:00.000Z',
    learningOutcomes: [
      'Reconocer repertorios tradicionales.',
      'Fortalecer la expresión vocal y la memoria oral.',
    ],
    requirements: [
      'No requiere experiencia previa.',
    ],
    audience: [
      'Comunidad general',
      'Niños y jóvenes',
    ],
    modules: [
      {
        id: 'mod-canto-1',
        title: 'Oralidad y territorio',
        description:
          'Contexto y escucha.',
        lessons: [
          createLesson({
            id: 'lesson-canto-1',
            title:
              'Introducción a los cantos',
            minutes: 12,
            preview: true,
            summary:
              'Contexto general de la tradición.',
            content:
              'Presentación de los cantos y su relación con el territorio.',
          }),
          createLesson({
            id: 'lesson-canto-2',
            title: 'Escucha guiada',
            type: 'practice',
            minutes: 20,
            summary:
              'Reconocimiento auditivo.',
            content:
              'Actividad de escucha y memoria.',
          }),
        ],
      },
      {
        id: 'mod-canto-2',
        title: 'Voz y repertorio',
        description:
          'Respiración, fraseo y memoria.',
        lessons: [
          createLesson({
            id: 'lesson-canto-3',
            title: 'Calentamiento vocal',
            minutes: 14,
            summary:
              'Preparación vocal.',
            content:
              'Ejercicios de respiración y voz.',
          }),
          createLesson({
            id: 'lesson-canto-4',
            title: 'Repertorio inicial',
            type: 'practice',
            minutes: 25,
            summary:
              'Aprendizaje de una pieza.',
            content:
              'Práctica guiada del repertorio.',
          }),
          createLesson({
            id: 'lesson-canto-5',
            title: 'Muestra final',
            type: 'assignment',
            minutes: 35,
            summary:
              'Entrega colectiva.',
            content:
              'Presenta la evidencia de cierre.',
          }),
        ],
      },
    ],
  },
  {
    id: 'course-ensamble',
    slug: 'ensamble-cultural-tamborito',
    title: 'Ensamble cultural Tamborito',
    subtitle:
      'Montaje de repertorio, práctica escénica y presentación final.',
    description:
      'Proceso para estudiantes con bases musicales que desean fortalecer interpretación colectiva, presencia escénica y montaje de repertorio tradicional.',
    category: 'Práctica escénica',
    level: 'Intermedio',
    modality: 'Presencial',
    language: 'Español',
    durationLabel: '16 semanas',
    price: 180000,
    isFree: false,
    status: 'published',
    featured: false,
    certificate: true,
    cover: foundationImages.riverEnsemble,
    instructorId: 'ins-ramses',
    studentsCount: 24,
    rating: 4.9,
    updatedAt: '2026-07-02T14:00:00.000Z',
    learningOutcomes: [
      'Montar repertorio tradicional.',
      'Fortalecer escucha y práctica escénica.',
    ],
    requirements: [
      'Bases instrumentales o vocales.',
      'Disponibilidad para ensayos presenciales.',
    ],
    audience: [
      'Estudiantes intermedios',
      'Integrantes de agrupaciones',
    ],
    modules: [
      {
        id: 'mod-ens-1',
        title: 'Diagnóstico y repertorio',
        description:
          'Asignación de roles y selección de piezas.',
        lessons: [
          createLesson({
            id: 'lesson-ens-1',
            title:
              'Diagnóstico de ensamble',
            type: 'assignment',
            minutes: 30,
            preview: true,
            summary:
              'Evidencia instrumental inicial.',
            content:
              'Presenta una muestra breve de tu experiencia.',
          }),
          createLesson({
            id: 'lesson-ens-2',
            title:
              'Selección de repertorio',
            minutes: 18,
            summary:
              'Criterios de montaje.',
            content:
              'Cómo elegir y organizar las piezas.',
          }),
        ],
      },
      {
        id: 'mod-ens-2',
        title: 'Montaje y presentación',
        description:
          'Ensayos y muestra de cierre.',
        lessons: [
          createLesson({
            id: 'lesson-ens-3',
            title:
              'Ensayo por secciones',
            type: 'practice',
            minutes: 45,
            summary:
              'Trabajo por familias instrumentales.',
            content:
              'Realiza el ensayo siguiendo la guía.',
          }),
          createLesson({
            id: 'lesson-ens-4',
            title: 'Ensayo general',
            type: 'practice',
            minutes: 60,
            summary:
              'Integración completa.',
            content:
              'Ensayo general de repertorio.',
          }),
          createLesson({
            id: 'lesson-ens-5',
            title: 'Presentación final',
            type: 'assignment',
            minutes: 60,
            summary:
              'Muestra pública.',
            content:
              'Presentación de cierre del proceso.',
          }),
        ],
      },
    ],
  },
  {
    id: 'course-docentes',
    slug:
      'herramientas-culturales-para-docentes',
    title:
      'Herramientas culturales para docentes',
    subtitle:
      'Recursos musicales y patrimoniales para contextos educativos.',
    description:
      'Curso breve para diseñar actividades culturales aplicables en aula, proyectos institucionales y procesos comunitarios.',
    category: 'Docentes y aliados',
    level: 'Complementario',
    modality: 'Virtual',
    language: 'Español',
    durationLabel: '4 semanas',
    price: 90000,
    isFree: false,
    status: 'draft',
    featured: false,
    certificate: true,
    cover: foundationImages.percussionClass,
    instructorId: 'ins-equipo',
    studentsCount: 0,
    rating: 0,
    updatedAt: '2026-07-24T14:00:00.000Z',
    learningOutcomes: [
      'Diseñar actividades culturales para el aula.',
      'Integrar música, territorio y memoria.',
    ],
    requirements: [
      'Ser docente, formador o líder comunitario.',
    ],
    audience: [
      'Docentes',
      'Bibliotecarios',
      'Gestores culturales',
    ],
    modules: [
      {
        id: 'mod-doc-1',
        title: 'Cultura y aula',
        description:
          'Principios de integración curricular.',
        lessons: [
          createLesson({
            id: 'lesson-doc-1',
            title: 'Diagnóstico cultural',
            type: 'reading',
            minutes: 15,
            preview: true,
            summary:
              'Lectura del contexto.',
            content:
              'Herramienta de diagnóstico cultural.',
          }),
          createLesson({
            id: 'lesson-doc-2',
            title: 'Diseño de actividad',
            type: 'assignment',
            minutes: 35,
            summary:
              'Aplicación práctica.',
            content:
              'Diseña una actividad cultural para tu contexto.',
          }),
        ],
      },
    ],
  },
];

export const seedEnrollments = [
  {
    id: 'enr-demo-perc',
    userId: 'usr-client-demo',
    courseId: 'course-percusion',
    status: 'active',
    enrolledAt: '2026-05-10T14:00:00.000Z',
    lastLessonId: 'lesson-perc-8',
    completedLessons: [
      'lesson-perc-1',
      'lesson-perc-2',
      'lesson-perc-3',
      'lesson-perc-4',
      'lesson-perc-5',
      'lesson-perc-6',
      'lesson-perc-7',
    ],
    grade: 4.6,
    attendance: 88,
    source: 'free',
  },
  {
    id: 'enr-demo-apr',
    userId: 'usr-client-demo',
    courseId: 'course-aprendizaje',
    status: 'active',
    enrolledAt: '2026-06-18T14:00:00.000Z',
    lastLessonId: 'lesson-apr-5',
    completedLessons: [
      'lesson-apr-1',
      'lesson-apr-2',
      'lesson-apr-3',
      'lesson-apr-4',
    ],
    grade: 4.2,
    attendance: 100,
    source: 'purchase',
  },
  {
    id: 'enr-demo-gaita',
    userId: 'usr-client-demo',
    courseId: 'course-gaitas',
    status: 'completed',
    enrolledAt: '2026-02-02T14:00:00.000Z',
    completedAt: '2026-05-02T14:00:00.000Z',
    lastLessonId: 'lesson-gaita-10',
    completedLessons: [
      'lesson-gaita-1',
      'lesson-gaita-2',
      'lesson-gaita-3',
      'lesson-gaita-4',
      'lesson-gaita-5',
      'lesson-gaita-6',
      'lesson-gaita-7',
      'lesson-gaita-8',
      'lesson-gaita-9',
      'lesson-gaita-10',
    ],
    grade: 4.8,
    attendance: 96,
    source: 'free',
    certificateId: 'cert-gaita-demo',
  },
  {
    id: 'enr-andres-perc',
    userId: 'usr-client-002',
    courseId: 'course-percusion',
    status: 'active',
    enrolledAt: '2026-04-22T14:00:00.000Z',
    lastLessonId: 'lesson-perc-5',
    completedLessons: [
      'lesson-perc-1',
      'lesson-perc-2',
      'lesson-perc-3',
      'lesson-perc-4',
    ],
    grade: 4.0,
    attendance: 82,
    source: 'free',
  },
  {
    id: 'enr-laura-apr',
    userId: 'usr-client-003',
    courseId: 'course-aprendizaje',
    status: 'active',
    enrolledAt: '2026-06-25T14:00:00.000Z',
    lastLessonId: 'lesson-apr-3',
    completedLessons: [
      'lesson-apr-1',
      'lesson-apr-2',
    ],
    grade: 4.4,
    attendance: 100,
    source: 'purchase',
  },
];

export const seedOrders = [
  {
    id: 'ORD-10021',
    userId: 'usr-client-demo',
    items: [
      {
        courseId: 'course-aprendizaje',
        title: 'Aprendizaje sonoro',
        price: 120000,
      },
    ],
    subtotal: 120000,
    total: 120000,
    paymentMethod: 'PSE',
    paymentStatus: 'approved',
    orderStatus: 'completed',
    createdAt: '2026-06-18T14:00:00.000Z',
    transactionReference: 'PSE-783101',
  },
  {
    id: 'ORD-10019',
    userId: 'usr-client-003',
    items: [
      {
        courseId: 'course-aprendizaje',
        title: 'Aprendizaje sonoro',
        price: 120000,
      },
    ],
    subtotal: 120000,
    total: 120000,
    paymentMethod: 'Tarjeta',
    paymentStatus: 'approved',
    orderStatus: 'completed',
    createdAt: '2026-06-25T14:00:00.000Z',
    transactionReference: 'CARD-553010',
  },
  {
    id: 'ORD-10018',
    userId: 'usr-client-002',
    items: [
      {
        courseId: 'course-ensamble',
        title:
          'Ensamble cultural Tamborito',
        price: 180000,
      },
    ],
    subtotal: 180000,
    total: 180000,
    paymentMethod: 'PSE',
    paymentStatus: 'pending',
    orderStatus: 'pending',
    createdAt: '2026-06-12T14:00:00.000Z',
    transactionReference: 'PSE-771202',
  },
];

export const seedCertificates = [
  {
    id: 'cert-gaita-demo',
    userId: 'usr-client-demo',
    courseId: 'course-gaitas',
    code: 'FT-GAI-2026-0048',
    issuedAt: '2026-05-03T14:00:00.000Z',
  },
];

export const seedNotifications = [
  {
    id: 'not-1',
    userId: 'usr-client-demo',
    title: 'Nueva actividad disponible',
    message:
      'Ya puedes realizar la práctica de patrones de respuesta.',
    type: 'course',
    read: false,
    createdAt: '2026-07-26T13:00:00.000Z',
  },
  {
    id: 'not-2',
    userId: 'usr-client-demo',
    title: 'Certificado disponible',
    message:
      'Tu constancia de Gaitas tradicionales está lista.',
    type: 'certificate',
    read: false,
    createdAt: '2026-07-24T13:00:00.000Z',
  },
  {
    id: 'not-3',
    userId: 'usr-client-demo',
    title: 'Pago aprobado',
    message:
      'La compra de Aprendizaje sonoro fue confirmada.',
    type: 'order',
    read: true,
    createdAt: '2026-06-18T14:05:00.000Z',
  },
];

export const seedSettings = {
  organizationName: 'Fundación Tamborito',
  supportEmail: 'contacto@tamborito.org',
  supportPhone: '300 555 0100',
  currency: 'COP',
  defaultPaymentMethod: 'PSE',
  certificatesEnabled: true,
  publicRegistration: true,
  maintenanceMode: false,
};