import { useNavigate } from 'react-router-dom';

import SubmitConfession from '../../SubmitConfession';

export default function FrontPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight">
            🎭 Confession Portal
          </h1>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-2xl border border-white/20 hover:bg-white/10 transition"
            >
              Home
            </button>

            <button
              onClick={() => navigate('/admin/login')}
              className="px-4 py-2 rounded-2xl bg-white text-black font-semibold hover:scale-[1.02] transition"
            >
              Admin
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          Share your thoughts <br />
          <span className="text-gray-400">anonymously & freely</span>
        </h1>

        <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
          Post confessions, thoughts and stories securely. Your identity stays
          private while your voice reaches everyone.
        </p>
      </section>

      {/* Form Card */}
      <section className="max-w-3xl mx-auto px-6 pb-12">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-6">
          <SubmitConfession />
        </div>
      </section>
    </div>
  );
}
