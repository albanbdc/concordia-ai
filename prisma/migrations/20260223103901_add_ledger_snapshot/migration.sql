-- CreateTable
CREATE TABLE "LedgerSnapshot" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "headHash" TEXT,
    "actor" TEXT,

    CONSTRAINT "LedgerSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LedgerSnapshot_createdAt_idx" ON "LedgerSnapshot"("createdAt");
