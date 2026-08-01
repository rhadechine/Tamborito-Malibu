import {
  useMemo,
  useState,
} from 'react';
import PlatformIcon from '../../components/PlatformIcon';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import {
  formatCurrency,
  formatDate,
  getInitials,
} from '../../utils/formatters';

export default function AdminStudents() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [selectedStudentId, setSelectedStudentId] =
    useState(null);

  const {
    users,
    toggleUserStatus,
  } = useAuth();

  const {
    getCourseById,
    getUserEnrollments,
    getUserOrders,
    getUserCertificates,
    getCourseProgress,
  } = usePlatform();

  const students = users.filter(
    (user) => user.role === 'client',
  );

  const filteredStudents = useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLowerCase();

    return students.filter((student) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          student.name,
          student.email,
          student.city,
          student.phone,
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesStatus =
        status === 'all' ||
        student.status === status;

      return matchesQuery && matchesStatus;
    });
  }, [students, query, status]);

  const selectedStudent = students.find(
    (student) =>
      student.id === selectedStudentId,
  );

  const selectedEnrollments = selectedStudent
    ? getUserEnrollments(selectedStudent.id)
    : [];

  const selectedOrders = selectedStudent
    ? getUserOrders(selectedStudent.id)
    : [];

  const selectedCertificates =
    selectedStudent
      ? getUserCertificates(
          selectedStudent.id,
        )
      : [];

  const selectedRevenue = selectedOrders
    .filter(
      (order) =>
        order.paymentStatus === 'approved',
    )
    .reduce(
      (total, order) =>
        total + Number(order.total || 0),
      0,
    );

  const summary = {
    total: students.length,
    active: students.filter(
      (student) =>
        student.status === 'active',
    ).length,
    inactive: students.filter(
      (student) =>
        student.status === 'inactive',
    ).length,
  };

  return (
    <div className="admin-students-page">
      <section className="admin-page-intro">
        <div>
          <p className="admin-page-eyebrow">
            Comunidad académica
          </p>

          <h2>Estudiantes registrados</h2>

          <p>
            Consulta cuentas, cursos,
            actividad académica, compras y
            certificados.
          </p>
        </div>
      </section>

      <section className="admin-student-summary">
        <article>
          <strong>{summary.total}</strong>
          <span>Registrados</span>
        </article>

        <article>
          <strong>{summary.active}</strong>
          <span>Activos</span>
        </article>

        <article>
          <strong>{summary.inactive}</strong>
          <span>Inactivos</span>
        </article>
      </section>

      <section className="admin-toolbar">
        <div className="admin-search-control">
          <PlatformIcon
            name="search"
            size={19}
          />

          <input
            type="search"
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Buscar por nombre, correo o ciudad"
          />
        </div>

        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value)
          }
        >
          <option value="all">
            Todos los estados
          </option>
          <option value="active">
            Activos
          </option>
          <option value="inactive">
            Inactivos
          </option>
        </select>
      </section>

      <section className="admin-student-layout">
        <div className="admin-student-table">
          <div className="admin-student-table-head">
            <span>Estudiante</span>
            <span>Ubicación</span>
            <span>Cursos</span>
            <span>Registro</span>
            <span>Estado</span>
            <span />
          </div>

          {filteredStudents.map((student) => {
            const studentEnrollments =
              getUserEnrollments(student.id);

            return (
              <article
                className={[
                  'admin-student-table-row',
                  selectedStudentId ===
                  student.id
                    ? 'selected'
                    : '',
                ].join(' ')}
                key={student.id}
              >
                <div className="admin-student-main">
                  <span>
                    {getInitials(student.name)}
                  </span>

                  <div>
                    <strong>
                      {student.name}
                    </strong>
                    <small>
                      {student.email}
                    </small>
                  </div>
                </div>

                <div className="admin-student-cell">
                  <strong>
                    {student.city ||
                      'Sin registrar'}
                  </strong>
                  <span>
                    {student.phone ||
                      'Sin teléfono'}
                  </span>
                </div>

                <div className="admin-student-cell">
                  <strong>
                    {studentEnrollments.length}
                  </strong>
                  <span>Vinculados</span>
                </div>

                <div className="admin-student-cell">
                  <strong>
                    {formatDate(
                      student.createdAt,
                    )}
                  </strong>
                </div>

                <div className="admin-student-cell">
                  <span
                    className={[
                      'admin-status-badge',
                      student.status,
                    ].join(' ')}
                  >
                    {student.status === 'active'
                      ? 'Activo'
                      : 'Inactivo'}
                  </span>
                </div>

                <button
                  type="button"
                  className="admin-view-button"
                  onClick={() =>
                    setSelectedStudentId(
                      student.id,
                    )
                  }
                >
                  Ver detalle
                </button>
              </article>
            );
          })}
        </div>

        {selectedStudent && (
          <aside className="admin-student-detail">
            <button
              type="button"
              className="admin-detail-close"
              onClick={() =>
                setSelectedStudentId(null)
              }
            >
              <PlatformIcon
                name="close"
                size={20}
              />
            </button>

            <div className="admin-student-profile">
              <span>
                {getInitials(
                  selectedStudent.name,
                )}
              </span>

              <h3>{selectedStudent.name}</h3>
              <p>{selectedStudent.email}</p>

              <i
                className={[
                  'admin-status-badge',
                  selectedStudent.status,
                ].join(' ')}
              >
                {selectedStudent.status ===
                'active'
                  ? 'Cuenta activa'
                  : 'Cuenta inactiva'}
              </i>
            </div>

            <div className="admin-student-detail-stats">
              <article>
                <strong>
                  {selectedEnrollments.length}
                </strong>
                <span>Cursos</span>
              </article>

              <article>
                <strong>
                  {
                    selectedCertificates.length
                  }
                </strong>
                <span>Certificados</span>
              </article>

              <article>
                <strong>
                  {formatCurrency(
                    selectedRevenue,
                  )}
                </strong>
                <span>Compras</span>
              </article>
            </div>

            <section className="admin-student-information">
              <h4>Información</h4>

              <dl>
                <div>
                  <dt>Teléfono</dt>
                  <dd>
                    {selectedStudent.phone ||
                      'No registrado'}
                  </dd>
                </div>

                <div>
                  <dt>Ciudad</dt>
                  <dd>
                    {selectedStudent.city ||
                      'No registrada'}
                  </dd>
                </div>

                <div>
                  <dt>Registro</dt>
                  <dd>
                    {formatDate(
                      selectedStudent.createdAt,
                    )}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="admin-student-courses">
              <h4>Cursos del estudiante</h4>

              {selectedEnrollments.length ===
              0 ? (
                <p>
                  No tiene cursos vinculados.
                </p>
              ) : (
                selectedEnrollments.map(
                  (enrollment) => {
                    const course =
                      getCourseById(
                        enrollment.courseId,
                      );

                    const progress =
                      getCourseProgress(
                        selectedStudent.id,
                        enrollment.courseId,
                      );

                    if (!course) {
                      return null;
                    }

                    return (
                      <article
                        key={enrollment.id}
                      >
                        <img
                          src={course.cover}
                          alt={course.title}
                        />

                        <div>
                          <strong>
                            {course.title}
                          </strong>

                          <span>
                            {
                              progress.percentage
                            }
                            % completado
                          </span>

                          <div>
                            <span
                              style={{
                                width: `${progress.percentage}%`,
                              }}
                            />
                          </div>
                        </div>
                      </article>
                    );
                  },
                )
              )}
            </section>

            <button
              type="button"
              className={[
                'platform-button',
                selectedStudent.status ===
                'active'
                  ? 'platform-button-danger'
                  : 'platform-button-primary',
              ].join(' ')}
              onClick={() =>
                toggleUserStatus(
                  selectedStudent.id,
                )
              }
            >
              {selectedStudent.status ===
              'active'
                ? 'Desactivar cuenta'
                : 'Activar cuenta'}
            </button>
          </aside>
        )}
      </section>
    </div>
  );
}