import type { Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../prisma.js";
import { generateTempPassword } from "../utils/generateRandomPassword.js";
import {
  sendAccessEmail,
  sendAccessRejectedEmail,
  notifyAdmin,
  sendAdminBootstrapEmail,
} from "../services/emailService.js";
import type { AuthRequest } from "../types/auth.types.js";
import type { CreateAccessRequestBody } from "../types/access.Request.types.js";

function resolveRequestedRole(
  roleRequested?: string,
  role?: string,
): "END_USER" | "SUPERVISOR" | "ICT_OFFICER" | "ICT_ADMIN" | null {
  if (
    roleRequested === "END_USER" ||
    roleRequested === "SUPERVISOR" ||
    roleRequested === "ICT_OFFICER" ||
    roleRequested === "ICT_ADMIN"
  ) {
    return roleRequested;
  }

  const normalizedRole = String(role || "")
    .trim()
    .toLowerCase();

  if (!normalizedRole) {
    return "END_USER";
  }

  if (normalizedRole.includes("admin")) {
    return "ICT_ADMIN";
  }

  if (normalizedRole.includes("supervisor") || normalizedRole.includes("hod")) {
    return "SUPERVISOR";
  }

  if (normalizedRole.includes("officer") || normalizedRole.includes("ict")) {
    return "ICT_OFFICER";
  }

  if (normalizedRole.includes("staff") || normalizedRole.includes("end user")) {
    return "END_USER";
  }

  return null;
}

async function resolveUniqueAdminStaffNo(baseStaffNo: string): Promise<string> {
  const normalized = baseStaffNo.trim() || "ICTADMIN001";
  let candidate = normalized;
  let suffix = 1;

  while (true) {
    const existing = await prisma.user.findUnique({
      where: { staffNo: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }

    candidate = `${normalized}-${suffix}`;
    suffix += 1;
  }
}

async function ensureAdminAccountExists(): Promise<{
  created: boolean;
  email: string;
  fullName: string;
  tempPassword?: string;
}> {
  const adminEmail =
    process.env.ADMIN_EMAIL?.trim().toLowerCase() ||
    process.env.EMAIL_USER?.trim().toLowerCase() ||
    "";

  if (!adminEmail) {
    throw new Error("ADMIN_EMAIL or EMAIL_USER must be configured");
  }

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
    select: { email: true, fullName: true },
  });

  if (existingAdmin) {
    return {
      created: false,
      email: existingAdmin.email,
      fullName: existingAdmin.fullName,
    };
  }

  const departmentName = process.env.ADMIN_DEPARTMENT?.trim() || "IT Support";
  const adminName = process.env.ADMIN_NAME?.trim() || "System Administrator";
  const adminJobTitle =
    process.env.ADMIN_JOB_TITLE?.trim() || "ICT Administrator";
  const adminStaffNoBase = process.env.ADMIN_STAFF_NO?.trim() || "ICTADMIN001";

  const department = await prisma.department.upsert({
    where: { name: departmentName },
    update: {},
    create: { name: departmentName },
  });

  const staffNo = await resolveUniqueAdminStaffNo(adminStaffNoBase);
  const tempPassword = generateTempPassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  const createdAdmin = await prisma.user.create({
    data: {
      fullName: adminName,
      staffNo,
      jobTitle: adminJobTitle,
      email: adminEmail,
      password: hashedPassword,
      role: "ICT_ADMIN",
      departmentId: department.id,
      isActive: true,
      mustChangePassword: true,
    },
  });

  return {
    created: true,
    email: createdAdmin.email,
    fullName: createdAdmin.fullName,
    tempPassword,
  };
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
        message:
          "Invalid role requested. Use END_USER, SUPERVISOR, ICT_OFFICER, or ICT_ADMIN.",
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
        const adminAccount = await ensureAdminAccountExists();
        if (adminAccount.created && adminAccount.tempPassword) {
          await sendAdminBootstrapEmail({
            to: adminAccount.email,
            name: adminAccount.fullName,
            tempPassword: adminAccount.tempPassword,
          });
        }

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
      const adminAccount = await ensureAdminAccountExists();
      if (adminAccount.created && adminAccount.tempPassword) {
        await sendAdminBootstrapEmail({
          to: adminAccount.email,
          name: adminAccount.fullName,
          tempPassword: adminAccount.tempPassword,
        });
      }

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

      const normalizedEmail = String(request.email).trim().toLowerCase();
      const normalizedStaffNo = String(request.staffNo).trim();

      const existingByEmail = await tx.user.findUnique({
        where: { email: normalizedEmail },
      });
      const existingByStaffNo = await tx.user.findUnique({
        where: { staffNo: normalizedStaffNo },
      });

      if (
        existingByEmail &&
        existingByStaffNo &&
        existingByEmail.id !== existingByStaffNo.id
      ) {
        throw new Error(
          "Cannot approve request because email and staff number belong to different existing users.",
        );
      }

      const existingUser = existingByEmail || existingByStaffNo;
      const tempPassword = generateTempPassword();
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      const user = existingUser
        ? await tx.user.update({
            where: { id: existingUser.id },
            data: {
              fullName: request.fullName,
              email: normalizedEmail,
              staffNo: normalizedStaffNo,
              jobTitle: request.jobTitle,
              password: hashedPassword,
              role: request.roleRequested,
              departmentId: request.departmentId,
              isActive: true,
              mustChangePassword: true,
            },
          })
        : await tx.user.create({
            data: {
              fullName: request.fullName,
              email: normalizedEmail,
              staffNo: normalizedStaffNo,
              jobTitle: request.jobTitle,
              password: hashedPassword,
              role: request.roleRequested,
              departmentId: request.departmentId,
              mustChangePassword: true,
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

export const rejectAccessRequest = async (
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

  const rejectionReason = String(req.body?.reason || "").trim();

  try {
    const request = await prisma.accessRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.approved) {
      return res.status(404).json({ message: "Request not found" });
    }

    await prisma.accessRequest.delete({ where: { id: requestId } });

    await sendAccessRejectedEmail({
      to: request.email,
      name: request.fullName,
      reason: rejectionReason,
    });

    return res.status(200).json({
      message: "Request rejected and applicant notified",
    });
  } catch (error) {
    console.error("Reject Request Error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to reject request";
    return res.status(500).json({ message });
  }
};
