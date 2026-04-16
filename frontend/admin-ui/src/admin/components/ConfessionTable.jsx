export default function ConfessionTable({
  confessions = [],
  onSelect,
}) {
  const getPreview = (text) => {
    if (!text) return 'No message';
    const words = text.split(' ').slice(0, 8).join(' ');
    return `${words}...`;
  };

  const formatDateTime = (date) => {
    if (!date) return '--';
    return new Date(date).toLocaleString();
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-white">
          {/* Header */}
          <thead className="border-b border-white/10 bg-white/5">
            <tr>
              <th className="p-4 text-left text-sm font-semibold text-gray-300">
                Confession No.
              </th>
              <th className="p-4 text-left text-sm font-semibold text-gray-300">
                Nickname
              </th>
              <th className="p-4 text-left text-sm font-semibold text-gray-300">
                Preview
              </th>
              <th className="p-4 text-left text-sm font-semibold text-gray-300">
                Created Time
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {confessions.length > 0 ? (
              confessions.map((item) => (
                <tr
                  key={item._id}
                  onClick={() => onSelect(item)}
                  className="border-b border-white/10 hover:bg-white/10 cursor-pointer transition-all"
                >
                  <td className="p-4 font-medium">
                    #{item.confessionNo}
                  </td>

                  <td className="p-4 text-gray-300">
                    {item.nickname || 'Anonymous'}
                  </td>

                  <td className="p-4 text-gray-400 max-w-xs truncate">
                    {getPreview(item.message)}
                  </td>

                  <td className="p-4 text-gray-400 text-sm">
                    {formatDateTime(item.createdAt)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="p-6 text-center text-gray-400"
                >
                  No confessions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}