// src/domain/concordia/obligations.ts
// Concordia — IA Act aligned obligations (ENRICHED)
// Core + enriched obligations by IA Act blocks + role obligations (provider/deployer)

import type { Obligation } from "./types";

/**
 * Catégories = BLOCS IA ACT
 *  - risk-management        -> Art. 9
 *  - data-governance        -> Art. 10
 *  - documentation          -> Art. 11–12
 *  - transparency           -> Art. 13
 *  - human-oversight        -> Art. 14
 *  - robustness-security    -> Art. 15
 *  - post-market            -> Art. 61–62
 *  - role-obligations       -> Art. 16–29 (selon rôle)
 *
 * Objectif :
 * - garder simple et concret
 * - augmenter la crédibilité (≈ 22 obligations)
 * - permettre un score 0–100 normalisé sur les obligations applicables
 */

export const BASE_OBLIGATIONS: Obligation[] = [
  // =========================================================
  // Art. 9 — Risk management system
  // =========================================================

  {
    id: "gen-1",
    label: "Mettre en place un système de gestion des risques",
    description:
      "Définir une organisation et un processus de gestion des risques (identification, mitigation, revue) sur tout le cycle de vie.",
    category: "risk-management",
    weight: 4,
    appliesTo: { systemStatuses: ["high-risk"], roles: ["provider", "deployer"] },
  },
  {
    id: "rm-1",
    label: "Réaliser une analyse de risques structurée et documentée",
    description:
      "Identifier les risques (droits, sécurité, biais, dérives), estimer leur gravité/probabilité et documenter les mesures de réduction.",
    category: "risk-management",
    weight: 3,
    appliesTo: { systemStatuses: ["high-risk"], roles: ["provider", "deployer"] },
  },
  {
    id: "rm-2",
    label: "Mettre en place une revue périodique du risque et des contrôles",
    description:
      "Revoir régulièrement le risque et l’efficacité des contrôles (à chaque changement majeur et à périodicité définie).",
    category: "risk-management",
    weight: 3,
    appliesTo: { systemStatuses: ["high-risk"], roles: ["provider", "deployer"] },
  },

  // =========================================================
  // Art. 10 — Data & data governance
  // =========================================================

  {
    id: "data-1",
    label: "Assurer la gouvernance et la qualité des données",
    description:
      "Mettre en place des pratiques de gouvernance des données (qualité, pertinence, biais, représentativité) adaptées au cas d’usage.",
    category: "data-governance",
    weight: 4,
    appliesTo: { systemStatuses: ["high-risk"], roles: ["provider", "deployer"] },
  },
  {
    id: "dg-1",
    label: "Tracer les sources et transformations des données (data lineage)",
    description:
      "Documenter les sources, transformations, versions de datasets et règles de préparation (traçabilité bout-en-bout).",
    category: "data-governance",
    weight: 3,
    appliesTo: { systemStatuses: ["high-risk"], roles: ["provider", "deployer"] },
  },
  {
    id: "dg-2",
    label: "Mettre en place des contrôles biais / représentativité",
    description:
      "Effectuer des tests de biais et de représentativité, documenter les résultats et appliquer des actions correctives si nécessaire.",
    category: "data-governance",
    weight: 3,
    appliesTo: { systemStatuses: ["high-risk"], roles: ["provider", "deployer"] },
  },

  // =========================================================
  // Art. 11–12 — Technical documentation & record-keeping/logs
  // =========================================================

  {
    id: "doc-1",
    label: "Maintenir la documentation technique et la traçabilité",
    description:
      "Constituer et maintenir une documentation technique pertinente et des mécanismes de traçabilité (y compris logs lorsque requis).",
    category: "documentation",
    weight: 4,
    appliesTo: { systemStatuses: ["high-risk"], roles: ["provider", "deployer"] },
  },
  {
    id: "doc-2",
    label: "Décrire clairement le système (périmètre, limites, hypothèses)",
    description:
      "Documenter le périmètre, les limites, les hypothèses, les données utilisées et les conditions d’usage prévues.",
    category: "documentation",
    weight: 3,
    appliesTo: { systemStatuses: ["high-risk"], roles: ["provider", "deployer"] },
  },
  {
    id: "log-1",
    label: "Mettre en place une tenue de logs utile et exploitable",
    description:
      "Mettre en place des logs d’usage/événements permettant audit, analyse d’incident et détection de dérives (selon le contexte).",
    category: "documentation",
    weight: 3,
    appliesTo: { systemStatuses: ["high-risk"], roles: ["provider", "deployer"] },
  },

  // =========================================================
  // Art. 13 — Transparency & information to users
  // =========================================================

  {
    id: "tra-1",
    label: "Assurer la transparence et l’information des utilisateurs",
    description:
      "Fournir des informations claires sur le fonctionnement, les limites, les instructions d’usage et les conditions de déploiement appropriées.",
    category: "transparency",
    weight: 4,
    appliesTo: { systemStatuses: ["high-risk"], roles: ["provider", "deployer"] },
  },
  {
    id: "tra-2",
    label: "Fournir des instructions opérationnelles (usage, limites, escalade)",
    description:
      "Rendre disponible une notice opérationnelle (comment utiliser, limites, quand escalader, exemples d’erreurs typiques).",
    category: "transparency",
    weight: 3,
    appliesTo: { systemStatuses: ["high-risk"], roles: ["provider", "deployer"] },
  },

  // =========================================================
  // Art. 14 — Human oversight
  // =========================================================

  {
    id: "hum-1",
    label: "Mettre en place la supervision humaine",
    description:
      "Prévoir des mesures permettant une supervision humaine effective (capacité d’intervenir, d’annuler, de comprendre et d’encadrer l’usage).",
    category: "human-oversight",
    weight: 4,
    appliesTo: { systemStatuses: ["high-risk"], roles: ["provider", "deployer"] },
  },
  {
    id: "ho-1",
    label: "Permettre l’override et définir le workflow de supervision",
    description:
      "Assurer qu’un humain peut annuler/contester la décision et que le workflow d’intervention est défini (seuils, alertes, responsabilités).",
    category: "human-oversight",
    weight: 3,
    appliesTo: { systemStatuses: ["high-risk"], roles: ["provider", "deployer"] },
  },

  // =========================================================
  // Art. 15 — Accuracy, robustness & cybersecurity
  // =========================================================

  {
    id: "tech-1",
    label: "Garantir robustesse, exactitude et cybersécurité",
    description:
      "Mettre en œuvre des exigences de robustesse, d’exactitude, de résilience et de cybersécurité adaptées au risque et au contexte de déploiement.",
    category: "robustness-security",
    weight: 4,
    appliesTo: { systemStatuses: ["high-risk"], roles: ["provider", "deployer"] },
  },
  {
    id: "rs-1",
    label: "Définir et suivre des métriques de performance (accuracy, erreurs)",
    description:
      "Définir des métriques (accuracy, taux d’erreur, faux positifs/négatifs) et un seuil d’acceptation ; suivre dans le temps.",
    category: "robustness-security",
    weight: 3,
    appliesTo: { systemStatuses: ["high-risk"], roles: ["provider", "deployer"] },
  },
  {
    id: "rs-2",
    label: "Mettre en place des mesures cybersécurité adaptées",
    description:
      "Contrôles de sécurité (accès, secrets, durcissement, journalisation sécurité) et mesures de protection contre usages malveillants.",
    category: "robustness-security",
    weight: 3,
    appliesTo: { systemStatuses: ["high-risk"], roles: ["provider", "deployer"] },
  },

  // =========================================================
  // Art. 61–62 — Post-market monitoring & incident reporting
  // =========================================================

  {
    id: "mon-1",
    label: "Assurer le monitoring post-market et la gestion des incidents",
    description:
      "Mettre en place une surveillance après mise sur le marché/déploiement, et un processus de remontée/gestion des incidents graves lorsque applicable.",
    category: "post-market",
    weight: 4,
    appliesTo: { systemStatuses: ["high-risk"], roles: ["provider", "deployer"] },
  },
  {
    id: "pm-1",
    label: "Mettre en place des KPIs et alertes de dérive en production",
    description:
      "Surveiller les dérives (data drift, performance drift) et déclencher des alertes ; tenir un registre des anomalies.",
    category: "post-market",
    weight: 3,
    appliesTo: { systemStatuses: ["high-risk"], roles: ["provider", "deployer"] },
  },
  {
    id: "pm-2",
    label: "Définir un processus d’incident (détection → escalade → correction)",
    description:
      "Runbook incident : qui fait quoi, délais, actions immédiates, communication interne, analyse post-mortem.",
    category: "post-market",
    weight: 3,
    appliesTo: { systemStatuses: ["high-risk"], roles: ["provider", "deployer"] },
  },

  // =========================================================
  // Art. 16–29 — Role obligations (provider vs deployer)
  // =========================================================

  // Provider-focused
  {
    id: "prov-1",
    label: "Mettre en place un système de gestion de la qualité (provider)",
    description:
      "Disposer d’un système de gestion de la qualité couvrant conception, développement, tests, documentation, changements (obligation provider).",
    category: "role-obligations",
    weight: 3,
    appliesTo: { systemStatuses: ["high-risk"], roles: ["provider"] },
  },
  {
    id: "prov-2",
    label: "Assurer la conformité avant mise sur le marché (provider)",
    description:
      "Mettre en œuvre les démarches de conformité applicables avant mise sur le marché (préparation de la documentation et vérifications).",
    category: "role-obligations",
    weight: 3,
    appliesTo: { systemStatuses: ["high-risk"], roles: ["provider"] },
  },
  {
    id: "prov-3",
    label: "Gérer les changements et versions (provider)",
    description:
      "Contrôle des changements : versioning, validation, déploiement contrôlé et capacité de rollback pour maintenir la conformité.",
    category: "role-obligations",
    weight: 3,
    appliesTo: { systemStatuses: ["high-risk"], roles: ["provider"] },
  },

  // Deployer-focused
  {
    id: "dep-1",
    label: "Assurer une utilisation conforme aux instructions (deployer)",
    description:
      "Déployer et utiliser le système conformément aux instructions du provider, au périmètre prévu et aux conditions d’usage appropriées.",
    category: "role-obligations",
    weight: 3,
    appliesTo: { systemStatuses: ["high-risk"], roles: ["deployer"] },
  },
  {
    id: "dep-2",
    label: "Assurer la supervision humaine en contexte (deployer)",
    description:
      "Mettre en place la supervision humaine adaptée au contexte réel de déploiement (formation, procédures, escalade, override).",
    category: "role-obligations",
    weight: 3,
    appliesTo: { systemStatuses: ["high-risk"], roles: ["deployer"] },
  },
  {
    id: "dep-3",
    label: "Surveiller et remonter les incidents (deployer)",
    description:
      "Surveiller les performances en usage réel et signaler / remonter les incidents graves selon les procédures applicables.",
    category: "role-obligations",
    weight: 3,
    appliesTo: { systemStatuses: ["high-risk"], roles: ["deployer"] },
  },
];

/**
 * Helper : index par id
 */
export const OBLIGATIONS_BY_ID: Record<string, Obligation> = Object.fromEntries(
  BASE_OBLIGATIONS.map((o) => [o.id, o])
);
