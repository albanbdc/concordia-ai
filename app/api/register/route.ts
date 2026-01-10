import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

function isEmailValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const emailRaw = String(body?.email ?? "");
    const passwordRaw = String(body?.password ?? "");

    const email = emailRaw.toLowerCase().trim();
    const password = passwordRaw.trim();

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Email et mot de passe requis." },
        { status: 400 }
      );
    }

    if (!isEmailValid(email)) {
      return NextResponse.json(
        { ok: false, error: "Email invalide." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { ok: false, error: "Mot de passe trop court (min 8 caractères)." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { ok: false, error: "Un compte existe déjà avec cet email." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ok: true, user }, { status: 201 });
  } catch (e: any) {
    console.error("[POST /api/register] error:", e);
    return NextResponse.json(
      { ok: false, error: "Erreur serveur.", details: e?.message },
      { status: 500 }
    );
  }
}
