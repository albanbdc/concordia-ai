-- CreateEnum
CREATE TYPE "UseCaseRole" AS ENUM ('DEPLOYER', 'PROVIDER', 'BOTH');

-- AlterTable
ALTER TABLE "UseCase" ADD COLUMN     "role" "UseCaseRole" NOT NULL DEFAULT 'DEPLOYER';
