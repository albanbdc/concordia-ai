// lib/complianceActions.ts

export type ParsedAction = {
  title: string;
  description?: string | null;
  weight?: number | null;
};

/**
 * Extrait une liste d'actions de conformité à partir du texte complet d'un audit.
 * On cherche la section "Plan d'action" puis on découpe ligne par ligne.
 */
export function extractComplianceActionsFromAudit(
  resultText: string
): ParsedAction[] {
  if (!resultText) return [];

  const lower = resultText.toLowerCase();

  // On cherche un bloc "plan d'action" (assez large pour couvrir différentes formulations)
  const planIndex = lower.indexOf("plan d'action");
  if (planIndex === -1) {
    return [];
  }

  // On essaie de trouver où s'arrête la section (avant Score, Forces, Red flags...)
  const endMarkers = [
    "score de conformité",
    "forces du système",
    "red flags",
    "détails du score",
  ];

  let endIndex = resultText.length;
  for (const marker of endMarkers) {
    const i = lower.indexOf(marker, planIndex + 20);
    if (i !== -1 && i < endIndex) {
      endIndex = i;
    }
  }

  const section = resultText.slice(planIndex, endIndex);

  // On découpe par ligne et on garde les lignes qui ressemblent à des actions
  const lines = section
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const actions: ParsedAction[] = [];

  for (const line of lines) {
    // On ne garde que les puces / listes numérotées
    const isBullet =
      /^[-•–]\s+/.test(line) || /^\d+[\)\.]\s+/.test(line);

    if (!isBullet) continue;

    let clean = line.replace(/^[-•–]\s+/, "");
    clean = clean.replace(/^\d+[\)\.]\s+/, "");

    if (!clean) continue;

    actions.push({
      title: clean,
      description: null,
    });
  }

  return actions;
}
