import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfessionTable from '../components/ConfessionTable';
import Pagination from '../components/Pagination';
import QuickPreview from '../components/QuickPreview';
import SearchBar from '../components/SearchBar';

//const API_BASE = 'https://testing-confe-backend.onrender.com';
const API_BASE = 'http://localhost:3008';

export default function AdminDashboardPage({ collegeId }) {
  const [confessions, setConfessions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedConfession, setSelectedConfession] = useState(null);
  const [paymentEnabled, setPaymentEnabled] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [aiStats, setAiStats] = useState({
    count: 0,
    ready: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/ai-training/count/${collegeId}`)
      .then((res) => res.json())
      .then((data) => {
        setAiStats({
          count: data.count || 0,
          ready: data.readyForAI || false,
        });
      })
      .catch(console.error);
  }, [collegeId]);

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/confessions/${collegeId}`)
      .then((res) => res.json())
      .then((data) => {
        setConfessions(Array.isArray(data.data) ? data.data : []);
      })
      .catch(() => setConfessions([]));
  }, [collegeId]);

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/college/${collegeId}`)
      .then((res) => res.json())
      .then((data) => {
        setPaymentEnabled(!!data?.data?.payment?.enabled);
      })
      .catch(console.error);
  }, [collegeId]);

  const togglePayment = async () => {
    try {
      setUpdatingPayment(true);

      const res = await fetch(
        `${API_BASE}/api/admin/college/${collegeId}/payment`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            enabled: !paymentEnabled,
          }),
        },
      );

      const data = await res.json();

      if (data.success) {
        setPaymentEnabled(!paymentEnabled);
      }
    } catch (error) {
      alert('Update failed ❌');
    } finally {
      setUpdatingPayment(false);
    }
  };

  const filteredData = useMemo(() => {
    return confessions.filter((item) => {
      const matchesSearch =
        item.nickname?.toLowerCase().includes(search.toLowerCase()) ||
        item.message?.toLowerCase().includes(search.toLowerCase()) ||
        String(item.confessionNo).includes(search);

      return matchesSearch;
    });
  }, [confessions, search]);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="text-white">
      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              🏫 {collegeId?.toUpperCase()} Dashboard
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Manage confessions, AI and payment
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate(`/admin/college/${collegeId}/edit`)}
              className="px-4 py-2 rounded-2xl border border-white/20 hover:bg-white/10"
            >
              ✏ Edit
            </button>

            <button
              onClick={() =>
                navigate(`/admin/college/${collegeId}/ai-training`)
              }
              className="px-4 py-2 rounded-2xl border border-white/20 hover:bg-white/10"
            >
              🤖 AI
            </button>

            <button
              onClick={togglePayment}
              disabled={updatingPayment}
              className={`px-4 py-2 rounded-2xl ${
                paymentEnabled
                  ? 'bg-green-500 text-white'
                  : 'border border-white/20'
              }`}
            >
              {updatingPayment
                ? 'Updating...'
                : paymentEnabled
                  ? '💳 Payment ON'
                  : '🚫 Payment OFF'}
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 mb-6">
        <SearchBar
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Stats */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-400">AI Training Count</p>
            <h3 className="text-2xl font-bold mt-1">{aiStats.count}</h3>
          </div>

          <span
            className={`px-4 py-2 rounded-full text-sm ${
              aiStats.ready
                ? 'bg-green-500/20 text-green-400'
                : 'bg-yellow-500/20 text-yellow-400'
            }`}
          >
            {aiStats.ready ? 'AI Ready' : 'Need 100+'}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-4">
          <ConfessionTable
            confessions={paginatedData}
            onSelect={setSelectedConfession}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <QuickPreview
            confession={selectedConfession}
            onClose={() => setSelectedConfession(null)}
          />
        </div>
      </div>
    </div>
  );
}
