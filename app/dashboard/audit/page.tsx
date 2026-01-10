"use client";

import AuditSavedBanner from "@/components/concordia/AuditSavedBanner";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Role = "provider" | "deployer";

type Sector =
  | "employment"
  | "hr"
  | "education"
  | "health"
  | "finance"
  | "justice"
  | "law-enforcement"
  | "migration"
  | "critical-infra"
  | "services"
  | "public"
  | "generic";

type UseCase = {
  id: string;
  name: string;
  sector: Sector;

  affectsRights: boolean;
  safetyCritical: boolean;
  vulnerableGroups: boolean;
  biometric: boolean;

  usesSubliminalTechniques?: boolean;
  exploitsVulnerabilities?: boolean;
  socialScoring?: boolean;
  predictivePolicing?: boolean;
  realTimeBiometricIdentification?: boolean;

  usesChatbot?: boolean;
  usesEmotionRecognition?: boolean;
  isDeepfake?: boolean;

  isLawEnforcementUseCase?: boolean;
  isJusticeUseCase?: boolean;
  isMigrationUseCase?: boolean;
  isCriticalInfrastructure?: boolean;
  isEducationUseCase?: boolean;
  isEmploymentUseCase?: boolean;
  isAccessToEssentialServices?: boolean;

  users: string[];
  countries: string[];
};

type AiSystem = {
  id: string;
  name: string;
  role: Role;
  entityType?: Role;
  useCases: UseCase[];
};

type SubMeasure = {
  key: string;
  label: string;
  hint?: string;
};

type MeasurePack = {
  obligationId: string;
  category: string;
  title: string;
  items: SubMeasure[];
  minChecked?: number;
  group: "core" | "advanced" | "role";
};

async function safeReadJson(res: Response) {
  const text = await res.text();
  if (!text || text.trim().length === 0) return { _empty: true, _raw: "" };
  try {
    return JSON.parse(text);
  } catch {
    return { _invalidJson: true, _raw: text };
  }
}

function cardStyle() {
  return {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    background: "white",
    padding: 18,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  } as const;
}

function computeFulfilled(pack: MeasurePack, values: Record<string, boolean>) {
  const total = pack.items.length;
  const checked = pack.items.reduce(
    (acc, it) => acc + (values[it.key] ? 1 : 0),
    0
  );
  const min = pack.minChecked ?? (total === 2 ? 1 : 2);
  return checked >= min;
}

/**
 * ✅ LISTE COMPLETE DES OBLIGATIONS (IDs = moteur)
 * Group = core | advanced | role
 */
const OBLIGATIONS: MeasurePack[] = [
  // --- CORE (7) ---
  {
    obligationId: "gen-1",
    category: "risk-management",
    title: "Gestion des risques (Art. 9)",
    group: "core",
    items: [
      { key: "policy", label: "Politique IA / gestion des risques écrite" },
      { key: "owners", label: "Rôles & responsabilités définis (RACI)" },
      { key: "review", label: "Revue périodique planifiée" },
    ],
    minChecked: 2,
  },
  {
    obligationId: "data-1",
    category: "data-governance",
    title: "Gouvernance des données (Art. 10)",
    group: "core",
    items: [
      { key: "quality", label: "Contrôles qualité (nettoyage, anomalies…)" },
      { key: "access", label: "Contrôle d’accès aux datasets" },
      { key: "versioning", label: "Versioning des datasets" },
    ],
    minChecked: 2,
  },
  {
    obligationId: "doc-1",
    category: "documentation",
    title: "Documentation & traçabilité (Art. 11–12)",
    group: "core",
    items: [
      { key: "techfile", label: "Dossier technique structuré" },
      { key: "version", label: "Versioning produit / modèle" },
      { key: "audittrail", label: "Traçabilité des décisions clés" },
    ],
    minChecked: 2,
  },
  {
    obligationId: "tra-1",
    category: "transparency",
    title: "Transparence & info utilisateur (Art. 13)",
    group: "core",
    items: [
      { key: "notice", label: "Notice utilisateur disponible" },
      { key: "limits", label: "Limites explicites" },
      { key: "contact", label: "Point de contact / support" },
    ],
    minChecked: 2,
  },
  {
    obligationId: "hum-1",
    category: "human-oversight",
    title: "Supervision humaine (Art. 14)",
    group: "core",
    items: [
      { key: "human", label: "Humain responsable identifié" },
      { key: "override", label: "Possibilité d’override humain" },
      { key: "training", label: "Formation / consignes aux utilisateurs" },
    ],
    minChecked: 2,
  },
  {
    obligationId: "tech-1",
    category: "robustness-security",
    title: "Robustesse & sécurité (Art. 15)",
    group: "core",
    items: [
      { key: "tests", label: "Plan de tests (robustesse / stress)" },
      { key: "fallback", label: "Mode dégradé / fallback défini" },
      { key: "security", label: "Mesures sécurité minimales" },
    ],
    minChecked: 2,
  },
  {
    obligationId: "mon-1",
    category: "post-market",
    title: "Monitoring & incidents (Art. 61–62)",
    group: "core",
    items: [
      { key: "monitor", label: "Monitoring en production" },
      { key: "incident", label: "Process incident défini" },
      { key: "improve", label: "Boucle d’amélioration (post-mortem)" },
    ],
    minChecked: 2,
  },

  // --- ADVANCED (12) ---
  {
    obligationId: "rm-1",
    category: "risk-management",
    title: "Analyse de risques structurée et documentée (Art. 9)",
    group: "advanced",
    items: [
      { key: "riskmap", label: "Cartographie des risques réalisée" },
      { key: "severity", label: "Gravité / probabilité estimées" },
      { key: "mitigation", label: "Mesures de mitigation définies" },
    ],
    minChecked: 2,
  },
  {
    obligationId: "rm-2",
    category: "risk-management",
    title: "Revue périodique du risque & des contrôles (Art. 9)",
    group: "advanced",
    items: [
      { key: "change", label: "Revue déclenchée à chaque changement majeur" },
      { key: "schedule", label: "Revue régulière planifiée" },
      { key: "evidence", label: "Compte-rendu / suivi des actions" },
    ],
    minChecked: 2,
  },
  {
    obligationId: "dg-1",
    category: "data-governance",
    title: "Sources & transformations des données (data lineage) (Art. 10)",
    group: "advanced",
    items: [
      { key: "sources", label: "Sources de données listées et justifiées" },
      { key: "transforms", label: "Transformations documentées" },
      { key: "trace", label: "Lien dataset → modèle / version" },
    ],
    minChecked: 2,
  },
  {
    obligationId: "dg-2",
    category: "data-governance",
    title: "Contrôles biais / représentativité (Art. 10)",
    group: "advanced",
    items: [
      { key: "biasTest", label: "Tests de biais réalisés" },
      { key: "represent", label: "Représentativité vérifiée" },
      { key: "fix", label: "Plan de correction si problème" },
    ],
    minChecked: 2,
  },
  {
    obligationId: "doc-2",
    category: "documentation",
    title:
      "Décrire clairement le système (périmètre, limites, hypothèses) (Art. 11)",
    group: "advanced",
    items: [
      { key: "scope", label: "Périmètre & cas d’usage décrits" },
      { key: "limits", label: "Limites & hypothèses documentées" },
      { key: "inputs", label: "Entrées / sorties / logique expliquées" },
    ],
    minChecked: 2,
  },
  {
    obligationId: "log-1",
    category: "documentation",
    title: "Tenue de logs utile & exploitable (Art. 12)",
    group: "advanced",
    items: [
      { key: "logs", label: "Logs d’usage en place" },
      { key: "retention", label: "Rétention & accès définis" },
      { key: "incidentUse", label: "Logs exploitables en incident" },
    ],
    minChecked: 2,
  },
  {
    obligationId: "tra-2",
    category: "transparency",
    title: "Instructions opérationnelles (usage, limites, escalade) (Art. 13)",
    group: "advanced",
    items: [
      { key: "howto", label: "Instructions d’usage (pas à pas)" },
      { key: "escalate", label: "Quand escalader / passer en manuel" },
      { key: "examples", label: "Exemples d’erreurs & limites" },
    ],
    minChecked: 2,
  },
  {
    obligationId: "ho-1",
    category: "human-oversight",
    title: "Override & workflow de supervision (Art. 14)",
    group: "advanced",
    items: [
      { key: "workflow", label: "Workflow défini (seuils, alertes, escalade)" },
      { key: "ui", label: "Procédure / interface d’override" },
      { key: "trace", label: "Traçabilité des overrides" },
    ],
    minChecked: 2,
  },
  {
    obligationId: "rs-1",
    category: "robustness-security",
    title: "Métriques de performance (accuracy, erreurs) (Art. 15)",
    group: "advanced",
    items: [
      { key: "kpi", label: "KPIs définis (accuracy, FP/FN…)" },
      { key: "threshold", label: "Seuil d’acceptation défini" },
      { key: "tracking", label: "Suivi dans le temps" },
    ],
    minChecked: 2,
  },
  {
    obligationId: "rs-2",
    category: "robustness-security",
    title: "Mesures cybersécurité adaptées (Art. 15)",
    group: "advanced",
    items: [
      { key: "iam", label: "IAM / contrôle d’accès" },
      { key: "secrets", label: "Gestion des secrets" },
      { key: "abuse", label: "Protection contre abus" },
    ],
    minChecked: 2,
  },
  {
    obligationId: "pm-1",
    category: "post-market",
    title: "KPIs & alertes de dérive en production (Art. 61)",
    group: "advanced",
    items: [
      { key: "drift", label: "Détection de dérive (data/perf)" },
      { key: "alerts", label: "Alertes configurées" },
      { key: "register", label: "Registre d’anomalies" },
    ],
    minChecked: 2,
  },
  {
    obligationId: "pm-2",
    category: "post-market",
    title: "Process incident (détection → escalade → correction) (Art. 62)",
    group: "advanced",
    items: [
      { key: "triage", label: "Triage & escalade définis" },
      { key: "contain", label: "Mesures immédiates (containment)" },
      { key: "postmortem", label: "Post-mortem + actions correctives" },
    ],
    minChecked: 2,
  },

  // --- ROLE (6) ---
  // Provider
  {
    obligationId: "prov-1",
    category: "role-obligations",
    title: "Système de gestion de la qualité (provider)",
    group: "role",
    items: [
      { key: "qms", label: "Process qualité défini" },
      { key: "reviews", label: "Revues internes (qualité)" },
      { key: "records", label: "Enregistrements conservés" },
    ],
    minChecked: 2,
  },
  {
    obligationId: "prov-2",
    category: "role-obligations",
    title: "Conformité avant mise sur le marché (provider)",
    group: "role",
    items: [
      { key: "readiness", label: "Checklist conformité avant release" },
      { key: "docsready", label: "Docs prêtes (tech + notice)" },
      { key: "validation", label: "Validation interne signée" },
    ],
    minChecked: 2,
  },
  {
    obligationId: "prov-3",
    category: "role-obligations",
    title: "Changements & versions (provider)",
    group: "role",
    items: [
      { key: "versioning", label: "Versioning maîtrisé" },
      { key: "approval", label: "Validation avant changement majeur" },
      { key: "rollback", label: "Rollback possible" },
    ],
    minChecked: 2,
  },
  // Deployer
  {
    obligationId: "dep-1",
    category: "role-obligations",
    title: "Utilisation conforme aux instructions (deployer)",
    group: "role",
    items: [
      { key: "follow", label: "Usage conforme aux instructions" },
      { key: "context", label: "Contexte de déploiement documenté" },
      { key: "controls", label: "Contrôles d’usage en place" },
    ],
    minChecked: 2,
  },
  {
    obligationId: "dep-2",
    category: "role-obligations",
    title: "Supervision humaine en contexte (deployer)",
    group: "role",
    items: [
      { key: "train", label: "Formation des utilisateurs" },
      { key: "procedures", label: "Procédures de supervision" },
      { key: "override", label: "Override en production possible" },
    ],
    minChecked: 2,
  },
  {
    obligationId: "dep-3",
    category: "role-obligations",
    title: "Surveiller et remonter les incidents (deployer)",
    group: "role",
    items: [
      { key: "monitor", label: "Surveillance en usage réel" },
      { key: "report", label: "Process de remontée incident" },
      { key: "record", label: "Registre des incidents" },
    ],
    minChecked: 2,
  },
];
export default function AuditPage() {
  const router = useRouter();
  const card = cardStyle();

  const [systemName, setSystemName] = useState<string>("");
  const [howUsed, setHowUsed] = useState<string>("");
  const [dataUsed, setDataUsed] = useState<string>("");

  const [role, setRole] = useState<Role>("deployer");
  const [sector, setSector] = useState<Sector>("generic");

  const [affectsRights, setAffectsRights] = useState<boolean>(false);
  const [safetyCritical, setSafetyCritical] = useState<boolean>(false);
  const [vulnerableGroups, setVulnerableGroups] = useState<boolean>(false);
  const [biometric, setBiometric] = useState<boolean>(false);

  const [annexEmployment, setAnnexEmployment] = useState<boolean>(false);
  const [annexEducation, setAnnexEducation] = useState<boolean>(false);
  const [annexEssentialServices, setAnnexEssentialServices] =
    useState<boolean>(false);
  const [annexJustice, setAnnexJustice] = useState<boolean>(false);
  const [annexLawEnforcement, setAnnexLawEnforcement] =
    useState<boolean>(false);
  const [annexMigration, setAnnexMigration] = useState<boolean>(false);
  const [annexCriticalInfra, setAnnexCriticalInfra] = useState<boolean>(false);

  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // ✅ Etat des sous-mesures pour TOUTES les obligations (même si cachées)
  const [preMeasures, setPreMeasures] = useState<
    Record<string, Record<string, boolean>>
  >(() => {
    const init: Record<string, Record<string, boolean>> = {};
    for (const pack of OBLIGATIONS) {
      init[pack.obligationId] = {};
      for (const it of pack.items) init[pack.obligationId][it.key] = false;
    }
    return init;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAuditId, setSavedAuditId] = useState<string | null>(null);


  // ✅ NOUVEAU: stocke l’ID d’audit sauvegardé (pour bandeau vert)


  // ✅ au chargement, si on avait déjà un audit sauvegardé, on peut l’afficher
  useEffect(() => {
    try {
      const prev = sessionStorage.getItem("concordia:lastSavedAuditId");
      if (prev) setSavedAuditId(prev);
    } catch {
      // ignore
    }
  }, []);

  const system: AiSystem = useMemo(() => {
    const useCaseName = systemName?.trim().length
      ? systemName.trim()
      : "Système IA (non nommé)";

    const uc: UseCase = {
      id: "uc_" + Math.random().toString(16).slice(2),
      name: useCaseName,
      sector,

      affectsRights,
      safetyCritical,
      vulnerableGroups,
      biometric,

      usesSubliminalTechniques: false,
      exploitsVulnerabilities: false,
      socialScoring: false,
      predictivePolicing: false,
      realTimeBiometricIdentification: false,

      usesChatbot: false,
      usesEmotionRecognition: false,
      isDeepfake: false,

      isEmploymentUseCase: annexEmployment,
      isEducationUseCase: annexEducation,
      isAccessToEssentialServices: annexEssentialServices,
      isJusticeUseCase: annexJustice,
      isLawEnforcementUseCase: annexLawEnforcement,
      isMigrationUseCase: annexMigration,
      isCriticalInfrastructure: annexCriticalInfra,

      users: ["internal_user"],
      countries: ["FR"],
    };

    return {
      id: "sys_" + Math.random().toString(16).slice(2),
      name: systemName?.trim().length ? systemName.trim() : "Concordia Audit",
      role,
      entityType: role,
      useCases: [uc],
    };
  }, [
    systemName,
    role,
    sector,
    affectsRights,
    safetyCritical,
    vulnerableGroups,
    biometric,
    annexEmployment,
    annexEducation,
    annexEssentialServices,
    annexJustice,
    annexLawEnforcement,
    annexMigration,
    annexCriticalInfra,
  ]);

  // ✅ Fulfillments calculés pour TOUTES les obligations
  const fulfillments = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const pack of OBLIGATIONS) {
      const values = preMeasures[pack.obligationId] || {};
      map[pack.obligationId] = computeFulfilled(pack, values);
    }
    return map;
  }, [preMeasures]);

  // ✅ Stats
  const stats = useMemo(() => {
    const total = OBLIGATIONS.length;
    const ok = OBLIGATIONS.reduce(
      (acc, p) => acc + (fulfillments[p.obligationId] ? 1 : 0),
      0
    );

    const evaluated = OBLIGATIONS.reduce((acc, p) => {
      const vals = preMeasures[p.obligationId] || {};
      const any = Object.values(vals).some(Boolean);
      return acc + (any ? 1 : 0);
    }, 0);

    return {
      total,
      ok,
      todo: total - ok,
      evaluated,
      notEvaluated: total - evaluated,
    };
  }, [fulfillments, preMeasures]);

  const visibleObligations = useMemo(() => {
    const core = OBLIGATIONS.filter((o) => o.group === "core");
    const advanced = OBLIGATIONS.filter((o) => o.group === "advanced");
    const rolePacks = OBLIGATIONS.filter((o) => o.group === "role").filter(
      (o) => {
        if (role === "provider") return o.obligationId.startsWith("prov-");
        return o.obligationId.startsWith("dep-");
      }
    );

    if (!showAdvanced) return [...core, ...rolePacks];
    return [...core, ...advanced, ...rolePacks];
  }, [showAdvanced, role]);

  function togglePreMeasure(obligationId: string, key: string, checked: boolean) {
    setPreMeasures((prev) => ({
      ...prev,
      [obligationId]: {
        ...(prev[obligationId] || {}),
        [key]: checked,
      },
    }));
  }

  function prefillSocleMinimum() {
    setPreMeasures((prev) => {
      const next = structuredClone(prev);
      for (const pack of OBLIGATIONS.filter((o) => o.group === "core")) {
        const keys = pack.items.map((i) => i.key);
        for (const k of keys) next[pack.obligationId][k] = false;
        if (keys[0]) next[pack.obligationId][keys[0]] = true;
        if (keys[1]) next[pack.obligationId][keys[1]] = true;
      }
      return next;
    });
  }

  function clearMeasures() {
    setPreMeasures(() => {
      const next: Record<string, Record<string, boolean>> = {};
      for (const pack of OBLIGATIONS) {
        next[pack.obligationId] = {};
        for (const it of pack.items) next[pack.obligationId][it.key] = false;
      }
      return next;
    });
  }

  async function launchAudit() {
    setLoading(true);
    setError(null);

    try {
      if (!systemName.trim()) throw new Error("Renseigne le nom du système IA.");

    const res = await fetch("/api/audit", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    system: {
      ...system,
      description: howUsed,
      dataDescription: dataUsed,
    },
    fulfillments,
  }),
});

      const data = await safeReadJson(res);

      // ✅ mémorise l’auditId si l’API le renvoie
      if (data?.auditId) {
        setSavedAuditId(String(data.auditId));
        sessionStorage.setItem("concordia:lastSavedAuditId", String(data.auditId));
      } else {
        setSavedAuditId(null);
        sessionStorage.removeItem("concordia:lastSavedAuditId");
      }

      if (!res.ok) {
        const raw =
          data && (data.error || data._raw) ? String(data.error || data._raw) : "";
        throw new Error(
          `Erreur API (${res.status}) lors de l'audit.\n` +
            (raw ? `Réponse: ${raw}` : "Réponse vide ou non-JSON.")
        );
      }

      if (!data?.ok || !data?.result) {
        throw new Error(
          `Réponse inattendue de l’API.\nReçu: ${JSON.stringify(data)}`
        );
      }

      // ✅ On garde tout en sessionStorage pour le report
      sessionStorage.setItem("concordia:lastAuditSystem", JSON.stringify(system));
      sessionStorage.setItem("concordia:lastAuditResult", JSON.stringify(data.result));
      sessionStorage.setItem("concordia:lastAuditFulfillments", JSON.stringify(fulfillments));
      sessionStorage.setItem("concordia:lastAuditPreMeasures", JSON.stringify(preMeasures));

      // ✅ On passe l'auditId au report (bandeau vert garanti)
      const q = data?.auditId
        ? `?auditId=${encodeURIComponent(String(data.auditId))}`
        : "";
      router.push(`/dashboard/report${q}`);
    } catch (e: any) {
      setError(e?.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 32 }}>
      <div style={{ marginBottom: 14 }}>
        <h1 style={{ fontSize: 26, fontWeight: 950, margin: 0 }}>Audit IA</h1>
        <div style={{ color: "#6b7280", fontSize: 13, marginTop: 6 }}>
          Décris ton système IA, choisis le rôle, le secteur et les facteurs de risque.
          Concordia applique le moteur IA Act et génère un rapport structuré.
        </div>
      </div>

      {/* ✅ Bandeau vert si audit sauvegardé */}
      <AuditSavedBanner auditId={savedAuditId} />

      {error ? (
        <div style={{ ...card, borderLeft: "4px solid #ef4444", marginBottom: 14 }}>
          <div style={{ fontWeight: 950, marginBottom: 8 }}>Erreur</div>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: 13 }}>{error}</pre>
        </div>
      ) : null}

      {savedAuditId ? <AuditSavedBanner auditId={savedAuditId} /> : null}


      <div style={card}>
        {/* Nom */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: "#111827", fontWeight: 900, marginBottom: 6 }}>
            Nom du système IA{" "}
            <span style={{ color: "#6b7280" }}>
              (ex : tri de CV marketing, assistant décision judiciaire…)
            </span>
          </div>
          <input
            value={systemName}
            onChange={(e) => setSystemName(e.target.value)}
            placeholder="Nom interne du système"
            style={{
              width: "100%",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              padding: "11px 12px",
              fontSize: 14,
              outline: "none",
            }}
          />
        </div>

        {/* Texte 1 */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: "#111827", fontWeight: 900, marginBottom: 6 }}>
            Décris concrètement comment l’IA est utilisée
          </div>
          <textarea
            value={howUsed}
            onChange={(e) => setHowUsed(e.target.value)}
            placeholder="Ex : L’IA classe automatiquement les dossiers de candidats selon un score de pertinence pour prioriser les entretiens."
            rows={4}
            style={{
              width: "100%",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              padding: "11px 12px",
              fontSize: 14,
              outline: "none",
              resize: "vertical",
            }}
          />
        </div>

        {/* Texte 2 */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: "#111827", fontWeight: 900, marginBottom: 6 }}>
            Décris les données utilisées{" "}
            <span style={{ color: "#6b7280" }}>(sources, types, personnes concernées)</span>
          </div>
          <textarea
            value={dataUsed}
            onChange={(e) => setDataUsed(e.target.value)}
            placeholder="Ex : CV, lettres de motivation, historique d’entretiens, données RH internes…"
            rows={4}
            style={{
              width: "100%",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              padding: "11px 12px",
              fontSize: 14,
              outline: "none",
              resize: "vertical",
            }}
          />
        </div>

        {/* Selects */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: "#111827", fontWeight: 900, marginBottom: 6 }}>Rôle</div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              style={{
                width: "100%",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: "11px 12px",
                background: "white",
                fontSize: 14,
              }}
            >
              <option value="deployer">Déployeur (utilisateur du système)</option>
              <option value="provider">Provider (fournisseur)</option>
            </select>
          </div>

          <div>
            <div style={{ fontSize: 12, color: "#111827", fontWeight: 900, marginBottom: 6 }}>
              Secteur principal
            </div>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value as Sector)}
              style={{
                width: "100%",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: "11px 12px",
                background: "white",
                fontSize: 14,
              }}
            >
              <option value="generic">Non précisé / générique</option>
              <option value="employment">Emploi / recrutement</option>
              <option value="hr">RH</option>
              <option value="education">Éducation</option>
              <option value="health">Santé</option>
              <option value="finance">Finance</option>
              <option value="justice">Justice</option>
              <option value="law-enforcement">Forces de l’ordre</option>
              <option value="migration">Migration / frontières</option>
              <option value="critical-infra">Infrastructures critiques</option>
              <option value="services">Services essentiels</option>
              <option value="public">Public</option>
            </select>
          </div>
        </div>

        {/* Checkboxes */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: "#111827", fontWeight: 900, marginBottom: 8 }}>
              Facteurs de risque généraux
            </div>

            <label style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
              <input type="checkbox" checked={affectsRights} onChange={(e) => setAffectsRights(e.target.checked)} />
              <span style={{ fontSize: 13 }}>Impact possible sur les droits fondamentaux</span>
            </label>

            <label style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
              <input type="checkbox" checked={safetyCritical} onChange={(e) => setSafetyCritical(e.target.checked)} />
              <span style={{ fontSize: 13 }}>Contexte critique pour la sécurité</span>
            </label>

            <label style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
              <input type="checkbox" checked={vulnerableGroups} onChange={(e) => setVulnerableGroups(e.target.checked)} />
              <span style={{ fontSize: 13 }}>Implique des groupes vulnérables</span>
            </label>

            <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input type="checkbox" checked={biometric} onChange={(e) => setBiometric(e.target.checked)} />
              <span style={{ fontSize: 13 }}>Utilise des données biométriques</span>
            </label>
          </div>

          <div>
            <div style={{ fontSize: 12, color: "#2563eb", fontWeight: 950, marginBottom: 8 }}>
              Signaux IA Act (Annexe III)
            </div>

            <label style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
              <input type="checkbox" checked={annexEmployment} onChange={(e) => setAnnexEmployment(e.target.checked)} />
              <span style={{ fontSize: 13 }}>Emploi / recrutement / RH</span>
            </label>

            <label style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
              <input type="checkbox" checked={annexEducation} onChange={(e) => setAnnexEducation(e.target.checked)} />
              <span style={{ fontSize: 13 }}>Éducation / orientation</span>
            </label>

            <label style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
              <input
                type="checkbox"
                checked={annexEssentialServices}
                onChange={(e) => setAnnexEssentialServices(e.target.checked)}
              />
              <span style={{ fontSize: 13 }}>Accès à des services essentiels (crédit, assurance…)</span>
            </label>

            <label style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
              <input type="checkbox" checked={annexJustice} onChange={(e) => setAnnexJustice(e.target.checked)} />
              <span style={{ fontSize: 13 }}>Justice / décisions judiciaires</span>
            </label>

            <label style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
              <input
                type="checkbox"
                checked={annexLawEnforcement}
                onChange={(e) => setAnnexLawEnforcement(e.target.checked)}
              />
              <span style={{ fontSize: 13 }}>Forces de l’ordre / maintien de l’ordre</span>
            </label>

            <label style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
              <input type="checkbox" checked={annexMigration} onChange={(e) => setAnnexMigration(e.target.checked)} />
              <span style={{ fontSize: 13 }}>Migration / frontières / asile</span>
            </label>

            <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={annexCriticalInfra}
                onChange={(e) => setAnnexCriticalInfra(e.target.checked)}
              />
              <span style={{ fontSize: 13 }}>Infrastructures critiques</span>
            </label>
          </div>
        </div>

        {/* Controls + stats */}
        <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 950 }}>Mesures déjà en place</div>
              <div style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>
                Une obligation est considérée “OK” si tu coches <strong>au moins 2 mesures</strong> sur 3.
              </div>
              <div style={{ marginTop: 8, color: "#6b7280", fontSize: 12, fontWeight: 900 }}>
                OK : {stats.ok}/{stats.total} • À faire : {stats.todo} • Évaluées : {stats.evaluated}/{stats.total}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={prefillSocleMinimum}
                style={{
                  border: "1px solid #e5e7eb",
                  background: "white",
                  borderRadius: 10,
                  padding: "8px 10px",
                  cursor: "pointer",
                  fontWeight: 900,
                  fontSize: 13,
                }}
              >
                Pré-remplir (socle minimum)
              </button>

              <button
                type="button"
                onClick={clearMeasures}
                style={{
                  border: "1px solid #e5e7eb",
                  background: "white",
                  borderRadius: 10,
                  padding: "8px 10px",
                  cursor: "pointer",
                  fontWeight: 900,
                  fontSize: 13,
                }}
              >
                Tout décocher
              </button>

              <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                style={{
                  background: showAdvanced ? "#111827" : "#2563eb",
                  color: "white",
                  borderRadius: 10,
                  padding: "8px 10px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 950,
                  fontSize: 13,
                }}
              >
                {showAdvanced ? "Masquer avancé" : "Afficher avancé (+15)"}
              </button>
            </div>
          </div>

          {/* Obligations visible */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
            {visibleObligations.map((pack) => {
              const ok = fulfillments[pack.obligationId];
              return (
                <div
                  key={pack.obligationId}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    padding: 12,
                    background: "#fafafa",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                    <div style={{ fontWeight: 950, fontSize: 13 }}>{pack.title}</div>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 950,
                        background: ok ? "#16a34a" : "#ef4444",
                        color: "white",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {ok ? "OK" : "À faire"}
                    </span>
                  </div>

                  <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                    {pack.items.map((it) => {
                      const checked = !!preMeasures[pack.obligationId]?.[it.key];
                      return (
                        <label
                          key={it.key}
                          style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "flex-start",
                            border: "1px solid #e5e7eb",
                            borderRadius: 10,
                            padding: 10,
                            background: "white",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) =>
                              togglePreMeasure(pack.obligationId, it.key, e.target.checked)
                            }
                            style={{ marginTop: 3 }}
                          />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 900 }}>{it.label}</div>
                            {it.hint ? (
                              <div style={{ color: "#6b7280", fontSize: 12 }}>{it.hint}</div>
                            ) : null}
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: 10, fontSize: 12, color: "#6b7280" }}>
                    Catégorie : <strong>{pack.category}</strong> • Obligation :{" "}
                    <strong>{pack.obligationId}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div style={{ marginTop: 16 }}>
          <button
            onClick={launchAudit}
            disabled={loading}
            style={{
              background: "#2563eb",
              color: "white",
              borderRadius: 10,
              padding: "10px 14px",
              border: "none",
              cursor: "pointer",
              fontWeight: 950,
            }}
          >
            {loading ? "Audit..." : "Lancer l’audit"}
          </button>
        </div>
      </div>
    </div>
  );
}
