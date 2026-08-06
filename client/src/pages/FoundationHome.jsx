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
              <h1>Formación musical tradicional desde Zambrano, Bolívar.</h1>
              <p className="hero-text">
                La Fundación Tamborito rescata, enseña y proyecta la música tradicional del
                territorio mediante procesos de percusión folklórica, gaitas, cantos de pajarito y
                formación cultural para niños, jóvenes, familias e instituciones.
              </p>
            </div>

            <div className="foundation-hero-card">
              <img src={foundationImages.heroTamborito} alt="Procesos culturales de Fundación Tamborito" />
              <div className="foundation-floating-card">
                <span>Formación cultural</span>
                <strong>Música y comunidad</strong>
                <p>Aprendizaje práctico con identidad territorial.</p>
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
              <h2>Una escuela viva de música, memoria y territorio.</h2>
              <p>
                Tamborito nace para que la tradición musical no dependa únicamente del recuerdo.
                Su trabajo convierte la práctica del tambor, la gaita y el canto en una experiencia
                educativa organizada, cercana a la comunidad y útil para fortalecer identidad.
              </p>
              <p>
                La fundación no presenta la cultura como un discurso lejano: la trabaja desde la
                práctica, la escucha, la disciplina colectiva y la participación de quienes aprenden.
              </p>
            </div>

            <div className="foundation-about-media">
              <img src={foundationImages.percussionClass} alt="Clase de música tradicional" />
            </div>
          </div>
        </section>

        <section className="section soft-bg">
          <div className="container">
            <div className="section-heading center">
              <h2>Ejes de trabajo</h2>
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
                <h2>Programas que hacen sonar la tradición.</h2>
              </div>
              <p>
                La oferta se organiza en procesos formativos, talleres, actividades evaluativas,
                muestras culturales y alianzas con instituciones del territorio.
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
              <h2>Los cursos requieren cuenta para guardar el avance del estudiante.</h2>
              <p>
                La persona interesada puede consultar los cursos disponibles en el sitio público.
                Para acceder al contenido, registrar evidencias, ver progreso o recibir certificado,
                debe registrarse o iniciar sesión desde la barra superior.
              </p>
            </div>

            <div className="learning-panel-preview learning-photo-preview">
              <img src={foundationImages.childrenGaitas} alt="Estudiantes practicando música tradicional" />
              <div className="learning-photo-caption">
                <strong>Formación guiada</strong>
                <span>Videos, lecturas, prácticas, evaluaciones y evidencias.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section foundation-library-preview">
          <div className="container library-preview-grid">
            <div className="library-preview-card">
              <h2>Recursos abiertos para consulta.</h2>
              <p>
                La biblioteca reunirá libros, cartillas, guías, cancioneros, memorias y documentos
                autorizados para consulta pública o descarga, según la configuración del recurso.
              </p>
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
              <h2>Tamborito crece con estudiantes, familias y aliados culturales.</h2>
              <p>
                La plataforma presenta su historia, organiza sus cursos, centraliza su biblioteca y
                facilita el contacto con la comunidad desde una experiencia clara y sin enlaces
                repetidos dentro del contenido.
              </p>
            </div>
          </div>
        </section>
      </main>

      <FoundationFooter />
    </PageShell>
  );
}