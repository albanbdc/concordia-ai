import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  const email = "test@concordia.ai";
  const password = "Test1234!";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  console.log("✅ User ready:", { email, password });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

  