import type { Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../prisma.js";
import { generateTempPassword } from "../utils/generateRandomPassword.js";
import { sendAccessEmail, notifyAdmin } from "../services/emailService.js";
import type { AuthRequest } from "../types/auth.types.js";
import type { CreateAccessRequestBody } from "../types/access.Request.types.js";

function resolveRequestedRole(
  roleRequested?: string,
  role?: string,
): "ICT_OFFICER" | "ICT_ADMIN" | null {
  if (roleRequested === "ICT_OFFICER" || roleRequested === "ICT_ADMIN") {
    return roleRequested;
  }

  const normalizedRole = String(role || "")
    .trim()
    .toLowerCase();

  if (!normalizedRole) {
    return "ICT_OFFICER";
  }

  if (normalizedRole.includes("admin")) {
    return "ICT_ADMIN";
  }

  if (
    normalizedRole.includes("officer") ||
    normalizedRole.includes("staff") ||
    normalizedRole.includes("supervisor") ||
    normalizedRole.includes("end user")
  ) {
    return "ICT_OFFICER";
  }

  return null;
}

export const createAccessRequest = async (
  req: AuthRequest<CreateAccessRequestBody>,
  res: Response,
) => {
  console.log("[ACCESS] POST /api/access-request received");
  console.log("[ACCESS] Request body:", req.body);
  try {
    const {
      fullName,
      staffNumber,
      staffNo,
      jobTitle,
      email,
      department,
      departmentId,
      role,
      roleRequested,
      reason,
    } = req.body as CreateAccessRequestBody & {
      staffNumber?: string;
      department?: string;
      role?: string;
    };

    const resolvedDepartmentId =
      typeof departmentId === "number"
        ? departmentId
        : department
          ? (
              await prisma.department.upsert({
                where: { name: department.trim() },
                update: {},
                create: { name: department.trim() },
              })
            ).id
          : null;

    if (!resolvedDepartmentId) {
      return res.status(400).json({ message: "Department is required" });
    }

    const resolvedRole = resolveRequestedRole(roleRequested, role);

    if (!resolvedRole) {
      return res.status(400).json({
        message: "Invalid role requested. Use ICT_OFFICER or ICT_ADMIN.",
      });
    }

    const resolvedStaffNo = staffNo || staffNumber;

    if (!fullName || !resolvedStaffNo || !jobTitle || !email) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await prisma.accessRequest.findFirst({
      where: { email: email.toLowerCase() },
      include: { department: true },
    });
    if (existing && !existing.approved) {
      // Re-notify admin for already-pending requests to avoid missed emails.
      try {
        await notifyAdmin({
          fullName: existing.fullName,
          email: existing.email,
          department: existing.department?.name ?? "Unknown department",
          role: existing.roleRequested,
          reason: existing.reason || "No reason provided",
        });

        return res.status(200).json({
          message:
            "Request already submitted and pending approval. Admin has been re-notified.",
          requestId: existing.id,
        });
      } catch (notifyError) {
        console.error(
          "[ACCESS] Re-notify Admin Error:",
          notifyError instanceof Error ? notifyError.message : notifyError,
        );

        return res.status(200).json({
          message:
            "Request already submitted and pending approval. Failed to re-notify admin.",
          requestId: existing.id,
        });
      }
    }

    if (existing?.approved) {
      return res.status(409).json({
        message: "Access request already approved for this email",
      });
    }

    const request = await prisma.accessRequest.create({
      data: {
        fullName,
        staffNo: resolvedStaffNo,
        jobTitle,
        email: email.toLowerCase(),
        departmentId: resolvedDepartmentId,
        roleRequested: resolvedRole,
        reason: reason || "",
        approved: false,
      },
    });

    console.log("[ACCESS] About to notify admin...");
    try {
      console.log("[ACCESS] Calling notifyAdmin with:", {
        fullName,
        email,
        department: department ?? "Unknown department",
        role: resolvedRole,
        reason: reason || "No reason provided",
      });
      await notifyAdmin({
        fullName,
        email,
        department: department ?? "Unknown department",
        role: resolvedRole,
        reason: reason || "No reason provided",
      });
      console.log("[ACCESS] Admin notification completed successfully");
    } catch (notifyError) {
      console.error(
        "[ACCESS] Notify Admin Error:",
        notifyError instanceof Error ? notifyError.message : notifyError,
      );
    }

    return res.status(201).json({
      message: "Request submitted. Admin notified.",
      requestId: request.id,
    });
  } catch (error) {
    console.error("Request Error:", error);
    return res.status(500).json({ message: "Failed to submit request" });
  }
};

export const getPendingAccessRequests = async (
  _req: AuthRequest,
  res: Response,
) => {
  try {
    const requests = await prisma.accessRequest.findMany({
      where: { approved: false },
      include: { department: true },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      requests: requests.map((request: any) => ({
        id: request.id,
        fullName: request.fullName,
        staffNo: request.staffNo,
        jobTitle: request.jobTitle,
        email: request.email,
        department: request.department.name,
        roleRequested: request.roleRequested,
        reason: request.reason,
        createdAt: request.createdAt,
      })),
    });
  } catch (error) {
    console.error("Pending Requests Error:", error);
    return res
      .status(500)
      .json({ message: "Failed to load pending access requests" });
  }
};

export const approveAccessRequest = async (
  req: AuthRequest<any>,
  res: Response,
) => {
  const requestIdFromBody = Number(req.body?.requestId);
  const requestIdFromParams = Number(req.params?.requestId);
  const requestId = Number.isFinite(requestIdFromParams)
    ? requestIdFromParams
    : requestIdFromBody;

  if (!Number.isFinite(requestId)) {
    return res.status(400).json({ message: "Valid requestId is required" });
  }

  try {
    const result = await prisma.$transaction(async (tx: any) => {
      const request = await tx.accessRequest.findUnique({
        where: { id: requestId },
      });
      if (!request || request.approved)
        throw new Error("Invalid request or already approved");

      const tempPassword = generateTempPassword();
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      const user = await tx.user.create({
        data: {
          fullName: request.fullName,
          email: request.email,
          staffNo: request.staffNo,
          jobTitle: request.jobTitle,
          password: hashedPassword,
          role: request.roleRequested,
          departmentId: request.departmentId,
        },
      });

      await tx.accessRequest.update({
        where: { id: requestId },
        data: { approved: true },
      });

      return { user, tempPassword };
    });

    await sendAccessEmail({
      to: result.user.email,
      name: result.user.fullName,
      tempPassword: result.tempPassword,
    });

    return res.json({ message: "User approved and created" });
  } catch (error) {
    console.error("Approval Error:", error);
    const message = error instanceof Error ? error.message : "Approval failed";
    return res.status(500).json({ message });
  }
};
