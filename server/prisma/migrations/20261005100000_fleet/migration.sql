-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('ACTIVE', 'IN_SERVICE', 'RETIRED');
CREATE TYPE "FuelType" AS ENUM ('PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC');

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" SERIAL NOT NULL,
    "plate" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT,
    "year" INTEGER,
    "colour" TEXT,
    "engineNo" TEXT,
    "chassisNo" TEXT,
    "fuel" "FuelType" NOT NULL DEFAULT 'PETROL',
    "status" "VehicleStatus" NOT NULL DEFAULT 'ACTIVE',
    "condition" TEXT,
    "remarks" TEXT,
    "driver" TEXT,
    "assignedTo" TEXT,
    "mileage" INTEGER NOT NULL DEFAULT 0,
    "serviceIntervalKm" INTEGER NOT NULL DEFAULT 10000,
    "lastServiceMileage" INTEGER NOT NULL DEFAULT 0,
    "addedById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VehicleMileage" (
    "id" SERIAL NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "mileage" INTEGER NOT NULL,
    "note" TEXT,
    "recordedById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VehicleMileage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_plate_key" ON "Vehicle"("plate");

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "VehicleMileage" ADD CONSTRAINT "VehicleMileage_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VehicleMileage" ADD CONSTRAINT "VehicleMileage_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
