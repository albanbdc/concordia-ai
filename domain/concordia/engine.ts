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
    const qualificationPath: string[] = [];
  const engineDecisionLog: string[] = [];
  const legalBasis: string[] = [];

  engineDecisionLog.push("ENGINE START v4.0.0");
  engineDecisionLog.push(`System analysed: ${system.name}`);
  engineDecisionLog.push(`SystemStatus detected: ${systemStatusEval.status}`);
  const systemStatus = systemStatusEval.status;
  const statusReason = systemStatusEval.reason;
  const systemRiskReasons = systemStatusEval.reasons;
  

  // Build use case audits
  const useCases: UseCaseAudit[] = (system.useCases || []).map((uc) =>
    auditUseCase(system, uc, systemStatus, obligations, fulfillments)
  );
  for (const uc of useCases) {
    qualificationPath.push(
      `UseCase "${uc.useCaseName}" → RiskLevel = ${uc.riskLevel}`
    );

    if (uc.riskLevel === "UNACCEPTABLE") {
      legalBasis.push("AIAct:Art5");
      engineDecisionLog.push(
        `Art.5 triggered on ${uc.useCaseName}`
      );
    }

    if (uc.riskLevel === "HIGH") {
      legalBasis.push("AIAct:AnnexIII");
      engineDecisionLog.push(
        `Annex III triggered on ${uc.useCaseName}`
      );
    }

    if (uc.riskLevel === "LIMITED") {
      legalBasis.push("AIAct:Art50");
      engineDecisionLog.push(
        `Transparency obligations (Art.50) triggered on ${uc.useCaseName}`
      );
    }
  }
  // Score = compliance maturity over applicable obligations (dedup by obligationId)
  const score = computeComplianceScore(useCases, fulfillments);

  // Risk tier: separate from compliance score (simple + stable)
  const riskTier = computeRiskTier(systemStatus, score.overallScore);
  const uniqueLegal = Array.from(new Set(legalBasis));

let justification: string;

if (uniqueLegal.includes("AIAct:Art5")) {
  justification =
    "Qualification UNACCEPTABLE fondée sur l’Article 5 de l’AI Act : pratique interdite détectée.";
} 
else if (uniqueLegal.includes("AIAct:AnnexIII")) {
  justification =
    "Qualification HIGH RISK fondée sur l’Annexe III de l’AI Act : le système opère dans un domaine explicitement listé comme à haut risque.";
} 
else if (uniqueLegal.includes("AIAct:Art50")) {
  justification =
    "Qualification LIMITED fondée sur l’Article 50 de l’AI Act : obligations de transparence applicables.";
} 
else {
  justification =
    "Qualification MINIMAL : aucun critère Article 5, Annexe III ou Article 50 activé sur la base des informations fournies.";
}
  const result: any = {
    systemId: system.id,
    systemName: system.name,
    engineVersion: "4.0.0",
    entityType: system.entityType ?? system.role,
    systemStatus,
    riskTier,
    statusReason,
    systemRiskReasons,
        legalBasis: Array.from(new Set(legalBasis)),
    qualificationPath,
    justification,
    engineDecisionLog,
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

  // STRICT ANNEX III LOGIC
  if (uc.isEmploymentUseCase)
    reasons.push("Système relevant de l’emploi (Annexe III AI Act).");

  if (uc.isEducationUseCase)
    reasons.push("Système relevant de l’éducation (Annexe III AI Act).");

  if (uc.isJusticeUseCase)
    reasons.push("Système relevant de la justice (Annexe III AI Act).");

  if (uc.isLawEnforcementUseCase)
    reasons.push("Système relevant des forces de l’ordre (Annexe III AI Act).");

  if (uc.isMigrationUseCase)
    reasons.push("Système relevant de la migration / frontières (Annexe III AI Act).");

  if (uc.isCriticalInfrastructure)
    reasons.push("Système relevant d’infrastructures critiques (Annexe III AI Act).");

  if (uc.isAccessToEssentialServices)
    reasons.push("Système lié à l’accès à des services essentiels (Annexe III AI Act).");

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

  const appliedObligations = applyObligations(
  system,
  uc,
  systemStatus,
  riskLevel,
  obligations,
  fulfillments
);

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

function evaluateUseCaseRisk(
  uc: AiUseCase,
  systemStatus: SystemStatus
): { riskLevel: RiskLevel; riskReasons: string[] } {

  // 1️⃣ UNACCEPTABLE (Article 5)
  const prohib = prohibitedFlags(uc);
  if (prohib.length > 0 || systemStatus === "prohibited") {
    return {
      riskLevel: "UNACCEPTABLE",
      riskReasons: Array.from(
        new Set([
          "Le cas d’usage relève d’une pratique interdite (Article 5 AI Act).",
          ...prohib,
        ])
      ),
    };
  }

  // 2️⃣ HIGH (Annexe III strict)
  const high = highRiskFlags(uc);
  if (high.length > 0 || systemStatus === "high-risk") {
    return {
      riskLevel: "HIGH",
      riskReasons: Array.from(new Set(high)),
    };
  }

  // 3️⃣ LIMITED (Article 50 – transparence)
  if (uc.usesChatbot || uc.usesEmotionRecognition || uc.isDeepfake) {
    return {
      riskLevel: "LIMITED",
      riskReasons: [
        "Système soumis à des obligations de transparence (Article 50 AI Act).",
      ],
    };
  }

  // 4️⃣ MINIMAL
  return {
    riskLevel: "MINIMAL",
    riskReasons: [
      "Aucun critère Article 5, Annexe III ou Article 50 détecté.",
    ],
  };
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
  ucRiskLevel: RiskLevel,
  obligations: Obligation[],
  fulfillments?: Fulfillments
): AppliedObligation[] {

  const role: Role = system.role;

  // 🔴 UNACCEPTABLE → aucune obligation
  if (ucRiskLevel === "UNACCEPTABLE") {
    return [];
  }

  // 🟢 MINIMAL → aucune obligation IA Act
  if (ucRiskLevel === "MINIMAL") {
    return [];
  }

  // 🟡 LIMITED → uniquement transparence (Article 50)
  if (ucRiskLevel === "LIMITED") {
    const transparencyOnly = obligations.filter(
      (o) => o.category === "transparency"
    );

    return transparencyOnly.map((o) => {
      const fulfilledVal = fulfillments?.[o.id];
      const fulfilled =
        typeof fulfilledVal === "boolean" ? fulfilledVal : null;

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

  // 🟠 HIGH → toutes obligations (core + advanced + role selon rôle)
  if (ucRiskLevel === "HIGH") {

    const applicable = obligations.filter((o) => {

      // Si obligation de rôle → vérifier rôle
      if (o.category === "role-obligations") {
        if (o.appliesTo?.roles && !o.appliesTo.roles.includes(role)) {
          return false;
        }
      }

      return true;
    });

    return applicable.map((o) => {
      const fulfilledVal = fulfillments?.[o.id];
      const fulfilled =
        typeof fulfilledVal === "boolean" ? fulfilledVal : null;

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

  return [];
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

function computeRiskTier(
  systemStatus: SystemStatus,
  complianceScore: number
): "LOW" | "MEDIUM" | "HIGH" | "EXTREME" {

  if (systemStatus === "prohibited") {
    return "EXTREME";
  }

  if (systemStatus === "high-risk") {
    if (complianceScore >= 80) return "LOW";
    if (complianceScore >= 50) return "MEDIUM";
    return "HIGH";
  }

  if (systemStatus === "gpai-systemic") {
    return "HIGH";
  }

  if (systemStatus === "gpai") {
    return "MEDIUM";
  }

  return "LOW";
}