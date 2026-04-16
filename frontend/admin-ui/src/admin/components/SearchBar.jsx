import { Search } from 'lucide-react';

export default function SearchBar({
  value,
  onChange,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
      <div className="flex items-center gap-3">
        <Search size={18} className="text-gray-400" />

        <input
          type="text"
          placeholder="Search by confession no, nickname, or text..."
          value={value}
          onChange={onChange}
          className="w-full bg-transparent outline-none text-white placeholder:text-gray-500"
        />
      </div>
    </div>
  );
}