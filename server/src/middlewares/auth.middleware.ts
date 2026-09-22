import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma.js";
import { passwordFingerprint } from "../utils/sessionFingerprint.js";

interface DecodedUser {
  id: number;
  role: string;
  departmentId?: number;
}

interface AuthRequest extends Request {
  user?: DecodedUser;
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: "JWT_SECRET is not configured" });
  }

  (async () => {
    try {
      const decoded = jwt.verify(token, secret) as DecodedUser & {
        purpose?: string;
        pv?: string;
      };

      // Purpose-bound tokens (e.g. password reset links) are not sessions.
      if (decoded?.purpose) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = Number(decoded?.id);

      if (!Number.isFinite(userId)) {
        return res.status(403).json({ message: "Invalid token" });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          role: true,
          departmentId: true,
          isActive: true,
          password: true,
        },
      });

      if (!user || !user.isActive) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Sessions issued before the latest password change are no longer valid.
      if (decoded.pv !== passwordFingerprint(user.password)) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      req.user = {
        id: user.id,
        role: user.role,
        departmentId: user.departmentId ?? undefined,
      };

      next();
    } catch {
      return res.status(403).json({ message: "Invalid token" });
    }
  })();
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.role !== "ICT_ADMIN") {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
};
