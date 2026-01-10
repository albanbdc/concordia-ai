// src/domain/concordia/scoring.ts

import type {
  AppliedObligation,
  EngineScore,
  EntityType,
  ObligationCategory,
  ScorePenalty,
  SystemStatus,
  UseCaseAudit,
} from "./types";

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function round(n: number) {
  return Math.round(n);
}

/**
 * Convertit une obligation en "poids acquis" (0..weight)
 * Logique Evidence Mode (nouveau) :
 * - fulfilled === true  => 100% du poids
 * - fulfilled === false => 0
 * - fulfilled === null :
 *      - evidence provided => 50%
 *      - evidence partial  => 25%
 *      - evidence missing  => 0
 */
function achievedWeightForObligation(o: AppliedObligation): { achieved: number; evidenceScore: number } {
  const w = o.weight ?? 0;

  if (o.fulfilled === true) return { achieved: w, evidenceScore: 100 };
  if (o.fulfilled === false) return { achieved: 0, evidenceScore: 0 };

  // not evaluated: rely on evidence if present
  const st = o.evidence?.status ?? "missing";
  if (st === "provided") return { achieved: w * 0.5, evidenceScore: 50 };
  if (st === "partial") return { achieved: w * 0.25, evidenceScore: 25 };

  return { achieved: 0, evidenceScore: 0 };
}

export function computeTraceableScore(params: {
  useCases: UseCaseAudit[];
  systemStatus: SystemStatus;
  entityType: EntityType;
  penalties?: ScorePenalty[];
}): EngineScore {
  const { useCases, penalties = [] } = params;

  let totalWeight = 0;
  let achievedWeight = 0;

  const categoryTotals: Partial<
    Record<
      ObligationCategory,
      {
        total: number;
        achieved: number;
      }
    >
  > = {};

  // On met à jour evidenceScore dans AppliedObligation (utile UI)
  for (const uc of useCases) {
    for (const o of uc.appliedObligations) {
      const w = o.weight ?? 0;
      totalWeight += w;

      const { achieved, evidenceScore } = achievedWeightForObligation(o);
      achievedWeight += achieved;

      // inject evidenceScore (side-effect OK: objet déjà construit)
      o.evidenceScore = evidenceScore;

      if (!categoryTotals[o.category]) categoryTotals[o.category] = { total: 0, achieved: 0 };
      categoryTotals[o.category]!.total += w;
      categoryTotals[o.category]!.achieved += achieved;
    }
  }

  // Base score
  const base = totalWeight > 0 ? (achievedWeight / totalWeight) * 100 : 0;

  // Penalties
  const penaltyPoints = penalties.reduce((acc, p) => acc + (p.points || 0), 0);

  const overallScore = clamp(round(base - penaltyPoints), 0, 100);

  // Score par catégorie
  const byCategory: Partial<Record<ObligationCategory, number>> = {};
  for (const [cat, tot] of Object.entries(categoryTotals) as any) {
    const t = tot.total || 0;
    const a = tot.achieved || 0;
    const pct = t > 0 ? (a / t) * 100 : 0;
    byCategory[cat as ObligationCategory] = clamp(round(pct), 0, 100);
  }

  return {
    overallScore,
    byCategory,
    details: {
      totalWeight,
      achievedWeight,
      categoryTotals,
      penalties,
    },
  };
}
