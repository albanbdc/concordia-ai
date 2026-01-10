import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeAuditHash } from "@/lib/auditIntegrity";

export async function POST(req: Request) {
  let body: any;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide." },
      { status: 400 }
    );
  }

  const { auditId } = body as { auditId?: string };

  if (!auditId) {
    return NextResponse.json(
      { error: "auditId manquant." },
      { status: 400 }
    );
  }

  const prismaAny = prisma as any;

  // 1) On récupère l'audit complet
  const audit = await prismaAny.audit.findUnique({
    where: { id: auditId },
  });

  if (!audit) {
    return NextResponse.json(
      { error: "Audit introuvable." },
      { status: 404 }
    );
  }

  // 2) On calcule le hash d'intégrité
  const hash = computeAuditHash(audit);

  const now = new Date();

  // 3) On met à jour l'audit avec les infos de certification
  const updatedAudit = await prismaAny.audit.update({
    where: { id: auditId },
    data: {
      integrityHash: hash,
      certified: true,
      certifiedAt: now,
      // plus tard : on pourra mettre le vrai user connecté
      certifiedBy: "system",
    },
  });

  // 4) On enregistre / met à jour la table AuditIntegrity (trace technique)
  await prismaAny.auditIntegrity.upsert({
    where: { auditId: auditId },
    update: {
      hash,
      algorithm: "SHA-256",
    },
    create: {
      auditId: auditId,
      hash,
      algorithm: "SHA-256",
    },
  });

  // 5) On log l'évènement dans AuditEvent
  await prismaAny.auditEvent.create({
    data: {
      auditId: auditId,
      type: "AUDIT_CERTIFIED",
      details: `Audit certifié avec le hash ${hash}`,
    },
  });

  return NextResponse.json(
    {
      success: true,
      auditId,
      certifiedAt: updatedAudit.certifiedAt,
      hash,
    },
    { status: 200 }
  );
}
