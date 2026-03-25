// scripts/cleanup-catalog.ts
import { PrismaClient } from "@prisma/client";
import { OBLIGATIONS_CATALOG } from "../lib/obligations-catalog";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Nettoyage du catalogue d'obligations...\n");

  const officialIds = new Set(OBLIGATIONS_CATALOG.map((o) => o.id));

  const inDb = await prisma.obligationCatalog.findMany({
    select: { id: true, title: true },
  });

  console.log(`📋 ${inDb.length} obligations en base`);
  console.log(`📋 ${officialIds.size} obligations dans le catalogue officiel\n`);

  const toDelete = inDb.filter((o) => !officialIds.has(o.id));

  if (toDelete.length === 0) {
    console.log("✅ Catalogue déjà propre !");
    return;
  }

  console.log(`🗑️  ${toDelete.length} obligations obsolètes à supprimer :\n`);
  for (const o of toDelete) {
    console.log(`  - ${o.id} : ${o.title}`);
  }

  console.log("\nSuppression en cours...");

  for (const o of toDelete) {
    try {
      await prisma.obligationCatalog.delete({
        where: { id: o.id },
      });
      console.log(`  ✅ ${o.id} supprimée`);
    } catch (e: any) {
      console.log(`  ⚠️  ${o.id} ignorée (contrainte FK) : ${e.message?.slice(0, 80)}`);
    }
  }

  console.log("\n✅ Nettoyage terminé !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur :", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());