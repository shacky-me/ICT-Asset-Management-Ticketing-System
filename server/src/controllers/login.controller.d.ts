import type { Request, Response } from "express";
import type { AuthRequest } from "../types/auth.types.js";
export declare const login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const logout: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const me: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const changeTemporaryPassword: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=login.controller.d.ts.map