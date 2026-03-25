export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function makeHash(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

async function getActorLabel(): Promise<string> {
  try {
    const session = await getServerSession(authOptions);
    return session?.user?.email || (session?.user as any)?.name || "CLIENT";
  } catch {
    return "CLIENT";
  }
}

// ================= POST = CREATE SNAPSHOT =================
export async function POST() {
  try {
    const actor = await getActorLabel();

    const org = await prisma.organization.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!org) {
      return NextResponse.json(
        { ok: false, error: "Aucune organisation trouvée" },
        { status: 400 }
      );
    }

    // ✅ MIGRATION AUTO : snapshots existants sans organizationId
    await prisma.ledgerSnapshot.updateMany({
      where: {
        organizationId: null,
      },
      data: {
        organizationId: org.id,
      },
    });

    const history = await prisma.useCaseObligationHistory.findMany({
      orderBy: { createdAt: "asc" },
      take: 500,
    });

    let prevHash: string | null = null;
    let lastHash: string | null = null;

    for (const h of history) {
      const payload = JSON.stringify({
        stateId: h.stateId,
        type: h.type,
        message: h.message,
        actor: h.actor ?? null,
        auditId: h.auditId ?? null,
        auditAt: h.auditAt ? new Date(h.auditAt).toISOString() : null,
        meta: h.meta ?? null,
      });

      const expectedHash = makeHash(payload + (prevHash ?? ""));
      lastHash = expectedHash;
      prevHash = expectedHash;
    }

    const snapshot = await prisma.$transaction(async (tx) => {
      await tx.ledgerSnapshot.updateMany({
        data: { active: false },
      });

      return tx.ledgerSnapshot.create({
        data: {
          headHash: lastHash,
          actor,
          active: true,
          organizationId: org.id,
        },
      });
    });

    return NextResponse.json({
      ok: true,
      snapshotId: snapshot.id,
      headHash: snapshot.headHash,
      createdAt: snapshot.createdAt,
      active: snapshot.active,
      organizationId: snapshot.organizationId,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Erreur snapshot" },
      { status: 500 }
    );
  }
}

// ================= GET = LIST SNAPSHOTS =================
export async function GET() {
  try {
    const snapshots = await prisma.ledgerSnapshot.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        organization: true,
      },
    });

    return NextResponse.json({
      ok: true,
      snapshots,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message || "Erreur snapshot list" },
      { status: 500 }
    );
  }
}