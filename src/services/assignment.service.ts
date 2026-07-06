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
    // Generate a unique reference number using timestamp and random component
    // to avoid collisions from deleted records or race conditions
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    const refNo = `ASSGN-${year}-${timestamp}${random}`;

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

export const updateAssignment = async (id: number, data: any) => {
  const {
    assignedTo,
    payRollNo,
    departmentId,
    floorLevel,
    roomNumber,
    accessories,
    notes,
    expectedReturnCondition,
  } = data;

  return await prisma.assetAssignment.update({
    where: { id },
    data: {
      ...(assignedTo && { assignedTo }),
      ...(payRollNo && { payRollNo }),
      ...(departmentId && { departmentId: Number(departmentId) }),
      ...(floorLevel !== undefined && { floorLevel }),
      ...(roomNumber !== undefined && { roomNumber }),
      ...(accessories !== undefined && { accessories }),
      ...(notes !== undefined && { notes }),
      ...(expectedReturnCondition && { expectedReturnCondition }),
    },
    include: {
      asset: { select: { tagNo: true, model: true, category: true } },
      department: { select: { name: true } },
    },
  });
};

export const updateAssignmentStatus = async (
  id: number,
  newStatus: string,
  userId: number,
) => {
  const validStatuses = ["ACTIVE", "RETURNED", "OVERDUE"];
  if (!validStatuses.includes(newStatus.toUpperCase())) {
    throw new Error(
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
    );
  }

  const assignment = await prisma.assetAssignment.findUnique({
    where: { id },
  });

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  const upperStatus = newStatus.toUpperCase();
  if (assignment.status === upperStatus) {
    throw new Error(`Assignment is already in ${upperStatus} status`);
  }

  const oldStatus = assignment.status;

  const updateData: any = {
    status: upperStatus,
  };

  // If returning, set returnedAt to now
  if (upperStatus === "RETURNED") {
    updateData.returnedAt = new Date();
    updateData.isOverdue = false;
  }

  // If marking as overdue, set isOverdue flag
  if (upperStatus === "OVERDUE") {
    updateData.isOverdue = true;
  }

  await prisma.$transaction(async (tx) => {
    // Update assignment status
    await tx.assetAssignment.update({
      where: { id },
      data: updateData,
    });

    // If returning, update asset status back to Available
    if (upperStatus === "RETURNED") {
      await tx.asset.update({
        where: { id: assignment.assetId },
        data: { status: "Available" },
      });
    }

    // Log the status change
    await tx.activityLog.create({
      data: {
        assetId: assignment.assetId,
        type: "ASSIGNMENT",
        message: `Assignment status changed from ${oldStatus} to ${upperStatus}`,
        userId,
      },
    });
  });

  return { id, oldStatus, newStatus: upperStatus };
};

export const deleteAssignment = async (id: number, userId: number) => {
  const assignment = await prisma.assetAssignment.findUnique({
    where: { id },
    include: { asset: true },
  });

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  return await prisma.$transaction(async (tx) => {
    await tx.assetAssignment.delete({ where: { id } });

    const activeAssignments = await tx.assetAssignment.count({
      where: { assetId: assignment.assetId, status: "ACTIVE" },
    });

    if (activeAssignments === 0) {
      await tx.asset.update({
        where: { id: assignment.assetId },
        data: { status: "InStore" },
      });
    }

    await tx.activityLog.create({
      data: {
        type: "STATUS_CHANGE",
        message: `Assignment ${assignment.refNo} removed`,
        assetId: assignment.assetId,
        userId,
      },
    });
  });
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
        department: { select: { name: true } },
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
