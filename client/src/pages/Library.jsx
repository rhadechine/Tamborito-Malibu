import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';

export default function Library() {
  return (
    <PageShell variant="foundation">
      <>
      <section className="page-banner library-banner">
      <div className="container library-head">
      <div>
      <p className="section-tag">Biblioteca digital</p>
      <h1 className="page-title">Libros, cartillas y recursos culturales</h1>
      <p className="lead max-text">
                Un espacio visual para organizar materiales pedagógicos, documentos,
                memorias, publicaciones y futuras descargas digitales.
              </p>
      </div>
      <div className="library-search">
      <input type="text" placeholder="Buscar libros o recursos..." />
      </div>
      </div>
      </section>
      <section className="section">
      <div className="container">
      <div className="books-row">
      <article className="featured-book">
      <div className="featured-book-cover"></div>
      <div className="featured-book-content">
      <span className="book-badge">Destacado</span>
      <h2>Ritmos del Caribe colombiano</h2>
      <p>
                    Un documento de referencia para introducir a estudiantes y visitantes
                    en las expresiones musicales, instrumentos y contextos culturales del Caribe.
                  </p>
      <div className="book-meta">
      <span>PDF</span>
      <span>Guía pedagógica</span>
      <span>Descargable</span>
      </div>
      <a href="#" className="btn btn-primary">Descargar recurso</a>
      </div>
      </article>
      </div>
      <div className="section-heading">
      <p className="section-tag">Catálogo</p>
      <h2>Recursos disponibles</h2>
      </div>
      <div className="book-grid">
      <article className="book-card">
      <div className="book-cover color-a"></div>
      <h3>Introducción al folclor del Caribe</h3>
      <p>Material introductorio para estudiantes y docentes.</p>
      <a href="#">Ver recurso</a>
      </article>
      <article className="book-card">
      <div className="book-cover color-b"></div>
      <h3>Cartilla de percusión básica</h3>
      <p>Ejercicios, patrones rítmicos y fundamentos.</p>
      <a href="#">Ver recurso</a>
      </article>
      <article className="book-card">
      <div className="book-cover color-c"></div>
      <h3>Memoria cultural y tradición oral</h3>
      <p>Lectura sobre territorio, herencia y comunidad.</p>
      <a href="#">Ver recurso</a>
      </article>
      <article className="book-card">
      <div className="book-cover color-d"></div>
      <h3>Danzas tradicionales del Caribe</h3>
      <p>Guía de contexto, movimiento y valor cultural.</p>
      <a href="#">Ver recurso</a>
      </article>
      <article className="book-card">
      <div className="book-cover color-e"></div>
      <h3>Patrimonio vivo y educación</h3>
      <p>Documento para procesos culturales y comunitarios.</p>
      <a href="#">Ver recurso</a>
      </article>
      <article className="book-card">
      <div className="book-cover color-f"></div>
      <h3>Cancionero y repertorio básico</h3>
      <p>Selección de piezas para procesos de formación.</p>
      <a href="#">Ver recurso</a>
      </article>
      </div>
      </div>
      </section>
      <footer className="footer">
      <div className="container footer-grid">
      <div>
      <h3>Fundación Tamborito</h3>
      <p>Biblioteca cultural para fortalecer memoria y aprendizaje.</p>
      </div>
      <div>
      <h4>Secciones</h4>
      <ul>
      <li><Link to="/historia">Historia</Link></li>
      <li><Link to="/cursos">Cursos</Link></li>
      <li><Link to="/inscripcion">Inscripción</Link></li>
      </ul>
      </div>
      <div>
      <h4>Contacto</h4>
      <ul>
      <li>info@fundaciontamborito.org</li>
      <li>Cartagena, Colombia</li>
      </ul>
      </div>
      </div>
      <div className="footer-bottom">
      <p>© 2026 Fundación Tamborito.</p>
      </div>
      </footer>
      </>
    </PageShell>
  );
}
