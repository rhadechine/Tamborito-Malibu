import { Link } from 'react-router-dom';

export default function MuseumFooter() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h3>Museo Arqueológico Malibú</h3>

          <p>
            Un espacio dedicado a conservar, estudiar y
            divulgar la memoria arqueológica y cultural del
            territorio.
          </p>
        </div>

        <div>
          <h4>Museo</h4>

          <ul>
            <li>
              <Link to="/museo">
                Inicio
              </Link>
            </li>

            <li>
              <Link to="/museo/historia">
                Historia
              </Link>
            </li>

            <li>
              <Link to="/museo/colecciones">
                Colecciones
              </Link>
            </li>

            <li>
              <Link to="/museo/contactanos">
                Contáctanos
              </Link>
            </li>

            <li>
              <Link to="/museo/donar">
                Donar
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4>Ecosistema cultural</h4>

          <ul>
            <li>
              <Link to="/">
                Portal principal
              </Link>
            </li>

            <li>
              <Link to="/fundacion">
                Fundación Tamborito
              </Link>
            </li>

            <li>
              <Link to="/cursos">
                Cursos
              </Link>
            </li>

            <li>
              <Link to="/biblioteca">
                Biblioteca
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © 2026 Ecosistema Cultural Tamborito & Museo
          Arqueológico Malibú.
        </p>
      </div>
    </footer>
  );
}