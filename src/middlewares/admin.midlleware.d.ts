import type { Request, Response, NextFunction } from "express";
interface AuthRequest extends Request {
    user?: {
        id: number;
        role: string;
    };
}
export declare const isAdmin: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export {};
//# sourceMappingURL=admin.midlleware.d.ts.map