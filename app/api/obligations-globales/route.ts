// app/api/obligations-globales/route.ts
// Vue "Obligations globales" (cockpit contrôleur)
// - Agrège ObligationState (global) + JOIN ObligationCatalog (title/legalRef/category/criticality)
// - Filtres: article (match legalRef), q (search), status, category, criticality
// - Retourne: stats + liste triée

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function toIso(d: Date | null | undefined) {
  return d ? d.toISOString() : null;
}

function norm(v: string | null | undefined) {
  return String(v ?? "").trim();
}

function upper(v: string | null | undefined) {
  return norm(v).toUpperCase();
}

function statusRank(status: string) {
  const s = upper(status);
  if (s === "NON_COMPLIANT") return 0;
  if (s === "IN_PROGRESS") return 1;
  if (s === "NOT_EVALUATED") return 2;
  if (s === "COMPLIANT") return 3;
  return 9;
}

function safeTakeInt(v: string | null, fallback: number, min: number, max: number) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  const i = Math.floor(n);
  if (i < min) return min;
  if (i > max) return max;
  return i;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    // "article" = ce que tape le contrôleur (ex: "Article 9", "Art. 10", "9")
    const article = norm(url.searchParams.get("article"));
    const q = norm(url.searchParams.get("q"));
    const status = upper(url.searchParams.get("status")); // ALL | NON_COMPLIANT | IN_PROGRESS | NOT_EVALUATED | COMPLIANT
    const category = norm(url.searchParams.get("category"));
    const criticality = upper(url.searchParams.get("criticality")); // LOW | MEDIUM | HIGH | CRITICAL
    const take = safeTakeInt(url.searchParams.get("take"), 200, 1, 500);

    // 1) Charger les states globaux + 1 event d’historique (preview)
    const states = await prisma.obligationState.findMany({
      orderBy: [{ updatedAt: "desc" }],
      take,
      include: {
        history: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    // 2) JOIN catalogue (manuel)
    const obligationIds = Array.from(new Set(states.map((s) => s.obligationId).filter(Boolean)));
    const catalog =
      obligationIds.length > 0
        ? await prisma.obligationCatalog.findMany({
            where: { id: { in: obligationIds } },
            select: {
              id: true,
              title: true,
              description: true,
              legalRef: true,
              category: true,
              criticality: true,
              updatedAt: true,
            },
          })
        : [];

    const catalogMap = new Map(catalog.map((c) => [c.id, c]));

    // 3) DTO + filtres (sur données jointes)
    const rows = states
      .map((s) => {
        const c = catalogMap.get(s.obligationId) ?? null;

        const legalRef = c?.legalRef ?? null;
        const title = c?.title ?? s.obligationId;
        const cat = c?.category ?? null;
        const crit = c?.criticality ? String(c.criticality).toUpperCase() : null;

        const hist0 = s.history?.[0];
        const historyPreview = hist0
          ? {
              id: hist0.id,
              toStatus: String(hist0.toStatus ?? "").toUpperCase(),
              note: hist0.note ?? null,
              createdAt: hist0.createdAt.toISOString(),
              auditId: hist0.auditId ?? null,
              auditAt: toIso(hist0.auditAt),
            }
          : null;

        return {
          // state
          id: s.id,
          obligationId: s.obligationId,
          status: String(s.status ?? "").toUpperCase(),
          owner: s.owner ?? null,
          dueDate: toIso(s.dueDate),
          notes: s.notes ?? null,
          lastAuditId: s.lastAuditId ?? null,
          lastAuditAt: toIso(s.lastAuditAt),
          createdAt: s.createdAt.toISOString(),
          updatedAt: s.updatedAt.toISOString(),

          // catalog
          obligation: {
            id: s.obligationId,
            title,
            description: c?.description ?? null,
            legalRef,
            category: cat,
            criticality: crit,
            catalogUpdatedAt: c?.updatedAt ? c.updatedAt.toISOString() : null,
          },

          // preview
          historyPreview,
        };
      })
      .filter((r) => {
        // filtre article -> match legalRef (contient)
        if (article) {
          const lr = (r.obligation.legalRef ?? "").toLowerCase();
          const a = article.toLowerCase();
          if (!lr.includes(a)) return false;
        }

        // filtre status
        if (status && status !== "ALL") {
          if (upper(r.status) !== status) return false;
        }

        // filtre category
        if (category) {
          const rc = (r.obligation.category ?? "").toLowerCase();
          if (!rc.includes(category.toLowerCase())) return false;
        }

        // filtre criticality
        if (criticality && criticality !== "ALL") {
          if (upper(r.obligation.criticality ?? "") !== criticality) return false;
        }

        // filtre q (title / legalRef / notes / owner)
        if (q) {
          const qq = q.toLowerCase();
          const t = (r.obligation.title ?? "").toLowerCase();
          const lr = (r.obligation.legalRef ?? "").toLowerCase();
          const no = (r.notes ?? "").toLowerCase();
          const ow = (r.owner ?? "").toLowerCase();
          if (!t.includes(qq) && !lr.includes(qq) && !no.includes(qq) && !ow.includes(qq)) return false;
        }

        return true;
      });

    // 4) Stats (sur la vue filtrée)
    const stats = rows.reduce(
      (acc, r) => {
        acc.total += 1;
        const st = upper(r.status);
        if (st === "COMPLIANT") acc.compliant += 1;
        else if (st === "IN_PROGRESS") acc.inProgress += 1;
        else if (st === "NON_COMPLIANT") acc.nonCompliant += 1;
        else if (st === "NOT_EVALUATED") acc.notEvaluated += 1;
        else acc.other += 1;
        return acc;
      },
      { total: 0, compliant: 0, inProgress: 0, nonCompliant: 0, notEvaluated: 0, other: 0 }
    );

    // 5) Tri : pire statut en premier, puis plus récent
    rows.sort((a, b) => {
      const ra = statusRank(a.status);
      const rb = statusRank(b.status);
      if (ra !== rb) return ra - rb;
      return (b.updatedAt || "").localeCompare(a.updatedAt || "");
    });

    return NextResponse.json({
      ok: true,
      filters: {
        article: article || null,
        q: q || null,
        status: status || "ALL",
        category: category || null,
        criticality: criticality || null,
        take,
      },
      stats,
      obligations: rows,
      meta: {
        statesTotalFetched: states.length,
        catalogFound: catalog.length,
        catalogMissing: Math.max(0, obligationIds.length - catalog.length),
      },
    });
  } catch (error) {
    console.error("GET /api/obligations-globales error:", error);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500 });
  }
}