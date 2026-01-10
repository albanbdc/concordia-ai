import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DashboardCharts from "./DashboardCharts";
import ConcordiaAuditPanel from "@/components/concordia/ConcordiaAuditPanel";

function formatDate(date: Date) {
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function extractScore(resultText: string | null): string | null {
  if (!resultText) return null;
  const match = resultText.match(/SCORE GLOBAL[\s\S]*?(\d{1,3}\s*\/\s*100)/i);
  if (!match || !match[1]) return null;
  return match[1].trim();
}

function extractVerdict(resultText: string | null): string | null {
  if (!resultText) return null;
  const lower = resultText.toLowerCase();

  if (
    lower.includes("n'est pas conforme") ||
    lower.includes("n’est pas conforme") ||
    lower.includes("non conforme")
  ) {
    return "Non conforme";
  }

  if (lower.includes("conforme sous conditions")) {
    return "Conforme sous conditions";
  }

  if (
    lower.includes("le système est conforme") ||
    lower.includes("le systeme est conforme") ||
    lower.includes("système globalement conforme") ||
    lower.includes("systeme globalement conforme")
  ) {
    return "Conforme";
  }

  return null;
}

function extractShortSummary(resultText: string | null): string {
  if (!resultText) return "Résumé non disponible.";

  const marker = "0 - RÉSUMÉ ULTRA-COURT";
  let startIndex = resultText.indexOf(marker);
  let raw = "";

  if (startIndex !== -1) {
    const after = resultText.substring(startIndex + marker.length);
    const nextBreak = after.indexOf("\n");
    raw = nextBreak === -1 ? after : after.substring(0, nextBreak + 200);
  } else {
    raw = resultText.slice(0, 300);
  }

  const cleaned = raw.replace(/\s+/g, " ").trim();
  return cleaned.length > 220 ? cleaned.slice(0, 200) + "..." : cleaned;
}

export default async function DashboardPage() {
  // 🔴 On sécurise l’accès DB
  let audits: any[] = [];
  try {
    audits = await prisma.audit.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch (e) {
    console.error(
      "Erreur Prisma lors du chargement des audits (on continue avec une liste vide) :",
      e
    );
    audits = [];
  }

  const total = audits.length;

  let countNonConforme = 0;
  let countSousConditions = 0;
  let countConforme = 0;

  const sectorCounts: Record<string, number> = {};
  const useCaseCounts: Record<string, number> = {};

  const enrichedAudits = audits.map((audit) => {
    const verdict = extractVerdict(audit.resultText);
    const score = extractScore(audit.resultText);

    if (verdict === "Non conforme") countNonConforme++;
    else if (verdict === "Conforme sous conditions") countSousConditions++;
    else if (verdict === "Conforme") countConforme++;

    if (audit.industrySector) {
      sectorCounts[audit.industrySector] =
        (sectorCounts[audit.industrySector] || 0) + 1;
    }

    if (audit.useCaseType) {
      useCaseCounts[audit.useCaseType] =
        (useCaseCounts[audit.useCaseType] || 0) + 1;
    }

    return {
      id: audit.id,
      createdAt: audit.createdAt,
      type: audit.type,
      industrySector: audit.industrySector,
      useCaseType: audit.useCaseType,
      resultText: audit.resultText,
      verdict,
      score,
      shortSummary: extractShortSummary(audit.resultText),
    };
  });

  const pct = (n: number) => (total === 0 ? 0 : Math.round((n * 100) / total));

  const riskyAudits = enrichedAudits.filter((a) => a.verdict === "Non conforme");

  const topSectors = Object.entries(sectorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topUseCases = Object.entries(useCaseCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const conformitiesForCharts = {
    labels: ["Non conforme", "Conforme sous conditions", "Conforme"],
    values: [countNonConforme, countSousConditions, countConforme],
  };

  const sectorsForCharts = {
    labels: topSectors.map(([label]) => label),
    values: topSectors.map(([, count]) => count),
  };

  const useCasesForCharts = {
    labels: topUseCases.map(([label]) => label),
    values: topUseCases.map(([, count]) => count),
  };

  return (
    <main className="max-w-6xl mx-auto py-10 space-y-8">
      {/* Titre + intro */}
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground">
          Vue globale des audits IA réalisés avec Concordia : niveaux de risque,
          conformité et répartition des cas d&apos;usage. Ce tableau de bord
          permet de prioriser les systèmes les plus sensibles.
        </p>
      </section>

      {/* Cartes de synthèse */}
      <section className="grid gap-4 md:grid-cols-4">
        <div className="border rounded-md p-4 bg-white shadow-sm col-span-2">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Vue globale
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {total}
            <span className="ml-1 text-base font-normal text-slate-500">
              audits
            </span>
          </p>
          {total > 0 ? (
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              {pct(countNonConforme)}% non conformes, {pct(countSousConditions)}
              % conformes sous conditions, {pct(countConforme)}% conformes. Les
              systèmes non conformes et sous conditions doivent être revus en
              priorité.
            </p>
          ) : (
            <p className="mt-2 text-xs text-slate-600">
              Aucun audit enregistré pour le moment. Lance un premier audit pour
              commencer la cartographie de tes risques IA.
            </p>
          )}
          <div className="mt-3">
            <Link
              href="/dashboard/audit"
              className="inline-flex text-xs font-medium text-blue-600 hover:underline"
            >
              Lancer un nouvel audit
            </Link>
          </div>
        </div>

        <div className="border rounded-md p-4 bg-white shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Non conformes
          </p>
          <p className="mt-2 text-2xl font-semibold text-red-600">
            {countNonConforme}
          </p>
          <p className="text-xs text-slate-600 mt-1">
            {pct(countNonConforme)}% du parc audité présente un risque élevé
            nécessitant une action rapide.
          </p>
        </div>

        <div className="border rounded-md p-4 bg-white shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Sous conditions / Conforme
          </p>
          <p className="mt-2 text-2xl font-semibold text-amber-600">
            {countSousConditions}
            <span className="text-slate-400 text-base font-normal">
              {" "}
              / {countConforme}
            </span>
          </p>
          <p className="text-xs text-slate-600 mt-1">
            {pct(countSousConditions)}% requièrent un cadrage renforcé,{" "}
            {pct(countConforme)}% sont globalement maîtrisés.
          </p>
        </div>
      </section>

     

      {/* Graphes */}
      <DashboardCharts
        conformities={conformitiesForCharts}
        sectors={sectorsForCharts}
        useCases={useCasesForCharts}
      />

      {/* Audits à risque élevé */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">
            Audits à risque élevé (non conformes)
          </h2>
          <Link
            href="/dashboard/audits"
            className="text-xs text-blue-600 hover:underline"
          >
            Voir tout l&apos;historique
          </Link>
        </div>

        {riskyAudits.length === 0 ? (
          <p className="text-xs text-slate-500">
            Aucun audit &quot;Non conforme&quot; pour l&apos;instant. Les
            rapports non conformes apparaîtront ici pour être traités en
            priorité.
          </p>
        ) : (
          <div className="border rounded-md bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">
                      Date
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">
                      Type d&apos;audit
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">
                      Secteur
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">
                      Usage IA
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">
                      Score
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">
                      Résumé
                    </th>
                    <th className="px-4 py-2 text-right font-medium text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {riskyAudits.slice(0, 5).map((a) => (
                    <tr
                      key={a.id}
                      className="border-b last:border-0 hover:bg-slate-50/70"
                    >
                      <td className="px-4 py-2 align-top text-slate-700">
                        {a.createdAt ? formatDate(a.createdAt) : "-"}
                      </td>
                      <td className="px-4 py-2 align-top text-slate-700">
                        {a.type || "-"}
                      </td>
                      <td className="px-4 py-2 align-top text-slate-700">
                        {a.industrySector || (
                          <span className="text-slate-400">Non renseigné</span>
                        )}
                      </td>
                      <td className="px-4 py-2 align-top text-slate-700">
                        {a.useCaseType || (
                          <span className="text-slate-400">Non renseigné</span>
                        )}
                      </td>
                      <td className="px-4 py-2 align-top text-slate-700">
                        {a.score || (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-2 align-top text-slate-700 max-w-xs">
                        <span className="line-clamp-3">{a.shortSummary}</span>
                      </td>
                      <td className="px-4 py-2 align-top text-right">
                        <Link
                          href={`/dashboard/audits/${a.id}`}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Voir le détail
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

      {/* Profil des cas d'usage */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="border rounded-md p-4 bg-white shadow-sm">
          <h2 className="text-sm font-semibold mb-2">
            Secteurs les plus audités
          </h2>
          {topSectors.length === 0 ? (
            <p className="text-xs text-slate-500">
              Les secteurs apparaîtront au fur et à mesure des audits réalisés.
            </p>
          ) : (
            <ul className="text-xs text-slate-700 space-y-1">
              {topSectors.map(([sector, count]) => (
                <li key={sector} className="flex justify-between">
                  <span>{sector}</span>
                  <span className="text-slate-500">
                    {count} audit{count > 1 ? "s" : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border rounded-md p-4 bg-white shadow-sm">
          <h2 className="text-sm font-semibold mb-2">
            Types d&apos;usage IA les plus fréquents
          </h2>
          {topUseCases.length === 0 ? (
            <p className="text-xs text-slate-500">
              Les types d&apos;usage apparaîtront au fur et à mesure des audits
              réalisés.
            </p>
          ) : (
            <ul className="text-xs text-slate-700 space-y-1">
              {topUseCases.map(([uc, count]) => (
                <li key={uc} className="flex justify-between">
                  <span>{uc}</span>
                  <span className="text-slate-500">
                    {count} audit{count > 1 ? "s" : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
