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
            <h1>Una organización joven con raíces musicales profundas.</h1>
            <p>
              Tamborito nace en Zambrano, Bolívar, para proteger la música tradicional, formar
              nuevas generaciones y convertir la cultura en una herramienta de identidad,
              convivencia y aprendizaje.
            </p>
          </div>
        </section>

        <section className="section history-opening-section">
          <div className="container history-opening-grid">
            <div>
              <h2>Fundación Tamborito, Tradición, Cultura y Neuroeducación.</h2>
              <p>
                La fundación fue creada el 24 de febrero de 2023 por el Licenciado en Música
                Ramses Javith Hadechine Alvarez. Su origen responde a una necesidad concreta:
                recuperar, enseñar y proyectar las expresiones musicales tradicionales de Zambrano
                desde una estructura educativa organizada.
              </p>
              <p>
                El proceso integra percusión folklórica, cantos de pajarito, gaitas tradicionales,
                trabajo comunitario y acompañamiento pedagógico. Cada actividad busca que la
                música permanezca viva en la práctica cotidiana y no solamente como recuerdo
                cultural.
              </p>
              <p>
                La historia institucional se entiende como un camino en construcción: formación de
                estudiantes, participación en escenarios culturales, alianzas educativas,
                reconocimientos públicos y consolidación de una plataforma digital para sostener el
                crecimiento del proyecto.
              </p>
            </div>

            <div className="history-opening-media">
              <img src={foundationImages.groupPortrait} alt="Niños y jóvenes de Fundación Tamborito" />
            </div>
          </div>
        </section>

        <section className="section soft-bg history-values-section">
          <div className="container mission-grid two-columns">
            <article className="value-block">
              <h3>Misión</h3>
              <p>
                Rescatar, enseñar y proyectar las expresiones musicales tradicionales de Zambrano
                mediante procesos educativos, culturales y comunitarios que fortalezcan identidad,
                participación y memoria viva.
              </p>
            </article>

            <article className="value-block">
              <h3>Visión</h3>
              <p>
                Consolidarse como una institución referente en formación musical tradicional,
                neuroeducación y trabajo comunitario, capaz de conectar nuevas generaciones con
                el patrimonio cultural del territorio.
              </p>
            </article>
          </div>
        </section>

        <section className="section timeline-section foundation-timeline-section">
          <div className="container">
            <div className="section-heading center">
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
              <h2>La historia se toca, se canta y se comparte.</h2>
              <p>
                Los registros visuales de la trayectoria muestran talleres, presentaciones,
                entrevistas, carnavales, alianzas educativas y procesos con niños y jóvenes. Esa
                evidencia debe sostener la narrativa pública de la Fundación.
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
      </main>

      <FoundationFooter />
    </PageShell>
  );
}