import type { Response } from "express";
import type { AuthRequest } from "../types/auth.types.js";
import type { CreateAccessRequestBody } from "../types/access.Request.types.js";
export declare const createAccessRequest: (req: AuthRequest<CreateAccessRequestBody>, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getPendingAccessRequests: (_req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const approveAccessRequest: (req: AuthRequest<any>, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const rejectAccessRequest: (req: AuthRequest<any>, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=access.controller.d.ts.map