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

export default function ConcordiaAuditPage() {
  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<any | null>(null);
  const [aiResult, setAiResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Champs du formulaire
  const [systemName, setSystemName] = useState("");
  const [useCaseName, setUseCaseName] = useState("");
  const [sector, setSector] = useState<SectorOption>("generic");
  const [affectsRights, setAffectsRights] = useState(false);
  const [safetyCritical, setSafetyCritical] = useState(false);
  const [vulnerableGroups, setVulnerableGroups] = useState(false);
  const [biometric, setBiometric] = useState(false);

  const [role, setRole] = useState<RoleOption>("deployer");

  // Flags système IA Act
  const [isGPAI, setIsGPAI] = useState(false);
  const [isGPAISystemicRisk, setIsGPAISystemicRisk] = useState(false);
  const [isMilitarySystem, setIsMilitarySystem] = useState(false);
  const [isResearchOnlySystem, setIsResearchOnlySystem] = useState(false);
  const [isPersonalUseOnlySystem, setIsPersonalUseOnlySystem] = useState(false);

  // Descriptions
  const [systemDescription, setSystemDescription] = useState("");
  const [dataDescription, setDataDescription] = useState("");

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
              "Cas d'usage décrit depuis le formulaire Concordia.",
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
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        padding: "32px 24px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1120px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "minmax(0, 420px) minmax(0, 1fr)",
          gap: "24px",
        }}
      >
        {/* Colonne gauche : formulaire */}
        <div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              marginBottom: "4px",
              color: "#111827",
            }}
          >
            Nouvel audit IA — Concordia
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "#6b7280",
              marginBottom: "16px",
            }}
          >
            Décris ton système d&apos;IA et laisse le moteur Concordia analyser
            son statut IA Act, les obligations applicables et le score de
            conformité.
          </p>

          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              padding: "16px 16px 20px",
              boxShadow:
                "0 10px 15px -3px rgba(15,23,42,0.06), 0 4px 6px -2px rgba(15,23,42,0.03)",
            }}
          >
            {/* Nom du système */}
            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 500,
                  marginBottom: "4px",
                  color: "#374151",
                }}
              >
                Nom du système d&apos;IA
              </label>
              <input
                type="text"
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
                placeholder="Ex : Outil de scoring candidats, moteur d'analyse d'images médicales..."
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "13px",
                }}
              />
            </div>

            {/* Cas d'usage */}
            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 500,
                  marginBottom: "4px",
                  color: "#374151",
                }}
              >
                Cas d&apos;usage principal
              </label>
              <input
                type="text"
                value={useCaseName}
                onChange={(e) => setUseCaseName(e.target.value)}
                placeholder="Ex : Filtrage CV, scoring crédit, recommandation produit..."
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "13px",
                }}
              />
            </div>

            {/* Description système */}
            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 500,
                  marginBottom: "4px",
                  color: "#374151",
                }}
              >
                Comment l&apos;IA est utilisée ?
              </label>
              <textarea
                value={systemDescription}
                onChange={(e) => setSystemDescription(e.target.value)}
                rows={4}
                placeholder="Ex : L’IA analyse les CV, calcule un score de matching, propose une shortlist..."
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "13px",
                  resize: "vertical",
                }}
              />
            </div>

            {/* Description données */}
            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 500,
                  marginBottom: "4px",
                  color: "#374151",
                }}
              >
                Quelles données sont utilisées ?
              </label>
              <textarea
                value={dataDescription}
                onChange={(e) => setDataDescription(e.target.value)}
                rows={3}
                placeholder="Ex : CV PDF, données clients, logs d’usage, historiques de transactions..."
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "13px",
                  resize: "vertical",
                }}
              />
            </div>

            {/* Rôle + secteur */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 500,
                    marginBottom: "4px",
                    color: "#374151",
                  }}
                >
                  Rôle (IA Act)
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as RoleOption)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "13px",
                  }}
                >
                  <option value="deployer">Deployer (utilisateur professionnel)</option>
                  <option value="provider">Provider (fournisseur / éditeur)</option>
                </select>
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 500,
                    marginBottom: "4px",
                    color: "#374151",
                  }}
                >
                  Secteur principal
                </label>
                <select
                  value={sector}
                  onChange={(e) =>
                    setSector(e.target.value as SectorOption)
                  }
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontSize: "13px",
                  }}
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
            <div
              style={{
                display: "grid",
                gap: "6px",
                marginBottom: "10px",
                padding: "8px 10px",
                borderRadius: "8px",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#4b5563",
                }}
              >
                Impact du cas d&apos;usage
              </span>
              <label style={{ fontSize: "13px", color: "#374151" }}>
                <input
                  type="checkbox"
                  checked={affectsRights}
                  onChange={(e) => setAffectsRights(e.target.checked)}
                  style={{ marginRight: "6px" }}
                />
                Impacte des décisions importantes pour les personnes
              </label>
              <label style={{ fontSize: "13px", color: "#374151" }}>
                <input
                  type="checkbox"
                  checked={safetyCritical}
                  onChange={(e) => setSafetyCritical(e.target.checked)}
                  style={{ marginRight: "6px" }}
                />
                Critique pour la sécurité (santé, intégrité physique, etc.)
              </label>
              <label style={{ fontSize: "13px", color: "#374151" }}>
                <input
                  type="checkbox"
                  checked={vulnerableGroups}
                  onChange={(e) =>
                    setVulnerableGroups(e.target.checked)
                  }
                  style={{ marginRight: "6px" }}
                />
                Cible ou impacte des groupes vulnérables
              </label>
              <label style={{ fontSize: "13px", color: "#374151" }}>
                <input
                  type="checkbox"
                  checked={biometric}
                  onChange={(e) => setBiometric(e.target.checked)}
                  style={{ marginRight: "6px" }}
                />
                Utilise des données biométriques
              </label>
            </div>

            {/* Flags système */}
            <div
              style={{
                display: "grid",
                gap: "6px",
                marginBottom: "12px",
                padding: "8px 10px",
                borderRadius: "8px",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#4b5563",
                }}
              >
                Nature du système
              </span>
              <label style={{ fontSize: "13px", color: "#374151" }}>
                <input
                  type="checkbox"
                  checked={isGPAI}
                  onChange={(e) => setIsGPAI(e.target.checked)}
                  style={{ marginRight: "6px" }}
                />
                GPAI (modèle généraliste)
              </label>
              <label style={{ fontSize: "13px", color: "#374151" }}>
                <input
                  type="checkbox"
                  checked={isGPAISystemicRisk}
                  onChange={(e) =>
                    setIsGPAISystemicRisk(e.target.checked)
                  }
                  style={{ marginRight: "6px" }}
                />
                GPAI à risque systémique
              </label>
              <label style={{ fontSize: "13px", color: "#374151" }}>
                <input
                  type="checkbox"
                  checked={isMilitarySystem}
                  onChange={(e) =>
                    setIsMilitarySystem(e.target.checked)
                  }
                  style={{ marginRight: "6px" }}
                />
                Usage militaire
              </label>
              <label style={{ fontSize: "13px", color: "#374151" }}>
                <input
                  type="checkbox"
                  checked={isResearchOnlySystem}
                  onChange={(e) =>
                    setIsResearchOnlySystem(e.target.checked)
                  }
                  style={{ marginRight: "6px" }}
                />
                Système utilisé uniquement pour la recherche
              </label>
              <label style={{ fontSize: "13px", color: "#374151" }}>
                <input
                  type="checkbox"
                  checked={isPersonalUseOnlySystem}
                  onChange={(e) =>
                    setIsPersonalUseOnlySystem(e.target.checked)
                  }
                  style={{ marginRight: "6px" }}
                />
                Usage strictement personnel / non professionnel
              </label>
            </div>

            {error && (
              <div
                style={{
                  marginBottom: "8px",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  fontSize: "13px",
                  color: "#b91c1c",
                }}
              >
                {error}
              </div>
            )}

            <button
              onClick={runAudit}
              disabled={loading}
              style={{
                marginTop: "4px",
                width: "100%",
                padding: "10px 14px",
                borderRadius: "999px",
                border: "none",
                fontSize: "14px",
                fontWeight: 600,
                cursor: loading ? "default" : "pointer",
                background:
                  "linear-gradient(135deg, #111827, #1f2937)",
                color: "#f9fafb",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Analyse en cours..." : "Lancer l'audit Concordia"}
            </button>
          </div>
        </div>

        {/* Colonne droite : résultats */}
        

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Résumé moteur */}
          {auditResult && (
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                padding: "16px 18px 18px",
                boxShadow:
                  "0 10px 15px -3px rgba(15,23,42,0.06), 0 4px 6px -2px rgba(15,23,42,0.03)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#6b7280",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      marginBottom: "2px",
                    }}
                  >
                    Résumé moteur Concordia
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: "#111827",
                    }}
                  >
                    {auditResult.systemName}
                  </div>
                </div>
                <div
                  style={{
                    textAlign: "right",
                    fontSize: "13px",
                    color: "#4b5563",
                  }}
                >
                  <div>
                    Statut :{" "}
                    <strong>{auditResult.systemStatus}</strong>
                  </div>
                  <div>
                    Score global :{" "}
                    <span
                      style={{
                        fontWeight: 700,
                        color:
                          auditResult.score.overall >= 75
                            ? "#15803d"
                            : auditResult.score.overall >= 45
                            ? "#ca8a04"
                            : "#b91c1c",
                      }}
                    >
                      {auditResult.score.overall}/100
                    </span>
                  </div>
                </div>
              </div>

              {auditResult.useCases.map((uc: any) => (
                <div
                  key={uc.useCaseId}
                  style={{
                    marginTop: "10px",
                    paddingTop: "10px",
                    borderTop: "1px solid #e5e7eb",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      marginBottom: "4px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#111827",
                      }}
                    >
                      {uc.useCaseName}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        padding: "2px 8px",
                        borderRadius: "999px",
                        backgroundColor:
                          uc.riskLevel === "high"
                            ? "#fef2f2"
                            : uc.riskLevel === "limited"
                            ? "#fefce8"
                            : "#ecfdf3",
                        color:
                          uc.riskLevel === "high"
                            ? "#b91c1c"
                            : uc.riskLevel === "limited"
                            ? "#92400e"
                            : "#166534",
                      }}
                    >
                      Risque : {uc.riskLevel}
                    </div>
                  </div>

                  {Array.isArray(uc.appliedObligations) &&
                    uc.appliedObligations.length > 0 && (
                      <div style={{ marginTop: "6px" }}>
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            marginBottom: "4px",
                            color: "#374151",
                          }}
                        >
                          Obligations applicables :
                        </div>
                        <ul
                          style={{
                            paddingLeft: "18px",
                            margin: 0,
                            fontSize: "12px",
                            color: "#4b5563",
                          }}
                        >
                          {uc.appliedObligations.map((ob: any) => (
                            <li key={ob.obligationId}>
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.03em",
                                  marginRight: "4px",
                                  color: "#6b7280",
                                }}
                              >
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

          {/* Résumé IA */}
          {aiResult && (
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                padding: "16px 18px 18px",
                boxShadow:
                  "0 10px 15px -3px rgba(15,23,42,0.06), 0 4px 6px -2px rgba(15,23,42,0.03)",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#6b7280",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                }}
              >
                Synthèse IA & plan d&apos;action
              </div>

              <div
                style={{
                  fontSize: "13px",
                  color: "#111827",
                  marginBottom: "10px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {aiResult.executiveSummary}
              </div>

              {Array.isArray(aiResult.keyRisks) &&
                aiResult.keyRisks.length > 0 && (
                  <div style={{ marginBottom: "10px" }}>
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        marginBottom: "4px",
                        color: "#374151",
                      }}
                    >
                      Risques clés :
                    </div>
                    <ul
                      style={{
                        paddingLeft: "18px",
                        margin: 0,
                        fontSize: "12px",
                        color: "#4b5563",
                      }}
                    >
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
                  <div>
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        marginBottom: "4px",
                        color: "#374151",
                      }}
                    >
                      Plan d&apos;action priorisé :
                    </div>
                    <ul
                      style={{
                        paddingLeft: "18px",
                        margin: 0,
                        fontSize: "12px",
                        color: "#4b5563",
                      }}
                    >
                      {aiResult.actionPlan.map(
                        (a: any, idx: number) => (
                          <li key={idx}>
                            <strong>[{a.priority}]</strong>{" "}
                            {a.title} — {a.description}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
