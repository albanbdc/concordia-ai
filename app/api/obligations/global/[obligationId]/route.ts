// app/api/obligations/global/[obligationId]/route.ts
// Détail d’une obligation globale : liste des cas d’usage impactés
// GET /api/obligations/global/[obligationId]
// ✅ B : proofsCount + lastProofAt (preuves actives, deletedAt=null)
// ✅ C : blocking + blockingReason (NC ou priorité HIGH)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function iso(d: Date | null | undefined) {
  return d ? d.toISOString() : null;
}

function up(v: any) {
  return String(v ?? "").trim().toUpperCase();
}

function blockingInfo(statusRaw: any, priorityRaw: any) {
  const status = up(statusRaw);
  const priority = up(priorityRaw);

  const reasons: string[] = [];
  if (status === "NON_COMPLIANT") reasons.push("Statut NON_COMPLIANT");
  if (priority === "HIGH") reasons.push("Priorité HIGH");

  return {
    blocking: reasons.length > 0,
    blockingReason: reasons.length > 0 ? reasons.join(" • ") : null,
  };
}

export async function GET(_req: Request, context: { params: Promise<{ obligationId: string }> }) {
  try {
    const { obligationId } = await context.params;

    if (!obligationId || obligationId.length < 2) {
      return NextResponse.json({ ok: false, error: "obligationId invalide" }, { status: 400 });
    }

    // 1) États par cas d’usage pour cet article
    const states = await prisma.useCaseObligationState.findMany({
      where: { obligationId },
      include: {
        useCase: {
          select: {
            key: true,
            title: true,
            sector: true,
          },
        },
      },
      orderBy: [{ updatedAt: "desc" }],
    });

    const stateIds = states.map((s) => s.id);

    // 2) Agrégation preuves (B) : count + last createdAt par stateId
    const proofAgg =
      stateIds.length > 0
        ? await prisma.useCaseObligationProof.groupBy({
            by: ["stateId"],
            where: { stateId: { in: stateIds }, deletedAt: null },
            _count: { _all: true },
            _max: { createdAt: true },
          })
        : [];

    const proofMap = new Map<string, { proofsCount: number; lastProofAt: string | null }>();
    for (const a of proofAgg) {
      proofMap.set(a.stateId, {
        proofsCount: a._count?._all ?? 0,
        lastProofAt: iso(a._max?.createdAt ?? null),
      });
    }

    // 3) DTO final
    const useCases = states.map((s) => {
      const p = proofMap.get(s.id) ?? { proofsCount: 0, lastProofAt: null };
      const block = blockingInfo(s.status, s.priority);

      return {
        stateId: s.id,
        useCaseKey: s.useCase.key,
        useCaseTitle: s.useCase.title,
        sector: s.useCase.sector,
        status: s.status,
        priority: s.priority,
        owner: s.owner ?? null,
        dueDate: iso(s.dueDate),
        updatedAt: iso(s.updatedAt),

        // ✅ B
        proofsCount: p.proofsCount,
        lastProofAt: p.lastProofAt,

        // ✅ C
        blocking: block.blocking,
        blockingReason: block.blockingReason,
      };
    });

    return NextResponse.json({
      ok: true,
      obligationId,
      total: useCases.length,
      useCases,
    });
  } catch (error) {
    console.error("GET /api/obligations/global/[obligationId] error:", error);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500 });
  }
}