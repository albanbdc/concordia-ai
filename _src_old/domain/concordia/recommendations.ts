// src/domain/concordia/recommendations.ts

import type { Finding, Recommendation, LegalReference } from "./types";

/**
 * Dé-duplication simple des références légales
 */
function uniqRefs(refs: Array<LegalReference | undefined> = []): LegalReference[] {
  const seen = new Set<string>();
  const out: LegalReference[] = [];

  for (const r of refs) {
    if (!r) continue;
    if (seen.has(r)) continue;
    seen.add(r);
    out.push(r);
  }

  return out;
}

/**
 * Génération de recommandations à partir des findings.
 *
 * Principe fondamental :
 * - UNE recommandation par finding (pour l’instant)
 * - Les références légales sont héritées AUTOMATIQUEMENT du finding
 * - Aucune interprétation juridique ici
 */
export function buildRecommendations(findings: Finding[]): Recommendation[] {
  const recommendations: Recommendation[] = [];

  for (const f of findings) {
    // On ignore les findings purement informatifs
    if (f.severity === "INFO") continue;

    const refs = uniqRefs(f.references ?? []);

    recommendations.push({
      id: `reco:${f.id}`,
      findingId: f.id,

      priority:
        f.severity === "CRITICAL"
          ? 1
          : f.severity === "HIGH"
            ? 2
            : f.severity === "MEDIUM"
              ? 3
              : 4,

      title: "Mettre en conformité avec les exigences applicables de l’AI Act",

      steps: [
        "Identifier précisément les exigences réglementaires applicables au regard des articles cités.",
        "Documenter les mesures existantes et identifier les écarts de conformité.",
        "Définir et mettre en œuvre des actions correctives adaptées.",
        "Mettre en place des preuves et un suivi permettant de démontrer la conformité dans le temps.",
      ],

      effort:
        f.severity === "CRITICAL" || f.severity === "HIGH" ? "L" : "M",

      impact:
        f.severity === "CRITICAL"
          ? "HIGH"
          : f.severity === "HIGH"
            ? "HIGH"
            : "MEDIUM",

      // ✅ HÉRITAGE AUTOMATIQUE DES ARTICLES IA ACT
      references: refs.length > 0 ? refs : undefined,
    });
  }

  return recommendations;
}
