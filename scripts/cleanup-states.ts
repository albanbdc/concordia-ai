import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const OFFICIAL_IDS = [
  "OBL-NORMAL-001", "OBL-NORMAL-002",
  "OBL-TRANSP-001", "OBL-TRANSP-002", "OBL-TRANSP-003",
  "OBL-HR-DEP-001", "OBL-HR-DEP-002", "OBL-HR-DEP-003",
  "OBL-HR-DEP-004", "OBL-HR-DEP-005", "OBL-HR-DEP-006", "OBL-HR-DEP-007",
  "OBL-HR-PROV-001", "OBL-HR-PROV-002", "OBL-HR-PROV-003",
  "OBL-HR-PROV-004", "OBL-HR-PROV-005", "OBL-HR-PROV-006",
  "OBL-HR-PROV-007", "OBL-HR-PROV-008", "OBL-HR-PROV-009", "OBL-HR-PROV-010",
  "OBL-GPAI-001", "OBL-GPAI-002", "OBL-GPAI-003", "OBL-GPAI-004", "OBL-GPAI-005",
];

async function main() {
  console.log("🧹 Suppression des états obsolètes via SQL...\n");

  // 1. Désactiver le trigger temporairement
  await prisma.$executeRawUnsafe(`ALTER TABLE "UseCaseObligationHistory" DISABLE TRIGGER ALL`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "UseCaseObligationState" DISABLE TRIGGER ALL`);

  // 2. Supprimer l'historique lié aux états obsolètes
  const placeholders = OFFICIAL_IDS.map((_, i) => `$${i + 1}`).join(", ");
  const deletedHistory = await prisma.$executeRawUnsafe(
    `DELETE FROM "UseCaseObligationHistory" WHERE "stateId" IN (
      SELECT id FROM "UseCaseObligationState" WHERE "obligationId" NOT IN (${placeholders})
    )`,
    ...OFFICIAL_IDS
  );
  console.log(`🗑️ ${deletedHistory} entrées d'historique supprimées`);

  // 3. Supprimer les états obsolètes
  const deletedStates = await prisma.$executeRawUnsafe(
    `DELETE FROM "UseCaseObligationState" WHERE "obligationId" NOT IN (${placeholders})`,
    ...OFFICIAL_IDS
  );
  console.log(`🗑️ ${deletedStates} états supprimés`);

  // 4. Réactiver les triggers
  await prisma.$executeRawUnsafe(`ALTER TABLE "UseCaseObligationHistory" ENABLE TRIGGER ALL`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "UseCaseObligationState" ENABLE TRIGGER ALL`);

  console.log(`\n✅ Nettoyage terminé !`);
}

main()
  .catch((e) => {
    console.error("❌ Erreur :", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());