// app/api/suivi/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* =========================
   Utils
========================= */

function safeJsonParse<T = any>(raw: string | null | undefined): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Normalisation "stable" :
 * - trim
 * - lowercase
 * - enlève accents
 * - remplace tout ce qui n'est pas [a-z0-9] par "-"
 * - collapse des "-"
 */
function normalizeSlug(input: string): string {
  const s = String(input ?? "").trim().toLowerCase();
  if (!s) return "unknown";

  // retire accents
  const noAccents = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // remplace non alphanum par tirets
  const dashed = noAccents.replace(/[^a-z0-9]+/g, "-");

  // supprime tirets début/fin + collapse
  const clean = dashed.replace(/^-+|-+$/g, "").replace(/-+/g, "-");

  return clean || "unknown";
}

function buildUseCaseKey(sector: string, title: string) {
  return `${normalizeSlug(sector)}__${normalizeSlug(title)}`;
}

/* =========================
   Types (API)
========================= */

type UseCaseAuditPoint = {
  auditId: string;
  createdAt: string;
  sector: string;
  useCaseTitle: string;
  complianceScore?: number;
  systemStatus?: string;
  riskTier?: string;
};

type UseCaseEvolution = {
  key: string; // `${sectorNormalized}__${titleNormalized}`
  sector: string; // affichage (dernier "label" connu)
  useCaseTitle: string; // affichage (dernier "label" connu)
  count: number;
  lastCreatedAt: string;
  lastComplianceScore?: number;
  lastSystemStatus?: string;
  lastRiskTier?: string;
  timeline: UseCaseAuditPoint[]; // du + ancien au + récent
};

/* =========================
   GET /api/suivi
   - regroupe par secteur + titre (normalisés)
   - renvoie l'historique complet
========================= */

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limitParam = url.searchParams.get("limit");
    const limit = Math.min(Math.max(Number(limitParam || 2000), 1), 5000);

    const rows = await prisma.audit.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        createdAt: true,
        industrySector: true,
        useCaseType: true,
        inputText: true,
        resultText: true,
      },
    });

    // group map
    const map = new Map<string, UseCaseEvolution>();

    for (const a of rows) {
      const input = safeJsonParse<any>(a.inputText);
      const result = safeJsonParse<any>(a.resultText);

      // Affichage (fallbacks)
      const sectorDisplay =
        (a.industrySector && String(a.industrySector)) ||
        input?.system?.useCases?.[0]?.sector ||
        "non-classe";

      const titleDisplay =
        (a.useCaseType && String(a.useCaseType)) ||
        input?.system?.useCases?.[0]?.name ||
        input?.system?.name ||
        "Cas d’usage";

      // Clé NORMALISÉE (stable)
      const key = buildUseCaseKey(String(sectorDisplay), String(titleDisplay));

      const complianceScore =
        typeof result?.score?.overallScore === "number" ? Number(result.score.overallScore) : undefined;

      const point: UseCaseAuditPoint = {
        auditId: a.id,
        createdAt: a.createdAt.toISOString(),
        sector: String(sectorDisplay),
        useCaseTitle: String(titleDisplay),
        complianceScore,
        systemStatus: result?.systemStatus ? String(result.systemStatus) : undefined,
        riskTier: result?.riskTier ? String(result.riskTier) : undefined,
      };

      if (!map.has(key)) {
        map.set(key, {
          key,
          sector: String(sectorDisplay),
          useCaseTitle: String(titleDisplay),
          count: 0,
          lastCreatedAt: point.createdAt,
          lastComplianceScore: complianceScore,
          lastSystemStatus: point.systemStatus,
          lastRiskTier: point.riskTier,
          timeline: [],
        });
      }

      const group = map.get(key)!;

      // On incrémente + on ajoute au timeline
      group.count += 1;
      group.timeline.push(point);

      // On met à jour le "dernier état" si plus récent
      if (point.createdAt > group.lastCreatedAt) {
        group.lastCreatedAt = point.createdAt;
        group.lastComplianceScore = complianceScore;
        group.lastSystemStatus = point.systemStatus;
        group.lastRiskTier = point.riskTier;

        // On garde les derniers labels d’affichage (au cas où tu changes le wording)
        group.sector = String(sectorDisplay);
        group.useCaseTitle = String(titleDisplay);
      }
    }

    // timeline: du + ancien au + récent
    const items = Array.from(map.values()).map((it) => {
      it.timeline.sort((x, y) => (x.createdAt < y.createdAt ? -1 : x.createdAt > y.createdAt ? 1 : 0));
      return it;
    });

    // tri principal: derniers actifs en premier
    items.sort((a, b) => (a.lastCreatedAt < b.lastCreatedAt ? 1 : a.lastCreatedAt > b.lastCreatedAt ? -1 : 0));

    return NextResponse.json({ ok: true, items }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "Erreur serveur.", details: e?.message || String(e) },
      { status: 500 }
    );
  }
}
