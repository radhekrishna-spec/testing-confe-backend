import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Brain,
  ServerCog,
  LogOut,
} from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      label: 'Dashboard',
      path: '/admin',
      icon: LayoutDashboard,
    },
    {
      label: 'Create College',
      path: '/admin/create-college',
      icon: Building2,
    },
    {
      label: 'AI Training',
      path: '/admin/ai-training',
      icon: Brain,
    },
    {
      label: 'Backend',
      path: '/admin/backend',
      icon: ServerCog,
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-72 border-r border-white/10 bg-black/40 backdrop-blur-xl p-5 flex flex-col">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">
            🚀 Admin Panel
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Confession SaaS
          </p>
        </div>

        {/* Navigation */}
        <div className="space-y-2 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                  isActive(item.path)
                    ? 'bg-white text-black font-semibold'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10">
          <button
            onClick={() => {
              localStorage.removeItem('adminAuth');
              navigate('/admin/login');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-400 hover:bg-red-500/10"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}