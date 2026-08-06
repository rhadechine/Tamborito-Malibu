import { Suspense, lazy } from 'react';
import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import StudentLayout from './components/StudentLayout';
import AdminLayout from './components/AdminLayout';

const EcosystemHome = lazy(
  () => import('./pages/EcosystemHome.jsx'),
);

const FoundationHome = lazy(
  () => import('./pages/FoundationHome.jsx'),
);

const History = lazy(
  () => import('./pages/History.jsx'),
);

const Courses = lazy(
  () => import('./pages/Courses.jsx'),
);

const CourseDetail = lazy(
  () => import('./pages/CourseDetail.jsx'),
);

const Library = lazy(
  () => import('./pages/Library.jsx'),
);

const Donations = lazy(
  () => import('./pages/Donations.jsx'),
);

const Registration = lazy(
  () => import('./pages/Registration.jsx'),
);

const PrivacyPolicy = lazy(
  () => import('./pages/PrivacyPolicy.jsx'),
);

const Login = lazy(
  () => import('./pages/auth/Login.jsx'),
);

const Register = lazy(
  () => import('./pages/auth/Register.jsx'),
);

const Cart = lazy(
  () => import('./pages/shop/Cart.jsx'),
);

const Checkout = lazy(
  () => import('./pages/shop/Checkout.jsx'),
);

const StudentDashboard = lazy(
  () => import('./pages/student/StudentDashboard.jsx'),
);

const MyCourses = lazy(
  () => import('./pages/student/MyCourses.jsx'),
);

const CourseWorkspace = lazy(
  () => import('./pages/student/CourseWorkspace.jsx'),
);

const CoursePlayer = lazy(
  () => import('./pages/student/CoursePlayer.jsx'),
);

const Certificates = lazy(
  () => import('./pages/student/Certificates.jsx'),
);

const Profile = lazy(
  () => import('./pages/student/Profile.jsx'),
);

const AdminCourses = lazy(
  () => import('./pages/admin/AdminCourses.jsx'),
);

const AdminCourseEditor = lazy(
  () => import('./pages/admin/AdminCourseEditor.jsx'),
);

const AdminStudents = lazy(
  () => import('./pages/admin/AdminStudents.jsx'),
);

const AdminAnalytics = lazy(
  () => import('./pages/admin/AdminAnalytics.jsx'),
);

const AdminSettings = lazy(
  () => import('./pages/admin/AdminSettings.jsx'),
);

const MuseumHome = lazy(
  () => import('./pages/MuseumHome.jsx'),
);

const MuseumHistory = lazy(
  () => import('./pages/MuseumHistory.jsx'),
);

const MuseumCollection = lazy(
  () => import('./pages/MuseumCollection.jsx'),
);

const MuseumContact = lazy(
  () => import('./pages/MuseumContact.jsx'),
);

const NotFound = lazy(
  () => import('./pages/NotFound.jsx'),
);

function LoadingRoute() {
  return (
    <div className="route-loading">
      Cargando plataforma cultural...
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />

      <Suspense fallback={<LoadingRoute />}>
        <Routes>
          <Route
            path="/"
            element={<EcosystemHome />}
          />

          <Route
            path="/fundacion"
            element={<FoundationHome />}
          />

          <Route
            path="/historia"
            element={<History />}
          />

          <Route
            path="/cursos"
            element={<Courses />}
          />

          <Route
            path="/cursos/:slug"
            element={<CourseDetail />}
          />

          <Route
            path="/biblioteca"
            element={<Library />}
          />

          <Route
            path="/donaciones"
            element={<Donations />}
          />

          <Route
            path="/inscripcion"
            element={<Registration />}
          />

          <Route
            path="/politicas-privacidad"
            element={<PrivacyPolicy />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/registro"
            element={<Register />}
          />

          <Route
            path="/carrito"
            element={<Cart />}
          />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <Checkout />
              </ProtectedRoute>
            }
          />

          <Route
            path="/campus"
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={<StudentDashboard />}
            />

            <Route
              path="cursos"
              element={<MyCourses />}
            />

            <Route
              path="cursos/:courseId"
              element={<CourseWorkspace />}
            />

            <Route
              path="cursos/:courseId/clase/:lessonId"
              element={<CoursePlayer />}
            />

            <Route
              path="certificados"
              element={<Certificates />}
            />

            <Route
              path="compras"
              element={<Navigate to="/carrito" replace />}
            />

            <Route
              path="perfil"
              element={<Profile />}
            />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={<Navigate to="/admin/cursos" replace />}
            />

            <Route
              path="cursos"
              element={<AdminCourses />}
            />

            <Route
              path="cursos/nuevo"
              element={<AdminCourseEditor />}
            />

            <Route
              path="cursos/:courseId/editar"
              element={<AdminCourseEditor />}
            />

            <Route
              path="estudiantes"
              element={<AdminStudents />}
            />

            <Route
              path="inscripciones"
              element={<Navigate to="/admin/estudiantes" replace />}
            />

            <Route
              path="ventas"
              element={<Navigate to="/admin/reportes" replace />}
            />

            <Route
              path="reportes"
              element={<AdminAnalytics />}
            />

            <Route
              path="configuracion"
              element={<AdminSettings />}
            />
          </Route>

          <Route
            path="/dashboard"
            element={
              <Navigate
                to="/campus"
                replace
              />
            }
          />

          <Route
            path="/mis-cursos"
            element={
              <Navigate
                to="/campus/cursos"
                replace
              />
            }
          />

          <Route
            path="/programas"
            element={
              <Navigate
                to="/cursos"
                replace
              />
            }
          />

          <Route
            path="/recursos"
            element={
              <Navigate
                to="/biblioteca"
                replace
              />
            }
          />

          <Route
            path="/museo"
            element={<MuseumHome />}
          />

          <Route
            path="/museo/historia"
            element={<MuseumHistory />}
          />

          <Route
            path="/museo/colecciones"
            element={<MuseumCollection />}
          />

          <Route
            path="/museo/contactanos"
            element={<MuseumContact />}
          />

          <Route
            path="/museo/donar"
            element={<Navigate to="/donaciones" replace />}
          />

          <Route
            path="/museo/coleccion"
            element={
              <Navigate
                to="/museo/colecciones"
                replace
              />
            }
          />

          <Route
            path="/museo/exposiciones"
            element={
              <Navigate
                to="/museo/colecciones"
                replace
              />
            }
          />

          <Route
            path="/museo/investigacion"
            element={
              <Navigate
                to="/museo/colecciones"
                replace
              />
            }
          />

          <Route
            path="/museo/visitas"
            element={
              <Navigate
                to="/museo/contactanos"
                replace
              />
            }
          />

          <Route
            path="*"
            element={<NotFound />}
          />
        </Routes>
      </Suspense>
    </>
  );
}