export default function RecentActivityPanel({
  recentActivity,
  lastResult,
  retryFailedColleges,
  clearActivity,
}) {
  return (
    <>
      {lastResult && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Last Broadcast Result 📡
          </h2>

          <button
            onClick={retryFailedColleges}
            className="text-sm px-3 py-1 border border-white/20 rounded-xl mb-3"
          >
            Retry Failed
          </button>

          <p className="text-sm text-gray-400 mb-3">
            Failed: {lastResult.filter((r) => r.status === 'FAILED').length}
          </p>

          <div className="space-y-2">
            {lastResult.map((item, index) => (
              <div
                key={index}
                className="border border-white/10 rounded-2xl p-3"
              >
                <p>
                  {item.collegeId} → {item.status}
                  {item.confessionNo && ` #${item.confessionNo}`}
                </p>

                {item.error && (
                  <p className="text-sm text-red-400">{item.error}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Activity 📜</h2>

        <button
          onClick={clearActivity}
          className="text-sm px-3 py-1 border border-white/20 rounded-xl"
        >
          Clear
        </button>
      </div>

      {recentActivity.length === 0 ? (
        <p className="text-gray-400">No recent activity</p>
      ) : (
        <div className="space-y-3">
          {recentActivity.map((item, index) => (
            <div key={index} className="border border-white/10 rounded-2xl p-3">
              <p>
                <strong>{item.type}</strong> → {item.colleges.join(', ')}
              </p>

              <p className="text-sm text-gray-400">{item.message}</p>

              <p className="text-xs text-gray-500">{item.time}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
