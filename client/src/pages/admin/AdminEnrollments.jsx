import {
  useMemo,
  useState,
} from 'react';
import PlatformIcon from '../../components/PlatformIcon';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import {
  formatDate,
  getInitials,
} from '../../utils/formatters';

export default function AdminEnrollments() {
  const [query, setQuery] = useState('');
  const [courseFilter, setCourseFilter] =
    useState('all');
  const [statusFilter, setStatusFilter] =
    useState('all');

  const [manualForm, setManualForm] =
    useState({
      userId: '',
      courseId: '',
    });

  const [message, setMessage] =
    useState(null);

  const { users } = useAuth();

  const {
    courses,
    enrollments,
    getCourseById,
    getCourseProgress,
    createManualEnrollment,
    updateEnrollment,
  } = usePlatform();

  const students = users.filter(
    (user) =>
      user.role === 'client' &&
      user.status === 'active',
  );

  const filteredEnrollments = useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLowerCase();

    return enrollments.filter(
      (enrollment) => {
        const student = users.find(
          (user) =>
            user.id === enrollment.userId,
        );

        const course = getCourseById(
          enrollment.courseId,
        );

        const matchesQuery =
          !normalizedQuery ||
          [
            student?.name,
            student?.email,
            course?.title,
          ]
            .join(' ')
            .toLowerCase()
            .includes(normalizedQuery);

        const matchesCourse =
          courseFilter === 'all' ||
          enrollment.courseId ===
            courseFilter;

        const matchesStatus =
          statusFilter === 'all' ||
          enrollment.status ===
            statusFilter;

        return (
          matchesQuery &&
          matchesCourse &&
          matchesStatus
        );
      },
    );
  }, [
    enrollments,
    users,
    getCourseById,
    query,
    courseFilter,
    statusFilter,
  ]);

  function submitManualEnrollment(event) {
    event.preventDefault();

    if (
      !manualForm.userId ||
      !manualForm.courseId
    ) {
      setMessage({
        type: 'warning',
        text:
          'Selecciona un estudiante y un curso.',
      });
      return;
    }

    const result =
      createManualEnrollment(
        manualForm,
      );

    setMessage({
      type: result.ok
        ? 'success'
        : 'warning',
      text:
        result.message ??
        'Inscripción creada correctamente.',
    });

    if (result.ok) {
      setManualForm({
        userId: '',
        courseId: '',
      });
    }
  }

  function updateStatus(
    enrollmentId,
    status,
  ) {
    updateEnrollment(enrollmentId, {
      status,
      completedAt:
        status === 'completed'
          ? new Date().toISOString()
          : undefined,
    });
  }

  function updateAcademicValue(
    enrollmentId,
    field,
    value,
  ) {
    updateEnrollment(enrollmentId, {
      [field]:
        value === ''
          ? null
          : Number(value),
    });
  }

  const summary = {
    total: enrollments.length,
    active: enrollments.filter(
      (enrollment) =>
        enrollment.status === 'active',
    ).length,
    completed: enrollments.filter(
      (enrollment) =>
        enrollment.status === 'completed',
    ).length,
  };

  return (
    <div className="admin-enrollments-page">
      <section className="admin-page-intro">
        <div>
          <p className="admin-page-eyebrow">
            Gestión académica
          </p>

          <h2>Inscripciones y progreso</h2>

          <p>
            Vincula estudiantes, revisa
            avances, asistencia, calificaciones
            y estado de finalización.
          </p>
        </div>
      </section>

      <section className="admin-enrollment-summary">
        <article>
          <strong>{summary.total}</strong>
          <span>Total</span>
        </article>

        <article>
          <strong>{summary.active}</strong>
          <span>Activas</span>
        </article>

        <article>
          <strong>{summary.completed}</strong>
          <span>Completadas</span>
        </article>
      </section>

      <section className="admin-manual-enrollment">
        <div>
          <h3>Inscripción manual</h3>
          <p>
            Vincula un estudiante desde el
            panel administrativo.
          </p>
        </div>

        <form
          onSubmit={submitManualEnrollment}
        >
          <select
            value={manualForm.userId}
            onChange={(event) =>
              setManualForm((current) => ({
                ...current,
                userId: event.target.value,
              }))
            }
          >
            <option value="">
              Seleccionar estudiante
            </option>

            {students.map((student) => (
              <option
                key={student.id}
                value={student.id}
              >
                {student.name} —{' '}
                {student.email}
              </option>
            ))}
          </select>

          <select
            value={manualForm.courseId}
            onChange={(event) =>
              setManualForm((current) => ({
                ...current,
                courseId:
                  event.target.value,
              }))
            }
          >
            <option value="">
              Seleccionar curso
            </option>

            {courses.map((course) => (
              <option
                key={course.id}
                value={course.id}
              >
                {course.title}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="platform-button platform-button-primary"
          >
            <PlatformIcon
              name="plus"
              size={18}
            />
            Inscribir
          </button>
        </form>
      </section>

      {message && (
        <div
          className={[
            'platform-alert',
            message.type,
          ].join(' ')}
        >
          {message.text}
        </div>
      )}

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
            placeholder="Buscar estudiante o curso"
          />
        </div>

        <select
          value={courseFilter}
          onChange={(event) =>
            setCourseFilter(
              event.target.value,
            )
          }
        >
          <option value="all">
            Todos los cursos
          </option>

          {courses.map((course) => (
            <option
              key={course.id}
              value={course.id}
            >
              {course.title}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value,
            )
          }
        >
          <option value="all">
            Todos los estados
          </option>
          <option value="active">
            En progreso
          </option>
          <option value="completed">
            Completado
          </option>
        </select>
      </section>

      <section className="admin-enrollment-table">
        <div className="admin-enrollment-table-head">
          <span>Estudiante</span>
          <span>Curso</span>
          <span>Progreso</span>
          <span>Asistencia</span>
          <span>Nota</span>
          <span>Estado</span>
          <span>Acciones</span>
        </div>

        {filteredEnrollments.map(
          (enrollment) => {
            const student = users.find(
              (user) =>
                user.id === enrollment.userId,
            );

            const course = getCourseById(
              enrollment.courseId,
            );

            const progress =
              getCourseProgress(
                enrollment.userId,
                enrollment.courseId,
              );

            return (
              <article
                className="admin-enrollment-table-row"
                key={enrollment.id}
              >
                <div className="admin-student-main">
                  <span>
                    {getInitials(
                      student?.name ?? '',
                    )}
                  </span>

                  <div>
                    <strong>
                      {student?.name ??
                        'Usuario no disponible'}
                    </strong>
                    <small>
                      {student?.email}
                    </small>
                  </div>
                </div>

                <div className="admin-enrollment-course">
                  <strong>
                    {course?.title ??
                      'Curso no disponible'}
                  </strong>

                  <span>
                    Desde{' '}
                    {formatDate(
                      enrollment.enrolledAt,
                    )}
                  </span>
                </div>

                <div className="admin-enrollment-progress">
                  <div>
                    <span
                      style={{
                        width: `${progress.percentage}%`,
                      }}
                    />
                  </div>

                  <strong>
                    {progress.percentage}%
                  </strong>
                </div>

                <input
                  className="admin-table-number-input"
                  type="number"
                  min="0"
                  max="100"
                  value={
                    enrollment.attendance ?? ''
                  }
                  onChange={(event) =>
                    updateAcademicValue(
                      enrollment.id,
                      'attendance',
                      event.target.value,
                    )
                  }
                />

                <input
                  className="admin-table-number-input"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={enrollment.grade ?? ''}
                  onChange={(event) =>
                    updateAcademicValue(
                      enrollment.id,
                      'grade',
                      event.target.value,
                    )
                  }
                />

                <span
                  className={[
                    'admin-status-badge',
                    enrollment.status,
                  ].join(' ')}
                >
                  {enrollment.status ===
                  'completed'
                    ? 'Completado'
                    : 'Activo'}
                </span>

                <div className="admin-enrollment-actions">
                  {enrollment.status ===
                  'active' ? (
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(
                          enrollment.id,
                          'completed',
                        )
                      }
                    >
                      Completar
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(
                          enrollment.id,
                          'active',
                        )
                      }
                    >
                      Reactivar
                    </button>
                  )}
                </div>
              </article>
            );
          },
        )}
      </section>
    </div>
  );
}