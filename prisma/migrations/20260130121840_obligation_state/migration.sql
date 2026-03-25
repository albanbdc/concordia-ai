-- CreateEnum
CREATE TYPE "ObligationStatus" AS ENUM ('NOT_EVALUATED', 'IN_PROGRESS', 'COMPLIANT', 'NON_COMPLIANT');

-- CreateTable
CREATE TABLE "ObligationState" (
    "id" TEXT NOT NULL,
    "obligationId" TEXT NOT NULL,
    "status" "ObligationStatus" NOT NULL DEFAULT 'NOT_EVALUATED',
    "owner" TEXT,
    "dueDate" TIMESTAMP(3),
    "notes" TEXT,
    "lastAuditId" TEXT,
    "lastAuditAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ObligationState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ObligationHistory" (
    "id" TEXT NOT NULL,
    "obligationId" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "fromStatus" "ObligationStatus",
    "toStatus" "ObligationStatus" NOT NULL,
    "note" TEXT,
    "auditId" TEXT,
    "auditAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ObligationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ObligationState_status_idx" ON "ObligationState"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ObligationState_obligationId_key" ON "ObligationState"("obligationId");

-- CreateIndex
CREATE INDEX "ObligationHistory_obligationId_createdAt_idx" ON "ObligationHistory"("obligationId", "createdAt");

-- CreateIndex
CREATE INDEX "ObligationHistory_stateId_createdAt_idx" ON "ObligationHistory"("stateId", "createdAt");

-- AddForeignKey
ALTER TABLE "ObligationHistory" ADD CONSTRAINT "ObligationHistory_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "ObligationState"("id") ON DELETE CASCADE ON UPDATE CASCADE;
