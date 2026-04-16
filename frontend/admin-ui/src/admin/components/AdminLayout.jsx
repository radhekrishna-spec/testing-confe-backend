import AdminNavbar from './AdminNavbar';

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <AdminNavbar />
      <div className="p-6">{children}</div>
    </div>
  );
}
