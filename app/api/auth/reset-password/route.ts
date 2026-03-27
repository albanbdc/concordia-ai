export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import bcrypt from "bcryptjs";

const resend = new Resend(process.env.RESEND_API_KEY);

// POST /api/auth/reset-password — demande de réinitialisation
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email ?? "").toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ ok: false, error: "EMAIL_REQUIRED" }, { status: 400 });
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({ where: { email } });

    // On répond toujours OK pour ne pas révéler si l'email existe
    if (!user) {
      return NextResponse.json({ ok: true });
    }

    // Expiration dans 1 heure
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    const resetToken = await prisma.passwordResetToken.create({
      data: { email, expiresAt },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${resetToken.token}`;

    await resend.emails.send({
      from: "Concordia <no-reply@concordia-ai.eu>",
to: email,
      subject: "Réinitialisation de votre mot de passe Concordia",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <div style="font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Concordia</div>
          <div style="font-size: 13px; color: #64748b; margin-bottom: 32px;">Registre de conformité AI Act</div>

          <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">
            Réinitialisation de mot de passe
          </div>

          <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 24px;">
            Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien est valable 1 heure.
          </p>

          <a href="${resetUrl}" style="display: inline-block; background: #0f172a; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-size: 14px; font-weight: 600; margin-bottom: 24px;">
            Réinitialiser mon mot de passe →
          </a>

          <p style="font-size: 12px; color: #94a3b8; line-height: 1.6;">
            Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe ne sera pas modifié.
          </p>

          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #cbd5e1;">
            Concordia · Règlement (UE) 2024/1689 · AI Act
          </div>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("RESET_PASSWORD_REQUEST_ERROR", error);
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

// PATCH /api/auth/reset-password — nouveau mot de passe
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json({ ok: false, error: "MISSING_FIELDS" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ ok: false, error: "PASSWORD_TOO_SHORT" }, { status: 400 });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json({ ok: false, error: "TOKEN_INVALID" }, { status: 400 });
    }

    if (resetToken.used) {
      return NextResponse.json({ ok: false, error: "TOKEN_USED" }, { status: 400 });
    }

    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json({ ok: false, error: "TOKEN_EXPIRED" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { email: resetToken.email },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { token },
        data: { used: true },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("RESET_PASSWORD_ERROR", error);
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}