import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    // On récupère l'ID directement depuis l'URL
    const url = new URL(req.url);
    const segments = url.pathname.split("/").filter(Boolean);
    const id = segments[segments.length - 1];

    if (!id) {
      return NextResponse.json(
        { error: "Identifiant d'audit manquant." },
        { status: 400 }
      );
    }

    const audit = await prisma.audit.findUnique({
      where: { id },
    });

    if (!audit) {
      return NextResponse.json(
        { error: "Audit introuvable." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      audit: {
        id: audit.id,
        createdAt: audit.createdAt,
        type: audit.type,
        industrySector: audit.industrySector,
        useCaseType: audit.useCaseType,
        internalDepartment: audit.internalDepartment,
        inputText: audit.inputText,
        resultText: audit.resultText,
      },
    });
  } catch (error) {
    console.error("Erreur API audit/pdf/[id]:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération de l'audit." },
      { status: 500 }
    );
  }
}
