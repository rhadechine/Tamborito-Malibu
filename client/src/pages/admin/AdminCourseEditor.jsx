import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Link,
  Navigate,
  useNavigate,
  useParams,
} from 'react-router-dom';
import PlatformIcon from '../../components/PlatformIcon';
import { usePlatform } from '../../context/PlatformContext';
import { foundationImages } from '../../data/foundationContent';
import { slugify } from '../../utils/formatters';

const blankCourse = {
  title: '',
  slug: '',
  subtitle: '',
  description: '',
  category: 'Música tradicional',
  level: 'Inicial',
  modality: 'Virtual',
  language: 'Español',
  durationLabel: '',
  price: 0,
  isFree: true,
  status: 'draft',
  featured: false,
  certificate: true,
  cover: foundationImages.youthPercussion,
  instructorId: 'ins-ramses',
  learningOutcomesText: '',
  requirementsText: '',
  audienceText: '',
  modules: [],
};

function createBlankLesson() {
  return {
    id: `lesson-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 6)}`,
    title: '',
    type: 'video',
    minutes: 10,
    preview: false,
    summary: '',
    content: '',
    resources: [],
  };
}

function createBlankModule() {
  return {
    id: `module-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 6)}`,
    title: '',
    description: '',
    lessons: [createBlankLesson()],
  };
}

function listToText(items = []) {
  return items.join('\n');
}

function textToList(value = '') {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function mapCourseToForm(course) {
  return {
    title: course.title,
    slug: course.slug,
    subtitle: course.subtitle,
    description: course.description,
    category: course.category,
    level: course.level,
    modality: course.modality,
    language: course.language,
    durationLabel: course.durationLabel,
    price: course.price,
    isFree: course.isFree,
    status: course.status,
    featured: course.featured,
    certificate: course.certificate,
    cover: course.cover,
    instructorId: course.instructorId,
    learningOutcomesText: listToText(
      course.learningOutcomes,
    ),
    requirementsText: listToText(
      course.requirements,
    ),
    audienceText: listToText(
      course.audience,
    ),
    modules: course.modules.map((module) => ({
      ...module,
      lessons: module.lessons.map(
        (lesson) => ({
          ...lesson,
          resources: lesson.resources ?? [],
        }),
      ),
    })),
  };
}

export default function AdminCourseEditor() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const {
    instructors,
    getCourseById,
    createCourse,
    updateCourse,
  } = usePlatform();

  const existingCourse = courseId
    ? getCourseById(courseId)
    : null;

  const isEditing = Boolean(courseId);

  const [activeTab, setActiveTab] =
    useState('general');

  const [form, setForm] = useState(
    existingCourse
      ? mapCourseToForm(existingCourse)
      : blankCourse,
  );

  const [message, setMessage] =
    useState(null);

  useEffect(() => {
    if (existingCourse) {
      setForm(mapCourseToForm(existingCourse));
    }
  }, [existingCourse]);

  const lessonCount = useMemo(
    () =>
      form.modules.reduce(
        (total, module) =>
          total + module.lessons.length,
        0,
      ),
    [form.modules],
  );

  if (isEditing && !existingCourse) {
    return (
      <Navigate to="/admin/cursos" replace />
    );
  }

  function updateField(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((current) => {
      const next = {
        ...current,
        [name]:
          type === 'checkbox'
            ? checked
            : value,
      };

      if (
        name === 'title' &&
        (!current.slug ||
          current.slug ===
            slugify(current.title))
      ) {
        next.slug = slugify(value);
      }

      if (name === 'isFree' && checked) {
        next.price = 0;
      }

      return next;
    });

    setMessage(null);
  }

  function addModule() {
    setForm((current) => ({
      ...current,
      modules: [
        ...current.modules,
        createBlankModule(),
      ],
    }));
  }

  function updateModule(
    moduleIndex,
    field,
    value,
  ) {
    setForm((current) => ({
      ...current,
      modules: current.modules.map(
        (module, index) =>
          index === moduleIndex
            ? {
                ...module,
                [field]: value,
              }
            : module,
      ),
    }));
  }

  function removeModule(moduleIndex) {
    const accepted = window.confirm(
      '¿Eliminar este módulo y todas sus clases?',
    );

    if (!accepted) {
      return;
    }

    setForm((current) => ({
      ...current,
      modules: current.modules.filter(
        (_, index) => index !== moduleIndex,
      ),
    }));
  }

  function addLesson(moduleIndex) {
    setForm((current) => ({
      ...current,
      modules: current.modules.map(
        (module, index) =>
          index === moduleIndex
            ? {
                ...module,
                lessons: [
                  ...module.lessons,
                  createBlankLesson(),
                ],
              }
            : module,
      ),
    }));
  }

  function updateLesson(
    moduleIndex,
    lessonIndex,
    field,
    value,
  ) {
    setForm((current) => ({
      ...current,
      modules: current.modules.map(
        (module, currentModuleIndex) =>
          currentModuleIndex === moduleIndex
            ? {
                ...module,
                lessons: module.lessons.map(
                  (
                    lesson,
                    currentLessonIndex,
                  ) =>
                    currentLessonIndex ===
                    lessonIndex
                      ? {
                          ...lesson,
                          [field]: value,
                        }
                      : lesson,
                ),
              }
            : module,
      ),
    }));
  }

  function removeLesson(
    moduleIndex,
    lessonIndex,
  ) {
    setForm((current) => ({
      ...current,
      modules: current.modules.map(
        (module, currentModuleIndex) =>
          currentModuleIndex === moduleIndex
            ? {
                ...module,
                lessons:
                  module.lessons.filter(
                    (
                      _,
                      currentLessonIndex,
                    ) =>
                      currentLessonIndex !==
                      lessonIndex,
                  ),
              }
            : module,
      ),
    }));
  }

  function validateForm() {
    if (!form.title.trim()) {
      return 'El curso necesita un título.';
    }

    if (!form.subtitle.trim()) {
      return 'Agrega un subtítulo.';
    }

    if (!form.description.trim()) {
      return 'Agrega una descripción.';
    }

    if (!form.category.trim()) {
      return 'Selecciona una categoría.';
    }

    if (!form.instructorId) {
      return 'Selecciona un instructor.';
    }

    if (!form.isFree && Number(form.price) <= 0) {
      return 'Los cursos pagos necesitan un precio válido.';
    }

    for (
      let moduleIndex = 0;
      moduleIndex < form.modules.length;
      moduleIndex += 1
    ) {
      const module = form.modules[moduleIndex];

      if (!module.title.trim()) {
        return `El módulo ${
          moduleIndex + 1
        } necesita un título.`;
      }

      for (
        let lessonIndex = 0;
        lessonIndex < module.lessons.length;
        lessonIndex += 1
      ) {
        if (
          !module.lessons[
            lessonIndex
          ].title.trim()
        ) {
          return `La clase ${
            lessonIndex + 1
          } del módulo ${
            moduleIndex + 1
          } necesita un título.`;
        }
      }
    }

    return '';
  }

  function buildPayload(statusOverride) {
    return {
      title: form.title.trim(),
      slug:
        form.slug.trim() ||
        slugify(form.title),
      subtitle: form.subtitle.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      level: form.level,
      modality: form.modality,
      language: form.language,
      durationLabel:
        form.durationLabel.trim(),
      price: form.isFree
        ? 0
        : Number(form.price || 0),
      isFree: form.isFree,
      status:
        statusOverride ?? form.status,
      featured: form.featured,
      certificate: form.certificate,
      cover:
        form.cover.trim() ||
        foundationImages.youthPercussion,
      instructorId: form.instructorId,
      learningOutcomes: textToList(
        form.learningOutcomesText,
      ),
      requirements: textToList(
        form.requirementsText,
      ),
      audience: textToList(
        form.audienceText,
      ),
      modules: form.modules,
    };
  }

  function saveCourse(statusOverride) {
    const validationMessage =
      validateForm();

    if (validationMessage) {
      setMessage({
        type: 'warning',
        text: validationMessage,
      });
      return;
    }

    const payload =
      buildPayload(statusOverride);

    if (isEditing) {
      updateCourse(courseId, payload);

      setMessage({
        type: 'success',
        text: 'Curso actualizado correctamente.',
      });

      return;
    }

    const createdCourse =
      createCourse(payload);

    navigate(
      `/admin/cursos/${createdCourse.id}/editar`,
      {
        replace: true,
      },
    );
  }

  return (
    <div className="admin-course-editor-page">
      <section className="admin-editor-header">
        <div>
          <nav className="admin-editor-breadcrumb">
            <Link to="/admin/cursos">
              Cursos
            </Link>

            <PlatformIcon
              name="chevronRight"
              size={15}
            />

            <span>
              {isEditing
                ? 'Editar curso'
                : 'Nuevo curso'}
            </span>
          </nav>

          <h2>
            {isEditing
              ? form.title
              : 'Crear una nueva ruta formativa'}
          </h2>

          <p>
            Configura información, contenido,
            módulos, clases y publicación.
          </p>
        </div>

        <div className="admin-editor-actions">
          <Link
            to="/admin/cursos"
            className="platform-button platform-button-ghost"
          >
            Cancelar
          </Link>

          <button
            type="button"
            className="platform-button platform-button-dark"
            onClick={() =>
              saveCourse('draft')
            }
          >
            Guardar borrador
          </button>

          <button
            type="button"
            className="platform-button platform-button-primary"
            onClick={() =>
              saveCourse('published')
            }
          >
            Publicar curso
          </button>
        </div>
      </section>

      {message && (
        <div
          className={[
            'platform-alert',
            message.type,
            'admin-editor-message',
          ].join(' ')}
        >
          {message.text}
        </div>
      )}

      <nav className="admin-editor-tabs">
        <button
          type="button"
          className={
            activeTab === 'general'
              ? 'active'
              : ''
          }
          onClick={() =>
            setActiveTab('general')
          }
        >
          Información general
        </button>

        <button
          type="button"
          className={
            activeTab === 'content'
              ? 'active'
              : ''
          }
          onClick={() =>
            setActiveTab('content')
          }
        >
          Contenido
          <span>
            {form.modules.length} módulos ·{' '}
            {lessonCount} clases
          </span>
        </button>

        <button
          type="button"
          className={
            activeTab === 'publishing'
              ? 'active'
              : ''
          }
          onClick={() =>
            setActiveTab('publishing')
          }
        >
          Acceso y publicación
        </button>
      </nav>

      {activeTab === 'general' && (
        <div className="admin-editor-layout">
          <section className="admin-editor-main">
            <article className="admin-form-card">
              <div className="admin-form-heading">
                <h3>Información principal</h3>
                <p>
                  Datos visibles en el catálogo
                  público.
                </p>
              </div>

              <div className="admin-form-grid">
                <div className="platform-field full">
                  <label htmlFor="title">
                    Título del curso
                  </label>

                  <input
                    id="title"
                    name="title"
                    value={form.title}
                    onChange={updateField}
                    placeholder="Ej: Percusión folklórica del Caribe"
                  />
                </div>

                <div className="platform-field full">
                  <label htmlFor="slug">
                    Dirección URL
                  </label>

                  <div className="admin-slug-control">
                    <span>/cursos/</span>

                    <input
                      id="slug"
                      name="slug"
                      value={form.slug}
                      onChange={updateField}
                      placeholder="nombre-del-curso"
                    />
                  </div>
                </div>

                <div className="platform-field full">
                  <label htmlFor="subtitle">
                    Subtítulo
                  </label>

                  <input
                    id="subtitle"
                    name="subtitle"
                    value={form.subtitle}
                    onChange={updateField}
                    placeholder="Resumen breve y atractivo"
                  />
                </div>

                <div className="platform-field full">
                  <label htmlFor="description">
                    Descripción completa
                  </label>

                  <textarea
                    id="description"
                    name="description"
                    rows="7"
                    value={form.description}
                    onChange={updateField}
                    placeholder="Explica el propósito, metodología y alcance del curso."
                  />
                </div>

                <div className="platform-field">
                  <label htmlFor="category">
                    Categoría
                  </label>

                  <input
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={updateField}
                    placeholder="Música tradicional"
                  />
                </div>

                <div className="platform-field">
                  <label htmlFor="level">
                    Nivel
                  </label>

                  <select
                    id="level"
                    name="level"
                    value={form.level}
                    onChange={updateField}
                  >
                    <option value="Inicial">
                      Inicial
                    </option>
                    <option value="Intermedio">
                      Intermedio
                    </option>
                    <option value="Avanzado">
                      Avanzado
                    </option>
                    <option value="Formativo">
                      Formativo
                    </option>
                    <option value="Complementario">
                      Complementario
                    </option>
                  </select>
                </div>

                <div className="platform-field">
                  <label htmlFor="modality">
                    Modalidad
                  </label>

                  <select
                    id="modality"
                    name="modality"
                    value={form.modality}
                    onChange={updateField}
                  >
                    <option value="Virtual">
                      Virtual
                    </option>
                    <option value="Presencial">
                      Presencial
                    </option>
                    <option value="Mixta">
                      Mixta
                    </option>
                  </select>
                </div>

                <div className="platform-field">
                  <label htmlFor="durationLabel">
                    Duración estimada
                  </label>

                  <input
                    id="durationLabel"
                    name="durationLabel"
                    value={form.durationLabel}
                    onChange={updateField}
                    placeholder="8 semanas"
                  />
                </div>

                <div className="platform-field">
                  <label htmlFor="language">
                    Idioma
                  </label>

                  <input
                    id="language"
                    name="language"
                    value={form.language}
                    onChange={updateField}
                  />
                </div>

                <div className="platform-field">
                  <label htmlFor="instructorId">
                    Instructor
                  </label>

                  <select
                    id="instructorId"
                    name="instructorId"
                    value={form.instructorId}
                    onChange={updateField}
                  >
                    {instructors.map(
                      (instructor) => (
                        <option
                          key={instructor.id}
                          value={instructor.id}
                        >
                          {instructor.name}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </div>
            </article>

            <article className="admin-form-card">
              <div className="admin-form-heading">
                <h3>
                  Resultados y requisitos
                </h3>

                <p>
                  Escribe un elemento por cada
                  línea.
                </p>
              </div>

              <div className="admin-form-grid">
                <div className="platform-field full">
                  <label htmlFor="learningOutcomesText">
                    Qué aprenderá el estudiante
                  </label>

                  <textarea
                    id="learningOutcomesText"
                    name="learningOutcomesText"
                    rows="6"
                    value={
                      form.learningOutcomesText
                    }
                    onChange={updateField}
                    placeholder={`Reconocer ritmos tradicionales\nInterpretar patrones básicos\nParticipar en un ensamble`}
                  />
                </div>

                <div className="platform-field full">
                  <label htmlFor="requirementsText">
                    Requisitos
                  </label>

                  <textarea
                    id="requirementsText"
                    name="requirementsText"
                    rows="5"
                    value={form.requirementsText}
                    onChange={updateField}
                    placeholder={`No requiere experiencia previa\nDisposición para practicar`}
                  />
                </div>

                <div className="platform-field full">
                  <label htmlFor="audienceText">
                    Público objetivo
                  </label>

                  <textarea
                    id="audienceText"
                    name="audienceText"
                    rows="5"
                    value={form.audienceText}
                    onChange={updateField}
                    placeholder={`Niños y jóvenes\nDocentes\nComunidad general`}
                  />
                </div>
              </div>
            </article>
          </section>

          <aside className="admin-editor-sidebar">
            <article className="admin-form-card">
              <div className="admin-form-heading">
                <h3>Imagen de portada</h3>
              </div>

              <div className="admin-cover-preview">
                <img
                  src={
                    form.cover ||
                    foundationImages.youthPercussion
                  }
                  alt="Vista previa"
                />
              </div>

              <div className="platform-field">
                <label htmlFor="cover">
                  URL o ruta de imagen
                </label>

                <input
                  id="cover"
                  name="cover"
                  value={form.cover}
                  onChange={updateField}
                  placeholder="/src/assets/..."
                />
              </div>
            </article>

            <article className="admin-form-card">
              <div className="admin-form-heading">
                <h3>Resumen del contenido</h3>
              </div>

              <dl className="admin-editor-summary">
                <div>
                  <dt>Módulos</dt>
                  <dd>{form.modules.length}</dd>
                </div>

                <div>
                  <dt>Clases</dt>
                  <dd>{lessonCount}</dd>
                </div>

                <div>
                  <dt>Modalidad</dt>
                  <dd>{form.modality}</dd>
                </div>

                <div>
                  <dt>Estado</dt>
                  <dd>{form.status}</dd>
                </div>
              </dl>
            </article>
          </aside>
        </div>
      )}

      {activeTab === 'content' && (
        <section className="admin-content-builder">
          <div className="admin-builder-heading">
            <div>
              <p className="admin-page-eyebrow">
                Constructor del curso
              </p>

              <h3>Módulos y clases</h3>

              <p>
                Organiza la ruta en módulos y
                agrega videos, lecturas,
                prácticas, evaluaciones o
                entregas.
              </p>
            </div>

            <button
              type="button"
              className="platform-button platform-button-primary"
              onClick={addModule}
            >
              <PlatformIcon name="plus" size={18} />
              Agregar módulo
            </button>
          </div>

          {form.modules.length === 0 ? (
            <div className="admin-builder-empty">
              <PlatformIcon
                name="lessons"
                size={44}
              />

              <h3>
                Este curso todavía no tiene
                contenido.
              </h3>

              <p>
                Comienza creando el primer
                módulo.
              </p>

              <button
                type="button"
                className="platform-button platform-button-primary"
                onClick={addModule}
              >
                Crear primer módulo
              </button>
            </div>
          ) : (
            <div className="admin-module-builder-list">
              {form.modules.map(
                (module, moduleIndex) => (
                  <article
                    className="admin-module-builder"
                    key={module.id}
                  >
                    <header className="admin-module-builder-header">
                      <span>
                        {String(
                          moduleIndex + 1,
                        ).padStart(2, '0')}
                      </span>

                      <div>
                        <input
                          type="text"
                          value={module.title}
                          onChange={(event) =>
                            updateModule(
                              moduleIndex,
                              'title',
                              event.target.value,
                            )
                          }
                          placeholder={`Título del módulo ${
                            moduleIndex + 1
                          }`}
                        />

                        <textarea
                          rows="2"
                          value={
                            module.description
                          }
                          onChange={(event) =>
                            updateModule(
                              moduleIndex,
                              'description',
                              event.target.value,
                            )
                          }
                          placeholder="Descripción del módulo"
                        />
                      </div>

                      <button
                        type="button"
                        className="danger"
                        title="Eliminar módulo"
                        onClick={() =>
                          removeModule(moduleIndex)
                        }
                      >
                        <PlatformIcon
                          name="trash"
                          size={19}
                        />
                      </button>
                    </header>

                    <div className="admin-lesson-builder-list">
                      {module.lessons.map(
                        (
                          lesson,
                          lessonIndex,
                        ) => (
                          <article
                            className="admin-lesson-builder"
                            key={lesson.id}
                          >
                            <span className="admin-lesson-order">
                              {lessonIndex + 1}
                            </span>

                            <div className="admin-lesson-builder-fields">
                              <div className="admin-form-grid">
                                <div className="platform-field full">
                                  <label>
                                    Título de la clase
                                  </label>

                                  <input
                                    type="text"
                                    value={
                                      lesson.title
                                    }
                                    onChange={(
                                      event,
                                    ) =>
                                      updateLesson(
                                        moduleIndex,
                                        lessonIndex,
                                        'title',
                                        event.target
                                          .value,
                                      )
                                    }
                                    placeholder="Nombre de la clase"
                                  />
                                </div>

                                <div className="platform-field">
                                  <label>
                                    Tipo
                                  </label>

                                  <select
                                    value={
                                      lesson.type
                                    }
                                    onChange={(
                                      event,
                                    ) =>
                                      updateLesson(
                                        moduleIndex,
                                        lessonIndex,
                                        'type',
                                        event.target
                                          .value,
                                      )
                                    }
                                  >
                                    <option value="video">
                                      Video
                                    </option>
                                    <option value="reading">
                                      Lectura
                                    </option>
                                    <option value="practice">
                                      Práctica
                                    </option>
                                    <option value="quiz">
                                      Evaluación
                                    </option>
                                    <option value="assignment">
                                      Actividad
                                    </option>
                                  </select>
                                </div>

                                <div className="platform-field">
                                  <label>
                                    Duración
                                  </label>

                                  <input
                                    type="number"
                                    min="1"
                                    value={
                                      lesson.minutes
                                    }
                                    onChange={(
                                      event,
                                    ) =>
                                      updateLesson(
                                        moduleIndex,
                                        lessonIndex,
                                        'minutes',
                                        Number(
                                          event.target
                                            .value,
                                        ),
                                      )
                                    }
                                  />
                                </div>

                                <div className="platform-field full">
                                  <label>
                                    Resumen
                                  </label>

                                  <input
                                    type="text"
                                    value={
                                      lesson.summary
                                    }
                                    onChange={(
                                      event,
                                    ) =>
                                      updateLesson(
                                        moduleIndex,
                                        lessonIndex,
                                        'summary',
                                        event.target
                                          .value,
                                      )
                                    }
                                    placeholder="Descripción corta"
                                  />
                                </div>

                                <div className="platform-field full">
                                  <label>
                                    Contenido o indicaciones
                                  </label>

                                  <textarea
                                    rows="4"
                                    value={
                                      lesson.content
                                    }
                                    onChange={(
                                      event,
                                    ) =>
                                      updateLesson(
                                        moduleIndex,
                                        lessonIndex,
                                        'content',
                                        event.target
                                          .value,
                                      )
                                    }
                                    placeholder="Contenido principal de la clase"
                                  />
                                </div>
                              </div>

                              <label className="platform-checkbox">
                                <input
                                  type="checkbox"
                                  checked={
                                    lesson.preview
                                  }
                                  onChange={(
                                    event,
                                  ) =>
                                    updateLesson(
                                      moduleIndex,
                                      lessonIndex,
                                      'preview',
                                      event.target
                                        .checked,
                                    )
                                  }
                                />

                                <span>
                                  Permitir vista previa
                                  pública
                                </span>
                              </label>
                            </div>

                            <button
                              type="button"
                              className="admin-remove-lesson"
                              title="Eliminar clase"
                              onClick={() =>
                                removeLesson(
                                  moduleIndex,
                                  lessonIndex,
                                )
                              }
                            >
                              <PlatformIcon
                                name="trash"
                                size={18}
                              />
                            </button>
                          </article>
                        ),
                      )}
                    </div>

                    <button
                      type="button"
                      className="admin-add-lesson-button"
                      onClick={() =>
                        addLesson(moduleIndex)
                      }
                    >
                      <PlatformIcon
                        name="plus"
                        size={18}
                      />
                      Agregar clase
                    </button>
                  </article>
                ),
              )}
            </div>
          )}
        </section>
      )}

      {activeTab === 'publishing' && (
        <div className="admin-editor-layout">
          <section className="admin-editor-main">
            <article className="admin-form-card">
              <div className="admin-form-heading">
                <h3>Precio y acceso</h3>
                <p>
                  Define si el curso es gratuito
                  o requiere compra.
                </p>
              </div>

              <div className="admin-access-options">
                <label
                  className={
                    form.isFree
                      ? 'selected'
                      : ''
                  }
                >
                  <input
                    type="radio"
                    name="courseAccess"
                    checked={form.isFree}
                    onChange={() =>
                      setForm((current) => ({
                        ...current,
                        isFree: true,
                        price: 0,
                      }))
                    }
                  />

                  <span>
                    <strong>
                      Curso gratuito
                    </strong>
                    <small>
                      Requiere registro, pero no
                      pasa por el carrito.
                    </small>
                  </span>
                </label>

                <label
                  className={
                    !form.isFree
                      ? 'selected'
                      : ''
                  }
                >
                  <input
                    type="radio"
                    name="courseAccess"
                    checked={!form.isFree}
                    onChange={() =>
                      setForm((current) => ({
                        ...current,
                        isFree: false,
                      }))
                    }
                  />

                  <span>
                    <strong>Curso pago</strong>
                    <small>
                      Se adquiere mediante
                      carrito y pasarela.
                    </small>
                  </span>
                </label>
              </div>

              {!form.isFree && (
                <div className="platform-field admin-price-field">
                  <label htmlFor="price">
                    Precio en COP
                  </label>

                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={updateField}
                  />
                </div>
              )}
            </article>

            <article className="admin-form-card">
              <div className="admin-form-heading">
                <h3>Opciones académicas</h3>
              </div>

              <div className="admin-switch-list">
                <label>
                  <span>
                    <strong>
                      Emitir certificado
                    </strong>
                    <small>
                      Generar constancia al
                      completar todas las
                      clases.
                    </small>
                  </span>

                  <input
                    type="checkbox"
                    name="certificate"
                    checked={form.certificate}
                    onChange={updateField}
                  />
                </label>

                <label>
                  <span>
                    <strong>
                      Curso destacado
                    </strong>
                    <small>
                      Dar prioridad en el
                      catálogo público.
                    </small>
                  </span>

                  <input
                    type="checkbox"
                    name="featured"
                    checked={form.featured}
                    onChange={updateField}
                  />
                </label>
              </div>
            </article>

            <article className="admin-form-card">
              <div className="admin-form-heading">
                <h3>Estado de publicación</h3>
              </div>

              <div className="platform-field">
                <label htmlFor="status">
                  Estado actual
                </label>

                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={updateField}
                >
                  <option value="draft">
                    Borrador
                  </option>
                  <option value="published">
                    Publicado
                  </option>
                  <option value="archived">
                    Archivado
                  </option>
                </select>
              </div>
            </article>
          </section>

          <aside className="admin-editor-sidebar">
            <article className="admin-form-card admin-publish-summary">
              <div className="admin-form-heading">
                <h3>Resumen de publicación</h3>
              </div>

              <img
                src={
                  form.cover ||
                  foundationImages.youthPercussion
                }
                alt="Portada"
              />

              <h4>
                {form.title ||
                  'Curso sin título'}
              </h4>

              <p>
                {form.subtitle ||
                  'Agrega un subtítulo para presentar el curso.'}
              </p>

              <dl>
                <div>
                  <dt>Acceso</dt>
                  <dd>
                    {form.isFree
                      ? 'Gratuito'
                      : 'Pago'}
                  </dd>
                </div>

                <div>
                  <dt>Módulos</dt>
                  <dd>{form.modules.length}</dd>
                </div>

                <div>
                  <dt>Clases</dt>
                  <dd>{lessonCount}</dd>
                </div>

                <div>
                  <dt>Estado</dt>
                  <dd>{form.status}</dd>
                </div>
              </dl>

              <button
                type="button"
                className="platform-button platform-button-primary"
                onClick={() =>
                  saveCourse('published')
                }
              >
                Publicar curso
              </button>
            </article>
          </aside>
        </div>
      )}
    </div>
  );
}