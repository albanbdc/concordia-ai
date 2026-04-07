"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type System = {
  id: string;
  name: string;
  provider: string | null;
  version: string | null;
  owner: string;
  status: "NORMAL" | "CONFORMITE_RENFORCEE_REQUISE";
  createdAt: string;
  _count: { useCases: number };
};

export default function SystemsPage() {
  const [systems, setSystems] = useState<System[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/systems")
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok) setSystems(data.systems);
      })
      .finally(() => setLoading(false));
  }, []);

  const total = systems.length;
  const totalUseCases = systems.reduce((acc, s) => acc + s._count.useCases, 0);

  return (
    <div className="p-8 max-w-5xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Systèmes IA</h1>
          <p className="mt-1 text-sm text-slate-500">
            Gérez vos systèmes IA et leurs cas d'usage associés.
          </p>
        </div>
        <Link
          href="/dashboard/systems/new"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black transition"
        >
          <span className="text-lg leading-none">+</span>
          Ajouter un système
        </Link>
      </div>

      {/* Stats */}
      {!loading && total > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-2xl font-bold text-slate-900">{total}</div>
            <div className="mt-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Systèmes déclarés
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-2xl font-bold text-indigo-600">{totalUseCases}</div>
            <div className="mt-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cas d'usage au total
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center gap-3 py-20 justify-center text-sm text-slate-400">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          Chargement…
        </div>
      ) : systems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z" stroke="#94a3b8" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-900 mb-1">Aucun système déclaré</p>
          <p className="text-sm text-slate-400 mb-6">
            Déclarez votre premier système IA pour générer automatiquement vos obligations réglementaires.
          </p>
          <Link
            href="/dashboard/systems/new"
            className="inline-flex rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-black transition"
          >
            + Ajouter un système
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {systems.map((system) => {
            const useCaseCount = system._count.useCases;
            return (
              <Link
                key={system.id}
                href={`/dashboard/systems/${system.id}`}
                className="group rounded-2xl border border-slate-200 bg-white p-5 hover:border-slate-300 hover:shadow-sm transition flex items-center gap-5"
              >
                {/* Icône */}
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z"
                      fill="#94a3b8"
                      fillOpacity="0.3"
                      stroke="#64748b"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-sm font-bold text-slate-900 truncate">
                      {system.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>Responsable : <span className="text-slate-600">{system.owner}</span></span>
                    {system.provider && <span>Fournisseur : <span className="text-slate-600">{system.provider}</span></span>}
                    {system.version && <span>Version : <span className="text-slate-600">{system.version}</span></span>}
                    <span>
                      Ajouté le{" "}
                      <span className="text-slate-600">
                        {new Date(system.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Cas d'usage badge */}
                <div className={[
                  "flex-shrink-0 rounded-xl px-3 py-2 text-center border",
                  useCaseCount === 0
                    ? "bg-slate-50 border-slate-200"
                    : "bg-indigo-50 border-indigo-100",
                ].join(" ")}>
                  <div className={[
                    "text-lg font-bold",
                    useCaseCount === 0 ? "text-slate-400" : "text-indigo-600",
                  ].join(" ")}>
                    {useCaseCount}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    {useCaseCount <= 1 ? "cas d'usage" : "cas d'usage"}
                  </div>
                </div>

                {/* Lien ajout cas d'usage si vide */}
                {useCaseCount === 0 && (
                  <Link
                    href={`/dashboard/systems/${system.id}/usecases/new`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-shrink-0 rounded-xl border border-dashed border-slate-300 px-3 py-2 text-xs font-semibold text-slate-500 hover:border-slate-400 hover:text-slate-700 transition whitespace-nowrap"
                  >
                    + Cas d'usage
                  </Link>
                )}

                {/* Arrow */}
                <div className="text-slate-300 group-hover:text-slate-500 transition text-sm flex-shrink-0">
                  →
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}