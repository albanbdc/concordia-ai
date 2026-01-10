import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white p-4 space-y-4">
        <h2 className="text-lg font-semibold">Concordia</h2>

        <nav className="space-y-1">
          <Link
            href="/dashboard"
            className="block px-3 py-2 rounded hover:bg-slate-100"
          >
            Tableau de bord
          </Link>

          <Link
            href="/dashboard/audit"
            className="block px-3 py-2 rounded hover:bg-slate-100"
          >
            Lancer un audit IA
          </Link>

          <Link
            href="/dashboard/audits"
            className="block px-3 py-2 rounded hover:bg-slate-100"
          >
            Historique des audits
          </Link>

          
        </nav>
      </aside>

      {/* Contenu */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
