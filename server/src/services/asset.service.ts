import { prisma } from "../prisma.js";

export const createAsset = async (data: any, userId: number) => {
  const {
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
    departmentId,
  } = data;

  // ✅ Validation
  if (
    !tagNo ||
    !serialNumber ||
    !category ||
    !make ||
    !model ||
    !departmentId
  ) {
    throw new Error("Missing required fields");
  }

  // ✅ Check duplicate
  const existing = await prisma.asset.findUnique({
    where: { serialNumber },
  });

  if (existing) {
    throw new Error("Asset with this serial number already exists");
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
          connect: { id: Number(departmentId) },
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
    prisma.asset.count({ where: { status: "InStore" } }),
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
