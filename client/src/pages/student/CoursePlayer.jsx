import { useMemo, useState } from 'react';
import {
  Link,
  Navigate,
  useNavigate,
  useParams,
} from 'react-router-dom';
import PlatformIcon from '../../components/PlatformIcon';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import { formatDate } from '../../utils/formatters';

const lessonTypeLabels = {
  video: 'Video',
  reading: 'Lectura',
  quiz: 'Evaluación',
  practice: 'Práctica',
  assignment: 'Actividad entregable',
};

function formatFileSize(size = 0) {
  if (!size) return 'Sin tamaño registrado';
  const mb = size / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(size / 1024)} KB`;
}

export default function CoursePlayer() {
  const { courseId, lessonId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [evidenceDescription, setEvidenceDescription] = useState('');
  const [evidenceFile, setEvidenceFile] = useState(null);

  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    getCourseById,
    getEnrollment,
    getCourseProgress,
    toggleLessonCompletion,
    submitEvidence,
  } = usePlatform();

  const course = getCourseById(courseId);
  const enrollment = getEnrollment(user.id, courseId);

  const lessons = useMemo(
    () =>
      course?.modules.flatMap((module, moduleIndex) =>
        module.lessons.map((lesson, lessonIndex) => ({
          ...lesson,
          moduleId: module.id,
          moduleTitle: module.title,
          moduleIndex,
          lessonIndex,
        })),
      ) ?? [],
    [course],
  );

  const currentLessonIndex = lessons.findIndex((lesson) => lesson.id === lessonId);
  const lesson = currentLessonIndex >= 0 ? lessons[currentLessonIndex] : null;
  const previousLesson = currentLessonIndex > 0 ? lessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex >= 0 && currentLessonIndex < lessons.length - 1 ? lessons[currentLessonIndex + 1] : null;

  const completedLessons = new Set(enrollment?.completedLessons ?? []);
  const lessonCompleted = completedLessons.has(lessonId);
  const progress = course ? getCourseProgress(user.id, course.id) : null;
  const currentEvidence = enrollment?.evidence?.find((item) => item.lessonId === lessonId) ?? null;

  if (!course || !enrollment || !lesson) {
    return <Navigate to="/campus/cursos" replace />;
  }

  function handleCompletion() {
    const result = toggleLessonCompletion({
      userId: user.id,
      courseId: course.id,
      lessonId: lesson.id,
    });

    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    if (result.finished) {
      setMessage('El avance llegó al 100%. El certificado quedó disponible si el curso lo permite.');
      return;
    }

    setMessage(result.completed ? 'Avance registrado.' : 'El avance volvió a quedar pendiente.');
  }

  function handleEvidenceSubmit(event) {
    event.preventDefault();

    const result = submitEvidence({
      userId: user.id,
      courseId: course.id,
      lessonId: lesson.id,
      file: evidenceFile,
      description: evidenceDescription,
    });

    setMessage(result.message);

    if (result.ok) {
      setEvidenceFile(null);
      setEvidenceDescription('');
      event.currentTarget.reset();
    }
  }

  function goToLesson(targetLesson) {
    if (!targetLesson) return;
    setMessage('');
    setSidebarOpen(false);
    navigate(`/campus/cursos/${course.id}/clase/${targetLesson.id}`);
  }

  function renderEvidenceBox() {
    if (lesson.type !== 'assignment' && lesson.type !== 'practice') {
      return null;
    }

    return (
      <form className="student-upload-placeholder evidence-form" onSubmit={handleEvidenceSubmit}>
        <PlatformIcon name="plus" size={30} />
        <h3>Entregar evidencia</h3>
        <p>Registra un audio, video, imagen o documento relacionado con esta actividad.</p>

        {currentEvidence && (
          <div className="platform-alert success evidence-current">
            <strong>Última entrega:</strong> {currentEvidence.fileName} ·{' '}
            {formatFileSize(currentEvidence.fileSize)} · {formatDate(currentEvidence.submittedAt)}
          </div>
        )}

        <div className="platform-field full">
          <label htmlFor="evidence-file">Archivo</label>
          <input
            id="evidence-file"
            type="file"
            onChange={(event) => setEvidenceFile(event.target.files?.[0] ?? null)}
          />
        </div>

        <div className="platform-field full">
          <label htmlFor="evidence-description">Descripción breve</label>
          <textarea
            id="evidence-description"
            rows="3"
            value={evidenceDescription}
            onChange={(event) => setEvidenceDescription(event.target.value)}
            placeholder="Ej: práctica de coordinación, video de interpretación, guía resuelta..."
          />
        </div>

        <button type="submit" className="platform-button platform-button-primary">
          Entregar evidencia
        </button>
      </form>
    );
  }

  function renderLessonContent() {
    if (lesson.type === 'video') {
      return (
        <>
          <div className="student-video-player">
            <div className="student-video-placeholder">
              <div><PlatformIcon name="play" size={44} /></div>
              <span>
                <strong>{lesson.title}</strong>
                <small>Reproductor audiovisual de demostración</small>
              </span>
            </div>
            <div className="student-video-controls">
              <button type="button"><PlatformIcon name="play" size={18} /></button>
              <div><span /></div>
              <small>00:00 / {lesson.minutes}:00</small>
            </div>
          </div>

          <div className="student-lesson-body">
            <h2>Descripción de la clase</h2>
            <p>{lesson.content}</p>
          </div>
        </>
      );
    }

    if (lesson.type === 'reading') {
      return (
        <div className="student-reading-content">
          <div className="student-reading-icon"><PlatformIcon name="book" size={34} /></div>
          <p className="student-reading-lead">{lesson.summary}</p>
          <h2>{lesson.title}</h2>
          <p>{lesson.content}</p>
          <div className="student-reading-callout">
            <strong>Orientación de lectura</strong>
            <p>Toma notas de las ideas principales y relaciónalas con la práctica del curso.</p>
          </div>
        </div>
      );
    }

    if (lesson.type === 'quiz') {
      return (
        <div className="student-assessment-content">
          <div className="student-assessment-heading">
            <div><PlatformIcon name="check" size={30} /></div>
            <span>
              <small>Evaluación</small>
              <h2>{lesson.title}</h2>
            </span>
          </div>

          <p>{lesson.content}</p>

          <div className="student-demo-question">
            <strong>Pregunta de demostración</strong>
            <p>¿Cuál es la importancia de la escucha colectiva dentro de un ensamble?</p>
            <label>
              <input type="radio" name="demo-question" />
              <span>Permite reconocer señales y sostener el trabajo del grupo.</span>
            </label>
            <label>
              <input type="radio" name="demo-question" />
              <span>Solo sirve para aumentar el volumen de los instrumentos.</span>
            </label>
          </div>
        </div>
      );
    }

    if (lesson.type === 'practice' || lesson.type === 'assignment') {
      return (
        <div className="student-assignment-content">
          <div className="student-assignment-heading">
            <div><PlatformIcon name={lesson.type === 'assignment' ? 'orders' : 'play'} size={30} /></div>
            <span>
              <small>{lessonTypeLabels[lesson.type]}</small>
              <h2>{lesson.title}</h2>
            </span>
          </div>

          <p>{lesson.content}</p>

          <div className="student-assignment-instructions">
            <h3>Indicaciones</h3>
            <ol>
              <li>Revisa la explicación de la actividad.</li>
              <li>Realiza la práctica siguiendo la guía propuesta.</li>
              <li>Prepara la evidencia solicitada en audio, video, imagen o documento.</li>
              <li>Entrega el archivo desde este formulario.</li>
            </ol>
          </div>

          {renderEvidenceBox()}
        </div>
      );
    }

    return (
      <div className="student-lesson-body">
        <h2>{lesson.title}</h2>
        <p>{lesson.content}</p>
      </div>
    );
  }

  return (
    <div className="student-player-page">
      <header className="student-player-header">
        <div>
          <Link to={`/campus/cursos/${course.id}`} className="student-player-back">
            <PlatformIcon name="chevronRight" size={17} />
            Volver al curso
          </Link>
          <span>{course.title}</span>
        </div>

        <div className="student-player-header-progress">
          <span>{progress.completed} de {progress.total} avances</span>
          <div className="student-progress-track">
            <span style={{ width: `${progress.percentage}%` }} />
          </div>
          <strong>{progress.percentage}%</strong>
        </div>

        <button
          type="button"
          className="student-player-menu-button"
          onClick={() => setSidebarOpen((current) => !current)}
        >
          <PlatformIcon name="lessons" size={21} />
          Contenido
        </button>
      </header>

      <div className="student-player-layout">
        <main className="student-player-main">
          <section className="student-player-lesson-heading">
            <div>
              <span>{lesson.moduleTitle}</span>
              <h1>{lesson.title}</h1>
              <div>
                <small>{lessonTypeLabels[lesson.type]}</small>
                <small>{lesson.minutes} minutos</small>
              </div>
            </div>

            <button
              type="button"
              className={['student-completion-button', lessonCompleted ? 'completed' : ''].join(' ')}
              onClick={handleCompletion}
            >
              <PlatformIcon name="check" size={18} />
              {lessonCompleted ? 'Avance registrado' : 'Registrar avance'}
            </button>
          </section>

          {message && <div className="platform-alert success student-player-message">{message}</div>}

          <section className="student-player-content">{renderLessonContent()}</section>

          {lesson.resources?.length > 0 && (
            <section className="student-lesson-resources">
              <div className="student-section-heading"><div><h2>Recursos de la clase</h2></div></div>
              <div className="student-resource-list">
                {lesson.resources.map((resource) => (
                  <article key={resource.id}>
                    <div><PlatformIcon name={resource.type === 'Audio' ? 'play' : 'book'} size={21} /></div>
                    <span>
                      <strong>{resource.name}</strong>
                      <small>{resource.type} · {resource.size}</small>
                    </span>
                    <button type="button" onClick={() => setMessage('La descarga se conectará al almacenamiento del backend.')}>
                      Descargar
                    </button>
                  </article>
                ))}
              </div>
            </section>
          )}

          <footer className="student-player-navigation">
            {previousLesson ? (
              <button type="button" onClick={() => goToLesson(previousLesson)}>
                <PlatformIcon name="chevronRight" size={18} className="back-icon" />
                <span><small>Clase anterior</small><strong>{previousLesson.title}</strong></span>
              </button>
            ) : <span />}

            {nextLesson ? (
              <button type="button" className="next" onClick={() => goToLesson(nextLesson)}>
                <span><small>Siguiente clase</small><strong>{nextLesson.title}</strong></span>
                <PlatformIcon name="chevronRight" size={18} />
              </button>
            ) : (
              <Link to={`/campus/cursos/${course.id}`} className="student-player-finish">
                Finalizar curso
                <PlatformIcon name="check" size={18} />
              </Link>
            )}
          </footer>
        </main>

        <aside className={['student-player-sidebar', sidebarOpen ? 'open' : ''].join(' ')}>
          <div className="student-player-sidebar-heading">
            <div>
              <span>Contenido del curso</span>
              <strong>{progress.percentage}% de avance</strong>
            </div>
            <button type="button" onClick={() => setSidebarOpen(false)}>
              <PlatformIcon name="close" size={20} />
            </button>
          </div>

          <div className="student-player-modules">
            {course.modules.map((module, moduleIndex) => (
              <section key={module.id}>
                <div className="student-player-module-title">
                  <span>Módulo {moduleIndex + 1}</span>
                  <strong>{module.title}</strong>
                </div>
                <div>
                  {module.lessons.map((moduleLesson, lessonIndex) => {
                    const completed = completedLessons.has(moduleLesson.id);
                    const current = moduleLesson.id === lesson.id;
                    return (
                      <button
                        type="button"
                        key={moduleLesson.id}
                        className={['student-player-lesson-link', completed ? 'completed' : '', current ? 'current' : ''].join(' ')}
                        onClick={() => goToLesson(moduleLesson)}
                      >
                        <span>{completed ? <PlatformIcon name="check" size={15} /> : lessonIndex + 1}</span>
                        <div>
                          <strong>{moduleLesson.title}</strong>
                          <small>{lessonTypeLabels[moduleLesson.type]} · {moduleLesson.minutes} min</small>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}