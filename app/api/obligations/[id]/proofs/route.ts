// app/api/obligations/[id]/proofs/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sha256Hex(input: string) {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

function makeHash(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

async function getActorLabel(): Promise<string> {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (email && typeof email === "string" && email.length > 0) return email;
    const name = (session?.user as any)?.name;
    if (name && typeof name === "string" && name.length > 0) return name;
    return "CLIENT";
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

  // ✅ payload stocké (non-null)
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

const ParamsSchema = z.object({
  id: z.string().min(10, "ID invalide"),
});

const BodySchema = z.object({
  url: z.string().url("URL invalide"),
  label: z.string().max(200).optional(),
  type: z.string().optional(),
});

function normalizeProofType(raw?: string | null) {
  const t = String(raw || "").trim().toUpperCase();
  if (t === "FILE" || t === "LINK" || t === "DOCUMENT") return t;
  return "LINK";
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const rawParams = await context.params;
    const parsedParams = ParamsSchema.safeParse(rawParams);
    if (!parsedParams.success)
      return NextResponse.json({ error: "Paramètre invalide (id)" }, { status: 400 });

    const { id: stateId } = parsedParams.data;

    const rawBody = await req.json().catch(() => null);
    const parsedBody = BodySchema.safeParse(rawBody);
    if (!parsedBody.success)
      return NextResponse.json({ error: "Body invalide (url requise)" }, { status: 400 });

    const actor = await getActorLabel();
    const url = parsedBody.data.url;
    const label = parsedBody.data.label ?? null;
    const type = normalizeProofType(parsedBody.data.type);
    const serverTs = new Date().toISOString();

    const state = await prisma.useCaseObligationState.findUnique({
      where: { id: stateId },
      select: { id: true, lastAuditId: true, lastAuditAt: true },
    });

    if (!state) return NextResponse.json({ error: "Obligation introuvable" }, { status: 404 });

    const linkedAuditId = state.lastAuditId ?? null;
    const linkedAuditAtIso = state.lastAuditAt ? new Date(state.lastAuditAt).toISOString() : null;

    let createdProof: any;

    await prisma.$transaction(async (tx) => {
      createdProof = await tx.useCaseObligationProof.create({
        data: {
          stateId,
          url,
          label,
          type,
          actor,
          auditId: linkedAuditId,
          auditAt: state.lastAuditAt ?? null,
        },
        select: {
          id: true,
          url: true,
          label: true,
          type: true,
          actor: true,
          createdAt: true,
          auditId: true,
          auditAt: true,
        },
      });

      const integrityPayload = JSON.stringify({
        v: 1,
        action: "PROOF_ADDED",
        stateId,
        proofId: createdProof.id,
        url: createdProof.url,
        label: createdProof.label ?? null,
        type: createdProof.type,
        actor: actor || "CLIENT",
        auditId: createdProof.auditId ?? null,
        auditAt: createdProof.auditAt
          ? new Date(createdProof.auditAt).toISOString()
          : linkedAuditAtIso,
        serverTs,
      });

      const integrityHash = sha256Hex(integrityPayload);

      await appendHistoryTx(tx, {
        stateId,
        type: "PROOF_ADDED",
        message: "Preuve ajoutée au registre",
        actor,
        auditId: createdProof.auditId ?? null,
        auditAt: createdProof.auditAt ?? null,
        meta: {
          proofId: createdProof.id,
          url: createdProof.url,
          label: createdProof.label,
          type: createdProof.type,
          linkedAuditId: createdProof.auditId ?? null,
          linkedAuditAt: createdProof.auditAt
            ? new Date(createdProof.auditAt).toISOString()
            : linkedAuditAtIso,
          integrity: {
            algorithm: "SHA-256",
            hash: integrityHash,
            serverTs,
            payloadVersion: 1,
          },
        },
      });
    });

    return NextResponse.json({
      ok: true,
      proof: {
        id: createdProof.id,
        url: createdProof.url,
        label: createdProof.label,
        type: createdProof.type,
        createdAt: createdProof.createdAt?.toISOString?.() ?? createdProof.createdAt,
        createdBy: createdProof.actor ?? null,
        auditId: createdProof.auditId ?? null,
        auditAt: createdProof.auditAt ? new Date(createdProof.auditAt).toISOString() : null,
      },
    });
  } catch (error) {
    console.error("POST /api/obligations/[id]/proofs error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}