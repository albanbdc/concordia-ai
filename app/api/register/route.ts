export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Email de bienvenue — non bloquant
    try {
      const dashboardUrl = `${process.env.NEXTAUTH_URL}/dashboard`;

      await resend.emails.send({
        from: "Concordia <no-reply@concordia-ai.eu>",
        to: email,
        subject: "Bienvenue sur Concordia — votre registre AI Act est prêt",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
            <div style="font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Concordia</div>
            <div style="font-size: 13px; color: #64748b; margin-bottom: 32px;">Registre de conformité AI Act</div>

            <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px;">
              Bienvenue, ${contactName} 👋
            </div>

            <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 16px;">
              Votre espace de conformité AI Act est prêt. Vous pouvez dès maintenant déclarer vos systèmes IA, qualifier vos cas d'usage et commencer à suivre vos obligations réglementaires.
            </p>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
              <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px;">Votre espace</div>
              <div style="font-size: 13px; color: #475569; margin-bottom: 4px;">
                <span style="color: #94a3b8;">Organisation</span>&nbsp;&nbsp;${orgName}
              </div>
              <div style="font-size: 13px; color: #475569;">
                <span style="color: #94a3b8;">Email</span>&nbsp;&nbsp;${email}
              </div>
            </div>

            <a href="${dashboardUrl}" style="display: inline-block; background: #0f172a; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-size: 14px; font-weight: 600; margin-bottom: 24px;">
              Accéder à mon espace →
            </a>

            <p style="font-size: 13px; color: #475569; line-height: 1.6; margin-bottom: 8px;">
              <strong style="color: #0f172a;">Par où commencer ?</strong>
            </p>
            <ol style="font-size: 13px; color: #475569; line-height: 1.8; padding-left: 20px; margin-bottom: 24px;">
              <li>Déclarez votre premier système IA</li>
              <li>Qualifiez vos cas d'usage (niveau de risque AI Act)</li>
              <li>Suivez vos obligations réglementaires</li>
              <li>Constituez votre registre probatoire</li>
            </ol>

            <p style="font-size: 12px; color: #94a3b8; line-height: 1.6;">
              Une question ? Répondez directement à cet email ou contactez-nous à <a href="mailto:albantwd@gmail.com" style="color: #64748b;">albantwd@gmail.com</a>.
            </p>

            <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #cbd5e1;">
              Concordia · Règlement (UE) 2024/1689 · AI Act
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      // L'email échoue silencieusement — le compte est déjà créé
      console.error("[POST /api/register] welcome email error:", emailError);
    }

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