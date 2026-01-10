import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  extractComplianceActionsFromAudit,
  ParsedAction,
} from "@/lib/complianceActions";

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

  // On va chercher l'audit en base
  const audit = await prisma.audit.findUnique({
    where: { id: auditId },
  });

  if (!audit) {
    return NextResponse.json(
      { error: "Audit introuvable." },
      { status: 404 }
    );
  }

  // On extrait les actions à partir du texte de l'audit
  const actions: ParsedAction[] = extractComplianceActionsFromAudit(
    audit.resultText
  );

  if (actions.length === 0) {
    return NextResponse.json(
      {
        success: true,
        message:
          "Aucune action détectée dans le plan d'action de cet audit.",
        createdCount: 0,
      },
      { status: 200 }
    );
  }

  // On supprime les actions existantes pour cet audit (pour éviter les doublons)
  await prisma.complianceAction.deleteMany({
    where: { auditId: audit.id },
  });

  // On recrée les actions, toutes en TODO
  await prisma.complianceAction.createMany({
    data: actions.map((a) => ({
      auditId: audit.id,
      title: a.title,
      description: a.description ?? null,
      status: "TODO",
      weight: a.weight ?? null,
    })),
  });

  return NextResponse.json(
    {
      success: true,
      createdCount: actions.length,
    },
    { status: 200 }
  );
}
