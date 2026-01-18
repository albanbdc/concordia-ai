// app/api/mapping/route.ts

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

/* =======================
   Types API (LOCAL)
======================= */

type MappingCard = {
  id: string;
  createdAt: string;
  sector: string;
  useCaseTitle: string;
  riskTier?: string;
  systemStatus?: string;
  complianceScore?: number;
};

type MappingSector = {
  sector: string;
  count: number;
  lastCreatedAt: string;
  audits: MappingCard[];
};

/* =======================
   GET
======================= */

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limitParam = url.searchParams.get("limit");
    const limit = Math.min(Math.max(Number(limitParam || 500), 1), 1000);

    // ⚠️ IMPORTANT :
    // on utilise SELECT → Prisma ne renvoie PAS un Audit complet
    const rows = await prisma.audit.findMany({
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

    const cards: MappingCard[] = rows.map((a) => {
      const input = safeJsonParse<any>(a.inputText);
      const result = safeJsonParse<any>(a.resultText);

      const sector =
        a.industrySector ||
        input?.system?.useCases?.[0]?.sector ||
        "non-classe";

      const useCaseTitle =
        a.useCaseType ||
        input?.system?.useCases?.[0]?.name ||
        input?.system?.name ||
        "Cas d’usage";

      const complianceScore =
        typeof result?.score?.overallScore === "number"
          ? result.score.overallScore
          : undefined;

      return {
        id: a.id,
        createdAt: a.createdAt.toISOString(),
        sector: String(sector),
        useCaseTitle: String(useCaseTitle),
        riskTier: result?.riskTier,
        systemStatus: result?.systemStatus,
        complianceScore,
      };
    });

    /* =======================
       Group by sector
    ======================= */

    const bySector: Record<string, MappingSector> = {};

    for (const c of cards) {
      const key = c.sector || "non-classe";

      if (!bySector[key]) {
        bySector[key] = {
          sector: key,
          count: 0,
          lastCreatedAt: c.createdAt,
          audits: [],
        };
      }

      bySector[key].count += 1;

      if (c.createdAt > bySector[key].lastCreatedAt) {
        bySector[key].lastCreatedAt = c.createdAt;
      }

      bySector[key].audits.push(c);
    }

    const sectors = Object.values(bySector).sort(
      (a, b) => b.count - a.count
    );

    return NextResponse.json({ ok: true, sectors }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: "Erreur serveur",
        details: e?.message || String(e),
      },
      { status: 500 }
    );
  }
}
