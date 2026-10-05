-- CreateEnum
CREATE TYPE "AssigneeType" AS ENUM ('PERSON', 'OFFICE');

-- AlterTable: printers/scanners are assigned to an office, which has no payroll number
ALTER TABLE "AssetAssignment" ALTER COLUMN "payRollNo" DROP NOT NULL;
ALTER TABLE "AssetAssignment" ADD COLUMN "assigneeType" "AssigneeType" NOT NULL DEFAULT 'PERSON';
