import axios from 'axios';
import { useEffect, useState } from 'react';

export default function AITrainingPage() {
  const [count, setCount] = useState(0);
  const [ready, setReady] = useState(false);
  const [text, setText] = useState('');
  const [collegeCode, setCollegeCode] = useState('miet');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState([]);

  const fetchStats = async () => {
    try {
      const res = await axios.get(
        `/api/admin/ai-training/stats/${collegeCode}`,
      );

      setStats(res.data.stats || []);
    } catch (error) {
      console.error('STATS ERROR:', error.message);
    }
  };

  const fetchCount = async () => {
    try {
      const res = await axios.get(
        `/api/admin/ai-training/count/${collegeCode}`,
      );

      setCount(res.data.count || 0);
      setReady(res.data.readyForAI || false);
    } catch (error) {
      console.error('COUNT FETCH ERROR:', error.message);
    }
  };

  const fetchList = async () => {
    try {
      const res = await axios.get(`/api/admin/ai-training/list/${collegeCode}`);

      setItems(res.data.items || []);
    } catch (error) {
      console.error('LIST FETCH ERROR:', error.message);
    }
  };

  const refreshAll = async () => {
    await Promise.all([fetchCount(), fetchList(), fetchStats()]);
  };

  useEffect(() => {
    refreshAll();
  }, [collegeCode]);

  const handleSave = async () => {
    if (!text.trim()) return;

    try {
      setLoading(true);

      await axios.post('/api/admin/ai-training/add', {
        collegeCode,
        text,
        source: 'admin',
      });

      setText('');

      await refreshAll();

      alert('Saved to AI training ✅');
    } catch (error) {
      console.error('SAVE ERROR:', error.message);
      alert('Failed ❌');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/admin/ai-training/delete/${id}`);

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
        `/api/admin/ai-training/import-legacy/${collegeCode}`,
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
    <div style={{ padding: '20px' }}>
      <h2>AI Training Data</h2>

      <p>
        Training Count: <b>{count}</b>
      </p>

      <p>
        Status:{' '}
        <b>{ready ? '✅ AI Ready (100+)' : '⚠️ Need 100 Confessions'}</b>
      </p>

      <h3>Source Stats</h3>

      {stats.length === 0 ? (
        <p>No stats yet</p>
      ) : (
        stats.map((stat) => (
          <p key={stat._id}>
            {stat._id}: <b>{stat.count}</b>
          </p>
        ))
      )}

      <br />

      <select
        value={collegeCode}
        onChange={(e) => setCollegeCode(e.target.value)}
      >
        <option value="miet">MIET</option>
        <option value="niet">NIET</option>
      </select>

      <br />
      <br />

      <textarea
        rows="6"
        cols="60"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter confession for AI learning"
      />

      <br />
      <br />
      <br />
      <br />

      <button onClick={handleImportLegacy} disabled={loading}>
        {loading ? 'Importing...' : 'Import 100 Legacy 🔥'}
      </button>

      <button onClick={handleSave} disabled={loading}>
        {loading ? 'Saving...' : 'Add to AI Training'}
      </button>

      <hr style={{ margin: '20px 0' }} />

      <h3>Recent Training Data</h3>

      {items.length === 0 ? (
        <p>No data yet</p>
      ) : (
        items.map((item) => (
          <div
            key={item._id}
            style={{
              border: '1px solid #ccc',
              padding: '10px',
              marginBottom: '10px',
              borderRadius: '8px',
            }}
          >
            <p>{item.text}</p>

            <small>
              Source: <b>{item.source}</b>
            </small>

            <br />
            <br />

            <button onClick={() => handleDelete(item._id)}>Delete ❌</button>
          </div>
        ))
      )}
    </div>
  );
}
