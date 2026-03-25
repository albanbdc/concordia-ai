// app/api/compliance/timeline/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function safeJsonParse<T = any>(raw: string | null | undefined): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * ✅ Extraction robuste du score
 * Compatible avec TOUS les formats renvoyés par le moteur Concordia
 */
function pickScore(result: any): number | undefined {
  if (!result) return undefined;

  // A) result.score = number
  if (typeof result.score === "number") {
    return result.score;
  }

  // B) result.score = { overallScore | overall }
  if (result.score && typeof result.score === "object") {
    const v = result.score.overallScore ?? result.score.overall;
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : undefined;
  }

  // C) result.useCases[0].score = number | { overallScore | overall }
  const uc = result.useCases?.[0];
  if (uc) {
    if (typeof uc.score === "number") return uc.score;

    if (uc.score && typeof uc.score === "object") {
      const v = uc.score.overallScore ?? uc.score.overall;
      const n = typeof v === "number" ? v : Number(v);
      return Number.isFinite(n) ? n : undefined;
    }
  }

  return undefined;
}

type TimelinePoint = {
  auditId: string;
  createdAt: string;
  score?: number;
  systemStatus?: string;
  riskTier?: string;
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limitParam = url.searchParams.get("limit");
    const limit = Math.min(Math.max(Number(limitParam || 50), 1), 200);

    const rows = await prisma.audit.findMany({
      where: { type: "ENGINE_AUDIT" },
      orderBy: { createdAt: "asc" },
      take: limit,
      select: {
        id: true,
        createdAt: true,
        resultText: true,
      },
    });

    const points: TimelinePoint[] = rows.map((a) => {
      const result = safeJsonParse<any>(a.resultText);
      return {
        auditId: a.id,
        createdAt: a.createdAt.toISOString(),
        score: pickScore(result),
        systemStatus: result?.systemStatus ? String(result.systemStatus) : undefined,
        riskTier: result?.riskTier ? String(result.riskTier) : undefined,
      };
    });

    return NextResponse.json({ ok: true, points }, { status: 200 });
  } catch (e: any) {
    console.error("[GET /api/compliance/timeline]", e);
    return NextResponse.json(
      { ok: false, error: "Erreur serveur.", details: e?.message || String(e) },
      { status: 500 }
    );
  }
}
