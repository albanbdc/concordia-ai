export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";

function formatDate(date: Date) {
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type GlobalDecisionLevel =
  | "CRITIQUE"
  | "IMPORTANT"
  | "À AMÉLIORER"
  | "OK"
  | "HORS PÉRIMÈTRE";

function computeGlobalDecision(systemStatus: string | null, scoreNumber: number | null) {
  const status = systemStatus ?? "";
  const score = typeof scoreNumber === "number" ? scoreNumber : 0;

  const band =
    score < 40 ? "low" : score < 60 ? "partial" : score < 80 ? "medium" : "good";

  if (status === "out-of-scope" || status === "excluded") {
    return { level: "HORS PÉRIMÈTRE" as GlobalDecisionLevel, badgeColor: "bg-gray-600" };
  }

  if (status === "prohibited") {
    return { level: "CRITIQUE" as GlobalDecisionLevel, badgeColor: "bg-black" };
  }

  if (status === "high-risk") {
    if (score < 60) return { level: "CRITIQUE" as GlobalDecisionLevel, badgeColor: "bg-red-600" };
    if (score < 80) return { level: "IMPORTANT" as GlobalDecisionLevel, badgeColor: "bg-amber-500" };
    return { level: "OK" as GlobalDecisionLevel, badgeColor: "bg-green-600" };
  }

  if (status === "gpai-systemic") {
    if (score < 70) return { level: "CRITIQUE" as GlobalDecisionLevel, badgeColor: "bg-red-600" };
    return { level: "IMPORTANT" as GlobalDecisionLevel, badgeColor: "bg-amber-500" };
  }

  if (status === "gpai") {
    if (score < 60) return { level: "IMPORTANT" as GlobalDecisionLevel, badgeColor: "bg-amber-500" };
    return { level: "À AMÉLIORER" as GlobalDecisionLevel, badgeColor: "bg-orange-500" };
  }

  if (band === "low") {
    return { level: "À AMÉLIORER" as GlobalDecisionLevel, badgeColor: "bg-orange-500" };
  }

  return { level: "OK" as GlobalDecisionLevel, badgeColor: "bg-green-600" };
}

type ParsedEngineAudit = {
  systemName: string | null;
  systemStatus: string | null;
  scoreLabel: string | null;
  scoreNumber: number | null;
  decision: { level: GlobalDecisionLevel; badgeColor: string } | null;
};

function parseEngineAudit(resultText: string | null): ParsedEngineAudit {
  if (!resultText) {
    return { systemName: null, systemStatus: null, scoreLabel: null, scoreNumber: null, decision: null };
  }

  try {
    const obj = JSON.parse(resultText);

    const systemName =
      obj.systemName ??
      obj.system?.name ??
      (obj.systemId ? `Système ${obj.systemId}` : null);

    const systemStatus = obj.systemStatus ? String(obj.systemStatus) : null;

    let scoreNumber: number | null = null;

    if (obj.score) {
      if (typeof obj.score.overallScore === "number") scoreNumber = obj.score.overallScore;
      else if (typeof obj.score.overall === "number") scoreNumber = obj.score.overall;
      else if (typeof obj.score.overallScore === "string") {
        const n = Number(obj.score.overallScore);
        scoreNumber = Number.isFinite(n) ? n : null;
      } else if (typeof obj.score.overall === "string") {
        const n = Number(obj.score.overall);
        scoreNumber = Number.isFinite(n) ? n : null;
      }
    }

    const scoreLabel = typeof scoreNumber === "number" ? `${scoreNumber}/100` : null;
    const decision = systemStatus ? computeGlobalDecision(systemStatus, scoreNumber) : null;

    return { systemName, systemStatus, scoreLabel, scoreNumber, decision };
  } catch {
    return { systemName: null, systemStatus: null, scoreLabel: null, scoreNumber: null, decision: null };
  }
}

export default async function AuditsHistoryPage() {
  let audits: any[] = [];
  let dbError: string | null = null;

  try {
    audits = await prisma.audit.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch (err: any) {
    console.error("[/dashboard/audits] Erreur Prisma :", err);
    dbError =
      "Impossible de se connecter à la base de données. Les audits ne peuvent pas être chargés pour le moment.";
  }

  if (dbError) {
    return (
      <main className="max-w-4xl mx-auto py-8 space-y-6">
        <section className="space-y-2">
          <h1 className="text-2xl font-semibold">Historique des audits</h1>
          <p className="text-sm text-muted-foreground">
            La base de données n&apos;est pas accessible actuellement.
          </p>
        </section>

        <section className="border rounded-md bg-red-50 border-red-200 p-4 text-sm text-red-800">
          <p className="font-semibold mb-1">Erreur de connexion</p>
          <p className="mb-2">{dbError}</p>
          <p className="text-xs text-red-700">
            Vérifie que ta base Supabase est bien en ligne et que la variable
            <code className="mx-1 bg-red-100 px-1 py-0.5 rounded">DATABASE_URL</code>
            est correctement configurée.
          </p>
        </section>

        <section className="border rounded-md bg-white p-4 text-sm">
          <Link
            href="/dashboard/audit"
            className="inline-flex text-xs font-medium text-blue-600 hover:underline"
          >
            Aller à la page &quot;Audit&quot;
          </Link>
        </section>
      </main>
    );
  }

  const total = audits.length;
  const engineAudits = audits.filter((a) => a.type === "ENGINE_AUDIT");
  const legacyAudits = audits.filter((a) => a.type !== "ENGINE_AUDIT");

  return (
    <main className="max-w-6xl mx-auto py-8 space-y-8">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">Historique des audits</h1>
        <p className="text-sm text-muted-foreground">
          Retrouve l&apos;ensemble des audits réalisés avec Concordia.
        </p>
        <p className="text-xs text-slate-500">
          {total === 0
            ? "Aucun audit enregistré pour le moment."
            : `${total} audit${total > 1 ? "s" : ""} au total, dont ${engineAudits.length} audit${
                engineAudits.length > 1 ? "s" : ""
              } moteur (ENGINE_AUDIT).`}
        </p>
      </section>

      {/* Audits moteur */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Audits IA Act (moteur Concordia)</h2>
          <Link href="/dashboard/audit" className="text-xs text-blue-600 hover:underline">
            Lancer un nouvel audit
          </Link>
        </div>

        {engineAudits.length === 0 ? (
          <p className="text-xs text-slate-500">Aucun audit moteur enregistré.</p>
        ) : (
          <div className="border rounded-md bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">Date</th>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">Système</th>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">Secteur</th>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">Cas d&apos;usage</th>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">Statut IA Act</th>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">Décision</th>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">Score</th>
                    <th className="px-4 py-2 text-right font-medium text-slate-700">Résultat</th>
                  </tr>
                </thead>
                <tbody>
                  {engineAudits.map((audit) => {
                    const parsed = parseEngineAudit(audit.resultText);
                    const status = parsed.systemStatus;

                    const badgeColor =
                      status === "high-risk"
                        ? "bg-red-600"
                        : status === "normal"
                        ? "bg-green-600"
                        : status === "gpai"
                        ? "bg-purple-600"
                        : status === "gpai-systemic"
                        ? "bg-purple-900"
                        : status === "prohibited"
                        ? "bg-black"
                        : status === "excluded"
                        ? "bg-blue-600"
                        : status === "out-of-scope"
                        ? "bg-gray-600"
                        : "bg-slate-400";

                    return (
                      <tr key={audit.id} className="border-b last:border-0 hover:bg-slate-50/70">
                        <td className="px-4 py-2 align-top text-slate-700 whitespace-nowrap">
                          {audit.createdAt ? formatDate(audit.createdAt) : "-"}
                        </td>
                        <td className="px-4 py-2 align-top text-slate-700">
                          {parsed.systemName || audit.useCaseType || "—"}
                        </td>
                        <td className="px-4 py-2 align-top text-slate-700">
                          {audit.industrySector || <span className="text-slate-400">Non renseigné</span>}
                        </td>
                        <td className="px-4 py-2 align-top text-slate-700">
                          {audit.useCaseType || <span className="text-slate-400">Non renseigné</span>}
                        </td>
                        <td className="px-4 py-2 align-top text-slate-700">
                          {status ? (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium text-white ${badgeColor}`}
                            >
                              {status}
                            </span>
                          ) : (
                            <span className="text-slate-400">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-2 align-top text-slate-700">
                          {parsed.decision ? (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium text-white ${parsed.decision.badgeColor}`}
                            >
                              {parsed.decision.level}
                            </span>
                          ) : (
                            <span className="text-slate-400">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-2 align-top text-slate-700">
                          {parsed.scoreLabel || <span className="text-slate-400">N/A</span>}
                        </td>

                        {/* ✅ ICI : on redirige vers /dashboard/report */}
                        <td className="px-4 py-2 align-top text-right">
                          <Link
                            href={`/dashboard/report?auditId=${audit.id}`}
                            className="text-blue-600 hover:underline font-medium"
                          >
                            Voir
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Audits legacy */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Autres audits (legacy / texte libre)</h2>

        {legacyAudits.length === 0 ? (
          <p className="text-xs text-slate-500">Aucun autre type d&apos;audit enregistré.</p>
        ) : (
          <div className="border rounded-md bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">Date</th>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">Type</th>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">Secteur</th>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">Usage IA</th>
                    <th className="px-4 py-2 text-right font-medium text-slate-700">Détail</th>
                  </tr>
                </thead>
                <tbody>
                  {legacyAudits.map((audit) => (
                    <tr key={audit.id} className="border-b last:border-0 hover:bg-slate-50/70">
                      <td className="px-4 py-2 align-top text-slate-700 whitespace-nowrap">
                        {audit.createdAt ? formatDate(audit.createdAt) : "-"}
                      </td>
                      <td className="px-4 py-2 align-top text-slate-700">
                        {audit.type || <span className="text-slate-400">Non renseigné</span>}
                      </td>
                      <td className="px-4 py-2 align-top text-slate-700">
                        {audit.industrySector || <span className="text-slate-400">Non renseigné</span>}
                      </td>
                      <td className="px-4 py-2 align-top text-slate-700">
                        {audit.useCaseType || <span className="text-slate-400">Non renseigné</span>}
                      </td>
                      <td className="px-4 py-2 align-top text-right">
                        <Link
                          href={`/dashboard/audits/${audit.id}`}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Voir
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
