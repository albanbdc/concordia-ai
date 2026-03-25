// lib/obligations-catalog.ts
// Catalogue officiel des obligations AI Act — Concordia V1
// Références : Règlement (UE) 2024/1689 (AI Act)

export type ObligationEntry = {
  id: string;
  title: string;
  description: string;
  legalRef: string;
  category: string;
  criticality: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  appliesTo: ("NORMAL" | "TRANSPARENCY" | "HIGH_RISK")[];
  appliesToRole: ("DEPLOYER" | "PROVIDER" | "BOTH")[];
  isGPAI?: boolean;
  applicableFrom: string; // ISO date
};

// ─────────────────────────────────────────────
// Dates clés AI Act
// Art. 5 (interdictions)     → 2025-02-02 ✅
// GPAI (Art. 51-55)          → 2025-08-02 ✅
// HIGH_RISK + NORMAL + TRANSP → 2026-08-02 ⏳
// Biométrie (Annexe III §1)  → 2026-08-02 ⏳
// ─────────────────────────────────────────────

export const OBLIGATIONS_CATALOG: ObligationEntry[] = [

  // ─────────────────────────────────────────────
  // OBLIGATIONS COMMUNES — tous les systèmes IA
  // ─────────────────────────────────────────────

  {
    id: "OBL-NORMAL-001",
    title: "Documentation interne minimale du système IA",
    description:
      "Maintenir une documentation interne décrivant le système IA utilisé, son objectif, son fournisseur ou son architecture, ses données d'entrée et ses limites connues. Cette documentation doit être accessible en cas de contrôle par une autorité compétente.",
    legalRef: "Art. 53 AI Act",
    category: "DOCUMENTATION",
    criticality: "LOW",
    appliesTo: ["NORMAL", "TRANSPARENCY", "HIGH_RISK"],
    appliesToRole: ["DEPLOYER", "PROVIDER", "BOTH"],
    applicableFrom: "2026-08-02",
  },
  {
    id: "OBL-NORMAL-002",
    title: "Information générale aux utilisateurs sur l'usage de l'IA",
    description:
      "Informer les utilisateurs de manière claire, accessible et compréhensible que le service ou la décision implique un système IA. Cette information doit être fournie avant ou au moment de l'interaction, dans un langage non technique.",
    legalRef: "Art. 52(1) AI Act",
    category: "TRANSPARENCE",
    criticality: "LOW",
    appliesTo: ["NORMAL", "TRANSPARENCY", "HIGH_RISK"],
    appliesToRole: ["DEPLOYER", "PROVIDER", "BOTH"],
    applicableFrom: "2026-08-02",
  },

  // ─────────────────────────────────────────────
  // OBLIGATIONS TRANSPARENCY — Article 50
  // ─────────────────────────────────────────────

  {
    id: "OBL-TRANSP-001",
    title: "Divulgation explicite de l'interaction avec un système IA",
    description:
      "Informer explicitement et sans ambiguïté les personnes physiques qu'elles interagissent avec un système IA (chatbot, assistant, interface automatisée), sauf si cela est évident au vu du contexte. Cette divulgation doit intervenir au plus tard au début de l'interaction.",
    legalRef: "Art. 50(1) AI Act",
    category: "TRANSPARENCE",
    criticality: "HIGH",
    appliesTo: ["TRANSPARENCY", "HIGH_RISK"],
    appliesToRole: ["DEPLOYER", "PROVIDER", "BOTH"],
    applicableFrom: "2026-08-02",
  },
  {
    id: "OBL-TRANSP-002",
    title: "Marquage et divulgation des contenus générés par IA",
    description:
      "Les contenus texte, image, audio ou vidéo générés ou manipulés par IA doivent être marqués de manière lisible par machine (watermarking) et divulgués explicitement comme générés par IA auprès des destinataires.",
    legalRef: "Art. 50(2) et 50(4) AI Act",
    category: "TRANSPARENCE",
    criticality: "HIGH",
    appliesTo: ["TRANSPARENCY", "HIGH_RISK"],
    appliesToRole: ["DEPLOYER", "PROVIDER", "BOTH"],
    applicableFrom: "2026-08-02",
  },
  {
    id: "OBL-TRANSP-003",
    title: "Transparence des systèmes de recommandation personnalisée",
    description:
      "Informer les utilisateurs de l'utilisation d'un système de recommandation basé sur le profilage individuel et leur offrir au moins une option alternative non basée sur ce profilage.",
    legalRef: "Art. 50(3) AI Act",
    category: "TRANSPARENCE",
    criticality: "MEDIUM",
    appliesTo: ["TRANSPARENCY", "HIGH_RISK"],
    appliesToRole: ["DEPLOYER", "PROVIDER", "BOTH"],
    applicableFrom: "2026-08-02",
  },

  // ─────────────────────────────────────────────
  // OBLIGATIONS HIGH RISK — DÉPLOYEUR
  // Base : Article 26 AI Act
  // ─────────────────────────────────────────────

  {
    id: "OBL-HR-DEP-001",
    title: "Utilisation conforme aux instructions du fournisseur",
    description:
      "Utiliser le système IA strictement conformément aux instructions d'utilisation fournies par le fournisseur (Art. 13). Ne pas modifier le système, l'utiliser à des fins non prévues, ou dans des conditions non conformes aux spécifications. Toute utilisation hors cadre doit être documentée et évaluée.",
    legalRef: "Art. 26(1) AI Act",
    category: "CONFORMITE_OPERATIONNELLE",
    criticality: "HIGH",
    appliesTo: ["HIGH_RISK"],
    appliesToRole: ["DEPLOYER", "BOTH"],
    applicableFrom: "2026-08-02",
  },
  {
    id: "OBL-HR-DEP-002",
    title: "Désignation d'un responsable de la supervision humaine",
    description:
      "Désigner une ou plusieurs personnes physiques compétentes pour assurer la supervision humaine du système IA à haut risque. Ces personnes doivent disposer de l'autorité, des compétences et des ressources nécessaires pour intervenir, corriger ou arrêter le système en cas de dysfonctionnement.",
    legalRef: "Art. 26(2) + Art. 14 AI Act",
    category: "SUPERVISION",
    criticality: "CRITICAL",
    appliesTo: ["HIGH_RISK"],
    appliesToRole: ["DEPLOYER", "BOTH"],
    applicableFrom: "2026-08-02",
  },
  {
    id: "OBL-HR-DEP-003",
    title: "Évaluation d'impact sur les droits fondamentaux (FRIA)",
    description:
      "Avant le déploiement, réaliser une évaluation d'impact sur les droits fondamentaux (FRIA). Cette évaluation doit identifier et documenter les risques potentiels pour les droits des personnes concernées, les mesures d'atténuation adoptées, et être mise à jour en cas de changement significatif.",
    legalRef: "Art. 26(4) + Art. 27 AI Act",
    category: "DROITS_FONDAMENTAUX",
    criticality: "CRITICAL",
    appliesTo: ["HIGH_RISK"],
    appliesToRole: ["DEPLOYER", "BOTH"],
    applicableFrom: "2026-08-02",
  },
  {
    id: "OBL-HR-DEP-004",
    title: "Information des personnes concernées par une décision IA",
    description:
      "Informer les personnes physiques concernées qu'elles sont soumises à une décision, évaluation ou traitement impliquant un système IA à haut risque. Cette information doit être claire, compréhensible et fournie avant ou au moment de la décision.",
    legalRef: "Art. 26(6) AI Act",
    category: "DROITS_PERSONNES",
    criticality: "HIGH",
    appliesTo: ["HIGH_RISK"],
    appliesToRole: ["DEPLOYER", "BOTH"],
    applicableFrom: "2026-08-02",
  },
  {
    id: "OBL-HR-DEP-005",
    title: "Coopération avec les autorités de surveillance",
    description:
      "Coopérer pleinement avec les autorités nationales de surveillance compétentes et leur fournir, sur demande, toute information et documentation nécessaire à la vérification de la conformité du système IA déployé.",
    legalRef: "Art. 26(7) AI Act",
    category: "CONFORMITE_ADMINISTRATIVE",
    criticality: "HIGH",
    appliesTo: ["HIGH_RISK"],
    appliesToRole: ["DEPLOYER", "BOTH"],
    applicableFrom: "2026-08-02",
  },
  {
    id: "OBL-HR-DEP-006",
    title: "Monitoring actif et signalement des incidents",
    description:
      "Surveiller activement le fonctionnement du système IA à haut risque. En cas d'incident ou de dysfonctionnement présentant un risque pour la santé, la sécurité ou les droits fondamentaux, signaler l'incident au fournisseur et, si nécessaire, à l'autorité nationale de surveillance dans les délais réglementaires.",
    legalRef: "Art. 29 + Art. 73 AI Act",
    category: "SURVEILLANCE",
    criticality: "CRITICAL",
    appliesTo: ["HIGH_RISK"],
    appliesToRole: ["DEPLOYER", "BOTH"],
    applicableFrom: "2026-08-02",
  },
  {
    id: "OBL-HR-DEP-007",
    title: "Vérifier : documentation technique et conformité fournisseur",
    description:
      "Obtenir et conserver la documentation technique complète du système IA (Art. 11 + Annexe IV), la déclaration de conformité UE (Art. 47) et la preuve d'enregistrement dans la base de données UE (Art. 49). Ces documents sont nécessaires pour démontrer la conformité en cas de contrôle.",
    legalRef: "Art. 11 + Art. 47 + Art. 49 + Art. 26(1) AI Act",
    category: "VERIFICATION_FOURNISSEUR",
    criticality: "CRITICAL",
    appliesTo: ["HIGH_RISK"],
    appliesToRole: ["DEPLOYER", "BOTH"],
    applicableFrom: "2026-08-02",
  },

  // ─────────────────────────────────────────────
  // OBLIGATIONS HIGH RISK — FOURNISSEUR
  // Base : Articles 9 à 15 + 47-49 AI Act
  // ─────────────────────────────────────────────

  {
    id: "OBL-HR-PROV-001",
    title: "Système de gestion des risques (cycle de vie complet)",
    description:
      "Établir, documenter, mettre en œuvre et maintenir un système de gestion des risques couvrant l'intégralité du cycle de vie du système IA. Inclut : identification et analyse des risques connus et prévisibles, estimation, évaluation et mesures de gestion adaptées. Mise à jour continue obligatoire.",
    legalRef: "Art. 9 AI Act",
    category: "GESTION_RISQUES",
    criticality: "CRITICAL",
    appliesTo: ["HIGH_RISK"],
    appliesToRole: ["PROVIDER", "BOTH"],
    applicableFrom: "2026-08-02",
  },
  {
    id: "OBL-HR-PROV-002",
    title: "Gouvernance et qualité des données d'entraînement, validation et test",
    description:
      "Les données utilisées pour l'entraînement, la validation et le test doivent respecter des pratiques de gouvernance adaptées : pertinence, représentativité, absence de biais discriminatoires, qualité et intégrité suffisantes, traçabilité de leur origine.",
    legalRef: "Art. 10 AI Act",
    category: "DONNEES",
    criticality: "CRITICAL",
    appliesTo: ["HIGH_RISK"],
    appliesToRole: ["PROVIDER", "BOTH"],
    applicableFrom: "2026-08-02",
  },
  {
    id: "OBL-HR-PROV-003",
    title: "Documentation technique complète (Annexe IV)",
    description:
      "Établir et maintenir une documentation technique complète avant la mise sur le marché. Doit permettre à une autorité de vérifier la conformité. Contenu défini en Annexe IV : description générale, architecture, données d'entraînement, métriques de performance, mesures de cybersécurité.",
    legalRef: "Art. 11 + Annexe IV AI Act",
    category: "DOCUMENTATION",
    criticality: "CRITICAL",
    appliesTo: ["HIGH_RISK"],
    appliesToRole: ["PROVIDER", "BOTH"],
    applicableFrom: "2026-08-02",
  },
  {
    id: "OBL-HR-PROV-004",
    title: "Journalisation automatique des événements (logs)",
    description:
      "Le système IA doit générer automatiquement des journaux d'événements permettant la traçabilité complète de son fonctionnement. Ces logs doivent permettre l'identification des périodes de fonctionnement, la traçabilité des inputs/outputs et la détection des situations à risque.",
    legalRef: "Art. 12 AI Act",
    category: "TRACABILITE",
    criticality: "HIGH",
    appliesTo: ["HIGH_RISK"],
    appliesToRole: ["PROVIDER", "BOTH"],
    applicableFrom: "2026-08-02",
  },
  {
    id: "OBL-HR-PROV-005",
    title: "Instructions d'utilisation claires pour les déployeurs",
    description:
      "Fournir aux déployeurs des instructions d'utilisation claires incluant : identité du fournisseur, performances et limites du système, conditions d'utilisation, niveau d'exactitude attendu, mesures de supervision humaine à mettre en place, caractéristiques des données d'entrée attendues.",
    legalRef: "Art. 13 AI Act",
    category: "TRANSPARENCE",
    criticality: "HIGH",
    appliesTo: ["HIGH_RISK"],
    appliesToRole: ["PROVIDER", "BOTH"],
    applicableFrom: "2026-08-02",
  },
  {
    id: "OBL-HR-PROV-006",
    title: "Conception avec supervision humaine effective",
    description:
      "Concevoir le système IA avec des mesures techniques permettant une supervision humaine effective : possibilité d'arrêt, de correction, de refus des outputs. Les superviseurs désignés par le déployeur doivent pouvoir comprendre les capacités et limites du système.",
    legalRef: "Art. 14 AI Act",
    category: "SUPERVISION",
    criticality: "CRITICAL",
    appliesTo: ["HIGH_RISK"],
    appliesToRole: ["PROVIDER", "BOTH"],
    applicableFrom: "2026-08-02",
  },
  {
    id: "OBL-HR-PROV-007",
    title: "Exactitude, robustesse et cybersécurité",
    description:
      "Le système doit atteindre un niveau approprié d'exactitude, être robuste aux erreurs et aux tentatives de manipulation (data poisoning, adversarial attacks), et résister aux cyberattaques tout au long de son cycle de vie.",
    legalRef: "Art. 15 AI Act",
    category: "SECURITE",
    criticality: "CRITICAL",
    appliesTo: ["HIGH_RISK"],
    appliesToRole: ["PROVIDER", "BOTH"],
    applicableFrom: "2026-08-02",
  },
  {
    id: "OBL-HR-PROV-008",
    title: "Déclaration de conformité UE (DoC) et marquage CE",
    description:
      "Établir et signer une déclaration de conformité UE (Annexe V) attestant que le système satisfait aux exigences de l'AI Act. Apposer le marquage CE avant la mise sur le marché. Mettre à jour la déclaration en cas de modification substantielle.",
    legalRef: "Art. 47 + Annexe V AI Act",
    category: "CONFORMITE_ADMINISTRATIVE",
    criticality: "CRITICAL",
    appliesTo: ["HIGH_RISK"],
    appliesToRole: ["PROVIDER", "BOTH"],
    applicableFrom: "2026-08-02",
  },
  {
    id: "OBL-HR-PROV-009",
    title: "Enregistrement obligatoire dans la base de données UE",
    description:
      "Enregistrer le système IA à haut risque dans la base de données UE (EU AI Database) avant sa mise sur le marché ou sa mise en service. L'enregistrement doit contenir les informations définies à l'Annexe VIII du règlement.",
    legalRef: "Art. 49(1) + Art. 71 AI Act",
    category: "CONFORMITE_ADMINISTRATIVE",
    criticality: "HIGH",
    appliesTo: ["HIGH_RISK"],
    appliesToRole: ["PROVIDER", "BOTH"],
    applicableFrom: "2026-08-02",
  },
  {
    id: "OBL-HR-PROV-010",
    title: "Surveillance post-commercialisation et signalement des incidents graves",
    description:
      "Mettre en place un système de surveillance active après la mise sur le marché pour détecter incidents, dérives de performance et non-conformités. En cas d'incident grave, notifier l'autorité nationale de surveillance dans les délais réglementaires. Un plan de surveillance doit être documenté.",
    legalRef: "Art. 72 + Art. 73 AI Act",
    category: "SURVEILLANCE",
    criticality: "HIGH",
    appliesTo: ["HIGH_RISK"],
    appliesToRole: ["PROVIDER", "BOTH"],
    applicableFrom: "2026-08-02",
  },

  // ─────────────────────────────────────────────
  // OBLIGATIONS BIOMÉTRIE — Annexe III §1 AI Act
  // ─────────────────────────────────────────────

  {
    id: "OBL-BIO-001",
    title: "Interdiction d'identification biométrique à distance en temps réel (espaces publics)",
    description:
      "L'utilisation de systèmes d'identification biométrique à distance en temps réel dans des espaces accessibles au public à des fins répressives est interdite sauf exceptions strictement encadrées (Art. 5(1)(h)). Tout déploiement doit être autorisé par une autorité judiciaire ou administrative indépendante, limité dans le temps et l'espace, et documenté. Les cas d'usage privés hors répression sont soumis aux exigences HIGH_RISK de l'Annexe III §1.",
    legalRef: "Art. 5(1)(h) + Annexe III §1(a) AI Act",
    category: "BIOMETRIE",
    criticality: "CRITICAL",
    appliesTo: ["HIGH_RISK"],
    appliesToRole: ["DEPLOYER", "BOTH"],
    applicableFrom: "2025-02-02",
  },
  {
    id: "OBL-BIO-002",
    title: "Encadrement des systèmes de catégorisation biométrique",
    description:
      "Les systèmes de catégorisation biométrique déduisant des caractéristiques sensibles (origine raciale ou ethnique, opinions politiques, convictions religieuses, état de santé, orientation sexuelle) à partir de données biométriques sont interdits (Art. 5(1)(g)). Tout système de catégorisation biométrique autorisé doit respecter les exigences HIGH_RISK, inclure une analyse d'impact FRIA, et faire l'objet d'une supervision humaine renforcée.",
    legalRef: "Art. 5(1)(g) + Annexe III §1(b) AI Act",
    category: "BIOMETRIE",
    criticality: "CRITICAL",
    appliesTo: ["HIGH_RISK"],
    appliesToRole: ["DEPLOYER", "PROVIDER", "BOTH"],
    applicableFrom: "2025-02-02",
  },
  {
    id: "OBL-BIO-003",
    title: "Encadrement des systèmes de reconnaissance des émotions",
    description:
      "Les systèmes d'IA inférant les émotions de personnes physiques sur le lieu de travail ou dans les établissements d'enseignement sont interdits sauf à des fins médicales ou de sécurité (Art. 5(1)(f)). Tout système de reconnaissance des émotions autorisé est classifié HIGH_RISK (Annexe III §1(c)) et doit inclure : information préalable des personnes concernées, analyse d'impact FRIA, supervision humaine, documentation technique complète.",
    legalRef: "Art. 5(1)(f) + Annexe III §1(c) AI Act",
    category: "BIOMETRIE",
    criticality: "CRITICAL",
    appliesTo: ["HIGH_RISK"],
    appliesToRole: ["DEPLOYER", "PROVIDER", "BOTH"],
    applicableFrom: "2025-02-02",
  },

  // ─────────────────────────────────────────────
  // OBLIGATIONS GPAI — Articles 51-55 AI Act
  // ─────────────────────────────────────────────

  {
    id: "OBL-GPAI-001",
    title: "Documentation technique du modèle GPAI",
    description:
      "Le fournisseur d'un modèle d'IA à usage général doit établir et tenir à jour une documentation technique comprenant : description générale du modèle, architecture, données d'entraînement utilisées, méthodes d'entraînement, capacités et limitations, performances mesurées, mesures de sécurité. Cette documentation doit être mise à disposition des fournisseurs en aval qui intègrent le modèle.",
    legalRef: "Art. 53(1)(a) + Annexe XI AI Act",
    category: "DOCUMENTATION",
    criticality: "CRITICAL",
    appliesTo: ["NORMAL", "TRANSPARENCY", "HIGH_RISK"],
    appliesToRole: ["PROVIDER", "BOTH"],
    isGPAI: true,
    applicableFrom: "2025-08-02",
  },
  {
    id: "OBL-GPAI-002",
    title: "Politique de respect des droits d'auteur (GPAI)",
    description:
      "Le fournisseur d'un modèle GPAI doit mettre en place et publier une politique de respect du droit d'auteur, notamment en ce qui concerne les données d'entraînement. Cette politique doit inclure les mesures prises pour identifier et respecter les réservations de droits exprimées par les titulaires de droits (opt-out). Elle doit être accessible publiquement.",
    legalRef: "Art. 53(1)(c) AI Act",
    category: "DROITS_AUTEUR",
    criticality: "HIGH",
    appliesTo: ["NORMAL", "TRANSPARENCY", "HIGH_RISK"],
    appliesToRole: ["PROVIDER", "BOTH"],
    isGPAI: true,
    applicableFrom: "2025-08-02",
  },
  {
    id: "OBL-GPAI-003",
    title: "Résumé des données d'entraînement (GPAI)",
    description:
      "Le fournisseur d'un modèle GPAI doit publier un résumé suffisamment détaillé des données utilisées pour l'entraînement du modèle, selon un modèle fourni par l'Office de l'IA. Ce résumé doit être accessible publiquement et permettre aux tiers d'évaluer les risques potentiels liés aux données d'entraînement.",
    legalRef: "Art. 53(1)(d) AI Act",
    category: "TRANSPARENCE",
    criticality: "HIGH",
    appliesTo: ["NORMAL", "TRANSPARENCY", "HIGH_RISK"],
    appliesToRole: ["PROVIDER", "BOTH"],
    isGPAI: true,
    applicableFrom: "2025-08-02",
  },
  {
    id: "OBL-GPAI-004",
    title: "Évaluation et atténuation des risques systémiques (GPAI puissant)",
    description:
      "Les fournisseurs de modèles GPAI à risque systémique (capacité de calcul supérieure à 10^25 FLOPs) doivent réaliser des évaluations approfondies du modèle, des tests adversariaux, identifier et atténuer les risques systémiques, signaler les incidents graves à la Commission européenne, et mettre en place des mesures de cybersécurité adaptées.",
    legalRef: "Art. 55 AI Act",
    category: "GESTION_RISQUES",
    criticality: "CRITICAL",
    appliesTo: ["NORMAL", "TRANSPARENCY", "HIGH_RISK"],
    appliesToRole: ["PROVIDER", "BOTH"],
    isGPAI: true,
    applicableFrom: "2025-08-02",
  },
  {
    id: "OBL-GPAI-005",
    title: "Information des fournisseurs en aval (GPAI)",
    description:
      "Le fournisseur d'un modèle GPAI intégré dans un système IA doit fournir aux fournisseurs en aval toutes les informations et la documentation nécessaires pour leur permettre de respecter leurs propres obligations au titre de l'AI Act. Cette information doit couvrir les capacités, limitations et conditions d'utilisation du modèle.",
    legalRef: "Art. 53(1)(b) AI Act",
    category: "TRANSPARENCE",
    criticality: "HIGH",
    appliesTo: ["NORMAL", "TRANSPARENCY", "HIGH_RISK"],
    appliesToRole: ["PROVIDER", "BOTH"],
    isGPAI: true,
    applicableFrom: "2025-08-02",
  },
];

// ─────────────────────────────────────────────
// Helper : badge applicabilité
// ─────────────────────────────────────────────

export function getApplicabilityBadge(applicableFrom: string): {
  label: string;
  color: "green" | "orange" | "red";
  isActive: boolean;
} {
  const today = new Date();
  const date = new Date(applicableFrom);
  const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return { label: "En vigueur", color: "green", isActive: true };
  } else if (diffDays <= 180) {
    return { label: `Dans ${Math.ceil(diffDays / 30)} mois`, color: "orange", isActive: false };
  } else {
    const d = date.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
    return { label: `À partir de ${d}`, color: "orange", isActive: false };
  }
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

export function getObligationsForClassificationAndRole(
  classification: "NORMAL" | "TRANSPARENCY" | "HIGH_RISK",
  role: "DEPLOYER" | "PROVIDER" | "BOTH",
  isGPAI?: boolean
): ObligationEntry[] {
  return OBLIGATIONS_CATALOG.filter((o) => {
    if (o.isGPAI && !isGPAI) return false;
    return (
      o.appliesTo.includes(classification) &&
      o.appliesToRole.includes(role)
    );
  });
}

// Compatibilité ascendante — utilisé par le backfill
export function getObligationsForClassification(
  classification: "NORMAL" | "TRANSPARENCY" | "HIGH_RISK"
): ObligationEntry[] {
  return getObligationsForClassificationAndRole(classification, "DEPLOYER", false);
}