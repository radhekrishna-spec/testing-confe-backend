export default function QuickPreview({ confession }) {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 h-fit sticky top-6">
      {!confession ? (
        <div className="text-center text-gray-500 py-10">
          <p className="text-lg font-semibold">Select a confession</p>
          <p className="text-sm mt-2">
            Click any row from the table to preview details
          </p>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-bold text-violet-700 mb-4">
            Confession #{confession.id}
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Nickname</p>
              <p className="font-medium">{confession.nickname}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Mood</p>
              <p>{confession.mood}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p>{confession.date}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Confession Text</p>

              <div className="rounded-2xl bg-violet-50 p-4 leading-7">
                {confession.text}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
