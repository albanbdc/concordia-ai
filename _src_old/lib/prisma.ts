import { PrismaClient } from "@prisma/client";

// Permet d'éviter de recréer un PrismaClient à chaque requête en dev
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"], // tu peux mettre "query" pour debugger si besoin
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
