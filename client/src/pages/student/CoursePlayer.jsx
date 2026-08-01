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

const lessonTypeLabels = {
  video: 'Clase en video',
  reading: 'Lectura',
  quiz: 'Evaluación',
  practice: 'Práctica guiada',
  assignment: 'Actividad entregable',
};

export default function CoursePlayer() {
  const { courseId, lessonId } = useParams();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [message, setMessage] = useState('');

  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    getCourseById,
    getEnrollment,
    getCourseProgress,
    toggleLessonCompletion,
  } = usePlatform();

  const course = getCourseById(courseId);
  const enrollment = getEnrollment(
    user.id,
    courseId,
  );

  const lessons = useMemo(
    () =>
      course?.modules.flatMap(
        (module, moduleIndex) =>
          module.lessons.map(
            (lesson, lessonIndex) => ({
              ...lesson,
              moduleId: module.id,
              moduleTitle: module.title,
              moduleIndex,
              lessonIndex,
            }),
          ),
      ) ?? [],
    [course],
  );

  const currentLessonIndex = lessons.findIndex(
    (lesson) => lesson.id === lessonId,
  );

  const lesson =
    currentLessonIndex >= 0
      ? lessons[currentLessonIndex]
      : null;

  const previousLesson =
    currentLessonIndex > 0
      ? lessons[currentLessonIndex - 1]
      : null;

  const nextLesson =
    currentLessonIndex >= 0 &&
    currentLessonIndex < lessons.length - 1
      ? lessons[currentLessonIndex + 1]
      : null;

  const completedLessons = new Set(
    enrollment?.completedLessons ?? [],
  );

  const lessonCompleted = completedLessons.has(
    lessonId,
  );

  const progress = course
    ? getCourseProgress(user.id, course.id)
    : null;

  if (!course || !enrollment || !lesson) {
    return (
      <Navigate to="/campus/cursos" replace />
    );
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
      setMessage(
        'Completaste todas las clases. Tu certificado está disponible.',
      );
      return;
    }

    setMessage(
      result.completed
        ? 'Clase marcada como completada.'
        : 'La clase volvió a quedar pendiente.',
    );
  }

  function goToLesson(targetLesson) {
    if (!targetLesson) {
      return;
    }

    setMessage('');
    setSidebarOpen(false);

    navigate(
      `/campus/cursos/${course.id}/clase/${targetLesson.id}`,
    );
  }

  function renderLessonContent() {
    if (lesson.type === 'video') {
      return (
        <>
          <div className="student-video-player">
            <div className="student-video-placeholder">
              <div>
                <PlatformIcon
                  name="play"
                  size={44}
                />
              </div>

              <span>
                <strong>{lesson.title}</strong>
                <small>
                  Reproductor audiovisual de
                  demostración
                </small>
              </span>
            </div>

            <div className="student-video-controls">
              <button type="button">
                <PlatformIcon
                  name="play"
                  size={18}
                />
              </button>

              <div>
                <span />
              </div>

              <small>
                00:00 / {lesson.minutes}:00
              </small>
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
          <div className="student-reading-icon">
            <PlatformIcon name="book" size={34} />
          </div>

          <p className="student-reading-lead">
            {lesson.summary}
          </p>

          <h2>{lesson.title}</h2>

          <p>{lesson.content}</p>

          <div className="student-reading-callout">
            <strong>Orientación de lectura</strong>
            <p>
              Toma notas de las ideas principales y
              relaciónalas con tu experiencia cultural o
              educativa.
            </p>
          </div>
        </div>
      );
    }

    if (lesson.type === 'quiz') {
      return (
        <div className="student-assessment-content">
          <div className="student-assessment-heading">
            <div>
              <PlatformIcon name="check" size={30} />
            </div>

            <span>
              <small>Evaluación del módulo</small>
              <h2>{lesson.title}</h2>
            </span>
          </div>

          <p>{lesson.content}</p>

          <div className="student-demo-question">
            <strong>
              Ejemplo de pregunta de demostración
            </strong>

            <p>
              ¿Cuál es la importancia de la escucha
              colectiva dentro de un ensamble?
            </p>

            <label>
              <input
                type="radio"
                name="demo-question"
              />
              <span>
                Permite reconocer señales y sostener el
                trabajo del grupo.
              </span>
            </label>

            <label>
              <input
                type="radio"
                name="demo-question"
              />
              <span>
                Solo sirve para aumentar el volumen de
                los instrumentos.
              </span>
            </label>

            <label>
              <input
                type="radio"
                name="demo-question"
              />
              <span>
                Reemplaza completamente la práctica
                individual.
              </span>
            </label>
          </div>

          <div className="platform-alert warning">
            Las preguntas, intentos, respuestas y
            calificaciones reales se almacenarán desde
            Django.
          </div>
        </div>
      );
    }

    if (
      lesson.type === 'practice' ||
      lesson.type === 'assignment'
    ) {
      return (
        <div className="student-assignment-content">
          <div className="student-assignment-heading">
            <div>
              <PlatformIcon
                name={
                  lesson.type === 'assignment'
                    ? 'orders'
                    : 'play'
                }
                size={30}
              />
            </div>

            <span>
              <small>
                {lessonTypeLabels[lesson.type]}
              </small>
              <h2>{lesson.title}</h2>
            </span>
          </div>

          <p>{lesson.content}</p>

          <div className="student-assignment-instructions">
            <h3>Indicaciones</h3>

            <ol>
              <li>
                Revisa cuidadosamente la explicación de
                la actividad.
              </li>
              <li>
                Realiza la práctica siguiendo la guía
                propuesta.
              </li>
              <li>
                Prepara la evidencia solicitada en audio,
                video, imagen o documento.
              </li>
              <li>
                Verifica el archivo antes de realizar la
                entrega.
              </li>
            </ol>
          </div>

          {lesson.type === 'assignment' && (
            <div className="student-upload-placeholder">
              <PlatformIcon name="plus" size={30} />

              <h3>Agregar evidencia</h3>

              <p>
                Arrastra un archivo o selecciónalo desde
                tu dispositivo.
              </p>

              <button
                type="button"
                className="platform-button platform-button-ghost"
                onClick={() =>
                  setMessage(
                    'La carga real de archivos se conectará al backend.',
                  )
                }
              >
                Seleccionar archivo
              </button>
            </div>
          )}
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
          <Link
            to={`/campus/cursos/${course.id}`}
            className="student-player-back"
          >
            <PlatformIcon
              name="chevronRight"
              size={17}
            />
            Volver al curso
          </Link>

          <span>{course.title}</span>
        </div>

        <div className="student-player-header-progress">
          <span>
            {progress.completed} de {progress.total}{' '}
            clases
          </span>

          <div>
            <span
              style={{
                width: `${progress.percentage}%`,
              }}
            />
          </div>

          <strong>{progress.percentage}%</strong>
        </div>

        <button
          type="button"
          className="student-player-menu-button"
          onClick={() =>
            setSidebarOpen((current) => !current)
          }
        >
          <PlatformIcon name="lessons" size={21} />
          Contenido
        </button>
      </header>

      <div className="student-player-layout">
        <main className="student-player-main">
          <section className="student-player-lesson-heading">
            <div>
              <span>
                {lesson.moduleTitle}
              </span>

              <h1>{lesson.title}</h1>

              <div>
                <small>
                  {lessonTypeLabels[lesson.type]}
                </small>
                <small>{lesson.minutes} minutos</small>
              </div>
            </div>

            <button
              type="button"
              className={[
                'student-completion-button',
                lessonCompleted
                  ? 'completed'
                  : '',
              ].join(' ')}
              onClick={handleCompletion}
            >
              <PlatformIcon
                name="check"
                size={18}
              />

              {lessonCompleted
                ? 'Clase completada'
                : 'Marcar como completada'}
            </button>
          </section>

          {message && (
            <div className="platform-alert success student-player-message">
              {message}
            </div>
          )}

          <section className="student-player-content">
            {renderLessonContent()}
          </section>

          {lesson.resources?.length > 0 && (
            <section className="student-lesson-resources">
              <div className="student-section-heading">
                <div>
                  <p className="student-page-eyebrow">
                    Material de apoyo
                  </p>
                  <h2>Recursos de la clase</h2>
                </div>
              </div>

              <div className="student-resource-list">
                {lesson.resources.map((resource) => (
                  <article key={resource.id}>
                    <div>
                      <PlatformIcon
                        name={
                          resource.type === 'Audio'
                            ? 'play'
                            : 'book'
                        }
                        size={21}
                      />
                    </div>

                    <span>
                      <strong>{resource.name}</strong>
                      <small>
                        {resource.type} · {resource.size}
                      </small>
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setMessage(
                          'La descarga se habilitará con los archivos almacenados en el backend.',
                        )
                      }
                    >
                      Descargar
                    </button>
                  </article>
                ))}
              </div>
            </section>
          )}

          <footer className="student-player-navigation">
            {previousLesson ? (
              <button
                type="button"
                onClick={() =>
                  goToLesson(previousLesson)
                }
              >
                <PlatformIcon
                  name="chevronRight"
                  size={18}
                  className="back-icon"
                />

                <span>
                  <small>Clase anterior</small>
                  <strong>
                    {previousLesson.title}
                  </strong>
                </span>
              </button>
            ) : (
              <span />
            )}

            {nextLesson ? (
              <button
                type="button"
                className="next"
                onClick={() => goToLesson(nextLesson)}
              >
                <span>
                  <small>Siguiente clase</small>
                  <strong>{nextLesson.title}</strong>
                </span>

                <PlatformIcon
                  name="chevronRight"
                  size={18}
                />
              </button>
            ) : (
              <Link
                to={`/campus/cursos/${course.id}`}
                className="student-player-finish"
              >
                Finalizar curso
                <PlatformIcon
                  name="check"
                  size={18}
                />
              </Link>
            )}
          </footer>
        </main>

        <aside
          className={[
            'student-player-sidebar',
            sidebarOpen ? 'open' : '',
          ].join(' ')}
        >
          <div className="student-player-sidebar-heading">
            <div>
              <span>Contenido del curso</span>
              <strong>
                {progress.percentage}% completado
              </strong>
            </div>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
            >
              <PlatformIcon name="close" size={20} />
            </button>
          </div>

          <div className="student-player-modules">
            {course.modules.map(
              (module, moduleIndex) => (
                <section key={module.id}>
                  <div className="student-player-module-title">
                    <span>
                      Módulo {moduleIndex + 1}
                    </span>

                    <strong>{module.title}</strong>
                  </div>

                  <div>
                    {module.lessons.map(
                      (moduleLesson, lessonIndex) => {
                        const completed =
                          completedLessons.has(
                            moduleLesson.id,
                          );

                        const current =
                          moduleLesson.id === lesson.id;

                        return (
                          <button
                            type="button"
                            key={moduleLesson.id}
                            className={[
                              'student-player-lesson-link',
                              completed
                                ? 'completed'
                                : '',
                              current ? 'current' : '',
                            ].join(' ')}
                            onClick={() =>
                              goToLesson(moduleLesson)
                            }
                          >
                            <span>
                              {completed ? (
                                <PlatformIcon
                                  name="check"
                                  size={15}
                                />
                              ) : (
                                lessonIndex + 1
                              )}
                            </span>

                            <div>
                              <strong>
                                {moduleLesson.title}
                              </strong>
                              <small>
                                {
                                  lessonTypeLabels[
                                    moduleLesson.type
                                  ]
                                }{' '}
                                · {moduleLesson.minutes} min
                              </small>
                            </div>
                          </button>
                        );
                      },
                    )}
                  </div>
                </section>
              ),
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}