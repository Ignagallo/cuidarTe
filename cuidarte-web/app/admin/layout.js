import Link from "next/link";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1d4a74] text-white flex flex-col shadow-lg">
        <div className="px-6 py-4 text-2xl font-bold border-b border-white/20">
          CuidarTE Admin
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link href="/admin" className="block p-2 rounded-lg hover:bg-[#04bf8a]">📅 Agenda</Link>
          <Link href="/admin/clientes" className="block p-2 rounded-lg hover:bg-[#04bf8a]">👥 Clientes</Link>
          <Link href="/admin/profesionales" className="block p-2 rounded-lg hover:bg-[#04bf8a]">💼 Profesionales</Link>
          <Link href="/admin/servicios" className="block p-2 rounded-lg hover:bg-[#04bf8a]">🛠 Servicios</Link>
        </nav>
      </aside>

      {/* Contenido */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
