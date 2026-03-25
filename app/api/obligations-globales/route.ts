// app/api/obligations-globales/route.ts
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

    const article = norm(url.searchParams.get("article"));
    const q = norm(url.searchParams.get("q"));
    const status = upper(url.searchParams.get("status"));
    const category = norm(url.searchParams.get("category"));
    const criticality = upper(url.searchParams.get("criticality"));
    const take = safeTakeInt(url.searchParams.get("take"), 200, 1, 500);

    // 1) Charger les states globaux
    const states = await prisma.obligationState.findMany({
      orderBy: [{ updatedAt: "desc" }],
      take,
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

    // 3) DTO + filtres
    const rows = states
      .map((s) => {
        const c = catalogMap.get(s.obligationId) ?? null;

        const legalRef = c?.legalRef ?? null;
        const title = c?.title ?? s.obligationId;
        const cat = c?.category ?? null;
        const crit = c?.criticality ? String(c.criticality).toUpperCase() : null;

        return {
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

          obligation: {
            id: s.obligationId,
            title,
            description: c?.description ?? null,
            legalRef,
            category: cat,
            criticality: crit,
            catalogUpdatedAt: c?.updatedAt ? c.updatedAt.toISOString() : null,
          },

          historyPreview: null,
        };
      })
      .filter((r) => {
        if (article) {
          const lr = (r.obligation.legalRef ?? "").toLowerCase();
          if (!lr.includes(article.toLowerCase())) return false;
        }
        if (status && status !== "ALL") {
          if (upper(r.status) !== status) return false;
        }
        if (category) {
          const rc = (r.obligation.category ?? "").toLowerCase();
          if (!rc.includes(category.toLowerCase())) return false;
        }
        if (criticality && criticality !== "ALL") {
          if (upper(r.obligation.criticality ?? "") !== criticality) return false;
        }
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

    // 4) Stats
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

    // 5) Tri
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
