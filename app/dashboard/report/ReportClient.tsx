// app/dashboard/report/ReportClient.tsx
"use client";

import AuditSavedBanner from "@/components/concordia/AuditSavedBanner";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MEASURES, type MeasurePack } from "@/domain/concordia/measures";

type GlobalDecision = {
  level: "CRITIQUE" | "IMPORTANT" | "À AMÉLIORER" | "OK" | "HORS PÉRIMÈTRE";
  title: string;
  message: string;
  pillStyle: ReturnType<typeof pill>;
};

type ApiAuditResponse =
  | {
      ok: true;
      audit: { id: string; type: string; createdAt: string; input: any; result: any };
    }
  | { ok: false; error: string; details?: any };

function pill(bg: string, color = "white") {
  return {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    background: bg,
    color,
    lineHeight: "18px",
    whiteSpace: "nowrap" as const,
  } as const;
}

function complianceLabel(v?: string) {
  if (v === "unlikely") return { text: "Peu probable", style: pill("#ef4444") };
  if (v === "likely") return { text: "Probable", style: pill("#16a34a") };
  return { text: "Incertain", style: pill("#f59e0b", "#111827") };
}

function maturityFromScore(score: number) {
  if (score >= 90)
    return {
      label: "Conforme (très solide)",
      desc: "Couverture quasi complète des exigences applicables.",
      tag: pill("#16a34a"),
    };
  if (score >= 75)
    return {
      label: "Quasi conforme",
      desc: "Bon niveau. Quelques points structurants à compléter.",
      tag: pill("#22c55e"),
    };
  if (score >= 55)
    return {
      label: "Partiellement conforme",
      desc: "Socle présent, mais plusieurs exigences manquent.",
      tag: pill("#f59e0b", "#111827"),
    };
  if (score >= 30)
    return {
      label: "Faible conformité",
      desc: "Mesures isolées. Risque de non-conformité élevé.",
      tag: pill("#fb923c"),
    };
  return {
    label: "Non conforme (à ce stade)",
    desc: "Aucune mesure indiquée comme en place.",
    tag: pill("#ef4444"),
  };
}

function statusPill(systemStatus: string) {
  if (systemStatus === "prohibited") return pill("#111827");
  if (systemStatus === "high-risk") return pill("#ef4444");
  if (systemStatus === "gpai-systemic") return pill("#7c3aed");
  if (systemStatus === "gpai") return pill("#6366f1");
  if (systemStatus === "normal") return pill("#6b7280");
  if (systemStatus === "excluded") return pill("#2563eb");
  if (systemStatus === "out-of-scope") return pill("#6b7280");
  return pill("#6b7280");
}

function computeFulfilledFromSubMeasures(pack: MeasurePack, values: Record<string, boolean>) {
  const total = pack.items.length;
  const checked = pack.items.reduce((acc, it) => acc + (values[it.key] ? 1 : 0), 0);
  const min = pack.minChecked ?? (total === 2 ? 1 : 2);
  return checked >= min;
}

function prettyCategory(cat: string) {
  return String(cat).replace(/-/g, " ");
}

function complianceBand(score: number) {
  if (score < 40) return "low";
  if (score < 60) return "partial";
  if (score < 80) return "medium";
  return "good";
}

function computeGlobalDecision(systemStatus: string, score: number): GlobalDecision {
  const band = complianceBand(score);

  if (systemStatus === "out-of-scope" || systemStatus === "excluded") {
    return {
      level: "HORS PÉRIMÈTRE",
      title: "Hors périmètre IA Act (selon les infos fournies)",
      message:
        "Le règlement IA Act ne semble pas s’appliquer à ce système. Vérifie quand même la qualification si le contexte change.",
      pillStyle: pill("#6b7280"),
    };
  }

  if (systemStatus === "prohibited") {
    return {
      level: "CRITIQUE",
      title: "Cas potentiellement interdit",
      message:
        "Stop : requalifie le cas d’usage et redesign le système avant toute mise en production. La conformité ne résout pas un cas interdit.",
      pillStyle: pill("#111827"),
    };
  }

  if (systemStatus === "high-risk") {
    if (score < 60) {
      return {
        level: "CRITIQUE",
        title: "High-risk + conformité insuffisante",
        message:
          "Priorité : compléter les obligations IA Act manquantes (documentation, données, supervision, robustesse, monitoring) avant d’aller plus loin.",
        pillStyle: pill("#ef4444"),
      };
    }
    if (score < 80) {
      return {
        level: "IMPORTANT",
        title: "High-risk : encore des points structurants",
        message:
          "Tu es sur la bonne voie, mais il reste des exigences majeures. Utilise le plan d’action pour traiter les obligations les plus lourdes d’abord.",
        pillStyle: pill("#f59e0b", "#111827"),
      };
    }
    return {
      level: "OK",
      title: "High-risk : bon niveau (surveillance requise)",
      message:
        "Bon niveau de conformité. À maintenir : monitoring, gestion d’incidents, revue périodique, et preuves de suivi.",
      pillStyle: pill("#16a34a"),
    };
  }

  if (systemStatus === "gpai-systemic") {
    if (score < 70) {
      return {
        level: "CRITIQUE",
        title: "GPAI systémique : conformité insuffisante",
        message:
          "Risque structurel élevé : remonte rapidement le niveau de conformité sur gouvernance, transparence, documentation et monitoring.",
        pillStyle: pill("#ef4444"),
      };
    }
    return {
      level: "IMPORTANT",
      title: "GPAI systémique : exigences fortes",
      message:
        "Niveau correct mais vigilance renforcée : documentation, transparence, gestion des risques et suivi continu.",
      pillStyle: pill("#f59e0b", "#111827"),
    };
  }

  if (systemStatus === "gpai") {
    if (score < 60) {
      return {
        level: "IMPORTANT",
        title: "GPAI : conformité à renforcer",
        message:
          "Renforce en priorité transparence, documentation et gouvernance. Objectif : rendre le système auditable et explicable.",
        pillStyle: pill("#f59e0b", "#111827"),
      };
    }
    return {
      level: "À AMÉLIORER",
      title: "GPAI : base correcte",
      message:
        "Tu as un socle. Continue à compléter les obligations restantes pour stabiliser la conformité et éviter les angles morts.",
      pillStyle: pill("#fb923c"),
    };
  }

  if (band === "low") {
    return {
      level: "À AMÉLIORER",
      title: "Conformité faible",
      message:
        "Ce système n’est pas high-risk, mais ton niveau de conformité est bas : mets en place le minimum (docs, transparence, supervision, monitoring).",
      pillStyle: pill("#fb923c"),
    };
  }

  return {
    level: "OK",
    title: "Niveau acceptable",
    message:
      "Risque réglementaire modéré. Continue l’amélioration : complète les obligations restantes pour renforcer la robustesse et la traçabilité.",
    pillStyle: pill("#16a34a"),
  };
}



export default function ReportClient() {

  const router = useRouter();
  const searchParams = useSearchParams();

  const [system, setSystem] = useState<any>(null);
  const [result, setResult] = useState<any>(null);

  const [auditId, setAuditId] = useState<string | null>(null);
  const [loadingFromDb, setLoadingFromDb] = useState(false);

  const [subMeasuresState, setSubMeasuresState] = useState<Record<string, Record<string, boolean>>>({});
  const [recalcLoading, setRecalcLoading] = useState(false);

  const styles = useMemo(() => {
    const card = {
      border: "1px solid #e5e7eb",
      borderRadius: 10,
      background: "#fff",
      padding: 18,
      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      marginBottom: 16,
    };

    const subtle = {
      color: "#6b7280",
      fontSize: 12,
      fontWeight: 900,
      letterSpacing: 0.3,
    };

    const h1 = { fontSize: 22, fontWeight: 950 as any, marginBottom: 4 };
    const h2 = { fontSize: 16, fontWeight: 950 as any, marginBottom: 10 };
    const h3 = { fontSize: 13, fontWeight: 950 as any, marginBottom: 8 };

    return { card, subtle, h1, h2, h3 };
  }, []);

  useEffect(() => {
    const fromUrl = searchParams?.get("auditId");

    const fromSession =
      sessionStorage.getItem("concordia:lastSavedAuditId") || sessionStorage.getItem("concordia:lastAuditId");

    const finalAuditId = fromUrl || fromSession || null;
    setAuditId(finalAuditId);

    async function loadFromDb(id: string) {
      setLoadingFromDb(true);
      try {
        const res = await fetch(`/api/audit/${encodeURIComponent(id)}`, { method: "GET" });
        const text = await res.text();
        const data: ApiAuditResponse = text ? JSON.parse(text) : (null as any);

        if (!res.ok || !data || (data as any).ok !== true) {
          throw new Error((data as any)?.error || `Erreur chargement audit (${res.status})`);
        }

        const audit = (data as any).audit;
        const sys = audit?.input?.system ?? audit?.input ?? null;
        const engineRes = audit?.result ?? null;

        if (!sys || !engineRes) {
          throw new Error("Audit invalide : input/system ou result manquant.");
        }

        setSystem(sys);
        setResult(engineRes);

        sessionStorage.setItem("concordia:lastAuditSystem", JSON.stringify(sys));
        sessionStorage.setItem("concordia:lastAuditResult", JSON.stringify(engineRes));
        sessionStorage.setItem("concordia:lastSavedAuditId", String(id));
        sessionStorage.setItem("concordia:lastAuditId", String(id));

        let pre: Record<string, Record<string, boolean>> | null = null;
        try {
          const raw = sessionStorage.getItem("concordia:lastAuditPreMeasures");
          if (raw) pre = JSON.parse(raw);
        } catch {
          pre = null;
        }

        const initial: Record<string, Record<string, boolean>> = {};
        for (const uc of engineRes?.useCases || []) {
          for (const o of uc?.appliedObligations || []) {
            const obligationId = String(o.obligationId);
            const pack = (MEASURES as any)[obligationId];
            if (!pack) continue;

            if (!initial[obligationId]) {
              initial[obligationId] = {};
              for (const item of pack.items) {
                const fromPre = pre?.[obligationId]?.[item.key];
                initial[obligationId][item.key] = !!fromPre;
              }
            }
          }
        }

        setSubMeasuresState(initial);
      } catch (e: any) {
        alert(e?.message || "Erreur chargement audit");
        router.push("/dashboard/audits");
      } finally {
        setLoadingFromDb(false);
      }
    }

    if (fromUrl) {
      loadFromDb(fromUrl);
      return;
    }

    const s = sessionStorage.getItem("concordia:lastAuditSystem");
    const r = sessionStorage.getItem("concordia:lastAuditResult");

    if (!s || !r) {
      router.push("/dashboard/audit");
      return;
    }

    const sys = JSON.parse(s);
    const res = JSON.parse(r);

    setSystem(sys);
    setResult(res);

    let pre: Record<string, Record<string, boolean>> | null = null;
    try {
      const raw = sessionStorage.getItem("concordia:lastAuditPreMeasures");
      if (raw) pre = JSON.parse(raw);
    } catch {
      pre = null;
    }

    const initial: Record<string, Record<string, boolean>> = {};
    for (const uc of res?.useCases || []) {
      for (const o of uc?.appliedObligations || []) {
        const obligationId = String(o.obligationId);
        const pack = (MEASURES as any)[obligationId];
        if (!pack) continue;

        if (!initial[obligationId]) {
          initial[obligationId] = {};
          for (const item of pack.items) {
            const fromPre = pre?.[obligationId]?.[item.key];
            initial[obligationId][item.key] = !!fromPre;
          }
        }
      }
    }

    setSubMeasuresState(initial);
  }, [router, searchParams]);

  const safeResult = result ?? {
    systemName: "",
    systemStatus: "normal",
    riskTier: "LOW",
    statusReason: "",
    systemRiskReasons: [],
    useCases: [],
    score: { overallScore: 0, byCategory: {} },
  };

  const safeUseCases: any[] = Array.isArray(safeResult.useCases) ? safeResult.useCases : [];

  const fulfillments = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const uc of safeUseCases) {
      for (const o of uc?.appliedObligations || []) {
        const obligationId = String(o.obligationId);
        const pack = (MEASURES as any)[obligationId];
        if (!pack) {
          if (map[obligationId] === undefined) map[obligationId] = false;
          continue;
        }
        const values = subMeasuresState[obligationId] || {};
        map[obligationId] = computeFulfilledFromSubMeasures(pack, values);
      }
    }
    return map;
  }, [safeUseCases, subMeasuresState]);

  const measuresStats = useMemo(() => {
    const ids = new Set<string>();

    for (const uc of safeUseCases) {
      for (const o of uc?.appliedObligations || []) {
        ids.add(String(o.obligationId));
      }
    }

    let ok = 0;
    let evaluated = 0;

    ids.forEach((id) => {
      if (fulfillments[id]) ok += 1;

      const sub = subMeasuresState[id];
      if (sub && Object.values(sub).some(Boolean)) {
        evaluated += 1;
      }
    });

    return {
      total: ids.size,
      ok,
      todo: Math.max(0, ids.size - ok),
      evaluated,
      notEvaluated: Math.max(0, ids.size - evaluated),
    };
  }, [safeUseCases, fulfillments, subMeasuresState]);

  const nonEvaluatedIds = useMemo(() => {
    const ids: string[] = [];
    for (const uc of safeUseCases) {
      for (const o of uc?.appliedObligations || []) {
        const id = String(o.obligationId);
        const pack = (MEASURES as any)[id];
        if (!pack) continue;

        const sub = subMeasuresState[id];
        const anyChecked = sub ? Object.values(sub).some(Boolean) : false;
        if (!anyChecked) ids.push(id);
      }
    }
    return Array.from(new Set(ids));
  }, [safeUseCases, subMeasuresState]);

  function scrollToObligation(obligationId: string) {
    const el = document.getElementById(`ob-${obligationId}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function scrollToFirstNonEvaluated() {
    const first = nonEvaluatedIds[0];
    if (first) scrollToObligation(first);
  }

  const actionPlan = useMemo(() => {
    type Item = {
      obligationId: string;
      label: string;
      category: string;
      weight: number;
      estimatedCompliance?: string;
      complianceReason?: string;
      useCaseName?: string;
    };

    const mapById = new Map<string, Item>();

    for (const uc of safeUseCases) {
      for (const o of uc?.appliedObligations || []) {
        const obligationId = String(o.obligationId);
        const isOk = !!fulfillments[obligationId];
        if (isOk) continue;

        const existing = mapById.get(obligationId);
        const weight = Number(o.weight ?? 0);

        if (!existing || weight > existing.weight) {
          mapById.set(obligationId, {
            obligationId,
            label: String(o.label ?? obligationId),
            category: String(o.category ?? "unknown"),
            weight,
            estimatedCompliance: o.estimatedCompliance,
            complianceReason: o.complianceReason,
            useCaseName: uc?.useCaseName,
          });
        }
      }
    }

    const all = Array.from(mapById.values()).sort((a, b) => b.weight - a.weight);
    const topGlobal = all.slice(0, 5);

    return { all, topGlobal };
  }, [safeUseCases, fulfillments]);

  async function recalcWithMeasures() {
    if (!system) return;
    setRecalcLoading(true);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system, fulfillments }),
      });

      const text = await res.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (!res.ok) {
        throw new Error(
          `Erreur API (${res.status}) lors du recalcul.\n` +
            (data?.error ? `Réponse: ${data.error}` : text ? `Réponse: ${text}` : "Réponse vide.")
        );
      }

      if (!data?.ok || !data?.result) {
        throw new Error(`Réponse inattendue du recalcul: ${text || "(vide)"}`);
      }

      sessionStorage.setItem("concordia:lastAuditResult", JSON.stringify(data.result));
      setResult(data.result);

      sessionStorage.setItem("concordia:lastAuditPreMeasures", JSON.stringify(subMeasuresState));
      sessionStorage.setItem("concordia:lastAuditFulfillments", JSON.stringify(fulfillments));

      if (data?.auditId) {
        sessionStorage.setItem("concordia:lastSavedAuditId", String(data.auditId));
        sessionStorage.setItem("concordia:lastAuditId", String(data.auditId));
        setAuditId(String(data.auditId));
      }
    } catch (e: any) {
      alert(e?.message || "Erreur recalcul");
    } finally {
      setRecalcLoading(false);
    }
  }

  function toggleSubMeasure(obligationId: string, key: string, checked: boolean) {
    setSubMeasuresState((prev) => ({
      ...prev,
      [obligationId]: {
        ...(prev[obligationId] || {}),
        [key]: checked,
      },
    }));
  }

  if (!result || loadingFromDb) {
    return (
      <div style={{ maxWidth: 980, margin: "0 auto", padding: 32 }}>
        <div style={styles.card}>
          <div style={{ fontWeight: 950, marginBottom: 6 }}>
            {loadingFromDb ? "Chargement de l’audit depuis la base…" : "Chargement du rapport…"}
          </div>
          <div style={{ color: "#6b7280", fontSize: 13 }}>
            Si ça reste bloqué, relance un audit depuis <strong>/dashboard/audit</strong>.
          </div>
        </div>
      </div>
    );
  }

  const score = Number(safeResult?.score?.overallScore ?? 0);
  const maturity = maturityFromScore(score);
  const decision = computeGlobalDecision(String(safeResult.systemStatus), score);

  const explanation =
    score === 0
      ? {
          title: "Pourquoi le score peut être à 0 ?",
          text:
            "Le score mesure la conformité (mesures en place), pas le niveau de risque. " +
            "Si aucune mesure n’est cochée, la conformité affichée est à 0 même si le système est classé à haut risque.",
        }
      : null;

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 32 }}>
      {auditId ? (
        <div style={{ marginBottom: 12 }}>
          <AuditSavedBanner auditId={auditId} />
        </div>
      ) : null}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <h1 style={styles.h1}>Rapport Concordia</h1>
          <div style={{ color: "#6b7280", fontSize: 13 }}>
            Analyse complète du système : {system?.name || safeResult.systemName}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {nonEvaluatedIds.length > 0 ? (
            <button
              onClick={scrollToFirstNonEvaluated}
              style={{
                border: "1px solid #e5e7eb",
                background: "white",
                borderRadius: 8,
                padding: "8px 10px",
                cursor: "pointer",
                fontWeight: 900,
              }}
            >
              Voir obligations non évaluées ({nonEvaluatedIds.length})
            </button>
          ) : null}

          <button
            onClick={recalcWithMeasures}
            disabled={recalcLoading}
            style={{
              background: "#2563eb",
              color: "white",
              borderRadius: 8,
              padding: "8px 12px",
              border: "none",
              cursor: "pointer",
              fontWeight: 950 as any,
            }}
          >
            {recalcLoading ? "Recalcul..." : "Recalculer (mesures)"}
          </button>

          <button
            onClick={() => router.push("/dashboard/audit")}
            style={{
              border: "1px solid #e5e7eb",
              background: "white",
              borderRadius: 8,
              padding: "8px 10px",
              cursor: "pointer",
              fontWeight: 900,
            }}
          >
            ← Modifier l’audit
          </button>
        </div>
      </div>

      {/* Décision globale */}
      <div
        style={{
          marginTop: 14,
          border: "1px solid #e5e7eb",
          borderRadius: 10,
          padding: 14,
          background: "#ffffff",
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={decision.pillStyle}>{decision.level}</span>
          <div style={{ fontWeight: 950 as any }}>{decision.title}</div>
        </div>
        <div style={{ marginTop: 8, color: "#374151", fontSize: 13 }}>{decision.message}</div>
      </div>

      {/* 2 cartes top */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
        <div style={styles.card}>
          <div style={styles.subtle}>RISQUE RÉGLEMENTAIRE (IA ACT)</div>
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={statusPill(String(safeResult.systemStatus))}>{String(safeResult.systemStatus)}</span>
            <div style={{ fontSize: 13, color: "#374151", fontWeight: 900 }}>
              Risk tier : <span style={{ color: "#111827" }}>{safeResult.riskTier}</span>
            </div>
          </div>

          <div style={{ marginTop: 10, color: "#374151", fontSize: 13 }}>{safeResult.statusReason}</div>

          {Array.isArray(safeResult.systemRiskReasons) && safeResult.systemRiskReasons.length > 0 ? (
            <ul style={{ marginTop: 10, color: "#374151", fontSize: 13 }}>
              {safeResult.systemRiskReasons.slice(0, 3).map((r: string, i: number) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          ) : null}
        </div>

        <div style={styles.card}>
          <div style={styles.subtle}>CONFORMITÉ (Jauge 0–100)</div>

          <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 950 as any }}>{score}/100</div>
              <div style={{ marginTop: 6 }}>
                <span style={maturity.tag}>{maturity.label}</span>
              </div>
            </div>

            <div style={{ textAlign: "right", color: "#6b7280", fontSize: 12, fontWeight: 900 }}>
              <div>
                Obligations “OK” : {measuresStats.ok}/{measuresStats.total}
              </div>
              <div>À faire : {measuresStats.todo}</div>
              <div>
                Évaluées : {measuresStats.evaluated}/{measuresStats.total}
              </div>
              {measuresStats.notEvaluated > 0 ? <div>Non évaluées : {measuresStats.notEvaluated}</div> : null}
            </div>
          </div>

          <div style={{ marginTop: 10, color: "#374151", fontSize: 13 }}>
            <strong>Lecture :</strong> {maturity.desc}
          </div>

          <div style={{ marginTop: 10, fontSize: 12, color: "#6b7280" }}>
            Règle : une obligation est validée quand tu coches <strong>au moins 2 mesures</strong> (sur 3).
          </div>

          {measuresStats.evaluated < measuresStats.total ? (
            <div style={{ marginTop: 10, fontSize: 12, color: "#6b7280" }}>
              ⚠️ Score potentiellement <strong>partiel</strong> : complète l’évaluation pour une lecture plus fiable.
            </div>
          ) : null}
        </div>
      </div>

      {explanation ? (
        <div style={{ ...styles.card, borderLeft: "4px solid #2563eb" }}>
          <div style={{ fontWeight: 950 as any, marginBottom: 6 }}>{explanation.title}</div>
          <div style={{ color: "#374151", fontSize: 13 }}>{explanation.text}</div>
        </div>
      ) : null}

      {/* PLAN D’ACTION */}
      <div style={styles.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 950 }}>Plan d’action (priorités conformité)</div>
            <div style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>
              Concordia trie automatiquement ce qu’il faut faire <strong>en premier</strong> (poids des obligations).
            </div>
          </div>

          <button
            onClick={() => {
              const el = document.getElementById("section-obligations");
              el?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            style={{
              border: "1px solid #e5e7eb",
              background: "white",
              borderRadius: 8,
              padding: "8px 10px",
              cursor: "pointer",
              fontWeight: 900,
            }}
          >
            Aller aux obligations ↓
          </button>
        </div>

        {actionPlan.all.length === 0 ? (
          <div style={{ marginTop: 12, color: "#374151", fontSize: 13 }}>
            ✅ Aucune priorité détectée : toutes les obligations présentes sont marquées “OK”.
          </div>
        ) : (
          <>
            <div style={{ marginTop: 14, fontSize: 13, fontWeight: 950 }}>🔥 Top priorités (global)</div>

            <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
              {actionPlan.topGlobal.map((it) => (
                <div
                  key={it.obligationId}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    padding: 12,
                    background: "#fafafa",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 950 }}>
                      {it.label}{" "}
                      <span style={{ color: "#6b7280", fontWeight: 800, fontSize: 12 }}>
                        ({prettyCategory(it.category)})
                      </span>
                    </div>
                    <div style={{ marginTop: 6, fontSize: 13, color: "#374151" }}>
                      {it.complianceReason || "Obligation prioritaire non satisfaite (mesures à compléter)."}
                    </div>
                    <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
                      Poids : <strong>{it.weight}</strong>
                      {it.estimatedCompliance ? (
                        <>
                          {" "}
                          • Estimation : <strong>{it.estimatedCompliance}</strong>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <button
                    onClick={() => scrollToObligation(it.obligationId)}
                    style={{
                      background: "#111827",
                      color: "white",
                      borderRadius: 8,
                      padding: "8px 10px",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 950,
                      whiteSpace: "nowrap",
                      height: 36,
                    }}
                  >
                    Voir →
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Cas d’usage + Obligations (avec cases à cocher) */}
      <div style={{ marginTop: 10 }}>
        <h2 style={styles.h2}>Cas d’usage</h2>

        {safeUseCases.map((uc: any) => (
          <div key={uc.useCaseId} style={styles.card}>
            <div style={{ fontWeight: 950 as any, marginBottom: 10 }}>{uc.useCaseName}</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ color: "#374151", fontSize: 13 }}>
                <div>
                  <strong>Niveau de risque :</strong> {uc.riskLevel}
                </div>
                <div style={{ marginTop: 6 }}>
                  <strong>Criticité :</strong> {uc.criticalityLevel} ({uc.criticalityScore}/100)
                </div>

                {Array.isArray(uc.riskReasons) && uc.riskReasons.length > 0 ? (
                  <>
                    <div style={{ marginTop: 10, ...styles.subtle }}>RAISONS (RISQUE)</div>
                    <ul style={{ marginTop: 6 }}>
                      {uc.riskReasons.slice(0, 3).map((r: string, i: number) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </div>

              <div style={{ color: "#374151", fontSize: 13 }}>
                {Array.isArray(uc.criticalityReasons) && uc.criticalityReasons.length > 0 ? (
                  <>
                    <div style={styles.subtle}>FACTEURS (CRITICITÉ)</div>
                    <ul style={{ marginTop: 6 }}>
                      {uc.criticalityReasons.slice(0, 3).map((r: string, i: number) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </div>
            </div>

            <div style={{ marginTop: 14 }} id="section-obligations">
              <div style={styles.h3}>Obligations applicables</div>

              <div style={{ display: "grid", gap: 10 }}>
                {(uc.appliedObligations || []).map((o: any) => {
                  const obligationId = String(o.obligationId);
                  const est = complianceLabel(o.estimatedCompliance);
                  const pack = (MEASURES as any)[obligationId] as MeasurePack | undefined;
                  const isOk = !!fulfillments[obligationId];

                  const sub = subMeasuresState[obligationId];
                  const anyChecked = sub ? Object.values(sub).some(Boolean) : false;

                  return (
                    <div
                      key={obligationId}
                      id={`ob-${obligationId}`}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 10,
                        padding: 12,
                        background: "#fafafa",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                        <div style={{ fontWeight: 950 as any }}>
                          [{o.category}] {o.label}{" "}
                          {!anyChecked ? <span style={{ marginLeft: 8, ...pill("#111827") }}>Non évaluée</span> : null}
                        </div>

                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span style={est.style}>{est.text}</span>
                          <span style={isOk ? pill("#16a34a") : pill("#ef4444")}>{isOk ? "Mesures OK" : "À faire"}</span>
                        </div>
                      </div>

                      <div style={{ color: "#374151", fontSize: 13, marginTop: 6 }}>
                        {o.complianceReason || "Analyse estimative basée sur le statut et le risque."}
                      </div>

                      {pack ? (
                        <div style={{ marginTop: 12 }}>
                          <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 900 }}>
                            MESURES CONCRÈTES ({pack.title})
                          </div>

                          <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
                            {pack.items.map((it) => {
                              const checked = !!subMeasuresState[obligationId]?.[it.key];
                              return (
                                <label
                                  key={it.key}
                                  style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: 10,
                                    padding: 10,
                                    borderRadius: 10,
                                    border: "1px solid #e5e7eb",
                                    background: "white",
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(e) => toggleSubMeasure(obligationId, it.key, e.target.checked)}
                                    style={{ marginTop: 3 }}
                                  />
                                  <div>
                                    <div style={{ fontWeight: 950 as any }}>{it.label}</div>
                                    {it.hint ? (
                                      <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>{it.hint}</div>
                                    ) : null}
                                  </div>
                                </label>
                              );
                            })}
                          </div>

                          <div style={{ marginTop: 10, fontSize: 12, color: "#6b7280" }}>
                            Règle : obligation validée si <strong>au moins {pack.minChecked ?? 2}</strong> mesure(s)
                            cochée(s) sur {pack.items.length}.
                          </div>
                        </div>
                      ) : (
                        <div style={{ marginTop: 10, fontSize: 12, color: "#6b7280" }}>
                          (Pas encore de sous-mesures définies pour {obligationId}.)
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Score par catégorie */}
      <div style={styles.card}>
        <div style={{ fontWeight: 950 as any, marginBottom: 10 }}>Score par bloc IA Act</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {Object.entries(safeResult.score?.byCategory || {}).map(([cat, v]: any) => (
            <div
              key={cat}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                padding: 12,
                background: "#fafafa",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontWeight: 900,
              }}
            >
              <span style={{ textTransform: "capitalize" }}>{prettyCategory(String(cat))}</span>
              <span>{v}/100</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
