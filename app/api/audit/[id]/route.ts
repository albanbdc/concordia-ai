// app/api/audit/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing auditId" }, { status: 400 });
  }

  try {
    const audit = await prisma.audit.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        createdAt: true,
        inputText: true,
        resultText: true,
      },
    });

    if (!audit) {
      return NextResponse.json({ ok: false, error: "Audit not found" }, { status: 404 });
    }

    let input: any = null;
    let result: any = null;

    try {
      input = audit.inputText ? JSON.parse(audit.inputText) : null;
    } catch {
      input = null;
    }

    try {
      result = audit.resultText ? JSON.parse(audit.resultText) : null;
    } catch {
      result = null;
    }

    return NextResponse.json(
      {
        ok: true,
        audit: {
          id: audit.id,
          type: audit.type,
          createdAt: audit.createdAt,
          input,
          result,
        },
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("[GET /api/audit/[id]] error:", e);
    return NextResponse.json(
      { ok: false, error: "Server error", details: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
