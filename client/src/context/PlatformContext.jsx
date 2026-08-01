import {
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  seedCertificates,
  seedCourses,
  seedEnrollments,
  seedInstructors,
  seedNotifications,
  seedOrders,
  seedSettings,
} from '../data/platformSeed';
import {
  getCourseLessonCount,
  slugify,
} from '../utils/formatters';

const STORAGE_KEYS = {
  courses: 'tamborito.courses.v2',
  enrollments: 'tamborito.enrollments.v2',
  orders: 'tamborito.orders.v2',
  certificates: 'tamborito.certificates.v2',
  notifications: 'tamborito.notifications.v2',
  settings: 'tamborito.settings.v2',
};

function readJson(key, fallback) {
  try {
    const storedValue = localStorage.getItem(key);

    if (!storedValue) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }

    return JSON.parse(storedValue);
  } catch {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function createOrderNumber() {
  const suffix = String(Date.now()).slice(-6);
  return `ORD-${suffix}`;
}

function createTransactionReference(paymentMethod) {
  const prefix =
    paymentMethod === 'PSE'
      ? 'PSE'
      : paymentMethod === 'Tarjeta'
        ? 'CARD'
        : 'PAY';

  return `${prefix}-${String(Date.now()).slice(-7)}`;
}

const PlatformContext = createContext(null);

export function PlatformProvider({ children }) {
  const [courses, setCourses] = useState(() =>
    readJson(STORAGE_KEYS.courses, seedCourses),
  );

  const [enrollments, setEnrollments] = useState(() =>
    readJson(STORAGE_KEYS.enrollments, seedEnrollments),
  );

  const [orders, setOrders] = useState(() =>
    readJson(STORAGE_KEYS.orders, seedOrders),
  );

  const [certificates, setCertificates] = useState(() =>
    readJson(STORAGE_KEYS.certificates, seedCertificates),
  );

  const [notifications, setNotifications] = useState(() =>
    readJson(STORAGE_KEYS.notifications, seedNotifications),
  );

  const [settings, setSettings] = useState(() =>
    readJson(STORAGE_KEYS.settings, seedSettings),
  );

  const instructors = seedInstructors;

  function persistCourses(nextCourses) {
    setCourses(nextCourses);
    localStorage.setItem(
      STORAGE_KEYS.courses,
      JSON.stringify(nextCourses),
    );
  }

  function persistEnrollments(nextEnrollments) {
    setEnrollments(nextEnrollments);
    localStorage.setItem(
      STORAGE_KEYS.enrollments,
      JSON.stringify(nextEnrollments),
    );
  }

  function persistOrders(nextOrders) {
    setOrders(nextOrders);
    localStorage.setItem(
      STORAGE_KEYS.orders,
      JSON.stringify(nextOrders),
    );
  }

  function persistCertificates(nextCertificates) {
    setCertificates(nextCertificates);
    localStorage.setItem(
      STORAGE_KEYS.certificates,
      JSON.stringify(nextCertificates),
    );
  }

  function persistNotifications(nextNotifications) {
    setNotifications(nextNotifications);
    localStorage.setItem(
      STORAGE_KEYS.notifications,
      JSON.stringify(nextNotifications),
    );
  }

  function persistSettings(nextSettings) {
    setSettings(nextSettings);
    localStorage.setItem(
      STORAGE_KEYS.settings,
      JSON.stringify(nextSettings),
    );
  }

  const publishedCourses = useMemo(
    () =>
      courses.filter(
        (course) => course.status === 'published',
      ),
    [courses],
  );

  const featuredCourses = useMemo(
    () =>
      publishedCourses.filter(
        (course) => course.featured,
      ),
    [publishedCourses],
  );

  function getCourseById(courseId) {
    return (
      courses.find(
        (course) => course.id === courseId,
      ) ?? null
    );
  }

  function getCourseBySlug(courseSlug) {
    return (
      courses.find(
        (course) => course.slug === courseSlug,
      ) ?? null
    );
  }

  function getInstructorById(instructorId) {
    return (
      instructors.find(
        (instructor) =>
          instructor.id === instructorId,
      ) ?? null
    );
  }

  function getEnrollment(userId, courseId) {
    return (
      enrollments.find(
        (enrollment) =>
          enrollment.userId === userId &&
          enrollment.courseId === courseId,
      ) ?? null
    );
  }

  function getUserEnrollments(userId) {
    return enrollments.filter(
      (enrollment) =>
        enrollment.userId === userId,
    );
  }

  function getUserOrders(userId) {
    return orders.filter(
      (order) => order.userId === userId,
    );
  }

  function getUserCertificates(userId) {
    return certificates.filter(
      (certificate) =>
        certificate.userId === userId,
    );
  }

  function getUserNotifications(userId) {
    return notifications
      .filter(
        (notification) =>
          notification.userId === userId,
      )
      .sort(
        (first, second) =>
          new Date(second.createdAt) -
          new Date(first.createdAt),
      );
  }

  function getCourseProgress(userId, courseId) {
    const course = getCourseById(courseId);
    const enrollment = getEnrollment(
      userId,
      courseId,
    );

    if (!course || !enrollment) {
      return {
        completed: 0,
        total: 0,
        percentage: 0,
      };
    }

    const total = getCourseLessonCount(course);
    const completed =
      enrollment.completedLessons?.length ?? 0;

    const percentage = total
      ? Math.min(
          100,
          Math.round((completed / total) * 100),
        )
      : 0;

    return {
      completed,
      total,
      percentage,
    };
  }

  function getNextLesson(userId, courseId) {
    const course = getCourseById(courseId);
    const enrollment = getEnrollment(
      userId,
      courseId,
    );

    if (!course || !enrollment) {
      return null;
    }

    const lessons = course.modules.flatMap(
      (module) =>
        module.lessons.map((lesson) => ({
          ...lesson,
          moduleId: module.id,
          moduleTitle: module.title,
        })),
    );

    const completedLessons =
      enrollment.completedLessons ?? [];

    return (
      lessons.find(
        (lesson) =>
          !completedLessons.includes(lesson.id),
      ) ??
      lessons.at(-1) ??
      null
    );
  }

  function addNotification({
    userId,
    title,
    message,
    type = 'general',
  }) {
    const nextNotification = {
      id: createId('not'),
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
    };

    persistNotifications([
      nextNotification,
      ...notifications,
    ]);

    return nextNotification;
  }

  function enrollFreeCourse(userId, courseId) {
    const course = getCourseById(courseId);

    if (!course) {
      return {
        ok: false,
        message: 'El curso no existe.',
      };
    }

    if (!course.isFree) {
      return {
        ok: false,
        message:
          'Este curso requiere completar una compra.',
      };
    }

    if (course.status !== 'published') {
      return {
        ok: false,
        message:
          'Este curso todavía no está disponible.',
      };
    }

    const existingEnrollment = getEnrollment(
      userId,
      courseId,
    );

    if (existingEnrollment) {
      return {
        ok: false,
        message:
          'Este curso ya está vinculado a tu cuenta.',
      };
    }

    const nextEnrollment = {
      id: createId('enr'),
      userId,
      courseId,
      status: 'active',
      enrolledAt: new Date().toISOString(),
      lastLessonId:
        course.modules[0]?.lessons[0]?.id ?? null,
      completedLessons: [],
      grade: null,
      attendance: 100,
      source: 'free',
    };

    persistEnrollments([
      nextEnrollment,
      ...enrollments,
    ]);

    addNotification({
      userId,
      title: 'Inscripción confirmada',
      message: `Ya puedes comenzar ${course.title}.`,
      type: 'course',
    });

    return {
      ok: true,
      message:
        'Inscripción completada. El curso ya está en tu campus.',
      enrollment: nextEnrollment,
    };
  }

  function completePurchase({
    userId,
    cartItems,
    paymentMethod,
  }) {
    if (!cartItems.length) {
      return {
        ok: false,
        message: 'El carrito está vacío.',
      };
    }

    const selectedCourses = cartItems
      .map((item) => getCourseById(item.id))
      .filter(Boolean);

    if (!selectedCourses.length) {
      return {
        ok: false,
        message:
          'No fue posible identificar los cursos de la compra.',
      };
    }

    const purchasableCourses =
      selectedCourses.filter(
        (course) => !course.isFree,
      );

    const subtotal = purchasableCourses.reduce(
      (total, course) =>
        total + Number(course.price || 0),
      0,
    );

    const nextOrder = {
      id: createOrderNumber(),
      userId,
      items: purchasableCourses.map((course) => ({
        courseId: course.id,
        title: course.title,
        price: course.price,
      })),
      subtotal,
      total: subtotal,
      paymentMethod,
      paymentStatus: 'approved',
      orderStatus: 'completed',
      createdAt: new Date().toISOString(),
      transactionReference:
        createTransactionReference(paymentMethod),
    };

    const nextEnrollments = [
      ...enrollments,
    ];

    purchasableCourses.forEach((course) => {
      const alreadyEnrolled =
        nextEnrollments.some(
          (enrollment) =>
            enrollment.userId === userId &&
            enrollment.courseId === course.id,
        );

      if (!alreadyEnrolled) {
        nextEnrollments.unshift({
          id: createId('enr'),
          userId,
          courseId: course.id,
          status: 'active',
          enrolledAt: new Date().toISOString(),
          lastLessonId:
            course.modules[0]?.lessons[0]?.id ??
            null,
          completedLessons: [],
          grade: null,
          attendance: 100,
          source: 'purchase',
          orderId: nextOrder.id,
        });
      }
    });

    persistOrders([nextOrder, ...orders]);
    persistEnrollments(nextEnrollments);

    addNotification({
      userId,
      title: 'Pago aprobado',
      message: `Tu compra ${nextOrder.id} fue confirmada y los cursos ya están disponibles.`,
      type: 'order',
    });

    return {
      ok: true,
      message:
        'Pago aprobado. Tus cursos ya están disponibles.',
      order: nextOrder,
    };
  }

  function toggleLessonCompletion({
    userId,
    courseId,
    lessonId,
  }) {
    const course = getCourseById(courseId);
    const enrollment = getEnrollment(
      userId,
      courseId,
    );

    if (!course || !enrollment) {
      return {
        ok: false,
        message:
          'No existe una inscripción válida para este curso.',
      };
    }

    const currentCompleted =
      enrollment.completedLessons ?? [];

    const isCompleted =
      currentCompleted.includes(lessonId);

    const nextCompleted = isCompleted
      ? currentCompleted.filter(
          (item) => item !== lessonId,
        )
      : [...currentCompleted, lessonId];

    const totalLessons =
      getCourseLessonCount(course);

    const finished =
      totalLessons > 0 &&
      nextCompleted.length >= totalLessons;

    const nextEnrollments = enrollments.map(
      (item) =>
        item.id === enrollment.id
          ? {
              ...item,
              completedLessons: nextCompleted,
              lastLessonId: lessonId,
              status: finished
                ? 'completed'
                : 'active',
              completedAt: finished
                ? new Date().toISOString()
                : undefined,
            }
          : item,
    );

    persistEnrollments(nextEnrollments);

    if (
      finished &&
      course.certificate &&
      !certificates.some(
        (certificate) =>
          certificate.userId === userId &&
          certificate.courseId === courseId,
      )
    ) {
      const nextCertificate = {
        id: createId('cert'),
        userId,
        courseId,
        code: `FT-${course.id
          .replace('course-', '')
          .slice(0, 3)
          .toUpperCase()}-${new Date().getFullYear()}-${String(
          certificates.length + 1,
        ).padStart(4, '0')}`,
        issuedAt: new Date().toISOString(),
      };

      persistCertificates([
        nextCertificate,
        ...certificates,
      ]);

      addNotification({
        userId,
        title: 'Certificado disponible',
        message: `Completaste ${course.title}. Tu certificado ya está disponible.`,
        type: 'certificate',
      });
    }

    return {
      ok: true,
      completed: !isCompleted,
      finished,
    };
  }

  function markNotificationRead(notificationId) {
    const nextNotifications =
      notifications.map((notification) =>
        notification.id === notificationId
          ? {
              ...notification,
              read: true,
            }
          : notification,
      );

    persistNotifications(nextNotifications);
  }

  function markAllNotificationsRead(userId) {
    const nextNotifications =
      notifications.map((notification) =>
        notification.userId === userId
          ? {
              ...notification,
              read: true,
            }
          : notification,
      );

    persistNotifications(nextNotifications);
  }

  function createCourse(payload) {
    const courseId = createId('course');
    const courseSlug =
      payload.slug?.trim() ||
      slugify(payload.title);

    const nextCourse = {
      id: courseId,
      slug: courseSlug,
      title: payload.title.trim(),
      subtitle: payload.subtitle.trim(),
      description: payload.description.trim(),
      category: payload.category.trim(),
      level: payload.level,
      modality: payload.modality,
      language: payload.language || 'Español',
      durationLabel: payload.durationLabel,
      price: payload.isFree
        ? 0
        : Number(payload.price || 0),
      isFree: Boolean(payload.isFree),
      status: payload.status || 'draft',
      featured: Boolean(payload.featured),
      certificate: Boolean(payload.certificate),
      cover: payload.cover,
      instructorId: payload.instructorId,
      studentsCount: 0,
      rating: 0,
      updatedAt: new Date().toISOString(),
      learningOutcomes:
        payload.learningOutcomes ?? [],
      requirements: payload.requirements ?? [],
      audience: payload.audience ?? [],
      modules: payload.modules ?? [],
    };

    persistCourses([nextCourse, ...courses]);

    return nextCourse;
  }

  function updateCourse(courseId, payload) {
    const nextCourses = courses.map((course) =>
      course.id === courseId
        ? {
            ...course,
            ...payload,
            slug:
              payload.slug?.trim() ||
              slugify(
                payload.title ?? course.title,
              ),
            price: payload.isFree
              ? 0
              : Number(
                  payload.price ?? course.price,
                ),
            updatedAt: new Date().toISOString(),
          }
        : course,
    );

    persistCourses(nextCourses);

    return (
      nextCourses.find(
        (course) => course.id === courseId,
      ) ?? null
    );
  }

  function deleteCourse(courseId) {
    persistCourses(
      courses.filter(
        (course) => course.id !== courseId,
      ),
    );

    persistEnrollments(
      enrollments.filter(
        (enrollment) =>
          enrollment.courseId !== courseId,
      ),
    );
  }

  function updateEnrollment(
    enrollmentId,
    payload,
  ) {
    const nextEnrollments =
      enrollments.map((enrollment) =>
        enrollment.id === enrollmentId
          ? {
              ...enrollment,
              ...payload,
            }
          : enrollment,
      );

    persistEnrollments(nextEnrollments);
  }

  function createManualEnrollment({
    userId,
    courseId,
  }) {
    const existing = getEnrollment(
      userId,
      courseId,
    );

    if (existing) {
      return {
        ok: false,
        message:
          'El estudiante ya está inscrito en este curso.',
      };
    }

    const course = getCourseById(courseId);

    if (!course) {
      return {
        ok: false,
        message: 'El curso no existe.',
      };
    }

    const nextEnrollment = {
      id: createId('enr'),
      userId,
      courseId,
      status: 'active',
      enrolledAt: new Date().toISOString(),
      lastLessonId:
        course.modules[0]?.lessons[0]?.id ??
        null,
      completedLessons: [],
      grade: null,
      attendance: 100,
      source: 'manual',
    };

    persistEnrollments([
      nextEnrollment,
      ...enrollments,
    ]);

    return {
      ok: true,
      enrollment: nextEnrollment,
    };
  }

  function updateOrder(orderId, payload) {
    const nextOrders = orders.map((order) =>
      order.id === orderId
        ? {
            ...order,
            ...payload,
          }
        : order,
    );

    persistOrders(nextOrders);
  }

  function updatePlatformSettings(payload) {
    const nextSettings = {
      ...settings,
      ...payload,
    };

    persistSettings(nextSettings);

    return nextSettings;
  }

  function resetPlatformData() {
    persistCourses(seedCourses);
    persistEnrollments(seedEnrollments);
    persistOrders(seedOrders);
    persistCertificates(seedCertificates);
    persistNotifications(seedNotifications);
    persistSettings(seedSettings);
  }

  const value = {
    courses,
    publishedCourses,
    featuredCourses,
    instructors,
    enrollments,
    orders,
    certificates,
    notifications,
    settings,
    getCourseById,
    getCourseBySlug,
    getInstructorById,
    getEnrollment,
    getUserEnrollments,
    getUserOrders,
    getUserCertificates,
    getUserNotifications,
    getCourseProgress,
    getNextLesson,
    enrollFreeCourse,
    completePurchase,
    toggleLessonCompletion,
    markNotificationRead,
    markAllNotificationsRead,
    createCourse,
    updateCourse,
    deleteCourse,
    updateEnrollment,
    createManualEnrollment,
    updateOrder,
    updatePlatformSettings,
    resetPlatformData,
  };

  return (
    <PlatformContext.Provider value={value}>
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  const context = useContext(PlatformContext);

  if (!context) {
    throw new Error(
      'usePlatform debe utilizarse dentro de PlatformProvider.',
    );
  }

  return context;
}