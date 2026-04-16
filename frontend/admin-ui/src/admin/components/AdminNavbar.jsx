import { useLocation, useNavigate } from 'react-router-dom';

export default function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin/login');
  };

  const linkClass = (path) =>
    `px-4 py-2 rounded-xl transition ${
      location.pathname.startsWith(path)
        ? 'bg-white text-black'
        : 'border border-white/20 text-white'
    }`;

  return (
    <div className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1
          onClick={() => navigate('/admin')}
          className="text-xl font-bold cursor-pointer"
        >
          🚀 Admin Panel
        </h1>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/admin')}
            className={linkClass('/admin')}
          >
            Dashboard
          </button>

          <button
            onClick={() => navigate('/admin/create-college')}
            className={linkClass('/admin/create-college')}
          >
            Create
          </button>

          <button
            onClick={() => navigate('/admin/backend')}
            className={linkClass('/admin/backend')}
          >
            Backend
          </button>

          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-xl border border-white/20"
          >
            Frontend
          </button>

          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl bg-red-500 text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
