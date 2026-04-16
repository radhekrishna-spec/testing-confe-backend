export default function GlobalComposerPanel({
  colleges,
  selectedColleges,
  setSelectedColleges,
  message,
  setMessage,
  loading,
  progressText,
  sendToSelectedColleges,
  sendToAllColleges,
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 mb-8">
      <h2 className="text-xl font-semibold mb-4">
        Global Confession Composer ✍️
      </h2>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write confession for selected colleges..."
        rows={4}
        className="w-full border border-white/10 bg-black rounded-2xl p-3 text-white placeholder:text-gray-400 mb-4 outline-none resize-none"
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

      {loading && <p className="text-sm text-gray-400 mb-3">{progressText}</p>}

      <div className="flex gap-3">
        <button
          onClick={sendToSelectedColleges}
          disabled={loading}
          className="px-5 py-3 rounded-2xl bg-white text-black font-semibold"
        >
          Send Selected
        </button>

        <button
          onClick={sendToAllColleges}
          disabled={loading}
          className="px-5 py-3 rounded-2xl border border-white/20"
        >
          Send All
        </button>
      </div>
    </div>
  );
}
