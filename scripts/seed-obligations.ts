// scripts/seed-obligations.ts
// Script d'insertion du catalogue d'obligations AI Act en base de données

import { PrismaClient } from "@prisma/client";
import { OBLIGATIONS_CATALOG } from "../lib/obligations-catalog";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Insertion du catalogue d'obligations AI Act...");

  let created = 0;
  let updated = 0;

  for (const obligation of OBLIGATIONS_CATALOG) {
    await prisma.obligationCatalog.upsert({
      where: { id: obligation.id },
      update: {
        title: obligation.title,
        description: obligation.description,
        legalRef: obligation.legalRef,
        category: obligation.category,
        criticality: obligation.criticality,
        updatedAt: new Date(),
      },
      create: {
        id: obligation.id,
        title: obligation.title,
        description: obligation.description,
        legalRef: obligation.legalRef,
        category: obligation.category,
        criticality: obligation.criticality,
        updatedAt: new Date(),
      },
    });

    console.log(`✅ ${obligation.id} — ${obligation.title}`);
    created++;
  }

  console.log(`\n✅ Terminé ! ${created} obligations insérées/mises à jour.`);
}

main()
  .catch((e) => {
    console.error("❌ Erreur :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });