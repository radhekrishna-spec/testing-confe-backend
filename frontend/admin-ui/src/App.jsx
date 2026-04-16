import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminLoginPage from './admin/pages/AdminLoginPage';
import AITrainingPage from './admin/pages/AITrainingPage';
import CollegeAITrainingDetailsPage from './admin/pages/CollegeAITrainingDetailsPage';
import CollegeWorkspace from './admin/pages/CollegeWorkspace';
import CreateCollegePage from './admin/pages/CreateCollegePage';
import Dashboard from './admin/pages/Dashboard';
import EditCollegeSettingsPage from './admin/pages/EditCollegeSettingsPage';
import BackendControlsDashboard from './BackendControlsDashboard';
import FrontPage from './pages/FrontPage';

function ProtectedRoute({ children }) {
  const isAuth = localStorage.getItem('adminAuth');
  return isAuth === 'true' ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* FRONTEND */}
        <Route path="/" element={<FrontPage />} />

        {/* LOGIN */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* ADMIN MAIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* CREATE */}
        <Route
          path="/admin/create-college"
          element={
            <ProtectedRoute>
              <CreateCollegePage />
            </ProtectedRoute>
          }
        />

        {/* COLLEGE */}
        <Route
          path="/admin/college/:collegeId"
          element={
            <ProtectedRoute>
              <CollegeWorkspace />
            </ProtectedRoute>
          }
        />

        {/* EDIT */}
        <Route
          path="/admin/college/:collegeId/edit"
          element={
            <ProtectedRoute>
              <EditCollegeSettingsPage />
            </ProtectedRoute>
          }
        />

        {/* SETTINGS */}
        <Route
          path="/admin/college/:collegeId/settings"
          element={
            <ProtectedRoute>
              <EditCollegeSettingsPage />
            </ProtectedRoute>
          }
        />

        {/* AI */}
        <Route
          path="/admin/college/:collegeId/ai-training"
          element={
            <ProtectedRoute>
              <CollegeAITrainingDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* GLOBAL AI */}
        <Route
          path="/admin/ai-training"
          element={
            <ProtectedRoute>
              <AITrainingPage />
            </ProtectedRoute>
          }
        />

        {/* BACKEND */}
        <Route
          path="/admin/backend"
          element={
            <ProtectedRoute>
              <BackendControlsDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
