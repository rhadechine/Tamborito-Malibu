import MuseumFooter from '../components/MuseumFooter';
import PageShell from '../components/PageShell';

const collectionGroups = [
  {
    title: 'Cerámica ceremonial y doméstica',
    description:
      'Piezas asociadas a usos rituales, almacenamiento, preparación o representación simbólica.',
    items: [
      {
        name: 'Vasija ceremonial',
        image:
          'https://images.unsplash.com/photo-1594794312433-05a69a98b7a0?auto=format&fit=crop&w=900&q=80',
        material: 'Cerámica modelada y cocida',
        history:
          'Este tipo de pieza permite explicar prácticas de uso cotidiano o ceremonial según su forma, acabado y contexto de hallazgo.',
        description:
          'Registro descriptivo para documentar forma, decoración, estado de conservación y posibles marcas de elaboración.',
      },
      {
        name: 'Fragmento decorado',
        image:
          'https://images.unsplash.com/photo-1580136607993-fd598cf5c4f5?auto=format&fit=crop&w=900&q=80',
        material: 'Cerámica con incisiones o pintura',
        history:
          'Los fragmentos permiten estudiar técnicas, patrones visuales y cambios en estilos de elaboración.',
        description:
          'La ficha debe registrar color, textura, tipo de decoración, medidas y observaciones de conservación.',
      },
    ],
  },
  {
    title: 'Figuras y representación simbólica',
    description:
      'Elementos que ayudan a interpretar formas humanas, animales o motivos culturales presentes en la colección.',
    items: [
      {
        name: 'Figura antropomorfa',
        image:
          'https://images.unsplash.com/photo-1565877050221-61fd5a080d5b?auto=format&fit=crop&w=900&q=80',
        material: 'Arcilla cocida',
        history:
          'Las figuras con rasgos humanos pueden relacionarse con identidad, ritualidad, vida social o representación comunitaria.',
        description:
          'El registro debe describir rasgos visibles, proporción, postura, decoración y estado de la pieza.',
      },
      {
        name: 'Elemento zoomorfo',
        image:
          'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=900&q=80',
        material: 'Cerámica o material mixto',
        history:
          'Las formas animales permiten explicar vínculos entre entorno natural, pensamiento simbólico y prácticas culturales.',
        description:
          'Debe documentarse el animal representado, el nivel de conservación y los detalles visibles del modelado.',
      },
    ],
  },
  {
    title: 'Herramientas, piedra y materiales de trabajo',
    description:
      'Objetos relacionados con técnicas, actividades productivas y procesos de transformación de materiales.',
    items: [
      {
        name: 'Herramienta lítica',
        image:
          'https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?auto=format&fit=crop&w=900&q=80',
        material: 'Piedra tallada o pulida',
        history:
          'Las herramientas líticas ayudan a comprender técnicas de trabajo, alimentación, corte, molienda o elaboración de objetos.',
        description:
          'La ficha debe incluir tipo de piedra, desgaste, tamaño, uso probable y estado de conservación.',
      },
      {
        name: 'Pieza de molienda',
        image:
          'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=900&q=80',
        material: 'Piedra con señales de uso',
        history:
          'Los elementos de molienda permiten explicar prácticas alimentarias y procesos cotidianos de preparación.',
        description:
          'El detalle debe registrar superficie de uso, desgaste, dimensiones y observaciones de manejo.',
      },
    ],
  },
];

const adminNotes = [
  'Agregar nuevas piezas desde el panel administrativo de Malibú.',
  'Asignar cada pieza a un grupo de colección.',
  'Registrar imagen, descripción, historia, material y estado de conservación.',
];

export default function MuseumCollection() {
  return (
    <PageShell variant="museum">
      <main>
        <section className="page-banner museo-banner">
          <div className="container center">
            <h1 className="page-title">Colecciones del Museo.</h1>
            <p className="lead center-text max-text">
              Consulta grupos de piezas con imagen, descripción histórica y
              detalle de material. Esta estructura está preparada para que el
              administrador de Malibú agregue contenido posteriormente.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container museum-collection-groups">
            {collectionGroups.map((group) => (
              <article className="museum-collection-group" key={group.title}>
                <div className="museum-collection-heading">
                  <h2>{group.title}</h2>
                  <p>{group.description}</p>
                </div>

                <div className="museum-piece-grid">
                  {group.items.map((item) => (
                    <article className="museum-piece-card" key={item.name}>
                      <img src={item.image} alt={item.name} />

                      <div className="museum-piece-content">
                        <h3>{item.name}</h3>

                        <dl>
                          <div>
                            <dt>Material</dt>
                            <dd>{item.material}</dd>
                          </div>
                          <div>
                            <dt>Historia</dt>
                            <dd>{item.history}</dd>
                          </div>
                          <div>
                            <dt>Descripción</dt>
                            <dd>{item.description}</dd>
                          </div>
                        </dl>
                      </div>
                    </article>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section museo-soft">
          <div className="container split-grid museum-admin-note">
            <div className="split-text">
              <h2>Administración de contenido Malibú.</h2>
              <p>
                El sitio conserva la misma plataforma administrativa, pero el
                usuario administrador de Malibú puede utilizar un perfil propio
                para cargar piezas, grupos de colección, publicaciones y
                recursos asociados al museo.
              </p>
            </div>

            <div className="feature-stack">
              {adminNotes.map((note) => (
                <article className="feature-card museo-card" key={note}>
                  <p>{note}</p>
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