import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminLoginPage from './admin/pages/AdminLoginPage';
import AITrainingPage from './admin/pages/AITrainingPage';
import CollegeAITrainingDetailsPage from './admin/pages/CollegeAITrainingDetailsPage';
import CollegeWorkspace from './admin/pages/CollegeWorkspace';
import CreateCollegePage from './admin/pages/CreateCollegePage';
import Dashboard from './admin/pages/Dashboard';
import EditCollegeSettingsPage from './admin/pages/EditCollegeSettingsPage';
import FrontPage from './admin/pages/FrontPage';
import BackendControlsDashboard from './BackendControlsDashboard';
import AdminLayout from './admin/layouts/AdminLayout';

function ProtectedRoute({ children }) {
  const isAuth = localStorage.getItem('adminAuth');
  return isAuth === 'true' ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FrontPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* COMMON ADMIN LAYOUT */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="create-college" element={<CreateCollegePage />} />
          <Route path="college/:collegeId" element={<CollegeWorkspace />} />
          <Route path="college/:collegeId/edit" element={<EditCollegeSettingsPage />} />
          <Route path="college/:collegeId/settings" element={<EditCollegeSettingsPage />} />
          <Route path="college/:collegeId/ai-training" element={<CollegeAITrainingDetailsPage />} />
          <Route path="ai-training" element={<AITrainingPage />} />
          <Route path="backend" element={<BackendControlsDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}