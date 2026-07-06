/*
  Warnings:

  - The `disposalDate` column on the `AssetAssignment` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "AssetAssignment" DROP COLUMN "disposalDate",
ADD COLUMN     "disposalDate" TIMESTAMP(3);
