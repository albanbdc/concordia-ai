// app/api/vue-controleur/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function requireOrg() {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any)?.organizationId) {
    throw new Error("UNAUTHORIZED");
  }
  return (session.user as any).organizationId as string;
}

// Regroupement par chapitre AI Act
const CHAPTERS = [
  {
    id: "PROHIBITED",
    title: "Pratiques interdites",
    legalRef: "Article 5 AI Act",
    description: "Systèmes IA dont l'usage est strictement interdit par le règlement.",
    obligationIds: [] as string[], // géré dynamiquement
  },
  {
    id: "TRANSPARENCY",
    title: "Obligations de transparence",
    legalRef: "Article 50 AI Act",
    description: "Obligations d'information et de divulgation envers les personnes interagissant avec un système IA.",
    obligationIds: ["OBL-NORMAL-001", "OBL-NORMAL-002", "OBL-TRANSP-001", "OBL-TRANSP-002", "OBL-TRANSP-003"],
  },
  {
    id: "HR_DEPLOYER",
    title: "Haut risque — Déployeur",
    legalRef: "Article 26 + 27 + 29 AI Act",
    description: "Obligations applicables aux déployeurs de systèmes IA à haut risque (Annexe III).",
    obligationIds: ["OBL-HR-DEP-001", "OBL-HR-DEP-002", "OBL-HR-DEP-003", "OBL-HR-DEP-004", "OBL-HR-DEP-005", "OBL-HR-DEP-006", "OBL-HR-DEP-007"],
  },
  {
    id: "HR_PROVIDER",
    title: "Haut risque — Fournisseur",
    legalRef: "Articles 9 à 15 + 47-49 + 72-73 AI Act",
    description: "Obligations applicables aux fournisseurs de systèmes IA à haut risque.",
    obligationIds: ["OBL-HR-PROV-001", "OBL-HR-PROV-002", "OBL-HR-PROV-003", "OBL-HR-PROV-004", "OBL-HR-PROV-005", "OBL-HR-PROV-006", "OBL-HR-PROV-007", "OBL-HR-PROV-008", "OBL-HR-PROV-009", "OBL-HR-PROV-010"],
  },
  {
    id: "GPAI",
    title: "Modèles d'IA à usage général (GPAI)",
    legalRef: "Articles 51 à 55 AI Act",
    description: "Obligations spécifiques aux fournisseurs de modèles GPAI (GPT, Claude, Gemini, Mistral...).",
    obligationIds: ["OBL-GPAI-001", "OBL-GPAI-002", "OBL-GPAI-003", "OBL-GPAI-004", "OBL-GPAI-005"],
  },
];

export async function GET() {
  try {
    const organizationId = await requireOrg();

    // Catalogue complet
    const catalog = await prisma.obligationCatalog.findMany({
      select: { id: true, title: true, legalRef: true, category: true, criticality: true },
    });

    const catalogMap = new Map(catalog.map((c) => [c.id, c]));

    // États par use case
    const states = await prisma.useCaseObligationState.findMany({
      where: {
        useCase: { organizationId },
      },
      select: {
        obligationId: true,
        useCaseKey: true,
        status: true,
        useCase: {
          select: {
            key: true,
            title: true,
            sector: true,
            classification: true,
            role: true,
          },
        },
      },
    });

    // Agrégation par obligation
    type OblAgg = {
      useCases: Map<string, { key: string; title: string; sector: string; classification: string; role: string; status: string }>;
      compliant: number;
      inProgress: number;
      nonCompliant: number;
      notEvaluated: number;
    };

    const aggMap = new Map<string, OblAgg>();

    for (const s of states) {
      const oid = s.obligationId;
      if (!aggMap.has(oid)) {
        aggMap.set(oid, {
          useCases: new Map(),
          compliant: 0,
          inProgress: 0,
          nonCompliant: 0,
          notEvaluated: 0,
        });
      }

      const agg = aggMap.get(oid)!;
      const up = String(s.status).toUpperCase();

      agg.useCases.set(s.useCaseKey, {
        key: s.useCase.key,
        title: s.useCase.title,
        sector: s.useCase.sector,
        classification: s.useCase.classification,
        role: s.useCase.role,
        status: s.status,
      });

      if (up === "COMPLIANT") agg.compliant += 1;
      else if (up === "IN_PROGRESS") agg.inProgress += 1;
      else if (up === "NON_COMPLIANT") agg.nonCompliant += 1;
      else agg.notEvaluated += 1;
    }

    // Construction des chapitres
    const chapters = CHAPTERS.map((chapter) => {
      const obligations = chapter.obligationIds.map((oid) => {
        const cat = catalogMap.get(oid);
        const agg = aggMap.get(oid);

        const compliant = agg?.compliant ?? 0;
        const inProgress = agg?.inProgress ?? 0;
        const nonCompliant = agg?.nonCompliant ?? 0;
        const notEvaluated = agg?.notEvaluated ?? 0;
        const total = compliant + inProgress + nonCompliant + notEvaluated;
        const complianceRate = total > 0 ? Math.round((compliant / total) * 100) : 0;

        const useCases = agg ? Array.from(agg.useCases.values()) : [];

        return {
          id: oid,
          title: cat?.title ?? oid,
          legalRef: cat?.legalRef ?? null,
          criticality: cat?.criticality ?? null,
          useCasesCount: useCases.length,
          compliant,
          inProgress,
          nonCompliant,
          notEvaluated,
          complianceRate,
          useCases,
          globalStatus:
            nonCompliant > 0 ? "NON_COMPLIANT" :
            inProgress > 0 ? "IN_PROGRESS" :
            notEvaluated > 0 ? "NOT_EVALUATED" :
            compliant > 0 ? "COMPLIANT" : "EMPTY",
        };
      });

      const chapterCompliant = obligations.reduce((a, o) => a + o.compliant, 0);
      const chapterTotal = obligations.reduce((a, o) => a + o.compliant + o.inProgress + o.nonCompliant + o.notEvaluated, 0);
      const chapterRate = chapterTotal > 0 ? Math.round((chapterCompliant / chapterTotal) * 100) : 0;

      return {
        ...chapter,
        obligations,
        complianceRate: chapterRate,
        totalUseCases: new Set(obligations.flatMap((o) => o.useCases.map((u) => u.key))).size,
      };
    });

    return NextResponse.json({ ok: true, chapters, generatedAt: new Date().toISOString() });
  } catch (e: any) {
    if (e?.message === "UNAUTHORIZED") {
      return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: e?.message || "Erreur serveur" }, { status: 500 });
  }
}