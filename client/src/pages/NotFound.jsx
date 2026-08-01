import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';

export default function NotFound() {
  return (
    <PageShell>
      <section className="not-found">
        <div>
          <h1>Página no encontrada</h1>
          <p>La ruta solicitada no existe dentro del frontend cultural.</p>
          <Link className="btn btn-primary" to="/">Volver al inicio</Link>
        </div>
      </section>
    </PageShell>
  );
}
