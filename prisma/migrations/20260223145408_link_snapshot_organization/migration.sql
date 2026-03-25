-- AlterTable
ALTER TABLE "LedgerSnapshot" ADD COLUMN     "organizationId" TEXT;

-- CreateIndex
CREATE INDEX "LedgerSnapshot_organizationId_idx" ON "LedgerSnapshot"("organizationId");

-- AddForeignKey
ALTER TABLE "LedgerSnapshot" ADD CONSTRAINT "LedgerSnapshot_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
