// app/dashboard/obligations-globales/page.tsx
"use client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type GlobalObligation = {
  obligationId: string;
  title: string;
  legalRef: string | null;
  category: string | null;

  systemsCount: number;
  useCasesCount: number;

  compliant: number;
  inProgress: number;
  nonCompliant: number;
  notEvaluated: number;

  complianceRate: number; // 0 - 100
  lastUpdate: string | null;
};

type ApiGlobal =
  | { ok: true; obligations: GlobalObligation[] }
  | { ok: false; error: string; details?: any };

type DrillUseCase = {
  stateId: string;
  useCaseKey: string;
  useCaseTitle: string;
  sector: string;
  status: string;
  priority: string;
  owner: string | null;
  dueDate: string | null;
  updatedAt: string | null;
};

type ApiDrill =
  | { ok: true; obligationId: string; total: number; useCases: DrillUseCase[] }
  | { ok: false; error: string; details?: any };

function statusFromAggregation(o: GlobalObligation) {
  if (o.nonCompliant > 0) return "NON_COMPLIANT";
  if (o.inProgress > 0) return "IN_PROGRESS";
  if (o.notEvaluated > 0) return "NOT_EVALUATED";
  if (o.compliant > 0) return "COMPLIANT";
  return "NA";
}

function statusLabel(status: string) {
  if (status === "NON_COMPLIANT") return "À risque";
  if (status === "IN_PROGRESS") return "En cours";
  if (status === "NOT_EVALUATED") return "Non évaluée";
  if (status === "COMPLIANT") return "Stabilisée";
  return "—";
}

function cardTone(status: string) {
  if (status === "NON_COMPLIANT") return "border-rose-200 bg-rose-50";
  if (status === "IN_PROGRESS") return "border-amber-200 bg-amber-50";
  if (status === "COMPLIANT") return "border-emerald-200 bg-emerald-50";
  return "border-slate-200 bg-white";
}

function pillTone(status: string) {
  if (status === "NON_COMPLIANT") return "border-rose-200 bg-rose-50 text-rose-700";
  if (status === "IN_PROGRESS") return "border-amber-200 bg-amber-50 text-amber-700";
  if (status === "COMPLIANT") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "NOT_EVALUATED") return "border-slate-200 bg-slate-50 text-slate-700";
  return "border-slate-200 bg-white text-slate-700";
}

function smallPill(status: string) {
  const up = String(status || "").toUpperCase();
  const cls =
    up === "COMPLIANT"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : up === "IN_PROGRESS"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : up === "NON_COMPLIANT"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : up === "NOT_EVALUATED"
      ? "border-slate-200 bg-slate-50 text-slate-700"
      : "border-slate-200 bg-white text-slate-700";

  const label =
    up === "NON_COMPLIANT"
      ? "NC"
      : up === "IN_PROGRESS"
      ? "EC"
      : up === "NOT_EVALUATED"
      ? "NE"
      : up === "COMPLIANT"
      ? "OK"
      : up;

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${cls}`}>
      {label}
    </span>
  );
}

function prettyDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR");
  } catch {
    return iso;
  }
}

function safeText(v: any) {
  return String(v ?? "").trim();
}

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [obligations, setObligations] = useState<GlobalObligation[]>([]);

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"ALL" | "NON_COMPLIANT" | "IN_PROGRESS" | "NOT_EVALUATED" | "COMPLIANT">("ALL");

  // Drawer drill-down
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<GlobalObligation | null>(null);
  const [drillLoading, setDrillLoading] = useState(false);
  const [drillErr, setDrillErr] = useState<string | null>(null);
  const [drillUseCases, setDrillUseCases] = useState<DrillUseCase[]>([]);

  // ✅ auto-open 1 fois via ?obligationId=...
  const didAutoOpen = useRef(false);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErr(null);

      try {
        const res = await fetch("/api/obligations/global", { method: "GET" });
        const text = await res.text();
        const data: ApiGlobal = text ? JSON.parse(text) : (null as any);

        if (!res.ok || !data || (data as any).ok !== true) {
          throw new Error((data as any)?.error || `Erreur API (${res.status})`);
        }

        if (!alive) return;
        setObligations((data as any).obligations ?? []);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Erreur chargement obligations globales");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const totals = useMemo(() => {
    const total = obligations.length;
    const risky = obligations.filter((o) => statusFromAggregation(o) === "NON_COMPLIANT").length;
    const inProg = obligations.filter((o) => statusFromAggregation(o) === "IN_PROGRESS").length;
    const stable = obligations.filter((o) => statusFromAggregation(o) === "COMPLIANT").length;
    const notEval = obligations.filter((o) => statusFromAggregation(o) === "NOT_EVALUATED").length;
    return { total, risky, inProg, stable, notEval };
  }, [obligations]);

  const view = useMemo(() => {
    const query = q.trim().toLowerCase();

    return obligations.filter((o) => {
      const st = statusFromAggregation(o);

      if (filter !== "ALL" && st !== filter) return false;

      if (!query) return true;

      const a = safeText(o.title).toLowerCase();
      const b = safeText(o.legalRef).toLowerCase();
      const c = safeText(o.category).toLowerCase();

      return a.includes(query) || b.includes(query) || c.includes(query);
    });
  }, [obligations, q, filter]);

  function setUrlObligationId(obligationId: string | null) {
    const current = new URLSearchParams(searchParams?.toString() ?? "");
    if (!obligationId) current.delete("obligationId");
    else current.set("obligationId", obligationId);

    const qs = current.toString();
    const next = qs ? `/dashboard/obligations-globales?${qs}` : `/dashboard/obligations-globales`;
    router.replace(next);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setSelected(null);
    setDrillLoading(false);
    setDrillErr(null);
    setDrillUseCases([]);
    setUrlObligationId(null);
  }

  async function openDrawer(o: GlobalObligation, opts?: { syncUrl?: boolean }) {
    setSelected(o);
    setDrawerOpen(true);

    if (opts?.syncUrl !== false) {
      setUrlObligationId(o.obligationId);
    }

    setDrillLoading(true);
    setDrillErr(null);
    setDrillUseCases([]);

    try {
      const res = await fetch(`/api/obligations/global/${encodeURIComponent(o.obligationId)}`, { method: "GET" });
      const text = await res.text();
      const data: ApiDrill = text ? JSON.parse(text) : (null as any);

      if (!res.ok || !data || (data as any).ok !== true) {
        throw new Error((data as any)?.error || `Erreur API (${res.status})`);
      }

      const list = Array.isArray((data as any).useCases) ? ((data as any).useCases as DrillUseCase[]) : [];
      setDrillUseCases(list);
    } catch (e: any) {
      setDrillErr(e?.message || "Erreur chargement détail obligation");
    } finally {
      setDrillLoading(false);
    }
  }

  // ✅ Auto-open via URL (?obligationId=rs-1)
  useEffect(() => {
    if (didAutoOpen.current) return;
    if (loading) return;
    if (!Array.isArray(obligations) || obligations.length === 0) return;

    const oid = searchParams?.get("obligationId");
    if (!oid) {
      didAutoOpen.current = true;
      return;
    }

    const found = obligations.find((o) => String(o.obligationId) === String(oid));
    if (!found) {
      didAutoOpen.current = true;
      return;
    }

    didAutoOpen.current = true;
    openDrawer(found, { syncUrl: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, obligations, searchParams]);

  return (
    <div className="p-8 space-y-8">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Obligations globales</h1>
          <p className="mt-1 text-sm text-slate-600">Montrez comment chaque article est géré à travers tous les systèmes IA.</p>
        </div>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
          title="Rafraîchir"
        >
          Rafraîchir
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-semibold text-slate-500">Obligations totales</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">{totals.total}</div>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
          <div className="text-xs font-semibold text-rose-700">Obligations à risque</div>
          <div className="mt-2 text-3xl font-bold text-rose-700">{totals.risky}</div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <div className="text-xs font-semibold text-emerald-700">Obligations stabilisées</div>
          <div className="mt-2 text-3xl font-bold text-emerald-700">{totals.stable}</div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setFilter("ALL")}
              className={[
                "rounded-full border px-3 py-1.5 text-xs font-semibold",
                filter === "ALL" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
              ].join(" ")}
            >
              Tout ({totals.total})
            </button>

            <button
              type="button"
              onClick={() => setFilter("NON_COMPLIANT")}
              className={[
                "rounded-full border px-3 py-1.5 text-xs font-semibold",
                filter === "NON_COMPLIANT" ? "border-rose-700 bg-rose-700 text-white" : "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
              ].join(" ")}
            >
              À risque ({totals.risky})
            </button>

            <button
              type="button"
              onClick={() => setFilter("IN_PROGRESS")}
              className={[
                "rounded-full border px-3 py-1.5 text-xs font-semibold",
                filter === "IN_PROGRESS" ? "border-amber-700 bg-amber-700 text-white" : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
              ].join(" ")}
            >
              En cours ({totals.inProg})
            </button>

            <button
              type="button"
              onClick={() => setFilter("NOT_EVALUATED")}
              className={[
                "rounded-full border px-3 py-1.5 text-xs font-semibold",
                filter === "NOT_EVALUATED" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100",
              ].join(" ")}
            >
              Non évaluées ({totals.notEval})
            </button>

            <button
              type="button"
              onClick={() => setFilter("COMPLIANT")}
              className={[
                "rounded-full border px-3 py-1.5 text-xs font-semibold",
                filter === "COMPLIANT" ? "border-emerald-700 bg-emerald-700 text-white" : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
              ].join(" ")}
            >
              Stabilisées ({totals.stable})
            </button>
          </div>

          <div className="w-full sm:w-96">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher (titre / article / catégorie)…"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>
        </div>

        <div className="mt-3 text-xs text-slate-600">{loading ? "Chargement…" : `${view.length} affichées`}</div>
      </div>

      {err && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{err}</div>}

      {loading ? (
        <div className="text-sm text-slate-600">Chargement des obligations globales…</div>
      ) : view.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Aucune obligation trouvée.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {view.map((o) => {
            const status = statusFromAggregation(o);
            const tone = cardTone(status);

            return (
              <button
                key={o.obligationId}
                type="button"
                onClick={() => openDrawer(o)}
                className={`text-left rounded-2xl border p-6 shadow-sm ${tone} hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-slate-900/10`}
                title="Ouvrir le détail (cas d’usage impactés)"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold uppercase tracking-widest text-slate-700 truncate">{o.legalRef ?? "—"}</div>
                  </div>

                  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${pillTone(status)}`}>
                    {statusLabel(status)}
                  </span>
                </div>

                <div className="mt-2 text-lg font-bold text-slate-900">{o.title}</div>

                <div className="mt-2 text-xs text-slate-600">{o.category ? <span className="font-semibold">{o.category}</span> : "—"}</div>

                <div className="mt-3 text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">{o.useCasesCount}</span> cas d’usage •{" "}
                  <span className="font-semibold text-slate-900">{o.systemsCount}</span> systèmes
                </div>

                <div className="mt-4">
                  <div className="text-xs font-semibold text-slate-500">Conformité globale</div>
                  <div className="mt-2 h-3 w-full rounded-full bg-white/60 overflow-hidden">
                    <div className="h-full bg-slate-900" style={{ width: `${o.complianceRate}%` }} />
                  </div>
                  <div className="mt-1 text-xs text-slate-600">{o.complianceRate}% conforme</div>
                </div>

                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700">
                    {o.nonCompliant} NC
                  </span>
                  <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                    {o.inProgress} EC
                  </span>
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                    {o.notEvaluated} NE
                  </span>
                  <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                    {o.compliant} OK
                  </span>
                </div>

                <div className="mt-4 text-xs text-slate-600">
                  Dernière activité : <span className="font-semibold">{prettyDate(o.lastUpdate)}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* DRAWER */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={closeDrawer} />

          <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl flex flex-col">
            <div className="border-b p-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-500">Article</div>
                <div className="mt-1 text-lg font-bold truncate">{selected?.title ?? "—"}</div>
                <div className="mt-1 text-xs text-slate-600">
                  {selected?.legalRef ? <span className="font-semibold">{selected.legalRef}</span> : <span className="text-slate-500">—</span>}
                  {selected?.category ? <span className="text-slate-500"> • </span> : null}
                  {selected?.category ? <span className="font-semibold">{selected.category}</span> : null}
                </div>
              </div>

              <button
                type="button"
                onClick={closeDrawer}
                className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
              >
                Fermer
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold text-slate-500">Lecture contrôleur</div>
                <div className="mt-1 text-sm font-semibold text-slate-900">
                  {selected ? (
                    <>
                      <span className="font-bold">{selected.useCasesCount}</span> cas d’usage impactés •{" "}
                      <span className="font-bold">{selected.complianceRate}%</span> conforme
                    </>
                  ) : (
                    "—"
                  )}
                </div>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700">
                    {selected?.nonCompliant ?? 0} NC
                  </span>
                  <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                    {selected?.inProgress ?? 0} EC
                  </span>
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                    {selected?.notEvaluated ?? 0} NE
                  </span>
                  <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                    {selected?.compliant ?? 0} OK
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-slate-900">Cas d’usage impactés</div>
                  <div className="text-xs text-slate-500 mt-1">Clique un cas d’usage pour ouvrir directement l’obligation.</div>
                </div>
              </div>

              {drillErr ? <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{drillErr}</div> : null}

              {drillLoading ? (
                <div className="text-sm text-slate-600">Chargement du détail…</div>
              ) : drillUseCases.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">Aucun cas d’usage trouvé pour cet article.</div>
              ) : (
                <div className="space-y-2">
                  {drillUseCases.map((u) => (
                    <Link
                      key={u.stateId}
                      href={`/dashboard/usecases/${encodeURIComponent(u.useCaseKey)}?openStateId=${encodeURIComponent(u.stateId)}`}
                      className="block rounded-2xl border border-slate-200 bg-white p-4 hover:bg-slate-50 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900 truncate">{u.useCaseTitle}</div>
                          <div className="mt-1 text-xs text-slate-600 truncate">{u.sector}</div>

                          <div className="mt-2 text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                            <span>
                              MAJ : <span className="font-semibold">{prettyDate(u.updatedAt)}</span>
                            </span>
                            {u.owner ? (
                              <span>
                                • Owner : <span className="font-semibold text-slate-900">{u.owner}</span>
                              </span>
                            ) : null}
                            {u.dueDate ? (
                              <span>
                                • Deadline : <span className="font-semibold">{prettyDate(u.dueDate)}</span>
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          {smallPill(u.status)}
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 ml-1">Voir →</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}