/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `Audit` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Audit" DROP CONSTRAINT "Audit_userId_fkey";

-- AlterTable
ALTER TABLE "Audit" ADD COLUMN     "certified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "certifiedAt" TIMESTAMP(3),
ADD COLUMN     "certifiedBy" TEXT,
ADD COLUMN     "integrityHash" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ComplianceAction" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "details" TEXT,
    "auditId" TEXT NOT NULL,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditIntegrity" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hash" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL DEFAULT 'SHA-256',
    "auditId" TEXT NOT NULL,

    CONSTRAINT "AuditIntegrity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditVersion" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modelName" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "apiProvider" TEXT NOT NULL,
    "auditId" TEXT NOT NULL,

    CONSTRAINT "AuditVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuditIntegrity_auditId_key" ON "AuditIntegrity"("auditId");

-- CreateIndex
CREATE UNIQUE INDEX "AuditVersion_auditId_key" ON "AuditVersion"("auditId");

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditIntegrity" ADD CONSTRAINT "AuditIntegrity_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditVersion" ADD CONSTRAINT "AuditVersion_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
