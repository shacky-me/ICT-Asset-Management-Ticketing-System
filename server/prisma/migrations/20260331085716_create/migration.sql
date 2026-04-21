/*
  Warnings:

  - A unique constraint covering the columns `[refNo]` on the table `AssetAssignment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `refNo` to the `AssetAssignment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AssetAssignment" ADD COLUMN     "refNo" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AssetAssignment_refNo_key" ON "AssetAssignment"("refNo");
