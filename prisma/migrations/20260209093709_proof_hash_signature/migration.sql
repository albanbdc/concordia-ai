-- CreateTable
CREATE TABLE "UseCaseObligationProofVersion" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "proofId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "label" TEXT,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "actor" TEXT,
    "auditId" TEXT,
    "auditAt" TIMESTAMP(3),
    "integrityHash" TEXT,

    CONSTRAINT "UseCaseObligationProofVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UseCaseObligationProofVersion_proofId_createdAt_idx" ON "UseCaseObligationProofVersion"("proofId", "createdAt");

-- CreateIndex
CREATE INDEX "UseCaseObligationProofVersion_auditId_idx" ON "UseCaseObligationProofVersion"("auditId");

-- CreateIndex
CREATE UNIQUE INDEX "UseCaseObligationProofVersion_proofId_version_key" ON "UseCaseObligationProofVersion"("proofId", "version");

-- AddForeignKey
ALTER TABLE "UseCaseObligationProofVersion" ADD CONSTRAINT "UseCaseObligationProofVersion_proofId_fkey" FOREIGN KEY ("proofId") REFERENCES "UseCaseObligationProof"("id") ON DELETE CASCADE ON UPDATE CASCADE;
