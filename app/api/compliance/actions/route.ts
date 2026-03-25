// app/api/compliance/actions/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ComplianceStatus } from "@prisma/client";

function str(v: any, fallback = "") {
  const s = typeof v === "string" ? v.trim() : "";
  return s || fallback;
}

function asComplianceStatus(v: any): ComplianceStatus {
  const s = String(v || "").toUpperCase().trim();
  if (s === "TODO") return ComplianceStatus.TODO;
  if (s === "IN_PROGRESS") return ComplianceStatus.IN_PROGRESS;
  if (s === "DONE") return ComplianceStatus.DONE;
  return ComplianceStatus.TODO;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limitParam = url.searchParams.get("limit");
    const limit = Math.min(Math.max(Number(limitParam || 500), 1), 2000);

    const actions = await prisma.complianceAction.findMany({
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        audit: {
          select: {
            id: true,
            createdAt: true,
            industrySector: true,
            useCaseType: true,
            type: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        ok: true,
        actions: actions.map((a) => ({
          id: a.id,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
          obligationId: a.obligationId,
          title: a.title,
          description: a.description,
          priority: a.priority,
          owner: a.owner,
          status: a.status,
          source: a.source,
          auditId: a.auditId,
          auditCreatedAt: a.audit.createdAt,
          sector: a.audit.industrySector,
          useCaseTitle: a.audit.useCaseType,
        })),
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "Erreur serveur.", details: e?.message || String(e) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const auditId = str(body?.auditId);
    if (!auditId) {
      return NextResponse.json(
        { ok: false, error: "Missing auditId" },
        { status: 400 }
      );
    }

    // ⚠️ IMPORTANT : ton modèle Prisma exige auditId (non nullable)
    const auditExists = await prisma.audit.findUnique({
      where: { id: auditId },
      select: { id: true },
    });

    if (!auditExists) {
      return NextResponse.json(
        { ok: false, error: "Audit not found" },
        { status: 404 }
      );
    }

    const obligationId = str(body?.obligationId, "unknown");
    const obligationLabel = str(body?.obligationLabel);
    const title =
      obligationLabel ||
      (obligationId !== "unknown" ? `Obligation ${obligationId}` : "Action de conformité");

    const description = typeof body?.description === "string" ? body.description : null;

    // Ton schema stocke owner/priority/source en String -> on garde simple
    const owner = str(body?.owner, "CLIENT");
    const priority = str(body?.priority, "MEDIUM");
    const source = str(body?.source, "ENGINE");

    const status = asComplianceStatus(body?.status);

    const created = await prisma.complianceAction.create({
      data: {
        auditId,
        obligationId,
        title,
        description,
        owner,
        priority,
        source,
        status,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, actionId: created.id }, { status: 201 });
  } catch (e: any) {
    console.error("[POST /api/compliance/actions]", e);
    return NextResponse.json(
      { ok: false, error: "Erreur serveur.", details: e?.message || String(e) },
      { status: 500 }
    );
  }
}
