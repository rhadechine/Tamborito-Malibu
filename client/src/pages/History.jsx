import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import FoundationFooter from '../components/FoundationFooter';
import { foundationImages, trajectoryTimeline } from '../data/foundationContent';

export default function History() {
  return (
    <PageShell variant="foundation">
      <main>
        <section className="page-hero history-hero foundation-history-hero">
          <div className="page-hero-overlay"></div>
          <div className="container page-hero-content">
            <p className="eyebrow">Historia de Fundación Tamborito</p>
            <h1>Una trayectoria joven con raíces profundas.</h1>
            <p>
              La historia de Tamborito nace desde Zambrano, Bolívar, con una misión clara:
              preservar la tradición musical y convertirla en educación, comunidad y memoria viva.
            </p>
          </div>
        </section>

        <section className="section history-opening-section">
          <div className="container history-opening-grid">
            <div>
              <p className="section-tag">Origen institucional</p>
              <h2>Fundación Tamborito, Tradición, Cultura y Neuroeducación.</h2>
              <p>
                La Fundación Tamborito tuvo sus raíces el 24 de febrero de 2023, cuando el
                Licenciado en Música Ramses Javith Hadechine Alvarez fundó una organización
                orientada al rescate de la tradición musical de Zambrano, Bolívar.
              </p>
              <p>
                Su visión consiste en revitalizar la herencia musical del territorio y usar la
                música autóctona como herramienta mediadora para la formación integral, la inclusión
                social y la construcción de paz.
              </p>
            </div>

            <div className="history-opening-media">
              <img src={foundationImages.groupPortrait} alt="Niños y jóvenes de Fundación Tamborito" />
            </div>
          </div>
        </section>

        <section className="section soft-bg history-values-section">
          <div className="container mission-grid">
            <article className="value-block">
              <p className="section-tag">Misión</p>
              <h3>Preservar y enseñar</h3>
              <p>
                Rescatar, enseñar y proyectar las expresiones musicales tradicionales de Zambrano
                mediante procesos educativos, comunitarios y culturales.
              </p>
            </article>

            <article className="value-block">
              <p className="section-tag">Visión</p>
              <h3>Ser referente cultural</h3>
              <p>
                Consolidarse como una institución reconocida por formar nuevas generaciones desde
                la música tradicional, la neuroeducación y el patrimonio vivo.
              </p>
            </article>

            <article className="value-block">
              <p className="section-tag">Propósito</p>
              <h3>Transformar desde la cultura</h3>
              <p>
                Usar el arte musical como fuerza de identidad, convivencia, aprendizaje,
                participación y construcción de paz en el territorio.
              </p>
            </article>
          </div>
        </section>

        <section className="section timeline-section foundation-timeline-section">
          <div className="container">
            <div className="section-heading center">
              <p className="section-tag">Trayectoria</p>
              <h2>Momentos que construyen memoria.</h2>
            </div>

            <div className="foundation-timeline-list">
              {trajectoryTimeline.map((item, index) => (
                <article className={`timeline-row ${index % 2 ? 'reverse' : ''}`} key={item.title}>
                  <div className="timeline-media">
                    <img src={item.image} alt={item.title} />
                  </div>
                  <div className="timeline-content">
                    <p className={`timeline-year ${index % 2 ? 'accent' : ''}`}>{item.year}</p>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section dark-section history-action-section">
          <div className="container history-action-grid">
            <div>
              <p className="section-tag light">Tamborito en acción</p>
              <h2>La historia no está quieta: se toca, se canta y se comparte.</h2>
              <p>
                Los registros visuales de la trayectoria muestran talleres, presentaciones,
                entrevistas, carnavales, alianzas educativas y procesos con niños y jóvenes. Esa es
                la base narrativa que debe sostener la presencia digital de la Fundación.
              </p>
            </div>

            <div className="history-action-cards">
              <article>
                <strong>Formación</strong>
                <span>Percusión, gaitas y cantos tradicionales.</span>
              </article>
              <article>
                <strong>Comunidad</strong>
                <span>Procesos con estudiantes, familias e instituciones.</span>
              </article>
              <article>
                <strong>Proyección</strong>
                <span>Eventos culturales, entrevistas y muestras públicas.</span>
              </article>
            </div>
          </div>
        </section>

        <section className="section history-gallery-section">
          <div className="container">
            <div className="section-heading">
              <p className="section-tag">Galería de trayectoria</p>
              <h2>Imágenes que cuentan el proceso.</h2>
            </div>

            <div className="history-gallery-grid">
              <img src={foundationImages.carnival} alt="Batalla de Flórez en Zambrano" />
              <img src={foundationImages.interview} alt="Entrevista cultural Montes de María" />
              <img src={foundationImages.famma} alt="Participación en FAMMA" />
              <img src={foundationImages.drumsGroup} alt="Niños con tambores tradicionales" />
            </div>
          </div>
        </section>

        <section className="section foundation-cta-section">
          <div className="container foundation-cta-card">
            <div>
              <p className="section-tag">Siguiente paso</p>
              <h2>Conoce los cursos y procesos formativos.</h2>
              <p>
                La historia de Tamborito se proyecta en cada estudiante que aprende, practica,
                evalúa y comparte la tradición musical del territorio.
              </p>
            </div>

            <div className="support-actions">
              <Link to="/cursos" className="btn btn-primary">
                Ver cursos
              </Link>
              <Link to="/inscripcion" className="btn btn-outline-dark">
                Inscripción
              </Link>
            </div>
          </div>
        </section>
      </main>

      <FoundationFooter />
    </PageShell>
  );
}
