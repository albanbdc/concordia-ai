// app/api/usecases/resolve-key/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const useCaseId = searchParams.get("useCaseId");

    if (!useCaseId) {
      return NextResponse.json({ ok: false, error: "MISSING_ID" }, { status: 400 });
    }

    const useCase = await prisma.useCase.findFirst({
      where: {
        id: useCaseId,
      },
      select: {
        key: true,
      },
    });

    if (!useCase?.key) {
      return NextResponse.json({ ok: true, key: null });
    }

    return NextResponse.json({ ok: true, key: useCase.key });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}