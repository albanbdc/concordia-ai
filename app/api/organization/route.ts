export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function requireOrg() {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any)?.organizationId) {
    throw new Error("UNAUTHORIZED");
  }
  return (session.user as any).organizationId as string;
}

export async function GET() {
  try {
    const organizationId = await requireOrg();

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        name: true,
        sector: true,
        size: true,
        contactName: true,
        contactEmail: true,
        contactPhone: true,
        createdAt: true,
      },
    });

    if (!org) {
      return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, organization: org });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const organizationId = await requireOrg();
    const body = await req.json();

    const { name, sector, size, contactName, contactEmail, contactPhone } = body;

    const org = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(sector !== undefined ? { sector } : {}),
        ...(size !== undefined ? { size } : {}),
        ...(contactName !== undefined ? { contactName } : {}),
        ...(contactEmail !== undefined ? { contactEmail } : {}),
        ...(contactPhone !== undefined ? { contactPhone } : {}),
      },
    });

    return NextResponse.json({ ok: true, organization: org });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}