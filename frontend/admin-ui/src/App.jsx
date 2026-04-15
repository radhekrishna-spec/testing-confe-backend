import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminLoginPage from './admin/pages/AdminLoginPage';
import AITrainingPage from './admin/pages/AITrainingPage';
import CollegeWorkspace from './admin/pages/CollegeWorkspace';
import Dashboard from './admin/pages/Dashboard';
import BackendControlsDashboard from './BackendControlsDashboard';

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
          path="/admin/college/:collegeId"
          element={<CollegeWorkspace />}
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Dashboard />
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

        <Route
          path="/ai-training"
          element={
            <ProtectedRoute>
              <AITrainingPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
