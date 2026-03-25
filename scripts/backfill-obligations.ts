// scripts/backfill-obligations.ts
// Régénère les obligations pour tous les use cases existants
// selon leur classification actuelle

import { PrismaClient } from "@prisma/client";
import { getObligationsForClassification } from "../lib/obligations-catalog.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Backfill des obligations pour les use cases existants...\n");

  const useCases = await prisma.useCase.findMany({
    select: {
      key: true,
      title: true,
      classification: true,
    },
  });

  console.log(`📋 ${useCases.length} use case(s) trouvé(s)\n`);

  for (const uc of useCases) {
    console.log(`\n→ ${uc.title} [${uc.classification}]`);

    const obligations = getObligationsForClassification(uc.classification);
    console.log(`  ${obligations.length} obligations attendues`);

    let created = 0;
    let skipped = 0;

    for (const obligation of obligations) {
      const existing = await prisma.useCaseObligationState.findUnique({
        where: {
          useCaseKey_obligationId: {
            useCaseKey: uc.key,
            obligationId: obligation.id,
          },
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.useCaseObligationState.create({
        data: {
          useCaseKey: uc.key,
          obligationId: obligation.id,
          status: "NOT_EVALUATED",
          priority: obligation.criticality,
          openActions: 0,
        },
      });

      created++;
    }

    console.log(`  ✅ ${created} créée(s) • ${skipped} déjà présente(s)`);
  }

  console.log("\n✅ Backfill terminé !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });