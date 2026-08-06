import { useEffect, useMemo, useState } from 'react';
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
    id: `lesson-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: '',
    type: 'video',
    minutes: 10,
    preview: false,
    summary: '',
    content: '',
    videoUrl: '',
    readingUrl: '',
    quizQuestions: '',
    assignmentInstructions: '',
    uploadEnabled: true,
    resources: [],
  };
}

function createBlankModule() {
  return {
    id: `module-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
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
    language: course.language ?? 'Español',
    durationLabel: course.durationLabel,
    price: course.price,
    isFree: course.isFree,
    status: course.status,
    featured: course.featured,
    certificate: course.certificate,
    cover: course.cover,
    instructorId: course.instructorId,
    learningOutcomesText: listToText(course.learningOutcomes),
    requirementsText: listToText(course.requirements),
    audienceText: listToText(course.audience),
    modules: course.modules.map((module) => ({
      ...module,
      lessons: module.lessons.map((lesson) => ({
        ...createBlankLesson(),
        ...lesson,
        resources: lesson.resources ?? [],
      })),
    })),
  };
}

function RequiredMark() {
  return <span className="required-mark">*</span>;
}

export default function AdminCourseEditor() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const { instructors, getCourseById, createCourse, updateCourse } = usePlatform();
  const existingCourse = courseId ? getCourseById(courseId) : null;
  const isEditing = Boolean(courseId);

  const [activeTab, setActiveTab] = useState('general');
  const [form, setForm] = useState(existingCourse ? mapCourseToForm(existingCourse) : blankCourse);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (existingCourse) {
      setForm(mapCourseToForm(existingCourse));
    }
  }, [existingCourse]);

  const lessonCount = useMemo(
    () => form.modules.reduce((total, module) => total + module.lessons.length, 0),
    [form.modules],
  );

  if (isEditing && !existingCourse) {
    return <Navigate to="/admin/cursos" replace />;
  }

  function updateField(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => {
      const next = {
        ...current,
        [name]: type === 'checkbox' ? checked : value,
      };

      if (name === 'title') {
        next.slug = slugify(value);
      }

      if (name === 'isFree' && checked) {
        next.price = 0;
      }

      return next;
    });

    setMessage(null);
  }

  function clearInputs() {
    setForm(isEditing && existingCourse ? mapCourseToForm(existingCourse) : blankCourse);
    setActiveTab('general');
    setMessage({ type: 'success', text: 'Formulario limpiado.' });
  }

  function addModule() {
    setForm((current) => ({ ...current, modules: [...current.modules, createBlankModule()] }));
  }

  function updateModule(moduleIndex, field, value) {
    setForm((current) => ({
      ...current,
      modules: current.modules.map((module, index) =>
        index === moduleIndex ? { ...module, [field]: value } : module,
      ),
    }));
  }

  function removeModule(moduleIndex) {
    if (!window.confirm('¿Eliminar este módulo y todas sus clases?')) return;
    setForm((current) => ({
      ...current,
      modules: current.modules.filter((_, index) => index !== moduleIndex),
    }));
  }

  function addLesson(moduleIndex) {
    setForm((current) => ({
      ...current,
      modules: current.modules.map((module, index) =>
        index === moduleIndex
          ? { ...module, lessons: [...module.lessons, createBlankLesson()] }
          : module,
      ),
    }));
  }

  function updateLesson(moduleIndex, lessonIndex, field, value) {
    setForm((current) => ({
      ...current,
      modules: current.modules.map((module, currentModuleIndex) =>
        currentModuleIndex === moduleIndex
          ? {
              ...module,
              lessons: module.lessons.map((lesson, currentLessonIndex) =>
                currentLessonIndex === lessonIndex ? { ...lesson, [field]: value } : lesson,
              ),
            }
          : module,
      ),
    }));
  }

  function addResource(moduleIndex, lessonIndex) {
    setForm((current) => ({
      ...current,
      modules: current.modules.map((module, currentModuleIndex) =>
        currentModuleIndex === moduleIndex
          ? {
              ...module,
              lessons: module.lessons.map((lesson, currentLessonIndex) =>
                currentLessonIndex === lessonIndex
                  ? {
                      ...lesson,
                      resources: [
                        ...(lesson.resources ?? []),
                        { id: `res-${Date.now()}`, name: '', type: 'PDF', size: '', url: '' },
                      ],
                    }
                  : lesson,
              ),
            }
          : module,
      ),
    }));
  }

  function updateResource(moduleIndex, lessonIndex, resourceIndex, field, value) {
    setForm((current) => ({
      ...current,
      modules: current.modules.map((module, currentModuleIndex) =>
        currentModuleIndex === moduleIndex
          ? {
              ...module,
              lessons: module.lessons.map((lesson, currentLessonIndex) =>
                currentLessonIndex === lessonIndex
                  ? {
                      ...lesson,
                      resources: (lesson.resources ?? []).map((resource, currentResourceIndex) =>
                        currentResourceIndex === resourceIndex ? { ...resource, [field]: value } : resource,
                      ),
                    }
                  : lesson,
              ),
            }
          : module,
      ),
    }));
  }

  function removeLesson(moduleIndex, lessonIndex) {
    setForm((current) => ({
      ...current,
      modules: current.modules.map((module, currentModuleIndex) =>
        currentModuleIndex === moduleIndex
          ? { ...module, lessons: module.lessons.filter((_, currentLessonIndex) => currentLessonIndex !== lessonIndex) }
          : module,
      ),
    }));
  }

  function validateForm() {
    if (!form.title.trim()) return 'El curso necesita un título.';
    if (!form.subtitle.trim()) return 'Agrega un subtítulo.';
    if (!form.description.trim()) return 'Agrega una descripción.';
    if (!form.category.trim()) return 'Selecciona una categoría.';
    if (!form.durationLabel.trim()) return 'Indica la duración en horas.';
    if (!form.instructorId) return 'Selecciona un instructor.';
    if (!form.isFree && Number(form.price) <= 0) return 'Los cursos pagos necesitan un precio válido.';

    for (let moduleIndex = 0; moduleIndex < form.modules.length; moduleIndex += 1) {
      const module = form.modules[moduleIndex];
      if (!module.title.trim()) return `El módulo ${moduleIndex + 1} necesita un título.`;

      for (let lessonIndex = 0; lessonIndex < module.lessons.length; lessonIndex += 1) {
        const lesson = module.lessons[lessonIndex];
        if (!lesson.title.trim()) return `La clase ${lessonIndex + 1} del módulo ${moduleIndex + 1} necesita un título.`;
        if (lesson.type === 'video' && !lesson.videoUrl.trim()) return `La clase ${lessonIndex + 1} necesita una URL o referencia de video.`;
        if (lesson.type === 'quiz' && !lesson.quizQuestions.trim()) return `La evaluación ${lessonIndex + 1} necesita preguntas o instrucciones.`;
        if (lesson.type === 'assignment' && !lesson.assignmentInstructions.trim()) return `La actividad ${lessonIndex + 1} necesita instrucciones de entrega.`;
      }
    }

    return '';
  }

  function buildPayload(statusOverride) {
    return {
      title: form.title.trim(),
      slug: slugify(form.title),
      subtitle: form.subtitle.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      level: 'General',
      modality: 'Virtual',
      language: form.language,
      durationLabel: form.durationLabel.trim(),
      price: form.isFree ? 0 : Number(form.price || 0),
      isFree: form.isFree,
      status: statusOverride ?? form.status,
      featured: form.featured,
      certificate: true,
      cover: form.cover.trim() || foundationImages.youthPercussion,
      instructorId: form.instructorId,
      learningOutcomes: textToList(form.learningOutcomesText),
      requirements: textToList(form.requirementsText),
      audience: textToList(form.audienceText),
      modules: form.modules,
    };
  }

  function saveCourse(statusOverride) {
    const validationMessage = validateForm();
    if (validationMessage) {
      setMessage({ type: 'warning', text: validationMessage });
      return;
    }

    const payload = buildPayload(statusOverride);

    if (isEditing) {
      updateCourse(courseId, payload);
      setMessage({ type: 'success', text: statusOverride === 'published' ? 'Curso publicado.' : 'Borrador guardado.' });
      return;
    }

    const createdCourse = createCourse(payload);
    setMessage({ type: 'success', text: statusOverride === 'published' ? 'Curso publicado.' : 'Borrador guardado.' });
    navigate(`/admin/cursos/${createdCourse.id}/editar`, { replace: true });
  }

  function renderLessonSpecificFields(lesson, moduleIndex, lessonIndex) {
    if (lesson.type === 'video') {
      return (
        <div className="platform-field full">
          <label>URL o referencia del video <RequiredMark /></label>
          <input
            type="url"
            value={lesson.videoUrl ?? ''}
            onChange={(event) => updateLesson(moduleIndex, lessonIndex, 'videoUrl', event.target.value)}
            placeholder="https://..."
          />
        </div>
      );
    }

    if (lesson.type === 'reading') {
      return (
        <div className="platform-field full">
          <label>URL del documento o lectura</label>
          <input
            type="url"
            value={lesson.readingUrl ?? ''}
            onChange={(event) => updateLesson(moduleIndex, lessonIndex, 'readingUrl', event.target.value)}
            placeholder="https://..."
          />
        </div>
      );
    }

    if (lesson.type === 'quiz') {
      return (
        <div className="platform-field full">
          <label>Preguntas o estructura de evaluación <RequiredMark /></label>
          <textarea
            rows="5"
            value={lesson.quizQuestions ?? ''}
            onChange={(event) => updateLesson(moduleIndex, lessonIndex, 'quizQuestions', event.target.value)}
            placeholder="Pregunta 1; opciones; respuesta correcta; retroalimentación..."
          />
        </div>
      );
    }

    if (lesson.type === 'assignment' || lesson.type === 'practice') {
      return (
        <div className="platform-field full">
          <label>Instrucciones de entrega {lesson.type === 'assignment' && <RequiredMark />}</label>
          <textarea
            rows="5"
            value={lesson.assignmentInstructions ?? ''}
            onChange={(event) => updateLesson(moduleIndex, lessonIndex, 'assignmentInstructions', event.target.value)}
            placeholder="Indica formato aceptado, duración, criterios de entrega y observaciones."
          />
        </div>
      );
    }

    return null;
  }

  return (
    <div className="admin-course-editor-page">
      <section className="admin-editor-header">
        <div>
          <nav className="admin-editor-breadcrumb">
            <Link to="/admin/cursos">Cursos</Link>
            <PlatformIcon name="chevronRight" size={15} />
            <span>{isEditing ? 'Editar curso' : 'Nuevo curso'}</span>
          </nav>
          <h2>{isEditing ? form.title : 'Crear curso'}</h2>
          <p>Configura datos generales, módulos, clases, recursos, evidencias y acceso.</p>
        </div>

        <div className="admin-editor-actions">
          <button type="button" className="platform-button platform-button-ghost" onClick={clearInputs}>
            Cancelar / limpiar
          </button>
          <button type="button" className="platform-button platform-button-dark" onClick={() => saveCourse('draft')}>
            Guardar borrador
          </button>
          <button type="button" className="platform-button platform-button-primary" onClick={() => saveCourse('published')}>
            Publicar curso
          </button>
        </div>
      </section>

      {message && <div className={['platform-alert', message.type, 'admin-editor-message'].join(' ')}>{message.text}</div>}

      <nav className="admin-editor-tabs">
        <button type="button" className={activeTab === 'general' ? 'active' : ''} onClick={() => setActiveTab('general')}>
          Información general
        </button>
        <button type="button" className={activeTab === 'content' ? 'active' : ''} onClick={() => setActiveTab('content')}>
          Contenido <span>{form.modules.length} módulos · {lessonCount} clases</span>
        </button>
        <button type="button" className={activeTab === 'access' ? 'active' : ''} onClick={() => setActiveTab('access')}>
          Precio y acceso
        </button>
      </nav>

      {activeTab === 'general' && (
        <div className="admin-editor-layout">
          <section className="admin-editor-main">
            <article className="admin-form-card">
              <div className="admin-form-heading">
                <h3>Información principal</h3>
                <p>Los campos con asterisco son obligatorios. La URL se genera automáticamente a partir del título.</p>
              </div>

              <div className="admin-form-grid">
                <div className="platform-field full">
                  <label htmlFor="title">Título del curso <RequiredMark /></label>
                  <input id="title" name="title" value={form.title} onChange={updateField} placeholder="Ej: Percusión folklórica del Caribe" />
                </div>

                <div className="platform-field full">
                  <label htmlFor="slug">Dirección URL</label>
                  <div className="admin-slug-control">
                    <span>/cursos/</span>
                    <input id="slug" name="slug" value={form.slug} readOnly aria-readonly="true" placeholder="se-genera-con-el-titulo" />
                  </div>
                </div>

                <div className="platform-field full">
                  <label htmlFor="subtitle">Subtítulo <RequiredMark /></label>
                  <input id="subtitle" name="subtitle" value={form.subtitle} onChange={updateField} placeholder="Resumen breve del curso" />
                </div>

                <div className="platform-field full">
                  <label htmlFor="description">Descripción completa <RequiredMark /></label>
                  <textarea id="description" name="description" rows="5" value={form.description} onChange={updateField} placeholder="Describe el curso, su enfoque, contenidos y forma de trabajo." />
                </div>

                <div className="platform-field">
                  <label htmlFor="category">Categoría <RequiredMark /></label>
                  <input id="category" name="category" value={form.category} onChange={updateField} />
                </div>

                <div className="platform-field">
                  <label htmlFor="durationLabel">Duración en horas <RequiredMark /></label>
                  <input id="durationLabel" name="durationLabel" value={form.durationLabel} onChange={updateField} placeholder="Ej: 24 horas" />
                </div>

                <div className="platform-field">
                  <label htmlFor="instructorId">Instructor <RequiredMark /></label>
                  <select id="instructorId" name="instructorId" value={form.instructorId} onChange={updateField}>
                    {instructors.map((instructor) => <option key={instructor.id} value={instructor.id}>{instructor.name}</option>)}
                  </select>
                </div>

                <div className="platform-field">
                  <label htmlFor="cover">Imagen de portada</label>
                  <input id="cover" name="cover" value={form.cover} onChange={updateField} placeholder="URL o import existente" />
                </div>

                <div className="platform-field full">
                  <label htmlFor="learningOutcomesText">Resultados esperados</label>
                  <textarea id="learningOutcomesText" name="learningOutcomesText" rows="4" value={form.learningOutcomesText} onChange={updateField} placeholder="Un resultado por línea" />
                </div>

                <div className="platform-field full">
                  <label htmlFor="requirementsText">Requisitos</label>
                  <textarea id="requirementsText" name="requirementsText" rows="3" value={form.requirementsText} onChange={updateField} placeholder="Un requisito por línea" />
                </div>

                <div className="platform-field full">
                  <label htmlFor="audienceText">Público objetivo</label>
                  <textarea id="audienceText" name="audienceText" rows="3" value={form.audienceText} onChange={updateField} placeholder="Un perfil por línea" />
                </div>
              </div>
            </article>
          </section>

          <aside className="admin-editor-sidebar">
            <article className="admin-form-card admin-publish-summary">
              <div className="admin-form-heading"><h3>Vista previa</h3></div>
              <img src={form.cover || foundationImages.youthPercussion} alt="Portada" />
              <h4>{form.title || 'Curso sin título'}</h4>
              <p>{form.subtitle || 'Agrega un subtítulo para presentar el curso.'}</p>
              <dl>
                <div><dt>Acceso</dt><dd>{form.isFree ? 'Gratuito' : 'Pago'}</dd></div>
                <div><dt>Duración</dt><dd>{form.durationLabel || 'Pendiente'}</dd></div>
                <div><dt>Módulos</dt><dd>{form.modules.length}</dd></div>
                <div><dt>Clases</dt><dd>{lessonCount}</dd></div>
              </dl>
            </article>
          </aside>
        </div>
      )}

      {activeTab === 'content' && (
        <section className="admin-editor-main full-width">
          <article className="admin-form-card">
            <div className="admin-form-heading with-action">
              <div>
                <h3>Módulos y clases</h3>
                <p>Agrega información específica según el tipo de clase: video, lectura, evaluación, práctica o tarea.</p>
              </div>
              <button type="button" className="platform-button platform-button-primary" onClick={addModule}>
                <PlatformIcon name="plus" size={18} /> Agregar módulo
              </button>
            </div>
          </article>

          {form.modules.length === 0 ? (
            <section className="admin-builder-empty">
              <PlatformIcon name="lessons" size={42} />
              <h3>No hay módulos registrados.</h3>
              <p>Agrega el primer módulo para comenzar a organizar el curso.</p>
            </section>
          ) : (
            <div className="admin-module-builder-list">
              {form.modules.map((module, moduleIndex) => (
                <article className="admin-module-builder" key={module.id}>
                  <div className="admin-module-builder-header">
                    <span>Módulo {moduleIndex + 1}</span>
                    <button type="button" onClick={() => removeModule(moduleIndex)}>
                      <PlatformIcon name="trash" size={18} />
                    </button>
                  </div>

                  <div className="admin-form-grid">
                    <div className="platform-field full">
                      <label>Título del módulo <RequiredMark /></label>
                      <input value={module.title} onChange={(event) => updateModule(moduleIndex, 'title', event.target.value)} placeholder="Nombre del módulo" />
                    </div>
                    <div className="platform-field full">
                      <label>Descripción del módulo</label>
                      <textarea rows="3" value={module.description} onChange={(event) => updateModule(moduleIndex, 'description', event.target.value)} placeholder="Propósito y alcance del módulo" />
                    </div>
                  </div>

                  <div className="admin-lessons-builder-list">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <article className="admin-lesson-builder" key={lesson.id}>
                        <div className="admin-lesson-builder-fields">
                          <div className="admin-form-grid">
                            <div className="platform-field full">
                              <label>Título de la clase <RequiredMark /></label>
                              <input type="text" value={lesson.title} onChange={(event) => updateLesson(moduleIndex, lessonIndex, 'title', event.target.value)} placeholder="Nombre de la clase" />
                            </div>

                            <div className="platform-field">
                              <label>Tipo <RequiredMark /></label>
                              <select value={lesson.type} onChange={(event) => updateLesson(moduleIndex, lessonIndex, 'type', event.target.value)}>
                                <option value="video">Video</option>
                                <option value="reading">Lectura</option>
                                <option value="practice">Práctica</option>
                                <option value="quiz">Evaluación</option>
                                <option value="assignment">Tarea</option>
                              </select>
                            </div>

                            <div className="platform-field">
                              <label>Duración en minutos</label>
                              <input type="number" min="1" value={lesson.minutes} onChange={(event) => updateLesson(moduleIndex, lessonIndex, 'minutes', Number(event.target.value))} />
                            </div>

                            <div className="platform-field full">
                              <label>Resumen</label>
                              <input type="text" value={lesson.summary} onChange={(event) => updateLesson(moduleIndex, lessonIndex, 'summary', event.target.value)} placeholder="Descripción corta" />
                            </div>

                            <div className="platform-field full">
                              <label>Contenido o indicaciones generales</label>
                              <textarea rows="4" value={lesson.content} onChange={(event) => updateLesson(moduleIndex, lessonIndex, 'content', event.target.value)} placeholder="Contenido principal de la clase" />
                            </div>

                            {renderLessonSpecificFields(lesson, moduleIndex, lessonIndex)}
                          </div>

                          <div className="admin-resource-builder">
                            <div className="admin-form-heading with-action compact-heading">
                              <div><h3>Recursos de apoyo</h3></div>
                              <button type="button" onClick={() => addResource(moduleIndex, lessonIndex)}>
                                <PlatformIcon name="plus" size={16} /> Agregar recurso
                              </button>
                            </div>

                            {(lesson.resources ?? []).map((resource, resourceIndex) => (
                              <div className="admin-form-grid compact-resource-grid" key={resource.id}>
                                <div className="platform-field"><label>Nombre</label><input value={resource.name} onChange={(event) => updateResource(moduleIndex, lessonIndex, resourceIndex, 'name', event.target.value)} /></div>
                                <div className="platform-field"><label>Tipo</label><input value={resource.type} onChange={(event) => updateResource(moduleIndex, lessonIndex, resourceIndex, 'type', event.target.value)} /></div>
                                <div className="platform-field"><label>URL</label><input value={resource.url ?? ''} onChange={(event) => updateResource(moduleIndex, lessonIndex, resourceIndex, 'url', event.target.value)} /></div>
                              </div>
                            ))}
                          </div>

                          <label className="platform-checkbox">
                            <input type="checkbox" checked={lesson.preview} onChange={(event) => updateLesson(moduleIndex, lessonIndex, 'preview', event.target.checked)} />
                            <span>Permitir vista previa pública</span>
                          </label>
                        </div>

                        <button type="button" className="admin-remove-lesson" title="Eliminar clase" onClick={() => removeLesson(moduleIndex, lessonIndex)}>
                          <PlatformIcon name="trash" size={18} />
                        </button>
                      </article>
                    ))}
                  </div>

                  <button type="button" className="admin-add-lesson-button" onClick={() => addLesson(moduleIndex)}>
                    <PlatformIcon name="plus" size={18} /> Agregar clase
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'access' && (
        <div className="admin-editor-layout">
          <section className="admin-editor-main">
            <article className="admin-form-card">
              <div className="admin-form-heading">
                <h3>Precio y acceso</h3>
                <p>Define si el curso es gratuito o de pago. Todo curso entrega certificado cuando cumple el avance requerido.</p>
              </div>

              <div className="admin-access-options">
                <label className={form.isFree ? 'selected' : ''}>
                  <input type="radio" name="courseAccess" checked={form.isFree} onChange={() => setForm((current) => ({ ...current, isFree: true, price: 0 }))} />
                  <span><strong>Curso gratuito</strong><small>Requiere registro, no pasa por pago.</small></span>
                </label>
                <label className={!form.isFree ? 'selected' : ''}>
                  <input type="radio" name="courseAccess" checked={!form.isFree} onChange={() => setForm((current) => ({ ...current, isFree: false }))} />
                  <span><strong>Curso de pago</strong><small>Se adquiere mediante carrito y pasarela.</small></span>
                </label>
              </div>

              {!form.isFree && (
                <div className="platform-field admin-price-field">
                  <label htmlFor="price">Precio en COP <RequiredMark /></label>
                  <input id="price" name="price" type="number" min="0" value={form.price} onChange={updateField} />
                </div>
              )}
            </article>

            <article className="admin-form-card">
              <div className="admin-form-heading"><h3>Visibilidad del catálogo</h3></div>
              <div className="admin-switch-list">
                <label>
                  <span><strong>Curso destacado</strong><small>Dar prioridad en el catálogo público.</small></span>
                  <input type="checkbox" name="featured" checked={form.featured} onChange={updateField} />
                </label>
              </div>
            </article>
          </section>

          <aside className="admin-editor-sidebar">
            <article className="admin-form-card admin-publish-summary">
              <div className="admin-form-heading"><h3>Publicación</h3></div>
              <p>Usa los botones superiores para guardar como borrador o publicar. No existe selector duplicado de estado.</p>
              <button type="button" className="platform-button platform-button-primary" onClick={() => saveCourse('published')}>
                Publicar curso
              </button>
            </article>
          </aside>
        </div>
      )}
    </div>
  );
}