// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// ✅ V1: en local on force l'usage du pooler (DATABASE_URL)
// et on évite toute bascule involontaire sur DIRECT_URL (db.xxx.supabase.co)
function ensureDatabaseUrl() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error("DATABASE_URL manquant (check .env.local / .env).");
  }

  // Force Prisma à utiliser DATABASE_URL même si DIRECT_URL existe
  process.env.DIRECT_URL = dbUrl;
}

ensureDatabaseUrl();

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
