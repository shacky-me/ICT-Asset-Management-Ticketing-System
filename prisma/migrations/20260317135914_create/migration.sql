-- CreateTable
CREATE TABLE "Procurement" (
    "id" SERIAL NOT NULL,
    "assetId" INTEGER NOT NULL,
    "procurementDate" TIMESTAMP(3) NOT NULL,
    "supplierVendor" TEXT NOT NULL,
    "fundingSource" TEXT,
    "invoiceNumber" TEXT,
    "iopNumber" TEXT,
    "purchasePriceKES" DOUBLE PRECISION,
    "warrantyStart" TIMESTAMP(3),
    "warrantyEnd" TIMESTAMP(3),
    "warrantyType" TEXT,
    "warrantyProvider" TEXT,
    "warrantyContact" TEXT,

    CONSTRAINT "Procurement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Procurement_assetId_key" ON "Procurement"("assetId");

-- AddForeignKey
ALTER TABLE "Procurement" ADD CONSTRAINT "Procurement_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
