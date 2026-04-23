import { prisma } from "../prisma.js";

export const createAsset = async (data: any, userId: number) => {
  const {
    tagNo,
    systemAssetId,
    department,
    category,
    subCategory,
    assetDescription,
    make,
    model,
    physicalCondition,
    serialNumber,
    macAddress,
    imeiNumber,
    color,
    departmentId,
  } = data;

  if (
    !tagNo ||
    !serialNumber ||
    !category ||
    !make ||
    !model ||
    (!departmentId && !department)
  ) {
    throw new Error("Missing required fields");
  }

  const parsedDepartmentId = Number(departmentId);
  const hasDepartmentId =
    Number.isFinite(parsedDepartmentId) && parsedDepartmentId > 0;
  const departmentName = String(department || "").trim();

  const resolvedDepartment = hasDepartmentId
    ? await prisma.department.findUnique({
        where: { id: parsedDepartmentId },
      })
    : await prisma.department.upsert({
        where: { name: departmentName },
        update: {},
        create: { name: departmentName },
      });

  if (!resolvedDepartment) {
    throw new Error("Department not found");
  }

  const [duplicateSerial, duplicateTagNo, duplicateSystemAssetId] =
    await Promise.all([
      prisma.asset.findUnique({ where: { serialNumber } }),
      prisma.asset.findUnique({ where: { tagNo } }),
      systemAssetId
        ? prisma.asset.findUnique({ where: { systemAssetId } })
        : Promise.resolve(null),
    ]);

  if (duplicateSerial) {
    throw new Error("Asset with this serial number already exists");
  }

  if (duplicateTagNo) {
    throw new Error("Asset tag number already exists");
  }

  if (duplicateSystemAssetId) {
    throw new Error("System asset ID already exists");
  }

  const asset = await prisma.$transaction(async (tx) => {
    const newAsset = await tx.asset.create({
      data: {
        tagNo,
        systemAssetId,
        category,
        subCategory,
        assetDescription,
        make,
        model,
        physicalCondition,
        serialNumber,
        macAddress,
        imeiNumber,
        color,
        department: {
          connect: { id: resolvedDepartment.id },
        },
      },
    });

    await tx.activityLog.create({
      data: {
        type: "REGISTRATION",
        message: `Asset ${newAsset.tagNo} registered`,
        assetId: newAsset.id,
        userId,
      },
    });

    return newAsset;
  });

  return asset;
};

// asset.service.ts

export const getAssetStats = async () => {
  const [total, assigned, inStore, maintenance] = await Promise.all([
    prisma.asset.count(),
    prisma.asset.count({ where: { status: "Assigned" } }),
    prisma.asset.count({
      where: {
        OR: [{ status: "InStore" }, { status: "Available" }],
      },
    }),
    prisma.asset.count({ where: { status: "Maintenance" } }),
  ]);

  return { total, assigned, inStore, maintenance };
};

export const getAllAssets = async (filters: any) => {
  const { status, search, page = 1, limit = 10 } = filters;

  const where: any = {};

  if (status && status !== "All") {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { tagNo: { contains: search, mode: "insensitive" } },
      { serialNumber: { contains: search, mode: "insensitive" } },
      { model: { contains: search, mode: "insensitive" } },
    ];
  }

  const [assets, totalCount] = await Promise.all([
    prisma.asset.findMany({
      where,
      skip: (page - 1) * limit,
      take: Number(limit),
      include: {
        department: { select: { name: true } }, // To show the DEPT column
        procurement: {
          select: {
            warrantyEnd: true,
            warrantyType: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.asset.count({ where }),
  ]);

  return {
    assets,
    totalCount,
    page,
    totalPages: Math.ceil(totalCount / limit),
  };
};

export const getAssetById = async (id: number) => {
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      hardwareSpec: true,
      procurement: true,
      department: { select: { name: true } },
      assignment: {
        orderBy: { assignedAt: "desc" },
        take: 5, // Last 5 people who had it
      },
      _count: {
        select: { assignment: true },
      },
    },
  });

  if (!asset) throw new Error("Asset not found");
  return asset;
};

export const removeAsset = async (id: number, userId: number) => {
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      assignment: {
        where: { status: "ACTIVE" },
        select: { id: true },
      },
    },
  });

  if (!asset) {
    throw new Error("Asset not found");
  }

  if (asset.assignment.length > 0) {
    throw new Error(
      "Cannot remove asset while it has an active assignment. Return it first.",
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.activityLog.create({
      data: {
        type: "STATUS_CHANGE",
        message: `Asset ${asset.tagNo} removed from register`,
        userId,
      },
    });

    await tx.activityLog.deleteMany({ where: { assetId: id } });
    await tx.assetAssignment.deleteMany({ where: { assetId: id } });
    await tx.hardwareSpec.deleteMany({ where: { assetId: id } });
    await tx.procurement.deleteMany({ where: { assetId: id } });
    await tx.asset.delete({ where: { id } });
  });

  return { id };
};
