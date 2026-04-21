import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { prisma } from "../prisma.js";
import type { AuthRequest } from "../types/auth.types.js";

export const login = async (req: Request, res: Response) => {
  try {
    const { identifier, email, password } = req.body;
    const normalizedIdentifier = String(identifier || email || "")
      .trim()
      .toLowerCase();

    if (!normalizedIdentifier || !password) {
      return res.status(400).json({
        message: "Identifier and password are required",
      });
    }
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedIdentifier },
          { staffNo: normalizedIdentifier },
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

    const options: SignOptions = {
      expiresIn: "1d",
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
      },
    });
  } catch (error) {
    console.error("ME ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
