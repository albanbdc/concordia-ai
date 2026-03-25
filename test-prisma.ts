import { prisma } from "./lib/prisma";

async function main() {
  const count = await prisma.audit.count();
  console.log("Audit count:", count);

  const one = await prisma.obligationState.findFirst();
  console.log("One obligationState:", one);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
