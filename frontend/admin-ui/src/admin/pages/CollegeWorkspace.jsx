import { useNavigate, useParams } from 'react-router-dom';
import AdminDashboardPage from './AdminDashboardPage';

export default function CollegeWorkspace() {
  const { collegeId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* TOP BAR */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-md px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            🏫 {collegeId?.toUpperCase()} Workspace
          </h1>
          <p className="text-sm text-gray-400">
            Manage confessions, AI, settings
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 rounded-xl border border-white/20"
          >
            ← Dashboard
          </button>

          <button
            onClick={() => navigate(`/admin/college/${collegeId}/edit`)}
            className="px-4 py-2 rounded-xl border border-blue-400 hover:bg-blue-500 hover:text-white transition"
          >
            Edit
          </button>

          <button
            onClick={() => navigate(`/admin/college/${collegeId}/ai-training`)}
            className="px-4 py-2 rounded-xl border border-white/20"
          >
            AI
          </button>
        </div>
      </div>

      {/* MAIN PAGE */}
      <div className="p-6">
        <AdminDashboardPage collegeId={collegeId} />
      </div>
    </div>
  );
}
