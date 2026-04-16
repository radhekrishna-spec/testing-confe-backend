import { useNavigate } from 'react-router-dom';

export default function CollegesGrid({ colleges }) {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex justify-between items-center mb-4 mt-8">
        <h2 className="text-2xl font-bold">🏫 Manage Colleges</h2>

        <button
          onClick={() => navigate('/admin/create-college')}
          className="px-4 py-2 rounded-xl bg-white text-black font-semibold"
        >
          + Add New
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {colleges.map((college) => (
          <div
            key={college.collegeId}
            onClick={() => navigate(`/admin/college/${college.collegeId}`)}
            className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition-all cursor-pointer"
          >
            <h2 className="text-xl font-semibold mb-2">{college.name}</h2>

            <p className="text-sm text-gray-400">
              Pending: {college.pending || 0}
            </p>

            <p className="text-sm text-gray-400">
              Posted Today: {college.postedToday || 0}
            </p>

            <div className="flex gap-2 mt-3 flex-wrap">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/college/${college.collegeId}/settings`);
                }}
                className="text-xs border border-white/20 px-3 py-1 rounded-xl"
              >
                Settings
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/college/${college.collegeId}/edit`);
                }}
                className="text-xs border border-blue-400 px-3 py-1 rounded-xl"
              >
                Edit
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/college/${college.collegeId}/ai-training`);
                }}
                className="text-xs border border-white/20 px-3 py-1 rounded-xl"
              >
                AI
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
