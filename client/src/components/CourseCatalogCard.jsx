import { Link } from 'react-router-dom';
import {
  formatCurrency,
  getCourseDuration,
  getCourseLessonCount,
} from '../utils/formatters';
import PlatformIcon from './PlatformIcon';

export default function CourseCatalogCard({
  course,
  instructor,
  enrollment,
  onEnroll,
  onAddToCart,
}) {
  const lessonsCount =
    getCourseLessonCount(course);

  const duration = getCourseDuration(course);

  return (
    <article className="catalog-course-card">
      <Link
        to={`/cursos/${course.slug}`}
        className="catalog-course-cover"
      >
        <img
          src={course.cover}
          alt={course.title}
        />

        <span
          className={[
            'catalog-course-price-badge',
            course.isFree ? 'free' : 'paid',
          ].join(' ')}
        >
          {course.isFree
            ? 'Gratis'
            : formatCurrency(course.price)}
        </span>
      </Link>

      <div className="catalog-course-content">
        <div className="catalog-course-category">
          <span>{course.category}</span>
          <span>{course.level}</span>
        </div>

        <Link
          to={`/cursos/${course.slug}`}
          className="catalog-course-title"
        >
          {course.title}
        </Link>

        <p className="catalog-course-subtitle">
          {course.subtitle}
        </p>

        <div className="catalog-course-instructor">
          <img
            src={instructor?.avatar}
            alt={instructor?.name}
          />

          <span>
            {instructor?.name ??
              'Equipo Tamborito'}
          </span>
        </div>

        <div className="catalog-course-stats">
          <span>
            <PlatformIcon
              name="lessons"
              size={17}
            />
            {lessonsCount} clases
          </span>

          <span>
            <PlatformIcon
              name="clock"
              size={17}
            />
            {duration}
          </span>

          <span>
            <PlatformIcon
              name="star"
              size={17}
            />
            {course.rating || 'Nuevo'}
          </span>
        </div>

        <div className="catalog-course-actions">
          {enrollment ? (
            <Link
              to={`/campus/cursos/${course.id}`}
              className="platform-button platform-button-primary"
            >
              Continuar curso
            </Link>
          ) : course.isFree ? (
            <button
              type="button"
              className="platform-button platform-button-primary"
              onClick={() => onEnroll(course)}
            >
              Inscribirme gratis
            </button>
          ) : (
            <button
              type="button"
              className="platform-button platform-button-primary"
              onClick={() => onAddToCart(course)}
            >
              Agregar al carrito
            </button>
          )}

          <Link
            to={`/cursos/${course.slug}`}
            className="platform-button platform-button-ghost"
          >
            Ver detalles
          </Link>
        </div>
      </div>
    </article>
  );
}