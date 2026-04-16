import axios from 'axios';
import { useEffect, useState } from 'react';

const API_BASE = import.meta.env.DEV
  ? 'http://localhost:3001'
  : 'https://testing-confe-backend-1.onrender.com';

export default function AITrainingPage() {
  const [count, setCount] = useState(0);
  const [ready, setReady] = useState(false);
  const [text, setText] = useState('');
  const [collegeCode, setCollegeCode] = useState('');
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState([]);

  /* Fetch colleges dynamically */
  const fetchColleges = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/colleges`);

      const response = res.data;

      console.log('COLLEGES API RESPONSE:', response);

      const list = response?.data || response?.colleges || response || [];

      const finalList = Array.isArray(list) ? list : [];

      setColleges(finalList);

      if (finalList.length > 0 && !collegeCode) {
        setCollegeCode(finalList[0].collegeId);
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
      console.error('STATS ERROR:', error.message);
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
      console.error('COUNT FETCH ERROR:', error.message);
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
      console.error('LIST FETCH ERROR:', error.message);
    }
  };

  const refreshAll = async () => {
    await Promise.all([fetchCount(), fetchList(), fetchStats()]);
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
    } catch (error) {
      console.error('SAVE ERROR:', error.message);
      alert('Failed ❌');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/admin/ai-training/delete/${id}`);

      await refreshAll();
    } catch (error) {
      console.error('DELETE ERROR:', error.message);
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

      alert(
        `Imported ✅ ${res.data.inserted} | Skipped ⚠️ ${res.data.skipped}`,
      );
    } catch (error) {
      console.error('IMPORT ERROR:', error.message);
      alert('Import failed ❌');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-white">
      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 mb-6">
        <h2 className="text-3xl font-bold">🤖 AI Training Data</h2>

        <div className="mt-4 space-y-2 text-gray-300">
          <p>
            Training Count: <b>{count}</b>
          </p>

          <p>
            Status:{' '}
            <b>{ready ? '✅ AI Ready (100+)' : '⚠️ Need 100 Confessions'}</b>
          </p>
        </div>
      </div>

      {/* College Dropdown */}
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
              {college.name || college.collegeId}
            </option>
          ))}
        </select>
      </div>

      {/* Rest UI same */}
    </div>
  );
}
