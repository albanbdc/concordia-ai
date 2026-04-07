// app/api/obligations/global/route.ts
// Cockpit "Obligations globales" (agrégation transverse)
// GET /api/obligations/global
// - Base = ObligationCatalog (liste des articles)
// - Agrégation = UseCaseObligationState (statuts par cas d’usage)
// - Fallback lastUpdate = ObligationState.updatedAt (si aucun état par cas d’usage)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function iso(d: Date | null | undefined) {
  return d ? d.toISOString() : null;
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const organizationId = (session?.user as any)?.organizationId;
    if (!organizationId) {
      return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
    }

    // 1) Catalogue
    const catalog = await prisma.obligationCatalog.findMany({
      select: {
        id: true,
        title: true,
        legalRef: true,
        category: true,
      },
      orderBy: [{ id: "asc" }],
    });

    // 2) Global state (fallback lastUpdate, et utile plus tard)
    const globalStates = await prisma.obligationState.findMany({
      select: { obligationId: true, updatedAt: true },
    });
    const globalUpdatedAt = new Map(globalStates.map((s) => [s.obligationId, s.updatedAt]));

    // 3) États par cas d’usage (ce qui permet l’agrégation)
    const states = await prisma.useCaseObligationState.findMany({
      where: {
        useCase: {
          organizationId,
        },
      },
      select: {
        obligationId: true,
        useCaseKey: true,
        status: true,
        updatedAt: true,
      },
    });

    // 4) Agrégation JS (simple, V1)
    type Agg = {
      obligationId: string;
      useCases: Set<string>;
      compliant: number;
      inProgress: number;
      nonCompliant: number;
      notEvaluated: number;
      lastUpdate: Date | null;
    };

    const map = new Map<string, Agg>();

    for (const s of states) {
      const oid = String(s.obligationId || "").trim();
      if (!oid) continue;

      const up = String(s.status || "").toUpperCase();

      if (!map.has(oid)) {
        map.set(oid, {
          obligationId: oid,
          useCases: new Set<string>(),
          compliant: 0,
          inProgress: 0,
          nonCompliant: 0,
          notEvaluated: 0,
          lastUpdate: null,
        });
      }

      const a = map.get(oid)!;
      if (s.useCaseKey) a.useCases.add(s.useCaseKey);

      if (up === "COMPLIANT") a.compliant += 1;
      else if (up === "IN_PROGRESS") a.inProgress += 1;
      else if (up === "NON_COMPLIANT") a.nonCompliant += 1;
      else if (up === "NOT_EVALUATED") a.notEvaluated += 1;
      else a.notEvaluated += 1;

      if (!a.lastUpdate || s.updatedAt > a.lastUpdate) a.lastUpdate = s.updatedAt;
    }

    // 5) Construire la réponse finale (1 carte par obligation du catalogue)
    const obligations = catalog.map((c) => {
      const a = map.get(c.id);

      const compliant = a?.compliant ?? 0;
      const inProgress = a?.inProgress ?? 0;
      const nonCompliant = a?.nonCompliant ?? 0;
      const notEvaluated = a?.notEvaluated ?? 0;

      const totalStates = compliant + inProgress + nonCompliant + notEvaluated;

      const complianceRate =
        totalStates > 0 ? Math.round((compliant / totalStates) * 100) : 0;

      const last =
        a?.lastUpdate ??
        globalUpdatedAt.get(c.id) ??
        null;

      const useCasesCount = a ? a.useCases.size : 0;

      // V1 : pas de table “Systèmes IA” → on met systemsCount = useCasesCount (provisoire)
      const systemsCount = useCasesCount;

      return {
        obligationId: c.id,
        title: c.title,
        legalRef: c.legalRef ?? null,
        category: c.category ?? null,

        systemsCount,
        useCasesCount,

        compliant,
        inProgress,
        nonCompliant,
        notEvaluated,

        complianceRate,
        lastUpdate: iso(last),
      };
    });

    // 6) Tri : à risque d’abord, puis en cours, puis non évaluées, puis conformes
    function aggStatus(o: any) {
      if (o.nonCompliant > 0) return 0;
      if (o.inProgress > 0) return 1;
      if (o.notEvaluated > 0) return 2;
      if (o.compliant > 0) return 3;
      return 4;
    }

    obligations.sort((a, b) => {
      const sa = aggStatus(a);
      const sb = aggStatus(b);
      if (sa !== sb) return sa - sb;
      if (a.complianceRate !== b.complianceRate) return a.complianceRate - b.complianceRate;
      return String(a.legalRef ?? a.obligationId).localeCompare(String(b.legalRef ?? b.obligationId));
    });

    return NextResponse.json({ ok: true, obligations });
  } catch (error) {
    console.error("GET /api/obligations/global error:", error);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500 });
  }
}