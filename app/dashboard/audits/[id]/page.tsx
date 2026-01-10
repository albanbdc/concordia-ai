export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import ConcordiaReport from "@/components/concordia/ConcordiaReport";
import Link from "next/link";
import ResumeAuditButton from "@/components/concordia/ResumeAuditButton";

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatDate(date: Date) {
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type SafeReportAudit = {
  systemId: string;
  systemName: string;
  engineVersion: string;
  entityType: string;
  systemStatus: string;
  statusReason?: string;
  systemRiskReasons: string[];
  useCases: any[];
  score: {
    overallScore?: number;
    overall?: number;
    byCategory?: Record<string, number>;
    details?: any;
  };
  meta: { generatedAt: string };
};

export default async function AuditDetailPage({ params }: PageProps) {
  const { id } = await params;

  if (!id) {
    return (
      <main className="max-w-4xl mx-auto py-8 space-y-6">
        <p className="text-sm text-slate-500">ID d’audit manquant.</p>
      </main>
    );
  }

  let audit: any | null = null;
  let actions: any[] = [];

  try {
    audit = await prisma.audit.findUnique({
      where: { id },
    });

    actions = await prisma.complianceAction.findMany({
      where: { auditId: id },
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    });
  } catch (err) {
    console.error("[audit detail] error:", err);
  }

  if (!audit) {
    return (
      <main className="max-w-4xl mx-auto py-8 space-y-6">
        <p className="text-sm text-slate-500">Audit introuvable.</p>
        <Link
          href="/dashboard/audits"
          className="text-xs text-blue-600 hover:underline"
        >
          ← Retour aux audits
        </Link>
      </main>
    );
  }

  const createdAt = audit.createdAt
    ? formatDate(audit.createdAt)
    : "Date inconnue";

  const isEngineAudit = audit.type === "ENGINE_AUDIT";

  let parsedResult: any = null;
  let parsedInput: any = null;

  try {
    parsedResult = audit.resultText ? JSON.parse(audit.resultText) : null;
  } catch {}

  try {
    parsedInput = audit.inputText ? JSON.parse(audit.inputText) : null;
  } catch {}

  const overallScore =
    typeof parsedResult?.score?.overallScore === "number"
      ? parsedResult.score.overallScore
      : typeof parsedResult?.score?.overall === "number"
      ? parsedResult.score.overall
      : 0;

  const byCategory =
    parsedResult?.score?.byCategory &&
    typeof parsedResult.score.byCategory === "object"
      ? parsedResult.score.byCategory
      : {};

  let engineAudit: SafeReportAudit | null = null;

  if (isEngineAudit && parsedResult) {
    engineAudit = {
      systemId: parsedResult.systemId ?? "unknown",
      systemName:
        parsedResult.systemName ?? parsedResult.systemId ?? "Système IA",
      engineVersion: parsedResult.engineVersion ?? "unknown",
      entityType: parsedResult.entityType ?? "deployer",
      systemStatus: parsedResult.systemStatus ?? "normal",
      statusReason: parsedResult.statusReason ?? "",
      systemRiskReasons: parsedResult.systemRiskReasons ?? [],
      useCases: parsedResult.useCases ?? [],
      score: {
        overallScore,
        overall: overallScore,
        byCategory,
        details: parsedResult?.score?.details,
      },
      meta: {
        generatedAt: audit.createdAt
          ? audit.createdAt.toISOString()
          : new Date().toISOString(),
      },
    };
  }

  const resumablePayload =
    parsedInput && typeof parsedInput === "object" ? parsedInput : null;

  return (
    <main className="max-w-4xl mx-auto py-8 space-y-6">
      <section className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">Détail de l’audit</h1>
          <p className="text-xs text-slate-500">ID : {audit.id}</p>
          <p className="text-xs text-slate-500">Créé le {createdAt}</p>
          {isEngineAudit && (
            <p className="text-xs text-slate-500">
              Score : {overallScore}/100
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isEngineAudit && resumablePayload && (
            <ResumeAuditButton payload={resumablePayload} />
          )}

          <Link
            href="/dashboard/audits"
            className="text-xs text-blue-600 hover:underline"
          >
            ← Retour
          </Link>
        </div>
      </section>

      {isEngineAudit && engineAudit ? (
        <section className="border rounded-lg bg-white shadow-sm">
          <ConcordiaReport
            audit={engineAudit as any}
            auditId={audit.id}
            actions={actions}
          />
        </section>
      ) : (
        <section className="border rounded-lg bg-white shadow-sm p-4">
          <pre className="text-xs whitespace-pre-wrap">
            {audit.resultText}
          </pre>
        </section>
      )}
    </main>
  );
}


