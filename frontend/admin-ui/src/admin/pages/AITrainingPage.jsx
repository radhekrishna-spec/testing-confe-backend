import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { API_BASE } from '../../config';

export default function AITrainingPage() {
  const [count, setCount] = useState(0);
  const [ready, setReady] = useState(false);
  const [text, setText] = useState('');
  const [collegeCode, setCollegeCode] = useState('');
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState([]);

  const selectedCollege = useMemo(() => {
    return colleges.find((c) => c.collegeId === collegeCode);
  }, [colleges, collegeCode]);

  const fetchColleges = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/colleges`);

      const list = res.data?.data || res.data?.colleges || [];

      setColleges(list);

      if (list.length > 0 && !collegeCode) {
        setCollegeCode(list[0].collegeId);
      }
    } catch (error) {
      console.error('COLLEGE FETCH ERROR:', error.message);
    }
  };

  const fetchStats = async () => {
    if (!collegeCode) return;

    try {
      const res = await axios.get(
        `${API_BASE}/api/admin/ai-training/stats/${collegeCode}`,
      );

      setStats(res.data.stats || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCount = async () => {
    if (!collegeCode) return;

    try {
      const res = await axios.get(
        `${API_BASE}/api/admin/ai-training/count/${collegeCode}`,
      );

      setCount(res.data.count || 0);
      setReady(res.data.readyForAI || false);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchList = async () => {
    if (!collegeCode) return;

    try {
      const res = await axios.get(
        `${API_BASE}/api/admin/ai-training/list/${collegeCode}`,
      );

      setItems(res.data.items || []);
    } catch (error) {
      console.error(error);
    }
  };

  const refreshAll = async () => {
    await Promise.all([fetchCount(), fetchStats(), fetchList()]);
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  useEffect(() => {
    if (collegeCode) {
      refreshAll();
    }
  }, [collegeCode]);

  const handleSave = async () => {
    if (!text.trim()) return;

    try {
      setLoading(true);

      await axios.post(`${API_BASE}/api/admin/ai-training/add`, {
        collegeCode,
        text,
        source: 'admin',
      });

      setText('');
      await refreshAll();

      alert(`Saved for ${collegeCode} ✅`);
    } catch {
      alert('Failed ❌');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/admin/ai-training/delete/${id}`);

      await refreshAll();
    } catch {
      alert('Delete failed ❌');
    }
  };

  const handleImportLegacy = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        `${API_BASE}/api/admin/ai-training/import-legacy/${collegeCode}`,
        {
          limit: 100,
        },
      );

      await refreshAll();

      alert(`Imported ${res.data.inserted} ✅`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-white">
      {/* Top stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-gray-400">College</p>
          <h2 className="text-2xl font-bold mt-2">
            {selectedCollege?.name || collegeCode}
          </h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-gray-400">Training Count</p>
          <h2 className="text-2xl font-bold mt-2">{count}</h2>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-gray-400">AI Status</p>
          <h2 className="text-xl font-bold mt-2">
            {ready ? '✅ Ready' : '⚠️ Need 100+'}
          </h2>
        </div>
      </div>

      {/* Dropdown */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 mb-6">
        <label className="block text-sm text-gray-400 mb-2">
          Select College
        </label>

        <select
          value={collegeCode}
          onChange={(e) => setCollegeCode(e.target.value)}
          className="w-full rounded-2xl bg-white/5 border border-white/10 p-3 text-white"
        >
          {colleges.map((college) => (
            <option
              key={college.collegeId}
              value={college.collegeId}
              className="text-black"
            >
              {college.name}
            </option>
          ))}
        </select>
      </div>

      {/* Input */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 mb-6">
        <textarea
          rows="6"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter training confession..."
          className="w-full rounded-2xl bg-white/5 border border-white/10 p-4"
        />

        <div className="flex flex-wrap gap-3 mt-4">
          <button
            onClick={handleImportLegacy}
            className="px-5 py-3 rounded-2xl border border-white/20"
          >
            🔥 Import Legacy
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-3 rounded-2xl bg-white text-black"
          >
            ➕ Add Training
          </button>

          <button
            onClick={refreshAll}
            className="px-5 py-3 rounded-2xl border border-white/20"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Source stats */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Source Stats</h3>

        {stats.length === 0 ? (
          <p className="text-gray-400">No stats yet</p>
        ) : (
          stats.map((stat) => (
            <div key={stat._id} className="mb-3">
              {stat._id}: <b>{stat.count}</b>
            </div>
          ))
        )}
      </div>

      {/* Recent items */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-xl font-semibold mb-4">Recent Training Data</h3>

        {items.length === 0 ? (
          <p className="text-gray-400">No training data</p>
        ) : (
          items.map((item) => (
            <div
              key={item._id}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 mb-4"
            >
              <p>{item.text}</p>

              <div className="mt-3 flex justify-between items-center">
                <small className="text-gray-400">{item.source}</small>

                <button
                  onClick={() => handleDelete(item._id)}
                  className="px-3 py-2 rounded-xl border border-red-400 text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
