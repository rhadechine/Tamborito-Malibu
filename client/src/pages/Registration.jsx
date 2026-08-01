import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';

export default function Registration() {
  return (
    <PageShell variant="foundation">
      <>
      <section className="page-banner enroll-banner">
      <div className="container center">
      <p className="section-tag">Inscripción</p>
      <h1 className="page-title">Forma parte de Fundación Tamborito</h1>
      <p className="lead center-text max-text">
              Una sección pensada para recibir aspirantes, acudientes, aliados e interesados.
            </p>
      </div>
      </section>
      <section className="section">
      <div className="container form-layout">
      <div className="form-info">
      <p className="section-tag">Información</p>
      <h2>Registro de aspirantes</h2>
      <p>
                Este formulario puede adaptarse para niños, jóvenes, adultos o procesos comunitarios.
                También puede conectarse más adelante a una base de datos o correo institucional.
              </p>
      <div className="info-points">
      <div className="info-point">
      <h4>Programas</h4>
      <p>Música, danza, talleres culturales y futuras rutas de formación.</p>
      </div>
      <div className="info-point">
      <h4>Modalidad</h4>
      <p>Presencial, comunitaria o futura modalidad híbrida/virtual.</p>
      </div>
      <div className="info-point">
      <h4>Proceso</h4>
      <p>Recepción, revisión, contacto y seguimiento del aspirante.</p>
      </div>
      </div>
      </div>
      <form className="styled-form" id="formularioInscripcion">
      <div className="form-row">
      <div className="input-group">
      <label>Nombre completo</label>
      <input type="text" placeholder="Tu nombre completo" required="" />
      </div>
      <div className="input-group">
      <label>Correo electrónico</label>
      <input type="email" placeholder="correo@ejemplo.com" required="" />
      </div>
      </div>
      <div className="form-row">
      <div className="input-group">
      <label>Teléfono</label>
      <input type="text" placeholder="+57 300 000 0000" required="" />
      </div>
      <div className="input-group">
      <label>Edad</label>
      <input type="number" placeholder="Edad" />
      </div>
      </div>
      <div className="form-row">
      <div className="input-group full">
      <label>Programa de interés</label>
      <select required="">
      <option value="">Selecciona una opción</option>
      <option>Música tradicional</option>
      <option>Danza folclórica</option>
      <option>Taller cultural</option>
      <option>Curso futuro</option>
      </select>
      </div>
      </div>
      <div className="form-row">
      <div className="input-group full">
      <label>Mensaje</label>
      <textarea rows="6" placeholder="Cuéntanos un poco sobre tu interés"></textarea>
      </div>
      </div>
      <button type="submit" className="btn btn-primary full-btn">Enviar inscripción</button>
      </form>
      </div>
      </section>
      <footer className="footer">
      <div className="container footer-grid">
      <div>
      <h3>Fundación Tamborito</h3>
      <p>Inscripción abierta a procesos formativos y culturales.</p>
      </div>
      <div>
      <h4>Secciones</h4>
      <ul>
      <li><Link to="/historia">Historia</Link></li>
      <li><Link to="/cursos">Cursos</Link></li>
      <li><Link to="/biblioteca">Biblioteca</Link></li>
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
