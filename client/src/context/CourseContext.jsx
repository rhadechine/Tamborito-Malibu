import { createContext, useContext, useMemo, useState } from 'react';
import { foundationImages, publicCourses } from '../data/foundationContent';

const COURSES_KEY = 'tamborito_courses_v1';

const demoPrices = {
  'aprendizaje-sonoro': 120000,
  'ensamble-cultural': 180000,
  'formacion-docente': 90000,
};

function formatPrice(value) {
  const numberValue = Number(value ?? 0);

  if (numberValue <= 0) {
    return 'Gratis';
  }

  return `$${numberValue.toLocaleString('es-CO')} COP`;
}

function normalizeCourses() {
  return publicCourses.map((course) => {
    const priceValue = course.type === 'Pago' ? demoPrices[course.id] ?? 100000 : 0;

    return {
      ...course,
      priceValue,
      price: course.type === 'Pago' ? formatPrice(priceValue) : 'Gratis',
      isPublished: true,
      createdAt: '2026-07-26',
    };
  });
}

function readCourses() {
  const storedCourses = localStorage.getItem(COURSES_KEY);

  if (!storedCourses) {
    const initialCourses = normalizeCourses();
    localStorage.setItem(COURSES_KEY, JSON.stringify(initialCourses));
    return initialCourses;
  }

  try {
    return JSON.parse(storedCourses);
  } catch {
    const initialCourses = normalizeCourses();
    localStorage.setItem(COURSES_KEY, JSON.stringify(initialCourses));
    return initialCourses;
  }
}

const CourseContext = createContext(null);

export function CourseProvider({ children }) {
  const [courses, setCourses] = useState(readCourses);

  function persistCourses(nextCourses) {
    setCourses(nextCourses);
    localStorage.setItem(COURSES_KEY, JSON.stringify(nextCourses));
  }

  function createCourse(payload) {
    const priceValue = payload.type === 'Pago' ? Number(payload.priceValue || 0) : 0;

    const newCourse = {
      id: `curso-${Date.now()}`,
      title: payload.title,
      category: payload.category,
      type: payload.type,
      priceValue,
      price: formatPrice(priceValue),
      level: payload.level,
      duration: payload.duration,
      modules: payload.modules,
      image: payload.image || foundationImages.youthPercussion,
      description: payload.description,
      includes: payload.includes,
      isPublished: payload.isPublished,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    persistCourses([newCourse, ...courses]);

    return newCourse;
  }

  function updateCourse(courseId, payload) {
    const nextCourses = courses.map((course) => {
      if (course.id !== courseId) return course;

      const priceValue = payload.type === 'Pago' ? Number(payload.priceValue || 0) : 0;

      return {
        ...course,
        ...payload,
        priceValue,
        price: formatPrice(priceValue),
      };
    });

    persistCourses(nextCourses);
  }

  function deleteCourse(courseId) {
    const nextCourses = courses.filter((course) => course.id !== courseId);
    persistCourses(nextCourses);
  }

  function toggleCourseStatus(courseId) {
    const nextCourses = courses.map((course) => {
      if (course.id !== courseId) return course;

      return {
        ...course,
        isPublished: !course.isPublished,
      };
    });

    persistCourses(nextCourses);
  }

  function resetCourses() {
    const initialCourses = normalizeCourses();
    persistCourses(initialCourses);
  }

  const publishedCourses = useMemo(() => {
    return courses.filter((course) => course.isPublished);
  }, [courses]);

  const value = {
    courses,
    publishedCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    toggleCourseStatus,
    resetCourses,
  };

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
}

export function useCourses() {
  const context = useContext(CourseContext);

  if (!context) {
    throw new Error('useCourses debe usarse dentro de CourseProvider');
  }

  return context;
}