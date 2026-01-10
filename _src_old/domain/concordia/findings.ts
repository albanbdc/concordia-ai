// src/domain/concordia/findings.ts

import type {
  AiSystem,
  Finding,
  SystemStatus,
  UseCaseAudit,
  ObligationCategory,
  LegalReference,
} from "./types";

type Severity = "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

function makeId(
  prefix: string,
  parts: Array<string | number | undefined | null>
) {
  const safe = parts
    .filter((p) => p !== undefined && p !== null)
    .map((p) => String(p).trim().toLowerCase().replace(/\s+/g, "-"))
    .join(":");
  return `${prefix}:${safe}`;
}

function severityFromCategory(
  cat: ObligationCategory,
  systemStatus: SystemStatus
): Severity {
  if (systemStatus === "prohibited") return "CRITICAL";

  if (systemStatus === "high-risk") {
    if (cat === "risk-management") return "CRITICAL";
    if (cat === "data-governance") return "CRITICAL";

    if (cat === "documentation") return "HIGH";
    if (cat === "robustness-security") return "HIGH";

    if (cat === "transparency") return "MEDIUM";
    if (cat === "post-market") return "MEDIUM";

    return "MEDIUM";
  }

  if (systemStatus === "gpai" || systemStatus === "gpai-systemic") {
    if (cat === "documentation" || cat === "transparency") return "HIGH";
    return "MEDIUM";
  }

  return "LOW";
}

function uniqRefs(
  refs: Array<LegalReference | undefined> = []
): LegalReference[] {
  const out: LegalReference[] = [];
  const seen = new Set<string>();
  for (const r of refs) {
    if (!r) continue;
    if (seen.has(r)) continue;
    seen.add(r);
    out.push(r);
  }
  return out;
}

function buildObligationRefIndex(useCases: UseCaseAudit[]) {
  const map = new Map<string, LegalReference[]>();
  for (const uc of useCases) {
    for (const o of uc.appliedObligations) {
      if (!o.references || o.references.length === 0) continue;
      if (!map.has(o.obligationId)) {
        map.set(o.obligationId, uniqRefs(o.references));
      } else {
        const current = map.get(o.obligationId) ?? [];
        map.set(o.obligationId, uniqRefs([...current, ...o.references]));
      }
    }
  }
  return map;
}

export function buildFindings(params: {
  system: AiSystem;
  systemStatus: SystemStatus;
  statusReason: string;
  useCases: UseCaseAudit[];
}): Finding[] {
  const { system, systemStatus, statusReason, useCases } = params;

  const findings: Finding[] = [];
  const obligationRefs = buildObligationRefIndex(useCases);

  // 1) Findings globaux système
  if (systemStatus === "prohibited") {
    findings.push({
      id: makeId("finding", ["system", system.id, "prohibited"]),
      scope: "system",
      severity: "CRITICAL",
      title: "Système classé comme prohibé (IA Act)",
      description:
        "Le système est classé comme prohibé au sens de l’IA Act. La mise en conformité n’est pas pertinente tant que le cas d’usage n’est pas abandonné ou profondément remanié.",
      evidence: [{ key: "systemStatus", value: systemStatus, note: statusReason }],
      references: ["AIAct:Art5"],
      tags: ["status", "prohibited"],
    });
  } else if (systemStatus === "high-risk") {
    findings.push({
      id: makeId("finding", ["system", system.id, "high-risk"]),
      scope: "system",
      severity: "HIGH",
      title: "Système classé à haut risque (IA Act)",
      description:
        "Le système entre dans le périmètre des systèmes à haut risque et doit satisfaire des exigences renforcées.",
      evidence: [{ key: "systemStatus", value: systemStatus, note: statusReason }],
      references: ["AIAct:AnnexIII"],
      tags: ["status", "high-risk"],
    });
  } else if (systemStatus === "gpai" || systemStatus === "gpai-systemic") {
    findings.push({
      id: makeId("finding", ["system", system.id, systemStatus]),
      scope: "system",
      severity: systemStatus === "gpai-systemic" ? "HIGH" : "MEDIUM",
      title: "Système classé comme GPAI",
      description:
        "Le système est classé comme modèle GPAI. Des obligations spécifiques de transparence et de documentation s’appliquent.",
      evidence: [{ key: "systemStatus", value: systemStatus, note: statusReason }],
      references: ["AIAct:GPAI"],
      tags: ["status", "gpai"],
    });
  }

  // 2) Findings criticité use cases
  for (const uc of useCases) {
    if (uc.criticalityLevel === "critical") {
      findings.push({
        id: makeId("finding", ["usecase", uc.useCaseId, "critical"]),
        scope: "usecase",
        useCaseId: uc.useCaseId,
        severity: systemStatus === "high-risk" ? "HIGH" : "MEDIUM",
        title: "Cas d’usage à criticité très élevée",
        description:
          "Ce cas d’usage cumule plusieurs facteurs de risque importants.",
        evidence: [
          { key: "criticalityScore", value: uc.criticalityScore },
          { key: "criticalityReasons", value: uc.criticalityReasons },
        ],
        references: ["AIAct:AnnexIII"],
        tags: ["usecase", "criticality"],
      });
    }
  }

  // 3) Findings obligations
  const gatingCats: ObligationCategory[] = [
    "risk-management",
    "data-governance",
    "documentation",
    "robustness-security",
    "transparency",
    "post-market",
  ];

  for (const uc of useCases) {
    for (const o of uc.appliedObligations) {
      const isExplicitBad =
        o.fulfilled === false ||
        (o.fulfilled === null && o.estimatedCompliance === "unlikely");

      const isGatingMissing =
        systemStatus === "high-risk" &&
        o.fulfilled === null &&
        gatingCats.includes(o.category);

      if (!isExplicitBad && !isGatingMissing) continue;

      const sev = severityFromCategory(o.category, systemStatus);

      const title = isGatingMissing
        ? `Obligation critique non évaluée : ${o.label}`
        : `Obligation probablement non satisfaite : ${o.label}`;

      const description =
        isGatingMissing
          ? "Obligation bloquante pour un système à haut risque tant qu’elle n’est pas évaluée."
          : o.complianceReason ??
            "Cette obligation est estimée comme non satisfaite.";

      const refs = uniqRefs([
        ...(o.references ?? []),
        ...(obligationRefs.get(o.obligationId) ?? []),
      ]);

      findings.push({
        id: makeId("finding", [
          "usecase",
          uc.useCaseId,
          "obligation",
          o.obligationId,
        ]),
        scope: "usecase",
        useCaseId: uc.useCaseId,
        severity: sev,
        title,
        description,
        evidence: [
          { key: "obligationId", value: o.obligationId },
          { key: "category", value: o.category },
          { key: "fulfilled", value: o.fulfilled },
          { key: "estimatedCompliance", value: o.estimatedCompliance },
        ],
        obligationIds: [o.obligationId],
        references: refs.length > 0 ? refs : undefined,
        tags: ["obligation", o.category],
      });
    }
  }

  return findings;
}
