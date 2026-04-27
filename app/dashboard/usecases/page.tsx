"use client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type UseCaseItem = {
  key: string;
  title: string;
  sector: string;
  updatedAt: string;
  counts?: {
    total: number;
    nonCompliant: number;
    inProgress: number;
    compliant: number;
  };
};

type ApiUseCases =
  | { ok: true; useCases: UseCaseItem[] }
  | { ok: false; error: string; details?: any };

function prettyDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function normalizeKey(s: string) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function getSectorMeta(rawSector: string): { label: string; icon: string } {
  const k = normalizeKey(rawSector);

  const map: Record<string, { label: string; icon: string }> = {
    finance: { label: "Finance", icon: "💳" },
    immobilier: { label: "Immobilier", icon: "🏠" },
    emploi: { label: "Emploi", icon: "👥" },
    employment: { label: "Emploi", icon: "👥" },
    rh: { label: "RH", icon: "👥" },
    hr: { label: "RH", icon: "👥" },
    marketing: { label: "Marketing", icon: "📣" },
    sales: { label: "Ventes", icon: "📈" },
    commerce: { label: "Ventes", icon: "📈" },
    legal: { label: "Juridique", icon: "⚖️" },
    juridique: { label: "Juridique", icon: "⚖️" },
    justice: { label: "Justice", icon: "⚖️" },
    assurance: { label: "Assurance", icon: "🛡️" },
    sante: { label: "Santé", icon: "🩺" },
    santé: { label: "Santé", icon: "🩺" },
    industrie: { label: "Industrie", icon: "🏭" },
    energie: { label: "Énergie", icon: "⚡" },
    énergie: { label: "Énergie", icon: "⚡" },
    securite: { label: "Sécurité", icon: "🔒" },
    sécurité: { label: "Sécurité", icon: "🔒" },
    education: { label: "Éducation", icon: "🎓" },
    éducation: { label: "Éducation", icon: "🎓" },
    public: { label: "Secteur public", icon: "🏛️" },
    transport: { label: "Transport", icon: "🚆" },
    retail: { label: "Retail", icon: "🛍️" },
    e_commerce: { label: "E-commerce", icon: "🛒" },
    ecommerce: { label: "E-commerce", icon: "🛒" },
    it: { label: "Tech", icon: "💻" },
    tech: { label: "Tech", icon: "💻" },
    ia: { label: "IA", icon: "🤖" },
    generic: { label: "Général", icon: "✦" },
    general: { label: "Général", icon: "✦" },
  };

  if (map[k]) return map[k];

  const fallbackLabel =
    rawSector && rawSector.trim().length > 0
      ? rawSector.trim().charAt(0).toUpperCase() + rawSector.trim().slice(1)
      : "Général";

  return { label: fallbackLabel, icon: "✦" };
}

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

function SectorBadge({ sector }: { sector: string }) {
  const meta = getSectorMeta(sector);
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800">
      <span className="text-sm leading-none">{meta.icon}</span>
      <span>{meta.label}</span>
    </span>
  );
}

function UseCaseGauge({ counts }: { counts?: UseCaseItem["counts"] }) {
  const total = counts?.total ?? 0;
  const compliant = counts?.compliant ?? 0;
  const inProgress = counts?.inProgress ?? 0;
  const nonCompliant = counts?.nonCompliant ?? 0;

  const [anim, setAnim] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnim(1), 80);
    return () => clearTimeout(t);
  }, []);

  if (total <= 0) {
    return (
      <div className="mt-5">
        <div className="h-5 w-full rounded-full bg-slate-100" />
        <div className="mt-2 text-xs text-slate-500">Aucune obligation pour l'instant</div>
      </div>
    );
  }

  const allCompliant = compliant === total;
  const someCompliant = compliant > 0;

  const barColor = allCompliant
    ? "bg-green-500"
    : someCompliant
    ? "bg-amber-500"
    : "bg-red-500";

  const easeStyle = {
    transition: "width 1500ms cubic-bezier(0.22, 1, 0.36, 1)",
  } as const;

  return (
    <div className="mt-5">
      <div className="h-5 w-full overflow-hidden rounded-full bg-slate-100 flex shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
        <div
          className={`h-full ${barColor}`}
          style={{ width: `${100 * anim}%`, ...easeStyle }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
            <span>{compliant}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span>{inProgress}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
            <span>{nonCompliant}</span>
          </div>
        </div>
        <div className="text-slate-500">{total} total</div>
      </div>
    </div>
  );
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [useCases, setUseCases] = useState<UseCaseItem[]>([]);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/usecases?limit=200", { method: "GET" });
      const text = await res.text();
      const data: ApiUseCases = text ? JSON.parse(text) : (null as any);
      if (!res.ok || !data || (data as any).ok !== true) {
        throw new Error((data as any)?.error || `Erreur API (${res.status})`);
      }
      const list = Array.isArray((data as any).useCases)
        ? ((data as any).useCases as UseCaseItem[])
        : [];
      setUseCases(list);
    } catch (e: any) {
      setUseCases([]);
      setErr(e?.message || "Erreur chargement use cases");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(key: string, title: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm(`Supprimer le cas d'usage "${title}" ? Cette action est irréversible et supprimera toutes les obligations et preuves associées.`)) return;

    setDeletingKey(key);
    try {
      const res = await fetch(`/api/usecases/${encodeURIComponent(key)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || "Erreur suppression");
      await load();
    } catch (e: any) {
      alert(e?.message || "Erreur lors de la suppression");
    } finally {
      setDeletingKey(null);
    }
  }

  const stats = useMemo(() => {
    const useCasesCount = useCases.length;
    const obligationsTotal = useCases.reduce(
      (acc, uc) => acc + (uc.counts?.total ?? 0),
      0
    );
    return { useCasesCount, obligationsTotal };
  }, [useCases]);

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cas d'usage</h1>
          <p className="mt-1 text-sm text-slate-600">
            Vue synthèse par système IA (progrès de conformité par cas d'usage).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/registre-vivant"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            Voir le cockpit
          </Link>
          <Link
            href="/dashboard/registre-vivant/liste"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Voir la liste complète
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatTile label="Cas d'usage" value={stats.useCasesCount} />
        <StatTile label="Obligations (total)" value={stats.obligationsTotal} />
      </div>

      {err && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {err}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-slate-600">Chargement des cas d'usage…</div>
      ) : useCases.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Aucun cas d'usage.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {useCases.map((uc) => {
            const total = uc.counts?.total ?? 0;
            const compliant = uc.counts?.compliant ?? 0;
            const isDeleting = deletingKey === uc.key;

            return (
              <div key={uc.key} className="relative group">
                <Link
                  href={`/dashboard/usecases/${encodeURIComponent(uc.key)}`}
                  className="block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition hover:-translate-y-[1px]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold uppercase tracking-widest text-slate-700 truncate">
                        {uc.title}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        Mis à jour le{" "}
                        <span className="font-semibold text-slate-700">
                          {prettyDate(uc.updatedAt)}
                        </span>
                      </div>
                    </div>
                    <div className="pt-0.5">
                      <SectorBadge sector={uc.sector} />
                    </div>
                  </div>

                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Conformes
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">
                        {compliant}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Obligations
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">
                        {total}
                      </div>
                    </div>
                  </div>

                  <UseCaseGauge counts={uc.counts} />

                  <div className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-600 group-hover:text-slate-800">
                    Voir le dossier →
                  </div>
                </Link>

                {/* Bouton suppression */}
                <button
                  type="button"
                  onClick={(e) => handleDelete(uc.key, uc.title, e)}
                  disabled={isDeleting}
                  className={[
                    "absolute top-3 right-3 rounded-lg border px-2 py-1.5 text-xs font-semibold transition",
                    "opacity-0 group-hover:opacity-100",
                    isDeleting
                      ? "border-rose-200 bg-rose-50 text-rose-400 opacity-100"
                      : "border-rose-200 bg-white text-rose-500 hover:bg-rose-50",
                  ].join(" ")}
                >
                  {isDeleting ? "Suppression…" : "🗑"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}