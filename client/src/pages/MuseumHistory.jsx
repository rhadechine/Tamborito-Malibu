import MuseumFooter from '../components/MuseumFooter';
import PageShell from '../components/PageShell';

const milestones = [
  {
    year: 'Origen',
    title: 'Reunir y proteger la memoria material',
    text:
      'El Museo nace alrededor de la necesidad de conservar piezas, relatos y señales del pasado que ayudan a explicar la relación entre territorio, cultura y comunidad.',
    image:
      'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=1100&q=80',
  },
  {
    year: 'Colección',
    title: 'Pasar de objetos aislados a registros con contexto',
    text:
      'Cada pieza requiere una ficha que relacione descripción, material, estado de conservación, posible procedencia, uso e información histórica disponible.',
    image:
      'https://images.unsplash.com/photo-1594794312433-05a69a98b7a0?auto=format&fit=crop&w=1100&q=80',
  },
  {
    year: 'Divulgación',
    title: 'Abrir el patrimonio a visitantes y estudiantes',
    text:
      'La colección cobra sentido cuando puede ser consultada, explicada y recorrida por la comunidad, las instituciones educativas y las personas interesadas en el patrimonio.',
    image:
      'https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=1100&q=80',
  },
];

const principles = [
  {
    title: 'Conservación',
    text:
      'Cuidar las piezas y preservar la información mínima que permite identificarlas y evitar su pérdida documental.',
  },
  {
    title: 'Documentación',
    text:
      'Registrar materiales, fotografías, descripciones e información histórica para que la colección pueda administrarse con orden.',
  },
  {
    title: 'Educación',
    text:
      'Convertir la colección en una herramienta para aprender sobre historia, territorio, técnicas y expresiones culturales.',
  },
];

export default function MuseumHistory() {
  return (
    <PageShell variant="museum">
      <main>
        <section className="page-hero museo-history-hero">
          <div className="page-hero-overlay museo-overlay" />

          <div className="container page-hero-content">
            <h1>Historia del Museo Arqueológico Malibú.</h1>
            <p>
              Un espacio dedicado a conservar, documentar y divulgar piezas
              arqueológicas vinculadas con la memoria cultural del territorio.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container narrow">
            <h2 className="page-title">
              Un museo creado para cuidar el patrimonio y hacerlo comprensible.
            </h2>

            <p className="lead">
              El Museo Arqueológico Malibú se proyecta como un lugar de
              encuentro entre las piezas, la investigación, la educación y la
              comunidad. Su valor no está únicamente en conservar objetos, sino
              en organizar la información que permite entender de qué material
              están hechos, qué historia representan y cómo se relacionan con la
              memoria del territorio.
            </p>

            <p className="lead">
              La plataforma web debe apoyar ese propósito: presentar la historia
              del museo con claridad, mostrar la colección de forma ordenada y
              permitir que la administración agregue contenido sin depender de
              modificaciones directas en el código.
            </p>
          </div>
        </section>

        <section className="section museo-soft">
          <div className="container mission-grid two-columns">
            <article className="value-block museo-card">
              <h3>Misión</h3>
              <p>
                Conservar y divulgar piezas arqueológicas y recursos culturales
                mediante una gestión responsable, accesible y orientada a la
                educación patrimonial.
              </p>
            </article>

            <article className="value-block museo-card">
              <h3>Visión</h3>
              <p>
                Consolidarse como un referente cultural que facilite el acceso a
                la memoria arqueológica, promueva la investigación y fortalezca
                el reconocimiento del patrimonio local.
              </p>
            </article>
          </div>
        </section>

        <section className="section timeline-section">
          <div className="container">
            {milestones.map((item, index) => (
              <div
                className={[
                  'timeline-row',
                  index % 2 ? 'reverse' : '',
                ].join(' ')}
                key={item.title}
              >
                <div className="timeline-media">
                  <img src={item.image} alt={item.title} />
                </div>

                <div className="timeline-content">
                  <p className="timeline-year museo-year">{item.year}</p>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section museo-soft">
          <div className="container">
            <div className="section-heading center">
              <h2>Trabajo patrimonial del Museo.</h2>
            </div>

            <div className="cards-grid three">
              {principles.map((principle) => (
                <article className="future-card museo-card" key={principle.title}>
                  <h3>{principle.title}</h3>
                  <p>{principle.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <MuseumFooter />
    </PageShell>
  );
}