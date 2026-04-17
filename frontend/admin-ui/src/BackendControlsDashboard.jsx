import { useEffect, useMemo, useState } from 'react';
import SubmitConfession from './submitConfession';

const API_BASE = import.meta.env.DEV
  ? 'http://localhost:3001'
  : 'https://testing-confe-backend.onrender.com';

// ✅ TOGGLE
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

// ✅ CONFESSION NUMBER (NOW COLLEGE-WISE)
function ConfessionNoControl({ collegeId }) {
  const [number, setNumber] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/confession-no?collegeId=${collegeId}`)
      .then((res) => res.json())
      .then((data) => setNumber(data.confessionNo || ''));
  }, [collegeId]);

  const updateNumber = async () => {
    await fetch(`${API_BASE}/api/confession-no`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        confessionNo: Number(number),
        collegeId,
      }),
    });

    alert(`Updated to #${number}`);
  };

  return (
    <div className="p-5 bg-white/5 border rounded-2xl">
      <h3>Confession Number</h3>

      <input
        type="number"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        className="w-full p-2 bg-black border rounded mt-2"
      />

      <div className="flex gap-2 mt-2">
        {[1, 10, 100].map((n) => (
          <button
            key={n}
            onClick={() => setNumber((prev) => Number(prev || 0) + n)}
            className="px-2 py-1 border rounded"
          >
            +{n}
          </button>
        ))}
      </div>

      <button
        onClick={updateNumber}
        className="mt-3 w-full bg-white text-black p-2 rounded"
      >
        Update
      </button>
    </div>
  );
}

// ✅ FULL CONTROLS (RESTORED)
const defaultControls = [
  { key: 'spamFilter', name: 'Spam Filter', category: 'Moderation' },
  { key: 'duplicateCheck', name: 'Duplicate Check', category: 'Moderation' },
  { key: 'toxicity', name: 'AI Toxicity', category: 'AI' },
  { key: 'split', name: 'Auto Split', category: 'Posting' },
  { key: 'telegram', name: 'Telegram Preview', category: 'Posting' },
  { key: 'instagram', name: 'Instagram Auto Post', category: 'Posting' },
];

export default function BackendControlsDashboard() {
  const [collegeId, setCollegeId] = useState('');
  const [colleges, setColleges] = useState([]);
  const [settings, setSettings] = useState({});
  const [search, setSearch] = useState('');

  // ✅ LOAD COLLEGES
  useEffect(() => {
    fetch(`${API_BASE}/api/admin/colleges`)
      .then((r) => r.json())
      .then((d) => {
        const list = d.data || [];
        setColleges(list);
        if (list.length) setCollegeId(list[0].collegeId);
      });
  }, []);

  // ✅ LOAD SETTINGS (COLLEGE-WISE)
  useEffect(() => {
    if (!collegeId) return;

    fetch(`${API_BASE}/api/settings/${collegeId}`)
      .then((r) => r.json())
      .then(setSettings);
  }, [collegeId]);

  const update = async (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);

    await fetch(`${API_BASE}/api/settings/${collegeId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
  };

  const filtered = useMemo(() => {
    return defaultControls.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search]);

  return (
    <div className="bg-black text-white min-h-screen p-6">
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">🚀 Control Panel</h1>
      </div>

      {/* COLLEGE */}
      <select
        value={collegeId}
        onChange={(e) => setCollegeId(e.target.value)}
        className="w-full mb-6 p-3 bg-white/10"
      >
        {colleges.map((c) => (
          <option key={c.collegeId} value={c.collegeId}>
            {c.name}
          </option>
        ))}
      </select>

      {/* SEARCH */}
      <input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 p-3 bg-white/10"
      />

      {/* CONTROLS */}
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div key={item.key} className="flex justify-between p-4 border">
            {item.name}
            <Toggle
              checked={settings[item.key]}
              onChange={() => update(item.key, !settings[item.key])}
            />
          </div>
        ))}
      </div>

      {/* SIDE PANEL */}
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <SubmitConfession />
        <ConfessionNoControl collegeId={collegeId} />
      </div>
    </div>
  );
}
