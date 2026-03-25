/*
  Warnings:

  - You are about to drop the column `certifiedAt` on the `Audit` table. All the data in the column will be lost.
  - You are about to drop the column `certifiedBy` on the `Audit` table. All the data in the column will be lost.
  - You are about to drop the column `integrityHash` on the `Audit` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Audit` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Audit_organizationId_idx";

-- DropIndex
DROP INDEX "Audit_userId_idx";

-- AlterTable
ALTER TABLE "Audit" DROP COLUMN "certifiedAt",
DROP COLUMN "certifiedBy",
DROP COLUMN "integrityHash",
DROP COLUMN "updatedAt",
ADD COLUMN     "useCaseKey" TEXT,
ALTER COLUMN "inputText" DROP NOT NULL,
ALTER COLUMN "resultText" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Audit_useCaseKey_idx" ON "Audit"("useCaseKey");

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_useCaseKey_fkey" FOREIGN KEY ("useCaseKey") REFERENCES "UseCase"("key") ON DELETE SET NULL ON UPDATE CASCADE;
