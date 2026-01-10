import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { auditId, modelName, modelVersion, apiProvider } = body;

    if (!auditId) {
      return NextResponse.json(
        { error: "AuditId manquant." },
        { status: 400 }
      );
    }

    const created = await prisma.auditVersion.create({
      data: {
        auditId,
        modelName: modelName || "gpt-5.1",
        modelVersion: modelVersion || "unknown",
        apiProvider: apiProvider || "OpenAI",
      },
    });

    return NextResponse.json({ success: true, version: created });
  } catch (err) {
    console.error("Erreur store-version :", err);
    return NextResponse.json(
      { error: "Erreur interne." },
      { status: 500 }
    );
  }
}
