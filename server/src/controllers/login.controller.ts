import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { prisma } from "../prisma.js";
import type { AuthRequest } from "../types/auth.types.js";
import { sendPasswordResetEmail } from "../services/emailService.js";
import { generateTempPassword } from "../utils/generateRandomPassword.js";

export const login = async (req: Request, res: Response) => {
  try {
    const { identifier, email, password } = req.body;
    const normalizedIdentifier = String(identifier || email || "")
      .trim()
      .toLowerCase();
    const rawIdentifier = String(identifier || email || "").trim();

    if (!normalizedIdentifier || !password) {
      return res.status(400).json({
        message: "Identifier and password are required",
      });
    }
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          {
            email: { equals: normalizedIdentifier, mode: "insensitive" },
          },
          {
            staffNo: { equals: rawIdentifier, mode: "insensitive" },
          },
        ],
      },
      include: { department: true },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }
    if (!user.isActive) {
      return res.status(403).json({
        message: "Account not yet authorized. Contact administrator.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }

    const tokenTtl = (process.env.JWT_EXPIRES_IN?.trim() ||
      "7d") as NonNullable<SignOptions["expiresIn"]>;
    const options: SignOptions = {
      expiresIn: tokenTtl,
    };

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        departmentId: user.departmentId,
      },
      secret,
      options,
    );

    const mappedRole =
      user.role === "ICT_ADMIN" ? "ICT Administrator" : "ICT Officer";

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: mappedRole,
        department: user.department.name,
        staffNumber: user.staffNo,
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const logout = async (_req: Request, res: Response) => {
  return res.status(200).json({ message: "Logout successful" });
};

export const me = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { department: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const mappedRole =
      user.role === "ICT_ADMIN" ? "ICT Administrator" : "ICT Officer";

    return res.status(200).json({
      user: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: mappedRole,
        department: user.department.name,
        staffNumber: user.staffNo,
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (error) {
    console.error("ME ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const changeTemporaryPassword = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body as {
      currentPassword?: string;
      newPassword?: string;
    };

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (String(newPassword).trim().length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { department: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const sameAsCurrent = await bcrypt.compare(newPassword, user.password);
    if (sameAsCurrent) {
      return res.status(400).json({
        message: "New password must be different from current password",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
      include: { department: true },
    });

    const mappedRole =
      updatedUser.role === "ICT_ADMIN" ? "ICT Administrator" : "ICT Officer";

    return res.status(200).json({
      message: "Password updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.fullName,
        email: updatedUser.email,
        role: mappedRole,
        department: updatedUser.department.name,
        staffNumber: updatedUser.staffNo,
        mustChangePassword: updatedUser.mustChangePassword,
      },
    });
  } catch (error) {
    console.error("CHANGE TEMP PASSWORD ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    let user = await prisma.user.findFirst({
      where: {
        email: { equals: email, mode: "insensitive" },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        isActive: true,
        staffNo: true,
      },
    });

    if (!user) {
      const approvedRequest = await prisma.accessRequest.findFirst({
        where: {
          email: { equals: email, mode: "insensitive" },
          approved: true,
        },
        orderBy: { createdAt: "desc" },
        select: {
          fullName: true,
          email: true,
          staffNo: true,
          jobTitle: true,
          roleRequested: true,
          departmentId: true,
        },
      });

      if (approvedRequest) {
        const existingByStaffNo = await prisma.user.findFirst({
          where: {
            staffNo: {
              equals: approvedRequest.staffNo,
              mode: "insensitive",
            },
          },
          select: {
            id: true,
            fullName: true,
            email: true,
            isActive: true,
            staffNo: true,
          },
        });

        if (existingByStaffNo) {
          const recovered = await prisma.user.update({
            where: { id: existingByStaffNo.id },
            data: {
              email: approvedRequest.email.trim().toLowerCase(),
              fullName: approvedRequest.fullName,
              jobTitle: approvedRequest.jobTitle,
              role: approvedRequest.roleRequested,
              departmentId: approvedRequest.departmentId,
              isActive: true,
            },
            select: {
              id: true,
              fullName: true,
              email: true,
              isActive: true,
              staffNo: true,
            },
          });

          user = recovered;
        } else {
          const tempPasswordHash = await bcrypt.hash(
            generateTempPassword(),
            10,
          );

          const created = await prisma.user.create({
            data: {
              fullName: approvedRequest.fullName,
              staffNo: approvedRequest.staffNo,
              jobTitle: approvedRequest.jobTitle,
              email: approvedRequest.email.trim().toLowerCase(),
              password: tempPasswordHash,
              role: approvedRequest.roleRequested,
              departmentId: approvedRequest.departmentId,
              isActive: true,
              mustChangePassword: true,
            },
            select: {
              id: true,
              fullName: true,
              email: true,
              isActive: true,
              staffNo: true,
            },
          });

          user = created;
        }
      }
    }

    if (user?.isActive) {
      const resetSecret = process.env.JWT_SECRET;
      if (!resetSecret) {
        throw new Error("JWT_SECRET is not defined");
      }

      const resetToken = jwt.sign(
        { id: user.id, email: user.email, purpose: "password-reset" },
        resetSecret,
        { expiresIn: "30m" },
      );

      const frontendUrl =
        process.env.FRONTEND_URL?.trim() || "http://localhost:3000";
      const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;

      await sendPasswordResetEmail({
        to: user.email,
        name: user.fullName,
        resetUrl,
      });
    }

    return res.status(200).json({
      message:
        "If an account exists for this email, a reset link has been sent.",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPasswordWithToken = async (req: Request, res: Response) => {
  try {
    const token = String(req.body?.token || "").trim();
    const newPassword = String(req.body?.newPassword || "").trim();

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "New password must be at least 8 characters" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }

    const decoded = jwt.verify(token, secret) as {
      id?: number;
      email?: string;
      purpose?: string;
    };

    if (decoded.purpose !== "password-reset" || !decoded.id) {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, password: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    const sameAsCurrent = await bcrypt.compare(newPassword, user.password);
    if (sameAsCurrent) {
      return res.status(400).json({
        message: "New password must be different from current password",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
    });

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(400).json({ message: "Reset link has expired" });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    console.error("RESET PASSWORD ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    // Only ICT_ADMIN can view all users
    if (req.user?.role !== "ICT_ADMIN") {
      return res
        .status(403)
        .json({ message: "Unauthorized. Admin access required." });
    }

    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        fullName: true,
        email: true,
        staffNo: true,
        role: true,
        jobTitle: true,
        department: { select: { name: true } },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      totalCount: users.length,
      users: users.map((user) => ({
        ...user,
        role: user.role === "ICT_ADMIN" ? "ICT Administrator" : "ICT Officer",
      })),
    });
  } catch (error) {
    console.error("GET ALL USERS ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    // Only ICT_ADMIN can update roles
    if (req.user?.role !== "ICT_ADMIN") {
      return res
        .status(403)
        .json({ message: "Unauthorized. Admin access required." });
    }

    const { userId, role } = req.body as { userId?: number; role?: string };

    if (!userId || !role) {
      return res.status(400).json({ message: "User ID and role are required" });
    }

    // Validate role
    if (!["ICT_ADMIN", "ICT_OFFICER"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Prevent self-demotion
    if (req.user?.id === userId && role === "ICT_OFFICER") {
      return res
        .status(400)
        .json({ message: "Cannot demote yourself from admin" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: role as "ICT_ADMIN" | "ICT_OFFICER" },
      select: {
        id: true,
        fullName: true,
        email: true,
        staffNo: true,
        role: true,
        jobTitle: true,
        department: { select: { name: true } },
      },
    });

    return res.status(200).json({
      message: "User role updated successfully",
      user: {
        ...updatedUser,
        role:
          updatedUser.role === "ICT_ADMIN"
            ? "ICT Administrator"
            : "ICT Officer",
      },
    });
  } catch (error) {
    console.error("UPDATE USER ROLE ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
