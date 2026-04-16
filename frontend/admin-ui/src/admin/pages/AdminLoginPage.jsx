import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (
      password === import.meta.env.VITE_ADMIN_PASSWORD
    ) {
      localStorage.setItem('adminAuth', 'true');
      navigate('/admin');
    } else {
      setError('Wrong password ❌');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-8">
        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            🔐 Admin Login
          </h1>

          <p className="text-gray-400 mt-2">
            Sign in to access admin dashboard
          </p>
        </div>

        {/* Input */}
        <input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleLogin();
            }
          }}
          className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-white placeholder:text-gray-500 outline-none focus:border-white/30"
        />

        {/* Error */}
        {error && (
          <p className="text-sm text-red-400 mt-3">
            {error}
          </p>
        )}

        {/* Button */}
        <button
          onClick={handleLogin}
          className="mt-6 w-full rounded-2xl bg-white text-black py-3 font-semibold hover:scale-[1.01] transition"
        >
          Login
        </button>
      </div>
    </div>
  );
}