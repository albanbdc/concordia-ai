// src/domain/concordia/compliance/generateActions.ts

import { getActionTemplate } from "./actionTemplates";
import type { ActionPriority } from "./actionTemplates";

export type ComplianceActionStatus = "TODO" | "IN_PROGRESS" | "DONE";

export type ComplianceAction = {
  id: string;
  obligationId: string;

  title: string;
  description: string;

  priority: ActionPriority;
  owner: "CLIENT" | "CABINET";
  status: ComplianceActionStatus;

  // traçabilité
  source: "ENGINE";
};

/**
 * Génère un plan d’actions à partir des obligations non conformes
 *
 * @param appliedObligations - result.useCases[0].appliedObligations
 * @param systemRiskTier - ex: "HIGH", "LOW"
 */
export function generateComplianceActions(params: {
  appliedObligations: any[];
  systemRiskTier?: string;
}): ComplianceAction[] {
  const { appliedObligations, systemRiskTier } = params;

  if (!Array.isArray(appliedObligations)) return [];

  const actions: ComplianceAction[] = [];

  for (const ob of appliedObligations) {
    if (!ob || ob.fulfilled !== false || !ob.obligationId) continue;

    const template = getActionTemplate(ob.obligationId);
    if (!template) continue;

    let priority: ActionPriority = template.defaultPriority;

    // Boost priorité si système high-risk
    if (systemRiskTier && systemRiskTier.toUpperCase() === "HIGH") {
      if (priority === "MEDIUM") priority = "HIGH";
    }

    actions.push({
      id: `act_${ob.obligationId}_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 6)}`,
      obligationId: ob.obligationId,
      title: template.title,
      description: template.description,
      priority,
      owner: template.owner,
      status: "TODO",
      source: "ENGINE",
    });
  }

  return actions;
}
