/*
  Warnings:

  - Made the column `payload` on table `UseCaseObligationHistory` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "UseCaseObligationHistory" ALTER COLUMN "payload" SET NOT NULL;
