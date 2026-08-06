import { useMemo, useState } from 'react';
import PlatformIcon from '../../components/PlatformIcon';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import {
  formatDate,
  getInitials,
} from '../../utils/formatters';

function getStudentCourses(studentId, enrollments, getCourseById) {
  return enrollments
    .filter((enrollment) => enrollment.userId === studentId)
    .map((enrollment) => ({
      enrollment,
      course: getCourseById(enrollment.courseId),
    }))
    .filter((item) => Boolean(item.course));
}

export default function AdminStudents() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const { users, toggleUserStatus } = useAuth();
  const {
    enrollments,
    getCourseById,
    getUserEnrollments,
    getCourseProgress,
  } = usePlatform();

  const students = useMemo(
    () => users.filter((user) => user.role === 'client'),
    [users],
  );

  const filteredStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return students.filter((student) => {
      const courses = getStudentCourses(
        student.id,
        enrollments,
        getCourseById,
      )
        .map(({ course }) => course.title)
        .join(' ');

      const matchesQuery =
        !normalizedQuery ||
        [student.name, student.email, courses]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesStatus =
        status === 'all' || student.status === status;

      return matchesQuery && matchesStatus;
    });
  }, [students, enrollments, getCourseById, query, status]);

  const selectedStudent = students.find(
    (student) => student.id === selectedStudentId,
  );

  const selectedEnrollments = selectedStudent
    ? getUserEnrollments(selectedStudent.id)
    : [];

  const selectedCourses = selectedStudent
    ? getStudentCourses(selectedStudent.id, enrollments, getCourseById)
    : [];

  return (
    <div className="admin-students-page">
      <section className="admin-page-intro">
        <div>
          <p className="admin-page-eyebrow">Estudiantes</p>
          <h2>Gestión de estudiantes</h2>
          <p>
            Revisa cuentas, cursos vinculados, avance académico y evidencias
            entregadas. Las compras no se muestran aquí; cualquier reclamo debe
            gestionarse por servicio al cliente.
          </p>
        </div>
      </section>

      <section className="admin-toolbar">
        <div className="admin-search-control">
          <PlatformIcon name="search" size={19} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, correo o curso"
          />
        </div>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </section>

      <section className="admin-student-layout admin-student-layout-wide">
        <div className="admin-student-table admin-student-table-scroll">
          <div className="admin-student-table-head admin-student-table-head-clean">
            <span>Nombre</span>
            <span>Correo</span>
            <span>Cursos vinculados</span>
            <span>Registro</span>
            <span>Estado</span>
            <span />
          </div>

          {filteredStudents.map((student) => {
            const studentCourses = getStudentCourses(
              student.id,
              enrollments,
              getCourseById,
            );

            return (
              <article
                className={[
                  'admin-student-table-row admin-student-table-row-clean',
                  selectedStudentId === student.id ? 'selected' : '',
                ].join(' ')}
                key={student.id}
              >
                <div className="admin-student-main">
                  <span>{getInitials(student.name)}</span>
                  <div>
                    <strong>{student.name}</strong>
                    <small>ID: {student.id}</small>
                  </div>
                </div>

                <div className="admin-student-cell">
                  <strong>{student.email}</strong>
                  <span>{student.phone || 'Sin teléfono'}</span>
                </div>

                <div className="admin-student-cell admin-course-tags-cell">
                  {studentCourses.length === 0 ? (
                    <span>Sin cursos vinculados</span>
                  ) : (
                    studentCourses.slice(0, 3).map(({ course }) => (
                      <small key={course.id}>{course.title}</small>
                    ))
                  )}
                  {studentCourses.length > 3 && (
                    <span>+{studentCourses.length - 3} más</span>
                  )}
                </div>

                <div className="admin-student-cell">
                  <strong>{formatDate(student.createdAt)}</strong>
                </div>

                <div className="admin-student-cell">
                  <span
                    className={[
                      'admin-status-badge',
                      student.status,
                    ].join(' ')}
                  >
                    {student.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <button
                  type="button"
                  className="admin-view-button"
                  onClick={() => setSelectedStudentId(student.id)}
                >
                  Ver detalle
                </button>
              </article>
            );
          })}

          {filteredStudents.length === 0 && (
            <div className="admin-empty-state">
              No se encontraron estudiantes con esos filtros.
            </div>
          )}
        </div>

        {selectedStudent && (
          <aside className="admin-student-detail">
            <button
              type="button"
              className="admin-detail-close"
              onClick={() => setSelectedStudentId(null)}
              aria-label="Cerrar detalle"
            >
              <PlatformIcon name="close" size={20} />
            </button>

            <div className="admin-student-profile">
              <span>{getInitials(selectedStudent.name)}</span>
              <h3>{selectedStudent.name}</h3>
              <p>{selectedStudent.email}</p>
              <i
                className={[
                  'admin-status-badge',
                  selectedStudent.status,
                ].join(' ')}
              >
                {selectedStudent.status === 'active'
                  ? 'Cuenta activa'
                  : 'Cuenta inactiva'}
              </i>
            </div>

            <div className="admin-student-detail-stats two">
              <article>
                <strong>{selectedCourses.length}</strong>
                <span>Cursos vinculados</span>
              </article>
              <article>
                <strong>
                  {selectedCourses.reduce(
                    (total, { enrollment }) =>
                      total + (enrollment.evidence?.length ?? 0),
                    0,
                  )}
                </strong>
                <span>Evidencias</span>
              </article>
            </div>

            <section className="admin-student-information">
              <h4>Datos de cuenta</h4>
              <dl>
                <div>
                  <dt>Teléfono</dt>
                  <dd>{selectedStudent.phone || 'No registrado'}</dd>
                </div>
                <div>
                  <dt>Registro</dt>
                  <dd>{formatDate(selectedStudent.createdAt)}</dd>
                </div>
              </dl>
            </section>

            <section className="admin-student-courses admin-student-courses-detail">
              <h4>Cursos vinculados y progreso</h4>

              {selectedEnrollments.length === 0 ? (
                <p>No tiene cursos vinculados.</p>
              ) : (
                selectedEnrollments.map((enrollment) => {
                  const course = getCourseById(enrollment.courseId);

                  if (!course) {
                    return null;
                  }

                  const progress = getCourseProgress(
                    selectedStudent.id,
                    enrollment.courseId,
                  );

                  return (
                    <article key={enrollment.id}>
                      <img src={course.cover} alt={course.title} />

                      <div>
                        <strong>{course.title}</strong>
                        <span>{progress.percentage}% de avance</span>
                        <div>
                          <span style={{ width: `${progress.percentage}%` }} />
                        </div>

                        <div className="admin-evidence-list">
                          {(enrollment.evidence ?? []).length === 0 ? (
                            <small>Sin evidencias registradas</small>
                          ) : (
                            enrollment.evidence.map((evidence) => (
                              <small key={evidence.id}>
                                {evidence.lessonTitle}: {evidence.fileName}
                              </small>
                            ))
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </section>

            <button
              type="button"
              className={[
                'platform-button',
                selectedStudent.status === 'active'
                  ? 'platform-button-danger'
                  : 'platform-button-primary',
              ].join(' ')}
              onClick={() => toggleUserStatus(selectedStudent.id)}
            >
              {selectedStudent.status === 'active'
                ? 'Desactivar cuenta'
                : 'Activar cuenta'}
            </button>
          </aside>
        )}
      </section>
    </div>
  );
}