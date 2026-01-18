// app/dashboard/mapping/MappingClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

/* =======================
   Types
======================= */

type MappingCard = {
  id: string;
  createdAt: string;
  sector: string;
  useCaseTitle: string;
  riskTier?: string;
  systemStatus?: string;
  complianceScore?: number;
};

type MappingSector = {
  sector: string;
  count: number;
  lastCreatedAt: string;
  audits: MappingCard[];
};

type ApiMappingResponse =
  | { ok: true; sectors: MappingSector[] }
  | { ok: false; error: string; details?: any };

/* =======================
   Utils
======================= */

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function scoreLabel(score?: number) {
  if (typeof score !== "number") return "—";
  return `${score}/100`;
}

function slugify(v: string) {
  return (v || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildUseCaseKey(sector: string, title: string) {
  const s = slugify(sector || "non-classe");
  const t = slugify(title || "cas-d-usage");
  return `${s}__${t}`;
}

function riskBadge(riskTier?: string) {
  const v = String(riskTier || "").toUpperCase();
  if (!v) return null;

  const cls =
    v === "PROHIBITED"
      ? "bg-slate-900 text-white"
      : v === "HIGH"
      ? "bg-red-600 text-white"
      : v === "MEDIUM"
      ? "bg-amber-500 text-slate-900"
      : v === "LOW"
      ? "bg-emerald-600 text-white"
      : "bg-slate-200 text-slate-800";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${cls}`}>
      {v}
    </span>
  );
}

function statusBadge(systemStatus?: string) {
  const v = String(systemStatus || "");
  if (!v) return null;

  const cls =
    v === "prohibited"
      ? "bg-slate-900 text-white"
      : v === "high-risk"
      ? "bg-red-50 text-red-700 border border-red-200"
      : v === "gpai-systemic"
      ? "bg-violet-50 text-violet-700 border border-violet-200"
      : v === "gpai"
      ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
      : v === "normal"
      ? "bg-slate-50 text-slate-700 border border-slate-200"
      : "bg-slate-50 text-slate-700 border border-slate-200";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${cls}`}>
      {v}
    </span>
  );
}

/* =======================
   Component
======================= */

export default function MappingClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectors, setSectors] = useState<MappingSector[]>([]);
  const [openSector, setOpenSector] = useState<string | null>(null);

  /* ---------- Load API ---------- */

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/mapping?limit=1000", { method: "GET" });
        const text = await res.text();

        let data: ApiMappingResponse | null = null;
        try {
          data = text ? (JSON.parse(text) as ApiMappingResponse) : null;
        } catch {
          data = null;
        }

        if (!res.ok || !data || (data as any).ok !== true) {
          throw new Error((data as any)?.error || `Erreur API (${res.status})`);
        }

        const list = Array.isArray((data as any).sectors) ? ((data as any).sectors as MappingSector[]) : [];

        if (!cancelled) {
          setSectors(list);
          setOpenSector(list?.[0]?.sector ?? null);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Erreur chargement mapping");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const safeSectors = useMemo(() => (Array.isArray(sectors) ? sectors : []), [sectors]);

  const totalAudits = useMemo(() => safeSectors.reduce((acc, s) => acc + (s.count || 0), 0), [safeSectors]);

  const mostActive = useMemo(() => {
    if (safeSectors.length === 0) return null;
    return [...safeSectors].sort((a, b) => (b.count || 0) - (a.count || 0))[0] ?? null;
  }, [safeSectors]);

  const latestAudit = useMemo(() => {
    let best: MappingCard | null = null;
    for (const s of safeSectors) {
      const a = s?.audits?.[0];
      if (!a) continue;
      if (!best || a.createdAt > best.createdAt) best = a;
    }
    return best;
  }, [safeSectors]);

  /* =======================
     States
======================= */

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Mapping IA</h1>
        <p className="mt-2 text-slate-600">Chargement…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Mapping IA</h1>
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
      </div>
    );
  }

  /* =======================
     Render
======================= */

  return (
    <div className="p-8 space-y-8">
      {/* ---------- Header ---------- */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Mapping IA</h1>
          <p className="text-sm text-slate-600 mt-1">Vision globale des audits par secteur</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/audit"
            className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            + Nouvel audit
          </Link>
        </div>
      </div>

      {/* ---------- KPI ---------- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-500">Secteurs</div>
          <div className="mt-1 text-2xl font-bold">{safeSectors.length}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-500">Audits total</div>
          <div className="mt-1 text-2xl font-bold">{totalAudits}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-500">Secteur le + actif</div>
          <div className="mt-1 font-bold">{mostActive?.sector ?? "—"}</div>
          <div className="mt-1 text-xs text-slate-500">{mostActive ? `${mostActive.count} audits` : ""}</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-500">Dernier audit</div>
          <div className="mt-1 text-sm font-bold">{latestAudit?.useCaseTitle ?? "—"}</div>
          <div className="mt-1 text-xs text-slate-500">{latestAudit ? formatDate(latestAudit.createdAt) : ""}</div>
        </div>
      </div>

      {/* ---------- Sector cards ---------- */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {safeSectors.map((s) => {
          const isOpen = openSector === s.sector;
          const last = s.audits?.[0];

          return (
            <button
              key={s.sector}
              type="button"
              onClick={() => setOpenSector((prev) => (prev === s.sector ? null : s.sector))}
              className={[
                "group rounded-2xl border bg-white p-6 text-left shadow-sm transition",
                "hover:shadow-md hover:border-slate-300",
                isOpen ? "border-slate-900 ring-1 ring-slate-900/10" : "border-slate-200",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-500">Secteur</div>
                  <div className="mt-1 text-lg font-bold truncate">{s.sector}</div>
                </div>

                <div className="shrink-0 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                  {s.count} audits
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[11px] text-slate-500 font-semibold">Dernier</div>
                  <div className="mt-1 text-sm font-bold">{formatDate(s.lastCreatedAt)}</div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-[11px] text-slate-500 font-semibold">Dernier score</div>
                  <div className="mt-1 text-sm font-bold">{scoreLabel(last?.complianceScore)}</div>
                </div>
              </div>

              <div className="mt-4 text-sm text-slate-600 line-clamp-2">
                <span className="font-semibold text-slate-900">Dernier audit :</span> {last?.useCaseTitle ?? "—"}
              </div>

              <div className="mt-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {statusBadge(last?.systemStatus)}
                  {riskBadge(last?.riskTier)}
                </div>

                <span className="text-xs font-semibold text-slate-900">{isOpen ? "Fermer →" : "Ouvrir →"}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ---------- Open sector ---------- */}
      {openSector ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex justify-between items-baseline gap-3 flex-wrap">
            <div>
              <h2 className="text-lg font-bold">{openSector}</h2>
              <p className="text-xs text-slate-500">
                {safeSectors.find((s) => s.sector === openSector)?.count ?? 0} audit(s)
              </p>
            </div>

            <button
              onClick={() => setOpenSector(null)}
              className="text-sm font-semibold text-slate-700 hover:underline"
              type="button"
            >
              Fermer
            </button>
          </div>

          <div className="mt-4 grid gap-3">
            {(safeSectors.find((s) => s.sector === openSector)?.audits ?? []).map((a) => {
              const useCaseKey = buildUseCaseKey(a.sector, a.useCaseTitle);

              return (
                <div key={a.id} className="rounded-xl border border-slate-200 bg-white">
                  <div className="p-4">
                    <div className="flex justify-between gap-3 flex-wrap items-start">
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{a.useCaseTitle}</div>
                        <div className="mt-1 text-xs text-slate-600">
                          {formatDate(a.createdAt)}
                          {a.systemStatus ? ` • ${a.systemStatus}` : ""}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {riskBadge(a.riskTier)}
                        <div className="font-bold text-sm text-slate-900">{scoreLabel(a.complianceScore)}</div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/dashboard/report?auditId=${encodeURIComponent(a.id)}`}
                        className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                      >
                        Ouvrir le rapport →
                      </Link>

                      <Link
                        href={`/dashboard/usecases/${encodeURIComponent(useCaseKey)}`}
                        className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                      >
                        Voir évolution →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 text-xs text-slate-500">
            Note : l’historique (“Voir évolution”) regroupe par <span className="font-semibold">secteur + titre</span>.
          </div>
        </div>
      ) : null}
    </div>
  );
}
