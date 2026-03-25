-- CreateEnum
CREATE TYPE "ObligationCriticality" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "ObligationCatalog" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "legalRef" TEXT,
    "category" TEXT,
    "criticality" "ObligationCriticality",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ObligationCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ObligationCatalog_category_idx" ON "ObligationCatalog"("category");

-- CreateIndex
CREATE INDEX "ObligationCatalog_criticality_idx" ON "ObligationCatalog"("criticality");
