import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/PageShell';
import FoundationFooter from '../components/FoundationFooter';
import CourseCatalogCard from '../components/CourseCatalogCard';
import { coursePlatformSteps } from '../data/foundationContent';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { usePlatform } from '../context/PlatformContext';

export default function Courses() {
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();
  const { user } = useAuth();
  const { addCourse } = useCart();

  const {
    publishedCourses,
    getInstructorById,
    getEnrollment,
    enrollFreeCourse,
  } = usePlatform();

  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return publishedCourses;
    }

    return publishedCourses.filter((course) => {
      const searchableText = [
        course.title,
        course.subtitle,
        course.description,
        course.category,
        course.durationLabel,
        ...(course.learningOutcomes ?? []),
        ...(course.requirements ?? []),
        ...(course.audience ?? []),
        ...(course.modules ?? []).map((module) => module.title),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [query, publishedCourses]);

  function showMessage(text) {
    setMessage(text);
    window.setTimeout(() => setMessage(''), 3500);
  }

  function handleFreeEnrollment(course) {
    if (!user) {
      navigate('/login?next=/cursos');
      return;
    }

    if (user.role !== 'client') {
      showMessage('La cuenta administrativa no puede inscribirse como estudiante.');
      return;
    }

    const result = enrollFreeCourse(user.id, course.id);
    showMessage(result.message);

    if (result.ok) {
      navigate(`/campus/cursos/${course.id}`);
    }
  }

  function handlePaidCourse(course) {
    const result = addCourse(course);
    showMessage(result.message);

    if (result.ok) {
      navigate('/carrito');
    }
  }

  return (
    <PageShell variant="foundation">
      <main>
        <section className="page-banner foundation-courses-banner">
          <div className="container courses-hero-grid">
            <div>
              <h1 className="page-title">Cursos y rutas de aprendizaje Tamborito.</h1>
              <p className="lead max-text">
                Consulta los cursos disponibles de la Fundación. Los cursos gratuitos y de pago
                requieren cuenta para conservar inscripción, avance, evidencias, recursos y
                certificados.
              </p>
            </div>

            <div className="course-system-card">
              <span>Funcionamiento</span>
              <h2>Catálogo público y campus privado</h2>
              <p>
                El visitante conoce la oferta. El estudiante registrado accede al contenido,
                entrega evidencias y consulta su progreso desde el campus.
              </p>
            </div>
          </div>
        </section>

        <section className="section course-model-section">
          <div className="container">
            <div className="section-heading center">
              <h2>Ruta clara para estudiar y certificar avances.</h2>
            </div>

            <div className="cards-grid four course-steps-grid">
              {coursePlatformSteps.map((step) => (
                <article className="course-step-card" key={step.title}>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section soft-bg public-catalog-section">
          <div className="container">
            <div className="dashboard-top catalog-top">
              <div>
                <h2>Cursos disponibles</h2>
              </div>

              <input
                type="text"
                placeholder="Buscar por nombre, categoría o contenido..."
                className="search-input"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>

            {message && (
              <div className="mb-6 rounded-[18px] bg-white p-5 font-semibold text-dark shadow-card">
                {message}
              </div>
            )}

            <div className="catalog-course-grid">
              {filteredCourses.map((course) => (
                <CourseCatalogCard
                  key={course.id}
                  course={course}
                  instructor={getInstructorById(course.instructorId)}
                  enrollment={user?.role === 'client' ? getEnrollment(user.id, course.id) : null}
                  onEnroll={handleFreeEnrollment}
                  onAddToCart={handlePaidCourse}
                />
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className="empty-state">
                <h3>No encontramos cursos</h3>
                <p>Prueba con otra palabra o limpia el campo de búsqueda.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <FoundationFooter />
    </PageShell>
  );
}