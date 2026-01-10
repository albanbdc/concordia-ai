// src/domain/concordia/llm/cases.ts

export type LlmCase = {
  input: string;
  expected: {
    prohibitedSignal?: boolean;
    highRiskSignal?: boolean;
    biometricSignal?: boolean;
    lawEnforcementSignal?: boolean;
    vulnerablePersonsSignal?: boolean;
  };
};

export const LLM_CASES: LlmCase[] = [
  // =====================================================
  // TOP 5 — INJECTÉS DANS LE PROMPT
  // =====================================================

  // 🔴 PROHIBITED (formulation plus proche du réel)
  {
    input:
      "Reconnaissance faciale en temps réel dans la rue / espace public pour identifier ou suivre des individus (ex : personnes dangereuses).",
    expected: { prohibitedSignal: true, biometricSignal: true, lawEnforcementSignal: true },
  },

  // 🔴 PROHIBITED
  {
    input:
      "Système de notation sociale des citoyens basé sur leur comportement.",
    expected: { prohibitedSignal: true },
  },

  // 🟧 HIGH RISK
  {
    input:
      "Outil de tri automatique des CV pour aider au recrutement.",
    expected: { highRiskSignal: true },
  },

  // 🟧 HIGH RISK
  {
    input:
      "Système automatisé d’évaluation du risque client pour accorder un prêt.",
    expected: { highRiskSignal: true },
  },

  // 🟧 HIGH RISK + vulnérables
  {
    input:
      "IA utilisée pour évaluer ou orienter des élèves dans un parcours scolaire.",
    expected: { highRiskSignal: true, vulnerablePersonsSignal: true },
  },

  // =====================================================
  // PROHIBITED — AUTRES
  // =====================================================

  {
    input:
      "Outil visant à influencer le comportement des utilisateurs de manière subliminale.",
    expected: { prohibitedSignal: true },
  },
  {
    input:
      "Analyse automatisée des émotions des employés via caméra pendant le travail.",
    expected: { prohibitedSignal: true },
  },
  {
    input:
      "Surveillance biométrique massive des personnes dans un centre commercial.",
    expected: { prohibitedSignal: true, biometricSignal: true },
  },

  // =====================================================
  // HIGH RISK — CAS PROPRES
  // =====================================================

  {
    input:
      "Outil d’aide à la décision pour présélectionner des candidats à un poste.",
    expected: { highRiskSignal: true },
  },
  {
    input:
      "Analyse automatique des entretiens vidéo pour évaluer les compétences des candidats.",
    expected: { highRiskSignal: true, biometricSignal: true },
  },
  {
    input:
      "Outil d’aide à la décision pour la tarification des assurances.",
    expected: { highRiskSignal: true },
  },
  {
    input:
      "IA utilisée pour prioriser l’accès à des logements sociaux.",
    expected: { highRiskSignal: true },
  },
  {
    input:
      "Système automatisé d’évaluation d’éligibilité à des aides sociales.",
    expected: { highRiskSignal: true },
  },
  {
    input:
      "Outil d’analyse prédictive utilisé par la police pour prioriser des enquêtes.",
    expected: { highRiskSignal: true, lawEnforcementSignal: true },
  },

  // =====================================================
  // FORMULATIONS “SALES” — CLIENTS RÉELS
  // =====================================================

  // 🔴 PROHIBITED (TON CAS EXACT)
  {
    input:
      "L'IA procède à une reconnaissance faciale des gens dans la rue pour suivre les individus dangereux.",
    expected: { prohibitedSignal: true, biometricSignal: true, lawEnforcementSignal: true },
  },

  // 🟧 HIGH RISK - excuses fréquentes
  {
    input:
      "Ce n’est pas une décision automatique, c’est juste un score pour aider le recruteur.",
    expected: { highRiskSignal: true },
  },
  {
    input:
      "On utilise l’IA comme support, l’humain valide toujours derrière.",
    expected: { highRiskSignal: true },
  },
  {
    input:
      "Ça sert surtout à prioriser les cas, pas à décider.",
    expected: { highRiskSignal: true },
  },
];
