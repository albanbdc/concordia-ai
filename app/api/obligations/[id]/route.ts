// app/api/obligations/[id]/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ObligationDrawerSchema, PatchStateSchema } from "@/domain/concordia/drawer.contract";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

function toIso(d: Date | null | undefined) {
  return d ? d.toISOString() : null;
}

function safeMeta(m: unknown) {
  return m && typeof m === "object" && !Array.isArray(m) ? (m as Record<string, unknown>) : undefined;
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
      payload, // ✅ store payload
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
      auditAt: (p as any).auditAt ? new Date((p as any).auditAt).toISOString() : null,
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

// ================= GET =================
export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const payload = await buildDrawerPayload(id);
    if (!payload) return NextResponse.json({ error: "Obligation introuvable" }, { status: 404 });
    return NextResponse.json(payload);
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ================= PATCH =================
export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await req.json().catch(() => null);
    const parsed = PatchStateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Body invalide" }, { status: 400 });

    const before = await prisma.useCaseObligationState.findUnique({
      where: { id },
      select: { owner: true, dueDate: true, notes: true, status: true },
    });
    if (!before) return NextResponse.json({ error: "Obligation introuvable" }, { status: 404 });

    const actor = await getActorLabel();
    const beforeOwner = before.owner ?? null;
    const beforeDueIso = toIso(before.dueDate);
    const beforeNotes = before.notes ?? null;
    const beforeStatus = before.status ? String(before.status).toUpperCase() : null;

    const nextOwner = Object.prototype.hasOwnProperty.call(parsed.data, "owner") ? parsed.data.owner ?? null : beforeOwner;
    const nextNotes = Object.prototype.hasOwnProperty.call(parsed.data, "notes") ? parsed.data.notes ?? null : beforeNotes;
    const nextDueIso = Object.prototype.hasOwnProperty.call(parsed.data, "dueDate") ? (parsed.data.dueDate ?? null) : beforeDueIso;
    const nextStatus = Object.prototype.hasOwnProperty.call(parsed.data, "status") ? (parsed.data.status ?? null) : beforeStatus;

    await prisma.$transaction(async (tx) => {
      await tx.useCaseObligationState.update({
        where: { id },
        data: {
          owner: nextOwner,
          notes: nextNotes,
          dueDate: nextDueIso ? new Date(nextDueIso) : null,
          ...(nextStatus ? { status: String(nextStatus).toUpperCase() } : {}),
        },
      });

      if (nextOwner !== beforeOwner) {
        await appendHistoryTx(tx, {
          stateId: id,
          type: "OWNER_CHANGED",
          message: "Responsable mis à jour",
          actor,
          meta: { from: beforeOwner, to: nextOwner },
        });
      }

      if (nextDueIso !== beforeDueIso) {
        await appendHistoryTx(tx, {
          stateId: id,
          type: "DEADLINE_CHANGED",
          message: "Échéance mise à jour",
          actor,
          meta: { from: beforeDueIso, to: nextDueIso },
        });
      }

      if (nextNotes !== beforeNotes) {
        await appendHistoryTx(tx, {
          stateId: id,
          type: "NOTES_UPDATED",
          message: "Notes mises à jour",
          actor,
          meta: { from: beforeNotes, to: nextNotes },
        });
      }

      if (nextStatus !== beforeStatus && nextStatus) {
        await appendHistoryTx(tx, {
          stateId: id,
          type: "STATUS_CHANGED",
          message: "Statut mis à jour",
          actor,
          meta: { from: beforeStatus, to: nextStatus },
        });
      }
    });

    const payload = await buildDrawerPayload(id);
    if (!payload) return NextResponse.json({ error: "Obligation introuvable" }, { status: 404 });

    return NextResponse.json(payload);
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}