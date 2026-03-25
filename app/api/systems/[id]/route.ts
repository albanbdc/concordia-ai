// app/api/systems/[id]/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireOrg() {
  const session = await getServerSession(authOptions);

  if (!session || !(session.user as any)?.organizationId) {
    throw new Error("UNAUTHORIZED");
  }

  return (session.user as any).organizationId as string;
}

// =====================
// GET - SINGLE SYSTEM
// =====================
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = await requireOrg();
    const { id } = params;

    const system = await prisma.system.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        useCases: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            key: true,
            title: true,
            sector: true,
            classification: true,
            isProhibited: true,
            role: true,
            isGPAI: true,
            createdAt: true,
          },
        },
      },
    });

    if (!system) {
      return NextResponse.json(
        { ok: false, error: "NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, system });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "UNAUTHORIZED_OR_INTERNAL_ERROR" },
      { status: 401 }
    );
  }
}