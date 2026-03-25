// app/api/obligations-globales/init/route.ts
// Init des obligations globales (ObligationState) à partir du catalogue (ObligationCatalog)
// POST /api/obligations-globales/init

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    // 1) Toutes les obligations du catalogue
    const catalog = await prisma.obligationCatalog.findMany({
      select: { id: true },
    });

    const catalogIds = catalog.map((c) => c.id).filter(Boolean);

    if (catalogIds.length === 0) {
      return NextResponse.json({ ok: true, created: 0, already: 0, totalCatalog: 0 });
    }

    // 2) Celles déjà initialisées en global
    const existing = await prisma.obligationState.findMany({
      where: { obligationId: { in: catalogIds } },
      select: { obligationId: true },
    });

    const existingSet = new Set(existing.map((e) => e.obligationId));
    const missing = catalogIds.filter((id) => !existingSet.has(id));

    // 3) Create uniquement celles manquantes
    if (missing.length > 0) {
      await prisma.obligationState.createMany({
        data: missing.map((obligationId) => ({
          id: crypto.randomUUID(),
          obligationId,
          updatedAt: new Date(),
          // status par défaut = NOT_EVALUATED (déjà dans Prisma)
        })),
        skipDuplicates: true, // sécurité
      });
    }

    return NextResponse.json({
      ok: true,
      created: missing.length,
      already: existing.length,
      totalCatalog: catalogIds.length,
    });
  } catch (error) {
    console.error("POST /api/obligations-globales/init error:", error);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500 });
  }
}
