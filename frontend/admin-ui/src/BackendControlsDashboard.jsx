import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';

const API_BASE = import.meta.env.DEV
  ? 'http://localhost:3001'
  : 'https://testing-confe-backend.onrender.com';

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`w-14 h-8 rounded-full relative ${
        checked ? 'bg-white' : 'bg-white/20'
      }`}
    >
      <div
        className={`absolute top-1 h-6 w-6 rounded-full ${
          checked ? 'left-7 bg-black' : 'left-1 bg-white'
        }`}
      />
    </button>
  );
}

export default function AdvancedDashboard() {
  const [collegeId, setCollegeId] = useState('');
  const [colleges, setColleges] = useState([]);
  const [tab, setTab] = useState('system');

  const [settings, setSettings] = useState({});
  const [stats, setStats] = useState({
    approved: 0,
    posted: 0,
    failed: 0,
  });

  // 🔥 LOAD COLLEGES
  useEffect(() => {
    fetch(`${API_BASE}/api/admin/colleges`)
      .then((r) => r.json())
      .then((d) => {
        setColleges(d.data || []);
        if (d.data?.length) setCollegeId(d.data[0].collegeId);
      });
  }, []);

  // 🔥 LOAD SETTINGS
  useEffect(() => {
    if (!collegeId) return;

    fetch(`${API_BASE}/api/settings/${collegeId}`)
      .then((r) => r.json())
      .then(setSettings);

    fetch(`${API_BASE}/api/admin/stats/${collegeId}`)
      .then((r) => r.json())
      .then(setStats);
  }, [collegeId]);

  const update = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    await fetch(`${API_BASE}/api/settings/${collegeId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });

    alert('Saved ✅');
  };

  return (
    <div className="bg-black text-white min-h-screen p-6">
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">🚀 SaaS Control Panel</h1>

        <button
          onClick={save}
          className="bg-white text-black px-4 py-2 rounded-xl"
        >
          <Save size={16} /> Save
        </button>
      </div>

      {/* COLLEGE */}
      <select
        value={collegeId}
        onChange={(e) => setCollegeId(e.target.value)}
        className="w-full mb-6 p-3 rounded-xl bg-white/10"
      >
        {colleges.map((c) => (
          <option key={c.collegeId} value={c.collegeId}>
            {c.name}
          </option>
        ))}
      </select>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white/5 rounded-xl">
          Approved: {stats.approved}
        </div>
        <div className="p-4 bg-white/5 rounded-xl">Posted: {stats.posted}</div>
        <div className="p-4 bg-white/5 rounded-xl">Failed: {stats.failed}</div>
      </div>

      {/* TABS */}
      <div className="flex gap-3 mb-6">
        {['system', 'posting', 'ai', 'queue'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl ${
              tab === t ? 'bg-white text-black' : 'border'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* SYSTEM */}
      {tab === 'system' && (
        <div className="grid gap-4">
          <div className="flex justify-between">
            Auto Posting
            <Toggle
              checked={settings.autoPosting}
              onChange={() => update('autoPosting', !settings.autoPosting)}
            />
          </div>

          <div className="flex justify-between">
            Start Confession No
            <input
              type="number"
              value={settings.startConfessionNo || 1000}
              onChange={(e) =>
                update('startConfessionNo', Number(e.target.value))
              }
            />
          </div>
        </div>
      )}

      {/* POSTING */}
      {tab === 'posting' && (
        <div className="grid gap-4">
          <div className="flex justify-between">
            Interval (sec)
            <input
              type="number"
              value={settings.postingInterval || 15}
              onChange={(e) =>
                update('postingInterval', Number(e.target.value))
              }
            />
          </div>

          <div className="flex justify-between">
            Max Queue
            <input
              type="number"
              value={settings.maxQueue || 10}
              onChange={(e) => update('maxQueue', Number(e.target.value))}
            />
          </div>

          <div className="flex justify-between">
            Retry Limit
            <input
              type="number"
              value={settings.retryLimit || 3}
              onChange={(e) => update('retryLimit', Number(e.target.value))}
            />
          </div>
        </div>
      )}

      {/* AI */}
      {tab === 'ai' && (
        <div>
          <textarea
            placeholder="Train AI..."
            className="w-full h-40 bg-white/5 p-4"
          />
        </div>
      )}

      {/* QUEUE */}
      {tab === 'queue' && (
        <div>
          <button className="bg-white text-black px-4 py-2 rounded-xl">
            Refresh Queue
          </button>
        </div>
      )}
    </div>
  );
}
