import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["TODO", "IN_PROGRESS", "DONE"] as const;
type Status = (typeof VALID_STATUSES)[number];

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  // Next 16 : params est un Promise -> on l'attend
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { error: "Identifiant d'action manquant." },
      { status: 400 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide." },
      { status: 400 }
    );
  }

  const { status } = body as { status?: Status };

  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: "Statut invalide." },
      { status: 400 }
    );
  }

  // 🔧 On relâche TypeScript ici
  const prismaAny = prisma as any;

  try {
    const updated = await prismaAny.complianceAction.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, action: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour." },
      { status: 500 }
    );
  }
}
