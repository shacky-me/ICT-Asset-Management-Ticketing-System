import type { Response } from "express";
import type { AuthRequest } from "../types/auth.types.js";
import type { CreateTicketBody } from "../types/ticket.types.js";
export declare const createTicketHandler: (req: AuthRequest<CreateTicketBody>, res: Response) => Response<any, Record<string, any>>;
export declare const listTicketsHandler: (req: AuthRequest, res: Response) => Response<any, Record<string, any>>;
export declare const ticketStatsHandler: (_req: AuthRequest, res: Response) => Response<any, Record<string, any>>;
//# sourceMappingURL=ticket.controller.d.ts.map