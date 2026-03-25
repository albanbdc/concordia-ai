-- CreateTable
CREATE TABLE "UseCaseObligationHistory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stateId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actor" TEXT,
    "auditId" TEXT,
    "auditAt" TIMESTAMP(3),
    "meta" JSONB,

    CONSTRAINT "UseCaseObligationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UseCaseObligationHistory_stateId_createdAt_idx" ON "UseCaseObligationHistory"("stateId", "createdAt");

-- CreateIndex
CREATE INDEX "UseCaseObligationHistory_type_createdAt_idx" ON "UseCaseObligationHistory"("type", "createdAt");

-- AddForeignKey
ALTER TABLE "UseCaseObligationHistory" ADD CONSTRAINT "UseCaseObligationHistory_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "UseCaseObligationState"("id") ON DELETE CASCADE ON UPDATE CASCADE;
