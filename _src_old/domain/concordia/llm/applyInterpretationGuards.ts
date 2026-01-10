// src/domain/concordia/llm/applyInterpretationGuards.ts

import type { LlmInterpretation } from "./types";

function ensureMeta(result: any) {
  result.meta =
    typeof result.meta === "object" && result.meta !== null ? result.meta : {};
}

function bumpUseCasesToProhibited(result: any) {
  const useCases = Array.isArray(result?.useCases) ? result.useCases : [];
  for (const uc of useCases) {
    if (!uc || typeof uc !== "object") continue;

    // risque / statut
    uc.riskLevel = "prohibited";

    // criticité => on force "critical" (c’est ce que tu veux voir)
    uc.criticalityLevel = "critical";
    if (typeof uc.criticalityScore !== "number" || uc.criticalityScore < 90) {
      uc.criticalityScore = 95;
    }

    // raisons
    uc.riskReasons = Array.isArray(uc.riskReasons) ? uc.riskReasons : [];
    if (!uc.riskReasons.includes("Signal LLM : cas interdit (prohibited).")) {
      uc.riskReasons.unshift("Signal LLM : cas interdit (prohibited).");
    }

    uc.criticalityReasons = Array.isArray(uc.criticalityReasons)
      ? uc.criticalityReasons
      : [];
    if (
      !uc.criticalityReasons.includes(
        "Cas interdit : impact majeur sur droits fondamentaux."
      )
    ) {
      uc.criticalityReasons.unshift(
        "Cas interdit : impact majeur sur droits fondamentaux."
      );
    }
  }
}

function bumpUseCasesToHigh(result: any) {
  const useCases = Array.isArray(result?.useCases) ? result.useCases : [];
  for (const uc of useCases) {
    if (!uc || typeof uc !== "object") continue;

    // si c’était low, on remonte au moins à high
    if (typeof uc.riskLevel === "string" && uc.riskLevel.toLowerCase() === "low") {
      uc.riskLevel = "high";
    }

    // criticité min pour éviter les faux “moyens”
    if (typeof uc.criticalityScore !== "number" || uc.criticalityScore < 70) {
      uc.criticalityScore = 75;
    }
    if (typeof uc.criticalityLevel === "string" && uc.criticalityLevel.toLowerCase() === "medium") {
      uc.criticalityLevel = "high";
    }
  }
}

export function applyInterpretationGuards(result: any, flags: LlmInterpretation) {
  if (!result || typeof result !== "object") {
    return { result, patched: false };
  }

  ensureMeta(result);
  result.meta.llmInterpretation = flags;

  let patched = false;

  // 1) PROHIBITED => on force système + useCases + criticité
  if (flags.prohibitedSignal) {
    // système
    result.systemStatus = "prohibited";
    result.riskTier = "PROHIBITED";
    result.statusReason =
      result.statusReason ||
      "Signal LLM : cas probablement interdit (prohibited) — traitement renforcé.";

    // use cases
    bumpUseCasesToProhibited(result);

    patched = true;
    return { result, patched };
  }

  // 2) HIGH RISK => jamais LOW
  if (flags.highRiskSignal) {
    if (typeof result.systemStatus === "string" && result.systemStatus.toLowerCase() === "low") {
      result.systemStatus = "high-risk";
      patched = true;
    }
    if (typeof result.riskTier === "string" && result.riskTier.toUpperCase() === "LOW") {
      result.riskTier = "HIGH";
      patched = true;
    }

    bumpUseCasesToHigh(result);
    patched = true;
  }

  return { result, patched };
}
