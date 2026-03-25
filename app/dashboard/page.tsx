"use client";

import Link from "next/link";

const CARDS = [
  {
    title: "Ajouter un système & cas d'usage",
    description: "Déclarez un nouveau système IA et générez automatiquement les obligations applicables.",
    href: "/dashboard/systems",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12h14"/>
      </svg>
    ),
  },
  {
    title: "Systèmes & cas d'usage",
    description: "Gérez vos systèmes IA et leurs cas d'usage opérationnels.",
    href: "/dashboard/usecases",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 7h18M3 12h18M3 17h18"/>
      </svg>
    ),
  },
  {
    title: "Obligations",
    description: "Pilotez les obligations réglementaires et suivez leur statut.",
    href: "/dashboard/obligations-globales",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
      </svg>
    ),
  },
  {
    title: "Ledger — Registre vivant",
    description: "Consultez l'historique probatoire et figez juridiquement votre registre.",
    href: "/dashboard/ledger",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    title: "Vue contrôleur",
    description: "Rapport réglementaire structuré par chapitres AI Act.",
    href: "/dashboard/vue-controleur",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
      </svg>
    ),
  },
];

export default function DashboardHome() {
  return (
    <div className="p-8 max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
          Règlement (UE) 2024/1689
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Concordia
        </h1>
        <p className="mt-1.5 text-sm text-slate-500 max-w-lg">
          Centralisez vos systèmes IA, documentez vos obligations réglementaires et figez votre registre de conformité vivant.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CARDS.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md hover:border-slate-300 transition"
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition">
                {card.icon}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900 mb-1">{card.title}</div>
                <div className="text-xs text-slate-500 leading-relaxed">{card.description}</div>
                <div className="mt-3 text-xs font-semibold text-slate-400 group-hover:text-slate-900 transition">
                  Accéder →
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-10 pt-6 border-t border-slate-200 flex items-center justify-between flex-wrap gap-4">
        <p className="text-xs text-slate-400">
          Nouveau sur Concordia ? Commencez par déclarer votre premier système IA.
        </p>
        <Link
          href="/dashboard/systems"
          className="inline-flex items-center rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-black transition"
        >
          🚀 Déclarer un système IA
        </Link>
      </div>

    </div>
  );
}