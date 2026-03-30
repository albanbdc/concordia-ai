"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export const dynamic = "force-dynamic";

const NAV_ITEMS = [
  { label: "+ Ajouter un système", href: "/dashboard/systems" },
  { label: "Tableau de bord", href: "/dashboard/registre-vivant" },
  { label: "Mes obligations", href: "/dashboard/obligations-globales" },
  { label: "Mes cas d'usages", href: "/dashboard/usecases" },
  { label: "Journal Global", href: "/dashboard/history" },
  { label: "Ledger de conformité", href: "/dashboard/ledger" },
  { label: "Vue contrôleur", href: "/dashboard/vue-controleur" },
  { label: "Bibliothèque", href: "/dashboard/bibliotheque" },
];

const BOTTOM_ITEMS = [
  { label: "👤 Mon compte", href: "/dashboard/mon-compte" },
  { label: "🏢 Mon organisation", href: "/dashboard/organisation" },
  { label: "📖 Comprendre l'AI Act", href: "/dashboard/ia-act" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white border-r border-slate-200 flex flex-col min-h-screen sticky top-0 h-screen">

        {/* Logo */}
        <div className="px-5 py-6 border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z" fill="white" fillOpacity="0.9"/>
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-900 tracking-tight">Concordia</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex items-center rounded-lg px-3 py-2 text-xs font-medium transition",
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-slate-100 space-y-0.5">
          {BOTTOM_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center rounded-lg px-3 py-2 text-xs font-medium transition",
                pathname === item.href
                  ? "bg-slate-900 text-white"
                  : "text-slate-400 hover:text-slate-900 hover:bg-slate-100",
              ].join(" ")}
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center rounded-lg px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            → Se déconnecter
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-h-screen bg-slate-50 overflow-auto">
        {children}
      </main>
    </div>
  );
}