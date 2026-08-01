export function formatCurrency(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatDate(value, options = {}) {
  if (!value) {
    return 'Sin fecha';
  }

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(new Date(value));
}

export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function slugify(value = '') {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function getCourseLessonCount(course) {
  return (
    course?.modules?.reduce(
      (total, module) => total + module.lessons.length,
      0,
    ) || 0
  );
}

export function getCourseDuration(course) {
  const totalMinutes =
    course?.modules?.reduce(
      (moduleTotal, module) =>
        moduleTotal +
        module.lessons.reduce(
          (lessonTotal, lesson) =>
            lessonTotal + Number(lesson.minutes || 0),
          0,
        ),
      0,
    ) || 0;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (!hours) {
    return `${minutes} min`;
  }

  if (!minutes) {
    return `${hours} h`;
  }

  return `${hours} h ${minutes} min`;
}