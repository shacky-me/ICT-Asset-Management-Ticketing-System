import type { Request, Response, NextFunction } from "express";

interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

export const isAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.role !== "ICT_ADMIN") {
    return res.status(403).json({ message: "Access Denied: Admins only" });
  }
  next();
};
