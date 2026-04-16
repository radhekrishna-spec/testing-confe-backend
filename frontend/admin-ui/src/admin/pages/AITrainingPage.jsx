import axios from 'axios';
import { useEffect, useState } from 'react';

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
      const res = await axios.get(
        '/api/admin/colleges'
      );

      const list = res.data?.data || [];

      setColleges(list);

      if (
        list.length > 0 &&
        !collegeCode
      ) {
        setCollegeCode(
          list[0].collegeId
        );
      }
    } catch (error) {
      console.error(
        'COLLEGE FETCH ERROR:',
        error.message
      );
    }
  };

  const fetchStats = async () => {
    if (!collegeCode) return;

    try {
      const res = await axios.get(
        `/api/admin/ai-training/stats/${collegeCode}`
      );

      setStats(
        res.data.stats || []
      );
    } catch (error) {
      console.error(
        'STATS ERROR:',
        error.message
      );
    }
  };

  const fetchCount = async () => {
    if (!collegeCode) return;

    try {
      const res = await axios.get(
        `/api/admin/ai-training/count/${collegeCode}`
      );

      setCount(
        res.data.count || 0
      );
      setReady(
        res.data.readyForAI ||
          false
      );
    } catch (error) {
      console.error(
        'COUNT FETCH ERROR:',
        error.message
      );
    }
  };

  const fetchList = async () => {
    if (!collegeCode) return;

    try {
      const res = await axios.get(
        `/api/admin/ai-training/list/${collegeCode}`
      );

      setItems(
        res.data.items || []
      );
    } catch (error) {
      console.error(
        'LIST FETCH ERROR:',
        error.message
      );
    }
  };

  const refreshAll = async () => {
    await Promise.all([
      fetchCount(),
      fetchList(),
      fetchStats(),
    ]);
  };

  /* First load colleges */
  useEffect(() => {
    fetchColleges();
  }, []);

  /* Refresh on college change */
  useEffect(() => {
    if (collegeCode) {
      refreshAll();
    }
  }, [collegeCode]);

  const handleSave = async () => {
    if (!text.trim()) return;

    try {
      setLoading(true);

      await axios.post(
        '/api/admin/ai-training/add',
        {
          collegeCode,
          text,
          source: 'admin',
        }
      );

      setText('');
      await refreshAll();

      alert(
        `Saved for ${collegeCode} ✅`
      );
    } catch (error) {
      console.error(
        'SAVE ERROR:',
        error.message
      );
      alert('Failed ❌');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (
    id
  ) => {
    try {
      await axios.delete(
        `/api/admin/ai-training/delete/${id}`
      );

      await refreshAll();
    } catch (error) {
      console.error(
        'DELETE ERROR:',
        error.message
      );
      alert('Delete failed ❌');
    }
  };

  const handleImportLegacy =
    async () => {
      try {
        setLoading(true);

        const res =
          await axios.post(
            `/api/admin/ai-training/import-legacy/${collegeCode}`,
            {
              limit: 100,
            }
          );

        await refreshAll();

        alert(
          `Imported ✅ ${res.data.inserted} | Skipped ⚠️ ${res.data.skipped}`
        );
      } catch (error) {
        console.error(
          'IMPORT ERROR:',
          error.message
        );
        alert(
          'Import failed ❌'
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="text-white">
      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 mb-6">
        <h2 className="text-3xl font-bold">
          🤖 AI Training Data
        </h2>

        <div className="mt-4 space-y-2 text-gray-300">
          <p>
            Training Count:{' '}
            <b>{count}</b>
          </p>

          <p>
            Status:{' '}
            <b>
              {ready
                ? '✅ AI Ready (100+)'
                : '⚠️ Need 100 Confessions'}
            </b>
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">
          Source Stats
        </h3>

        {stats.length === 0 ? (
          <p className="text-gray-400">
            No stats yet
          </p>
        ) : (
          stats.map((stat) => (
            <p
              key={stat._id}
              className="mb-2"
            >
              {stat._id}:{' '}
              <b>
                {stat.count}
              </b>
            </p>
          ))
        )}
      </div>

      {/* College Dropdown */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 mb-6">
        <label className="block text-sm text-gray-400 mb-2">
          Select College
        </label>

        <select
          value={collegeCode}
          onChange={(e) =>
            setCollegeCode(
              e.target.value
            )
          }
          className="w-full rounded-2xl bg-white/5 border border-white/10 p-3 text-white"
        >
          {colleges.map(
            (college) => (
              <option
                key={
                  college.collegeId
                }
                value={
                  college.collegeId
                }
                className="text-black"
              >
                {college.name ||
                  college.collegeId}
              </option>
            )
          )}
        </select>
      </div>

      {/* Input */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 mb-6">
        <textarea
          rows="6"
          value={text}
          onChange={(e) =>
            setText(
              e.target.value
            )
          }
          placeholder="Enter confession for AI learning"
          className="w-full rounded-2xl bg-white/5 border border-white/10 p-4"
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={
              handleImportLegacy
            }
            disabled={loading}
            className="px-5 py-3 rounded-2xl border border-white/20"
          >
            {loading
              ? 'Importing...'
              : 'Import 100 Legacy 🔥'}
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-3 rounded-2xl bg-white text-black"
          >
            {loading
              ? 'Saving...'
              : 'Add to AI Training'}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-xl font-semibold mb-4">
          Recent Training Data
        </h3>

        {items.length === 0 ? (
          <p className="text-gray-400">
            No data yet
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item._id}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 mb-4"
            >
              <p>{item.text}</p>

              <small className="text-gray-400">
                Source:{' '}
                <b>
                  {item.source}
                </b>
              </small>

              <br />
              <br />

              <button
                onClick={() =>
                  handleDelete(
                    item._id
                  )
                }
                className="px-4 py-2 rounded-xl border border-red-400 text-red-400"
              >
                Delete ❌
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}