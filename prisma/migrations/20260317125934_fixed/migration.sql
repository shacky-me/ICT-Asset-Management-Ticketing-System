/*
  Warnings:

  - You are about to drop the column `assetTag` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Asset` table. All the data in the column will be lost.
  - Added the required column `tagNo` to the `Asset` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "assetTag",
DROP COLUMN "name",
DROP COLUMN "type",
ADD COLUMN     "tagNo" TEXT NOT NULL;
