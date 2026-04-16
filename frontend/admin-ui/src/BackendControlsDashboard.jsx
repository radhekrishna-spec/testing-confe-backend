import {
  BarChart3,
  Bell,
  Database,
  Image,
  Palette,
  RefreshCw,
  Save,
  Search,
  Shield,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SubmitConfession from './submitConfession';

const API_BASE = import.meta.env.DEV
  ? 'http://localhost:3001'
  : 'https://testing-confe-backend.onrender.com';

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`w-14 h-8 rounded-full relative transition-all ${
        checked ? 'bg-white' : 'bg-white/20'
      }`}
    >
      <div
        className={`absolute top-1 h-6 w-6 rounded-full transition-all ${
          checked ? 'left-7 bg-black' : 'left-1 bg-white'
        }`}
      />
    </button>
  );
}

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="flex justify-between mb-3">
        <p className="text-sm text-gray-400">{title}</p>
        <Icon size={18} />
      </div>
      <h3 className="text-2xl font-bold">{value}</h3>
    </div>
  );
}

export default function BackendControlsDashboard() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('global');
  const [colleges, setColleges] = useState([]);
  const [selectedCollegeId, setSelectedCollegeId] =
    useState('');

  const [controls, setControls] = useState([
    {
      name: 'Spam Filter',
      key: 'spamFilter',
      desc: 'Detect repeated links and spam',
      category: 'Moderation',
      enabled: true,
    },
    {
      name: 'Duplicate Check',
      key: 'duplicateCheck',
      desc: 'Prevent repost',
      category: 'Moderation',
      enabled: true,
    },
    {
      name: 'AI Toxicity Check',
      key: 'toxicity',
      desc: 'Reject harmful content',
      category: 'AI',
      enabled: true,
    },
  ]);

  const [aiText, setAiText] = useState('');
  const [savingAI, setSavingAI] = useState(false);

  /* Fetch colleges dynamically */
  useEffect(() => {
    fetch(`${API_BASE}/api/admin/colleges`)
      .then((res) => res.json())
      .then((data) => {
        const list = data?.data || [];
        setColleges(list);

        if (list.length > 0) {
          setSelectedCollegeId(
            list[0].collegeId
          );
        }
      })
      .catch(console.error);
  }, []);

  /* Fetch college-wise settings */
  useEffect(() => {
    if (!selectedCollegeId) return;

    fetch(
      `${API_BASE}/api/settings/${selectedCollegeId}`
    )
      .then((res) => res.json())
      .then((data) => {
        setControls((prev) =>
          prev.map((item) => ({
            ...item,
            enabled:
              data[item.key] ??
              item.enabled,
          }))
        );
      })
      .catch(console.error);
  }, [selectedCollegeId]);

  const filtered = useMemo(() => {
    return controls.filter((item) =>
      item.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [controls, search]);

  const toggleItem = async (key) => {
    const updated = controls.map((item) =>
      item.key === key
        ? {
            ...item,
            enabled: !item.enabled,
          }
        : item
    );

    setControls(updated);

    const payload = {};
    updated.forEach((item) => {
      payload[item.key] = item.enabled;
    });

    await fetch(
      `${API_BASE}/api/settings/${selectedCollegeId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify(payload),
      }
    );
  };

  const saveAITraining = async () => {
    if (!aiText.trim()) {
      alert('Write training text first');
      return;
    }

    if (!selectedCollegeId) {
      alert('Select a college first');
      return;
    }

    try {
      setSavingAI(true);

      await fetch(
        `${API_BASE}/api/admin/ai-training/add`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            collegeCode:
              selectedCollegeId,
            text: aiText,
            source: 'super_admin',
          }),
        }
      );

      alert(
        `AI training saved for ${selectedCollegeId} ✅`
      );
      setAiText('');
    } catch (error) {
      alert('Save failed ❌');
    } finally {
      setSavingAI(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">
            ⚙ Backend Control Center
          </h1>
          <p className="text-gray-400 mt-2">
            College-wise backend controls
          </p>
        </div>

        <button
          onClick={() =>
            navigate('/admin')
          }
          className="px-4 py-2 rounded-xl border border-white/20"
        >
          Dashboard
        </button>
      </div>

      {/* College Selector */}
      <div className="mb-6">
        <label className="text-sm text-gray-400 block mb-2">
          Select College
        </label>

        <select
          value={selectedCollegeId}
          onChange={(e) =>
            setSelectedCollegeId(
              e.target.value
            )
          }
          className="w-full rounded-2xl bg-white/5 border border-white/10 p-3"
        >
          {colleges.map((college) => (
            <option
              key={college.collegeId}
              value={
                college.collegeId
              }
              className="text-black"
            >
              {college.name ||
                college.collegeId}
            </option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        {['global', 'ai'].map(
          (tab) => (
            <button
              key={tab}
              onClick={() =>
                setActiveTab(tab)
              }
              className={`px-5 py-3 rounded-2xl ${
                activeTab === tab
                  ? 'bg-white text-black'
                  : 'border border-white/20'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          )
        )}
      </div>

      {/* Global Controls */}
      {activeTab === 'global' && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((item) => (
              <div
                key={item.key}
                className="rounded-3xl border border-white/10 bg-white/5 p-5 flex justify-between"
              >
                <div>
                  <p className="text-xs text-gray-400">
                    {item.category}
                  </p>
                  <h2 className="font-semibold">
                    {item.name}
                  </h2>
                  <p className="text-sm text-gray-300">
                    {item.desc}
                  </p>
                </div>

                <Toggle
                  checked={
                    item.enabled
                  }
                  onChange={() =>
                    toggleItem(
                      item.key
                    )
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Training */}
      {activeTab === 'ai' && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-2xl font-bold mb-4">
            AI Training 🤖
          </h2>

          <textarea
            value={aiText}
            onChange={(e) =>
              setAiText(
                e.target.value
              )
            }
            placeholder="Write AI training..."
            className="w-full h-40 rounded-2xl bg-white/5 border border-white/10 p-4"
          />

          <button
            onClick={saveAITraining}
            className="mt-4 px-5 py-3 rounded-2xl bg-white text-black"
          >
            {savingAI
              ? 'Saving...'
              : 'Save Training'}
          </button>
        </div>
      )}
    </div>
  );
}