// app/dashboard/usecases/[useCaseKey]/UseCaseHistoryClient.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Item = {
  id: string;
  createdAt: string;
  sector: string;
  title: string;
  riskTier?: string;
  systemStatus?: string;
  complianceScore?: number;
};

type Api =
  | { ok: true; useCaseKey: string; history: Item[] }
  | { ok: false; error: string; details?: any };

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function UseCaseHistoryClient({ useCaseKey }: { useCaseKey: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Item[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/usecases/${encodeURIComponent(useCaseKey)}`, { method: "GET" });
        const text = await res.text();
        const data: Api = text ? JSON.parse(text) : (null as any);

        if (!res.ok || !data || (data as any).ok !== true) {
          throw new Error((data as any)?.error || `Erreur API (${res.status})`);
        }

        if (!cancelled) setHistory(Array.isArray((data as any).history) ? (data as any).history : []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Erreur chargement historique");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [useCaseKey]);

  const head = history[0];

  return (
    <div className="p-8">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Évolution du cas d’usage</h1>
          <p className="text-slate-600 text-sm mt-1">
            {head ? (
              <>
                <span className="font-semibold">{head.title}</span> • <span>{head.sector}</span>
              </>
            ) : (
              useCaseKey
            )}
          </p>
        </div>

        <Link
          href="/dashboard/mapping"
          className="text-sm font-semibold text-slate-700 hover:underline"
        >
          ← Retour Mapping
        </Link>
      </div>

      {loading ? <div className="text-slate-600 mt-4">Chargement…</div> : null}
      {error ? <div className="mt-4 rounded border border-red-200 bg-red-50 p-4 text-red-700">{error}</div> : null}

      {!loading && !error ? (
        <div className="mt-6 rounded-2xl border bg-white">
          <div className="border-b p-4 text-sm text-slate-600">
            {history.length} audit(s) • dernier : {head ? formatDate(head.createdAt) : "—"}
          </div>

          <div className="divide-y">
            {history.map((a, idx) => {
              const prev = history[idx + 1]; // car tri desc
              const s = typeof a.complianceScore === "number" ? a.complianceScore : null;
              const p = typeof prev?.complianceScore === "number" ? prev.complianceScore : null;
              const delta = s !== null && p !== null ? s - p : null;

              return (
                <Link
                  key={a.id}
                  href={`/dashboard/report?auditId=${encodeURIComponent(a.id)}`}
                  className="block p-4 hover:bg-slate-50"
                >
                  <div className="flex justify-between gap-3 flex-wrap">
                    <div className="font-semibold">{formatDate(a.createdAt)}</div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-bold text-slate-900">
                        {typeof a.complianceScore === "number" ? `${a.complianceScore}/100` : "—"}
                      </span>
                      {delta !== null ? (
                        <span className={delta >= 0 ? "text-emerald-700 font-semibold" : "text-red-700 font-semibold"}>
                          {delta >= 0 ? `+${delta}` : `${delta}`}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-1 text-xs text-slate-600">
                    {a.systemStatus ? `• ${a.systemStatus}` : ""}
                    {a.riskTier ? ` • Risk: ${a.riskTier}` : ""}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
