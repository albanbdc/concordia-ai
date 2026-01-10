// src/domain/concordia/measures.ts

export type SubMeasure = {
  key: string;
  label: string;
  hint?: string;
};

export type MeasurePack = {
  title: string;
  items: SubMeasure[];
  minChecked?: number;
};

export const MEASURES: Record<string, MeasurePack> = {
  "gen-1": {
    title: "Art. 9 — Système de gestion des risques",
    items: [
      { key: "policy", label: "Politique IA / gestion des risques écrite" },
      { key: "owners", label: "Rôles & responsabilités définis (RACI)" },
      { key: "review", label: "Revue périodique planifiée" },
    ],
    minChecked: 2,
  },

  "rm-1": {
    title: "Art. 9 — Analyse de risques documentée",
    items: [
      { key: "riskmap", label: "Cartographie des risques réalisée" },
      { key: "severity", label: "Gravité/probabilité estimées" },
      { key: "mitigation", label: "Mesures de mitigation définies" },
    ],
    minChecked: 2,
  },

  "rm-2": {
    title: "Art. 9 — Revue du risque & des contrôles",
    items: [
      { key: "change", label: "Revue déclenchée à chaque changement majeur" },
      { key: "schedule", label: "Revue régulière planifiée" },
      { key: "evidence", label: "Compte-rendu / suivi des actions" },
    ],
    minChecked: 2,
  },

  "data-1": {
    title: "Art. 10 — Gouvernance des données",
    items: [
      { key: "quality", label: "Contrôles qualité (nettoyage, anomalies…)" },
      { key: "access", label: "Contrôle d’accès aux datasets" },
      { key: "versioning", label: "Versioning des datasets" },
    ],
    minChecked: 2,
  },

  "dg-1": {
    title: "Art. 10 — Data lineage (traçabilité)",
    items: [
      { key: "sources", label: "Sources de données listées et justifiées" },
      { key: "transforms", label: "Transformations documentées" },
      { key: "trace", label: "Lien dataset → modèle / version" },
    ],
    minChecked: 2,
  },

  "dg-2": {
    title: "Art. 10 — Biais / représentativité",
    items: [
      { key: "biasTest", label: "Tests de biais réalisés" },
      { key: "represent", label: "Représentativité vérifiée" },
      { key: "fix", label: "Plan de correction si problème" },
    ],
    minChecked: 2,
  },

  "doc-1": {
    title: "Art. 11–12 — Documentation & traçabilité",
    items: [
      { key: "techfile", label: "Dossier technique structuré" },
      { key: "version", label: "Versioning produit / modèle" },
      { key: "audittrail", label: "Traçabilité des décisions clés" },
    ],
    minChecked: 2,
  },

  "doc-2": {
    title: "Art. 11 — Description du système",
    items: [
      { key: "scope", label: "Périmètre & cas d’usage clairement décrits" },
      { key: "limits", label: "Limites & hypothèses documentées" },
      { key: "inputs", label: "Entrées / sorties / logique expliquées" },
    ],
    minChecked: 2,
  },

  "log-1": {
    title: "Art. 12 — Logs",
    items: [
      { key: "logs", label: "Logs d’usage en place" },
      { key: "retention", label: "Rétention & accès définis" },
      { key: "incidentUse", label: "Logs exploitables en incident" },
    ],
    minChecked: 2,
  },

  "tra-1": {
    title: "Art. 13 — Transparence",
    items: [
      { key: "notice", label: "Notice utilisateur disponible" },
      { key: "limits", label: "Limites explicites" },
      { key: "contact", label: "Point de contact / support" },
    ],
    minChecked: 2,
  },

  "tra-2": {
    title: "Art. 13 — Instructions opérationnelles",
    items: [
      { key: "howto", label: "Instructions d’usage (pas à pas)" },
      { key: "escalate", label: "Quand escalader / passer en manuel" },
      { key: "examples", label: "Exemples d’erreurs & limites" },
    ],
    minChecked: 2,
  },

  "hum-1": {
    title: "Art. 14 — Supervision humaine",
    items: [
      { key: "human", label: "Humain responsable identifié" },
      { key: "override", label: "Possibilité d’override humain" },
      { key: "training", label: "Formation / consignes aux utilisateurs" },
    ],
    minChecked: 2,
  },

  "ho-1": {
    title: "Art. 14 — Workflow d’override",
    items: [
      { key: "workflow", label: "Workflow défini (seuils, alertes, escalade)" },
      { key: "ui", label: "Interface / procédure pour override" },
      { key: "trace", label: "Traçabilité des overrides" },
    ],
    minChecked: 2,
  },

  "tech-1": {
    title: "Art. 15 — Robustesse & sécurité",
    items: [
      { key: "tests", label: "Plan de tests (robustesse / stress)" },
      { key: "fallback", label: "Mode dégradé / fallback défini" },
      { key: "security", label: "Mesures sécurité minimales" },
    ],
    minChecked: 2,
  },

  "rs-1": {
    title: "Art. 15 — Métriques de performance",
    items: [
      { key: "kpi", label: "KPIs définis (accuracy, erreurs, FP/FN)" },
      { key: "threshold", label: "Seuil d’acceptation défini" },
      { key: "tracking", label: "Suivi dans le temps" },
    ],
    minChecked: 2,
  },

  "rs-2": {
    title: "Art. 15 — Cybersécurité",
    items: [
      { key: "iam", label: "IAM / contrôle d’accès" },
      { key: "secrets", label: "Gestion des secrets" },
      { key: "abuse", label: "Protection contre abus" },
    ],
    minChecked: 2,
  },

  "mon-1": {
    title: "Art. 61–62 — Post-market & incidents",
    items: [
      { key: "monitor", label: "Monitoring en production" },
      { key: "incident", label: "Process incident défini" },
      { key: "improve", label: "Boucle d’amélioration (post-mortem)" },
    ],
    minChecked: 2,
  },

  "pm-1": {
    title: "Art. 61 — KPIs & dérives",
    items: [
      { key: "drift", label: "Détection de drift (data/perf)" },
      { key: "alerts", label: "Alertes configurées" },
      { key: "register", label: "Registre d’anomalies" },
    ],
    minChecked: 2,
  },

  "pm-2": {
    title: "Art. 62 — Runbook incident",
    items: [
      { key: "triage", label: "Triage & escalade définis" },
      { key: "contain", label: "Mesures immédiates (containment)" },
      { key: "postmortem", label: "Post-mortem + actions correctives" },
    ],
    minChecked: 2,
  },

  "prov-1": {
    title: "Provider — Système qualité",
    items: [
      { key: "qms", label: "Process qualité défini" },
      { key: "reviews", label: "Revues internes (qualité)" },
      { key: "records", label: "Enregistrements conservés" },
    ],
    minChecked: 2,
  },

  "prov-2": {
    title: "Provider — Avant mise sur le marché",
    items: [
      { key: "readiness", label: "Checklist conformité avant release" },
      { key: "docsready", label: "Docs prêtes (tech + notice)" },
      { key: "validation", label: "Validation interne signée" },
    ],
    minChecked: 2,
  },

  "prov-3": {
    title: "Provider — Changements & versions",
    items: [
      { key: "versioning", label: "Versioning maîtrisé" },
      { key: "approval", label: "Validation avant changement majeur" },
      { key: "rollback", label: "Rollback possible" },
    ],
    minChecked: 2,
  },

  "dep-1": {
    title: "Deployer — Utilisation conforme",
    items: [
      { key: "follow", label: "Usage conforme aux instructions" },
      { key: "context", label: "Contexte de déploiement documenté" },
      { key: "controls", label: "Contrôles d’usage en place" },
    ],
    minChecked: 2,
  },

  "dep-2": {
    title: "Deployer — Supervision en contexte",
    items: [
      { key: "train", label: "Formation des utilisateurs" },
      { key: "procedures", label: "Procédures de supervision" },
      { key: "override", label: "Override en production possible" },
    ],
    minChecked: 2,
  },

  "dep-3": {
    title: "Deployer — Incidents",
    items: [
      { key: "monitor", label: "Surveillance en usage réel" },
      { key: "report", label: "Process de remontée incident" },
      { key: "record", label: "Registre des incidents" },
    ],
    minChecked: 2,
  },
};
