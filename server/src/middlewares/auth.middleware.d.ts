import type { Request, Response, NextFunction } from "express";
interface DecodedUser {
    id: number;
    role: string;
    departmentId?: number;
}
interface AuthRequest extends Request {
    user?: DecodedUser;
}
export declare const authenticateToken: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const requireAdmin: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export {};
//# sourceMappingURL=auth.middleware.d.ts.map