export default function SearchBar({ value, onChange }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4">
      <input
        type="text"
        placeholder="Search by confession no, nickname, or text..."
        value={value}
        onChange={onChange}
        className="w-full outline-none text-gray-700"
      />
    </div>
  );
}
