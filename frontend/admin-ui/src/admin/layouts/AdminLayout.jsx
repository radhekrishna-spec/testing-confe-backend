import { Outlet, useNavigate } from 'react-router-dom';

export default function AdminLayout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 p-5">
        <h1 className="text-xl font-bold mb-8">🚀 Admin Panel</h1>

        <div className="space-y-3">
          <button onClick={() => navigate('/admin')} className="block w-full text-left">
            Dashboard
          </button>

          <button onClick={() => navigate('/admin/create-college')} className="block w-full text-left">
            Create College
          </button>

          <button onClick={() => navigate('/admin/ai-training')} className="block w-full text-left">
            AI Training
          </button>

          <button onClick={() => navigate('/admin/backend')} className="block w-full text-left">
            Backend
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}