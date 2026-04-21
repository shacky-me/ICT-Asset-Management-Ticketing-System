import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

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

  jwt.verify(token, secret, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    req.user = decoded as DecodedUser;
    next();
  });
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
