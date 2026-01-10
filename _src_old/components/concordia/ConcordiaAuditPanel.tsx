"use client";

import { useState } from "react";

type SectorOption =
  | "generic"
  | "employment"
  | "hr"
  | "finance"
  | "health"
  | "public"
  | "education"
  | "law-enforcement"
  | "infrastructure";

type RoleOption = "provider" | "deployer";

export default function ConcordiaAuditPanel() {
  // états de base
  const [systemName, setSystemName] = useState("");
  const [useCaseName, setUseCaseName] = useState("");
  const [sector, setSector] = useState<SectorOption>("generic");
  const [role, setRole] = useState<RoleOption>("deployer");

  const [affectsRights, setAffectsRights] = useState(false);
  const [safetyCritical, setSafetyCritical] = useState(false);
  const [vulnerableGroups, setVulnerableGroups] = useState(false);
  const [biometric, setBiometric] = useState(false);

  // flags système
  const [isGPAI, setIsGPAI] = useState(false);
  const [isGPAISystemicRisk, setIsGPAISystemicRisk] = useState(false);
  const [isMilitarySystem, setIsMilitarySystem] = useState(false);
  const [isResearchOnlySystem, setIsResearchOnlySystem] = useState(false);
  const [isPersonalUseOnlySystem, setIsPersonalUseOnlySystem] =
    useState(false);

  // descriptions
  const [systemDescription, setSystemDescription] = useState("");
  const [dataDescription, setDataDescription] = useState("");

  // résultats
  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<any | null>(null);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAudit() {
    setLoading(true);
    setError(null);
    setAuditResult(null);
    setAiResult(null);

    try {
      const body = {
        id: "system-front-1",
        name: systemName || "Système d'IA sans nom",
        role,
        entityType: role,
        isGPAI,
        isGPAISystemicRisk,
        isMilitarySystem,
        isResearchOnlySystem,
        isPersonalUseOnlySystem,
        systemDescription,
        dataDescription,
        useCases: [
          {
            id: "uc-1",
            name: useCaseName || "Cas d'usage principal",
            sector,
            description:
              "Cas d'usage décrit depuis le formulaire du dashboard Concordia.",
            affectsRights,
            safetyCritical,
            vulnerableGroups,
            biometric,
            users: ["internal"],
            countries: ["FR"],
          },
        ],
      };

      const res = await fetch("/api/audit-with-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erreur ${res.status} : ${text}`);
      }

      const json = await res.json();
      setAuditResult(json.audit);
      setAiResult(json.ai);
    } catch (e: any) {
      setError(e.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header bloc */}
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">
            Nouvel audit IA – Moteur Concordia
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Décris ton système d&apos;IA, le moteur calcule le statut IA
            Act, le score de conformité et les obligations applicables.
          </p>
        </div>
      </div>

      {/* Formulaire + résultats en 2 colonnes */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* FORMULAIRE */}
        <div className="border rounded-md bg-slate-50 p-4 space-y-3">
          {/* Nom système */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nom du système d&apos;IA
            </label>
            <input
              type="text"
              value={systemName}
              onChange={(e) => setSystemName(e.target.value)}
              className="w-full px-2 py-1.5 text-xs border rounded-md bg-white"
              placeholder="Ex : IA de scoring candidats, IA d’analyse d’images médicales..."
            />
          </div>

          {/* Cas d'usage */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Cas d&apos;usage principal
            </label>
            <input
              type="text"
              value={useCaseName}
              onChange={(e) => setUseCaseName(e.target.value)}
              className="w-full px-2 py-1.5 text-xs border rounded-md bg-white"
              placeholder="Ex : Filtrage CV, scoring crédit, recommandation produit..."
            />
          </div>

          {/* Description système */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Comment l&apos;IA est utilisée ?
            </label>
            <textarea
              value={systemDescription}
              onChange={(e) => setSystemDescription(e.target.value)}
              rows={3}
              className="w-full px-2 py-1.5 text-xs border rounded-md bg-white"
              placeholder="Ex : L’IA analyse les CV, calcule un score de matching, propose une shortlist..."
            />
          </div>

          {/* Description données */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Quelles données sont utilisées ?
            </label>
            <textarea
              value={dataDescription}
              onChange={(e) => setDataDescription(e.target.value)}
              rows={3}
              className="w-full px-2 py-1.5 text-xs border rounded-md bg-white"
              placeholder="Ex : CV PDF, données clients, logs d’usage, historiques de transactions..."
            />
          </div>

          {/* Rôle + secteur */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Rôle (IA Act)
              </label>
              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as RoleOption)
                }
                className="w-full px-2 py-1.5 text-xs border rounded-md bg-white"
              >
                <option value="deployer">
                  Deployer (utilisateur professionnel)
                </option>
                <option value="provider">
                  Provider (fournisseur / éditeur)
                </option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Secteur principal
              </label>
              <select
                value={sector}
                onChange={(e) =>
                  setSector(e.target.value as SectorOption)
                }
                className="w-full px-2 py-1.5 text-xs border rounded-md bg-white"
              >
                <option value="generic">Générique / transversal</option>
                <option value="employment">Emploi / recrutement</option>
                <option value="hr">Ressources humaines</option>
                <option value="finance">Finance / crédit</option>
                <option value="health">Santé</option>
                <option value="public">Secteur public</option>
                <option value="education">Éducation</option>
                <option value="law-enforcement">
                  Police / justice / sécurité
                </option>
                <option value="infrastructure">
                  Infrastructures critiques
                </option>
              </select>
            </div>
          </div>

          {/* Risques use case */}
          <div className="border rounded-md bg-white px-2 py-2 space-y-1.5">
            <p className="text-[11px] font-semibold text-slate-600">
              Impact du cas d&apos;usage
            </p>
            <label className="flex items-center gap-2 text-[11px] text-slate-700">
              <input
                type="checkbox"
                checked={affectsRights}
                onChange={(e) =>
                  setAffectsRights(e.target.checked)
                }
              />
              Impacte des décisions importantes pour les personnes
            </label>
            <label className="flex items-center gap-2 text-[11px] text-slate-700">
              <input
                type="checkbox"
                checked={safetyCritical}
                onChange={(e) =>
                  setSafetyCritical(e.target.checked)
                }
              />
              Critique pour la sécurité (santé, intégrité physique...)
            </label>
            <label className="flex items-center gap-2 text-[11px] text-slate-700">
              <input
                type="checkbox"
                checked={vulnerableGroups}
                onChange={(e) =>
                  setVulnerableGroups(e.target.checked)
                }
              />
              Cible ou impacte des groupes vulnérables
            </label>
            <label className="flex items-center gap-2 text-[11px] text-slate-700">
              <input
                type="checkbox"
                checked={biometric}
                onChange={(e) => setBiometric(e.target.checked)}
              />
              Utilise des données biométriques
            </label>
          </div>

          {/* Flags système */}
          <div className="border rounded-md bg-white px-2 py-2 space-y-1.5">
            <p className="text-[11px] font-semibold text-slate-600">
              Nature du système
            </p>
            <label className="flex items-center gap-2 text-[11px] text-slate-700">
              <input
                type="checkbox"
                checked={isGPAI}
                onChange={(e) => setIsGPAI(e.target.checked)}
              />
              GPAI (modèle généraliste)
            </label>
            <label className="flex items-center gap-2 text-[11px] text-slate-700">
              <input
                type="checkbox"
                checked={isGPAISystemicRisk}
                onChange={(e) =>
                  setIsGPAISystemicRisk(e.target.checked)
                }
              />
              GPAI à risque systémique
            </label>
            <label className="flex items-center gap-2 text-[11px] text-slate-700">
              <input
                type="checkbox"
                checked={isMilitarySystem}
                onChange={(e) =>
                  setIsMilitarySystem(e.target.checked)
                }
              />
              Usage militaire
            </label>
            <label className="flex items-center gap-2 text-[11px] text-slate-700">
              <input
                type="checkbox"
                checked={isResearchOnlySystem}
                onChange={(e) =>
                  setIsResearchOnlySystem(e.target.checked)
                }
              />
              Usage uniquement recherche
            </label>
            <label className="flex items-center gap-2 text-[11px] text-slate-700">
              <input
                type="checkbox"
                checked={isPersonalUseOnlySystem}
                onChange={(e) =>
                  setIsPersonalUseOnlySystem(e.target.checked)
                }
              />
              Usage strictement personnel / non pro
            </label>
          </div>

          {error && (
            <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-md px-2 py-1 mt-1">
              {error}
            </p>
          )}

          <button
            onClick={runAudit}
            disabled={loading}
            className="mt-2 w-full text-xs font-semibold rounded-full px-3 py-2 text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Analyse en cours..." : "Lancer l'audit Concordia"}
          </button>
        </div>

        {/* RÉSULTATS */}
        <div className="space-y-3">
          {auditResult && (
            <div className="border rounded-md bg-white p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Résumé moteur Concordia
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {auditResult.systemName}
                  </p>
                </div>
                <div className="text-right text-[11px] text-slate-700">
                  <div>
                    Statut :{" "}
                    <span className="font-semibold">
                      {auditResult.systemStatus}
                    </span>
                  </div>
                  <div>
                    Score global :{" "}
                    <span
                      className={
                        auditResult.score.overall >= 75
                          ? "font-bold text-emerald-600"
                          : auditResult.score.overall >= 45
                          ? "font-bold text-amber-600"
                          : "font-bold text-red-600"
                      }
                    >
                      {auditResult.score.overall}/100
                    </span>
                  </div>
                </div>
              </div>

              {auditResult.useCases?.map((uc: any) => (
                <div
                  key={uc.useCaseId}
                  className="border-t border-slate-200 pt-2 mt-2 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-900">
                      {uc.useCaseName}
                    </p>
                    <span
                      className={
                        uc.riskLevel === "high"
                          ? "text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-700"
                          : uc.riskLevel === "limited"
                          ? "text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700"
                          : "text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700"
                      }
                    >
                      Risque : {uc.riskLevel}
                    </span>
                  </div>

                  {Array.isArray(uc.appliedObligations) &&
                    uc.appliedObligations.length > 0 && (
                      <div className="mt-1 space-y-1">
                        <p className="text-[11px] font-semibold text-slate-700">
                          Obligations applicables :
                        </p>
                        <ul className="text-[11px] text-slate-700 space-y-0.5 list-disc list-inside">
                          {uc.appliedObligations.map((ob: any) => (
                            <li key={ob.obligationId}>
                              <span className="uppercase text-[10px] font-semibold text-slate-500 mr-1">
                                [{ob.category}]
                              </span>
                              {ob.label}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}

          {aiResult && (
            <div className="border rounded-md bg-white p-4 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Synthèse IA & plan d&apos;action
              </p>
              {aiResult.executiveSummary && (
                <p className="text-[11px] text-slate-800 whitespace-pre-wrap">
                  {aiResult.executiveSummary}
                </p>
              )}

              {Array.isArray(aiResult.keyRisks) &&
                aiResult.keyRisks.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold text-slate-700">
                      Risques clés :
                    </p>
                    <ul className="text-[11px] text-slate-700 list-disc list-inside space-y-0.5">
                      {aiResult.keyRisks.map(
                        (r: string, idx: number) => (
                          <li key={idx}>{r}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              {Array.isArray(aiResult.actionPlan) &&
                aiResult.actionPlan.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold text-slate-700">
                      Plan d&apos;action priorisé :
                    </p>
                    <ul className="text-[11px] text-slate-700 list-disc list-inside space-y-0.5">
                      {aiResult.actionPlan.map(
                        (a: any, idx: number) => (
                          <li key={idx}>
                            <span className="font-semibold">
                              [{a.priority}]
                            </span>{" "}
                            {a.title} — {a.description}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
            </div>
          )}

          {!auditResult && !aiResult && !loading && !error && (
            <p className="text-[11px] text-slate-500">
              Lance un audit pour afficher ici le statut IA Act, le
              score et les obligations.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
