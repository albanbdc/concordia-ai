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
    const useCaseKey = url.searchParams.get("useCaseKey")?.trim() || null;

    // Totaux
    const [obligationsCount, actionsCount] = await Promise.all([
      prisma.useCaseObligationState.count({
        where: useCaseKey ? { useCaseKey } : undefined,
      }),
      prisma.complianceAction
        ? prisma.complianceAction.count()
        : Promise.resolve(0),
    ]);

    // Liste des obligations (vivantes)
    const rows = await prisma.useCaseObligationState.findMany({
      where: useCaseKey ? { useCaseKey } : undefined,
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

    const obligations = (rows as any[]).map((r: any) => ({

      useCaseKey: r.useCaseKey,
      sector: r.useCase?.sector || "non-classe",
      useCaseTitle: r.useCase?.title || "Cas d’usage",
      obligationId: r.obligationId,
      status: asStatus(r.status),
      priority: asPriority(r.priority),
      openActions: Number(r.openActions || 0),
      lastAuditId: r.lastAuditId ?? null,
      lastAuditAt: r.lastAuditAt ? r.lastAuditAt.toISOString() : null,
      updatedAt: r.updatedAt.toISOString(),
    }));

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
