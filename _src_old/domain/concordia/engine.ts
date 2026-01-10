// src/domain/concordia/engine.ts
// Concordia Engine — Scoring aligned with IA Act blocks (Step 3)
// Goal: 0 = nothing compliant, 100 = fully compliant (for applicable obligations)

import type {
  AiSystem,
  AiUseCase,
  Obligation,
  AppliedObligation,
  UseCaseAudit,
  RiskLevel,
  SystemStatus,
  ObligationCategory,
  Role,
} from "./types";
import { BASE_OBLIGATIONS } from "./obligations";

type Fulfillments = Record<string, boolean | undefined>;

export function runEngine(
  system: AiSystem,
  obligations: Obligation[] = BASE_OBLIGATIONS,
  fulfillments?: Fulfillments,
  // param kept for forward compatibility; UI can ignore it.
  _evidenceMap?: any
): any {
  const generatedAt = new Date().toISOString();

  const systemStatusEval = evaluateSystemStatus(system);
  const systemStatus = systemStatusEval.status;
  const statusReason = systemStatusEval.reason;
  const systemRiskReasons = systemStatusEval.reasons;

  // Build use case audits
  const useCases: UseCaseAudit[] = (system.useCases || []).map((uc) =>
    auditUseCase(system, uc, systemStatus, obligations, fulfillments)
  );

  // Score = compliance maturity over applicable obligations (dedup by obligationId)
  const score = computeComplianceScore(useCases, fulfillments);

  // Risk tier: separate from compliance score (simple + stable)
  const riskTier = computeRiskTier(systemStatus, score.overallScore);

  const result: any = {
    systemId: system.id,
    systemName: system.name,
    engineVersion: "4.0.0",
    entityType: system.entityType ?? system.role,
    systemStatus,
    riskTier,
    statusReason,
    systemRiskReasons,
    useCases,
    score,
    meta: {
      generatedAt,
    },
  };

  return result;
}

/* -----------------------------
   System status (IA Act framing)
-------------------------------- */

function evaluateSystemStatus(system: AiSystem): {
  status: SystemStatus;
  reason: string;
  reasons: string[];
} {
  // out-of-scope / exclusions
  if (system.isPersonalUseOnlySystem) {
    return {
      status: "out-of-scope",
      reason: "Usage personnel uniquement (hors périmètre).",
      reasons: ["Usage personnel uniquement (hors périmètre)."],
    };
  }
  if (system.isMilitarySystem) {
    return {
      status: "excluded",
      reason: "Usage militaire (exclu / hors périmètre selon contexte).",
      reasons: ["Usage militaire (exclu / hors périmètre selon contexte)."],
    };
  }
  if (system.isResearchOnlySystem) {
    return {
      status: "excluded",
      reason: "Système utilisé uniquement à des fins de recherche (exemption / cas particulier).",
      reasons: ["Usage recherche uniquement (exemption / cas particulier)."],
    };
  }

  // GPAI
  if (system.isGPAISystemicRisk) {
    return {
      status: "gpai-systemic",
      reason: "Le système est qualifié comme GPAI à risque systémique.",
      reasons: ["Le système est qualifié comme GPAI à risque systémique."],
    };
  }
  if (system.isGPAI) {
    return {
      status: "gpai",
      reason: "Le système est qualifié comme GPAI.",
      reasons: ["Le système est qualifié comme GPAI."],
    };
  }

  // prohibited (Art. 5) if ANY use case triggers
  const prohibitedReasons: string[] = [];
  for (const uc of system.useCases || []) {
    const r = prohibitedFlags(uc);
    prohibitedReasons.push(...r);
  }
  if (prohibitedReasons.length > 0) {
    return {
      status: "prohibited",
      reason: "Le système inclut au moins une pratique interdite (Article 5).",
      reasons: Array.from(
        new Set(["Pratique(s) interdite(s) détectée(s) (Article 5).", ...prohibitedReasons])
      ),
    };
  }

  // high-risk if ANY use case is Annex III-like
  const highRiskReasons: string[] = [];
  for (const uc of system.useCases || []) {
    const r = highRiskFlags(uc);
    if (r.length > 0) highRiskReasons.push(...r);
  }

  if (highRiskReasons.length > 0) {
    return {
      status: "high-risk",
      reason: "Le système opère dans au moins un domaine listé comme haut risque (Annexe III).",
      reasons: Array.from(
        new Set([
          "Le système opère dans au moins un domaine listé comme haut risque (Annexe III).",
          ...highRiskReasons,
        ])
      ),
    };
  }

  return {
    status: "normal",
    reason: "Aucun critère high-risk ou interdit détecté sur les cas d’usage fournis.",
    reasons: ["Aucun critère high-risk ou interdit détecté sur les cas d’usage fournis."],
  };
}

function prohibitedFlags(uc: AiUseCase): string[] {
  const reasons: string[] = [];
  if (uc.usesSubliminalTechniques) reasons.push("Usage de techniques subliminales (Art. 5).");
  if (uc.exploitsVulnerabilities) reasons.push("Exploitation de vulnérabilités (Art. 5).");
  if (uc.socialScoring) reasons.push("Social scoring (Art. 5).");
  if (uc.predictivePolicing) reasons.push("Policing prédictif (Art. 5).");
  if (uc.realTimeBiometricIdentification) reasons.push("Identification biométrique en temps réel (Art. 5).");
  return reasons;
}

function highRiskFlags(uc: AiUseCase): string[] {
  const reasons: string[] = [];
  // Annex III flags (your boolean fields)
  if (uc.isEmploymentUseCase || uc.sector === "employment" || uc.sector === "hr")
    reasons.push("Cas d’usage relevant de l’emploi (Annexe III).");
  if (uc.isEducationUseCase || uc.sector === "education")
    reasons.push("Cas d’usage relevant de l’éducation (Annexe III).");
  if (uc.isJusticeUseCase || uc.sector === "justice") reasons.push("Cas d’usage relevant de la justice (Annexe III).");
  if (uc.isLawEnforcementUseCase || uc.sector === "law-enforcement")
    reasons.push("Cas d’usage relevant des forces de l’ordre (Annexe III).");
  if (uc.isMigrationUseCase || uc.sector === "migration") reasons.push("Cas d’usage relevant de la migration (Annexe III).");
  if (uc.isCriticalInfrastructure || uc.sector === "critical-infra")
    reasons.push("Cas d’usage relevant d’infrastructures critiques (Annexe III).");
  if (uc.isAccessToEssentialServices || uc.sector === "services")
    reasons.push("Cas d’usage lié à l’accès à des services essentiels (Annexe III).");
  if (uc.sector === "health") reasons.push("Cas d’usage en santé (risque élevé probable).");
  if (uc.sector === "finance") reasons.push("Cas d’usage en finance (risque élevé probable).");
  return reasons;
}

/* -----------------------------
   Use case audit
-------------------------------- */

function auditUseCase(
  system: AiSystem,
  uc: AiUseCase,
  systemStatus: SystemStatus,
  obligations: Obligation[],
  fulfillments?: Fulfillments
): UseCaseAudit {
  const { riskLevel, riskReasons } = evaluateUseCaseRisk(uc, systemStatus);

  const { criticalityScore, criticalityLevel, criticalityReasons } = evaluateCriticality(uc);

  const appliedObligations = applyObligations(system, uc, systemStatus, obligations, fulfillments);

  return {
    useCaseId: uc.id,
    useCaseName: uc.name,
    riskLevel,
    riskReasons,
    criticalityScore,
    criticalityLevel,
    criticalityReasons,
    appliedObligations,
  };
}

function evaluateUseCaseRisk(uc: AiUseCase, systemStatus: SystemStatus): { riskLevel: RiskLevel; riskReasons: string[] } {
  const reasons: string[] = [];

  // prohibited overrides
  const prohib = prohibitedFlags(uc);
  if (prohib.length > 0 || systemStatus === "prohibited") {
    return {
      riskLevel: "high",
      riskReasons: Array.from(new Set(["Pratique interdite détectée (Article 5).", ...prohib])),
    };
  }

  const high = highRiskFlags(uc);
  if (high.length > 0 || systemStatus === "high-risk") {
    reasons.push("Le cas d’usage relève d’un domaine listé comme haut risque dans l’Annexe III de l’IA Act.");
    if (uc.affectsRights) reasons.push("Le cas d’usage peut affecter directement les droits fondamentaux des personnes concernées.");
    if (uc.vulnerableGroups) reasons.push("Le cas d’usage implique des groupes vulnérables, ce qui renforce le niveau de risque.");
    if (uc.biometric) reasons.push("Le cas d’usage implique des éléments biométriques, facteur aggravant.");
    return { riskLevel: "high", riskReasons: Array.from(new Set([...high, ...reasons])) };
  }

  // limited vs minimal (simple heuristic)
  if (uc.affectsRights || uc.vulnerableGroups || uc.biometric) {
    return {
      riskLevel: "limited",
      riskReasons: [
        "Le cas d’usage présente des facteurs de risque (droits / vulnérabilités / biométrie), sans critère high-risk explicitement activé.",
      ],
    };
  }

  return { riskLevel: "minimal", riskReasons: ["Aucun facteur de risque majeur identifié à partir des champs fournis."] };
}

function evaluateCriticality(uc: AiUseCase): {
  criticalityScore: number;
  criticalityLevel: "low" | "medium" | "high" | "critical";
  criticalityReasons: string[];
} {
  let score = 0;
  const reasons: string[] = [];

  const annex = highRiskFlags(uc);
  if (annex.length > 0) {
    score += 45;
    reasons.push(...annex);
  }

  if (uc.affectsRights) {
    score += 15;
    reasons.push("Impact possible sur les droits fondamentaux.");
  }
  if (uc.vulnerableGroups) {
    score += 15;
    reasons.push("Groupes vulnérables impliqués.");
  }
  if (uc.biometric) {
    score += 15;
    reasons.push("Éléments biométriques impliqués.");
  }
  if (uc.safetyCritical) {
    score += 10;
    reasons.push("Contexte critique pour la sécurité.");
  }

  score = Math.max(0, Math.min(100, score));

  let level: "low" | "medium" | "high" | "critical" = "low";
  if (score >= 75) level = "critical";
  else if (score >= 55) level = "high";
  else if (score >= 30) level = "medium";

  if (reasons.length === 0) reasons.push("Aucun facteur de criticité majeur détecté.");

  return {
    criticalityScore: score,
    criticalityLevel: level,
    criticalityReasons: Array.from(new Set(reasons)),
  };
}

function applyObligations(
  system: AiSystem,
  uc: AiUseCase,
  systemStatus: SystemStatus,
  obligations: Obligation[],
  fulfillments?: Fulfillments
): AppliedObligation[] {
  const role: Role = system.role;

  const applicable = obligations.filter((o) => {
    const a = o.appliesTo || {};

    if (a.systemStatuses && !a.systemStatuses.includes(systemStatus)) return false;
    if (a.roles && !a.roles.includes(role)) return false;

    if (a.sectors && !a.sectors.includes(uc.sector)) return false;
    if (a.entityTypes && system.entityType && !a.entityTypes.includes(system.entityType)) return false;

    return true;
  });

  return applicable.map((o) => {
    const fulfilledVal = fulfillments?.[o.id];
    const fulfilled: boolean | null = typeof fulfilledVal === "boolean" ? fulfilledVal : null;

    return {
      obligationId: o.id,
      label: o.label,
      category: o.category,
      weight: o.weight,
      fulfilled,
      estimatedCompliance: estimateCompliance(systemStatus, fulfilled),
      complianceReason: estimateReason(systemStatus, fulfilled),
    };
  });
}

function estimateCompliance(systemStatus: SystemStatus, fulfilled: boolean | null): "likely" | "uncertain" | "unlikely" {
  if (fulfilled === true) return "likely";
  if (systemStatus === "high-risk") return "unlikely";
  return "uncertain";
}

function estimateReason(systemStatus: SystemStatus, fulfilled: boolean | null): string {
  if (fulfilled === true) return "Mesure déclarée en place pour cette obligation.";
  if (systemStatus === "high-risk") {
    return "Système à haut risque : en l’absence de mesure déclarée, la conformité est peu probable sur cette obligation.";
  }
  return "Mesure non renseignée : conformité incertaine sur cette obligation.";
}

/* -----------------------------
   Scoring (Step 3)
-------------------------------- */

function computeComplianceScore(useCases: UseCaseAudit[], fulfillments?: Fulfillments): any {
  // Dedupe obligations by id at system level
  const unique: Record<string, { category: ObligationCategory; weight: number }> = {};

  for (const uc of useCases || []) {
    for (const o of uc.appliedObligations || []) {
      if (!unique[o.obligationId]) {
        unique[o.obligationId] = { category: o.category, weight: o.weight };
      } else {
        unique[o.obligationId].weight = Math.max(unique[o.obligationId].weight, o.weight);
      }
    }
  }

  const ids = Object.keys(unique);
  const totalWeight = ids.reduce((sum, id) => sum + (unique[id]?.weight ?? 0), 0);

  const achievedWeight = ids.reduce((sum, id) => {
    const ok = typeof fulfillments?.[id] === "boolean" ? !!fulfillments?.[id] : false;
    return sum + (ok ? unique[id].weight : 0);
  }, 0);

  const overallScore = totalWeight > 0 ? Math.round((achievedWeight / totalWeight) * 100) : 0;

  // By category
  const categoryTotals: Record<string, { total: number; achieved: number }> = {};

  for (const id of ids) {
    const cat = unique[id].category;
    if (!categoryTotals[cat]) categoryTotals[cat] = { total: 0, achieved: 0 };
    categoryTotals[cat].total += unique[id].weight;

    const ok = typeof fulfillments?.[id] === "boolean" ? !!fulfillments?.[id] : false;
    if (ok) categoryTotals[cat].achieved += unique[id].weight;
  }

  const byCategory: Record<string, number> = {};
  for (const [cat, t] of Object.entries(categoryTotals)) {
    byCategory[cat] = t.total > 0 ? Math.round((t.achieved / t.total) * 100) : 0;
  }

  return {
    overallScore,
    byCategory,
    details: {
      totalWeight,
      achievedWeight,
      categoryTotals,
      penalties: [], // no hidden malus: 100 = fully compliant on applicable obligations
    },
  };
}

function computeRiskTier(systemStatus: SystemStatus, complianceScore: number): "LOW" | "MEDIUM" | "HIGH" | "EXTREME" {
  if (systemStatus === "prohibited") return "EXTREME";
  if (systemStatus === "high-risk") {
    if (complianceScore >= 70) return "LOW";
    if (complianceScore >= 40) return "MEDIUM";
    return "HIGH";
  }
  if (systemStatus === "gpai-systemic") return "HIGH";
  if (systemStatus === "gpai") return "MEDIUM";
  return "LOW";
}
