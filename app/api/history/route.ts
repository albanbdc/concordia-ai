// app/api/history/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

function makeHash(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

async function requireSession() {
  const session = await getServerSession(authOptions);

  if (!(session?.user as any)?.organizationId) {
    throw new Error("UNAUTHORIZED");
  }

  const safeSession = session as any;

  return {
    actor: safeSession.user?.email || safeSession.user?.name || "CLIENT",
    organizationId: safeSession.user.organizationId as string,
  };
}

// ================= POST = CREATE SNAPSHOT =================
export async function POST() {
  try {
    const { actor, organizationId } = await requireSession();

    const [lastHistory, historyCount] = await Promise.all([
      prisma.useCaseObligationHistory.findFirst({
        where: {
          state: {
            useCase: {
              organizationId,
            },
          },
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        select: { txHash: true },
      }),
      prisma.useCaseObligationHistory.count({
        where: {
          state: {
            useCase: {
              organizationId,
            },
          },
        },
      }),
    ]);

    const headHash = lastHistory?.txHash ?? null;
    const snapshotHash = makeHash((headHash ?? "") + historyCount.toString());

    const snapshot = await prisma.$transaction(async (tx) => {
      await tx.ledgerSnapshot.updateMany({
        where: { organizationId },
        data: { active: false },
      });

      return tx.ledgerSnapshot.create({
        data: {
          headHash,
          historyCount,
          snapshotHash,
          sealed: true,
          actor,
          active: true,
          organizationId,
        },
      });
    });

    return NextResponse.json({
      ok: true,
      snapshotId: snapshot.id,
      headHash: snapshot.headHash,
      historyCount: snapshot.historyCount,
      snapshotHash: snapshot.snapshotHash,
      sealed: snapshot.sealed,
      createdAt: snapshot.createdAt,
    });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
    }

    return NextResponse.json(
      { ok: false, error: e?.message || "Erreur snapshot" },
      { status: 500 }
    );
  }
}

// ================= GET = SNAPSHOTS + HISTORY =================
export async function GET() {
  try {
    const { organizationId } = await requireSession();

    const snapshots = await prisma.ledgerSnapshot.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const rawHistory = await prisma.useCaseObligationHistory.findMany({
      where: {
        state: {
          useCase: {
            organizationId,
          },
        },
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      take: 1000,
      include: {
        state: {
          include: {
            useCase: true,
          },
        },
      },
    });

    const chains: Record<string, string | null> = {};
    const chainStatus: Record<string, boolean> = {};

    const verified = rawHistory.map((h) => {
      const stateId = h.stateId;

      if (!(stateId in chains)) {
        chains[stateId] = null;
        chainStatus[stateId] = true;
      }

      const expectedPrevHash = chains[stateId];

      const payloadStr =
        typeof (h as any).payload === "string"
          ? ((h as any).payload as string)
          : "";

      const expectedHash = makeHash(payloadStr + (expectedPrevHash ?? ""));
      const isChained =
        expectedHash === h.txHash && h.prevHash === expectedPrevHash;

      if (!isChained) {
        chainStatus[stateId] = false;
      }

      chains[stateId] = h.txHash ?? null;

      return {
        id: h.id,
        createdAt: h.createdAt,
        eventType: h.type,
        actor: h.actor,
        obligationId: h.state?.obligationId ?? null,
        useCaseKey: h.state?.useCase?.title ?? null,
        txHash: h.txHash,
        prevHash: h.prevHash,
        chained: isChained,
      };
    });

    const chainValid = Object.values(chainStatus).every((v) => v === true);

    return NextResponse.json({
      ok: true,
      chainValid,
      snapshots,
      history: verified.reverse(),
    });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
    }

    return NextResponse.json(
      { ok: false, error: e?.message || "Erreur history" },
      { status: 500 }
    );
  }
}