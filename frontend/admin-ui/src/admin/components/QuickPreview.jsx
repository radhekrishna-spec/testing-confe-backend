export default function QuickPreview({
  confession,
  onClose,
}) {
  const copyText = async () => {
    if (!confession?.message) return;

    await navigator.clipboard.writeText(confession.message);
    alert('Copied ✅');
  };

  if (!confession) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl text-white overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/10 px-6 py-4">
          <h2 className="text-xl font-bold">
            📝 Confession #{confession.confessionNo}
          </h2>

          <div className="flex gap-3">
            <button
              onClick={copyText}
              className="px-4 py-2 rounded-2xl border border-white/20 hover:bg-white/10 transition"
            >
              Copy
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-2xl border border-white/20 hover:bg-white/10 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 leading-8 whitespace-pre-wrap text-gray-200">
            {confession.message}
          </div>

          {/* Footer meta */}
          <div className="mt-4 text-sm text-gray-400 flex flex-wrap gap-4">
            <span>
              👤 {confession.nickname || 'Anonymous'}
            </span>

            <span>
              🕒{' '}
              {confession.createdAt
                ? new Date(
                    confession.createdAt
                  ).toLocaleString()
                : '--'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}