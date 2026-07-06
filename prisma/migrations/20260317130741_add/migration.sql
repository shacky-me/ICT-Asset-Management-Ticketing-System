/*
  Warnings:

  - A unique constraint covering the columns `[tagNo]` on the table `Asset` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[systemAssetId]` on the table `Asset` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[serialNumber]` on the table `Asset` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category` to the `Asset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `make` to the `Asset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `model` to the `Asset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serialNumber` to the `Asset` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "assetDescription" TEXT,
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "imeiNumber" TEXT,
ADD COLUMN     "macAddress" TEXT,
ADD COLUMN     "make" TEXT NOT NULL,
ADD COLUMN     "model" TEXT NOT NULL,
ADD COLUMN     "physicalCondition" TEXT,
ADD COLUMN     "serialNumber" TEXT NOT NULL,
ADD COLUMN     "subCategory" TEXT,
ADD COLUMN     "systemAssetId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Asset_tagNo_key" ON "Asset"("tagNo");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_systemAssetId_key" ON "Asset"("systemAssetId");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_serialNumber_key" ON "Asset"("serialNumber");
