import { Link } from 'react-router-dom';
import PlatformIcon from '../../components/PlatformIcon';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import {
  formatDate,
  getInitials,
} from '../../utils/formatters';

export default function Certificates() {
  const { user } = useAuth();

  const {
    getCourseById,
    getUserCertificates,
  } = usePlatform();

  const certificates = getUserCertificates(user.id)
    .map((certificate) => ({
      certificate,
      course: getCourseById(
        certificate.courseId,
      ),
    }))
    .filter(({ course }) => Boolean(course));

  function printCertificate() {
    window.print();
  }

  return (
    <div className="student-certificates-page">
      <section className="student-page-header">
        <div>
          <p className="student-page-eyebrow">
            Logros académicos
          </p>

          <h2>Mis certificados</h2>

          <p>
            Consulta las constancias obtenidas al
            completar las rutas formativas.
          </p>
        </div>
      </section>

      {certificates.length === 0 ? (
        <section className="student-empty-state">
          <div>
            <PlatformIcon
              name="certificate"
              size={44}
            />
          </div>

          <h2>Aún no tienes certificados.</h2>

          <p>
            Completa todas las clases y actividades de
            un curso certificado para obtener tu
            constancia.
          </p>

          <Link
            to="/campus/cursos"
            className="platform-button platform-button-primary"
          >
            Ir a mis cursos
          </Link>
        </section>
      ) : (
        <section className="student-certificate-grid">
          {certificates.map(
            ({ certificate, course }) => (
              <article
                className="student-certificate-card"
                key={certificate.id}
              >
                <div className="student-certificate-preview">
                  <div className="student-certificate-decoration top" />
                  <div className="student-certificate-decoration bottom" />

                  <div className="student-certificate-logo">
                    FT
                  </div>

                  <p>Fundación Tamborito</p>

                  <h3>Certificado de finalización</h3>

                  <span>Otorgado a</span>

                  <strong>{user.name}</strong>

                  <p>
                    Por completar satisfactoriamente el
                    curso
                  </p>

                  <h4>{course.title}</h4>

                  <div className="student-certificate-meta">
                    <span>
                      Código: {certificate.code}
                    </span>

                    <span>
                      Fecha:{' '}
                      {formatDate(
                        certificate.issuedAt,
                      )}
                    </span>
                  </div>

                  <div className="student-certificate-signature">
                    <span />
                    <strong>
                      Fundación Tamborito
                    </strong>
                  </div>
                </div>

                <div className="student-certificate-info">
                  <div>
                    <span className="student-certificate-icon">
                      {getInitials(course.title)}
                    </span>

                    <span>
                      <strong>{course.title}</strong>
                      <small>
                        Emitido el{' '}
                        {formatDate(
                          certificate.issuedAt,
                        )}
                      </small>
                    </span>
                  </div>

                  <p>
                    Código de verificación:{' '}
                    <strong>{certificate.code}</strong>
                  </p>

                  <div>
                    <button
                      type="button"
                      className="platform-button platform-button-primary"
                      onClick={printCertificate}
                    >
                      <PlatformIcon
                        name="certificate"
                        size={18}
                      />
                      Imprimir certificado
                    </button>

                    <Link
                      to={`/campus/cursos/${course.id}`}
                      className="platform-button platform-button-ghost"
                    >
                      Ver curso
                    </Link>
                  </div>
                </div>
              </article>
            ),
          )}
        </section>
      )}

      <section className="student-certificate-help">
        <div>
          <PlatformIcon name="lock" size={25} />
        </div>

        <span>
          <h3>Verificación de certificados</h3>

          <p>
            Cuando el backend esté conectado, cada
            certificado contará con validación pública
            mediante su código único.
          </p>
        </span>
      </section>
    </div>
  );
}