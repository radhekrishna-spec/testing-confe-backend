import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import BackendControlsDashboard from './BackendControlsDashboard';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminLoginPage from './pages/AdminLoginPage';

function ProtectedRoute({ children }) {
  const isAuth = localStorage.getItem('adminAuth');

  return isAuth === 'true' ? children : <Navigate to="/admin/login" replace />;
}
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<AdminLoginPage />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/backend"
          element={
            <ProtectedRoute>
              <BackendControlsDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
