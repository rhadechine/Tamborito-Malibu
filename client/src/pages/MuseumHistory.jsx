import MuseumFooter from '../components/MuseumFooter';
import PageShell from '../components/PageShell';

export default function MuseumHistory() {
  return (
    <PageShell variant="museum">
      <main>
        <section className="page-hero museo-history-hero">
          <div className="page-hero-overlay museo-overlay" />

          <div className="container page-hero-content">
            <p className="eyebrow museo-eyebrow">
              Historia del Museo
            </p>

            <h1>
              Origen, memoria y propósito patrimonial.
            </h1>

            <p>
              Una mirada al proceso que dio origen al Museo y
              a su compromiso con la conservación de la
              memoria cultural del territorio.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container narrow">
            <p className="section-tag museo-tag">
              Relato institucional
            </p>

            <h2 className="page-title">
              Un Museo creado para conservar la memoria del
              territorio.
            </h2>

            <p className="lead">
              El Museo Arqueológico Malibú se concibe como un
              espacio de preservación, interpretación y
              divulgación de piezas arqueológicas y memorias
              culturales. Su historia se relaciona con el
              interés de proteger objetos, relatos y
              testimonios que permiten reconocer el pasado de
              la región.
            </p>
          </div>
        </section>

        <section className="section timeline-section museo-soft">
          <div className="container">
            <div className="timeline-row">
              <div className="timeline-media">
                <img
                  src="https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=1000&q=80"
                  alt="Interior de un espacio museográfico"
                />
              </div>

              <div className="timeline-content">
                <p className="timeline-year museo-year">
                  Origen
                </p>

                <h3>La idea de proteger las piezas</h3>

                <p>
                  El proyecto surge de la necesidad de reunir,
                  conservar y organizar piezas y testimonios
                  vinculados con la historia arqueológica y
                  cultural de la comunidad.
                </p>
              </div>
            </div>

            <div className="timeline-row reverse">
              <div className="timeline-media">
                <img
                  src="https://images.unsplash.com/photo-1594794312433-05a69a98b7a0?auto=format&fit=crop&w=1000&q=80"
                  alt="Piezas y patrimonio cultural exhibidos"
                />
              </div>

              <div className="timeline-content">
                <p className="timeline-year museo-year">
                  Memoria
                </p>

                <h3>La construcción de una colección</h3>

                <p>
                  Las piezas dejan de ser objetos aislados
                  cuando son documentadas y relacionadas con
                  su material, función, procedencia, contexto
                  y significado cultural.
                </p>
              </div>
            </div>

            <div className="timeline-row">
              <div className="timeline-media">
                <img
                  src="https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=1000&q=80"
                  alt="Visitantes observando una exposición cultural"
                />
              </div>

              <div className="timeline-content">
                <p className="timeline-year museo-year">
                  Comunidad
                </p>

                <h3>Un archivo vivo y educativo</h3>

                <p>
                  El Museo busca funcionar como puente entre
                  el patrimonio, la educación y la
                  participación comunitaria, facilitando
                  visitas, consultas y procesos de
                  divulgación.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container mission-grid">
            <article className="value-block museo-card">
              <h3>Conservar</h3>

              <p>
                Proteger las piezas y la información que
                permite comprender su valor histórico y
                cultural.
              </p>
            </article>

            <article className="value-block museo-card">
              <h3>Documentar</h3>

              <p>
                Registrar características, procedencia,
                materiales y contexto para mantener
                organizada la colección.
              </p>
            </article>

            <article className="value-block museo-card">
              <h3>Divulgar</h3>

              <p>
                Acercar el patrimonio a estudiantes,
                visitantes, investigadores y miembros de la
                comunidad.
              </p>
            </article>
          </div>
        </section>
      </main>

      <MuseumFooter />
    </PageShell>
  );
}