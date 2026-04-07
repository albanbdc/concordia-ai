// app/api/obligations/route.ts
// Liste des obligations d’un cas d’usage (pour l’UI)
// ✅ On renvoie `id` (ID Prisma du state) pour ouvrir le drawer via /api/obligations/[id]
// ✅ PRIORITÉ 1 : JOIN avec ObligationCatalog pour enrichir l’obligation (title, description, etc.)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

function toIso(d: Date | null | undefined) {
  return d ? d.toISOString() : null;
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const organizationId = (session?.user as any)?.organizationId;
    if (!organizationId) {
      return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
    }

    const url = new URL(req.url);
    const useCaseKey = url.searchParams.get("useCaseKey");

    if (!useCaseKey || useCaseKey.length < 3) {
      return NextResponse.json(
        { ok: false, error: "Paramètre manquant : useCaseKey" },
        { status: 400 }
      );
    }

    // 1) États du registre vivant
    const rows = await prisma.useCaseObligationState.findMany({
      where: {
        useCase: {
          key: useCaseKey,
          organizationId,
        },
      },
      orderBy: [{ updatedAt: "desc" }],
      include: {
        history: {
          orderBy: { createdAt: "desc" },
          take: 1, // preview rapide
        },
      },
    });

    // 2) JOIN “manuel” avec le catalogue (sans dépendre d’une relation Prisma)
    const obligationIds = Array.from(
      new Set(rows.map((r) => r.obligationId).filter(Boolean))
    );

    const catalogRows =
      obligationIds.length > 0
        ? await prisma.obligationCatalog.findMany({
            where: { id: { in: obligationIds } },
            select: {
              id: true,
              title: true,
              description: true,
              legalRef: true,
              category: true,
              criticality: true,
            },
          })
        : [];

    const catalogMap = new Map(catalogRows.map((c) => [c.id, c]));

    // 3) DTO pour le front
    const obligations = rows.map((r) => {
      const cat = catalogMap.get(r.obligationId) ?? null;

      return {
        // ✅ ID Prisma du state (clé pour /api/obligations/[id])
        id: r.id,

        // Identifiant obligation (ex: rs-1)
        obligationId: r.obligationId,

        // ✅ Enrichissement catalogue (si trouvé)
        obligation: {
          id: r.obligationId,
          title: cat?.title ?? r.obligationId, // fallback
          description: cat?.description ?? null,
          legalRef: cat?.legalRef ?? null,
          category: cat?.category ?? null,
          criticality: cat?.criticality ?? null,
        },

        status: r.status,
        priority: r.priority,

        owner: r.owner ?? null,
        dueDate: toIso(r.dueDate),
        notes: r.notes ?? null,

        lastAuditId: r.lastAuditId ?? null,
        lastAuditAt: toIso(r.lastAuditAt),

        updatedAt: r.updatedAt.toISOString(),
        createdAt: r.createdAt.toISOString(),

        // Preview timeline
        historyPreview: r.history.map((h) => ({
          id: h.id,
          type: h.type,
          message: h.message,
          createdAt: h.createdAt.toISOString(),
          createdBy: h.actor ?? null,
        })),
      };
    });

    return NextResponse.json({
      ok: true,
      useCaseKey,
      obligations,
      meta: {
        states: rows.length,
        catalogFound: catalogRows.length,
        catalogMissing: Math.max(0, obligationIds.length - catalogRows.length),
      },
    });
  } catch (error) {
    console.error("GET /api/obligations error:", error);
    return NextResponse.json(
      { ok: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
