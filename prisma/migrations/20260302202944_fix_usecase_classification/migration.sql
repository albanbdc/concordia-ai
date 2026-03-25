-- CreateEnum
CREATE TYPE "UseCaseClassification" AS ENUM ('NORMAL', 'TRANSPARENCY', 'HIGH_RISK');

-- AlterTable
ALTER TABLE "UseCase" ADD COLUMN     "classification" "UseCaseClassification" NOT NULL DEFAULT 'NORMAL';
