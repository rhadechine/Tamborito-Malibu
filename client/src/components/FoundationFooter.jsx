import { Link } from 'react-router-dom';

export default function FoundationFooter() {
  return (
    <footer className="footer foundation-footer">
      <div className="container footer-grid">
        <div>
          <h3>Fundación Tamborito</h3>
          <p>
            Tradición, cultura y neuroeducación para preservar la memoria musical de Zambrano,
            Bolívar.
          </p>
        </div>

        <div>
          <h4>Fundación</h4>
          <ul>
            <li>
              <Link to="/fundacion">Inicio</Link>
            </li>
            <li>
              <Link to="/historia">Historia</Link>
            </li>
            <li>
              <Link to="/cursos">Cursos</Link>
            </li>
            <li>
              <Link to="/biblioteca">Biblioteca</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4>Participa</h4>
          <ul>
            <li>
              <Link to="/inscripcion">Inscripción</Link>
            </li>
            <li>
              <Link to="/mis-cursos">Mis cursos</Link>
            </li>
            <li>
              <Link to="/donaciones">Donaciones</Link>
            </li>
            <li>
              <Link to="/">Ecosistema cultural</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Fundación Tamborito. Zambrano, Bolívar.</p>
      </div>
    </footer>
  );
}
