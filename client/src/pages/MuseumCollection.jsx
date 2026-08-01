import { Link } from 'react-router-dom';
import MuseumFooter from '../components/MuseumFooter';
import PageShell from '../components/PageShell';

const artifacts = [
  {
    imageClass: 'artifact-a',
    name: 'Vasija ceremonial',
    description:
      'Objeto cerámico asociado a prácticas rituales o domésticas. La ficha definitiva deberá validarse con la información oficial del Museo.',
    category: 'Cerámica',
  },
  {
    imageClass: 'artifact-b',
    name: 'Figura antropomorfa',
    description:
      'Pieza representativa con rasgos humanos, útil para explicar simbolismo, técnica de elaboración y estado de conservación.',
    category: 'Figura',
  },
  {
    imageClass: 'artifact-c',
    name: 'Herramienta lítica',
    description:
      'Objeto elaborado en piedra que permite abordar la tecnología, el trabajo y diferentes actividades de la vida cotidiana.',
    category: 'Piedra',
  },
  {
    imageClass: 'artifact-d',
    name: 'Fragmento decorado',
    description:
      'Fragmento con patrones, incisiones o elementos visuales que pueden apoyar la identificación de técnicas y estilos.',
    category: 'Fragmento',
  },
];

const exhibitions = [
  {
    title: 'Colección permanente',
    text: 'Recorrido base por las piezas más representativas y por los temas centrales del Museo.',
  },
  {
    title: 'Selecciones temporales',
    text: 'Conjuntos de piezas, fotografías o documentos organizados alrededor de un tema específico.',
  },
  {
    title: 'Recorridos educativos',
    text: 'Presentaciones adaptadas para estudiantes, familias, investigadores y grupos comunitarios.',
  },
];

const documents = [
  {
    coverClass: 'museo-book-a',
    title: 'Catálogo del Museo',
    text: 'Documento general para organizar las piezas destacadas y la información esencial de la colección.',
  },
  {
    coverClass: 'museo-book-b',
    title: 'Fichas de conservación',
    text: 'Registros descriptivos para documentar materiales, dimensiones, procedencia y estado de las piezas.',
  },
  {
    coverClass: 'museo-book-c',
    title: 'Archivo fotográfico',
    text: 'Memoria visual de las piezas, los espacios del Museo y las actividades de divulgación realizadas.',
  },
];

export default function MuseumCollection() {
  return (
    <PageShell variant="museum">
      <main>
        <section className="page-banner museo-banner">
          <div className="container center">
            <p className="section-tag museo-tag">
              Colecciones
            </p>

            <h1 className="page-title">
              Piezas arqueológicas y memoria patrimonial.
            </h1>

            <p className="lead center-text max-text">
              Un espacio integrado para consultar piezas
              destacadas, exposiciones, documentación, archivo
              e investigaciones relacionadas con las
              colecciones del Museo.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-heading">
              <p className="section-tag museo-tag">
                Piezas destacadas
              </p>

              <h2>
                Una primera mirada a la colección.
              </h2>
            </div>

            <div className="collection-grid">
              {artifacts.map((artifact) => (
                <article
                  className="artifact-card"
                  key={artifact.name}
                >
                  <div
                    className={`artifact-img ${artifact.imageClass}`}
                  />

                  <h3>{artifact.name}</h3>

                  <p>{artifact.description}</p>

                  <span>{artifact.category}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section museo-soft">
          <div className="container">
            <div className="section-heading center">
              <p className="section-tag museo-tag">
                Exposición y divulgación
              </p>

              <h2>
                Formas de explorar las colecciones.
              </h2>
            </div>

            <div className="cards-grid three">
              {exhibitions.map((exhibition) => (
                <article
                  className="future-card museo-card"
                  key={exhibition.title}
                >
                  <h3>{exhibition.title}</h3>

                  <p>{exhibition.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-heading">
              <p className="section-tag museo-tag">
                Investigación y archivo
              </p>

              <h2>
                Documentación asociada a las piezas.
              </h2>
            </div>

            <div className="book-grid">
              {documents.map((document) => (
                <article
                  className="book-card museo-card"
                  key={document.title}
                >
                  <div
                    className={`book-cover ${document.coverClass}`}
                  />

                  <h3>{document.title}</h3>

                  <p>{document.text}</p>

                  <span className="text-link museo-link">
                    Recurso en preparación
                  </span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section ecosystem-support museo-soft">
          <div className="container support-card">
            <div>
              <p className="section-tag museo-tag">
                Consultas sobre la colección
              </p>

              <h2>
                ¿Necesitas información sobre una pieza?
              </h2>

              <p>
                Puedes comunicarte con el Museo para realizar
                consultas, solicitar una visita educativa o
                proponer una colaboración académica
                relacionada con las colecciones.
              </p>
            </div>

            <div className="support-actions">
              <Link
                to="/museo/contactanos"
                className="btn btn-museo"
              >
                Contactar al Museo
              </Link>

              <Link
                to="/museo/donar"
                className="btn btn-outline-dark"
              >
                Apoyar la conservación
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MuseumFooter />
    </PageShell>
  );
}