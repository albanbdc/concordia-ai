// app/dashboard/suivi/SuiviClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

/* =======================
   Types (API)
======================= */

type UseCaseAuditPoint = {
  auditId: string;
  createdAt: string;
  complianceScore?: number;
  systemStatus?: string;
  riskTier?: string;
};

type UseCaseEvolution = {
  key: string; // `${sector}__${useCaseTitleSlug}`
  sector: string;
  useCaseTitle: string;
  count: number;
  lastCreatedAt: string;
  history: UseCaseAuditPoint[]; // du plus ancien au plus récent (API)
};

type ApiSuiviResponse =
  | { ok: true; items: UiUseCase[] }   // ✅ on consomme directement la shape actuelle de l’API
  | { ok: false; error: string; details?: any };


/* =======================
   UI Types (computed)
======================= */

type UiUseCase = UseCaseEvolution & {
  lastComplianceScore?: number;
  lastSystemStatus?: string;
  lastRiskTier?: string;
  timeline: UseCaseAuditPoint[]; // alias UI = history
};

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

function scorePill(score?: number) {
  if (typeof score !== "number") {
    return (
      <span className="rounded-full border px-2 py-1 text-xs font-bold text-slate-600">
        —
      </span>
    );
  }

  const base = "rounded-full px-2 py-1 text-xs font-extrabold";
  if (score >= 80) return <span className={`${base} bg-green-100 text-green-800`}>{score}/100</span>;
  if (score >= 60) return <span className={`${base} bg-emerald-100 text-emerald-800`}>{score}/100</span>;
  if (score >= 40) return <span className={`${base} bg-amber-100 text-amber-800`}>{score}/100</span>;
  return <span className={`${base} bg-red-100 text-red-800`}>{score}/100</span>;
}

function riskPill(riskTier?: string) {
  if (!riskTier) return null;
  const v = String(riskTier).toUpperCase();

  const base = "rounded-full px-2 py-1 text-[11px] font-extrabold border";
  if (v === "PROHIBITED") return <span className={`${base} border-slate-900 bg-slate-900 text-white`}>PROHIBITED</span>;
  if (v === "HIGH") return <span className={`${base} border-red-200 bg-red-50 text-red-700`}>HIGH</span>;
  if (v === "MEDIUM") return <span className={`${base} border-amber-200 bg-amber-50 text-amber-700`}>MEDIUM</span>;
  if (v === "LOW") return <span className={`${base} border-emerald-200 bg-emerald-50 text-emerald-700`}>LOW</span>;
  return <span className={`${base} border-slate-200 bg-slate-50 text-slate-700`}>{v}</span>;
}

function statusPill(systemStatus?: string) {
  if (!systemStatus) return null;
  const v = String(systemStatus);

  const base = "rounded-full px-2 py-1 text-[11px] font-extrabold border";
  if (v === "prohibited") return <span className={`${base} border-slate-900 bg-slate-900 text-white`}>prohibited</span>;
  if (v === "high-risk") return <span className={`${base} border-red-200 bg-red-50 text-red-700`}>high-risk</span>;
  if (v === "gpai-systemic") return <span className={`${base} border-violet-200 bg-violet-50 text-violet-700`}>gpai-systemic</span>;
  if (v === "gpai") return <span className={`${base} border-indigo-200 bg-indigo-50 text-indigo-700`}>gpai</span>;
  if (v === "out-of-scope") return <span className={`${base} border-slate-200 bg-slate-50 text-slate-600`}>out-of-scope</span>;
  return <span className={`${base} border-slate-200 bg-slate-50 text-slate-700`}>{v}</span>;
}

function computeUiUseCases(raw: UseCaseEvolution[]): UiUseCase[] {
  const arr = Array.isArray(raw) ? raw : [];

  return arr
    .map((uc) => {
      const timeline = Array.isArray(uc.history) ? uc.history : [];
      const last = timeline.length ? timeline[timeline.length - 1] : undefined;

      return {
        ...uc,
        timeline,
        lastComplianceScore: typeof last?.complianceScore === "number" ? last.complianceScore : undefined,
        lastSystemStatus: last?.systemStatus ? String(last.systemStatus) : undefined,
        lastRiskTier: last?.riskTier ? String(last.riskTier) : undefined,
      };
    })
    .sort((a, b) => String(b.lastCreatedAt).localeCompare(String(a.lastCreatedAt)));
}

/* =======================
   Component
======================= */

export default function SuiviClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<UiUseCase[]>([]);
  const [openKey, setOpenKey] = useState<string | null>(null);

  // ✅ support des params ?q= & ?sector= (pour le lien "Évolution" depuis /audits)
  const [q, setQ] = useState("");
  const [sectorFilter, setSectorFilter] = useState<string>("");

  // init depuis l'URL (1 seule fois)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const q0 = params.get("q") || "";
      const s0 = params.get("sector") || "";
      if (q0) setQ(q0);
      if (s0) setSectorFilter(s0);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/suivi?limit=2000", { method: "GET" });
        const text = await res.text();

        let data: ApiSuiviResponse | null = null;
        try {
          data = text ? (JSON.parse(text) as ApiSuiviResponse) : null;
        } catch {
          data = null;
        }

        if (!res.ok || !data || (data as any).ok !== true) {
          throw new Error((data as any)?.error || `Erreur API (${res.status})`);
        }

        const list = Array.isArray((data as any).items) ? ((data as any).items as UiUseCase[]) : [];

if (!cancelled) {
  setItems(list);
  setOpenKey(list?.[0]?.key ?? null);
}

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

  const sectors = useMemo(() => {
    const s = new Set<string>();
    for (const it of items) s.add(String(it.sector || "non-classe"));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items.filter((it) => {
      const matchesSector = !sectorFilter || String(it.sector) === sectorFilter;
      const hay = `${it.sector} ${it.useCaseTitle}`.toLowerCase();
      const matchesQ = !query || hay.includes(query);
      return matchesSector && matchesQ;
    });
  }, [items, q, sectorFilter]);

  // ✅ si on filtre (q/sector), on ouvre le premier résultat automatiquement (si l’actuel n’est plus dedans)
  useEffect(() => {
    if (!filtered.length) return;
    if (!openKey || !filtered.some((x) => x.key === openKey)) {
      setOpenKey(filtered[0].key);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered.map((x) => x.key).join("|")]);

  const totalAudits = useMemo(
    () => filtered.reduce((acc, it) => acc + (it.count || 0), 0),
    [filtered]
  );

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
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Suivi de conformité</h1>
          <p className="text-sm text-slate-600 mt-1">
            Historique d’évolution d’un même use case (regroupement par{" "}
            <strong>secteur + titre</strong>).
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Link
            href="/dashboard/audit"
            className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            + Nouvel audit
          </Link>
          <Link
            href="/dashboard/audits"
            className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Historique (brut)
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-extrabold text-slate-500">Use cases suivis</div>
          <div className="mt-1 text-2xl font-black">{filtered.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-extrabold text-slate-500">Audits (dans la vue)</div>
          <div className="mt-1 text-2xl font-black">{totalAudits}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-extrabold text-slate-500">Secteurs</div>
          <div className="mt-1 text-2xl font-black">{new Set(filtered.map((x) => x.sector)).size}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-extrabold text-slate-500">Dernière activité</div>
          <div className="mt-1 text-sm font-extrabold text-slate-900">
            {filtered?.[0]?.lastCreatedAt ? formatDate(filtered[0].lastCreatedAt) : "—"}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex gap-3 flex-wrap items-center">
          <div className="flex-1 min-w-[240px]">
            <div className="text-xs font-extrabold text-slate-500 mb-1">Recherche</div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ex: tri de CV, reconnaissance faciale, recrutement…"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div className="min-w-[220px]">
            <div className="text-xs font-extrabold text-slate-500 mb-1">Secteur</div>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
            >
              <option value="">Tous</option>
              {sectors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              setQ("");
              setSectorFilter("");
              setOpenKey(null);
            }}
            className="mt-5 inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-extrabold text-slate-800 hover:bg-slate-50"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Layout */}
      <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
        {/* Left list */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200">
            <div className="text-sm font-black">Use cases</div>
            <div className="text-xs text-slate-500 mt-1">Clique pour voir l’évolution</div>
          </div>

          <div className="divide-y divide-slate-200">
            {filtered.map((it) => {
              const isOpen = openKey === it.key;

              return (
                <button
                  key={it.key}
                  type="button"
                  onClick={() => setOpenKey((prev) => (prev === it.key ? null : it.key))}
                  className={[
                    "w-full text-left px-4 py-4 hover:bg-slate-50 transition",
                    isOpen ? "bg-slate-50" : "bg-white",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-slate-500">Secteur</div>
                      <div className="mt-1 font-black text-slate-900 truncate">{it.sector}</div>

                      <div className="mt-2 text-xs font-extrabold text-slate-500">Use case</div>
                      <div className="mt-1 text-sm font-extrabold text-slate-800 truncate">{it.useCaseTitle}</div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-black text-slate-800">
                        {it.count} audits
                      </span>
                      {scorePill(it.lastComplianceScore)}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-500">
                    <div className="flex items-center gap-2 flex-wrap">
                      {statusPill(it.lastSystemStatus)}
                      {riskPill(it.lastRiskTier)}
                    </div>
                    <div className="font-semibold">
                      {it.lastCreatedAt ? `Dernier : ${formatDate(it.lastCreatedAt)}` : ""}
                    </div>
                  </div>
                </button>
              );
            })}

            {filtered.length === 0 ? (
              <div className="p-6 text-sm text-slate-600">Aucun résultat.</div>
            ) : null}
          </div>
        </div>

        {/* Right timeline */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
          {!openKey ? (
            <div className="text-slate-600 text-sm">Sélectionne un use case à gauche.</div>
          ) : (
            (() => {
              const selected =
                filtered.find((x) => x.key === openKey) || items.find((x) => x.key === openKey);

              if (!selected) return <div className="text-slate-600 text-sm">Sélection introuvable.</div>;

              const timeline = Array.isArray(selected.timeline) ? selected.timeline : [];
              const last = timeline[timeline.length - 1];

              return (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="text-xs font-extrabold text-slate-500">Suivi</div>
                      <div className="mt-1 text-xl font-black text-slate-900">{selected.useCaseTitle}</div>
                      <div className="mt-1 text-sm text-slate-600">
                        Secteur : <strong className="text-slate-900">{selected.sector}</strong> •{" "}
                        {selected.count} audit(s)
                      </div>
                    </div>

                    {last?.auditId ? (
                      <Link
                        href={`/dashboard/report?auditId=${encodeURIComponent(last.auditId)}`}
                        className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-extrabold text-white hover:bg-slate-800"
                      >
                        Ouvrir le dernier audit →
                      </Link>
                    ) : null}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="text-sm font-extrabold text-slate-900">Dernier état</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {scorePill(selected.lastComplianceScore)}
                        {statusPill(selected.lastSystemStatus)}
                        {riskPill(selected.lastRiskTier)}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-slate-600">
                      Dernière mise à jour : <strong>{formatDate(selected.lastCreatedAt)}</strong>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-black text-slate-900">Historique</div>
                    <div className="mt-3 space-y-3">
                      {timeline
                        .slice()
                        .reverse()
                        .map((p, idx) => (
                          <div
                            key={p.auditId || `${p.createdAt}-${idx}`}
                            className="rounded-2xl border border-slate-200 bg-white p-4 hover:bg-slate-50 transition"
                          >
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                              <div>
                                <div className="text-xs font-extrabold text-slate-500">Date</div>
                                <div className="mt-1 font-extrabold text-slate-900">{formatDate(p.createdAt)}</div>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap">
                                {scorePill(p.complianceScore)}
                                {statusPill(p.systemStatus)}
                                {riskPill(p.riskTier)}
                              </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
                              <div className="text-xs text-slate-600">
                                Audit ID : <span className="font-mono">{p.auditId}</span>
                              </div>

                              <Link
                                href={`/dashboard/report?auditId=${encodeURIComponent(p.auditId)}`}
                                className="text-sm font-extrabold text-slate-900 hover:underline"
                              >
                                Voir le rapport →
                              </Link>
                            </div>
                          </div>
                        ))}

                      {timeline.length === 0 ? (
                        <div className="text-sm text-slate-600">Aucun audit dans l’historique.</div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
}
