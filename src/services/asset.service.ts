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
    // Hardware specification fields
    processorCpu,
    ramMemory,
    primaryStorage,
    screenDisplaySize,
    powerRating,
    colourFinish,
    operatingSystem,
    osVersionBuildNumber,
    ipAddress,
    hostnameComputerName,
    // Procurement fields
    procurementDate,
    supplierVendor,
    fundingSource,
    invoiceNumber,
    lpoOrderNumber,
    purchasePrice,
    warrantyStartDate,
    warrantyEndDate,
    warrantyType,
    warrantyProvider,
    warrantyContactReference,
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

    // Create hardware spec record if any hardware data is provided
    if (
      processorCpu ||
      ramMemory ||
      primaryStorage ||
      screenDisplaySize ||
      powerRating ||
      colourFinish ||
      operatingSystem ||
      osVersionBuildNumber ||
      ipAddress ||
      hostnameComputerName
    ) {
      await tx.hardwareSpec.create({
        data: {
          assetId: newAsset.id,
          processor: processorCpu || null,
          ram: ramMemory || null,
          storage: primaryStorage || null,
          screenSize: screenDisplaySize || null,
          powerRating: powerRating || null,
          color: colourFinish || null,
          operatingSystem: operatingSystem || null,
          osVersion: osVersionBuildNumber || null,
          ipAddress: ipAddress || null,
          hostName: hostnameComputerName || null,
        },
      });
    }

    // Create procurement record if any procurement data is provided
    if (
      procurementDate ||
      supplierVendor ||
      fundingSource ||
      invoiceNumber ||
      purchasePrice ||
      warrantyStartDate ||
      warrantyEndDate ||
      warrantyType
    ) {
      await tx.procurement.create({
        data: {
          assetId: newAsset.id,
          procurementDate: procurementDate
            ? new Date(procurementDate)
            : new Date(),
          supplierVendor: supplierVendor || "",
          fundingSource: fundingSource || null,
          invoiceNumber: invoiceNumber || null,
          iopNumber: lpoOrderNumber || null,
          purchasePriceKES: purchasePrice ? parseFloat(purchasePrice) : null,
          warrantyStart: warrantyStartDate ? new Date(warrantyStartDate) : null,
          warrantyEnd: warrantyEndDate ? new Date(warrantyEndDate) : null,
          warrantyType: warrantyType || null,
          warrantyProvider: warrantyProvider || null,
          warrantyContact: warrantyContactReference || null,
        },
      });
    }

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
    // Map display status names to database status values
    const statusMap: Record<string, string> = {
      Assigned: "Assigned",
      "In Store": "InStore",
      Maintenance: "Maintenance",
      Flagged: "Flagged",
    };

    const dbStatus = statusMap[status] || status;
    where.status = dbStatus;
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
        department: { select: { name: true, id: true } },
        procurement: {
          select: {
            warrantyEnd: true,
            warrantyType: true,
          },
        },
        assignment: {
          where: { status: "ACTIVE" },
          orderBy: { assignedAt: "desc" },
          take: 1,
          select: { assignedTo: true, refNo: true },
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
      department: { select: { name: true, id: true } },
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

export const updateAssetStatus = async (
  id: number,
  newStatus: string,
  userId: number,
) => {
  // Validate status is one of the allowed enum values
  const validStatuses = [
    "Available",
    "Assigned",
    "InStore",
    "Maintenance",
    "Flagged",
  ];
  if (!validStatuses.includes(newStatus)) {
    throw new Error(
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
    );
  }

  const asset = await prisma.asset.findUnique({
    where: { id },
  });

  if (!asset) {
    throw new Error("Asset not found");
  }

  if (asset.status === newStatus) {
    throw new Error(`Asset is already in ${newStatus} status`);
  }

  const oldStatus = asset.status;

  await prisma.$transaction(async (tx) => {
    // Update asset status
    await tx.asset.update({
      where: { id },
      data: { status: newStatus as any },
    });

    // Log the status change
    await tx.activityLog.create({
      data: {
        assetId: id,
        type: "STATUS_CHANGE",
        message: `Asset status changed from ${oldStatus} to ${newStatus}`,
        userId,
      },
    });
  });

  return { id, oldStatus, newStatus };
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
