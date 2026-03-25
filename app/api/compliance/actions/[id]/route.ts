// app/api/compliance/actions/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ComplianceStatus } from "@prisma/client";

const ALLOWED_STATUS = new Set<ComplianceStatus>([
  ComplianceStatus.TODO,
  ComplianceStatus.IN_PROGRESS,
  ComplianceStatus.DONE,
]);

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: actionId } = await context.params;

    if (!actionId) {
      return NextResponse.json(
        { ok: false, error: "Missing action id" },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => null);
    const status = body?.status as ComplianceStatus | undefined;

    if (!status || !ALLOWED_STATUS.has(status)) {
      return NextResponse.json(
        { ok: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    const existing = await prisma.complianceAction.findUnique({
      where: { id: actionId },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "Action not found" },
        { status: 404 }
      );
    }

    await prisma.complianceAction.update({
      where: { id: actionId },
      data: { status },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PATCH /api/compliance/actions/[id] error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
