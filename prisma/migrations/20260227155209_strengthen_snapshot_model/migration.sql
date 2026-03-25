-- AlterTable
ALTER TABLE "LedgerSnapshot" ADD COLUMN     "historyCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sealed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "snapshotHash" TEXT;

-- CreateIndex
CREATE INDEX "LedgerSnapshot_sealed_idx" ON "LedgerSnapshot"("sealed");
