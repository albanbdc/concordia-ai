// app/dashboard/compliance/ComplianceClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type UiObligationStatus = "compliant" | "in_progress" | "non_compliant";

type ObligationRow = {
  obligationId: string;
  label: string;
  category?: string;
  weight?: number;

  status: UiObligationStatus;
  openActions: number;
  priority: "low" | "medium" | "high";

  lastAuditId?: string;
  lastAuditAt?: string;
};

type ApiResponse =
  | {
      ok: true;
      totals: { auditsUsed: number; obligations: number; actions: number };
      obligations: ObligationRow[];
    }
  | { ok: false; error: string; details?: any };

function formatDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function statusBadge(s: UiObligationStatus) {
  const base = "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-extrabold border";
  if (s === "compliant") return <span className={`${base} border-emerald-200 bg-emerald-50 text-emerald-800`}>✅ conforme</span>;
  if (s === "in_progress") return <span className={`${base} border-amber-200 bg-amber-50 text-amber-800`}>🟡 en cours</span>;
  return <span className={`${base} border-red-200 bg-red-50 text-red-800`}>❌ non conforme</span>;
}

function priorityBadge(p: "low" | "medium" | "high") {
  const base = "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-extrabold border";
  if (p === "high") return <span className={`${base} border-red-200 bg-red-50 text-red-800`}>high</span>;
  if (p === "medium") return <span className={`${base} border-amber-200 bg-amber-50 text-amber-800`}>medium</span>;
  return <span className={`${base} border-slate-200 bg-slate-50 text-slate-700`}>low</span>;
}

export default function ComplianceClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<ObligationRow[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/compliance/overview?limit=2000");
        const text = await res.text();
        const data: ApiResponse | null = text ? (JSON.parse(text) as ApiResponse) : null;

        if (!res.ok || !data || (data as any).ok !== true) {
          throw new Error((data as any)?.error || `Erreur API (${res.status})`);
        }

        if (!cancelled) setRows(Array.isArray((data as any).obligations) ? (data as any).obligations : []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Erreur chargement");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return rows;

    return rows.filter((r) => {
      const hay = `${r.obligationId} ${r.label} ${r.category || ""}`.toLowerCase();
      return hay.includes(query);
    });
  }, [rows, q]);

  const kpis = useMemo(() => {
    const compliant = filtered.filter((r) => r.status === "compliant").length;
    const inProgress = filtered.filter((r) => r.status === "in_progress").length;
    const nonCompliant = filtered.filter((r) => r.status === "non_compliant").length;
    const openActions = filtered.reduce((acc, r) => acc + (r.openActions || 0), 0);
    return { compliant, inProgress, nonCompliant, openActions, total: filtered.length };
  }, [filtered]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-2xl font-bold">Suivi de conformité</div>
        <div className="mt-2 text-slate-600">Chargement…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-2xl font-bold">Suivi de conformité</div>
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Suivi de conformité</h1>
          <p className="text-sm text-slate-600 mt-1">Vue obligations-centric (IA Act).</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Link
            href="/dashboard/audit"
            className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-extrabold text-white hover:bg-slate-800"
          >
            + Nouvel audit
          </Link>
          <Link
            href="/dashboard/suivi"
            className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-50"
          >
            Évolution use cases
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-extrabold text-slate-500">✅ conformes</div>
          <div className="mt-1 text-2xl font-black">{kpis.compliant}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-extrabold text-slate-500">🟡 en cours</div>
          <div className="mt-1 text-2xl font-black">{kpis.inProgress}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-extrabold text-slate-500">❌ non conformes</div>
          <div className="mt-1 text-2xl font-black">{kpis.nonCompliant}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-extrabold text-slate-500">Actions ouvertes</div>
          <div className="mt-1 text-2xl font-black">{kpis.openActions}</div>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-extrabold text-slate-500 mb-1">Recherche</div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ex: risk-management, doc-1, transparence…"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
        />
      </div>

      {/* Table obligations */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200">
          <div className="text-sm font-black">Obligations</div>
          <div className="text-xs text-slate-500 mt-1">{kpis.total} obligation(s)</div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-600">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-600">Obligation</th>
                <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-600">Catégorie</th>
                <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-600">Actions ouvertes</th>
                <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-600">Priorité</th>
                <th className="px-4 py-3 text-left text-xs font-extrabold text-slate-600">Dernier audit</th>
                <th className="px-4 py-3 text-right text-xs font-extrabold text-slate-600">Rapport</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {filtered.map((r) => (
                <tr key={r.obligationId} className="hover:bg-slate-50">
                  <td className="px-4 py-3">{statusBadge(r.status)}</td>

                  <td className="px-4 py-3">
                    <div className="text-xs font-extrabold text-slate-500">{r.obligationId}</div>
                    <div className="mt-1 font-extrabold text-slate-900">{r.label}</div>
                  </td>

                  <td className="px-4 py-3 text-slate-700">{r.category || "—"}</td>

                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-black text-slate-800">
                      {r.openActions ?? 0}
                    </span>
                  </td>

                  <td className="px-4 py-3">{priorityBadge(r.priority)}</td>

                  <td className="px-4 py-3 text-xs text-slate-600">{formatDate(r.lastAuditAt)}</td>

                  <td className="px-4 py-3 text-right">
                    {r.lastAuditId ? (
                      <Link
                        href={`/dashboard/report?auditId=${encodeURIComponent(r.lastAuditId)}`}
                        className="text-sm font-extrabold text-slate-900 hover:underline"
                      >
                        Voir →
                      </Link>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}

              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-600">
                    Aucun résultat.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* Note actions */}
      <div className="text-xs text-slate-500">
        Actions ouvertes = 0 : normal pour l’instant (pas encore de ComplianceAction en base).
      </div>
    </div>
  );
}
