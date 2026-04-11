import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfessionTable from '../components/ConfessionTable';
import Pagination from '../components/Pagination';
import QuickPreview from '../components/QuickPreview';
import SearchBar from '../components/SearchBar';

export default function AdminDashboardPage({ collegeId }) {
  const [confessions, setConfessions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedConfession, setSelectedConfession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(
      `https://testing-confe-backend.onrender.com/api/admin/confessions/${collegeId}`,
    )
      .then((res) => res.json())
      .then((data) => {
        setConfessions(Array.isArray(data.data) ? data.data : []);
      })
      .catch((err) => {
        console.error(err);
        setConfessions([]);
      });
  }, [collegeId]);

  const filteredData = useMemo(() => {
    return confessions.filter((item) => {
      const matchesCollege =
        !collegeId || item.collegeId?.toLowerCase() === collegeId.toLowerCase();

      const matchesSearch =
        item.nickname?.toLowerCase().includes(search.toLowerCase()) ||
        item.message?.toLowerCase().includes(search.toLowerCase()) ||
        String(item.confessionNo).includes(search);

      return matchesCollege && matchesSearch;
    });
  }, [confessions, search, collegeId]);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const logout = () => {
    localStorage.removeItem('adminAuth');
    window.location.href = '/admin/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 p-6">
      {collegeId && (
        <button
          onClick={() => navigate('/admin')}
          className="mb-4 px-4 py-2 rounded-xl border border-violet-200"
        >
          ← Back
        </button>
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-violet-700">
          {collegeId?.toUpperCase()} Admin Dashboard
        </h1>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/backend')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl"
          >
            Backend Controls
          </button>

          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl"
          >
            Logout
          </button>
        </div>
      </div>
      <SearchBar
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
      />

      <div className="grid grid-cols-3 gap-6 mt-6">
        <div className="col-span-2">
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

        <QuickPreview
          confession={selectedConfession}
          onClose={() => setSelectedConfession(null)}
        />
      </div>
    </div>
  );
}
