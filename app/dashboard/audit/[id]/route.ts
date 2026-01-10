import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = {
  params: { id: string };
};

export async function GET(_req: Request, { params }: RouteParams) {
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { error: "Identifiant d'audit manquant." },
      { status: 400 }
    );
  }

  try {
    const audit = await prisma.audit.findUnique({
      where: { id },
    });

    if (!audit) {
      return NextResponse.json(
        { error: "Audit introuvable pour cet identifiant." },
        { status: 404 }
      );
    }

    return NextResponse.json(audit, { status: 200 });
  } catch (error) {
    console.error("Erreur GET /api/audit/[id] :", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération de l'audit." },
      { status: 500 }
    );
  }
}
