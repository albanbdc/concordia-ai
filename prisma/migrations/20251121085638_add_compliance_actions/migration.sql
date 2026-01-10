-- CreateEnum
CREATE TYPE "ComplianceStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

-- CreateTable
CREATE TABLE "Audit" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "industrySector" TEXT,
    "useCaseType" TEXT,
    "internalDepartment" TEXT,
    "inputText" TEXT NOT NULL,
    "resultText" TEXT NOT NULL,

    CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceAction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "auditId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "ComplianceStatus" NOT NULL DEFAULT 'TODO',
    "weight" INTEGER,

    CONSTRAINT "ComplianceAction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ComplianceAction" ADD CONSTRAINT "ComplianceAction_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
