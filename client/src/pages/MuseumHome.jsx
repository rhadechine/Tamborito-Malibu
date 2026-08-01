import { Link } from 'react-router-dom';
import MuseumFooter from '../components/MuseumFooter';
import PageShell from '../components/PageShell';

const museumAreas = [
  {
    number: '01',
    title: 'Historia',
    text: 'Conoce el origen del Museo, su propósito y la relación que mantiene con la memoria de la comunidad.',
    to: '/museo/historia',
    linkLabel: 'Conocer la historia',
  },
  {
    number: '02',
    title: 'Colecciones',
    text: 'Explora piezas arqueológicas, objetos patrimoniales, exposiciones y documentos asociados a la colección.',
    to: '/museo/colecciones',
    linkLabel: 'Explorar colecciones',
  },
  {
    number: '03',
    title: 'Contáctanos',
    text: 'Consulta horarios, visitas individuales o grupales, recorridos educativos y solicitudes de investigación.',
    to: '/museo/contactanos',
    linkLabel: 'Contactar al Museo',
  },
];

export default function MuseumHome() {
  return (
    <PageShell variant="museum">
      <main>
        <section className="hero museo-hero">
          <div className="hero-overlay museo-overlay" />

          <div className="container hero-content">
            <p className="eyebrow museo-eyebrow">
              Museo Arqueológico Malibú
            </p>

            <h1>
              Memoria arqueológica, territorio y patrimonio
              cultural.
            </h1>

            <p className="hero-text">
              Un espacio para conservar, estudiar y divulgar
              piezas, relatos y memorias que permiten
              comprender el pasado arqueológico y cultural de
              la comunidad.
            </p>

            <div className="hero-actions">
              <Link
                to="/museo/colecciones"
                className="btn btn-museo"
              >
                Explorar colecciones
              </Link>

              <Link
                to="/museo/contactanos"
                className="btn btn-secondary"
              >
                Contáctanos
              </Link>
            </div>
          </div>
        </section>

        <section className="section museo-soft">
          <div className="container split-grid">
            <div className="split-text">
              <p className="section-tag museo-tag">
                Sobre el Museo
              </p>

              <h2>
                Un lugar para conectar el presente con la
                memoria del territorio.
              </h2>

              <p>
                El Museo Arqueológico Malibú reúne piezas,
                testimonios, documentos y recursos educativos
                relacionados con el patrimonio arqueológico y
                cultural de la región.
              </p>

              <p>
                Dentro de su sección de colecciones se
                integran las piezas destacadas, las
                exposiciones y los procesos de documentación e
                investigación, evitando una navegación
                fragmentada o repetitiva.
              </p>
            </div>

            <div className="feature-stack">
              <article className="feature-card museo-card">
                <h3>Colecciones arqueológicas</h3>

                <p>
                  Piezas organizadas por material, función,
                  contexto, procedencia y periodo histórico.
                </p>
              </article>

              <article className="feature-card museo-card">
                <h3>Exposición y divulgación</h3>

                <p>
                  Formas de presentar la colección mediante
                  recorridos, selecciones temáticas y
                  contenidos educativos.
                </p>
              </article>

              <article className="feature-card museo-card">
                <h3>Documentación e investigación</h3>

                <p>
                  Catálogos, fichas, archivo fotográfico y
                  material de consulta asociado a las
                  colecciones.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-heading center">
              <p className="section-tag museo-tag">
                Explora el Museo
              </p>

              <h2>
                Todo lo necesario en una navegación más clara.
              </h2>
            </div>

            <div className="cards-grid three">
              {museumAreas.map((area) => (
                <article
                  className="info-card museo-card"
                  key={area.title}
                >
                  <div className="card-number">
                    {area.number}
                  </div>

                  <h3>{area.title}</h3>

                  <p>{area.text}</p>

                  <Link
                    to={area.to}
                    className="text-link museo-link"
                  >
                    {area.linkLabel}
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section ecosystem-support museo-soft">
          <div className="container support-card">
            <div>
              <p className="section-tag museo-tag">
                Conservación patrimonial
              </p>

              <h2>
                Ayuda a proteger la memoria del territorio.
              </h2>

              <p>
                Los aportes contribuyen a la conservación de
                piezas, la documentación de las colecciones,
                la producción de recursos educativos y el
                mantenimiento del Museo.
              </p>
            </div>

            <div className="support-actions">
              <Link
                to="/museo/donar"
                className="btn btn-museo"
              >
                Donar al Museo
              </Link>

              <Link
                to="/museo/contactanos"
                className="btn btn-outline-dark"
              >
                Solicitar información
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MuseumFooter />
    </PageShell>
  );
}