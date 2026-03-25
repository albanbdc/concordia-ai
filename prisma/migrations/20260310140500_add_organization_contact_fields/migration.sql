-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactPhone" TEXT;

-- AddForeignKey
ALTER TABLE "UseCaseObligationState" ADD CONSTRAINT "UseCaseObligationState_obligationId_fkey" FOREIGN KEY ("obligationId") REFERENCES "ObligationCatalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
