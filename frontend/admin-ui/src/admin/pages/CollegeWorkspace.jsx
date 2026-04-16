import { useNavigate, useParams } from 'react-router-dom';
import AdminDashboardPage from './AdminDashboardPage';

export default function CollegeWorkspace() {
  const { collegeId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-white">
      {/* Header Card */}
      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              🏫 {collegeId?.toUpperCase()} Workspace
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Manage confessions, AI and college settings
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 rounded-2xl border border-white/20 hover:bg-white/10 transition"
            >
              ← Dashboard
            </button>

            <button
              onClick={() =>
                navigate(`/admin/college/${collegeId}/edit`)
              }
              className="px-4 py-2 rounded-2xl border border-white/20 hover:bg-white/10 transition"
            >
              ✏ Edit
            </button>

            <button
              onClick={() =>
                navigate(
                  `/admin/college/${collegeId}/ai-training`
                )
              }
              className="px-4 py-2 rounded-2xl border border-white/20 hover:bg-white/10 transition"
            >
              🤖 AI
            </button>
          </div>
        </div>
      </div>

      {/* Workspace Dashboard */}
      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
        <AdminDashboardPage collegeId={collegeId} />
      </div>
    </div>
  );
}