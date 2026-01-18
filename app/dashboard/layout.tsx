// app/dashboard/layout.tsx
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        {/* Sidebar (style Concordia d'avant) */}
        <aside className="w-64 border-r border-slate-200 p-6">
          <div className="text-lg font-semibold text-slate-900">Concordia</div>

          <nav className="mt-6 space-y-4 text-sm">
            <Link
              href="/dashboard"
              className="block text-slate-900 hover:underline"
            >
              Tableau de bord
            </Link>

            <Link
              href="/dashboard/audit"
              className="block text-slate-900 hover:underline"
            >
              Lancer un audit IA
            </Link>

            <Link
              href="/dashboard/audits"
              className="block text-slate-900 hover:underline"
            >
              Historique des audits
            </Link>

            {/* ✅ Ajouts */}
            <Link
              href="/dashboard/mapping"
              className="block text-slate-900 hover:underline"
            >
              Mapping IA
            </Link>

            <Link
              href="/dashboard/suivi"
              className="block text-slate-900 hover:underline"
            >
              Suivi de conformité
            </Link>
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
