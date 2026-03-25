-- CreateTable
CREATE TABLE "UseCaseObligationProof" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "stateId" TEXT NOT NULL,
    "label" TEXT,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'LINK',
    "actor" TEXT,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "UseCaseObligationProof_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UseCaseObligationProof_stateId_createdAt_idx" ON "UseCaseObligationProof"("stateId", "createdAt");

-- CreateIndex
CREATE INDEX "UseCaseObligationProof_deletedAt_idx" ON "UseCaseObligationProof"("deletedAt");

-- AddForeignKey
ALTER TABLE "UseCaseObligationProof" ADD CONSTRAINT "UseCaseObligationProof_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "UseCaseObligationState"("id") ON DELETE CASCADE ON UPDATE CASCADE;
