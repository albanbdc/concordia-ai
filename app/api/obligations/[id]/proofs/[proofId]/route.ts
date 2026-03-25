// app/api/obligations/[id]/proofs/[proofId]/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ObligationDrawerSchema } from "@/domain/concordia/drawer.contract";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toIso(d: Date | null | undefined) {
  return d ? d.toISOString() : null;
}

function safeMeta(m: unknown) {
  return m && typeof m === "object" && !Array.isArray(m)
    ? (m as Record<string, unknown>)
    : undefined;
}

function sha256Hex(input: string) {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

function makeHash(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function mapHistoryTypeToContractType(rawType: string): string {
  const t = String(rawType || "").trim();
  if (
    t === "STATE_CREATED" ||
    t === "OWNER_CHANGED" ||
    t === "DEADLINE_CHANGED" ||
    t === "NOTES_UPDATED" ||
    t === "STATUS_CHANGED" ||
    t === "PROOF_ADDED" ||
    t === "PROOF_REMOVED"
  )
    return t;

  if (t === "AUTO_STATE_CREATED") return "STATE_CREATED";
  if (t === "AUTO_STATUS_UPDATED") return "STATUS_CHANGED";
  if (t === "AUTO_AUDIT_LINKED") return "NOTES_UPDATED";
  if (t === "STATE_UPDATED") return "NOTES_UPDATED";

  return "NOTES_UPDATED";
}

async function getActorLabel(): Promise<string> {
  try {
    const session = await getServerSession(authOptions);
    return session?.user?.email || (session?.user as any)?.name || "CLIENT";
  } catch {
    return "CLIENT";
  }
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
    orderBy: { createdAt: "desc" },
    select: { txHash: true },
  });

  const prevHash = last?.txHash ?? null;

  // ✅ payload stocké (non-null) = base probatoire stable
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

async function buildDrawerPayload(stateId: string) {
  const state = await prisma.useCaseObligationState.findUnique({
    where: { id: stateId },
    include: {
      useCase: true,
      proofs: { where: { deletedAt: null }, orderBy: { createdAt: "desc" } },
      history: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!state) return null;

  const payload = {
    useCase: {
      id: state.useCase.id,
      key: state.useCase.key,
      title: state.useCase.title,
      sector: state.useCase.sector,
    },
    obligation: {
      id: state.obligationId,
      title: state.obligationId,
    },
    state: {
      id: state.id,
      obligationId: state.obligationId,
      status: state.status,
      priority: state.priority,
      owner: state.owner ?? null,
      dueDate: toIso(state.dueDate),
      notes: state.notes ?? null,
      lastAuditId: state.lastAuditId,
      lastAuditAt: toIso(state.lastAuditAt),
      createdAt: state.createdAt.toISOString(),
      updatedAt: state.updatedAt.toISOString(),
    },
    proofs: state.proofs.map((p) => ({
      id: p.id,
      type: p.type,
      label: p.label ?? undefined,
      name: p.label ?? undefined,
      url: p.url,
      createdAt: p.createdAt?.toISOString?.() ?? undefined,
      createdBy: p.actor ?? null,
      deletedAt: null,
      auditId: (p as any).auditId ?? null,
      auditAt: (p as any).auditAt
        ? new Date((p as any).auditAt).toISOString()
        : null,
    })),
    history: state.history.map((h) => ({
      id: h.id,
      type: mapHistoryTypeToContractType(h.type),
      message: h.message,
      createdAt: h.createdAt.toISOString(),
      createdBy: h.actor ?? null,
      meta: safeMeta(h.meta),
    })),
  };

  return ObligationDrawerSchema.parse(payload);
}

const ParamsSchema = z.object({
  id: z.string().min(10),
  proofId: z.string().min(10),
});

// ================= DELETE =================
export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string; proofId: string }> }
) {
  try {
    const { id: stateId, proofId } = ParamsSchema.parse(await context.params);
    const actor = await getActorLabel();
    const serverTs = new Date().toISOString();

    const proof = await prisma.useCaseObligationProof.findFirst({
      where: { id: proofId, stateId, deletedAt: null },
    });
    if (!proof)
      return NextResponse.json({ error: "Preuve introuvable" }, { status: 404 });

    const integrityPayload = JSON.stringify({
      v: 1,
      action: "PROOF_REMOVED",
      stateId,
      proofId: proof.id,
      url: proof.url,
      actor,
      serverTs,
    });

    const integrityHash = sha256Hex(integrityPayload);
    const deletedAt = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.useCaseObligationProof.update({
        where: { id: proof.id },
        data: { deletedAt },
      });

      await appendHistoryTx(tx, {
        stateId,
        type: "PROOF_REMOVED",
        message: "Preuve retirée du registre",
        actor,
        auditId: proof.auditId ?? null,
        auditAt: proof.auditAt ?? null,
        meta: {
          proofId: proof.id,
          integrity: { algorithm: "SHA-256", hash: integrityHash, serverTs },
        },
      });
    });

    const payload = await buildDrawerPayload(stateId);
    if (!payload)
      return NextResponse.json(
        { error: "Obligation introuvable" },
        { status: 404 }
      );

    return NextResponse.json(payload);
  } catch (error) {
    console.error("DELETE proof error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}