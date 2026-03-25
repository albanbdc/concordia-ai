export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* =======================
   Utils
======================= */

function safeJsonParse<T = any>(raw: string | null | undefined): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function slugify(s: string) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "-")
    .replace(/\-+/g, "-")
    .replace(/^\-+|\-+$/g, "");
}

function buildUseCaseKey(sector: string, title: string) {
  const sec = (sector || "non-classe").toLowerCase().trim();
  const t = slugify(title || "cas-d-usage");
  return `${sec}__${t}`;
}

type ObligationRow = {
  obligationId: string;
  label?: string;
  category?: string;
  weight?: number;
  fulfilled?: boolean;
};

function pickAppliedObligations(result: any): ObligationRow[] {
  // ✅ on tente plusieurs formats possibles de ton moteur
  const candidates = [
    result?.useCases?.[0]?.appliedObligations,
    result?.appliedObligations,
    result?.engine?.useCases?.[0]?.appliedObligations,
    result?.result?.useCases?.[0]?.appliedObligations,
    result?.analysis?.useCases?.[0]?.appliedObligations,

    // si jamais tu as un format "obligations"
    result?.obligations,
    result?.obligationsApplied,
    result?.applied,
  ];

  for (const c of candidates) {
    if (Array.isArray(c)) return c as ObligationRow[];
  }
  return [];
}

/* =======================
   Handlers
======================= */

// ✅ pour tester dans le navigateur : /api/compliance/seed
export async function GET(req: Request) {
  return POST(req);
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const limitParam = url.searchParams.get("limit");
    const limit = Math.min(Math.max(Number(limitParam || 2000), 1), 5000);

    const audits = await prisma.audit.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        createdAt: true,
        industrySector: true,
        useCaseType: true,
        inputText: true,
        resultText: true,
      },
    });

    const map = new Map<
      string,
      {
        useCaseKey: string;
        sector: string;
        title: string;
        obligationId: string;
        status: "compliant" | "non-compliant";
        priority: "low" | "medium" | "high";
        lastAuditId: string;
        lastAuditAt: Date;
      }
    >();

    let useCasesTouched = 0;
    let foundAppliedTotal = 0;

    for (const a of audits) {
      const input = safeJsonParse<any>(a.inputText);
      const result = safeJsonParse<any>(a.resultText);

      const sector =
        (a.industrySector && String(a.industrySector)) ||
        input?.system?.useCases?.[0]?.sector ||
        "non-classe";

      const title =
        (a.useCaseType && String(a.useCaseType)) ||
        input?.system?.useCases?.[0]?.name ||
        input?.system?.name ||
        "Cas d’usage";

      const useCaseKey = buildUseCaseKey(String(sector), String(title));

      await prisma.useCase.upsert({
        where: { key: useCaseKey },
        create: {
          key: useCaseKey,
          sector: String(sector),
          title: String(title),
        },
        update: {
          sector: String(sector),
          title: String(title),
        },
      });

      useCasesTouched++;

      const applied = pickAppliedObligations(result);
      if (!Array.isArray(applied) || applied.length === 0) continue;

      foundAppliedTotal += applied.length;

      for (const ob of applied) {
        if (!ob?.obligationId) continue;

        const status: "compliant" | "non-compliant" = ob.fulfilled ? "compliant" : "non-compliant";

        const w = typeof ob.weight === "number" ? ob.weight : 0;
        const priority: "low" | "medium" | "high" = w >= 4 ? "high" : w === 3 ? "medium" : "low";

        const k = `${useCaseKey}__${String(ob.obligationId)}`;
        const existing = map.get(k);

        if (!existing || a.createdAt > existing.lastAuditAt) {
          map.set(k, {
            useCaseKey,
            sector: String(sector),
            title: String(title),
            obligationId: String(ob.obligationId),
            status,
            priority,
            lastAuditId: a.id,
            lastAuditAt: a.createdAt,
          });
        }
      }
    }

    let obligationStatesUpserted = 0;

    for (const row of map.values()) {
      await prisma.useCaseObligationState.upsert({
        where: {
          useCaseKey_obligationId: {
            useCaseKey: row.useCaseKey,
            obligationId: row.obligationId,
          },
        },
        create: {
          useCaseKey: row.useCaseKey,
          obligationId: row.obligationId,
          status: row.status,
          priority: row.priority,
          openActions: 0,
          lastAuditId: row.lastAuditId,
          lastAuditAt: row.lastAuditAt,
        },
        update: {
          status: row.status,
          priority: row.priority,
          lastAuditId: row.lastAuditId,
          lastAuditAt: row.lastAuditAt,
        },
      });

      obligationStatesUpserted++;
    }

    return NextResponse.json(
      {
        ok: true,
        auditsScanned: audits.length,
        useCasesTouched,
        foundAppliedTotal,
        obligationStatesUpserted,
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "Erreur serveur.", details: e?.message || String(e) },
      { status: 500 }
    );
  }
}
