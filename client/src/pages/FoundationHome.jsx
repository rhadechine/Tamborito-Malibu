import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import FoundationFooter from '../components/FoundationFooter';
import {
  foundationImages,
  foundationPillars,
  foundationPrograms,
  foundationStats,
  libraryPreview,
} from '../data/foundationContent';

export default function FoundationHome() {
  return (
    <PageShell variant="foundation">
      <main>
        <section className="foundation-hero">
          <div className="foundation-hero-overlay"></div>

          <div className="container foundation-hero-grid">
            <div className="foundation-hero-copy">
              <p className="eyebrow">Fundación Tamborito</p>
              <h1>Tradición, cultura y neuroeducación desde Zambrano, Bolívar.</h1>
              <p className="hero-text">
                Rescatamos la memoria musical del territorio mediante percusión folklórica,
                cantos de pajarito, gaitas tradicionales y procesos educativos que fortalecen
                comunidad, identidad y construcción de paz.
              </p>

              <div className="hero-actions">
                <Link to="/inscripcion" className="btn btn-primary">
                  Inscribirme
                </Link>
                <Link to="/cursos" className="btn btn-secondary">
                  Ver cursos
                </Link>
                <Link to="/historia" className="btn btn-light">
                  Conocer historia
                </Link>
              </div>
            </div>

            <div className="foundation-hero-card">
              <img src={foundationImages.heroTamborito} alt="Procesos culturales de Fundación Tamborito" />
              <div className="foundation-floating-card">
                <span>Proyecto educativo</span>
                <strong>Aprendizaje sonoro</strong>
                <p>Música tradicional como camino de formación integral.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="foundation-stats-section">
          <div className="container foundation-stats-grid">
            {foundationStats.map((stat) => (
              <article className="foundation-stat" key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="section foundation-about-section">
          <div className="container foundation-about-grid">
            <div className="foundation-about-copy">
              <p className="section-tag">Sobre la fundación</p>
              <h2>Una escuela viva de música, memoria y territorio.</h2>
              <p>
                Fundación Tamborito no es solo un espacio de clases: es un proceso cultural que
                devuelve la tradición musical a la vida cotidiana de la comunidad. Su trabajo une
                formación artística, participación comunitaria y preservación del patrimonio vivo de
                Zambrano.
              </p>
              <p>
                La fundación forma niños, jóvenes y familias desde la práctica musical, la disciplina
                colectiva, la escucha y el reconocimiento de las raíces culturales del Caribe
                colombiano.
              </p>

              <div className="about-actions">
                <Link to="/historia" className="text-link">
                  Leer trayectoria completa
                </Link>
              </div>
            </div>

            <div className="foundation-about-media">
              <img src={foundationImages.percussionClass} alt="Clase de música tradicional" />
            </div>
          </div>
        </section>

        <section className="section soft-bg">
          <div className="container">
            <div className="section-heading center">
              <p className="section-tag">Ejes de trabajo</p>
              <h2>Lo que sostiene a Tamborito.</h2>
            </div>

            <div className="cards-grid four foundation-pillars-grid">
              {foundationPillars.map((pillar) => (
                <article className="foundation-pillar-card" key={pillar.title}>
                  <div className="pillar-icon">{pillar.icon}</div>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section foundation-programs-section">
          <div className="container">
            <div className="section-heading split-heading">
              <div>
                <p className="section-tag">Formación cultural</p>
                <h2>Programas que hacen sonar la tradición.</h2>
              </div>
              <p>
                La oferta de Tamborito se organiza en procesos formativos, talleres, actividades
                evaluativas, muestras culturales y alianzas con instituciones del territorio.
              </p>
            </div>

            <div className="program-showcase-grid">
              {foundationPrograms.map((program) => (
                <article className="program-showcase-card" key={program.title}>
                  <img src={program.image} alt={program.title} />
                  <div>
                    <h3>{program.title}</h3>
                    <p>{program.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section dark-section foundation-learning-section">
          <div className="container learning-grid">
            <div>
              <p className="section-tag light">Cursos y seguimiento</p>
              <h2>Todo curso necesita registro porque debe quedar historial del estudiante.</h2>
              <p>
                Aunque un curso sea gratuito, el usuario debe registrarse o iniciar sesión para que
                el sistema pueda guardar inscripción, progreso, talleres realizados, evaluaciones,
                pagos cuando aplique y certificaciones.
              </p>

              <div className="hero-actions">
                <Link to="/cursos" className="btn btn-primary">
                  Ver oferta de cursos
                </Link>
                <Link to="/mis-cursos" className="btn btn-secondary">
                  Ver panel del estudiante
                </Link>
              </div>
            </div>

            <div className="learning-panel-preview">
              <div className="mini-dashboard-top">
                <span>Panel del estudiante</span>
                <strong>3 cursos activos</strong>
              </div>
              <div className="mini-course-row">
                <span>Percusión folklórica</span>
                <strong>75%</strong>
              </div>
              <div className="mini-progress"><span style={{ width: '75%' }}></span></div>
              <div className="mini-course-row">
                <span>Aprendizaje sonoro</span>
                <strong>35%</strong>
              </div>
              <div className="mini-progress"><span style={{ width: '35%' }}></span></div>
              <div className="mini-course-row">
                <span>Gaitas tradicionales</span>
                <strong>100%</strong>
              </div>
              <div className="mini-progress"><span style={{ width: '100%' }}></span></div>
            </div>
          </div>
        </section>

        <section className="section foundation-library-preview">
          <div className="container library-preview-grid">
            <div className="library-preview-card">
              <p className="section-tag">Biblioteca gratuita</p>
              <h2>Recursos abiertos para consulta y descarga.</h2>
              <p>
                La biblioteca será pública y gratuita. El usuario podrá abrir libros, cartillas y
                documentos en un lector PDF y descargarlos desde las funciones del visor.
              </p>
              <Link to="/biblioteca" className="btn btn-primary">
                Ir a biblioteca
              </Link>
            </div>

            <div className="library-preview-list">
              {libraryPreview.map((item) => (
                <article key={item}>{item}</article>
              ))}
            </div>
          </div>
        </section>

        <section className="section foundation-cta-section">
          <div className="container foundation-cta-card">
            <div>
              <p className="section-tag">Participa</p>
              <h2>Inscríbete, aprende, dona o acompaña el proceso cultural.</h2>
              <p>
                Tamborito crece con estudiantes, familias, aliados, docentes, investigadores y
                personas que creen en la cultura como fuerza de transformación.
              </p>
            </div>
            <div className="support-actions">
              <Link to="/inscripcion" className="btn btn-primary">
                Inscripción
              </Link>
              <Link to="/donaciones" className="btn btn-outline-dark">
                Donar
              </Link>
            </div>
          </div>
        </section>
      </main>

      <FoundationFooter />
    </PageShell>
  );
}
