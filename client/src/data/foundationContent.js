import heroTamborito from '../assets/fundacion/extracted/p15-2.jpeg';
import percussionClass from '../assets/fundacion/extracted/p16-1.jpeg';
import childrenGaitas from '../assets/fundacion/extracted/p17-1.jpeg';
import riverEnsemble from '../assets/fundacion/extracted/p18-2.jpeg';
import schoolAlliance from '../assets/fundacion/extracted/p14-1.jpeg';
import recognition from '../assets/fundacion/extracted/p04-1.jpeg';
import carnival from '../assets/fundacion/extracted/p05-1.jpeg';
import famma from '../assets/fundacion/extracted/p08-1.jpeg';
import interview from '../assets/fundacion/extracted/p07-1.jpeg';
import drumsGroup from '../assets/fundacion/extracted/p20-1.jpeg';
import groupPortrait from '../assets/fundacion/extracted/p19-2.jpeg';
import fluteClass from '../assets/fundacion/extracted/p18-1.jpeg';
import youthPercussion from '../assets/fundacion/extracted/p11-1.jpeg';

export const foundationImages = {
  heroTamborito,
  percussionClass,
  childrenGaitas,
  riverEnsemble,
  schoolAlliance,
  recognition,
  carnival,
  famma,
  interview,
  drumsGroup,
  groupPortrait,
  fluteClass,
  youthPercussion,
};

export const foundationStats = [
  { value: '2023', label: 'Año de fundación' },
  { value: 'Zambrano', label: 'Territorio de origen' },
  { value: '3+', label: 'Líneas de formación musical' },
  { value: 'Comunidad', label: 'Niños, jóvenes y familias' },
];

export const foundationPillars = [
  {
    title: 'Tradición musical',
    text: 'Rescate y enseñanza de ritmos, cantos, gaitas y percusión folklórica propia del territorio.',
    icon: '🥁',
  },
  {
    title: 'Neuroeducación',
    text: 'Procesos pedagógicos que usan la música como mediadora del aprendizaje y del desarrollo integral.',
    icon: '🧠',
  },
  {
    title: 'Construcción de paz',
    text: 'La música como herramienta para fortalecer identidad, convivencia, pertenencia y tejido comunitario.',
    icon: '🕊️',
  },
  {
    title: 'Patrimonio vivo',
    text: 'La tradición no se guarda en silencio: se toca, se canta, se enseña y se comparte con nuevas generaciones.',
    icon: '🌿',
  },
];

export const foundationPrograms = [
  {
    title: 'Percusión folklórica',
    text: 'Talleres para aprender técnica, patrones rítmicos, escucha colectiva y práctica con instrumentos tradicionales.',
    image: youthPercussion,
  },
  {
    title: 'Cantos de pajarito',
    text: 'Formación en expresión vocal, tradición oral, riqueza lírica y memoria musical autóctona.',
    image: fluteClass,
  },
  {
    title: 'Gaitas tradicionales',
    text: 'Aprendizaje instrumental, sentido cultural, historia y participación en ensambles comunitarios.',
    image: childrenGaitas,
  },
  {
    title: 'Eventos y presentaciones',
    text: 'Espacios donde los estudiantes muestran sus avances y la comunidad reconoce su patrimonio musical.',
    image: carnival,
  },
  {
    title: 'Alianzas comunitarias',
    text: 'Trabajo con instituciones educativas, organizaciones locales y escenarios culturales del territorio.',
    image: schoolAlliance,
  },
];

export const trajectoryTimeline = [
  {
    year: '24 feb. 2023',
    title: 'Nacimiento de la Fundación Tamborito',
    text: 'La Fundación Tamborito, Tradición, Cultura y Neuroeducación, nace en Zambrano, Bolívar, bajo la visión del Licenciado en Música Ramses Javith Hadechine Alvarez.',
    image: heroTamborito,
  },
  {
    year: '2023',
    title: 'Música tradicional como camino educativo',
    text: 'La organización consolida programas de percusión folklórica, cantos de pajarito y gaitas tradicionales para conectar a la comunidad con su herencia cultural.',
    image: percussionClass,
  },
  {
    year: 'Ago. 2023',
    title: 'Reconocimiento público',
    text: 'La Alcaldía Municipal de Zambrano Bolívar y Ecomag entregan reconocimiento público por el aporte cultural y comunitario de la práctica musical.',
    image: recognition,
  },
  {
    year: '2024',
    title: 'Presencia en escenarios culturales',
    text: 'La Fundación participa en actividades como la Batalla de Flórez, procesos audiovisuales de Montes de María y la clausura del FAMMA.',
    image: famma,
  },
  {
    year: 'Futuro',
    title: 'Plataforma cultural y educativa',
    text: 'El sitio web prepara la expansión hacia cursos, biblioteca digital, donaciones, seguimiento académico y participación cultural organizada.',
    image: groupPortrait,
  },
];

export const publicCourses = [
  {
    id: 'percusion-folklorica',
    title: 'Percusión folklórica del Caribe',
    category: 'Música tradicional',
    type: 'Gratuito',
    price: 'Gratis',
    level: 'Inicial',
    duration: '8 semanas',
    modules: '12 módulos',
    image: youthPercussion,
    description: 'Fundamentos de tambor, patrones rítmicos, coordinación, escucha colectiva y práctica grupal.',
    includes: ['Talleres presenciales', 'Ejercicios guiados', 'Evaluación práctica', 'Registro de avance'],
  },
  {
    id: 'gaitas-tradicionales',
    title: 'Gaitas tradicionales',
    category: 'Instrumentos de viento',
    type: 'Gratuito',
    price: 'Gratis',
    level: 'Inicial / intermedio',
    duration: '10 semanas',
    modules: '10 módulos',
    image: childrenGaitas,
    description: 'Introducción a la interpretación, respiración, memoria sonora y participación en ensambles.',
    includes: ['Guías de práctica', 'Ensambles', 'Seguimiento por docente', 'Certificación según avance'],
  },
  {
    id: 'cantos-pajarito',
    title: 'Cantos de pajarito y tradición oral',
    category: 'Canto y memoria',
    type: 'Gratuito',
    price: 'Gratis',
    level: 'Inicial',
    duration: '6 semanas',
    modules: '8 módulos',
    image: fluteClass,
    description: 'Exploración de canto, oralidad, territorio, lírica popular y expresión colectiva.',
    includes: ['Repertorio base', 'Memoria oral', 'Actividades de escucha', 'Participación grupal'],
  },
  {
    id: 'aprendizaje-sonoro',
    title: 'Aprendizaje sonoro',
    category: 'Neuroeducación',
    type: 'Pago',
    price: 'Valor por definir',
    level: 'Formativo',
    duration: '12 semanas',
    modules: '14 módulos',
    image: schoolAlliance,
    description: 'Ruta educativa para fortalecer atención, memoria, coordinación y aprendizaje mediante experiencias musicales.',
    includes: ['Ruta pedagógica', 'Actividades evaluables', 'Seguimiento individual', 'Constancia de participación'],
  },
  {
    id: 'ensamble-cultural',
    title: 'Ensamble cultural Tamborito',
    category: 'Práctica escénica',
    type: 'Pago',
    price: 'Valor por definir',
    level: 'Intermedio',
    duration: '16 semanas',
    modules: '16 módulos',
    image: riverEnsemble,
    description: 'Proceso para estudiantes con bases musicales que desean participar en muestras y presentaciones.',
    includes: ['Montaje de repertorio', 'Práctica escénica', 'Evaluación de desempeño', 'Presentación final'],
  },
  {
    id: 'formacion-docente',
    title: 'Herramientas culturales para docentes',
    category: 'Docentes y aliados',
    type: 'Pago',
    price: 'Valor por definir',
    level: 'Complementario',
    duration: '4 semanas',
    modules: '6 módulos',
    image: percussionClass,
    description: 'Curso para orientar actividades culturales, musicales y patrimoniales en contextos educativos.',
    includes: ['Material pedagógico', 'Actividades aplicables', 'Sesiones de orientación', 'Certificado'],
  },
];

export const studentCourses = [
  {
    title: 'Percusión folklórica del Caribe',
    status: 'En curso',
    access: 'Inscripción gratuita aprobada',
    progress: 75,
    modulesDone: '9 de 12 módulos',
    nextLesson: 'Tambor alegre: patrones de respuesta',
    pending: 'Subir evidencia práctica',
    certificate: 'Disponible al completar evaluación final',
  },
  {
    title: 'Aprendizaje sonoro',
    status: 'Comprado',
    access: 'Pago confirmado',
    progress: 35,
    modulesDone: '5 de 14 módulos',
    nextLesson: 'Memoria auditiva y coordinación',
    pending: 'Responder actividad evaluativa 2',
    certificate: 'Pendiente',
  },
  {
    title: 'Gaitas tradicionales',
    status: 'Finalizado',
    access: 'Inscripción gratuita aprobada',
    progress: 100,
    modulesDone: '10 de 10 módulos',
    nextLesson: 'Curso completado',
    pending: 'Sin pendientes',
    certificate: 'Constancia lista para descargar',
  },
];

export const coursePlatformSteps = [
  {
    title: 'Oferta pública',
    text: 'El visitante ve cursos gratuitos y pagos, duración, nivel, módulos, requisitos y llamado a inscripción o compra.',
  },
  {
    title: 'Registro obligatorio',
    text: 'Todo curso requiere cuenta de usuario para conservar historial, evaluaciones, asistencia, pagos y certificaciones.',
  },
  {
    title: 'Panel del estudiante',
    text: 'Al iniciar sesión, el estudiante ve sus cursos activos, comprados, gratuitos aprobados, progreso y actividades pendientes.',
  },
  {
    title: 'Certificación',
    text: 'El sistema registra evolución, talleres, evidencias y evaluaciones para habilitar constancias o titulaciones internas.',
  },
];

export const libraryPreview = [
  'Cartillas de percusión básica',
  'Guías de gaitas tradicionales',
  'Cancioneros y repertorios',
  'Memoria cultural de Zambrano',
];
