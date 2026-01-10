"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  auditId: string;
  // ce qu'on a pour reconstruire le report
  resultText: string | null;
  inputText?: string | null; // si tu l'as en DB (optionnel)
};

export default function ResumeAuditButton({ auditId, resultText, inputText }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function safeParse(json: string | null | undefined) {
    if (!json) return null;
    try {
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  async function handleResume() {
    setLoading(true);

    try {
      const parsedResult = safeParse(resultText);

      // inputText (si présent) peut contenir system / fulfillments / preMeasures
      const parsedInput = safeParse(inputText);

      // Fallback: si inputText absent, on reconstruit un "system" minimal depuis le result
      const system =
        parsedInput?.system ??
        (parsedResult
          ? {
              id: parsedResult.systemId ?? "unknown-system",
              name: parsedResult.systemName ?? "Concordia Audit",
              role: parsedResult.entityType ?? "deployer",
              entityType: parsedResult.entityType ?? "deployer",
              useCases: parsedResult.useCases ?? [],
            }
          : null);

      const fulfillments = parsedInput?.fulfillments ?? parsedInput?.fulfillment ?? {};
      const preMeasures = parsedInput?.preMeasures ?? {};

      if (!parsedResult) {
        alert("Impossible de reprendre : resultText n'est pas un JSON valide.");
        return;
      }

      // ✅ On remet les mêmes clés que ton /dashboard/report lit déjà
      sessionStorage.setItem("concordia:lastAuditSystem", JSON.stringify(system));
      sessionStorage.setItem("concordia:lastAuditResult", JSON.stringify(parsedResult));
      sessionStorage.setItem("concordia:lastAuditFulfillments", JSON.stringify(fulfillments));
      sessionStorage.setItem("concordia:lastAuditPreMeasures", JSON.stringify(preMeasures));

      // ✅ important pour le bandeau / lien
      sessionStorage.setItem("concordia:lastSavedAuditId", auditId);

      // Go report
      router.push(`/dashboard/report?auditId=${encodeURIComponent(auditId)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleResume}
      disabled={loading}
      style={{
        background: "#111827",
        color: "white",
        borderRadius: 10,
        padding: "8px 12px",
        border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        fontWeight: 900,
      }}
    >
      {loading ? "Reprise..." : "Reprendre l’audit"}
    </button>
  );
}
