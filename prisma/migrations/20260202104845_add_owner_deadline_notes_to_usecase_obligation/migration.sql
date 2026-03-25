-- AlterTable
ALTER TABLE "UseCaseObligationState" ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "owner" TEXT;
