import { useNavigate } from 'react-router-dom';

export default function AITrainingPanel({
  colleges,
  selectedColleges,
  setSelectedColleges,
  aiText,
  setAiText,
  savingAI,
  saveAITraining,
}) {
  const navigate = useNavigate();

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 mb-8">
      <h2 className="text-xl font-semibold mb-4">AI Training Center 🤖</h2>

      <textarea
        value={aiText}
        onChange={(e) => setAiText(e.target.value)}
        placeholder="Write AI training text..."
        rows={5}
        className="w-full border border-white/10 bg-black rounded-2xl p-3 text-white mb-4"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {colleges.map((college) => (
          <label
            key={college.collegeId}
            className="flex items-center gap-2 border border-white/10 rounded-xl p-2"
          >
            <input
              type="checkbox"
              checked={selectedColleges.includes(college.collegeId)}
              onChange={() => {
                setSelectedColleges((prev) =>
                  prev.includes(college.collegeId)
                    ? prev.filter((c) => c !== college.collegeId)
                    : [...prev, college.collegeId],
                );
              }}
            />
            <span>{college.name}</span>
          </label>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={saveAITraining}
          className="px-5 py-3 rounded-2xl bg-white text-black font-semibold"
        >
          {savingAI ? 'Saving...' : 'Save AI Training'}
        </button>
      </div>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {colleges.map((college) => (
          <button
            key={college.collegeId}
            onClick={() =>
              navigate(`/admin/college/${college.collegeId}/ai-training`)
            }
            className="border border-white/10 rounded-2xl p-4 text-left hover:bg-white/10"
          >
            {college.name}
          </button>
        ))}
      </div>
    </div>
  );
}
