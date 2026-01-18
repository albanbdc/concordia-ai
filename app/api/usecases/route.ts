// app/api/usecases/route.ts
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

type UseCaseGroup = {
  useCaseKey: string;
  sector: string;
  title: string;
  count: number;
  lastCreatedAt: string;
  last: {
    id: string;
    createdAt: string;
    riskTier?: string;
    systemStatus?: string;
    complianceScore?: number;
  };
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limitParam = url.searchParams.get("limit");
    const limit = Math.min(Math.max(Number(limitParam || 1000), 1), 2000);

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

    const groups = new Map<string, UseCaseGroup>();

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

      const complianceScore =
        typeof result?.score?.overallScore === "number" ? result.score.overallScore : undefined;

      const card = {
        id: a.id,
        createdAt: a.createdAt.toISOString(),
        riskTier: result?.riskTier,
        systemStatus: result?.systemStatus,
        complianceScore,
      };

      if (!groups.has(key)) {
        groups.set(key, {
          useCaseKey: key,
          sector: String(sector),
          title: String(title),
          count: 1,
          lastCreatedAt: card.createdAt,
          last: card,
        });
      } else {
        const g = groups.get(key)!;
        g.count += 1;
        // rows déjà triés desc, donc le premier est le dernier
      }
    }

    const list = Array.from(groups.values()).sort((a, b) => b.lastCreatedAt.localeCompare(a.lastCreatedAt));
    return NextResponse.json({ ok: true, useCases: list }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "Erreur serveur.", details: e?.message || String(e) },
      { status: 500 }
    );
  }
}
