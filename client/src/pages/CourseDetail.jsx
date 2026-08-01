import {
  useMemo,
  useState,
} from 'react';
import {
  Link,
  Navigate,
  useNavigate,
  useParams,
} from 'react-router-dom';
import PageShell from '../components/PageShell';
import FoundationFooter from '../components/FoundationFooter';
import PlatformIcon from '../components/PlatformIcon';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { usePlatform } from '../context/PlatformContext';
import {
  formatCurrency,
  getCourseDuration,
  getCourseLessonCount,
} from '../utils/formatters';

const lessonTypeLabels = {
  video: 'Video',
  reading: 'Lectura',
  quiz: 'Evaluación',
  practice: 'Práctica',
  assignment: 'Actividad',
};

export default function CourseDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [openModules, setOpenModules] =
    useState([0]);

  const [message, setMessage] =
    useState('');

  const { user } = useAuth();
  const { addCourse } = useCart();

  const {
    getCourseBySlug,
    getInstructorById,
    getEnrollment,
    enrollFreeCourse,
  } = usePlatform();

  const course = getCourseBySlug(slug);

  const instructor = course
    ? getInstructorById(
        course.instructorId,
      )
    : null;

  const enrollment =
    user?.role === 'client' && course
      ? getEnrollment(user.id, course.id)
      : null;

  const totalLessons = course
    ? getCourseLessonCount(course)
    : 0;

  const totalDuration = course
    ? getCourseDuration(course)
    : '';

  const previewLessons = useMemo(
    () =>
      course?.modules
        .flatMap((module) =>
          module.lessons.map(
            (lesson) => ({
              ...lesson,
              moduleTitle:
                module.title,
            }),
          ),
        )
        .filter(
          (lesson) => lesson.preview,
        ) ?? [],
    [course],
  );

  if (!course) {
    return <Navigate to="/cursos" replace />;
  }

  if (course.status !== 'published') {
    return <Navigate to="/cursos" replace />;
  }

  function toggleModule(index) {
    setOpenModules((current) =>
      current.includes(index)
        ? current.filter(
            (item) => item !== index,
          )
        : [...current, index],
    );
  }

  function showMessage(text) {
    setMessage(text);

    window.setTimeout(() => {
      setMessage('');
    }, 3500);
  }

  function handleEnrollment() {
    if (!user) {
      navigate(
        `/login?next=${encodeURIComponent(
          `/cursos/${course.slug}`,
        )}`,
      );
      return;
    }

    if (user.role !== 'client') {
      showMessage(
        'La cuenta administrativa no puede inscribirse como estudiante.',
      );
      return;
    }

    const result = enrollFreeCourse(
      user.id,
      course.id,
    );

    showMessage(result.message);

    if (result.ok) {
      navigate(
        `/campus/cursos/${course.id}`,
      );
    }
  }

  function handleCart() {
    const result = addCourse(course);
    showMessage(result.message);

    if (result.ok) {
      navigate('/carrito');
    }
  }

  return (
    <PageShell variant="foundation">
      <main className="course-detail-page">
        <section className="course-detail-hero">
          <div className="container course-detail-hero-grid">
            <div className="course-detail-copy">
              <nav className="course-breadcrumb">
                <Link to="/fundacion">
                  Fundación
                </Link>
                <PlatformIcon
                  name="chevronRight"
                  size={15}
                />
                <Link to="/cursos">
                  Cursos
                </Link>
                <PlatformIcon
                  name="chevronRight"
                  size={15}
                />
                <span>{course.category}</span>
              </nav>

              <div className="course-detail-badges">
                <span>{course.category}</span>
                <span>{course.level}</span>
                <span>
                  {course.isFree
                    ? 'Curso gratuito'
                    : 'Curso de pago'}
                </span>
              </div>

              <h1>{course.title}</h1>

              <p className="course-detail-subtitle">
                {course.subtitle}
              </p>

              <div className="course-detail-rating">
                <strong>
                  {course.rating || 'Nuevo'}
                </strong>

                <div>
                  {Array.from({
                    length: 5,
                  }).map((_, index) => (
                    <PlatformIcon
                      key={index}
                      name="star"
                      size={17}
                    />
                  ))}
                </div>

                <span>
                  {course.studentsCount}{' '}
                  estudiantes
                </span>
              </div>

              <div className="course-detail-instructor">
                <img
                  src={instructor?.avatar}
                  alt={instructor?.name}
                />

                <span>
                  <small>
                    Creado por
                  </small>
                  <strong>
                    {instructor?.name}
                  </strong>
                </span>
              </div>

              <div className="course-detail-stats">
                <span>
                  <PlatformIcon
                    name="lessons"
                    size={19}
                  />
                  {totalLessons} clases
                </span>

                <span>
                  <PlatformIcon
                    name="clock"
                    size={19}
                  />
                  {totalDuration}
                </span>

                <span>
                  <PlatformIcon
                    name="certificate"
                    size={19}
                  />
                  {course.certificate
                    ? 'Certificado'
                    : 'Sin certificado'}
                </span>

                <span>
                  <PlatformIcon
                    name="play"
                    size={19}
                  />
                  {course.modality}
                </span>
              </div>
            </div>

            <aside className="course-purchase-card">
              <img
                src={course.cover}
                alt={course.title}
              />

              <div className="course-purchase-content">
                <span className="course-purchase-label">
                  Acceso completo
                </span>

                <strong className="course-purchase-price">
                  {course.isFree
                    ? 'Gratis'
                    : formatCurrency(
                        course.price,
                      )}
                </strong>

                {message && (
                  <div className="platform-alert success">
                    {message}
                  </div>
                )}

                {enrollment ? (
                  <Link
                    to={`/campus/cursos/${course.id}`}
                    className="platform-button platform-button-primary platform-button-large"
                  >
                    Continuar curso
                  </Link>
                ) : course.isFree ? (
                  <button
                    type="button"
                    className="platform-button platform-button-primary platform-button-large"
                    onClick={handleEnrollment}
                  >
                    Inscribirme gratis
                  </button>
                ) : (
                  <button
                    type="button"
                    className="platform-button platform-button-primary platform-button-large"
                    onClick={handleCart}
                  >
                    Agregar al carrito
                  </button>
                )}

                {!user && (
                  <Link
                    to={`/login?next=${encodeURIComponent(
                      `/cursos/${course.slug}`,
                    )}`}
                    className="platform-button platform-button-ghost"
                  >
                    Ya tengo una cuenta
                  </Link>
                )}

                <div className="course-purchase-includes">
                  <strong>
                    Este curso incluye:
                  </strong>

                  <ul>
                    <li>
                      <PlatformIcon
                        name="check"
                        size={17}
                      />
                      Acceso a todos los
                      módulos
                    </li>

                    <li>
                      <PlatformIcon
                        name="check"
                        size={17}
                      />
                      Recursos descargables
                    </li>

                    <li>
                      <PlatformIcon
                        name="check"
                        size={17}
                      />
                      Actividades y
                      evaluaciones
                    </li>

                    {course.certificate && (
                      <li>
                        <PlatformIcon
                          name="check"
                          size={17}
                        />
                        Certificado de
                        finalización
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="course-detail-content-section">
          <div className="container course-detail-layout">
            <div className="course-detail-main">
              <section className="course-detail-block">
                <h2>
                  Lo que aprenderás
                </h2>

                <div className="course-outcomes-grid">
                  {course.learningOutcomes.map(
                    (outcome) => (
                      <article key={outcome}>
                        <PlatformIcon
                          name="check"
                          size={20}
                        />
                        <span>{outcome}</span>
                      </article>
                    ),
                  )}
                </div>
              </section>

              <section className="course-detail-block">
                <h2>
                  Sobre este curso
                </h2>

                <p className="course-description">
                  {course.description}
                </p>
              </section>

              <section className="course-detail-block">
                <div className="course-content-heading">
                  <div>
                    <h2>
                      Contenido del curso
                    </h2>

                    <p>
                      {course.modules.length}{' '}
                      módulos · {totalLessons}{' '}
                      clases · {totalDuration}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setOpenModules(
                        openModules.length ===
                          course.modules.length
                          ? []
                          : course.modules.map(
                              (_, index) =>
                                index,
                            ),
                      )
                    }
                  >
                    {openModules.length ===
                    course.modules.length
                      ? 'Contraer todo'
                      : 'Expandir todo'}
                  </button>
                </div>

                <div className="course-module-list">
                  {course.modules.map(
                    (module, moduleIndex) => {
                      const isOpen =
                        openModules.includes(
                          moduleIndex,
                        );

                      const moduleMinutes =
                        module.lessons.reduce(
                          (total, lesson) =>
                            total +
                            Number(
                              lesson.minutes ||
                                0,
                            ),
                          0,
                        );

                      return (
                        <article
                          className="course-module"
                          key={module.id}
                        >
                          <button
                            type="button"
                            className="course-module-header"
                            onClick={() =>
                              toggleModule(
                                moduleIndex,
                              )
                            }
                          >
                            <span className="course-module-number">
                              {String(
                                moduleIndex + 1,
                              ).padStart(2, '0')}
                            </span>

                            <span className="course-module-copy">
                              <strong>
                                {module.title}
                              </strong>
                              <small>
                                {
                                  module.lessons
                                    .length
                                }{' '}
                                clases ·{' '}
                                {moduleMinutes} min
                              </small>
                            </span>

                            <PlatformIcon
                              name={
                                isOpen
                                  ? 'chevronDown'
                                  : 'chevronRight'
                              }
                              size={20}
                            />
                          </button>

                          {isOpen && (
                            <div className="course-module-lessons">
                              {module.lessons.map(
                                (lesson) => (
                                  <div
                                    className="course-module-lesson"
                                    key={
                                      lesson.id
                                    }
                                  >
                                    <div className="course-module-lesson-icon">
                                      <PlatformIcon
                                        name={
                                          lesson.type ===
                                          'video'
                                            ? 'play'
                                            : lesson.type ===
                                                'quiz'
                                              ? 'check'
                                              : 'book'
                                        }
                                        size={18}
                                      />
                                    </div>

                                    <span className="course-module-lesson-copy">
                                      <strong>
                                        {
                                          lesson.title
                                        }
                                      </strong>
                                      <small>
                                        {
                                          lessonTypeLabels[
                                            lesson
                                              .type
                                          ]
                                        }{' '}
                                        ·{' '}
                                        {
                                          lesson.minutes
                                        }{' '}
                                        min
                                      </small>
                                    </span>

                                    {lesson.preview ? (
                                      <span className="course-preview-label">
                                        Vista previa
                                      </span>
                                    ) : (
                                      <PlatformIcon
                                        name="lock"
                                        size={17}
                                      />
                                    )}
                                  </div>
                                ),
                              )}
                            </div>
                          )}
                        </article>
                      );
                    },
                  )}
                </div>
              </section>

              {previewLessons.length > 0 && (
                <section className="course-detail-block">
                  <h2>
                    Clases disponibles como
                    vista previa
                  </h2>

                  <div className="course-preview-grid">
                    {previewLessons.map(
                      (lesson) => (
                        <article
                          key={lesson.id}
                          className="course-preview-card"
                        >
                          <div>
                            <PlatformIcon
                              name={
                                lesson.type ===
                                'video'
                                  ? 'play'
                                  : 'book'
                              }
                              size={24}
                            />
                          </div>

                          <span>
                            <small>
                              {
                                lesson.moduleTitle
                              }
                            </small>
                            <strong>
                              {lesson.title}
                            </strong>
                            <p>
                              {lesson.summary}
                            </p>
                          </span>
                        </article>
                      ),
                    )}
                  </div>
                </section>
              )}

              <section className="course-detail-block instructor-detail-card">
                <h2>Instructor</h2>

                <div className="instructor-detail-content">
                  <img
                    src={instructor?.avatar}
                    alt={instructor?.name}
                  />

                  <div>
                    <h3>
                      {instructor?.name}
                    </h3>
                    <span>
                      {instructor?.title}
                    </span>
                    <p>
                      {instructor?.bio}
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <aside className="course-detail-sidebar">
              <section>
                <h3>
                  Requisitos
                </h3>

                <ul>
                  {course.requirements.map(
                    (requirement) => (
                      <li
                        key={requirement}
                      >
                        <PlatformIcon
                          name="check"
                          size={17}
                        />
                        {requirement}
                      </li>
                    ),
                  )}
                </ul>
              </section>

              <section>
                <h3>
                  ¿Para quién es este curso?
                </h3>

                <ul>
                  {course.audience.map(
                    (audience) => (
                      <li key={audience}>
                        <PlatformIcon
                          name="user"
                          size={17}
                        />
                        {audience}
                      </li>
                    ),
                  )}
                </ul>
              </section>

              <section className="course-support-box">
                <h3>
                  ¿Tienes preguntas?
                </h3>

                <p>
                  Contacta al equipo de
                  Fundación Tamborito antes
                  de inscribirte.
                </p>

                <Link
                  to="/inscripcion"
                  className="platform-button platform-button-dark"
                >
                  Solicitar información
                </Link>
              </section>
            </aside>
          </div>
        </section>
      </main>

      <FoundationFooter />
    </PageShell>
  );
}