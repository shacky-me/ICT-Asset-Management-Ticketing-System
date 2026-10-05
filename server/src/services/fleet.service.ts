import { prisma } from "../prisma.js";
import type { FuelType, VehicleStatus } from "@prisma/client";

// The fleet belongs to the PS, Director and Assistant Director. The ICT Admin
// has no standing here, same as with documents.
export const FLEET_ROLES = ["PS", "DIRECTOR", "ASSISTANT_DIRECTOR"];

export function canUseFleet(role: string): boolean {
  return FLEET_ROLES.includes(role);
}

const FUELS: FuelType[] = ["PETROL", "DIESEL", "HYBRID", "ELECTRIC"];
const STATUSES: VehicleStatus[] = ["ACTIVE", "IN_SERVICE", "RETIRED"];

// A service is "due" once the vehicle is within 500km of its next one.
const SERVICE_WARNING_KM = 500;

export type VehicleInput = {
  plate?: string;
  make?: string;
  model?: string;
  year?: unknown;
  colour?: string;
  engineNo?: string;
  chassisNo?: string;
  vin?: string;
  fuel?: string;
  status?: string;
  condition?: string;
  remarks?: string;
  driver?: string;
  assignedTo?: string;
  mileage?: unknown;
  serviceIntervalKm?: unknown;
  lastServiceMileage?: unknown;
};

function text(value: unknown, field: string, required = true): string | undefined {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) {
    if (required) throw new Error(`${field} is required`);
    return undefined;
  }
  return trimmed;
}

// Treats undefined, null and "" alike, so a column that was never filled in
// does not look like a bad value when the record is edited.
function isBlank(value: unknown): boolean {
  return value === undefined || value === null || String(value).trim() === "";
}

function wholeNumber(value: unknown, field: string, min = 0): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min) {
    throw new Error(`${field} must be a number of ${min} or more`);
  }
  return Math.round(parsed);
}

export function parseVehicle(input: VehicleInput) {
  const plate = text(input.plate, "Registration number")!.toUpperCase();
  const make = text(input.make, "Make")!;

  const fuel = String(input.fuel || "PETROL").toUpperCase() as FuelType;
  if (!FUELS.includes(fuel)) {
    throw new Error(`Fuel must be one of ${FUELS.join(", ")}`);
  }

  const status = String(input.status || "ACTIVE").toUpperCase() as VehicleStatus;
  if (!STATUSES.includes(status)) {
    throw new Error(`Status must be one of ${STATUSES.join(", ")}`);
  }

  let year: number | undefined;
  if (!isBlank(input.year)) {
    year = wholeNumber(input.year, "Year", 1980);
    if (year > new Date().getFullYear() + 1) {
      throw new Error("Year cannot be in the future");
    }
  }

  const mileage = isBlank(input.mileage)
    ? 0
    : wholeNumber(input.mileage, "Mileage");

  const serviceIntervalKm = isBlank(input.serviceIntervalKm)
    ? 10000
    : wholeNumber(input.serviceIntervalKm, "Service interval", 1);

  // A VIN is 11-17 letters and digits. I, O and Q are never used, to avoid
  // confusion with 1 and 0.
  const vin = text(input.vin, "VIN", false)?.toUpperCase();
  if (vin && !/^[A-HJ-NPR-Z0-9]{11,17}$/.test(vin)) {
    throw new Error("VIN must be 11-17 letters or digits, without I, O or Q");
  }

  const lastServiceMileage = isBlank(input.lastServiceMileage)
    ? mileage
    : wholeNumber(input.lastServiceMileage, "Last service mileage");

  if (lastServiceMileage > mileage) {
    throw new Error("Last service mileage cannot be greater than current mileage");
  }

  // Only the fields that actually have a value are returned, so Prisma is
  // never handed `undefined` for a column.
  const optional: Record<string, string> = {};
  const addIfSet = (key: string, value?: string) => {
    if (value !== undefined) optional[key] = value;
  };

  addIfSet("model", text(input.model, "Model", false));
  addIfSet("colour", text(input.colour, "Colour", false));
  addIfSet("engineNo", text(input.engineNo, "Engine number", false));
  addIfSet("chassisNo", text(input.chassisNo, "Chassis number", false));
  addIfSet("vin", vin);
  addIfSet("condition", text(input.condition, "Condition", false));
  addIfSet("remarks", text(input.remarks, "Remarks", false));
  addIfSet("driver", text(input.driver, "Driver", false));
  addIfSet("assignedTo", text(input.assignedTo, "Assigned to", false));

  return {
    plate,
    make,
    fuel,
    status,
    mileage,
    serviceIntervalKm,
    lastServiceMileage,
    ...(year !== undefined ? { year } : {}),
    ...optional,
  };
}

type VehicleRow = {
  status: VehicleStatus;
  mileage: number;
  serviceIntervalKm: number;
  lastServiceMileage: number;
};

export function withServiceInfo<T extends VehicleRow>(vehicle: T) {
  const nextServiceMileage = vehicle.lastServiceMileage + vehicle.serviceIntervalKm;
  const kmToService = nextServiceMileage - vehicle.mileage;
  return {
    ...vehicle,
    nextServiceMileage,
    kmToService,
    serviceDue: vehicle.status !== "RETIRED" && kmToService <= SERVICE_WARNING_KM,
  };
}

async function assertPlateIsFree(plate: string, ignoreId?: number) {
  const existing = await prisma.vehicle.findFirst({
    where: {
      plate: { equals: plate, mode: "insensitive" },
      ...(ignoreId ? { id: { not: ignoreId } } : {}),
    },
    select: { id: true },
  });

  if (existing) {
    throw new Error(`A vehicle with registration ${plate} already exists`);
  }
}

export async function listVehicles(filters: {
  search?: string;
  status?: string;
  make?: string;
}) {
  const vehicles = await prisma.vehicle.findMany({
    include: {
      mileageLog: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { recordedBy: { select: { fullName: true } } },
      },
    },
    orderBy: { plate: "asc" },
  });

  const query = (filters.search || "").trim().toLowerCase();
  const status = (filters.status || "").trim().toUpperCase();
  const make = (filters.make || "").trim().toLowerCase();

  return vehicles
    .filter((vehicle) => !status || status === "ALL" || vehicle.status === status)
    .filter((vehicle) => !make || vehicle.make.toLowerCase() === make)
    .filter((vehicle) => {
      if (!query) return true;
      return [
        vehicle.plate,
        vehicle.make,
        vehicle.model || "",
        vehicle.driver || "",
        vehicle.assignedTo || "",
        vehicle.chassisNo || "",
        vehicle.engineNo || "",
        vehicle.vin || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    })
    .map(withServiceInfo);
}

export async function getVehicle(id: number) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      mileageLog: {
        orderBy: { createdAt: "desc" },
        include: { recordedBy: { select: { fullName: true } } },
      },
      addedBy: { select: { fullName: true } },
    },
  });

  return vehicle ? withServiceInfo(vehicle) : null;
}

export async function createVehicle(input: VehicleInput, actorId: number) {
  const data = parseVehicle(input);
  await assertPlateIsFree(data.plate);

  const vehicle = await prisma.vehicle.create({
    data: {
      ...data,
      addedById: actorId,
      mileageLog: {
        create: {
          mileage: data.mileage,
          note: "Opening reading",
          recordedById: actorId,
        },
      },
    },
  });

  return withServiceInfo(vehicle);
}

export async function updateVehicle(
  id: number,
  input: VehicleInput,
  actorId: number,
) {
  const existing = await prisma.vehicle.findUnique({ where: { id } });
  if (!existing) throw new Error("Vehicle not found");

  const data = parseVehicle({ ...existing, ...input } as VehicleInput);
  await assertPlateIsFree(data.plate, id);

  // The odometer only ever goes forward.
  if (data.mileage < existing.mileage) {
    throw new Error("Odometer cannot go backwards");
  }

  const vehicle = await prisma.vehicle.update({
    where: { id },
    data: {
      ...data,
      ...(data.mileage > existing.mileage
        ? {
            mileageLog: {
              create: {
                mileage: data.mileage,
                note: "Updated with vehicle details",
                recordedById: actorId,
              },
            },
          }
        : {}),
    },
  });

  return withServiceInfo(vehicle);
}

export async function recordMileage(
  id: number,
  mileage: unknown,
  note: string | undefined,
  actorId: number,
) {
  const existing = await prisma.vehicle.findUnique({ where: { id } });
  if (!existing) throw new Error("Vehicle not found");

  const reading = wholeNumber(mileage, "Mileage");

  if (reading < existing.mileage) {
    throw new Error(
      `Odometer cannot go backwards: the last reading was ${existing.mileage} km`,
    );
  }

  const vehicle = await prisma.vehicle.update({
    where: { id },
    data: {
      mileage: reading,
      mileageLog: {
        create: {
          mileage: reading,
          ...(note ? { note } : {}),
          recordedById: actorId,
        },
      },
    },
  });

  return withServiceInfo(vehicle);
}

export async function markServiced(
  id: number,
  actorId: number,
  note?: string,
) {
  const existing = await prisma.vehicle.findUnique({ where: { id } });
  if (!existing) throw new Error("Vehicle not found");

  const vehicle = await prisma.vehicle.update({
    where: { id },
    data: {
      lastServiceMileage: existing.mileage,
      status: existing.status === "IN_SERVICE" ? "ACTIVE" : existing.status,
      mileageLog: {
        create: {
          mileage: existing.mileage,
          note: note?.trim() || "Serviced",
          recordedById: actorId,
        },
      },
    },
  });

  return withServiceInfo(vehicle);
}

export async function deleteVehicle(id: number) {
  const existing = await prisma.vehicle.findUnique({ where: { id } });
  if (!existing) throw new Error("Vehicle not found");
  await prisma.vehicle.delete({ where: { id } });
}

export async function fleetSummary() {
  const vehicles = await prisma.vehicle.findMany();
  const withInfo = vehicles.map(withServiceInfo);
  const totalMileage = vehicles.reduce((sum, v) => sum + v.mileage, 0);

  return {
    totalVehicles: vehicles.length,
    active: vehicles.filter((v) => v.status === "ACTIVE").length,
    inService: vehicles.filter((v) => v.status === "IN_SERVICE").length,
    retired: vehicles.filter((v) => v.status === "RETIRED").length,
    totalMileage,
    averageMileage: vehicles.length
      ? Math.round(totalMileage / vehicles.length)
      : 0,
    serviceDue: withInfo.filter((v) => v.serviceDue).length,
  };
}
