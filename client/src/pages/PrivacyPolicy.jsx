import FoundationFooter from '../components/FoundationFooter';
import PageShell from '../components/PageShell';

export default function PrivacyPolicy() {
  return (
    <PageShell variant="foundation">
      <main>
        <section className="page-banner">
          <div className="container narrow">
            <h1 className="page-title">Política de privacidad.</h1>
            <p className="lead">
              Esta página presenta una base informativa para el tratamiento de
              datos personales dentro de la plataforma cultural Tamborito -
              Malibú. El texto final debe ser validado jurídicamente antes de
              publicar el sitio en producción.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container narrow privacy-content">
            <article>
              <h2>Datos que puede solicitar la plataforma</h2>
              <p>
                El sistema puede registrar nombre, correo electrónico, datos de
                contacto, información de inscripción, historial de compras,
                donaciones, cursos vinculados y evidencias entregadas dentro del
                campus del estudiante.
              </p>
            </article>

            <article>
              <h2>Finalidad del uso de la información</h2>
              <p>
                La información se utiliza para permitir el acceso a cursos,
                gestionar recursos digitales, atender solicitudes, registrar
                donaciones, procesar compras, emitir comprobantes y mantener la
                trazabilidad administrativa del sistema.
              </p>
            </article>

            <article>
              <h2>Acceso y seguridad</h2>
              <p>
                Las áreas privadas del portal del cliente y del panel
                administrativo requieren autenticación. Cada usuario debe acceder
                únicamente a la información asociada a su cuenta o a los módulos
                permitidos por su rol.
              </p>
            </article>

            <article>
              <h2>Contacto</h2>
              <p>
                Para solicitudes relacionadas con datos personales, soporte,
                compras, donaciones o cursos, el usuario debe comunicarse con
                los canales oficiales publicados por la Fundación Tamborito o el
                Museo Arqueológico Malibú.
              </p>
            </article>
          </div>
        </section>
      </main>

      <FoundationFooter />
    </PageShell>
  );
}