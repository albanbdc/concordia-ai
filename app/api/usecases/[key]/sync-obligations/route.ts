// app/api/usecases/[useCaseKey]/sync-obligations/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StrMap = { [k: string]: string };

function makeHash(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

async function requireSession() {
  const session = await getServerSession(authOptions);
  const organizationId = (session?.user as any)?.organizationId as string | undefined;
  if (!organizationId) throw new Error("UNAUTHORIZED");

  const actor =
    session?.user?.email ||
    (session?.user as any)?.name ||
    "CLIENT";

  return { organizationId, actor };
}

async function appendHistoryTx(
  tx: any,
  data: {
    stateId: string;
    type: string;
    message: string;
    actor?: string | null;
    auditId?: string | null;
    auditAt?: Date | null;
    meta?: any;
  }
) {
  const last = await tx.useCaseObligationHistory.findFirst({
    where: { stateId: data.stateId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }], // ✅ stable
    select: { txHash: true },
  });

  const prevHash = last?.txHash ?? null;

  const payload = JSON.stringify({
    stateId: data.stateId,
    type: data.type,
    message: data.message,
    actor: data.actor ?? null,
    auditId: data.auditId ?? null,
    auditAt: data.auditAt ? data.auditAt.toISOString() : null,
    meta: data.meta ?? null,
  });

  const txHash = makeHash(payload + (prevHash ?? ""));

  await tx.useCaseObligationHistory.create({
    data: {
      ...data,
      payload, // ✅ IMPORTANT
      txHash,
      prevHash,
    },
  });
}

const BodySchema = z.object({
  obligationIds: z.array(z.string().min(1)).min(1),
  obligationStatusMap: z.object({}).catchall(z.string()).optional(),
  auditId: z.string().nullable().optional(),
  auditAt: z.string().nullable().optional(),
});

function toDateOrNull(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export async function POST(req: Request, context: { params: Promise<{ useCaseKey: string }> }) {
  try {
    const { organizationId, actor: sessionActor } = await requireSession();
    const { useCaseKey } = await context.params;

    const raw = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Body invalide" }, { status: 400 });
    }

    const obligationIds = Array.from(
      new Set(parsed.data.obligationIds.map((x) => x.trim()).filter(Boolean))
    );

    const obligationStatusMap: StrMap = (parsed.data.obligationStatusMap ?? {}) as unknown as StrMap;

    const auditId = parsed.data.auditId ?? null;
    const auditAt = toDateOrNull(parsed.data.auditAt ?? null);

    const useCase = await prisma.useCase.findFirst({
      where: { key: useCaseKey, organizationId },
      select: { key: true },
    });

    if (!useCase) {
      return NextResponse.json({ ok: false, error: "Cas d’usage introuvable" }, { status: 404 });
    }

    for (const obligationId of obligationIds) {
      const nextStatus = (obligationStatusMap[obligationId] || "NON_COMPLIANT").toString();

      await prisma.$transaction(async (tx) => {
        const existing = await tx.useCaseObligationState.findFirst({
          where: { useCaseKey, obligationId },
          select: { id: true },
        });

        if (!existing) {
          const newState = await tx.useCaseObligationState.create({
            data: {
              useCaseKey,
              obligationId,
              status: nextStatus,
              priority: "MEDIUM",
              owner: null,
              dueDate: null,
              notes: null,
              lastAuditId: auditId,
              lastAuditAt: auditAt,
            },
            select: { id: true },
          });

          await appendHistoryTx(tx, {
            stateId: newState.id,
            type: "AUTO_STATE_CREATED",
            message: "Obligation ajoutée automatiquement au registre (audit)",
            actor: sessionActor,
            meta: { obligationId, useCaseKey },
            auditId,
            auditAt,
          });

          return;
        }

        await tx.useCaseObligationState.update({
          where: { id: existing.id },
          data: {
            status: nextStatus,
            lastAuditId: auditId,
            lastAuditAt: auditAt,
          },
        });

        await appendHistoryTx(tx, {
          stateId: existing.id,
          type: "AUTO_AUDIT_LINKED",
          message: "Obligation resynchronisée depuis un audit",
          actor: sessionActor,
          meta: { obligationId, useCaseKey },
          auditId,
          auditAt,
        });
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error?.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
    }
    console.error("POST /api/usecases/[useCaseKey]/sync-obligations error:", error);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500 });
  }
}