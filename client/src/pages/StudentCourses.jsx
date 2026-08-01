import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import FoundationFooter from '../components/FoundationFooter';
import { studentCourses } from '../data/foundationContent';

const studentStats = [
  { value: '3', label: 'Cursos vinculados' },
  { value: '2', label: 'Actividades pendientes' },
  { value: '1', label: 'Constancia lista' },
  { value: '70%', label: 'Avance promedio' },
];

export default function StudentCourses() {
  return (
    <PageShell variant="foundation">
      <main>
        <section className="page-banner student-courses-banner">
          <div className="container student-hero-grid">
            <div>
              <p className="section-tag">Panel del estudiante</p>
              <h1 className="page-title">Mis cursos Tamborito.</h1>
              <p className="lead max-text">
                Vista de referencia para el usuario autenticado. Aquí se mostrarán cursos gratuitos
                aprobados, cursos comprados, progreso, talleres, evaluaciones y certificados.
              </p>
            </div>

            <div className="student-profile-card">
              <span>Usuario registrado</span>
              <h2>Estudiante Tamborito</h2>
              <p>Estado: activo</p>
              <p>Modalidad: presencial / virtual según curso</p>
            </div>
          </div>
        </section>

        <section className="student-stats-section">
          <div className="container foundation-stats-grid">
            {studentStats.map((stat) => (
              <article className="foundation-stat" key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="container student-dashboard-layout">
            <aside className="dashboard-sidebar student-sidebar">
              <h3>Mi formación</h3>
              <ul>
                <li className="active">Mis cursos</li>
                <li>Actividades</li>
                <li>Evaluaciones</li>
                <li>Pagos</li>
                <li>Certificados</li>
              </ul>
            </aside>

            <div className="student-dashboard-main">
              <div className="dashboard-top">
                <div>
                  <p className="section-tag">Cursos vinculados</p>
                  <h2>Continuar aprendizaje</h2>
                </div>
                <Link to="/cursos" className="btn btn-outline-dark">
                  Ver más cursos
                </Link>
              </div>

              <div className="student-course-stack">
                {studentCourses.map((course) => (
                  <article className="student-course-card full" key={course.title}>
                    <div className="student-course-head">
                      <div>
                        <span>{course.status}</span>
                        <h3>{course.title}</h3>
                        <p>{course.access}</p>
                      </div>
                      <strong>{course.progress}%</strong>
                    </div>

                    <div className="progress-bar">
                      <span style={{ width: `${course.progress}%` }}></span>
                    </div>

                    <div className="student-course-details">
                      <article>
                        <span>Avance</span>
                        <strong>{course.modulesDone}</strong>
                      </article>
                      <article>
                        <span>Siguiente clase</span>
                        <strong>{course.nextLesson}</strong>
                      </article>
                      <article>
                        <span>Pendiente</span>
                        <strong>{course.pending}</strong>
                      </article>
                      <article>
                        <span>Certificación</span>
                        <strong>{course.certificate}</strong>
                      </article>
                    </div>

                    <div className="student-course-actions">
                      <button type="button" className="btn btn-primary">
                        Continuar
                      </button>
                      <button type="button" className="btn btn-outline-dark">
                        Ver detalle
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section soft-bg">
          <div className="container">
            <div className="section-heading center">
              <p className="section-tag">Datos que debe entregar Django</p>
              <h2>Información necesaria para esta vista.</h2>
            </div>

            <div className="cards-grid four course-steps-grid">
              <article className="course-step-card">
                <h3>Usuario</h3>
                <p>Datos personales, identificación, acudiente si aplica, estado de cuenta y rol.</p>
              </article>
              <article className="course-step-card">
                <h3>Inscripciones</h3>
                <p>Cursos gratuitos aprobados, cursos pagos, fecha de inicio, docente y modalidad.</p>
              </article>
              <article className="course-step-card">
                <h3>Progreso</h3>
                <p>Módulos vistos, asistencia, evidencias, actividades, evaluaciones y observaciones.</p>
              </article>
              <article className="course-step-card">
                <h3>Pagos y certificados</h3>
                <p>Transacciones, comprobantes, acceso habilitado y certificados descargables.</p>
              </article>
            </div>
          </div>
        </section>
      </main>

      <FoundationFooter />
    </PageShell>
  );
}
