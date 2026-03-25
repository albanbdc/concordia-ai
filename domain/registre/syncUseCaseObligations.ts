// domain/registre/syncUseCaseObligations.ts
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

type StrMap = { [k: string]: string };

function makeHash(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

async function appendHistoryTx(
  tx: typeof prisma,
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
  // 🔒 Relecture forte du dernier hash
  const last = await tx.useCaseObligationHistory.findFirst({
    where: { stateId: data.stateId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
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

  // 🔒 Vérification anti-race : on relit juste avant insert
  const lastCheck = await tx.useCaseObligationHistory.findFirst({
    where: { stateId: data.stateId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: { txHash: true },
  });

  const currentHead = lastCheck?.txHash ?? null;

  if (currentHead !== prevHash) {
    throw new Error("Ledger race condition detected. Append aborted.");
  }

  await tx.useCaseObligationHistory.create({
    data: {
      ...data,
      payload,
      txHash,
      prevHash,
    },
  });
}

export async function syncUseCaseObligations(params: {
  useCaseKey: string;
  obligationIds: string[];
  obligationStatusMap?: StrMap;
  auditId?: string | null;
  auditAt?: Date | null;
  actor?: string | null;
}) {
  const {
    useCaseKey,
    obligationIds,
    obligationStatusMap = {},
    auditId = null,
    auditAt = null,
    actor = "ENGINE",
  } = params;

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

        await appendHistoryTx(tx as any, {
          stateId: newState.id,
          type: "AUTO_STATE_CREATED",
          message: "Obligation ajoutée automatiquement au registre (audit)",
          actor,
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

      await appendHistoryTx(tx as any, {
        stateId: existing.id,
        type: "AUTO_AUDIT_LINKED",
        message: "Obligation resynchronisée depuis un audit",
        actor,
        meta: { obligationId, useCaseKey },
        auditId,
        auditAt,
      });
    });
  }
}