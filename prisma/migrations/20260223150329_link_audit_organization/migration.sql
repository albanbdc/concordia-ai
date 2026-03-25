-- AlterTable
ALTER TABLE "Audit" ADD COLUMN     "organizationId" TEXT;

-- CreateIndex
CREATE INDEX "Audit_organizationId_idx" ON "Audit"("organizationId");

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
