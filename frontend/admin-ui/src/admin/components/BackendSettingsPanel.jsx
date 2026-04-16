export default function BackendSettingsPanel({
  colleges,
  selectedColleges,
  setSelectedColleges,
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-5">⚙ Backend Settings Center</h2>

      <p className="text-gray-400 mb-4">
        Select colleges and apply backend rules
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {colleges.map((college) => (
          <label
            key={college.collegeId}
            className="flex items-center gap-2 border border-white/10 rounded-2xl p-3 hover:bg-white/5"
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

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 p-4">
          <h3 className="font-semibold mb-2">Moderation Rules</h3>

          <div className="space-y-3">
            <label className="flex justify-between">
              Spam Filter
              <input type="checkbox" />
            </label>

            <label className="flex justify-between">
              Profanity Filter
              <input type="checkbox" />
            </label>

            <label className="flex justify-between">
              Duplicate Check
              <input type="checkbox" />
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 p-4">
          <h3 className="font-semibold mb-2">Posting Rules</h3>

          <div className="space-y-3">
            <label className="flex justify-between">
              Auto Post
              <input type="checkbox" />
            </label>

            <label className="flex justify-between">
              AI Rewrite
              <input type="checkbox" />
            </label>
          </div>
        </div>
      </div>

      <button className="mt-6 px-6 py-3 rounded-2xl bg-white text-black font-semibold">
        Save For Selected Colleges
      </button>
    </div>
  );
}
