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
    organizationId: safeSession.user.organizationId as string,
  };
}

export async function GET(req: Request) {
  try {
    const { organizationId } = await requireSession();

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true },
    });

    const { searchParams } = new URL(req.url);
    const snapshotId = searchParams.get("snapshotId");

    let snapshot = null;

    if (snapshotId) {
      snapshot = await prisma.ledgerSnapshot.findFirst({
        where: {
          id: snapshotId,
          organizationId,
          sealed: true,
        },
      });

      if (!snapshot) {
        return NextResponse.json(
          { ok: false, error: "Snapshot introuvable" },
          { status: 404 }
        );
      }
    }

    const history = await prisma.useCaseObligationHistory.findMany({
      where: {
        state: {
          useCase: {
            organizationId,
          },
        },
        ...(snapshot
          ? {
              createdAt: {
                lte: snapshot.createdAt,
              },
            }
          : {}),
      },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      take: 500,
      select: {
        id: true,
        createdAt: true,
        type: true,
        message: true,
        actor: true,
        txHash: true,
        prevHash: true,
        payload: true,
        stateId: true,
        state: {
          select: {
            obligationId: true,
            obligation: {
              select: {
                title: true,
                legalRef: true,
              },
            },
            useCase: {
              select: {
                key: true,
                title: true,
              },
            },
          },
        },
      },
    });

    const chains: Record<string, string | null> = {};
    let chainValid = true;

    for (const h of history) {
      const stateId = h.stateId;

      if (!(stateId in chains)) {
        chains[stateId] = null;
      }

      const expectedPrev = chains[stateId];
      const expectedHash = makeHash(h.payload + (expectedPrev ?? ""));

      const isValid =
        expectedHash === h.txHash && h.prevHash === expectedPrev;

      if (!isValid) {
        chainValid = false;
      }

      chains[stateId] = h.txHash ?? null;
    }

    const latestSnapshot = await prisma.ledgerSnapshot.findFirst({
      where: {
        organizationId,
        sealed: true,
        active: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const snapshots = await prisma.ledgerSnapshot.findMany({
      where: {
        organizationId,
        sealed: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      ok: true,
      chainValid,
      history,
      snapshot: latestSnapshot ?? null,
      viewingSnapshot: snapshot ?? null,
      snapshots,
      organizationName: organization?.name ?? null,
    });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { ok: false, error: "Non autorisé" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { ok: false, error: e?.message || "Erreur ledger" },
      { status: 500 }
    );
  }
}