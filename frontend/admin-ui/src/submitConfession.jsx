import { useState } from 'react';

const API_BASE = import.meta.env.DEV
  ? 'http://localhost:3001'
  : 'https://testing-confe-backend.onrender.com';

export default function SubmitConfession({ collegeId }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const SubmitConfession = async () => {
    if (!message.trim()) {
      setStatus('Please write your confession ❌');
      return;
    }

    try {
      setLoading(true);
      setStatus('');

      const res = await fetch(
        `${API_BASE}/api/confessions/submit?collegeId=${collegeId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            fromAdminUI: true,
            type: window.location.pathname.includes('shayari')
              ? 'shayari'
              : 'confession', // 🔥 bas ye add
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Submit failed');
      }

      setStatus('Confession submitted 🎭');
      setMessage('');
    } catch (error) {
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-2xl">
      {/* Heading */}
      <div className="mb-4">
        <h3 className="font-semibold text-xl text-white">
          🎭 Write Your Confession
        </h3>

        <p className="text-sm text-gray-400 mt-1">
          Your identity remains anonymous
        </p>
      </div>

      {/* Textarea */}
      <textarea
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          setStatus('');
        }}
        placeholder="Write anonymously..."
        rows={6}
        maxLength={6000}
        className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-white placeholder:text-gray-500 outline-none resize-none focus:border-white/30"
      />

      {/* Footer */}
      <div className="flex justify-between items-center mt-3 mb-4">
        <p className="text-sm text-gray-400">Keep it respectful & anonymous</p>

        <p className="text-sm text-gray-400">{message.length}/6000</p>
      </div>

      {/* Status */}
      {status && <p className="text-sm text-gray-300 mb-3">{status}</p>}

      {/* Submit */}
      <button
        onClick={SubmitConfession}
        disabled={loading}
        className="w-full rounded-2xl bg-white text-black font-semibold p-3 hover:scale-[1.01] transition"
      >
        {loading ? 'Submitting...' : 'Submit Confession'}
      </button>
    </div>
  );
}
