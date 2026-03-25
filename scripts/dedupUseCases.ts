// scripts/dedupUseCases.ts
// Déduplication définitive des UseCases (registre vivant)
// Version renforcée : normalisation agressive + gestion typos simples
//
// ✅ Par défaut: DRY RUN (aucune modif)
// ✅ Pour appliquer:   npx ts-node scripts/dedupUseCases.ts --apply
// ✅ Pour limiter:     npx ts-node scripts/dedupUseCases.ts --apply --only="calcul-de-solvabilite"

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Args = {
  apply: boolean;
  only?: string | null;
};

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  const apply = argv.includes("--apply");
  const onlyArg = argv.find((a) => a.startsWith("--only="));
  const only = onlyArg ? onlyArg.split("=").slice(1).join("=") : null;
  return { apply, only };
}

/**
 * Normalisation agressive :
 * - enlève accents
 * - enlève quotes typographiques
 * - remplace espaces multiples
 * - corrige petites typos connues
 * - force slug propre
 */
function normalizeTitle(input: string) {
  let s = String(input || "");

  // 1. Supprime accents
  s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 2. Supprime quotes et caractères spéciaux "intelligents"
  s = s
    .replace(/[“”«»„"]/g, "")
    .replace(/[’']/g, "")
    .replace(/[–—]/g, "-");

  // 3. Minuscule
  s = s.toLowerCase();

  // 4. Corrections simples connues
  const corrections: Record<string, string> = {
    solvabilit: "solvabilite",
    conformit: "conformite",
  };

  for (const [wrong, correct] of Object.entries(corrections)) {
    if (s.endsWith(wrong)) {
      s = s.slice(0, -wrong.length) + correct;
    }
  }

  // 5. Remplace tout caractère non alphanumérique par -
  s = s.replace(/[^a-z0-9]+/g, "-");

  // 6. Nettoie tirets multiples
  s = s.replace(/-+/g, "-");

  // 7. Trim tirets début/fin
  s = s.replace(/^-+|-+$/g, "");

  return s.slice(0, 80) || "unknown";
}

function scoreCandidate(c: {
  key: string;
  title: string;
  sector: string | null;
  updatedAt: Date;
  obligationsCount: number;
}) {
  const sector = String(c.sector || "generic").toLowerCase();
  const sectorBonus = sector !== "generic" ? 1000000000 : 0;
  const obligations = c.obligationsCount * 100000;
  const updated = Math.floor(c.updatedAt.getTime() / 1000);
  return obligations + sectorBonus + updated;
}

async function main() {
  const { apply, only } = parseArgs();

  console.log("==============================================");
  console.log("DEDUPE UseCases — registre vivant");
  console.log("Mode:", apply ? "APPLY (destructif)" : "DRY RUN (safe)");
  if (only) console.log("Filtre ONLY titleSlug =", only);
  console.log("==============================================\n");

  const useCases = await prisma.useCase.findMany({
    select: { key: true, title: true, sector: true, updatedAt: true },
  });

  const totals = await prisma.useCaseObligationState.groupBy({
    by: ["useCaseKey"],
    _count: { _all: true },
  });
  const totalMap = new Map(totals.map((x) => [x.useCaseKey, x._count._all]));

  const groups = new Map<
    string,
    Array<{
      key: string;
      title: string;
      sector: string | null;
      updatedAt: Date;
      obligationsCount: number;
    }>
  >();

  for (const uc of useCases) {
    const titleSlug = normalizeTitle(uc.title);
    if (only && titleSlug !== only) continue;

    const item = {
      key: uc.key,
      title: uc.title,
      sector: uc.sector,
      updatedAt: uc.updatedAt,
      obligationsCount: totalMap.get(uc.key) ?? 0,
    };

    const arr = groups.get(titleSlug) ?? [];
    arr.push(item);
    groups.set(titleSlug, arr);
  }

  const dupGroups = Array.from(groups.entries())
    .map(([titleSlug, items]) => ({ titleSlug, items }))
    .filter((g) => g.items.length >= 2);

  if (dupGroups.length === 0) {
    console.log("✅ Aucun doublon détecté (normalisation renforcée).");
    return;
  }

  console.log(`⚠️ Doublons détectés: ${dupGroups.length} groupe(s)\n`);

  for (const g of dupGroups) {
    const sorted = [...g.items].sort((a, b) => scoreCandidate(b) - scoreCandidate(a));
    const canonical = sorted[0];
    const duplicates = sorted.slice(1);

    console.log("------------------------------------------------");
    console.log(`TitleSlug: ${g.titleSlug}`);
    console.log(`CANONIQUE: ${canonical.key} | sector=${canonical.sector} | states=${canonical.obligationsCount}`);
    console.log("DOUBLONS:");
    for (const d of duplicates) {
      console.log(`- ${d.key} | sector=${d.sector} | states=${d.obligationsCount}`);
    }

    if (!apply) continue;

    console.log("=> APPLY: migration en cours...");

    await prisma.$transaction(async (tx) => {
      for (const dup of duplicates) {
        const dupStates = await tx.useCaseObligationState.findMany({
          where: { useCaseKey: dup.key },
          select: { id: true, obligationId: true },
        });

        for (const s of dupStates) {
          const target = await tx.useCaseObligationState.findFirst({
            where: { useCaseKey: canonical.key, obligationId: s.obligationId },
            select: { id: true },
          });

          if (!target) {
            await tx.useCaseObligationState.update({
              where: { id: s.id },
              data: { useCaseKey: canonical.key },
            });
          } else {
            await tx.useCaseObligationHistory.updateMany({
              where: { stateId: s.id },
              data: { stateId: target.id },
            });

            await tx.useCaseObligationState.delete({ where: { id: s.id } });
          }
        }

        await tx.useCase.delete({ where: { key: dup.key } });
      }

      await tx.useCase.update({
        where: { key: canonical.key },
        data: { updatedAt: new Date() },
      });
    });

    console.log("✅ APPLY: terminé pour ce groupe.");
  }

  console.log("\n==============================================");
  console.log(apply ? "✅ FIN APPLY" : "✅ FIN DRY RUN");
  console.log("==============================================");
}

main()
  .catch((e) => {
    console.error("❌ dedupUseCases error:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
    } catch {}
  });