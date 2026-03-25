-- CreateEnum
CREATE TYPE "SystemStatus" AS ENUM ('NORMAL', 'CONFORMITE_RENFORCEE_REQUISE');

-- AlterTable
ALTER TABLE "UseCase" ADD COLUMN     "systemId" TEXT;

-- CreateTable
CREATE TABLE "System" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" TEXT,
    "version" TEXT,
    "owner" TEXT NOT NULL,
    "status" "SystemStatus" NOT NULL DEFAULT 'NORMAL',
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "System_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "System_organizationId_idx" ON "System"("organizationId");

-- CreateIndex
CREATE INDEX "System_status_idx" ON "System"("status");

-- CreateIndex
CREATE INDEX "UseCase_systemId_idx" ON "UseCase"("systemId");

-- AddForeignKey
ALTER TABLE "System" ADD CONSTRAINT "System_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UseCase" ADD CONSTRAINT "UseCase_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "System"("id") ON DELETE CASCADE ON UPDATE CASCADE;
