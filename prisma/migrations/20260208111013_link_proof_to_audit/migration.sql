-- AlterTable
ALTER TABLE "UseCaseObligationProof" ADD COLUMN     "auditAt" TIMESTAMP(3),
ADD COLUMN     "auditId" TEXT;

-- CreateIndex
CREATE INDEX "Audit_userId_idx" ON "Audit"("userId");

-- CreateIndex
CREATE INDEX "UseCaseObligationProof_auditId_idx" ON "UseCaseObligationProof"("auditId");

-- AddForeignKey
ALTER TABLE "UseCaseObligationProof" ADD CONSTRAINT "UseCaseObligationProof_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
