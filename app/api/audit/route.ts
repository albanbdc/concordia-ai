// app/api/audit/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runEngine } from "@/domain/concordia/engine";
import type { AiSystem } from "@/domain/concordia/types";

import { interpretUseCaseWithLLM } from "@/domain/concordia/llm/interpretUseCase";
import { applyInterpretationGuards } from "@/domain/concordia/llm/applyInterpretationGuards";
import { EMPTY_INTERPRETATION, type LlmInterpretation } from "@/domain/concordia/llm/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ---------------- Utils ---------------- */

function safeJsonStringify(obj: unknown) {
  try {
    return JSON.stringify(obj, (_k, v) => (typeof v === "bigint" ? v.toString() : v));
  } catch {
    return JSON.stringify({ error: "STRINGIFY_FAILED" });
  }
}

function jsonError(requestId: string, status: number, error: string, details?: unknown) {
  return NextResponse.json(
    { ok: false, error, requestId, details },
    { status, headers: { "x-request-id": requestId } }
  );
}

function isValidSystem(system: any): system is AiSystem {
  return !!system && typeof system === "object" && !!system.id && !!system.role;
}

/**
 * ✅ IMPORTANT : on construit un texte "le plus complet possible"
 * même si l'utilisateur n'a rempli qu'un seul champ.
 */
function buildFreeText(system: AiSystem): string {
  const u: any = system?.useCases?.[0];

  const parts: string[] = [];

  // côté système
  const sysName = (system as any)?.name;
  const sysDesc = (system as any)?.description;

  if (typeof sysName === "string") parts.push(sysName);
  if (typeof sysDesc === "string") parts.push(sysDesc);

  // côté use case
  if (u) {
    if (typeof u.name === "string") parts.push(u.name);
    if (typeof u.description === "string") parts.push(u.description);
    if (typeof u.purpose === "string") parts.push(u.purpose);
    if (typeof u.context === "string") parts.push(u.context);
    if (typeof u.details === "string") parts.push(u.details);
  }

  // fallback ultime : stringify léger si vraiment vide
  let text = parts.filter(Boolean).join("\n").trim();

  if (!text || text.length < 10) {
    // fallback : on prend un mini résumé JSON
    try {
      const minimal = {
        systemName: (system as any)?.name ?? null,
        role: (system as any)?.role ?? null,
        useCaseName: u?.name ?? null,
        useCaseDesc: u?.description ?? null,
      };
      text = JSON.stringify(minimal);
    } catch {
      text = "";
    }
  }

  return text.trim();
}

/**
 * ✅ Règles simples (anti-faux LOW) — si le LLM ne marche pas, on force quand même.
 * Pas besoin d’être parfait : c’est un filet de sécurité.
 */
function ruleBasedSignals(freeText: string): LlmInterpretation {
  const t = (freeText || "").toLowerCase();

  const hasFace =
    t.includes("reconnaissance faciale") ||
    t.includes("face recognition") ||
    t.includes("facial recognition");

  const publicSpace =
    t.includes("dans la rue") ||
    t.includes("rue") ||
    t.includes("espace public") ||
    t.includes("public") ||
    t.includes("passants");

  const law =
    t.includes("police") ||
    t.includes("forces de l'ordre") ||
    t.includes("forces de l ordre") ||
    t.includes("gendarmerie") ||
    t.includes("enquête") ||
    t.includes("suspect") ||
    t.includes("individus dangereux");

  // Heuristique : reconnaissance faciale + espace public + police => on force prohibited
  const prohibited = hasFace && publicSpace && law;

  // RH / crédit / éducation : on force au moins high-risk si mention explicite
  const hr =
    t.includes("cv") ||
    t.includes("recrut") ||
    t.includes("candidat") ||
    t.includes("entretien");

  const credit =
    t.includes("crédit") ||
    t.includes("pret") ||
    t.includes("prêt") ||
    t.includes("scoring") ||
    t.includes("octroi");

  const education =
    t.includes("élève") ||
    t.includes("eleve") ||
    t.includes("orientation scolaire") ||
    t.includes("école") ||
    t.includes("ecole");

  const highRisk = hr || credit || education || law;

  return {
    prohibitedSignal: prohibited,
    highRiskSignal: prohibited ? true : highRisk,
    biometricSignal: hasFace,
    lawEnforcementSignal: law,
    vulnerablePersonsSignal: education,
    justification: prohibited
      ? "Règle : biométrie + espace public + forces de l’ordre."
      : "",
  };
}

function mergeFlags(a: LlmInterpretation, b: LlmInterpretation): LlmInterpretation {
  return {
    prohibitedSignal: !!(a.prohibitedSignal || b.prohibitedSignal),
    highRiskSignal: !!(a.highRiskSignal || b.highRiskSignal),
    biometricSignal: !!(a.biometricSignal || b.biometricSignal),
    lawEnforcementSignal: !!(a.lawEnforcementSignal || b.lawEnforcementSignal),
    vulnerablePersonsSignal: !!(a.vulnerablePersonsSignal || b.vulnerablePersonsSignal),
    justification: (a.justification || b.justification || "").slice(0, 400),
  };
}

/* ---------------- POST ---------------- */

export async function POST(req: Request) {
  const requestId =
    globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  // 1) read body
  const body = await req.json().catch(() => null);
  if (!body) return jsonError(requestId, 400, "Invalid JSON body.");

  const systemCandidate = body?.system ?? body;
  const fulfillments = body?.fulfillments ?? null;

  if (!isValidSystem(systemCandidate)) {
    return jsonError(requestId, 422, "Invalid payload. Expected { system } with id + role.", {
      receivedKeys: Object.keys(body),
    });
  }

  const system: AiSystem = systemCandidate;

  // 2) Build free text (NEVER EMPTY)
  const freeText = buildFreeText(system);

  // 3) Rule-based safety net
  const ruleFlags = ruleBasedSignals(freeText);

  // 4) LLM interpretation (best effort)
  let llmFlags: LlmInterpretation = EMPTY_INTERPRETATION;

  try {
    llmFlags = await interpretUseCaseWithLLM({ freeText, requestId });
  } catch (e) {
    console.error(`[llm][${requestId}] interpret exception`, e);
    llmFlags = EMPTY_INTERPRETATION;
  }

  // 5) Merge flags (OR) => si règle OU LLM détecte, on agit
  const flags = mergeFlags(ruleFlags, llmFlags);

  // 6) Run engine
  let result: any;
  try {
    result = runEngine(system, undefined as any, fulfillments);
  } catch (e: any) {
    console.error(`[api/audit][${requestId}] Engine error`, e);
    return jsonError(requestId, 500, "ENGINE_ERROR", e?.message ?? String(e));
  }

  // 7) Apply guards (force prohibited/high)
  const patched = applyInterpretationGuards(result, flags);
  result = patched.result;

  // 8) Persist debug info
  result.meta = typeof result.meta === "object" && result.meta !== null ? result.meta : {};
  result.meta.rawClientText = freeText;
  result.meta.llmInterpretation = flags;
  result.meta.requestId = requestId;

  // 9) Save
  try {
    const sector =
      system?.useCases?.[0]?.sector != null ? String(system.useCases[0].sector) : null;
    const useCaseName =
      system?.useCases?.[0]?.name != null ? String(system.useCases[0].name) : null;

    const audit = await prisma.audit.create({
      data: {
        type: "ENGINE_AUDIT",
        industrySector: sector,
        useCaseType: useCaseName,
        internalDepartment: null,
        inputText: safeJsonStringify({ system, fulfillments }),
        resultText: safeJsonStringify(result),
        certified: false,
      },
      select: { id: true, createdAt: true },
    });

    return NextResponse.json(
      { ok: true, auditId: audit.id, createdAt: audit.createdAt, result, requestId },
      { status: 200, headers: { "x-request-id": requestId } }
    );
  } catch (e: any) {
    console.error(`[api/audit][${requestId}] DB error`, e);
    return jsonError(requestId, 500, "DB_ERROR", e?.message ?? String(e));
  }
}
