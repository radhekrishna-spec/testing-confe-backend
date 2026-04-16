import { useNavigate } from 'react-router-dom';
import SubmitConfession from '../submitConfession';

export default function FrontPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* NAVBAR */}
      <nav className="border-b border-white/10 bg-white/5 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">🎭 Confession Portal</h1>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-xl border border-white/20"
            >
              Home
            </button>

            <button
              onClick={() => navigate('/admin/login')}
              className="px-4 py-2 rounded-xl bg-white text-black font-semibold"
            >
              Admin
            </button>
          </div>
        </div>
      </nav>

      {/* BODY */}
      <div className="max-w-3xl mx-auto p-6">
        <SubmitConfession />
      </div>
    </div>
  );
}
