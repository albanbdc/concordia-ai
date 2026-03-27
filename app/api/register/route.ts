export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

function isEmailValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { orgName, sector, size, contactName, phone } = body;
    const email = String(body?.email ?? "").toLowerCase().trim();
    const password = String(body?.password ?? "").trim();

    // Validation champs requis
    if (!orgName || !contactName || !email || !password) {
      return NextResponse.json({ ok: false, error: "MISSING_FIELDS" }, { status: 400 });
    }

    if (!isEmailValid(email)) {
      return NextResponse.json({ ok: false, error: "Email invalide." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ ok: false, error: "PASSWORD_TOO_SHORT" }, { status: 400 });
    }

    // Vérification email unique
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ ok: false, error: "EMAIL_TAKEN" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Création organisation + user en transaction
    const result = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: orgName,
          sector: sector || null,
          size: size || null,
          contactName,
          contactPhone: phone || null,
        },
      });

      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          name: contactName,
          organizationId: organization.id,
        },
      });

      return { organization, user };
    });

    return NextResponse.json({
      ok: true,
      userId: result.user.id,
      organizationId: result.organization.id,
    }, { status: 201 });
  } catch (e: any) {
    console.error("[POST /api/register] error:", e);
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR", details: e?.message }, { status: 500 });
  }
}