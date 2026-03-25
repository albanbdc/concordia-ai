// app/api/compliance/obligations/route.ts
// Liste globale des obligations (registre de conformité vivant)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function toIso(d: Date | null | undefined) {
  return d ? d.toISOString() : null;
}

export async function GET() {
  try {
    // 1) États vivants (registre)
    const states = await prisma.useCaseObligationState.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        useCase: true,
        proofs: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
          },
        },
      },
    });

    // 2) Récupération catalogue (JOIN manuel comme ton endpoint existant)
    const obligationIds = Array.from(
      new Set(states.map((s) => s.obligationId).filter(Boolean))
    );

    const catalogRows =
      obligationIds.length > 0
        ? await prisma.obligationCatalog.findMany({
            where: { id: { in: obligationIds } },
            select: {
              id: true,
              title: true,
              legalRef: true,
              category: true,
              criticality: true,
            },
          })
        : [];

    const catalogMap = new Map(catalogRows.map((c) => [c.id, c]));

    // 3) DTO pour le front
    const rows = states.map((s) => {
      const cat = catalogMap.get(s.obligationId) ?? null;

      return {
        stateId: s.id,

        status: s.status,
        priority: s.priority,
        owner: s.owner ?? null,
        dueDate: toIso(s.dueDate),
        updatedAt: s.updatedAt.toISOString(),

        hasProof: s.proofs.length > 0,

        useCase: {
          id: s.useCase.id,
          key: s.useCase.key,
          title: s.useCase.title,
          sector: s.useCase.sector,
        },

        obligation: {
          id: s.obligationId,
          title: cat?.title ?? s.obligationId,
          legalRef: cat?.legalRef ?? null,
          category: cat?.category ?? null,
          criticality: cat?.criticality ?? null,
        },
      };
    });

    return NextResponse.json({
      ok: true,
      rows,
      meta: {
        total: rows.length,
      },
    });
  } catch (error) {
    console.error("GET /api/compliance/obligations error:", error);
    return NextResponse.json(
      { ok: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}