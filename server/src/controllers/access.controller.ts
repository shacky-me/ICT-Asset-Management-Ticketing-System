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

// ─── Role resolver ────────────────────────────────────────────────────────────

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

  if (!normalizedRole) return "END_USER";
  if (normalizedRole.includes("admin")) return "ICT_ADMIN";
  if (normalizedRole.includes("supervisor") || normalizedRole.includes("hod")) return "SUPERVISOR";
  if (normalizedRole.includes("officer") || normalizedRole.includes("ict")) return "ICT_OFFICER";
  if (normalizedRole.includes("staff") || normalizedRole.includes("end user")) return "END_USER";

  return null;
}

// ─── Fetch all active ICT_ADMIN users from the database ───────────────────────

async function getAllAdmins(): Promise<{ email: string; fullName: string }[]> {
  return prisma.user.findMany({
    where: { role: "ICT_ADMIN", isActive: true },
    select: { email: true, fullName: true },
  });
}

// ─── Notify every admin in the system ────────────────────────────────────────

async function notifyAllAdmins(payload: {
  fullName: string;
  email: string;
  department: string;
  role: string;
  reason?: string;
}): Promise<void> {
  const admins = await getAllAdmins();

  if (admins.length === 0) {
    console.warn("[EMAIL] ⚠️ No active ICT_ADMIN users found to notify.");
    return;
  }

  console.log(`[EMAIL] Notifying ${admins.length} admin(s)...`);

  await Promise.allSettled(
    admins.map((admin) =>
      notifyAdmin({
        adminEmail: admin.email,
        adminName: admin.fullName,
        ...payload,
      }).catch((err) =>
        console.error(
          `[EMAIL] ❌ Failed to notify admin ${admin.email}:`,
          err instanceof Error ? err.message : err,
        ),
      ),
    ),
  );
}

// ─── Controllers ─────────────────────────────────────────────────────────────

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
      // Re-notify all admins for already-pending requests
      try {
        console.log("[ACCESS] Request already pending — re-notifying all admins...");
        await notifyAllAdmins({
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

    console.log("[ACCESS] About to notify all admins...");
    try {
      await notifyAllAdmins({
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

    // ── Send temp password to the approved user ──────────────────────────────
    console.log("[APPROVAL] Sending access email to:", result.user.email);
    console.log("[APPROVAL] BREVO_API_KEY present:", !!process.env.BREVO_API_KEY);
    console.log("[APPROVAL] EMAIL_FROM:", process.env.EMAIL_FROM);

    try {
      await sendAccessEmail({
        to: result.user.email,
        name: result.user.fullName,
        tempPassword: result.tempPassword,
      });
      console.log("[APPROVAL] ✅ Access email sent successfully to:", result.user.email);
    } catch (emailError) {
      console.error(
        "[APPROVAL] ❌ Failed to send access email to:", result.user.email,
        "| Error:", emailError instanceof Error ? emailError.message : emailError,
      );
    }

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

    console.log("[REJECT] Sending rejection email to:", request.email);
    try {
      await sendAccessRejectedEmail({
        to: request.email,
        name: request.fullName,
        reason: rejectionReason,
      });
      console.log("[REJECT] ✅ Rejection email sent to:", request.email);
    } catch (emailError) {
      console.error(
        "[REJECT] ❌ Failed to send rejection email to:", request.email,
        "| Error:", emailError instanceof Error ? emailError.message : emailError,
      );
    }

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