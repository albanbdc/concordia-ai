export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/invite?token=xxx — valider un token
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ ok: false, error: "TOKEN_MISSING" }, { status: 400 });
    }

    const invitation = await prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return NextResponse.json({ ok: false, error: "TOKEN_INVALID" }, { status: 404 });
    }

    if (invitation.used) {
      return NextResponse.json({ ok: false, error: "TOKEN_USED" }, { status: 400 });
    }

    if (new Date() > invitation.expiresAt) {
      return NextResponse.json({ ok: false, error: "TOKEN_EXPIRED" }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      email: invitation.email,
      token: invitation.token,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

// POST /api/invite — générer un lien d'invitation (admin uniquement)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json();
    const { email } = body;

    // Expiration dans 7 jours
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await prisma.invitation.create({
      data: {
        email: email ?? null,
        expiresAt,
      },
    });

    const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/${invitation.token}`;

    return NextResponse.json({
      ok: true,
      token: invitation.token,
      inviteUrl,
      expiresAt: invitation.expiresAt,
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}