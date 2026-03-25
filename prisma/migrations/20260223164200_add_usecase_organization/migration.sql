-- AlterTable
ALTER TABLE "UseCase" ADD COLUMN     "organizationId" TEXT;

-- CreateIndex
CREATE INDEX "UseCase_organizationId_idx" ON "UseCase"("organizationId");

-- AddForeignKey
ALTER TABLE "UseCase" ADD CONSTRAINT "UseCase_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
