// scripts/check-action.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const actions = await prisma.complianceAction.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: { id: true, status: true, title: true, auditId: true, createdAt: true },
  });

  console.log("DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "NOT_SET");
  console.log("Latest 5 ComplianceActions:");
  for (const a of actions) {
    console.log("-", a.id, a.status, "|", a.title);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
