// src/lib/runAudit.ts

import type { EngineResult } from "@/domain/concordia/types";

export async function runAudit(system: any) {
  const res = await fetch("/api/concordia-test", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(system),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erreur lors de l’audit");
  }

  const data = await res.json();
  return data.result as EngineResult;
}
