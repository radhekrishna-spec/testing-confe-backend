import { useNavigate, useParams } from 'react-router-dom';
import AdminDashboardPage from './AdminDashboardPage';

export default function CollegeWorkspace() {
  const { collegeId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <button
        onClick={() => navigate('/admin')}
        className="mb-6 px-4 py-2 rounded-xl border border-white/20"
      >
        ← Back to Dashboard
      </button>

      <h1 className="text-3xl font-bold mb-6">
        {collegeId?.toUpperCase()} Workspace 🎯
      </h1>

      <AdminDashboardPage collegeId={collegeId} />
    </div>
  );
}
