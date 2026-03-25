// app/api/systems/route.ts
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
  async function requireOrg() {
  const session = await getServerSession(authOptions);

  console.log("SESSION DEBUG →", session);

  if (!session || !(session.user as any)?.organizationId) {
    throw new Error("UNAUTHORIZED");
  }

  return (session.user as any).organizationId as string;
}
}

// =====================
// GET - LIST SYSTEMS
// =====================
export async function GET() {
  try {
    const organizationId = await requireOrg();

    const systems = await prisma.system.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        provider: true,
        version: true,
        owner: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ok: true, systems });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "UNAUTHORIZED_OR_INTERNAL_ERROR" },
      { status: 401 }
    );
  }
}

// =====================
// POST - CREATE SYSTEM
// =====================
export async function POST(req: Request) {
  try {
    const organizationId = await requireOrg();
    const body = await req.json();

    const { name, provider, version, owner } = body;

    if (!name || !owner) {
      return NextResponse.json(
        { ok: false, error: "MISSING_REQUIRED_FIELDS" },
        { status: 400 }
      );
    }

    const system = await prisma.system.create({
      data: {
        name,
        provider: provider || null,
        version: version || null,
        owner,
        organizationId,
      },
    });

    return NextResponse.json({ ok: true, system });
  } catch (error) {
    console.error("CREATE_SYSTEM_ERROR", error);
    return NextResponse.json(
      { ok: false, error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}