-- CreateTable
CREATE TABLE "HardwareSpec" (
    "id" SERIAL NOT NULL,
    "assetId" INTEGER NOT NULL,
    "processor" TEXT,
    "ram" TEXT,
    "storage" TEXT,
    "screenSize" TEXT,
    "powerRating" TEXT,
    "color" TEXT,
    "operatingSystem" TEXT,
    "osVersion" TEXT,
    "ipAddress" TEXT,
    "hostName" TEXT,

    CONSTRAINT "HardwareSpec_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HardwareSpec_assetId_key" ON "HardwareSpec"("assetId");

-- AddForeignKey
ALTER TABLE "HardwareSpec" ADD CONSTRAINT "HardwareSpec_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
