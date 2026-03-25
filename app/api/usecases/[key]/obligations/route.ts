export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OBLIGATIONS_CATALOG } from "@/lib/obligations-catalog";

async function requireOrg() {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any)?.organizationId) {
    throw new Error("UNAUTHORIZED");
  }
  return (session.user as any).organizationId as string;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const organizationId = await requireOrg();
    const { key } = await params;
    const body = await req.json();
    const { type, obligationId, title } = body;

    // Vérifier que le use case appartient à l'organisation
    const useCase = await prisma.useCase.findFirst({
      where: { key, organizationId },
    });

    if (!useCase) {
      return NextResponse.json({ ok: false, error: "USE_CASE_NOT_FOUND" }, { status: 404 });
    }

    if (type === "catalog") {
      // Vérifier que l'obligation existe dans le catalogue
      const catalogEntry = OBLIGATIONS_CATALOG.find((o) => o.id === obligationId);
      if (!catalogEntry) {
        return NextResponse.json({ ok: false, error: "OBLIGATION_NOT_FOUND" }, { status: 404 });
      }

      // Vérifier qu'elle n'existe pas déjà
      const existing = await prisma.useCaseObligationState.findUnique({
        where: { useCaseKey_obligationId: { useCaseKey: key, obligationId } },
      });

      if (existing) {
        return NextResponse.json({ ok: false, error: "OBLIGATION_ALREADY_EXISTS" }, { status: 400 });
      }

      const state = await prisma.useCaseObligationState.create({
        data: {
          useCaseKey: key,
          obligationId,
          status: "NOT_EVALUATED",
          priority: catalogEntry.criticality,
          openActions: 0,
        },
      });

      return NextResponse.json({ ok: true, state });

    } else if (type === "custom") {
      if (!title?.trim()) {
        return NextResponse.json({ ok: false, error: "TITLE_REQUIRED" }, { status: 400 });
      }

      // Créer une entrée dans ObligationCatalog pour l'obligation custom
      const customId = `CUSTOM-${key.slice(0, 8).toUpperCase()}-${Date.now()}`;

      await prisma.obligationCatalog.create({
        data: {
          id: customId,
          title: title.trim(),
          description: null,
          legalRef: null,
          category: "CUSTOM",
          criticality: "MEDIUM",
          updatedAt: new Date(),
        },
      });

      const state = await prisma.useCaseObligationState.create({
        data: {
          useCaseKey: key,
          obligationId: customId,
          status: "NOT_EVALUATED",
          priority: "MEDIUM",
          openActions: 0,
        },
      });

      return NextResponse.json({ ok: true, state });

    } else {
      return NextResponse.json({ ok: false, error: "INVALID_TYPE" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("ADD_OBLIGATION_ERROR", error);
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}