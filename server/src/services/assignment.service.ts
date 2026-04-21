import { prisma } from "../prisma.js";

export const createAssignment = async (data: any, issuerId: number) => {
  const {
    assetId,
    assignedTo,
    payRollNo,
    dateOfAssignment,
    departmentId,
    floorLevel,
    roomNumber,
    accessories,
    notes,
    expectedReturnCondition,
  } = data;

  return await prisma.$transaction(async (tx) => {
    const year = new Date().getFullYear();
    const count = await tx.assetAssignment.count();
    const refNo = `ASSGN-${year}-${(count + 1).toString().padStart(3, "0")}`;

    const assignment = await tx.assetAssignment.create({
      data: {
        refNo,
        assetId: Number(assetId),
        assignedTo,
        payRollNo,
        departmentId: Number(departmentId),
        userId: issuerId,
        assignedAt: new Date(dateOfAssignment),
        floorLevel,
        roomNumber,
        accessories,
        notes,
        expectedReturnCondition,
        status: "ACTIVE",
      },
    });

    await tx.asset.update({
      where: { id: Number(assetId) },
      data: { status: "Assigned" },
    });

    await tx.activityLog.create({
      data: {
        type: "ASSIGNMENT",
        message: `Asset assigned to ${assignedTo} (Ref: ${refNo})`,
        assetId: Number(assetId),
        userId: issuerId,
      },
    });

    return assignment;
  });
};

export const getAssignmentStats = async () => {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [active, thisMonth, returned, overdue] = await Promise.all([
    prisma.assetAssignment.count({ where: { status: "ACTIVE" } }),
    prisma.assetAssignment.count({
      where: { assignedAt: { gte: firstDayOfMonth } },
    }),
    prisma.assetAssignment.count({ where: { status: "RETURNED" } }),
    prisma.assetAssignment.count({
      where: {
        OR: [{ isOverdue: true }, { status: "OVERDUE" }],
      },
    }),
  ]);

  return { active, thisMonth, returned, overdue };
};

export const getAllAssignments = async (filters: any) => {
  const { status, search, page = 1, limit = 10 } = filters;

  const where: any = {};

  if (status && status !== "All") {
    if (status === "Overdue") {
      where.OR = [{ isOverdue: true }, { status: "OVERDUE" }];
    } else {
      where.status = status.toUpperCase();
    }
  }

  if (search) {
    where.OR = [
      { assignedTo: { contains: search, mode: "insensitive" } },
      { payRollNo: { contains: search, mode: "insensitive" } },
      { refNo: { contains: search, mode: "insensitive" } },
      { asset: { tagNo: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [assignments, totalCount] = await Promise.all([
    prisma.assetAssignment.findMany({
      where,
      skip: (page - 1) * limit,
      take: Number(limit),
      include: {
        asset: { select: { tagNo: true, model: true, category: true } },
      },
      orderBy: { assignedAt: "desc" },
    }),
    prisma.assetAssignment.count({ where }),
  ]);

  return {
    assignments,
    totalCount,
    page,
    totalPages: Math.ceil(totalCount / limit),
  };
};
