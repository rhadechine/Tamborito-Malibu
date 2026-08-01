import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';

const ecosystemCards = [
  {
    title: 'Tradición musical',
    text: 'La Fundación Tamborito impulsa la enseñanza de percusión folklórica, gaitas y cantos tradicionales como expresión viva de Zambrano, Bolívar.',
  },
  {
    title: 'Memoria patrimonial',
    text: 'El Museo Arqueológico Malibú conserva y proyecta relatos, piezas y saberes que conectan al territorio con su historia ancestral.',
  },
  {
    title: 'Educación y comunidad',
    text: 'Ambos espacios fortalecen procesos formativos, culturales y sociales para niños, jóvenes, familias e instituciones del municipio.',
  },
  {
    title: 'Cultura para el futuro',
    text: 'El ecosistema une música, patrimonio, formación y participación comunitaria en una misma plataforma cultural.',
  },
];

export default function EcosystemHome() {
  return (
    <PageShell variant="ecosystem">
      <main>
        <section className="ecosystem-hero">
          <div className="container ecosystem-grid">
            <div className="ecosystem-copy">
              <p className="eyebrow">
                Cultura, memoria y territorio
              </p>

              <h1>
                Un ecosistema cultural para preservar la
                música y el patrimonio de Zambrano.
              </h1>

              <p>
                Fundación Tamborito y Museo Arqueológico
                Malibú se unen en una misma visión: proteger
                la identidad cultural, formar nuevas
                generaciones y mantener viva la memoria del
                Caribe colombiano.
              </p>

              <div className="ecosystem-actions">
                <Link
                  to="/fundacion"
                  className="btn btn-primary"
                >
                  Conocer Fundación
                </Link>

                <Link
                  to="/museo"
                  className="btn btn-secondary"
                >
                  Explorar Museo
                </Link>

                <Link
                  to="/inscripcion"
                  className="btn btn-light"
                >
                  Inscripción
                </Link>
              </div>
            </div>

            <div className="portal-cards">
              <Link
                to="/fundacion"
                className="portal-card portal-fundacion"
              >
                <span>
                  Fundación Tamborito
                </span>

                <h2>
                  Música, tradición y neuroeducación
                </h2>

                <p>
                  Formación artística, talleres culturales,
                  cursos, biblioteca e inscripción a procesos
                  educativos.
                </p>
              </Link>

              <Link
                to="/museo"
                className="portal-card portal-museo"
              >
                <span>
                  Museo Arqueológico Malibú
                </span>

                <h2>
                  Historia, colecciones y patrimonio
                </h2>

                <p>
                  Historia institucional, colecciones
                  arqueológicas, atención a visitantes y
                  conservación de la memoria territorial.
                </p>
              </Link>
            </div>
          </div>
        </section>

        <section className="section ecosystem-intro">
          <div className="container split-grid">
            <div className="split-text">
              <p className="section-tag">
                Nuestra esencia
              </p>

              <h2>
                Dos proyectos, una misma raíz cultural.
              </h2>
            </div>

            <div className="intro-copy">
              <p>
                Este sitio funciona como puerta de entrada al
                trabajo cultural de Fundación Tamborito y del
                Museo Arqueológico Malibú. Desde aquí,
                visitantes, estudiantes, familias y aliados
                pueden conocer las dos organizaciones y
                acceder a sus servicios principales.
              </p>

              <p>
                La Fundación concentra su labor en la
                formación musical y comunitaria. El Museo
                proyecta la memoria patrimonial y
                arqueológica del territorio. Juntos
                construyen una experiencia cultural completa.
              </p>
            </div>
          </div>
        </section>

        <section className="section soft-bg">
          <div className="container">
            <div className="section-heading center">
              <p className="section-tag">
                Ecosistema cultural
              </p>

              <h2>
                Música, historia y comunidad en un solo lugar.
              </h2>
            </div>

            <div className="cards-grid four">
              {ecosystemCards.map((card) => (
                <article
                  className="info-card ecosystem-info-card"
                  key={card.title}
                >
                  <div className="card-icon">
                    ✦
                  </div>

                  <h3>{card.title}</h3>

                  <p>{card.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section ecosystem-paths">
          <div className="container path-grid">
            <article className="path-card path-foundation">
              <div>
                <p className="section-tag light">
                  Fundación Tamborito
                </p>

                <h2>
                  Formación cultural desde la música
                  tradicional.
                </h2>

                <p>
                  Conoce los procesos de formación, cursos,
                  biblioteca, historia institucional y
                  oportunidades de inscripción.
                </p>
              </div>

              <Link
                to="/fundacion"
                className="btn btn-primary"
              >
                Entrar a Fundación
              </Link>
            </article>

            <article className="path-card path-museum">
              <div>
                <p className="section-tag light">
                  Museo Arqueológico Malibú
                </p>

                <h2>
                  Memoria arqueológica y patrimonio
                  territorial.
                </h2>

                <p>
                  Conoce su historia, explora sus colecciones
                  y descubre cómo visitar, contactar o apoyar
                  la conservación del patrimonio.
                </p>
              </div>

              <Link
                to="/museo"
                className="btn btn-museo"
              >
                Entrar al Museo
              </Link>
            </article>
          </div>
        </section>

        <section className="section ecosystem-support">
          <div className="container support-card">
            <div>
              <p className="section-tag">
                Participa
              </p>

              <h2>
                Apoya la cultura, la educación y la memoria
                del territorio.
              </h2>

              <p>
                Puedes vincularte mediante inscripción a
                procesos formativos, donaciones,
                participación en actividades culturales o
                contacto directo con el Museo.
              </p>
            </div>

            <div className="support-actions">
              <Link
                to="/inscripcion"
                className="btn btn-primary"
              >
                Inscribirme
              </Link>

              <Link
                to="/donaciones"
                className="btn btn-outline-dark"
              >
                Donar a la Fundación
              </Link>

              <Link
                to="/museo/donar"
                className="btn btn-museo"
              >
                Donar al Museo
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <h3>
              Ecosistema Cultural Tamborito & Malibú
            </h3>

            <p>
              Un espacio donde conviven la formación
              artística de Fundación Tamborito y la memoria
              patrimonial del Museo Arqueológico Malibú.
            </p>
          </div>

          <div>
            <h4>Fundación</h4>

            <ul>
              <li>
                <Link to="/fundacion">
                  Inicio Fundación
                </Link>
              </li>

              <li>
                <Link to="/historia">
                  Historia
                </Link>
              </li>

              <li>
                <Link to="/cursos">
                  Cursos
                </Link>
              </li>

              <li>
                <Link to="/biblioteca">
                  Biblioteca
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4>Museo</h4>

            <ul>
              <li>
                <Link to="/museo">
                  Inicio Museo
                </Link>
              </li>

              <li>
                <Link to="/museo/historia">
                  Historia
                </Link>
              </li>

              <li>
                <Link to="/museo/colecciones">
                  Colecciones
                </Link>
              </li>

              <li>
                <Link to="/museo/contactanos">
                  Contáctanos
                </Link>
              </li>

              <li>
                <Link to="/museo/donar">
                  Donar
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © 2026 Ecosistema Cultural Tamborito & Museo
            Arqueológico Malibú.
          </p>
        </div>
      </footer>
    </PageShell>
  );
}