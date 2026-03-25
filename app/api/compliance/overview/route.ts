// app/api/compliance/overview/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Status = "compliant" | "in-progress" | "non-compliant";
type Priority = "low" | "medium" | "high";

function asStatus(v: any): Status {
  const s = String(v || "");
  if (s === "compliant" || s === "in-progress" || s === "non-compliant") return s;
  return "non-compliant";
}

function asPriority(v: any): Priority {
  const p = String(v || "");
  if (p === "low" || p === "medium" || p === "high") return p;
  return "medium";
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const useCaseKeyFilter = url.searchParams.get("useCaseKey")?.trim() || null;

    // Totaux
    const [obligationsCount, actionsCount] = await Promise.all([
      prisma.useCaseObligationState.count({
        where: useCaseKeyFilter ? { useCaseKey: useCaseKeyFilter } : undefined,
      }),
      prisma.complianceAction.count(),
    ]);

    // 🔥 ACTIONS GROUPÉES PAR (useCaseKey + obligationId)
    const actions = await prisma.complianceAction.findMany({
      select: {
        obligationId: true,
        status: true,
        audit: {
          select: {
            useCaseType: true,
          },
        },
      },
    });

    const actionMap = new Map<string, { total: number; done: number }>();

    for (const a of actions as any[]) {
      const useCaseKey = a.audit?.useCaseType || "global";
      const key = `${useCaseKey}__${a.obligationId}`;

      const prev = actionMap.get(key) || { total: 0, done: 0 };
      prev.total += 1;
      if (a.status === "DONE") prev.done += 1;
      actionMap.set(key, prev);
    }

    // Obligations
    const rows = await prisma.useCaseObligationState.findMany({
      where: useCaseKeyFilter ? { useCaseKey: useCaseKeyFilter } : undefined,
      orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
      select: {
        useCaseKey: true,
        obligationId: true,
        status: true,
        priority: true,
        openActions: true,
        lastAuditId: true,
        lastAuditAt: true,
        updatedAt: true,
        useCase: {
          select: { sector: true, title: true },
        },
      },
      take: 5000,
    });

    const obligations = (rows as any[]).map((r: any) => {
      const useCaseKey = r.useCaseKey || "global";
      const key = `${useCaseKey}__${r.obligationId}`;

      const stats = actionMap.get(key);
      let computedStatus: Status = asStatus(r.status);
      let computedOpenActions = Number(r.openActions || 0);

      if (stats && stats.total > 0) {
        computedOpenActions = stats.total - stats.done;
        computedStatus = computedOpenActions === 0 ? "compliant" : "in-progress";
      }

      return {
        useCaseKey,
        sector: r.useCase?.sector || "non-classe",
        useCaseTitle: r.useCase?.title || "Cas d’usage",
        obligationId: r.obligationId,
        status: computedStatus,
        priority: asPriority(r.priority),
        openActions: computedOpenActions,
        lastAuditId: r.lastAuditId ?? null,
        lastAuditAt: r.lastAuditAt ? r.lastAuditAt.toISOString() : null,
        updatedAt: r.updatedAt.toISOString(),
      };
    });

    return NextResponse.json(
      {
        ok: true,
        totals: {
          obligations: obligationsCount,
          actions: actionsCount,
        },
        obligations,
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("[GET /api/compliance/overview]", e);
    return NextResponse.json(
      { ok: false, error: "Erreur serveur.", details: e?.message || String(e) },
      { status: 500 }
    );
  }
}
