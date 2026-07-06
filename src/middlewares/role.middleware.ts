import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

interface DecodedUser {
  id: number;
  role: string;
}

export interface AuthRequest extends Request {
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

  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    req.user = decoded as DecodedUser;
    next();
  });
};
