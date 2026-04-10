import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedColleges, setSelectedColleges] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [recentActivity, setRecentActivity] = useState([]);
  const [lastResult, setLastResult] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('success');
  const [colleges, setColleges] = useState([]);

  useEffect(() => {
    fetch('https://testing-confe-backend.onrender.com/api/admin/colleges')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setColleges(data.data);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!statusMessage) return;

    const timer = setTimeout(() => {
      setStatusMessage('');
    }, 3000);

    return () => clearTimeout(timer);
  }, [statusMessage]);

  useEffect(() => {
    const savedActivity = localStorage.getItem('recentActivity');

    if (savedActivity) {
      setRecentActivity(JSON.parse(savedActivity));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('recentActivity', JSON.stringify(recentActivity));
  }, [recentActivity]);

  const retryFailedColleges = async () => {
    if (!lastResult) return;

    const failedColleges = lastResult
      .filter((item) => item.status === 'FAILED')
      .map((item) => item.collegeId);

    if (failedColleges.length === 0) {
      alert('No failed colleges');
      return;
    }

    setSelectedColleges(failedColleges);
    await sendToSelectedColleges();
  };

  

  const sendToSelectedColleges = async () => {
    if (!message.trim()) {
      alert('Please write a confession');
      return;
    }

    if (selectedColleges.length === 0) {
      alert('Please select at least one college');
      return;
    }

    try {
      setLoading(true);
      setProgressText(`Sending to ${selectedColleges.length} colleges...`);

      const res = await fetch(
        'https://testing-confe-backend.onrender.com/api/admin/broadcast',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            collegeIds: selectedColleges,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send');
      }

      setRecentActivity((prev) => [
        {
          type: 'Selected',
          colleges: [...selectedColleges],
          message,
          time: new Date().toLocaleTimeString(),
        },
        ...prev.slice(0, 4),
      ]);

      setLastResult(data.data);

      setStatusType('success');
      setStatusMessage('Sent successfully 🚀');

      setMessage('');
      setSelectedColleges([]);
      setProgressText('');
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendToAllColleges = async () => {
    if (!message.trim()) {
      alert('Please write a confession');
      return;
    }

    try {
      setLoading(true);
      setProgressText('Broadcasting to all colleges...');

      const res = await fetch(
        'https://m-backend-4t8v.onrender.com/api/admin/broadcast',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            collegeIds: colleges.map((c) => c.collegeId),
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Broadcast failed');
      }

      setRecentActivity((prev) => [
        {
          type: 'Broadcast',
          colleges: [...colleges],
          message,
          time: new Date().toLocaleTimeString(),
        },
        ...prev.slice(0, 4),
      ]);
      setLastResult(data.data);
      setStatusType('success');
      setStatusMessage('Broadcast sent 🚀');

      setMessage('');
      setSelectedColleges([]);
      setProgressText('');
    } catch (error) {
      console.error(error);
      setStatusType('error');
      setStatusMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Super Admin Dashboard 🚀</h1>
      {statusMessage && (
        <div
          className={`mb-4 rounded-2xl p-3 ${
            statusType === 'success'
              ? 'bg-green-500/20 border border-green-400'
              : 'bg-red-500/20 border border-red-400'
          }`}
        >
          {statusMessage}
        </div>
      )}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Global Confession Composer ✍️
        </h2>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write confession for selected colleges..."
          rows={4}
          className="w-full border border-white/10 bg-black rounded-2xl p-3 text-white placeholder:text-gray-400 mb-4 outline-none resize-none"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {colleges.map((college) => (
            <label
              key={college.name}
              className="flex items-center gap-2 border border-white/10 rounded-xl p-2"
            >
              <input
                type="checkbox"
                checked={selectedColleges.includes(college.collegeId)}
                onChange={() => {
                  setSelectedColleges((prev) =>
                    prev.includes(college.collegeId)
                      ? prev.filter((c) => c !== college.collegeId)
                      : [...prev, college.collegeId],
                  );
                }}
              />
              <span>{college.name}</span>
            </label>
          ))}
        </div>
        {loading && (
          <p className="text-sm text-gray-400 mb-3">{progressText}</p>
        )}
        <div className="flex gap-3">
          <button
            onClick={sendToSelectedColleges}
            disabled={loading}
            className="px-5 py-3 rounded-2xl bg-white text-black font-semibold"
          >
            Send Selected
          </button>

          <button
            onClick={sendToAllColleges}
            disabled={loading}
            className="px-5 py-3 rounded-2xl border border-white/20"
          >
            Send All
          </button>
        </div>
      </div>

      {lastResult && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Last Broadcast Result 📡
          </h2>
          <button
            onClick={retryFailedColleges}
            className="text-sm px-3 py-1 border border-white/20 rounded-xl mb-3"
          >
            Retry Failed
          </button>

          <p className="text-sm text-gray-400 mb-3">
            Failed: {lastResult.filter((r) => r.status === 'FAILED').length}
          </p>

          <div className="space-y-2">
            {lastResult.map((item, index) => (
              <div
                key={index}
                className="border border-white/10 rounded-2xl p-3"
              >
                <p>
                  {item.collegeId} → {item.status}
                  {item.confessionNo && ` #${item.confessionNo}`}
                </p>

                {item.error && (
                  <p className="text-sm text-red-400">{item.error}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Activity 📜</h2>

        {/* {lastResult?.map((item, index) => (
          <div key={index} className="border border-white/10 rounded-2xl p-3">
            <p>
              {item.collegeId} → {item.status}
              {item.confessionNo && ` #${item.confessionNo}`}
            </p>

            {item.error && <p className="text-sm text-red-400">{item.error}</p>}
          </div>
        ))} */}

        <button
          onClick={() => {
            setRecentActivity([]);
            setLastResult(null);
            localStorage.removeItem('recentActivity');
          }}
          className="text-sm px-3 py-1 border border-white/20 rounded-xl"
        >
          Clear
        </button>
      </div>

      {recentActivity.length === 0 ? (
        <p className="text-gray-400">No recent activity</p>
      ) : (
        <div className="space-y-3">
          {recentActivity.map((item, index) => (
            <div key={index} className="border border-white/10 rounded-2xl p-3">
              <p>
                <strong>{item.type}</strong> → {item.colleges.join(', ')}
              </p>
              <p className="text-sm text-gray-400">{item.message}</p>
              <p className="text-xs text-gray-500">{item.time}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {colleges.map((college) => (
          <div
            key={college.collegeId}
            onClick={() => navigate(`/admin/college/${college.collegeId}`)}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition-all cursor-pointer"
          >
            <h2 className="text-xl font-semibold mb-2">{college.name}</h2>

            <p className="text-sm text-gray-400">
              Pending: {college.pending || 0}
            </p>

            <p className="text-sm text-gray-400">
              Posted Today: {college.postedToday || 0}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
