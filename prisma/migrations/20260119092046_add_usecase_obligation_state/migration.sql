/*
  Warnings:

  - You are about to drop the column `weight` on the `ComplianceAction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ComplianceAction" DROP COLUMN "weight",
ADD COLUMN     "obligationId" TEXT NOT NULL DEFAULT 'unknown',
ADD COLUMN     "owner" TEXT NOT NULL DEFAULT 'CLIENT',
ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'ENGINE',
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "name" TEXT,
    "image" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "UseCase" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UseCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UseCaseObligationState" (
    "id" TEXT NOT NULL,
    "useCaseKey" TEXT NOT NULL,
    "obligationId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "openActions" INTEGER NOT NULL DEFAULT 0,
    "lastAuditId" TEXT,
    "lastAuditAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UseCaseObligationState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "UseCase_key_key" ON "UseCase"("key");

-- CreateIndex
CREATE INDEX "UseCase_sector_idx" ON "UseCase"("sector");

-- CreateIndex
CREATE INDEX "UseCase_title_idx" ON "UseCase"("title");

-- CreateIndex
CREATE INDEX "UseCaseObligationState_obligationId_idx" ON "UseCaseObligationState"("obligationId");

-- CreateIndex
CREATE INDEX "UseCaseObligationState_status_idx" ON "UseCaseObligationState"("status");

-- CreateIndex
CREATE INDEX "UseCaseObligationState_priority_idx" ON "UseCaseObligationState"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "UseCaseObligationState_useCaseKey_obligationId_key" ON "UseCaseObligationState"("useCaseKey", "obligationId");

-- CreateIndex
CREATE INDEX "ComplianceAction_auditId_idx" ON "ComplianceAction"("auditId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UseCaseObligationState" ADD CONSTRAINT "UseCaseObligationState_useCaseKey_fkey" FOREIGN KEY ("useCaseKey") REFERENCES "UseCase"("key") ON DELETE CASCADE ON UPDATE CASCADE;
