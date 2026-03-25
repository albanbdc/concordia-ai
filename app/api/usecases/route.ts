export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getObligationsForClassificationAndRole } from "@/lib/obligations-catalog";

function toInt(v: string | null, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function slugify(input: string) {
  const s = String(input || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/["']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return s || "unknown";
}

function normalizeTitleForKey(title: string) {
  let t = String(title || "").trim();
  t = t.replace(/["']/g, "");
  t = t.replace(/\s+/g, " ").trim();
  return t || "Cas d'usage";
}

function computeGroupKey(title: string) {
  return slugify(normalizeTitleForKey(title));
}

async function requireOrg() {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any)?.organizationId) {
    throw new Error("UNAUTHORIZED");
  }
  return (session.user as any).organizationId as string;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = toInt(url.searchParams.get("limit"), 200);

    const useCases = await prisma.useCase.findMany({
      orderBy: [{ updatedAt: "desc" }],
      take: Math.min(limit, 500),
      select: {
        key: true,
        title: true,
        sector: true,
        updatedAt: true,
        obligations: {
          select: {
            status: true,
          },
        },
      },
    });

    const result = useCases.map((uc) => {
      const total = uc.obligations.length;
      const compliant = uc.obligations.filter(
        (o) => String(o.status).toUpperCase() === "COMPLIANT"
      ).length;
      const inProgress = uc.obligations.filter(
        (o) => String(o.status).toUpperCase() === "IN_PROGRESS"
      ).length;
      const nonCompliant = uc.obligations.filter(
        (o) => String(o.status).toUpperCase() === "NON_COMPLIANT"
      ).length;

      return {
        key: uc.key,
        title: uc.title,
        sector: uc.sector,
        updatedAt: uc.updatedAt.toISOString(),
        counts: {
          total,
          compliant,
          inProgress,
          nonCompliant,
        },
      };
    });

    return NextResponse.json({ ok: true as const, useCases: result });
  } catch (error) {
    console.error("GET /api/usecases error:", error);
    return NextResponse.json(
      { ok: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const organizationId = await requireOrg();
    const body = await req.json();

    const {
      systemId,
      title,
      sector,
      role,
      // Annexe III — 8 domaines
      affectsEmployment,
      affectsEducation,
      affectsEssentialServices,
      affectsJustice,
      affectsCriticalInfrastructure,
      affectsLawEnforcement,
      affectsMigration,
      affectsBorderManagement,
      // Annexe I — produits réglementés
      isAnnexeI,
      annexeIDomain,
      // Transparence
      interactsWithPeople,
      // GPAI
      isGPAI,
      // Article 5
      usesSubliminalTechniques,
      exploitsVulnerabilities,
      socialScoring,
      predictivePolicing,
      realTimeBiometricIdentification,
    } = body;

    // Validation champs requis
    if (!systemId || !title || !sector) {
      return NextResponse.json(
        { ok: false, error: "MISSING_REQUIRED_FIELDS" },
        { status: 400 }
      );
    }

    // Validation Annexe I
    if (isAnnexeI && !annexeIDomain) {
      return NextResponse.json(
        { ok: false, error: "ANNEXE_I_DOMAIN_REQUIRED" },
        { status: 400 }
      );
    }

    // Validation rôle
    const validRoles = ["DEPLOYER", "PROVIDER", "BOTH"];
    const useCaseRole = validRoles.includes(role) ? role : "DEPLOYER";

    // Vérification système
    const system = await prisma.system.findFirst({
      where: { id: systemId, organizationId },
    });

    if (!system) {
      return NextResponse.json(
        { ok: false, error: "SYSTEM_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Vérification Article 5 — pratiques interdites
    const isProhibited =
      usesSubliminalTechniques ||
      exploitsVulnerabilities ||
      socialScoring ||
      predictivePolicing ||
      realTimeBiometricIdentification;

    if (isProhibited) {
      return NextResponse.json(
        { ok: false, error: "PROHIBITED_PRACTICE" },
        { status: 400 }
      );
    }

    // Classification
    // Annexe III
    const isHighRiskAnnexeIII =
      affectsEmployment ||
      affectsEducation ||
      affectsEssentialServices ||
      affectsJustice ||
      affectsCriticalInfrastructure ||
      affectsLawEnforcement ||
      affectsMigration ||
      affectsBorderManagement;

    // Annexe I — composant de sécurité d'un produit réglementé
    const isHighRiskAnnexeI = isAnnexeI === true && !!annexeIDomain;

    const isHighRisk = isHighRiskAnnexeIII || isHighRiskAnnexeI;

    let classification: "HIGH_RISK" | "TRANSPARENCY" | "NORMAL" = "NORMAL";

    if (isHighRisk) {
      classification = "HIGH_RISK";
    } else if (interactsWithPeople || isGPAI) {
      classification = "TRANSPARENCY";
    }

    // Catégorie Annexe III principale
    let annexCategory: string | null = null;
    if (affectsEmployment) annexCategory = "EMPLOYMENT";
    else if (affectsEducation) annexCategory = "EDUCATION";
    else if (affectsEssentialServices) annexCategory = "ESSENTIAL_SERVICES";
    else if (affectsJustice) annexCategory = "JUSTICE";
    else if (affectsCriticalInfrastructure) annexCategory = "CRITICAL_INFRASTRUCTURE";
    else if (affectsLawEnforcement) annexCategory = "LAW_ENFORCEMENT";
    else if (affectsMigration) annexCategory = "MIGRATION";
    else if (affectsBorderManagement) annexCategory = "MIGRATION";
    // Annexe I override si pas de catégorie III
    else if (isHighRiskAnnexeI) annexCategory = `ANNEXE_I_${annexeIDomain}`;

    const key =
      computeGroupKey(title) + "-" + Math.random().toString(16).slice(2, 6);

    // Création du use case
    const useCase = await prisma.useCase.create({
      data: {
        key,
        title,
        sector,
        organizationId,
        systemId,
        classification,
        role: useCaseRole,
        isGPAI: isGPAI === true,
        ...(annexCategory ? { annexCategory: annexCategory as any } : {}),
        requiresTransparency: interactsWithPeople || isGPAI,
      },
    });

    // Mise à jour statut système si HIGH_RISK
    if (classification === "HIGH_RISK") {
      await prisma.system.update({
        where: { id: systemId },
        data: { status: "CONFORMITE_RENFORCEE_REQUISE" },
      });
    }

    // Génération automatique des obligations
    const obligations = getObligationsForClassificationAndRole(
      classification,
      useCaseRole,
      isGPAI === true
    );

    for (const obligation of obligations) {
      await prisma.useCaseObligationState.create({
        data: {
          useCaseKey: key,
          obligationId: obligation.id,
          status: "NOT_EVALUATED",
          priority: obligation.criticality,
          openActions: 0,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      useCase,
      classification,
      role: useCaseRole,
      annexCategory,
      isAnnexeI: isHighRiskAnnexeI,
      annexeIDomain: isHighRiskAnnexeI ? annexeIDomain : null,
      obligationsCreated: obligations.length,
    });
  } catch (error) {
    console.error("CREATE_USECASE_ERROR", error);
    return NextResponse.json(
      { ok: false, error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}