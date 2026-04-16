import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function CollegeAITrainingDetailsPage() {
  const { collegeId } = useParams();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [stats, setStats] = useState([]);

  const [count, setCount] = useState(0);
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    try {
      const countRes = await fetch(
        `https://testing-confe-backend.onrender.com/api/admin/ai-training/count/${collegeId}`,
      );

      const listRes = await fetch(
        `https://testing-confe-backend.onrender.com/api/admin/ai-training/list/${collegeId}`,
      );

      const statsRes = await fetch(
        `https://testing-confe-backend.onrender.com/api/admin/ai-training/stats/${collegeId}`,
      );

      const countData = await countRes.json();
      const listData = await listRes.json();
      const statsData = await statsRes.json();

      setCount(countData.count || 0);
      setReady(countData.readyForAI || false);
      setItems(listData.items || []);
      setStats(statsData.stats || []);
    } catch (error) {
      console.error('FETCH ERROR:', error);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [collegeId]);

  const addTraining = async () => {
    if (!text.trim()) {
      alert('Please write training text first');
      return;
    }

    try {
      setLoading(true);

      await fetch(
        `https://testing-confe-backend.onrender.com/api/admin/ai-training/add`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            collegeCode: collegeId,
            text,
            source: 'admin',
          }),
        },
      );

      setText('');
      await fetchAll();
    } catch (error) {
      console.error('ADD ERROR:', error);
      alert('Add failed ❌');
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    try {
      await fetch(
        `https://testing-confe-backend.onrender.com/api/admin/ai-training/delete/${id}`,
        {
          method: 'DELETE',
        },
      );

      await fetchAll();
    } catch (error) {
      console.error('DELETE ERROR:', error);
    }
  };

  const saveEdit = async () => {
    try {
      await fetch(
        `https://testing-confe-backend.onrender.com/api/admin/ai-training/update/${editingId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: editText,
          }),
        },
      );

      setEditingId(null);
      setEditText('');
      await fetchAll();
    } catch (error) {
      console.error('EDIT ERROR:', error);
      alert('Edit failed ❌');
    }
  };

  const filteredItems = items.filter((item) =>
    item.text?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-violet-50 p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 border px-4 py-2 rounded-xl"
      >
        ← Back
      </button>

      <div className="bg-white rounded-3xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-violet-700">
          {collegeId?.toUpperCase()} AI Training Details
        </h1>

        {/* Stats */}
        <div className="mt-4 flex gap-4 flex-wrap">
          <div className="border rounded-2xl p-4">
            Count: <b>{count}</b>
          </div>

          <div className="border rounded-2xl p-4">
            Status: <b>{ready ? 'AI Ready ✅' : 'Need 100+ ⚠️'}</b>
          </div>

          {stats.map((stat) => (
            <div key={stat._id} className="border rounded-2xl p-4">
              {stat._id}: <b>{stat.count}</b>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="mt-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search training data..."
            className="w-full border rounded-2xl p-3"
          />
        </div>

        {/* Add */}
        <div className="mt-6">
          <textarea
            rows="5"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add AI training text"
            className="w-full border rounded-2xl p-4"
          />

          <button
            onClick={addTraining}
            className="mt-3 bg-violet-600 text-white px-4 py-2 rounded-xl"
          >
            {loading ? 'Saving...' : 'Add Training'}
          </button>
        </div>

        {/* List */}
        <div className="mt-6 space-y-3">
          {filteredItems.map((item) => (
            <div key={item._id} className="border rounded-2xl p-4">
              <p>{item.text}</p>

              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => deleteItem(item._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded-xl"
                >
                  Delete
                </button>

                <button
                  onClick={() => {
                    setEditingId(item._id);
                    setEditText(item.text);
                  }}
                  className="bg-blue-500 text-white px-3 py-1 rounded-xl"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Edit */}
        {editingId && (
          <div className="mt-6 border rounded-2xl p-4 bg-gray-50">
            <h3 className="font-bold mb-2">Edit Training</h3>

            <textarea
              rows="4"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full border rounded-xl p-3"
            />

            <div className="flex gap-3 mt-3">
              <button
                onClick={saveEdit}
                className="bg-green-500 text-white px-4 py-2 rounded-xl"
              >
                Save Edit
              </button>

              <button
                onClick={() => {
                  setEditingId(null);
                  setEditText('');
                }}
                className="border px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
