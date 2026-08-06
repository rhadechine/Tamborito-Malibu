import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';

const ecosystemCards = [
  {
    title: 'Formación musical',
    text: 'Fundación Tamborito concentra procesos de percusión, gaitas, cantos tradicionales y acompañamiento educativo para la comunidad.',
  },
  {
    title: 'Memoria patrimonial',
    text: 'El Museo Arqueológico Malibú organiza piezas, relatos y registros que explican la historia del territorio.',
  },
  {
    title: 'Participación comunitaria',
    text: 'El ecosistema conecta estudiantes, familias, visitantes, docentes, aliados e investigadores en una misma plataforma.',
  },
  {
    title: 'Gestión cultural',
    text: 'El sitio permite consultar información pública, cursos, biblioteca, eventos, donaciones y contenidos de cada entidad.',
  },
];

export default function EcosystemHome() {
  return (
    <PageShell variant="ecosystem">
      <main>
        <section className="ecosystem-hero">
          <div className="container ecosystem-grid">
            <div className="ecosystem-copy">
              <p className="eyebrow">Cultura, memoria y territorio</p>

              <h1>Un sitio para presentar el trabajo cultural de Tamborito y Malibú.</h1>

              <p>
                La plataforma reúne dos proyectos con identidad propia: Fundación Tamborito,
                dedicada a la formación musical tradicional, y el Museo Arqueológico Malibú,
                enfocado en la conservación y divulgación patrimonial.
              </p>

              <div className="ecosystem-actions">
                <Link to="/inscripcion" className="btn btn-primary">
                  Inscripción
                </Link>
                <Link to="/donaciones" className="btn btn-secondary">
                  Donar
                </Link>
              </div>
            </div>

            <div className="portal-cards">
              <Link to="/fundacion" className="portal-card portal-fundacion">
                <span>Fundación Tamborito</span>
                <h2>Música, formación y tradición viva</h2>
                <p>
                  Historia institucional, cursos, biblioteca, procesos formativos e inscripción.
                </p>
              </Link>

              <Link to="/museo" className="portal-card portal-museo">
                <span>Museo Arqueológico Malibú</span>
                <h2>Colecciones, historia y patrimonio</h2>
                <p>
                  Historia del Museo, piezas destacadas, documentación, visitas y contacto.
                </p>
              </Link>
            </div>
          </div>
        </section>

        <section className="section ecosystem-intro">
          <div className="container split-grid">
            <div className="split-text">
              <h2>Dos entidades, una plataforma cultural.</h2>
            </div>

            <div className="intro-copy">
              <p>
                El usuario puede entrar al espacio de cada organización sin autenticarse. Cada
                entidad conserva su contenido, su navegación y su identidad visual, pero comparte
                una misma base de administración para evitar duplicidad de información.
              </p>

              <p>
                La Fundación organiza su labor educativa y musical. El Museo organiza su memoria
                arqueológica y documental. El ecosistema sirve como puerta de entrada común.
              </p>
            </div>
          </div>
        </section>

        <section className="section soft-bg">
          <div className="container">
            <div className="section-heading center">
              <h2>Qué reúne este ecosistema</h2>
            </div>

            <div className="cards-grid four">
              {ecosystemCards.map((card) => (
                <article className="info-card ecosystem-info-card" key={card.title}>
                  <div className="card-icon">✦</div>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section ecosystem-support">
          <div className="container support-card">
            <div>
              <h2>Apoya la cultura desde un único proceso de donación.</h2>
              <p>
                Las donaciones se concentran en una sola sección. Allí el usuario podrá indicar si
                desea apoyar a la Fundación, al Museo o al ecosistema completo.
              </p>
            </div>

            <div className="support-actions">
              <Link to="/donaciones" className="btn btn-primary">
                Ir a donaciones
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <h3>Ecosistema Cultural Tamborito & Malibú</h3>
            <p>
              Plataforma institucional para difundir formación musical, memoria patrimonial y
              participación cultural.
            </p>
          </div>

          <div>
            <h4>Fundación</h4>
            <ul>
              <li><Link to="/fundacion">Inicio Fundación</Link></li>
              <li><Link to="/historia">Historia</Link></li>
              <li><Link to="/cursos">Cursos</Link></li>
              <li><Link to="/biblioteca">Biblioteca</Link></li>
            </ul>
          </div>

          <div>
            <h4>Museo</h4>
            <ul>
              <li><Link to="/museo">Inicio Museo</Link></li>
              <li><Link to="/museo/historia">Historia</Link></li>
              <li><Link to="/museo/colecciones">Colecciones</Link></li>
              <li><Link to="/museo/contactanos">Contáctanos</Link></li>
            </ul>
          </div>

          <div>
            <h4>Legal</h4>
            <ul>
              <li><Link to="/politicas-privacidad">Política de privacidad</Link></li>
              <li><Link to="/donaciones">Donaciones</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Ecosistema Cultural Tamborito & Malibú.</p>
        </div>
      </footer>
    </PageShell>
  );
}