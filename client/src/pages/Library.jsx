import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import PlatformIcon from '../components/PlatformIcon';

const resources = [
  {
    id: 'ritmos-caribe',
    title: 'Ritmos del Caribe colombiano',
    category: 'Guía pedagógica',
    type: 'PDF',
    access: 'Consulta pública',
    colorClass: 'color-a',
    description:
      'Material de introducción a expresiones musicales, instrumentos, contextos culturales y prácticas de escucha del Caribe colombiano.',
    keywords: ['ritmos', 'caribe', 'instrumentos', 'música', 'guía'],
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: 'folclor-caribe',
    title: 'Introducción al folclor del Caribe',
    category: 'Material introductorio',
    type: 'PDF',
    access: 'Consulta pública',
    colorClass: 'color-b',
    description:
      'Documento base para estudiantes y docentes interesados en reconocer conceptos generales del folclor, la tradición oral y la práctica musical.',
    keywords: ['folclor', 'tradición', 'docentes', 'estudiantes'],
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: 'percusion-basica',
    title: 'Cartilla de percusión básica',
    category: 'Cartilla',
    type: 'PDF',
    access: 'Descargable',
    colorClass: 'color-c',
    description:
      'Ejercicios, patrones rítmicos y fundamentos iniciales para orientar la práctica de tambor dentro de procesos formativos.',
    keywords: ['percusión', 'tambor', 'ejercicios', 'patrones'],
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: 'tradicion-oral',
    title: 'Memoria cultural y tradición oral',
    category: 'Lectura cultural',
    type: 'PDF',
    access: 'Consulta pública',
    colorClass: 'color-d',
    description:
      'Lectura sobre territorio, herencia cultural, relatos comunitarios y transmisión de saberes entre generaciones.',
    keywords: ['memoria', 'oralidad', 'territorio', 'herencia'],
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: 'danzas-caribe',
    title: 'Danzas tradicionales del Caribe',
    category: 'Guía de contexto',
    type: 'PDF',
    access: 'Consulta pública',
    colorClass: 'color-e',
    description:
      'Guía para comprender movimiento, contexto, valor cultural y relación entre danza, música y comunidad.',
    keywords: ['danza', 'movimiento', 'caribe', 'contexto'],
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    id: 'cancionero',
    title: 'Cancionero y repertorio básico',
    category: 'Repertorio',
    type: 'PDF',
    access: 'Consulta pública',
    colorClass: 'color-f',
    description:
      'Selección inicial de piezas y repertorios para apoyar procesos de canto, memoria musical y práctica colectiva.',
    keywords: ['cancionero', 'repertorio', 'canto', 'pajarito'],
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
];

function buildGooglePdfViewer(url) {
  return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(url)}`;
}

function getResourceScore(resource, normalizedQuery) {
  if (!normalizedQuery) {
    return 1;
  }

  const fields = [
    resource.title,
    resource.category,
    resource.type,
    resource.access,
    resource.description,
    ...resource.keywords,
  ].map((item) => item.toLowerCase());

  const words = normalizedQuery.split(/\s+/).filter(Boolean);
  return words.reduce((score, word) => {
    const titleMatch = resource.title.toLowerCase().includes(word) ? 4 : 0;
    const categoryMatch = resource.category.toLowerCase().includes(word) ? 3 : 0;
    const fieldMatch = fields.some((field) => field.includes(word)) ? 1 : 0;
    return score + titleMatch + categoryMatch + fieldMatch;
  }, 0);
}

export default function Library() {
  const [query, setQuery] = useState('');
  const [openDescription, setOpenDescription] = useState(null);

  const filteredResources = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return resources
      .map((resource) => ({
        resource,
        score: getResourceScore(resource, normalizedQuery),
      }))
      .filter(({ score }) => !normalizedQuery || score > 0)
      .sort((first, second) => second.score - first.score)
      .map(({ resource }) => resource);
  }, [query]);

  return (
    <PageShell variant="foundation">
      <main>
        <section className="page-banner library-banner">
          <div className="container library-head">
            <div>
              <h1 className="page-title">Biblioteca digital</h1>
              <p className="lead max-text">
                Libros, cartillas, guías y recursos culturales organizados para consulta pública.
                Cada recurso muestra su descripción antes de abrirlo en un visor PDF externo.
              </p>
            </div>
            <div className="library-search smart-search">
              <PlatformIcon name="search" size={19} />
              <input
                type="search"
                placeholder="Buscar por título, tema o palabra clave..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
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
                  <p>{resources[0].description}</p>
                  <div className="book-meta">
                    <span>PDF</span>
                    <span>Guía pedagógica</span>
                    <span>Consulta pública</span>
                  </div>
                  <a
                    href={buildGooglePdfViewer(resources[0].url)}
                    className="btn btn-primary"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Abrir recurso
                  </a>
                </div>
              </article>
            </div>

            <div className="section-heading">
              <h2>Recursos disponibles</h2>
            </div>

            <div className="book-grid library-card-grid">
              {filteredResources.map((resource) => {
                const isOpen = openDescription === resource.id;

                return (
                  <article
                    className={['book-card', 'library-flip-card', isOpen ? 'show-description' : ''].join(' ')}
                    key={resource.id}
                  >
                    <div className="library-card-inner">
                      <div className="library-card-face library-card-front">
                        <div className={`book-cover ${resource.colorClass}`}></div>
                        <h3>{resource.title}</h3>
                        <p>{resource.category}</p>
                        <div className="book-meta compact">
                          <span>{resource.type}</span>
                          <span>{resource.access}</span>
                        </div>
                        <button
                          type="button"
                          className="text-link"
                          onClick={() => setOpenDescription(resource.id)}
                        >
                          Ver descripción
                        </button>
                      </div>

                      <div className="library-card-face library-card-back">
                        <h3>{resource.title}</h3>
                        <p>{resource.description}</p>
                        <div className="support-actions library-actions-inline">
                          <a
                            href={buildGooglePdfViewer(resource.url)}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-primary"
                          >
                            Ver recurso
                          </a>
                          <button
                            type="button"
                            className="btn btn-outline-dark"
                            onClick={() => setOpenDescription(null)}
                          >
                            Volver
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {filteredResources.length === 0 && (
              <div className="empty-state">
                <h3>No encontramos recursos</h3>
                <p>Prueba con otra palabra clave o limpia la búsqueda.</p>
              </div>
            )}
          </div>
        </section>
      </main>

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
              <li>Zambrano, Bolívar</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Fundación Tamborito.</p>
        </div>
      </footer>
    </PageShell>
  );
}