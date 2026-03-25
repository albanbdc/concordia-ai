"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/* ======================
   TYPES
====================== */

type ComplianceRow = {
  stateId: string;
  status: string;
  priority: string;
  owner: string | null;
  dueDate: string | null;
  updatedAt: string;
  hasProof: boolean;
  useCase: {
    id: string;
    key: string;
    title: string;
    sector: string;
  };
  obligation: {
    id: string;
    title: string;
    legalRef: string | null;
    category: string | null;
    criticality: string | null;
  };
};

/* ======================
   UTILS
====================== */

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function formatDateShort(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
}

function isOverdue(dueDate?: string | null, status?: string) {
  if (!dueDate) return false;
  if (status === "COMPLIANT") return false;
  const t = new Date(dueDate).getTime();
  if (Number.isNaN(t)) return false;
  return t < Date.now();
}

/* ======================
   COMPONENT
====================== */

export default function Page() {
  const router = useRouter();

  const [rows, setRows] = useState<ComplianceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadListData() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/compliance/obligations");
      const text = await res.text();
      const json = text ? JSON.parse(text) : null;

      if (!res.ok || !json || json.ok !== true) {
        throw new Error(json?.error || `Erreur API (${res.status})`);
      }

      setRows(Array.isArray(json.rows) ? (json.rows as ComplianceRow[]) : []);
    } catch (e: any) {
      setError(e?.message || "Erreur chargement registre");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadListData();
  }, []);

  if (loading) return <div className="p-8 text-slate-700">Chargement…</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="p-8 space-y-6">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Liste complète — obligations</h1>
          <p className="mt-1 text-sm text-slate-600">
            Toutes les obligations du registre vivant (clique une ligne pour ouvrir le détail).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadListData}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            Rafraîchir
          </button>

          <Link
            href="/dashboard/registre-vivant"
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Retour pilotage
          </Link>
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 px-4 py-3 font-semibold">
          Obligations ({rows.length})
        </div>

        {rows.length === 0 ? (
          <div className="p-4 text-slate-500">Aucune obligation.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr className="text-left">
                  <th className="px-4 py-3 font-semibold">Obligation</th>
                  <th className="px-4 py-3 font-semibold">Use case</th>
                  <th className="px-4 py-3 font-semibold">Owner</th>
                  <th className="px-4 py-3 font-semibold">Statut</th>
                  <th className="px-4 py-3 font-semibold">Priorité</th>
                  <th className="px-4 py-3 font-semibold">Deadline</th>
                  <th className="px-4 py-3 font-semibold">Preuve</th>
                  <th className="px-4 py-3 font-semibold">Dernière modif</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {rows.map((r) => {
                  const overdue = isOverdue(r.dueDate, r.status);

                  // ✅ lien : ouvre le use case + le drawer directement
                  const href = `/dashboard/usecases/${encodeURIComponent(
                    r.useCase.key
                  )}?openStateId=${encodeURIComponent(r.stateId)}`;

                  return (
                    <tr
                      key={r.stateId}
                      className="hover:bg-slate-50 cursor-pointer"
                      onClick={() => router.push(href)}
                      title="Ouvrir le détail"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold">{r.obligation.title}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          {r.obligation.id}
                          {r.obligation.legalRef ? ` • ${r.obligation.legalRef}` : ""}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold">{r.useCase.title}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          {r.useCase.sector} • {r.useCase.key}
                        </div>

                        <div className="mt-2">
                          <Link
                            href={href}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs font-semibold text-slate-900 underline"
                          >
                            Ouvrir le détail →
                          </Link>
                        </div>
                      </td>

                      <td className="px-4 py-3">{r.owner || "—"}</td>

                      <td className="px-4 py-3">
                        <div className="font-semibold">{r.status}</div>
                        {overdue ? (
                          <div className="mt-1 text-xs font-semibold text-red-600">
                            Deadline dépassée
                          </div>
                        ) : null}
                      </td>

                      <td className="px-4 py-3">{r.priority}</td>

                      <td className="px-4 py-3">{formatDateShort(r.dueDate)}</td>

                      <td className="px-4 py-3">{r.hasProof ? "✅" : "—"}</td>

                      <td className="px-4 py-3">{formatDate(r.updatedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}