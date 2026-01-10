"use client";

import { FormEvent, useState } from "react";
import ConcordiaReport from "@/components/concordia/ConcordiaReport";



type RoleOption = "deployer" | "provider";
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

export default function EngineAuditPage() {
  const [systemId, setSystemId] = useState("system-1");
  const [systemName, setSystemName] = useState("tri de dossiers");
  const [role, setRole] = useState<RoleOption>("deployer");
  const [isGPAI, setIsGPAI] = useState(false);

  const [useCaseName, setUseCaseName] = useState("classification de dossiers");
  const [sector, setSector] = useState<SectorOption>("employment");

  const [affectsRights, setAffectsRights] = useState(true);
  const [vulnerableGroups, setVulnerableGroups] = useState(false);
  const [biometric, setBiometric] = useState(false);
  const [safetyCritical, setSafetyCritical] = useState(false);

  // grandes zones de texte
  const [systemDescription, setSystemDescription] = useState(
    "Exemple : ce système classe automatiquement des dossiers de candidature pour prioriser les profils à contacter."
  );
  const [dataDescription, setDataDescription] = useState(
    "Exemple : CV, lettres de motivation, notes internes des recruteurs, historique des candidatures, données issues de tests en ligne."
  );

  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAudit(null);

    try {
      const res = await fetch("/api/concordia-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: systemId,
          name: systemName,
          role,
          isGPAI,
          systemDescription,
          dataDescription,
          useCases: [
            {
              id: "uc-1",
              name: useCaseName,
              sector,
              biometric,
              safetyCritical,
              affectsRights,
              vulnerableGroups,
              users: ["utilisateurs internes"],
              countries: ["FR"],
            },
          ],
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erreur API (${res.status}) : ${text}`);
      }

      const json = await res.json();
      setAudit(json);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Erreur inconnue lors de l'audit.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-5xl mx-auto py-8 space-y-8">
      {/* Titre + intro */}
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">
          Audit IA Act (moteur Concordia)
        </h1>
        <p className="text-sm text-slate-600">
          Configure un système d&apos;IA et un cas d&apos;usage, puis lance le
          moteur Concordia pour obtenir une classification IA Act, les
          obligations applicables et un score de conformité. Tu peux ensuite
          générer un PDF professionnel du rapport.
        </p>
      </section>

      {/* Formulaire système + use case */}
      <section className="border rounded-lg bg-white shadow-sm p-4 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bloc système */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-800">
              1. Paramètres du système
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Identifiant du système
                </label>
                <input
                  className="w-full border rounded-md px-2 py-1 text-sm"
                  value={systemId}
                  onChange={(e) => setSystemId(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Nom du système
                </label>
                <input
                  className="w-full border rounded-md px-2 py-1 text-sm"
                  value={systemName}
                  onChange={(e) => setSystemName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Rôle / type d&apos;entité
                </label>
                <select
                  className="w-full border rounded-md px-2 py-1 text-sm bg-white"
                  value={role}
                  onChange={(e) => setRole(e.target.value as RoleOption)}
                >
                  <option value="deployer">
                    Déployeur (utilisateur final)
                  </option>
                  <option value="provider">
                    Fournisseur (éditeur de la solution)
                  </option>
                </select>
              </div>

              <div className="flex items-center gap-2 mt-5">
                <input
                  id="isGPAI"
                  type="checkbox"
                  className="h-4 w-4"
                  checked={isGPAI}
                  onChange={(e) => setIsGPAI(e.target.checked)}
                />
                <label
                  htmlFor="isGPAI"
                  className="text-xs font-medium text-slate-700"
                >
                  Modèle GPAI (IA à usage général)
                </label>
              </div>
            </div>

            {/* Zone texte : description du fonctionnement de l'IA */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Décris concrètement comment l&apos;IA est utilisée
              </label>
              <textarea
                className="w-full border rounded-md px-2 py-2 text-sm min-h-[90px]"
                value={systemDescription}
                onChange={(e) => setSystemDescription(e.target.value)}
                placeholder="Exemple : l’IA analyse automatiquement les dossiers pour attribuer un score à chaque candidature, puis propose un classement priorisant les profils à contacter."
              />
            </div>
          </div>

          {/* Bloc use case */}
          <div className="space-y-3 border-t pt-4">
            <h2 className="text-sm font-semibold text-slate-800">
              2. Cas d&apos;usage principal
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Nom du cas d&apos;usage
                </label>
                <input
                  className="w-full border rounded-md px-2 py-1 text-sm"
                  value={useCaseName}
                  onChange={(e) => setUseCaseName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Secteur
                </label>
                <select
                  className="w-full border rounded-md px-2 py-1 text-sm bg-white"
                  value={sector}
                  onChange={(e) =>
                    setSector(e.target.value as SectorOption)
                  }
                >
                  <option value="generic">Générique / support</option>
                  <option value="employment">Emploi / recrutement</option>
                  <option value="hr">Ressources humaines internes</option>
                  <option value="finance">Finance / crédit / assurance</option>
                  <option value="health">Santé</option>
                  <option value="public">Secteur public</option>
                  <option value="education">Éducation</option>
                  <option value="law-enforcement">
                    Maintien de l&apos;ordre
                  </option>
                  <option value="infrastructure">
                    Infrastructure critique
                  </option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-700">
                  Impact sur les personnes
                </p>
                <div className="space-y-1 text-xs text-slate-700">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={affectsRights}
                      onChange={(e) => setAffectsRights(e.target.checked)}
                    />
                    <span>
                      Impact sur les droits ou la situation des personnes
                      (accès à un emploi, un service, une décision...)
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={vulnerableGroups}
                      onChange={(e) =>
                        setVulnerableGroups(e.target.checked)
                      }
                    />
                    <span>
                      Cible ou impacte des groupes vulnérables (mineurs,
                      personnes en grande précarité, etc.)
                    </span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-700">
                  Sensibilité technique
                </p>
                <div className="space-y-1 text-xs text-slate-700">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={biometric}
                      onChange={(e) => setBiometric(e.target.checked)}
                    />
                    <span>Utilise des données biométriques</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={safetyCritical}
                      onChange={(e) =>
                        setSafetyCritical(e.target.checked)
                      }
                    />
                    <span>
                      Décisions pouvant impacter directement la sécurité ou
                      l&apos;intégrité physique
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Zone texte : description des données */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Décris les données utilisées (sources, type, personnes
                concernées)
              </label>
              <textarea
                className="w-full border rounded-md px-2 py-2 text-sm min-h-[90px]"
                value={dataDescription}
                onChange={(e) => setDataDescription(e.target.value)}
                placeholder="Exemple : CV des candidats, lettres de motivation, réponses à des formulaires en ligne, données issues de tests techniques, logs d’entretiens."
              />
            </div>
          </div>

          {/* Bouton submit */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Analyse en cours..." : "Lancer l'audit IA Act"}
            </button>

            {audit && (
              <button
                type="button"
               
                className="px-3 py-2 border rounded-md text-xs font-medium bg-white hover:bg-slate-50"
              >
                Générer le PDF du rapport
              </button>
            )}
          </div>

          {/* Erreur éventuelle */}
          {error && (
            <p className="text-xs text-red-600 mt-2">
              Erreur lors de l&apos;appel du moteur : {error}
            </p>
          )}
        </form>
      </section>

      {/* Rapport moteur */}
      {audit && (
        <section className="border rounded-lg bg-white shadow-sm">
          <ConcordiaReport audit={audit} auditId="engine-preview" />

        </section>
      )}
    </main>
  );
}
