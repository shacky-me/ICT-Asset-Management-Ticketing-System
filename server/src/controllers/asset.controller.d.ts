import type { Response } from "express";
import type { AuthRequest } from "../types/auth.types.js";
export declare const createAsset: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAssets: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getStats: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getAssetById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=asset.controller.d.ts.map