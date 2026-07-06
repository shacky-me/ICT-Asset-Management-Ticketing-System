import type { Request } from "express";
export interface AuthRequest<T = any> extends Request {
    user?: {
        id: number;
        role: string;
        departmentId?: number;
    };
    body: T;
}
//# sourceMappingURL=auth.types.d.ts.map