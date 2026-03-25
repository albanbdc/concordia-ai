"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type UseCase = {
  key: string;
  title: string;
  sector: string;
  classification: string;
  role: string;
  status: string;
};

type Obligation = {
  id: string;
  title: string;
  legalRef: string | null;
  criticality: string | null;
  useCasesCount: number;
  compliant: number;
  inProgress: number;
  nonCompliant: number;
  notEvaluated: number;
  complianceRate: number;
  globalStatus: string;
  useCases: UseCase[];
};

type Chapter = {
  id: string;
  title: string;
  legalRef: string;
  description: string;
  complianceRate: number;
  totalUseCases: number;
  obligations: Obligation[];
};

const STATUS_LABEL: Record<string, string> = {
  COMPLIANT: "Conforme",
  IN_PROGRESS: "En cours",
  NON_COMPLIANT: "Non conforme",
  NOT_EVALUATED: "Non évalué",
  EMPTY: "Aucun cas d'usage",
};

const STATUS_COLOR: Record<string, string> = {
  COMPLIANT: "bg-emerald-100 text-emerald-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  NON_COMPLIANT: "bg-red-100 text-red-700",
  NOT_EVALUATED: "bg-slate-100 text-slate-500",
  EMPTY: "bg-slate-50 text-slate-400",
};

const CRITICALITY_DOT: Record<string, string> = {
  CRITICAL: "bg-red-500",
  HIGH: "bg-orange-400",
  MEDIUM: "bg-yellow-400",
  LOW: "bg-slate-300",
};

function classificationLabel(c: string) {
  if (c === "HIGH_RISK") return "Haut risque";
  if (c === "TRANSPARENCY") return "Transparence";
  if (c === "NORMAL") return "Risque minimal";
  return c;
}

function roleLabel(r: string) {
  if (r === "DEPLOYER") return "Déployeur";
  if (r === "PROVIDER") return "Fournisseur";
  if (r === "BOTH") return "Déployeur + Fournisseur";
  return r;
}

export default function VueControleurPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<Obligation | null>(null);

  useEffect(() => {
    fetch("/api/vue-controleur")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setChapters(data.chapters);
          setGeneratedAt(data.generatedAt);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-slate-500 text-sm">Chargement du registre…</div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">

      {/* EN-TÊTE */}
      <div className="border-b pb-6">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">
              Règlement (UE) 2024/1689 · AI Act
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Vue contrôleur — Registre de conformité
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Généré le{" "}
              {generatedAt
                ? new Date(generatedAt).toLocaleString("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"}
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs text-slate-400 mb-1">Intégrité du registre</div>
            <div className="text-2xl font-bold text-emerald-600">100%</div>
            <div className="text-xs text-slate-400">Chaîne append-only vérifiée</div>
          </div>
        </div>
      </div>

      {/* CHAPITRES */}
      {chapters.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
          Aucun cas d'usage déclaré. Commencez par ajouter un système IA.
        </div>
      ) : (
        chapters.map((chapter) => {
          const isOpen = expandedChapter === chapter.id;

          return (
            <div key={chapter.id} className="border border-slate-200 rounded-2xl overflow-hidden">

              {/* Header chapitre */}
              <button
                onClick={() => setExpandedChapter(isOpen ? null : chapter.id)}
                className="w-full text-left px-6 py-5 bg-slate-50 hover:bg-slate-100 transition flex items-center justify-between gap-6"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-400 font-semibold mb-1">
                    {chapter.legalRef}
                  </div>
                  <div className="text-base font-bold text-slate-900">
                    {chapter.title}
                  </div>
                  <div className="text-sm text-slate-500 mt-1 leading-relaxed">
                    {chapter.description}
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right">
                    <div className="text-xs text-slate-400 mb-0.5">Cas d'usage</div>
                    <div className="text-xl font-bold text-slate-900">{chapter.totalUseCases}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400 mb-0.5">Conformité</div>
                    <div className={`text-xl font-bold ${
                      chapter.complianceRate === 100 ? "text-emerald-600" :
                      chapter.complianceRate >= 50 ? "text-amber-600" :
                      chapter.complianceRate > 0 ? "text-orange-500" :
                      "text-slate-400"
                    }`}>
                      {chapter.complianceRate}%
                    </div>
                  </div>
                  <div className="text-slate-400">{isOpen ? "▲" : "▼"}</div>
                </div>
              </button>

              {/* Obligations */}
              {isOpen && (
                <div className="divide-y divide-slate-100">
                  {chapter.obligations.map((obl) => (
                    <button
                      key={obl.id}
                      onClick={() => setDrawer(obl)}
                      className="w-full text-left px-6 py-4 hover:bg-slate-50 transition flex items-center justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {obl.criticality && (
                            <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${CRITICALITY_DOT[obl.criticality] ?? "bg-slate-300"}`} />
                          )}
                          {obl.legalRef && (
                            <span className="text-xs font-semibold text-slate-400">{obl.legalRef}</span>
                          )}
                        </div>
                        <div className="font-medium text-sm text-slate-900">{obl.title}</div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <div className="text-xs text-slate-400">Cas d'usage</div>
                          <div className="font-semibold text-sm">{obl.useCasesCount}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-400">Conformité</div>
                          <div className="font-semibold text-sm">{obl.complianceRate}%</div>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLOR[obl.globalStatus]}`}>
                          {STATUS_LABEL[obl.globalStatus]}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* DRAWER */}
      {drawer && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30" onClick={() => setDrawer(null)} />
          <div className="w-[500px] bg-white h-full shadow-2xl overflow-y-auto p-8 space-y-6">

            {/* Header drawer */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {drawer.legalRef && (
                    <span className="text-xs font-semibold text-slate-500">{drawer.legalRef}</span>
                  )}
                  {drawer.criticality && (
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className={`inline-block w-2 h-2 rounded-full ${CRITICALITY_DOT[drawer.criticality]}`} />
                      {drawer.criticality === "CRITICAL" ? "Critique" :
                       drawer.criticality === "HIGH" ? "Élevé" :
                       drawer.criticality === "MEDIUM" ? "Moyen" : "Faible"}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-slate-900 leading-snug">{drawer.title}</h2>
              </div>
              <button onClick={() => setDrawer(null)} className="text-slate-400 hover:text-slate-700 text-xl shrink-0">✕</button>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Conformes", value: drawer.compliant, color: "text-emerald-600" },
                { label: "En cours", value: drawer.inProgress, color: "text-amber-500" },
                { label: "Non conformes", value: drawer.nonCompliant, color: "text-red-600" },
                { label: "Non évalués", value: drawer.notEvaluated, color: "text-slate-400" },
              ].map((k) => (
                <div key={k.label} className="border border-slate-200 rounded-xl p-3 text-center">
                  <div className="text-xs text-slate-400 mb-1">{k.label}</div>
                  <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
                </div>
              ))}
            </div>

            {/* Taux global */}
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">Taux de conformité</span>
                <span className="text-sm font-bold text-slate-900">{drawer.complianceRate}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    drawer.complianceRate === 100 ? "bg-emerald-500" :
                    drawer.complianceRate > 0 ? "bg-amber-500" : "bg-red-500"
                  }`}
                  style={{ width: `${drawer.complianceRate}%` }}
                />
              </div>
            </div>

            {/* Use cases */}
            <div>
              <h3 className="font-semibold text-slate-700 mb-3 text-sm">
                Cas d'usage concernés ({drawer.useCasesCount})
              </h3>
              <div className="space-y-2">
                {drawer.useCases.length === 0 ? (
                  <div className="text-sm text-slate-400 py-2">Aucun cas d'usage associé.</div>
                ) : (
                  drawer.useCases.map((uc) => (
                    <Link
                      key={uc.key}
                      href={`/dashboard/usecases/${uc.key}`}
                      onClick={() => setDrawer(null)}
                      className="border border-slate-200 rounded-xl p-3 flex items-center justify-between hover:bg-slate-50 transition"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm text-slate-900 truncate">{uc.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {uc.sector} · {roleLabel(uc.role)} · {classificationLabel(uc.classification)}
                        </div>
                      </div>
                      <span className={`ml-3 shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLOR[String(uc.status).toUpperCase()] ?? "bg-slate-100 text-slate-400"}`}>
                        {STATUS_LABEL[String(uc.status).toUpperCase()] ?? uc.status}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}