import type { Response } from "express";
import type { AuthRequest } from "../types/auth.types.js";
export declare const createAssignment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAssignments: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getStats: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateAssignment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteAssignment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=assignment.controller.d.ts.map