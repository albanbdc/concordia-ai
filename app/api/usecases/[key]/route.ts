// app/api/usecases/[useCaseKey]/route.ts
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

function slugify(v: string) {
  return (v || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildUseCaseKey(sector: string, title: string) {
  const s = slugify(sector || "non-classe");
  const t = slugify(title || "cas-d-usage");
  return `${s}__${t}`;
}

type HistoryItem = {
  id: string;
  createdAt: string;
  sector: string;
  title: string;
  riskTier?: string;
  systemStatus?: string;
  complianceScore?: number;
};

export async function GET(_req: Request, ctx: { params: Promise<{ useCaseKey: string }> }) {
  try {
    const { useCaseKey } = await ctx.params;

    // On récupère un gros paquet et on filtre (simple, safe)
    const rows = await prisma.audit.findMany({
      orderBy: { createdAt: "desc" },
      take: 2000,
      select: {
        id: true,
        createdAt: true,
        industrySector: true,
        useCaseType: true,
        inputText: true,
        resultText: true,
      },
    });

    const history: HistoryItem[] = [];

    for (const a of rows) {
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

      const key = buildUseCaseKey(String(sector), String(title));
      if (key !== useCaseKey) continue;

      const complianceScore =
        typeof result?.score?.overallScore === "number" ? result.score.overallScore : undefined;

      history.push({
        id: a.id,
        createdAt: a.createdAt.toISOString(),
        sector: String(sector),
        title: String(title),
        riskTier: result?.riskTier,
        systemStatus: result?.systemStatus,
        complianceScore,
      });
    }

    return NextResponse.json({ ok: true, useCaseKey, history }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "Erreur serveur.", details: e?.message || String(e) },
      { status: 500 }
    );
  }
}
