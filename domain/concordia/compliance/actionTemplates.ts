// src/domain/concordia/compliance/actionTemplates.ts

export type ActionPriority = "HIGH" | "MEDIUM" | "LOW";

export type ComplianceActionTemplate = {
  obligationId: string;

  // Titre court et clair
  title: string;

  // 2-3 lignes max, concret
  description: string;

  // Priorité par défaut (on pourra la booster si le système est high-risk)
  defaultPriority: ActionPriority;

  // Qui doit le faire en général
  owner: "CLIENT" | "CABINET";
};

/**
 * Templates d’actions : 1 obligation -> 1 action concrète
 * (On enrichira au fur et à mesure avec des retours clients)
 */
export const ACTION_TEMPLATES: ComplianceActionTemplate[] = [
  // -------------------------
  // RISK MANAGEMENT
  // -------------------------
  {
    obligationId: "gen-1",
    title: "Mettre en place une gestion des risques (cadre + responsabilités)",
    description:
      "Définir un processus de gestion des risques (rôles, fréquence, validation) et le documenter. Prévoir une revue avant mise en prod puis périodique.",
    defaultPriority: "HIGH",
    owner: "CLIENT",
  },
  {
    obligationId: "rm-1",
    title: "Faire une analyse de risques structurée et documentée",
    description:
      "Lister les risques (droits fondamentaux, sécurité, biais), leur gravité/probabilité, et les mesures de réduction. Conserver une trace exploitable pour audit.",
    defaultPriority: "HIGH",
    owner: "CLIENT",
  },
  {
    obligationId: "rm-2",
    title: "Organiser une revue périodique des risques et contrôles",
    description:
      "Planifier une revue régulière (mensuelle/trimestrielle) des risques, incidents, dérives et contrôles. Formaliser un compte-rendu et des actions.",
    defaultPriority: "MEDIUM",
    owner: "CLIENT",
  },

  // -------------------------
  // DATA GOVERNANCE
  // -------------------------
  {
    obligationId: "data-1",
    title: "Mettre en place une gouvernance des données (qualité + règles)",
    description:
      "Définir quelles données sont utilisées, qui les valide, et les critères qualité (complétude, exactitude, fraîcheur). Documenter les règles d’usage.",
    defaultPriority: "HIGH",
    owner: "CLIENT",
  },
  {
    obligationId: "dg-1",
    title: "Tracer les sources et transformations des données (data lineage)",
    description:
      "Documenter la source des données, les étapes de transformation et les jeux de données finaux. Garder une preuve simple à montrer en audit.",
    defaultPriority: "MEDIUM",
    owner: "CLIENT",
  },
  {
    obligationId: "dg-2",
    title: "Mettre des contrôles biais / représentativité",
    description:
      "Définir des tests biais (par groupes) et des contrôles de représentativité. Mettre en place une procédure de correction si écart détecté.",
    defaultPriority: "HIGH",
    owner: "CLIENT",
  },

  // -------------------------
  // DOCUMENTATION / LOGS
  // -------------------------
  {
    obligationId: "doc-1",
    title: "Créer une documentation technique exploitable (audit-ready)",
    description:
      "Rédiger une doc simple : objectif, données, modèle, limites, risques, contrôles, tests. Structurer pour qu’un tiers puisse comprendre rapidement.",
    defaultPriority: "HIGH",
    owner: "CLIENT",
  },
  {
    obligationId: "doc-2",
    title: "Décrire clairement le périmètre et les limites du système",
    description:
      "Définir ce que le système fait / ne fait pas, les hypothèses, les limites connues et les usages interdits en interne. Ajouter des exemples concrets.",
    defaultPriority: "MEDIUM",
    owner: "CLIENT",
  },
  {
    obligationId: "log-1",
    title: "Mettre en place des logs utiles (traçabilité des décisions)",
    description:
      "Définir ce qui est loggé (inputs, outputs, versions, horodatage, utilisateur), où c’est stocké, et comment on l’extrait en cas d’incident.",
    defaultPriority: "HIGH",
    owner: "CLIENT",
  },

  // -------------------------
  // TRANSPARENCY
  // -------------------------
  {
    obligationId: "tra-1",
    title: "Informer les utilisateurs (transparence)",
    description:
      "Préparer une information claire : rôle de l’IA, limites, critères généraux, et comment contester/escalader. Mettre à disposition au bon endroit.",
    defaultPriority: "MEDIUM",
    owner: "CLIENT",
  },
  {
    obligationId: "tra-2",
    title: "Fournir des instructions opérationnelles",
    description:
      "Écrire un guide d’usage : quand utiliser l’outil, quand ne pas l’utiliser, comment interpréter le résultat, et quoi faire si doute/incident.",
    defaultPriority: "MEDIUM",
    owner: "CLIENT",
  },

  // -------------------------
  // HUMAN OVERSIGHT
  // -------------------------
  {
    obligationId: "hum-1",
    title: "Mettre en place une supervision humaine réelle",
    description:
      "Définir qui supervise, quand on doit intervenir, comment on arrête/override le système, et comment on documente les décisions humaines.",
    defaultPriority: "HIGH",
    owner: "CLIENT",
  },
  {
    obligationId: "ho-1",
    title: "Définir le workflow d’override (qui, quand, comment)",
    description:
      "Créer une procédure simple : déclencheurs d’override, personnes habilitées, délais, et trace écrite. Tester ce workflow sur des cas réels.",
    defaultPriority: "HIGH",
    owner: "CLIENT",
  },

  // -------------------------
  // ROBUSTNESS / SECURITY
  // -------------------------
  {
    obligationId: "tech-1",
    title: "Définir un plan robustesse / sécurité (cyber + qualité)",
    description:
      "Identifier menaces (attaque, fuite, dérive), définir mesures (accès, chiffrement, tests), et documenter le plan de réduction des risques.",
    defaultPriority: "HIGH",
    owner: "CLIENT",
  },
  {
    obligationId: "rs-1",
    title: "Définir et suivre des métriques de performance",
    description:
      "Choisir des métriques (accuracy, taux d’erreur, faux positifs) et mettre un suivi dans le temps. Définir des seuils d’alerte.",
    defaultPriority: "MEDIUM",
    owner: "CLIENT",
  },
  {
    obligationId: "rs-2",
    title: "Mettre en place des mesures cybersécurité adaptées",
    description:
      "Mettre des contrôles d’accès, journalisation sécurité, gestion secrets, tests vulnérabilités. Prévoir un plan en cas d’incident.",
    defaultPriority: "HIGH",
    owner: "CLIENT",
  },

  // -------------------------
  // POST-MARKET
  // -------------------------
  {
    obligationId: "mon-1",
    title: "Mettre un monitoring post-market et gestion incidents",
    description:
      "Définir comment on détecte une dérive, comment on qualifie un incident et qui intervient. Documenter et conserver les preuves.",
    defaultPriority: "HIGH",
    owner: "CLIENT",
  },
  {
    obligationId: "pm-1",
    title: "Mettre des KPIs + alertes de dérive en production",
    description:
      "Mettre des KPIs (qualité données, taux erreurs) et des alertes. Définir une routine de revue et des actions automatiques en cas d’écart.",
    defaultPriority: "MEDIUM",
    owner: "CLIENT",
  },
  {
    obligationId: "pm-2",
    title: "Définir un processus d’incident (détection → correction)",
    description:
      "Écrire un process : détection, escalade, correction, validation, communication. Tester ce process sur un scénario fictif.",
    defaultPriority: "MEDIUM",
    owner: "CLIENT",
  },

  // -------------------------
  // DEPLOYER ROLE OBLIGATIONS
  // -------------------------
  {
    obligationId: "dep-1",
    title: "Assurer l’utilisation conforme aux instructions (deployer)",
    description:
      "Créer des règles d’usage internes : cas autorisés/interdits, formation des utilisateurs, et contrôle régulier de l’utilisation.",
    defaultPriority: "MEDIUM",
    owner: "CLIENT",
  },
  {
    obligationId: "dep-2",
    title: "Supervision humaine en contexte (deployer)",
    description:
      "Définir un protocole terrain : qui supervise, comment on valide, comment on stoppe, et comment on trace les décisions humaines.",
    defaultPriority: "HIGH",
    owner: "CLIENT",
  },
  {
    obligationId: "dep-3",
    title: "Remonter les incidents et anomalies (deployer)",
    description:
      "Mettre un canal de remontée (formulaire / ticket) et une procédure simple. Définir une personne responsable et des délais de traitement.",
    defaultPriority: "MEDIUM",
    owner: "CLIENT",
  },
];

/**
 * Helper: retrouver un template par obligationId
 */
export function getActionTemplate(obligationId: string) {
  return ACTION_TEMPLATES.find((t) => t.obligationId === obligationId) || null;
}
