-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ACTIVE', 'RETURNED', 'OVERDUE');

-- AlterTable
ALTER TABLE "AssetAssignment" ADD COLUMN     "expectedReturnCondition" TEXT,
ADD COLUMN     "isOverdue" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "AssignmentStatus" NOT NULL DEFAULT 'ACTIVE';
