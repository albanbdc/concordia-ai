// src/domain/concordia/types.ts

// =========================
// Core enums / types
// =========================

export type Sector =
  | "employment"
  | "hr"
  | "education"
  | "health"
  | "finance"
  | "justice"
  | "law-enforcement"
  | "migration"
  | "critical-infra"
  | "services"
  | "public"
  | "generic";

export type Role = "provider" | "deployer";
export type EntityType = Role;

export type RiskLevel = "UNACCEPTABLE" | "HIGH" | "LIMITED" | "MINIMAL";

export type SystemStatus =
  | "normal"
  | "high-risk"
  | "prohibited"
  | "gpai"
  | "gpai-systemic"
  | "excluded"
  | "out-of-scope";

export type RiskTier = "LOW" | "MEDIUM" | "HIGH" | "PROHIBITED";

// 🔹 Catégories d’obligations — alignées IA Act
export type ObligationCategory =
  | "risk-management"        // Art. 9
  | "data-governance"        // Art. 10
  | "documentation"          // Art. 11–12
  | "transparency"           // Art. 13
  | "human-oversight"        // Art. 14
  | "robustness-security"    // Art. 15
  | "post-market"            // Art. 61–62
  | "role-obligations";      // Art. 16–29


// Références juridiques (simple et extensible)
export type LegalReference = `AIAct:${string}`;

// =========================
// Evidence / proof mode
// =========================

export type EvidenceStatus = "missing" | "partial" | "provided";

/**
 * Une preuve (ou un paquet de preuves) fournie par l’utilisateur
 * - "provided" : on a quelque chose de solide
 * - "partial"  : on a quelque chose mais incomplet
 * - "missing"  : rien / non fourni
 */
export interface Evidence {
  status: EvidenceStatus;
  note?: string;
  attachments?: string[]; // ex: liens / noms de fichiers (plus tard)
}

/**
 * Profil de preuve "attendu" pour une obligation (ce qu'on demande comme auditeur).
 * C’est du premium : ça rend Concordia actionnable.
 */
export interface EvidenceRequirement {
  id: string;
  label: string;
  examples?: string[];
  weight?: number; // pondération interne (optionnel)
}

// =========================
// Input models
// =========================

export interface AiUseCase {
  id: string;
  name: string;
  sector: Sector;

  // Flags généraux
  affectsRights: boolean;
  safetyCritical: boolean;
  vulnerableGroups: boolean;
  biometric: boolean;

  users: string[];
  countries: string[];

  // ARTICLE 5 : systèmes interdits
  usesSubliminalTechniques?: boolean;
  exploitsVulnerabilities?: boolean;
  socialScoring?: boolean;
  predictivePolicing?: boolean;
  realTimeBiometricIdentification?: boolean;

  // OUT OF SCOPE / EXEMPTIONS
  isResearchOnly?: boolean;
  isMilitaryUse?: boolean;
  isPersonalUseOnly?: boolean;

  // Transparence (article 50)
  usesChatbot?: boolean;
  usesEmotionRecognition?: boolean;
  isDeepfake?: boolean;

  // ANNEXE III : secteurs à haut risque
  isLawEnforcementUseCase?: boolean;
  isJusticeUseCase?: boolean;
  isMigrationUseCase?: boolean;
  isCriticalInfrastructure?: boolean;
  isEducationUseCase?: boolean;
  isEmploymentUseCase?: boolean;
  isAccessToEssentialServices?: boolean;
}

export interface AiSystem {
  id: string;
  name: string;
  role: Role;
  entityType?: EntityType;

  isGPAI?: boolean;
  isGPAISystemicRisk?: boolean;

  isResearchOnlySystem?: boolean;
  isMilitarySystem?: boolean;
  isPersonalUseOnlySystem?: boolean;

  useCases: AiUseCase[];
}

// =========================
// Obligation matrix models
// =========================

export interface Obligation {
  id: string;
  label: string;
  description: string;
  category: ObligationCategory;
  weight: number;

  references?: LegalReference[];

  // 💎 Evidence mode (ce qu'on attend comme "preuves")
  evidenceRequired?: EvidenceRequirement[];

  appliesTo: {
    riskLevels?: RiskLevel[];
    roles?: Role[];
    entityTypes?: EntityType[];
    sectors?: Sector[];
    systemStatuses?: SystemStatus[];
    gpaI?: boolean;
  };
}

export type EstimatedCompliance = "likely" | "uncertain" | "unlikely";

export interface AppliedObligation {
  obligationId: string;
  label: string;
  category: ObligationCategory;
  weight: number;

  // mapping juridique
  references?: LegalReference[];

  // rempli / non rempli / pas encore évalué
  fulfilled: boolean | null;

  // Estimation automatique du moteur (optionnelle)
  estimatedCompliance?: EstimatedCompliance;
  complianceReason?: string;

  // 💎 Evidence / proof mode (nouveau)
  evidenceRequired?: EvidenceRequirement[];
  evidence?: Evidence; // ce que l'utilisateur fournit (ou "missing")
  evidenceScore?: number; // 0..100 calculé par le moteur
}

// =========================
// Audit result models
// =========================

export interface UseCaseAudit {
  useCaseId: string;
  useCaseName: string;

  riskLevel: RiskLevel;
  riskReasons: string[];

  // Criticité IA Act (score 0–100)
  criticalityScore: number;
  criticalityLevel: "low" | "medium" | "high" | "critical";
  criticalityReasons: string[];

  appliedObligations: AppliedObligation[];
}

// =========================
// Findings & recommendations
// =========================

export type FindingScope = "system" | "usecase";
export type FindingSeverity = "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface FindingEvidenceItem {
  key: string;
  value: any;
  note?: string;
}

export interface Finding {
  id: string;
  scope: FindingScope;
  useCaseId?: string;

  severity: FindingSeverity;
  title: string;
  description: string;

  evidence: FindingEvidenceItem[];

  references?: LegalReference[];
  obligationIds?: string[];
  tags?: string[];
}

export type RecommendationEffort = "S" | "M" | "L";
export type RecommendationImpact = "LOW" | "MEDIUM" | "HIGH";

export interface Recommendation {
  id: string;
  findingId: string;

  priority: 1 | 2 | 3 | 4;
  title: string;
  steps: string[];

  effort: RecommendationEffort;
  impact: RecommendationImpact;

  references?: LegalReference[];
}

// =========================
// Score
// =========================

export interface ScorePenalty {
  reason: string;
  points: number;
  relatedFindingId?: string;
  relatedObligationId?: string;
}

export interface ScoreDetails {
  totalWeight: number;
  achievedWeight: number;

  categoryTotals: Partial<
    Record<
      ObligationCategory,
      {
        total: number;
        achieved: number;
      }
    >
  >;

  penalties: ScorePenalty[];
}

export interface EngineScore {
  overallScore: number; // 0..100
  byCategory: Partial<Record<ObligationCategory, number>>; // 0..100
  details: ScoreDetails;
}

export interface EngineResult {
  systemId: string;
  systemName: string;
  engineVersion: string;

  entityType: EntityType;
  systemStatus: SystemStatus;
  riskTier: RiskTier;

  statusReason: string;
  systemRiskReasons: string[];

  // ✅ NOUVEAU — Opposabilité moteur
  legalBasis: string[]; // ex: ["AIAct:Art5", "AIAct:AnnexIII", "AIAct:Art50"]
  qualificationPath: string[]; // arbre décisionnel suivi
  justification: string; // résumé juridique consolidé
  engineDecisionLog: string[]; // log complet des étapes moteur

  useCases: UseCaseAudit[];

  findings: Finding[];
  recommendations: Recommendation[];

  score: EngineScore;

  meta: {
    generatedAt: string;
  };
}